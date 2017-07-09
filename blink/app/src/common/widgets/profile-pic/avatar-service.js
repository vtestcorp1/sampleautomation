/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Service user to get user avatar
 *
 */

'use strict';

blink.app.factory('avatarService', ['$rootScope', '$q', 'userService','Logger',
    function ($rootScope, $q, userService, Logger) {

        var me = {},
            _logger = Logger.create('blink-profile-pic');

        function hashStr(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var charCode = str.charCodeAt(i);
                hash += charCode;
            }
            return hash;
        }


        // Library of colors is not shared with stickers as we may change or add more colors for avatars creation later

        function getColorForName (userName){
            var colors = ['#fbc76d', '#fc9770', '#fe7a76', '#ff97bd', '#ff78a9', '#c598f0', '#9884c6', '#6d8ce7',
                '#70baff', '#63c9ea', '#66cfab', '#83c583', '#c8d593', '#ceeb97'];
            var hash = hashStr(userName);
            var index = hash % colors.length;
            return colors[index];
        }

        function getUserIcon(userName){
            var names = userName.split(/\s+/),
                initials = names[0].charAt(0);
            if (names.length > 1) {
                initials += names.last().charAt(0);
            }
            return initials;
        }

        var userProfilePicMap = {};

        function generateAvatarProfileFromName(userName) {
            var userIconBackground = getColorForName(userName),
                userIconChar = getUserIcon(userName),
                userIconProfile = {
                    userIcon: userIconChar,
                    userColor: userIconBackground
                };
            return userIconProfile;
        }

        me.getAutoAvatar = function (userId, optUserDisplayName) {
            var deferred = $q.defer();

            if (!!optUserDisplayName) {
                deferred.resolve(generateAvatarProfileFromName(optUserDisplayName));
                return deferred.promise;
            }

            if (Object.has(userProfilePicMap, userId)) {
                var cachedUserProfile = userProfilePicMap[userId];
                if (cachedUserProfile) {
                    deferred.resolve(userProfilePicMap[userId]);
                } else {
                    deferred.reject('Can not determine user avatar for user id ' + userId);
                }
                return deferred.promise;
            }

            return userService.getUserById(userId).
                then(function (user) {
                    var userName = user.getDisplayName();
                    if (!userName) {
                        userName = user.getName();
                    }
                    var userIconProfile = generateAvatarProfileFromName(userName);
                    userProfilePicMap[userId] = userIconProfile;

                    return userIconProfile;
                }, function (error) {
                    _logger.warn("error in getting user's name", userId, error);
                    userProfilePicMap[userId] = null;
                    return $q.reject(error);
                });
        };

        return me;

    }]);
