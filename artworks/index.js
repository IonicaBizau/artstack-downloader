// Dependencies
var Config = require("../config")
  , Cheerio = require("cheerio")
  , Request = require("request")
  , Fs = require("fs")
  , Path = require("path")
  , FsExtra = require("fs-extra")
  ;

const DOWNLOAD_DIR = Path.resolve(__dirname + "/../downloads/");
var Artworks = module.exports = {};

// TODO JSDoc
Artworks.downloadFromArtist = function (user, callback) {

    var $ = null
      , $artworks = []
      , $cArtwork = null
      , artworks = []
      , i = 0
      , cUrl = null
      , userDir = DOWNLOAD_DIR + "/" + user.display_name
      ;

    try {
        Fs.mkdirSync(userDir)
    } catch (e) {}

    function getSeq(i) {
        Request.get({
            url: "https://theartstack.com/artists/" + user.profile_url + "?page=" + i
          , headers: {
                "Cookie": Config.cookie
            }
        }, function (err, res, body) {
            if (err) { return callback(err); }
            $ = Cheerio.load(body);
            $artworks = $("[data-highres-pic]");
            if (!$artworks.length) {
                return callback(null, artworks);
            }
            for (i = 0; i < $artworks.length; ++i) {
                $cArtwork = $artworks.eq(i);
                url = $cArtwork.attr("data-highres-pic");
                artworks.push({
                    url: url
                });

                function download(u, p) {
                    request(u, function (err, res, body) {
                        if (err) {
                            return console.log("Failed: " + u);
                        }
                        console.log("Done: " + u);
                    }).pipe(Fs.createWriteStream(p))
                }

                if (!Fs.existsSync(path)) {
                    download(url, path);
                }
            }
            getSeq(i + 1);
        });
    }

    getSeq(1);
};
