// Dependencies
var Request = require("request")
  , Cheerio = require("cheerio")
  , Config = require("./config")
  , Auth = require("./auth")
  , Fs = require("fs")
  ;

console.log("Authenticating...");
Auth.getCookie(function (err, cookie) {
   if (err) throw err;
   console.log("Got the cookie: " + cookie);
});
