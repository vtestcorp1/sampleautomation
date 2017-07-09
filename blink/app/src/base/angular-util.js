/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Utility to provide helpers specific to angular framework.
 */

'use strict';

blink.app.factory('angularUtil', ['$compile',
    function($compile) {
        function getCompiledElement(template, scope) {
            var $elem = $compile(template)(scope);
            scope.$on('$destroy', function() {
                $elem.remove();
                // NOTE: This is extra cautious check to ensure marking object of GC.
                $elem = null;
            });
            return $elem;
        }

        function getCompiledElementAsync($node, childScope) {
            $node.attr('blink-manual-compile', 'true');
            childScope.$on("$destroy", function() {
                $node.remove();
            });
            return new Promise(function(resolve) {
                childScope.onLinked = resolve;
                $compile($node)(childScope);
            });
        }

        return {
            getCompiledElement: getCompiledElement,
            getCompiledElementAsync: getCompiledElementAsync
        };
    }]
);
