var ws = require("ws");
var fs = require("fs");
var util = require("util");

var BlinkE2ESnapper = function (config, logger) {

    var WEB_SOCKET_SERVER_PORT = 9065,
        Events = {
            REQUEST: 'blink-get-screen-shot-request',
            RESPONSE: 'blink-get-screen-shot-response'
        },
        LISTENER_FILE_NAMES = ['bridge.js'],
        SAVED_SCREEN_SHOT_DIR_PATH = "test/e2e-screen-shots",
        MAX_OLD_SCREEN_SHOT_DIRECTORIES = 15;

    var clientSockets = [],
        callId = 0,
        callData = {},
        screenShotDirectory = getScreenShotDirectory();

    function isRunningOnHudson() {
        return !!process.env.BUILD_NUMBER;
    }

    function emptyDirectory(path, deleteHidden) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) {
                    return;
                } else if (deleteHidden || file[0] !== '.') { // don't delete hidden files like .gitignore
                    fs.unlinkSync(curPath);
                }
            });
        }
    }

    function getScreenShotDirectory() {
        if (isRunningOnHudson()) {
            return util.format("%s/%s", SAVED_SCREEN_SHOT_DIR_PATH, process.env.BUILD_NUMBER);
        } else {
            return SAVED_SCREEN_SHOT_DIR_PATH;
        }
    }

    function cleanupOlderScreenShots() {
        if (isRunningOnHudson()) {
            var root = SAVED_SCREEN_SHOT_DIR_PATH,
                directories = fs.readdirSync(root),
                dirToCTime = {};

            directories.forEach(function(directory){
                var curPath = root + "/" + directory,
                    stat = fs.lstatSync(curPath);

                if (!stat.isDirectory()) {
                    return;
                }

                var screenShots = fs.readdirSync(curPath),
                    isEmpty = true;
                for (var i=0; i<screenShots.length; i++) {
                    var fileName = screenShots[i];
                    if (fileName[0] != '.') {
                        dirToCTime[curPath] = stat.ctime.getTime();
                        isEmpty = false;
                        continue;
                    }
                }

                // delete empty screen shot directories before we delete older
                // directories which actually have screenshots
                if (isEmpty) {
                    console.log('deleting old EMPTY screen shot directory at', curPath);
                    fs.rmdirSync(curPath);
                }
            });

            var sortedDirectories = Object.keys(dirToCTime);
            sortedDirectories.sort(function(pathA, pathB){
                return dirToCTime[pathA] - dirToCTime[pathB];
            });

            while (sortedDirectories.length > MAX_OLD_SCREEN_SHOT_DIRECTORIES - 1) {
                var dirPath = sortedDirectories.shift();
                console.log('deleting old screen shot directory at', dirPath);
                emptyDirectory(dirPath);
                fs.rmdirSync(dirPath);
            }
        }

        if (fs.existsSync(screenShotDirectory)) {
            emptyDirectory(screenShotDirectory);
        } else {
            fs.mkdirSync(screenShotDirectory);
        }
    }

    function injectJS() {
        var createPattern = function(path) {
            return {pattern: path, included: true, served: true, watched: false};
        };

        LISTENER_FILE_NAMES.forEach(function(fileName){
            config.files.unshift(createPattern(__dirname + '/' + fileName));
        });
    }

    function saveScreenShot(name, imageDataURL) {
        if (!imageDataURL) {
            console.error("failed to take screen shot failed e2e");
            return;
        }
        var fileName = name + '.png';
        fileName = fileName.toLowerCase().replace(/\s+/g, '_');

        var path = screenShotDirectory + '/' + fileName,
            imageData = imageDataURL.replace(/^data:image\/png;base64,/, '');

        fs.writeFile(path, imageData, 'base64', function(err) {
            if (err) {
                console.log("error saving e2e screenshot", path, err);
            } else {
                var message;
                if (process.env.HUDSON_URL) {
                    var url = util.format('%sjob/%s/ws/blink/%s', process.env.HUDSON_URL, process.env.JOB_NAME, path);
                    message = util.format('saved screenshot for failed test: %s', encodeURI(url));
                } else {
                    message = "saved screen shot for failed test at " + path;
                }
                console.log(message);
            }
        });
    }

    function startServer() {
        var server = new ws.Server({
                port: WEB_SOCKET_SERVER_PORT
            });

        server.on('connection', function(clientSocket) {
            clientSockets.push(clientSocket);
            clientSocket.on('close', function(){
                var socketIndex = clientSockets.indexOf(clientSocket);
                if (socketIndex < 0) {
                    console.warn("unknown client socket disconnected", clientSocket);
                    return;
                }
                clientSockets.splice(socketIndex, 1);
            });
            clientSocket.on('message', onMessageReceived);
        });

        return server;
    }

    function notifyAllClients(message) {
        if (clientSockets.length === 0) {
            console.warn("snapper received a request but no client web socket connected yet");
            return;
        }

        message = JSON.stringify(message);
        clientSockets.forEach(function(clientSocket){
            clientSocket.send(message);
        });
    }

    function onMessageReceived(message) {
        message = JSON.parse(message);
        if (message.command === Events.REQUEST) {
            // incoming request from karma
            snap(message.name);
        } else if (message.command === Events.RESPONSE) {
            // incoming response from extension
            var name = callData[message.id];
            if (!name) {
                console.warn("id", message.id, "not found in cache");
                return;
            }
            saveScreenShot(name, message.imageData.url);
            // tell karma the screen shot is ready, it can move
            // on to the next test
            notifyAllClients({
                command: Events.RESPONSE
            });
        } else {
            console.error('unknown command', message.command);
        }
    }


    function snap(name) {
        callId++;
        callData[callId] = name;
        notifyAllClients({
            command: Events.REQUEST,
            id: callId
        });

    }


    this.onSpecComplete = function (browser, result) {
    };

    this.onBrowserComplete = function() {
        if (!!this.server) {
            this.server.close();
            this.server = null;
        }
    };

    this.onBrowserError = function() {
        if (!!this.server) {
            this.server.close();
            this.server = null;
        }
    };

    cleanupOlderScreenShots();
    injectJS();
    this.server = startServer();
};

BlinkE2ESnapper.$inject = ['config', 'logger'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:blinkE2ESnapper': ['type', BlinkE2ESnapper]
};