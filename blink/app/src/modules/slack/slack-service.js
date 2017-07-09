'use strict';

/* eslint camelcase: 1 */
blink.app.factory('slackService', ['$http',
    '$q',
    'alertService',
    'sessionService',
    'systemConfigService',
    'UserAction',
    function($http,
         $q,
         alertService,
         sessionService,
         systemConfigService,
         UserAction) {
        var me = {},
            initialized = false;

        me.enabled = false;
        me.clientId = null;
        me.clientSecret = null;
        me.teamId = null;
        me.redirectURI = window.location.origin + '/#/authorize-slack';
        me.slackAPIBaseURI = 'https://slack.com/api/';

        me.initialize = function() {
            if (initialized) {
                return $q.resolve();
            } else {
                var slackConfig = systemConfigService.getSlackConfig();
                if (!!slackConfig) {
                    me.enabled = slackConfig.enabled;
                    me.clientId = slackConfig.clientId;
                    me.clientSecret = slackConfig.clientSecret;
                    me.teamId = slackConfig.teamId;
                }
                initialized = true;
                return $q.resolve(slackConfig);
            }
        };

        me.isEnabled = function() {
            return me.enabled;
        };

        me.getAccessToken = function() {
            return sessionService.getPreference('access_token');
        };

        me.getUserInfo = function() {
            return sessionService.getPreference('user_info') || {};
        };

        me.unlink = function() {
            sessionService.removeUserPreferences('access_token');
            sessionService.removeUserPreferences('user_info');
        };

        me.getSlackAccessToken = function(accessCode) {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'oauth.access',
                params: {
                    client_id: me.clientId,
                    client_secret: me.clientSecret,
                    code: accessCode,
                    redirect_uri: me.redirectURI
                }
            }).then(function(response) {
                sessionService.setPreference('access_token', response.data.access_token);

                return $http({
                    method: 'GET',
                    url: me.slackAPIBaseURI + 'auth.test',
                    params: {
                        token: me.getAccessToken()
                    }
                }).then(function(response) {
                    var userInfo = {};
                    userInfo.userName = response.data.user;
                    userInfo.userId = response.data.user_id;
                    userInfo.teamName = response.data.team;
                    userInfo.teamId = response.data.team_id;

                    sessionService.setPreference('user_info', userInfo);

                    return response.data;
                });
            });
        };

        me.postMessage = function(channelId, message) {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'chat.postMessage',
                params: {
                    token: me.getAccessToken(),
                    channel: channelId,
                    text: message
                }
            }).then(function(response) {
                return response.data.channels;
            });
        };

        me.getChannels = function() {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'channels.list',
                params: {
                    token: me.getAccessToken(),
                    exclude_archived: true
                }
            }).then(function(response) {
                var subscribedChannels = response.data.channels.filter(function(channel) {
                    return channel.is_member;
                });
                return subscribedChannels;
            });
        };

        me.getUsers = function() {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'users.list',
                params: {
                    token: me.getAccessToken()
                }
            }).then(function(response) {
                var usersMap = {};
                var members = response.data.members;

                members.forEach(function(member) {
                    usersMap[member.id] = member;
                });

                return usersMap;
            });
        };

        me.uploadBlobAsFile = function(blob, channelId, title, comment) {
            var formData = new FormData();
            formData.append('token', me.getAccessToken());
            formData.append('file', blob);
            formData.append('title', title);
            formData.append('channels', channelId);
            if (!!comment) {
                formData.append('initial_comment', comment);
            }

        //var request = new XMLHttpRequest();
        //request.open('POST', me.slackAPIBaseURI + 'files.upload');
        //request.send(formData);

            return $http.post(me.slackAPIBaseURI + 'files.upload', formData, {
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function(response) {
                return response.data;
            });
        };

        me.addTextPost = function(content, channelId, title) {
            var params = {
                token: me.getAccessToken(),
                content: content,
                title: title,
                channels: channelId
            };

            return $http.post(me.slackAPIBaseURI + 'files.upload', params).then(function(response) {
                return response.data;
            });
        };

        me.shareFileOnChannel = function(fileId, channelId) {
            return $http({
                method: 'POST',
                url: me.slackAPIBaseURI + 'files.share',
                params: {
                    token: me.getAccessToken(),
                    file: fileId,
                    channel: channelId
                }
            }).then(function(response) {
                return response.data;
            });
        };

        me.getFileInfo = function(fileId) {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'files.info',
                params: {
                    token: me.getAccessToken(),
                    file: fileId
                }
            }).then(function(response) {
                return response.data;
            });
        };

        me.addComment = function(fileId, comment) {
            return $http({
                method: 'GET',
                url: me.slackAPIBaseURI + 'files.comments.add',
                params: {
                    token: me.getAccessToken(),
                    file: fileId,
                    comment: comment
                }
            }).then(function(response) {
                return response.data;
            });
        };

        me.getUser = function(userId) {
            return me.users[userId];
        };

        return me;
    }]);
