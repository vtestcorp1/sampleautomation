/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview An asm.js port of icu4c.
 */

'use strict';
/* eslint-env node */

(function(global){
    var ICU_VERSION = 57,
        MEMFS_DATA_DIR_NAME = 'icu-data',
        DEFAULT_LOCALE = 'en_US';

    var Defaults = {
        DATA_ROOT: 'build',
        UNPACKED_DATA_FILES_DIR_NAME: 'data',
        COMMON_DATA_PACKAGE_NAME: 'icu4js.dat',
        LAZY_LOAD_MANIFEST_NAME: 'icu4js-lazy-load.mf'
    };

    var pendingInitCallbacks = [];
    var isInitialized = false;
    var initializationError = null;
    var isInitializing = false;

    var urlLoader = (function(){
        function didXhrSucceed(xhrProgressEvent) {
            return xhrProgressEvent.type !== 'abort'
                && xhrProgressEvent.type !== 'error'
                && xhrProgressEvent.type === 'load'
                && xhrProgressEvent.target.status == 200;
        }

        function loadUrl(url, callback) {
            var xhr = new XMLHttpRequest();

            function onUrlLoadFinished(event) {
                if (!didXhrSucceed(event)) {
                    callback(new Error(event.target.statusText));
                    return;
                }

                var byteArray = new Uint8Array(event.target.response);
                callback(null, byteArray);
            }

            xhr.addEventListener('load', onUrlLoadFinished);
            xhr.addEventListener('error', onUrlLoadFinished);
            xhr.addEventListener('abort', onUrlLoadFinished);

            xhr.open('GET', url);
            xhr.responseType = "arraybuffer";
            // IE doesn't support or seem to need overriding mime type
            if (!!xhr.overrideMimeType) {
                xhr.overrideMimeType('application/octet-stream');
            }
            xhr.send();
        }

        // Note (sunny): we start all requests in parallel, browser's
        // per domain parallel network request limit will limit the
        // load we put on the network. This is okay as long as we
        // have 10s of urls of load. We'll need to do rate limiting
        // in our code if the set of urls can get too big.
        function loadUrls(urls, callback) {
            var loadedCount = 0;

            var responses = [];
            responses.length = urls.length;

            urls.forEach(function(url, index){
                loadUrl(url, function(error, response){
                    responses[index] = {
                        url: url,
                        error: error,
                        response: response
                    };

                    loadedCount++;
                    if (loadedCount === urls.length) {
                        callback(responses);
                    }
                });
            });
        }

        return {
            loadUrls: loadUrls
        };
    })();

    var fsUtils = (function(){
        var FS_FILE_PATH_SEPARATOR = '/';

        function getDirNameFromPath(path) {
            var parts = path.split(FS_FILE_PATH_SEPARATOR);
            var dirsToParentDir = parts.slice(0, -1);
            return dirsToParentDir.join(FS_FILE_PATH_SEPARATOR);
        }

        /**
         * @param {...string} varArgs
         * @returns {string}
         */
        function joinPath(varArgs) {
            return Array.prototype.join.call(arguments, FS_FILE_PATH_SEPARATOR);
        }

        function exists(path) {
            return FS.analyzePath(path).exists;
        }

        return {
            getDirNameFromPath: getDirNameFromPath,
            joinPath: joinPath,
            exists: exists
        };
    })();

    // ICU looks up individual files in a directory with
    // a name dependent on the version of icu. There does
    // not seem to be a way around this. We use the same
    // name for the parent directory of data files loaded
    // in emscripten FS
    function getIndividualDataFileDirName() {
        return 'icudt' + ICU_VERSION + 'l';
    }

    function determineLocale(locale, acceptLanguage) {
        if (!!locale) {
            return locale;
        }
        if (!!acceptLanguage) {
            return icu4js.getLocaleForHTTPAcceptLanguage(acceptLanguage);
        }
        return window.navigator.userLanguage || window.navigator.language;
    }

    /**
     * Returns the name of the locale package file for a given locale name.
     * This is the icu4js package file containing all locale specific resources
     * for a locale.
     * @param {string} localeName
     * @returns {string}
     */
    function getLocaleDataPackageFileName(localeName) {
        return localeName.replace(/-/g, '_') + '.dat';
    }

    /**
     * Returns the path to the directory with the individual
     * resource files on the server where this javascript was
     * loaded.
     * @returns {string}
     */
    function getUnpackedDataFilesDirPathRemote() {
        return unpackedDataFilesDirName;
    }

    /**
     * Returns the path on the server where this javascript was
     * loaded where a resource at __relativePath__ (relative
     * to icu data directory) can be found.
     * @param {string} relativePath
     * @returns {string}
     */
    function getRemotePathForLocalRelativePath(relativePath) {
        return fsUtils.joinPath(dataRoot, relativePath);
    }

    /**
     * Given a byte array of data __fileContent__ loads it into a file
     * at __relativePathFS__ in __rootDirectoryFS__ in emscripten file
     * system.
     * @param relativePathFS
     * @param rootDirectoryFS
     * @param fileContent
     */
    function loadFileInFileSystem(relativePathFS, rootDirectoryFS, fileContent) {
        var filePathFS = fsUtils.joinPath(rootDirectoryFS, relativePathFS);
        var fileDirNameFS = fsUtils.getDirNameFromPath(filePathFS);

        // file is already loaded, ignore
        if (fsUtils.exists(filePathFS)) {
            return;
        }

        FS.createPath('', fileDirNameFS, true, true);
        FS.createDataFile(rootDirectoryFS, relativePathFS, fileContent, true, true);
    }

    /**
     * Loads files at paths specified relative to the root directory for all icu4js
     * resources. The files that were successfully loaded are loaded in local FS
     * under __rootDirFS__.
     * @param {String[]} relativeFilePathsRemote
     * @param {String} rootDirFS
     * @param {Function} callback called with an array mapping provided files
     *     paths to load error|null
     * @param {Function=} remoteToLocalPathMapper If supplied this function is used
     *     to map the relative remote path to the relative locale FS for each path.
     */
    function fetchAndLoadRemoteFileInFileSystem(relativeFilePathsRemote, rootDirFS,
                                                callback, remoteToLocalPathMapper) {
        var serverUrls = relativeFilePathsRemote.map(function(relativeFilePath){
            return getRemotePathForLocalRelativePath(relativeFilePath);
        });

        urlLoader.loadUrls(serverUrls, function(fetchResponses){
            fetchResponses.forEach(function(fetchResponse, index){
                if (!fetchResponse.error) {
                    var relativeFilePathRemote = relativeFilePathsRemote[index];
                    if (!!remoteToLocalPathMapper) {
                        relativeFilePathRemote = remoteToLocalPathMapper(relativeFilePathRemote);
                    }
                    loadFileInFileSystem(relativeFilePathRemote, rootDirFS, fetchResponse.response);
                }
            });

            var pathLoadErrors = fetchResponses.map(function(fetchResponse){
                return fetchResponse.error;
            });
            callback(pathLoadErrors);
        });
    }

    /**
     * Extracts the constituent files of an icu4js data package and loads them
     * individual into the local emscripten file system
     * @param packagePathFS          The path to the data package file already
     *                               loaded into the local FS
     * @param packageFilesRootDirFS  The path in the local FS to the directory inside
     *                               which the files packed in the data package should
     *                               be loaded.
     * @returns {Error}
     */
    function loadPackagedDataFileToFileSystem(packagePathFS, packageFilesRootDirFS) {
        var icu4jsError = new Module.Error();
        var packagedFiles = Module.DataPackager.getPackagedFiles(packagePathFS, icu4jsError);

        if (!icu4jsError.isSuccess()) {
            var errorMessage = 'Error in reading icu4js package file: '
                + icu4jsError.getMessage()
                + ' ' + icu4jsError.getCode();
            icu4jsError.delete();
            return new Error(errorMessage);
        } else {
            icu4jsError.delete();
        }

        var packageFileContent = FS.readFile(packagePathFS);

        var numPackagedFiles = packagedFiles.size();
        for (var i=0; i<numPackagedFiles; ++i) {
            var packagedFile = packagedFiles.get(i);
            var packagedFileContent = packageFileContent.subarray(
                packagedFile.offset,
                packagedFile.offset + packagedFile.size
            );

            loadFileInFileSystem(packagedFile.path, packageFilesRootDirFS, packagedFileContent);
        }

        return null;
    }

    function loadLocaleData(localeName, callback) {
        var dataDirNameFS = MEMFS_DATA_DIR_NAME;
        var individualDataFileDirNameFS = getIndividualDataFileDirName();
        var individualDataFileDirNameRemote = getUnpackedDataFilesDirPathRemote();

        if (!fsUtils.exists(fsUtils.joinPath('/', dataDirNameFS))) {
            FS.createPath('/', dataDirNameFS, true, true);
        }

        var localeDataPackageFileName = getLocaleDataPackageFileName(localeName);

        // start by trying for the best case: a common data .dat file + a locale dat .dat file
        var dataFileRelPaths = [commonDataPackageName, localeDataPackageFileName];
        fetchAndLoadRemoteFileInFileSystem(dataFileRelPaths, dataDirNameFS, function(pathLoadErrors){
            // common data file is required, fail if we couldn't get it
            var commonDataLoadError = pathLoadErrors[0];
            if (!!commonDataLoadError) {
                var errorMessage = 'Failed to load common data file, aborting initialization: '
                    + commonDataLoadError;

                console.error(errorMessage);
                callback(new Error(errorMessage));

                return;
            }

            loadPackagedDataFileToFileSystem(
                fsUtils.joinPath(dataDirNameFS, commonDataPackageName),
                fsUtils.joinPath(dataDirNameFS, individualDataFileDirNameFS)
            );

            var localePackageLoadError = pathLoadErrors[1];
            // locale resources are available in a single package
            // we'll map the files insides the package to files in
            // the file system
            if (!localePackageLoadError) {
                loadPackagedDataFileToFileSystem(
                    fsUtils.joinPath(dataDirNameFS, localeDataPackageFileName),
                    fsUtils.joinPath(dataDirNameFS, individualDataFileDirNameFS)
                );
                callback(null);
                return;
            }

            // locale data package is not available, we'll load individual files
            // to get the list of individual files we need to load we first
            // need to load the lazy-load manifest file
            fetchAndLoadRemoteFileInFileSystem(
                [lazyLoadManifestName],
                dataDirNameFS,
                function(pathLoadErrors){
                    var errorMessage;

                    // we won't be able to handle this locale without locale specific data,
                    // abort initialization
                    // TODO (sunny): may be fall back to en_US?
                    var lazyLoadManifestLoadError = pathLoadErrors[0];
                    if (!!lazyLoadManifestLoadError) {
                        errorMessage = 'Failed to load lazy load manifest file, aborting initialization: '
                            + lazyLoadManifestLoadError;

                        console.error(errorMessage);
                        callback(new Error(errorMessage));
                        return;
                    }

                    var lazyLoadManifestLocalFsPath = fsUtils.joinPath('', dataDirNameFS, lazyLoadManifestName);
                    var icu4jsError = new Module.Error();

                    // optional services are not supported yet, pass empty vector
                    var optionalServices = new Module.ICUOptionalServiceVector();
                    var localeFilesToLoadVector = Module.DataPackager.getLazyLoadFiles(
                        lazyLoadManifestLocalFsPath,
                        optionalServices,
                        localeName,
                        icu4jsError
                    );

                    if (!icu4jsError.isSuccess()) {
                        errorMessage = 'Error in reading lazy-load manifest, aborting initialization: '
                            + icu4jsError.getMessage()
                            + ' - '
                            + icu4jsError.getCode();
                        icu4jsError.delete();
                        console.error(errorMessage);
                        callback(new Error(errorMessage));
                        return;
                    } else {
                        icu4jsError.delete();
                    }

                    // convert C++ vector to JS array
                    var localeFilesToLoad = [];
                    var numLocaleFilesToLoad = localeFilesToLoadVector.size();
                    for (var i=0; i<numLocaleFilesToLoad; ++i) {
                        var lazyLoadFilePath = localeFilesToLoadVector.get(i);
                        lazyLoadFilePath = fsUtils.joinPath(
                            individualDataFileDirNameRemote,
                            lazyLoadFilePath
                        );
                        localeFilesToLoad.push(lazyLoadFilePath);
                    }

                    fetchAndLoadRemoteFileInFileSystem(
                        localeFilesToLoad,
                        fsUtils.joinPath(dataDirNameFS, individualDataFileDirNameFS),
                        function(pathLoadErrors){
                            // we don't fail if an individual resource fails to load
                            // most functionality might still work fine depending
                            // on which file(s) failed to load
                            var numSuccesses = 0;
                            pathLoadErrors.forEach(function(pathLoadError, index){
                                if (!!pathLoadError) {
                                    console.warn(
                                        'Failed to lazy-load locale resource: ',
                                        localeFilesToLoad[index]
                                    );
                                } else {
                                    numSuccesses++;
                                }
                            });

                            if (numSuccesses === 0) {
                                var errorMessage = 'Failed to lazy-load any locale resource';
                                console.error(errorMessage);
                                callback(new Error(errorMessage));
                            } else {
                                callback(null);
                            }
                        },
                        function(relativeRemotePath) {
                            // TODO (sunny): Remove the use of RegExp for path manipulation.
                            // If emscripten FS does not support ../ notation we should
                            // support it via our path utils.
                            var directoryToRemove = getUnpackedDataFilesDirPathRemote();
                            var regularExpression = new RegExp('^' + directoryToRemove + '\/');
                            return relativeRemotePath.replace(regularExpression, '');
                        }
                    );
                }
            );
        });
    }

    function initializeICU() {
        var error = new Module.Error();

        // initialize with default locale
        Module.ICU4JS.initialize(
            fsUtils.joinPath(MEMFS_DATA_DIR_NAME, ''),
            DEFAULT_LOCALE,
            error
        );

        if (!error.isSuccess()) {
            var errorMessage = 'Failed to initialize ICU: '
                + error.getMessage()
                + '-'
                + error.getCode();
            error.delete();
            return new Error(errorMessage);
        } else {
            error.delete();
        }

        return null;
    }

    function onInitializationDone(error) {
        isInitializing = false;
        initializationError = error;
        isInitialized = true;

        var callbacks = pendingInitCallbacks;
        pendingInitCallbacks = [];

        callbacks.forEach(function(pendingCallback){
            try {
                pendingCallback(error);
            } catch (e) {
                console.warn('Error in ICU4JS initialization callback', e);
            }
        });
    }

    function initialize(locale, acceptLanguage, callback) {
        // Steps:
        // 1. Load icu4js default locale package. This contains
        //    all common data and data for the default locale.
        // 2. Deduce the locale for the current user from the parameters
        //    supplied to us.
        // 3. If the current user's locale is not the same as the default
        //    locale we load data for the user's locale.
        // 4. If loading the user's locale data fails we bail out, thus leaving
        //    the current locale at the default one.
        // 5. If loading the user's locale data succeeds, set the current
        //    locale to the user specified locale.
        // 6. If setting the locale the user's locale fails, set it back to the
        //    default locale.
        loadLocaleData(DEFAULT_LOCALE, function(error){
            if (!!error) {
                console.error('icu4js failed to load default locale data', error);
                callback(error);
                return;
            }

            error = initializeICU();
            if (!!error) {
                console.error('icu4js initialization failed', error);
                callback(error);
                return;
            }

            var effectiveLocale = determineLocale(locale, acceptLanguage);
            if (effectiveLocale === DEFAULT_LOCALE) {
                icu4js.setLocale(DEFAULT_LOCALE, callback);
                return;
            }

            loadLocaleData(effectiveLocale, function(error){
                if (!!error) {
                    console.warn(
                        'Failed to load non-default locale data, falling back to default locale',
                        effectiveLocale,
                        DEFAULT_LOCALE
                    );
                    callback(null);
                    return;
                }

                icu4js.setLocale(
                    effectiveLocale,
                    function (error) {
                        // we don't want the failure to load data for a locale to cause
                        // the entire app to crash.
                        if (!!error) {
                            console.warn(
                                'Failed to set non-default locale, falling back to default locale',
                                effectiveLocale,
                                DEFAULT_LOCALE,
                                error
                            );
                            icu4js.setLocale(DEFAULT_LOCALE, callback);
                            return;
                        }
                        callback(null);
                    }
                );
            });
        });
    }

    function loadLocales(locales, callback) {
        locales = locales.slice();
        if (locales.length === 0) {
            callback();
            return;
        }

        var locale = locales.shift();
        loadLocaleData(locale, function(error){
            if (!!error) {
                console.warn('Failed to load locale data, ignoring', locale, error);
            }
            loadLocales(locales, callback);
        });
    }

    /**
     *
     * @param callback
     * @param config An object with configuration for icu4js
     * @param config.dataRoot The path to the directory with all the icu related
     *                        resource files on the server. This should be relative
     *                        to the HTML page loading this JS file
     * @param config.unpackedDataFilesDirName The name of the directory with individual icu
     *                                resource files. This directory is assumed to
     *                                be a child of the __dataRoot__ directory.
     * @param config.commonDataPackageName The name of the .dat file for icu data
     *                                     common across all locales
     * @param config.lazyLoadManifestName The name of the .mf file listing relative
     *                                    paths of resource files needed by specific
     *                                    locales
     * @param {string} [config.defaultLocale]  An optional overriding locale code.
     *     If not provided locale is derived from the browser settings.
     * @param {string} [config.acceptLanguage] An optional parameter to ask icu4js to
     *     deduce locale from Accept-Language header value from the current browser
     */
    function load(callback, config) {
        if (config.dataRoot !== void 0) {
            dataRoot = config.dataRoot;
        }

        if (config.unpackedDataFilesDirName !== void 0) {
            unpackedDataFilesDirName = config.unpackedDataFilesDirName;
        }

        if (config.commonDataPackageName !== void 0) {
            commonDataPackageName = config.commonDataPackageName;
        }

        if (config.lazyLoadManifestName !== void 0) {
            lazyLoadManifestName = config.lazyLoadManifestName;
        }

        var locale = void 0;
        var acceptLanguage = void 0;

        if (config.defaultLocale !== void 0) {
            locale = config.defaultLocale;
        } else {
            acceptLanguage = config.acceptLanguage;
        }

        if (isInitialized) {
            callback(initializationError);
            return;
        }

        pendingInitCallbacks.push(callback);
        isInitializing = true;
        initialize(locale, acceptLanguage, onInitializationDone);
    }

    var dataRoot = Defaults.DATA_ROOT;
    var unpackedDataFilesDirName = Defaults.UNPACKED_DATA_FILES_DIR_NAME;
    var commonDataPackageName = Defaults.COMMON_DATA_PACKAGE_NAME;
    var lazyLoadManifestName = Defaults.LAZY_LOAD_MANIFEST_NAME;

    global.icu4js = global.icu4js || {};
    global.icu4js.load = load;
    global.icu4js.loadLocales = loadLocales;
})(window);