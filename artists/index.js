// Dependencies
var Config = require("../config")
  , Cheerio = require("cheerio")
  , Request = require("request")
  , Fs = require("fs")
  , Path = require("path")
  , FsExtra = require("fs-extra")
  , Cache = {}
  ;

const CACHE_FILE = Path.resolve(__dirname + "/../cache/index.json");
var Artists = module.exports = {};

// TODO JSDoc
Artists.all = function (callback) {

    if (Fs.existsSync(CACHE_FILE)) {
        Cache = FsExtra.readJsonSync(CACHE_FILE);
        if (!Config.check_artists && Cache.artists) {
            return callback(null, Cache.artists);
        }
    }

    var artists = []
      , $ = null
      , $artists = []
      , $cArtist = {}
      , i = 0
      ;

    function getSeq(i) {
        Request.get({
            url: "https://theartstack.com/" + Config.username + "/tags?page=" + i
          , headers: {
                "Cookie": Config.cookie
            }
        }, function (err, res, body) {
            if (err) { return callback(err); }
            $ = Cheerio.load(body);
            $artists = $(".users-list-item");
            if (!$artists.length) {
                Cache.artists = artists;
                FsExtra.writeJsonFileSync(CACHE_FILE, Cache);
                return callback(null, artists);
            }

            for (i = 0; i < $artists.length; ++i) {
                $cArtist = $artists.eq(i);
                try {
                var followers_count = parseInt($(".display-name > .followers", $cArtist).text().replace(/\,/g, "").match(/^\(([0-9]+) followers\)/)[1])
                } catch (e) {
                    debugger
                }
                artists.push({
                    profile_url: $("a", $cArtist).attr("href")
                  , display_name:  $(".display-name > [dir]", $cArtist).text()
                  , followers_count: followers_count
                });
            }
            getSeq(i + 1);
        });
    }

    getSeq(1);
};
