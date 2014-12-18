// Dependencies
var Request = require("request")
  , Cheerio = require("cheerio")
  , Config = require("./config")
  , Auth = require("./auth")
  , Artists = require("./artists")
  , Artworks = require("./artworks")
  , Fs = require("fs")
  ;

console.log("Authenticating...");
Auth.getCookie(function (err, cookie) {
    if (err) throw err;
    console.log("Got the cookie: " + cookie);
    Config.cookie = cookie;
    Artists.all(function (err, allArtists) {
        console.log("Fetched " + allArtists.length + " artists.");
        function handleUsr(u) {
            Artworks.downloadFromArtist(u, function (err, artws) {
                if (err) { console.log("Something went wrong when downloading artworks from user: " + u.display_name, err); }
                else {
                    console.log("Fetched all artworks from " + u.display_name + " but images are still downloading.");
                }
            });
        }
        for (var i = 0; i < allArtists.length; ++i) {
            handleUsr(allArtists[i]);
        }
    });
});
