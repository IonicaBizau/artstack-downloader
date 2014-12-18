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
      , userDir = DOWNLOAD_DIR + "/" + user.display_name + "/"
      , path = ""
      ;

    try {
        Fs.mkdirSync(userDir)
    } catch (e) {}

    function getSeq(page) {
        Request.get({
            url: "https://theartstack.com" + user.profile_url + "?page=" + page
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
                    Request(u, function (err, res, body) {
                        if (err) {
                            return console.log("Failed: " + u);
                        }
                        console.log("Done: " + u);
                    }).pipe(Fs.createWriteStream(p))
                }

                var title = $("img", $cArtwork).attr("alt");
                try {
                path = userDir + url.match(/\/([0-9]+)\//)[1] + " - " + title + "." + url.match(/\/.*\.(.*)\?.*$/)[1];
                } catch (e) {
                    debugger
                }
                if (!Fs.existsSync(path)) {
                    download(url, path);
                }
            }
            getSeq(page + 1);
        });
    }

    getSeq(1);
};
