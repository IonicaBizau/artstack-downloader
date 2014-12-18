// Dependencies
var Request = require("request")
  , Config = require("../config")
  , Cheerio = require("cheerio")
  , QueryString = require("querystring")
  ;

// Auth
var Auth = module.exports = {};

// TODO JsDoc
Auth.getCookie = function (callback) {
    var $ = null;
    console.log("Getting the csrf-token.");
    Request.get(Config.login_page, function (err, res, body) {
        if (err) { return callback(err); }
        var token = Cheerio.load(body)("meta[name='csrf-token']").attr("content")
        console.log("csrf-token is: " + token);
        console.log("Logging in...");
        Request.post({
            url: "https://theartstack.com/sessions"
          , form: QueryString.stringify({
                "utf8": "✓"
              , "authenticity_token": "token"
              , "user_session[email]": Config.email
              , "user_session[password]": Config.password
              , "user_session[remember_me]": 0
              , "user_session[remember_me]": 1
              , "commit": "Log In"
            })
        }, function (err, res, body) {
            if (err) { return callback(err); }
            var cookies = res.headers["set-cookie"];
            callback(null, cookies);
        });
    });
};
