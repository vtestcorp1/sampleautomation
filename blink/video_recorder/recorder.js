'use strict';
/*global Buffer:false */
// modules =================================================
var express        = require('express');
var bodyParser     = require('body-parser');
var fs             = require('fs');
var path           = require('path');
var ffmpeg = require('fluent-ffmpeg');
var http = require('http');
var express = require('express');
require('buffer-concat');
var app = express();

var httpServer = http.createServer(app);
httpServer.listen(8008);

app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.raw({type:'application/webm', limit:'100mb'})); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// routes ==================================================

var videoData = [];
var doneIds = [];

app.get('/recorder/video/:videoID', function(req, res) {
    try {
        videoData[req.params.videoID] = null;
        var dirname = path.join('.', req.params.videoID);
        var filename = path.join(dirname, fs.readdirSync(dirname)[0]);
        console.log('downloading', filename);
        res.download(filename, function(err) {
            fs.unlink(filename, function(err) {
                fs.rmdir(dirname);
            });
        });
    } catch (err) {
        console.error('error downloading video:', err);
    }
});

app.get('/recorder/deletevideo/:videoID', function(req, res) {
    try {
        videoData[req.params.videoID] = null;
        var dirname = path.join('.', req.params.videoID);
        var filename = path.join(dirname, fs.readdirSync(dirname)[0]);
        console.log('deleting file:', filename);
        fs.unlink(filename, function(err) {
            fs.rmdir(dirname);
            res.send(200);
        });
    } catch(err) {
        console.error('failed to delete video:', err);
    }
});

app.post('/recorder/newVideo', function(req, res) {
    try {
        var id = req.headers.id.toString();
        var index = parseInt(req.headers.index, 10);
        var done = (req.headers.done === "true");

        if (done) {
            doneIds.push(id);

            var name = req.headers.videoname;
            var dirname = path.join('.', id);
            var webmFilename = path.join(dirname, name + '.webm');
            var mp4Filename = path.join(dirname, name + '.mp4');

            var d = [].concat.apply([], videoData[id]);

            fs.mkdir(dirname, function(err) {
                if (err) {
                    console.error(err);
                    res.status(500).send(err.message);
                    return;
                }

                fs.writeFile(webmFilename, Buffer.concat(d), function(err) {
                    if (err) {
                        console.error(err);
                        res.status(500).send(err.message);
                        return;
                    }

                    videoData[id] = null;

                    var ind = doneIds.indexOf(id);
                    if (ind > -1) {
                        doneIds.splice(ind, 1);
                    }

                    ffmpeg(webmFilename)
                        .format('mp4')
                        .save(mp4Filename)
                        .on('end', function() {
                            fs.unlink(webmFilename);
                            res.send(200);
                        })
                        .on('error', function(err) {
                            console.error(err);
                            res.status(500).send(err.message);
                        });
                });
            });

        } else if (!(id in videoData) || (doneIds.indexOf(id) == -1)) {
            if (!(id in videoData)){
                videoData[id] = [];
            }
            if (!(index in videoData[id])) {
                videoData[id][index] = [];
            }
            req.on('data', function (data) {
                videoData[id][index].push(data);
            });
            req.on('end', function () {
                res.send(200);
            });

        }
    } catch(err) {
        console.error(err);
    }
});

// start app ===============================================
var exports = module.exports = app;                    // expose app
