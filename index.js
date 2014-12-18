// Dependencies
var Request = require("request")
  , Cheerio = require("cheerio")
  , Config = require("./config")
  , Auth = require("./auth")
  , Artists = require("./artists")
  , Fs = require("fs")
  ;

console.log("Authenticating...");
Auth.getCookie(function (err, cookie) {
   if (err) throw err;
   console.log("Got the cookie: " + cookie);
   Config.cookie = cookie;
   Artists.all(function (err, allArtists) {
       console.log("Fetched " + allArtists.length + " artists.");
   });
});
