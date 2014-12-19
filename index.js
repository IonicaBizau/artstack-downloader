// Dependencies
var ArtStack = require("artstack")
  , Request = require("request")
  , CliUpdate = require("cli-update")
  , CliBox = require("cli-box")
  , Config = require("./conf")
  , Fs = require("fs")
  , Path = require("path")
  ;

// Constants
const DOWNLOAD_DIR = Path.resolve(__dirname + "/downloads/");

// Authenticate
ArtStack.auth(Config, function (err) {
    if (err) throw err;

    // Get users
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

        /*!
         * updateScreen
         * Updates the screen.
         *
         * @name updateScreen
         * @function
         * @return {undefined}
         */
        function updateScreen() {

            var content = "";
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

        /*!
         * handleUsr
         * Downloads artworks from user.
         *
         * @name handleUsr
         * @function
         * @param {User} user The current user.
         * @return {undefined}
         */
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

        // Iterate users
        for (var i = 0; i < artists.length; ++i) {
            handleUsr(artists[i]);
        }
    });
});
