/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Api calls for user related data
 * TODO(Vijay) - make this a generic image service and move user-preference related things into session-service.
 */

'use strict';

blink.app.factory('userService', ['$q',
    '$rootScope',
    'alertService',
    'Command',
    'env',
    'events',
    'Logger',
    'MetadataCacheService',
    'safeDigest',
    'sessionService',
    'userAdminService',
    'UserAction',
    function ($q,
          $rootScope,
          alertService,
          Command,
          env,
          events,
          Logger,
          MetadataCacheService,
          safeDigest,
          sessionService,
          userAdminService,
          UserAction) {

        var HTTP_SUCCESS_CODE = 200,
            HTTP_NOT_MODIFIED_CODE = 304,
            PROFILE_PIC_VERSION_CACHE_PERSISTENCE_KEY = 'blink_user_service_profile_pic_version_cache';

        var me = {},
            _logger = Logger.create('user-service'),
            userListPromise = null,
            userIdToProfilePicUrl = {},
            userIdToUserModelPromise = {},
        // A set of userIds for which we have pending
        // network calls to determine whether there is
        // a valid pic available. This ensures that
        // we don't make duplicate calls (e.g. because a list
        // page with multiple entries for a user asked for a
        // user's profile pic multiple times)
            userIdPendingProfilePicUrlCall = {};
        var metadataCacheService = new MetadataCacheService();

        function notifyOnUserProfilePicAvailable(userId, picUrl) {
            $rootScope.$broadcast(events.USER_PROFILE_PIC_AVAILABLE_D, userId, picUrl);
            safeDigest($rootScope);
        }

        function getPersistedProfilePicVersionMap() {
            return JSON.parse(localStorage.getItem(PROFILE_PIC_VERSION_CACHE_PERSISTENCE_KEY)) || {};
        }

        function getPersistedProfilePicVersion(userId) {
            var cache = getPersistedProfilePicVersionMap();
            return cache[userId] || null;
        }

        function setPersistedProfilePicVersion(userId, profilePicVersion) {
            var cache = getPersistedProfilePicVersionMap();
            cache[userId] = profilePicVersion;
            localStorage.setItem(PROFILE_PIC_VERSION_CACHE_PERSISTENCE_KEY, JSON.stringify(cache));
        }

        function getProfilePicUrl(userId, skipCallosumPrefix) {
            var url = '/image/profile/{1}'.assign(userId),
                version = getPersistedProfilePicVersion(userId);

            if (!!version) {
                url = url.replace(/cacheBuster=(.*?)(\&|$)/gi, '');
                if (url.indexOf('?') < 0) {
                    url += '?';
                }
                url += 'cacheBuster=' + version;
            }

            if (!skipCallosumPrefix) {
                url = env.callosumBasePath + url;
            }
            return url;
        }

    /**
     * Retrieve the profile pic URL for the current user
     * @return {Object}         A promise that will resolve with the profile pic URL.
     */
        me.getCurrentUserProfilePicUrl = function () {
            var currentUserId = sessionService.getUserGuid();
            return me.getProfilePicUrl(currentUserId);
        };

    /**
     * Invalidates the browser cache of a profile pic by adding
     * a parameter to the profile pic url so that all the subsequent
     * calls for the profile pic will not use the browser cached image
     * @param userId
     */
        me.invalidateProfilePicUrlCache = function (userId) {
            if (!Object.has(userIdToProfilePicUrl, userId)) {
                return;
            }

            var profilePicVersion = Date.now();
            setPersistedProfilePicVersion(userId, profilePicVersion);

            var url = getProfilePicUrl(userId, false);
            userIdToProfilePicUrl[userId] = url;

            notifyOnUserProfilePicAvailable(userId, url);
        };

        me.invalidateCurrentUserProfilePicUrlCache = function () {
            var currentUserId = sessionService.getUserGuid();
            me.invalidateProfilePicUrlCache(currentUserId);
        };

    /**
     * Returns the URL to use to display a user's profile picture
     * @param {string} userId   The user's guid
     * @return {string}         The url for the user's profile pic if already available. If the url is not
     *                          immediately available a default url is returned and call is scheduled to
     *                          get the correct url. An event will be fired when the real url is available.
     */
        me.getProfilePicUrl = function (userId) {
            if (!userId) {
                return null;
            }

            if (Object.has(userIdToProfilePicUrl, userId)) {
                notifyOnUserProfilePicAvailable(userId, userIdToProfilePicUrl[userId]);
                return;
            }

        // if a network call is already pending for the profile pic
        // of the url we return a default url for now. when the
        // real url is available the caller will receive the
        // update event and can update itself accordingly
            if (Object.has(userIdPendingProfilePicUrlCall, userId)) {
                return null;
            }

            userIdPendingProfilePicUrlCall[userId] = true;

        // we don't have a cached url, we'll ask callosum for it
        // and fire an event when we have the url
            var customPicUrl = getProfilePicUrl(userId, true),
                command = new Command().setPath(customPicUrl);
            command.execute()
            .then(function (response) {
                delete userIdPendingProfilePicUrlCall[userId];

                var url = null;
                if (response.status == HTTP_SUCCESS_CODE || response.status == HTTP_NOT_MODIFIED_CODE) {
                    url = getProfilePicUrl(userId, false);
                }

                userIdToProfilePicUrl[userId] = url;
                notifyOnUserProfilePicAvailable(userId, url);

            }, function () {
                delete userIdPendingProfilePicUrlCall[userId];

                // we use the default pic here to avoid making too many round trips for the same
                // faulty userid.
                userIdToProfilePicUrl[userId] = null;
                _logger.error('Error retrieving the profile pic for user:' + userId);
            });

            return null;
        };

    /**
     * Return a user model given the user id
     * The user list is cached and fetched only once per session
     * New users created between the start of the session and the
     * moment this method is called will not appear in the list.
     *
     * @param  {string} userId  The user id
     * @return {Object}         A promise that will resolve with the user model
     */
        me.getUserById = function (userId) {
            return metadataCacheService.getObject(userId, MetadataCacheService.entityType.USER)
                .then(function(response){
                    if (response.users.length === 0) {
                        return $q.reject(new Error('User not found/accessible ' + userId));
                    }
                    return response.users[0];
                });
        };

        function getUserProperty(userId, propGetterName) {
            var deferred = $q.defer();
            me.getUserById(userId).then(function (user) {
                if (!Object.isFunction(user[propGetterName])) {
                    deferred.reject('property getter is not a function', propGetterName, user[propGetterName]);
                    return;
                }
                deferred.resolve(user[propGetterName]());
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    /**
     * Return a user's username given the user id
     *
     * @param  {string} userId  The user id
     * @return {Object}         A promise that will resolve with the user's username
     */
        me.getUserName = function (userId) {
            return getUserProperty(userId, 'getName');
        };

    /**
     * Return a user's display name given the user id
     *
     * @param  {string} userId  The user id
     * @return {Object}         A promise that will resolve with the user's display name
     */
        me.getUserDisplayName = function (userId) {
            return getUserProperty(userId, 'getDisplayName');
        };

        return me;

    }]);
