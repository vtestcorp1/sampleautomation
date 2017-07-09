/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to load shaders. Supports including shaders within shaders.
 *
 */

'use strict';

blink.app.factory('shaderService', ['$q', 'Logger', 'resourceCachingService',
    function ($q, Logger, resourceCachingService) {

        var SHADER_INCLUDE_REGEX = /#include\s*<(.+?)>\s*/gi;
    // not all snippets of glsl are full valid shaders. partial snippets will casue IDEs to report
    // errors in them. as a workaround we wrap such partial shader snippers in specially marked comments
    // and unwrap them before injection
        var LITERAL_SHADER_REPLACEMENT_REGEX = /[/][*]BEGIN_BLINK_SHADER_LITERAL([\s\S]*?)END_BLINK_SHADER_LITERAL[*][/]/;

        var logger = Logger.create('shader-service');
        var shaderUrlToProcessedShader = {};

        function getIncludedShaderUrls(shaderText) {
            var match;
            var includedUrls = [];

            while ((match = SHADER_INCLUDE_REGEX.exec(shaderText)) !== null) {
                includedUrls.push(match[1]);
            }
            return includedUrls;
        }

        function replaceIncludedShaderUrls(shaderText) {
            return shaderText.replace(SHADER_INCLUDE_REGEX, function(matchedLine, url){
                if (!Object.has(shaderUrlToProcessedShader, url)) {
                    logger.warn('processed shader not found for shader#include', url);
                    return '';
                }
                return shaderUrlToProcessedShader[url] + '\n\n';
            });
        }

        function processShaderText(shaderText) {
        // TODO (sunny): extend each include to have two field, one for the main function
        // other for variable declarations
            shaderText = shaderText.replace(LITERAL_SHADER_REPLACEMENT_REGEX, '$1');
            return replaceIncludedShaderUrls(shaderText);
        }

        function getShaders(shaderUrls) {
            var urlsMissingFromCache = shaderUrls.filter(function(shaderUrl){
                return !Object.has(shaderUrlToProcessedShader, shaderUrl);
            });

            var deferred = $q.defer();
            if (shaderUrls.length === 0) {
                deferred.resolve([]);
                return deferred.promise;
            }

            resourceCachingService.getResources(urlsMissingFromCache)
            .then(function(shaders){
                // TODO (sunny): detect cycles and avoid infinite loop

                var allIncludedUrlSet = {};
                shaders.forEach(function(shaderText){
                    var includedShaderUrls = getIncludedShaderUrls(shaderText);
                    includedShaderUrls.forEach(function(includedShaderUrl){
                        allIncludedUrlSet[includedShaderUrl] = true;
                    });
                });

                getShaders(Object.keys(allIncludedUrlSet))
                    .then(function(){
                        shaders.forEach(function(shaderText, shaderIndex){
                            var processedShaderText = processShaderText(shaderText);
                            var shaderUrl = urlsMissingFromCache[shaderIndex];
                            shaderUrlToProcessedShader[shaderUrl] = processedShaderText;
                        });

                        var allProcessedShaders = shaderUrls.map(function(shaderUrl){
                            if (!Object.has(shaderUrlToProcessedShader, shaderUrl)) {
                                logger.warn('missing processed shader for shaderUrl', shaderUrl);
                                return null;
                            }
                            return shaderUrlToProcessedShader[shaderUrl];
                        });

                        deferred.resolve(allProcessedShaders);

                    }, function(error){
                        deferred.reject(error);
                    });
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }


        return {
            getShaders: getShaders
        };

    }]);
