/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A directive to show a list of labels that an object is tagged with.
 */

'use strict';

blink.app.directive('taggedLabels', ['$parse', '$rootScope', 'events', 'labelsService', function ($parse, $rootScope, events, labelsService) {
    function linker(scope, $el, attrs) {

        scope.getLabelsRegistry = function () {
            return labelsService.labelsRegistry;
        };

        function updateModel() {
            var selectedLabels = scope.getSelectedLabels() || [];
            var isFilterLabel = function(label) {
                return selectedLabels.find(function(element, index, array) {
                    return element == label.getName();
                });
            };
            scope.labels = scope.getTags().map(function (tagJson) {
                return scope.getLabelsRegistry().getLabel(tagJson.id);
            }).filter(function (label) {
                return !!label;
            }).sort(function (label1, label2) {
                if (isFilterLabel(label1) && !isFilterLabel(label2)) {
                    return -1;
                } else if (isFilterLabel(label2) && !isFilterLabel(label1)) {
                    return +1;
                } else {
                    if (label1.getName() < label2.getName()) {
                        return -1;
                    } else if (label1.getName() > label2.getName()) {
                        return +1;
                    } else {
                        return 0;
                    }
                }
            });
        }
        updateModel();

        // Since users can't assign and unassign tags of an object at same time, a length watch is good enough.
        // but we should really use a computed hash of the tag list.
        scope.$watch(function () {
            var tags = scope.getTags();
            if (!tags.length) {
                return '';
            }

            return tags.reduce(function (accumulator, tag) {
                return accumulator + tag.id;
            }, '');
        }, function () {
            updateModel();
            computeAllowedLabelCount();
        });

        var onRemoveLabel = $parse(attrs.onRemoveLabel);
        scope.removeLabel = function (label) {
            onRemoveLabel(scope.$parent, {
                $label: label
            });
        };

        scope.makeFilterRequest = function (label) {
            $rootScope.$broadcast(events.FILTER_METADATA_BY_LABEL_D, label);
        };

        scope.removeLabelFromDropdown = function (label) {
            scope.removeLabel(label);
            $el.find('[data-toggle=dropdown]').trigger('click.bs.dropdown');
        };

        // Note that this is a crude heuristic based on certain assumptions about the number of characters that can fit
        // in a single line of a the container and that atmost 2 lines can be shown.
        // TODO(vibhor/rahul): Improve this to use the actual rendered dimensions.
        var MAX_CHARS_IN_A_LINE = 27,
            MAX_LABEL_LENGTH_ALLOWED = 12,
            PER_LABEL_OVERHEAD = 4,
            SHOW_MORE_INDICATOR_WIDTH = 2 + PER_LABEL_OVERHEAD,
            MAX_ROWS_ALLOWED = 2,
            TOTAL_CHARS_ALLOWED = MAX_CHARS_IN_A_LINE * MAX_ROWS_ALLOWED;
        function computeAllowedLabelCount() {
            // Allow at least 2 labels (arbitrarily decided)
            scope.allowedLabelCount = 2;
            var charCountInCurRow = 0;
            scope.labels.each(function (label, index) {
                var labelLength = Number.prototype.clamp.call(label.name.length, 0, MAX_LABEL_LENGTH_ALLOWED) +
                    PER_LABEL_OVERHEAD;
                if (charCountInCurRow + labelLength <= TOTAL_CHARS_ALLOWED) {
                    charCountInCurRow += labelLength;
                    if (charCountInCurRow + SHOW_MORE_INDICATOR_WIDTH <= TOTAL_CHARS_ALLOWED) {
                        scope.allowedLabelCount = index + 1;
                    } else {
                        scope.allowedLabelCount = index;
                    }
                }
            });

            scope.hasMultipleRows = charCountInCurRow > MAX_CHARS_IN_A_LINE;
        }

        computeAllowedLabelCount();

        scope.$on(events.LABEL_UPDATED_D, function () {
            computeAllowedLabelCount();
        });

        scope.$on(events.LABELS_REFRESH_D, function () {
            updateModel();
            computeAllowedLabelCount();
        });
    }

    return {
        restrict: 'E',
        scope: {
            getTags: '&tags',
            getSelectedLabels: '&selectedLabels',
            isDeletable: '&deletable'
        },
        templateUrl: 'src/modules/labels/tagged-labels.html',
        link: linker
    };
}]);
