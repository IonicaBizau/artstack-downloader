// Dependencies
var ArtStack = require("artstack")
  , Request = require("request")
  , CliUpdate = require("cli-update")
  , CliBox = require("cli-box")
  , Config = require("./config")
  , Fs = require("fs")
  , Path = require("path")
  ;

const DOWNLOAD_DIR = Path.resolve(__dirname + "/downloads/");

ArtStack.auth(Config, function (err) {
    if (err) throw err;
    ArtStack.tags.list(function (err, artists) {
        if (err) throw err;
        console.log("Fetched " + artists.length + " artists.");

        var downloads = {}
          , cUsr = null
          , ii = 0
          , url = null
          , path = null
          , userDir = null
          , k = null
          , c = null
          ;

        function updateScreen() {

            var content = "";
            // x .... 100
            // p .... c
            for (k in downloads) {
                c = downloads[k];
                content += k + ": " + c.progress + "/" + c.count + "\n"
            }

            var box = new CliBox({
                fullscreen: true
              , marks: {}
            }, {
                text: content
              , hAlign: "left"
              , vAlign: "top"
            });

            CliUpdate.render(box.toString());
        }

        function handleUsr(user) {
            userDir = DOWNLOAD_DIR + "/" + user.display_name + "/";
            try {
                Fs.mkdirSync(userDir)
            } catch (e) {}

            ArtStack.artworks.fromArtist(user, function (err, artws) {
                if (err) throw err;

                cUsr = downloads[user.display_name] = {
                    progress: 0
                  , count: artws.length
                };

                for (ii = 0; ii < artws.length; ++ii) {
                    url = artws[ii].url;
                    path = userDir + url.match(/\/([0-9]+)\//)[1] + "." + url.match(/\/.*\.(.*)\?.*$/)[1];
                    if (!Fs.existsSync(path)) {
                        Request(url, function (err, res, body) {
                            ++cUsr.progress;
                            updateScreen();
                        }).pipe(Fs.createWriteStream(path))
                    } else {
                        ++cUsr.progress;
                        updateScreen();
                    }
                }
            });
        }

        for (var i = 0; i < artists.length; ++i) {
            handleUsr(artists[i]);
        }
    });
});
