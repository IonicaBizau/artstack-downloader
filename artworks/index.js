// Dependencies
var Config = require("../config")
  , Cheerio = require("cheerio")
  , Request = require("request")
  , Fs = require("fs")
  , Path = require("path")
  , FsExtra = require("fs-extra")
  ;

var Artworks = module.exports = {};

// TODO JSDoc
Artworks.downloadFromArtist = function (user, callback) {

    var $ = null
      , $artworks = []
      , $cArtwork = null
      , artworks = []
      , i = 0
      ;

    function getSeq(i) {
        Request.get({
            url: "https://theartstack.com/artists/" + user.display_name + "?page=" + i
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
                artworks.push({
                    url: $cArtwork.attr("data-highres-pic")
                });
            }
            debugger
            getSeq(i + 1);
        });
    }

    getSeq(1);
};
