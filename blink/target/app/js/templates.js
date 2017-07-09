angular.module('templates', ['src/base/app-canvas/app-canvas.html', 'src/base/app-canvas/pages/insight.html', 'src/base/app-canvas/pages/pinboard.html', 'src/base/app-canvas/pages/schema-viewer.html', 'src/base/app-canvas/pages/worksheet.html', 'src/base/app-page.html', 'src/base/app.html', 'src/base/empty-template.html', 'src/common/alert/alert.html', 'src/common/alert/templates/api-alert-template.html', 'src/common/alert/templates/missing-document-alert-template.html', 'src/common/list/actionable-list/actionable-list.html', 'src/common/list/list/list.html', 'src/common/loading-indicator/loading-indicator-overlay.html', 'src/common/loading-indicator/loading-indicator.html', 'src/common/new-button-dropdown/new-button-dropdown.html', 'src/common/paged-repeat/paged-repeat-expand-button.html', 'src/common/relationship/relationship-editor.html', 'src/common/relationship/relationship-list.html', 'src/common/relationship/relationship-popup.html', 'src/common/relationship/relationship-viewer.html', 'src/common/tree-menu/tree-menu.html', 'src/common/widgets/accordion-list-viewer/accordion-list-viewer-item.html', 'src/common/widgets/accordion-list-viewer/accordion-list-viewer.html', 'src/common/widgets/accordion/accordion-item.html', 'src/common/widgets/accordion/accordion-list.html', 'src/common/widgets/action-confirmation-popup/action-confirmation-popup-content.html', 'src/common/widgets/action-links-list/action-links-list.html', 'src/common/widgets/action-menu/action-menu.html', 'src/common/widgets/add-new-item/add-new-item.html', 'src/common/widgets/auto-hide/auto-hide.html', 'src/common/widgets/blob/blob-uploader/blob-uploader.html', 'src/common/widgets/blob/image-blob-editor/image-blob-editor.html', 'src/common/widgets/buttons/action-button-dropdown/action-button-dropdown.html', 'src/common/widgets/buttons/base-button/button.html', 'src/common/widgets/buttons/icon-button/icon-button.html', 'src/common/widgets/buttons/primary-button/primary-button.html', 'src/common/widgets/buttons/secondary-button/secondary-button.html', 'src/common/widgets/carousel/carousel.html', 'src/common/widgets/carousel/templates/help-tip/advanced-search-tip.html', 'src/common/widgets/carousel/templates/help-tip/choose-sources-tip.html', 'src/common/widgets/carousel/templates/help-tip/know-your-data-tip.html', 'src/common/widgets/carousel/templates/help-tip/search-video-tip.html', 'src/common/widgets/checkbox-collection/checkbox-collection.html', 'src/common/widgets/checkbox-collection/smart-checkbox-collection.html', 'src/common/widgets/checkbox/checkbox.html', 'src/common/widgets/click-effect/click-effect.html', 'src/common/widgets/color-palette/color-palette-editor/color-palette-editor.html', 'src/common/widgets/color-palette/color-palette-list-editor/color-palette-list-editor.html', 'src/common/widgets/color-picker/color-picker.html', 'src/common/widgets/column-metrics/column-metrics.html', 'src/common/widgets/contact-support/contact-support.html', 'src/common/widgets/content-editable/content-editable.html', 'src/common/widgets/context-menu/context-menu.html', 'src/common/widgets/cross-font-icon/cross-font-icon.html', 'src/common/widgets/dialog/dialog.html', 'src/common/widgets/dialogs/templates/add-prefix-dialog.html', 'src/common/widgets/dialogs/templates/add-users-to-groups-dialog.html', 'src/common/widgets/dialogs/templates/confirm-dialog.html', 'src/common/widgets/dialogs/templates/confirm-empty-pinboard-viz-removal.html', 'src/common/widgets/dialogs/templates/confirm-pinboard-viz-removal.html', 'src/common/widgets/dialogs/templates/create-connection-dialog.html', 'src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html', 'src/common/widgets/dialogs/templates/create-pinboard-dialog.html', 'src/common/widgets/dialogs/templates/currency-type-editor-dialog.html', 'src/common/widgets/dialogs/templates/data-filter-dialog.html', 'src/common/widgets/dialogs/templates/delete-checkbox-dialog.html', 'src/common/widgets/dialogs/templates/edit-schema-dialog.html', 'src/common/widgets/dialogs/templates/geo-config-editor-dialog.html', 'src/common/widgets/dialogs/templates/import-selected-tables-warning-dialog.html', 'src/common/widgets/dialogs/templates/join-workflow-dialog.html', 'src/common/widgets/dialogs/templates/list-dialog.html', 'src/common/widgets/dialogs/templates/pinboard-snapshot-dialog.html', 'src/common/widgets/dialogs/templates/replay-answer-dialog.html', 'src/common/widgets/dialogs/templates/row-detail-dialog.html', 'src/common/widgets/dialogs/templates/sage-feedback-dialog.html', 'src/common/widgets/dialogs/templates/save-dialog.html', 'src/common/widgets/dialogs/templates/scheduler-dialog.html', 'src/common/widgets/dialogs/templates/simple-save-dialog.html', 'src/common/widgets/dialogs/templates/visualization-pinner-dialog.html', 'src/common/widgets/editable-list/removable-component/removable-component.html', 'src/common/widgets/expiration-button/expiration-button.html', 'src/common/widgets/file-upload/html5-file-upload/html5-file-upload.html', 'src/common/widgets/fonts/font-editor/font-editor.html', 'src/common/widgets/fonts/font-preview/font-preview.html', 'src/common/widgets/fonts/font-selector/font-selector.html', 'src/common/widgets/fonts/multi-font-selector/multi-font-selector.html', 'src/common/widgets/image-view/image-view.html', 'src/common/widgets/info-header/info-header.html', 'src/common/widgets/input/input.html', 'src/common/widgets/key-value-viewer/key-value-viewer.html', 'src/common/widgets/menu/button-menu.html', 'src/common/widgets/multi-section-list/multi-section-list-item/multi-section-list-item.html', 'src/common/widgets/multi-section-list/multi-section-list.html', 'src/common/widgets/multi-sections-navigable-list/base-item-template.html', 'src/common/widgets/multi-sections-navigable-list/multi-section-navigable-list.html', 'src/common/widgets/multi-sections-navigable-list/navigable-section.html', 'src/common/widgets/name-value-pairs/name-value-pairs.html', 'src/common/widgets/popover/blink-positionable-popover.html', 'src/common/widgets/profile-pic/profile-pic.html', 'src/common/widgets/radio-button/radio-button.html', 'src/common/widgets/range-select/numeric-range-selector/date-range-select/date-range-select.html', 'src/common/widgets/range-select/numeric-range-selector/numeric-range-select.html', 'src/common/widgets/replay-controls/replay-controls.html', 'src/common/widgets/select/select.html', 'src/common/widgets/slick-table/slick-table.html', 'src/common/widgets/slickgrid/clipboard-copy-confirmation-view.html', 'src/common/widgets/slickgrid/context-menu-item-copy-data.html', 'src/common/widgets/slickgrid/slickgrid-table.html', 'src/common/widgets/slide-show/slide-show-navigator.html', 'src/common/widgets/slider/slider.html', 'src/common/widgets/style-configuration/background-configurator/background-configurator.html', 'src/common/widgets/style-configuration/color-configurator/color-configurator.html', 'src/common/widgets/tab-control-component/tab-control-component.html', 'src/common/widgets/tab-control/tab-control-tab.html', 'src/common/widgets/tab-control/tab-control.html', 'src/common/widgets/text-box-customizer/text-box-configurator-component.html', 'src/modules/a3/a3-algorithm-customizer/a3-algorithm-customizer.html', 'src/modules/a3/a3-analysis-customizer/a3-analysis-customizer.html', 'src/modules/a3/a3-dashboard/a3-dashboard.html', 'src/modules/a3/a3-dialog-popup.html', 'src/modules/a3/a3-dialog.html', 'src/modules/a3/a3-drill-column-selector/a3-drill-column-selector.html', 'src/modules/a3/a3-exclude-column-selector/a3-exclude-column-selector.html', 'src/modules/a3/a3-insights-summary/a3-insights-summary.html', 'src/modules/a3/a3-job-detail-popup/a3-job-detail-popup.html', 'src/modules/a3/a3-job-detail/a3-job-detail.html', 'src/modules/a3/a3-job-schedule-configurator/a3-job-schedule-configurator.html', 'src/modules/a3/a3-jobs-viewer/a3-jobs-viewer.html', 'src/modules/a3/a3-results-viewer/a3-results-viewer.html', 'src/modules/a3/a3-runs-viewer/a3-runs-viewer.html', 'src/modules/a3/table/a3-table-analysis.html', 'src/modules/a3/table/algorithm-customizer/table-algorithm-customizer.html', 'src/modules/a3/table/analysis-customizer/a3-table-analysis-customizer.html', 'src/modules/a3/table/column-excluder/a3-table-column-excluder.html', 'src/modules/a3/table/column-selector/a3-table-column-selector.html', 'src/modules/add-email/add-email.html', 'src/modules/add-principal/add-principal.html', 'src/modules/admin/admin-page.html', 'src/modules/admin/admin.html', 'src/modules/admin/file-upload-metadata.html', 'src/modules/admin/file-upload-security.html', 'src/modules/admin/schema-viewer/legend/blink-graph-legend.html', 'src/modules/admin/schema-viewer/schema-navigation-list/schema-item.html', 'src/modules/admin/schema-viewer/schema-navigation-list/schema-navigation-list.html', 'src/modules/admin/schema-viewer/schema-navigation-list/worksheet-item.html', 'src/modules/admin/schema-viewer/viewer-directive/schema-viewer-modal.html', 'src/modules/admin/schema-viewer/viewer-directive/schema-viewer.html', 'src/modules/admin/schema-viewer/viewer-directive/top-level-directive/graph-viewer.html', 'src/modules/admin/usersAdministration/admin-dialog-controller/admin-dialog.html', 'src/modules/admin/usersAdministration/admin-form/admin-item-form.html', 'src/modules/admin/usersAdministration/admin-tabs-controller/admin-tabs-collection.html', 'src/modules/analyze/analyzer.html', 'src/modules/analyze/rules/chasm-trap.html', 'src/modules/analyze/rules/common-prefix.html', 'src/modules/analyze/rules/high-column-numbers.html', 'src/modules/analyze/rules/high-indexed-column-numbers.html', 'src/modules/analyze/rules/long-column-names.html', 'src/modules/analyze/rules/long-table-name.html', 'src/modules/analyze/rules/system-keywords.html', 'src/modules/answer-panel/answer-author/answer-author.html', 'src/modules/answer-panel/answer-document/answer-document.html', 'src/modules/answer-panel/answer-page/answer-page.html', 'src/modules/chart-viz/chart-viz.html', 'src/modules/charts/chart-editor/chart-axis-configurator/chart-axis-configurator.html', 'src/modules/charts/chart-editor/chart-axis-locker/chart-axis-locker.html', 'src/modules/charts/chart-editor/chart-configurator/chart-config-item.html', 'src/modules/charts/chart-editor/chart-configurator/chart-config-range-item.html', 'src/modules/charts/chart-editor/chart-configurator/chart-config-selector-item.html', 'src/modules/charts/chart-editor/chart-configurator/chart-config-toggler-item.html', 'src/modules/charts/chart-editor/chart-configurator/chart-config.html', 'src/modules/charts/chart-editor/chart-editor.html', 'src/modules/charts/chart-editor/zoom-state-configurator/chart-zoom.html', 'src/modules/clusterstatus/cluster-status-page.html', 'src/modules/clusterstatus/vizs/alert-detail-alerts-viz/alert-detail-alerts-viz.html', 'src/modules/clusterstatus/vizs/alert-detail-events-viz/alert-detail-events-viz.html', 'src/modules/clusterstatus/vizs/alert-detail-notifications-viz/alert-detail-notifications-viz.html', 'src/modules/clusterstatus/vizs/alert-summary-viz/alert-summary-viz.html', 'src/modules/clusterstatus/vizs/cluster-detail-info-viz/cluster-detail-info-viz.html', 'src/modules/clusterstatus/vizs/cluster-detail-log-viz/cluster-detail-log-viz.html', 'src/modules/clusterstatus/vizs/cluster-detail-snapshot-viz/cluster-detail-snapshot-viz.html', 'src/modules/clusterstatus/vizs/cluster-summary-viz/cluster-summary-viz.html', 'src/modules/clusterstatus/vizs/database-detail-viz/database-detail-viz.html', 'src/modules/clusterstatus/vizs/database-summary-viz/database-summary-viz.html', 'src/modules/clusterstatus/vizs/event-summary-viz/event-summary-viz.html', 'src/modules/clusterstatus/vizs/generic-viz/blink-generic-viz.html', 'src/modules/clusterstatus/vizs/search-detail-table-viz/search-detail-table-viz.html', 'src/modules/clusterstatus/vizs/search-summary-viz/search-summary-viz.html', 'src/modules/comment/comment.html', 'src/modules/comment/user-mentions.html', 'src/modules/conditional-formatting/conditional-formatting.html', 'src/modules/custom-styling/style-customizer.html', 'src/modules/data-explorer/blink-data-explorer-popup.html', 'src/modules/data-explorer/currency-type-editor/currency-type-editor.html', 'src/modules/data-explorer/custom-region-uploader/custom-region-uploader.html', 'src/modules/data-explorer/data-explorer.html', 'src/modules/data-explorer/geo-config-editor/geo-config-editor.html', 'src/modules/data-sources/data-filters/data-filters.html', 'src/modules/data-sources/import-data/import-data-footer-step-1.html', 'src/modules/data-sources/import-data/import-data-page.html', 'src/modules/data-sources/import-data/import-data-step-datafilters.html', 'src/modules/data-sources/import-data/import-data-step-final.html', 'src/modules/data-sources/import-data/import-data-step-shuttle.html', 'src/modules/data-sources/import-data/import-data-step-type.html', 'src/modules/data-sources/import-data/import-data.html', 'src/modules/data-sources/status-viewer/status-viewer.html', 'src/modules/data-sources/transformation-editor/table-transformations/table-transformations.html', 'src/modules/data-sources/transformation-editor/transformation-editor.html', 'src/modules/data-viz/data-viz.html', 'src/modules/debug/columns/author.html', 'src/modules/debug/columns/datetime.html', 'src/modules/debug/columns/deleted.html', 'src/modules/debug/columns/dependency-group-marker.html', 'src/modules/debug/columns/hidden.html', 'src/modules/debug/columns/id.html', 'src/modules/debug/columns/name.html', 'src/modules/debug/columns/owner.html', 'src/modules/debug/columns/type.html', 'src/modules/debug/debug-page.html', 'src/modules/debug/debug.html', 'src/modules/debug/loggers-management.html', 'src/modules/debug/memcache-management.html', 'src/modules/debug/metadata-management.html', 'src/modules/debug/pie-chart.html', 'src/modules/embed/blink-embed.html', 'src/modules/embed/embedding-control/embedding-control-dialog.html', 'src/modules/embed/embedding-control/embedding-control.html', 'src/modules/empty-page-placeholder/empty-page-placeholder.html', 'src/modules/expression-editor/expression-editor-tooltip/expression-editor-tooltip.html', 'src/modules/expression-editor/expression-editor.html', 'src/modules/expression-editor/expression-suggestion-item-tooltip.html', 'src/modules/expression-editor/expression-suggestion-item.html', 'src/modules/expression-editor/expression-suggestions-menu.html', 'src/modules/filter-panel/filter-dialog.html', 'src/modules/filter-panel/filter-panel.html', 'src/modules/formula-editor/formula-assistant/formula-assistant-help-section.html', 'src/modules/formula-editor/formula-assistant/formula-assistant.html', 'src/modules/formula-editor/formula-editor.html', 'src/modules/headline-viz/headline-viz.html', 'src/modules/help-widget/help-no-connection.html', 'src/modules/help-widget/help-widget.html', 'src/modules/help/help-page.html', 'src/modules/help/help.html', 'src/modules/home/home-activity/home-activity.html', 'src/modules/home/home-dashboard/home-dashboard.html', 'src/modules/home/home-page.html', 'src/modules/home/home-sage/home-sage.html', 'src/modules/jobs-scheduling/job-metadata-component/job-metadata.html', 'src/modules/jobs-scheduling/job-status-viewer.html', 'src/modules/jobs-scheduling/schedule-report-content.html', 'src/modules/jobs-scheduling/scheduled-jobs-list/scheduled-jobs-list.html', 'src/modules/labels/label-removal-alert-message.html', 'src/modules/labels/labels.html', 'src/modules/labels/tagged-labels.html', 'src/modules/leaf-level-data/add-columns-menu.html', 'src/modules/leaf-level-data/leaf-level-data.html', 'src/modules/login/login.html', 'src/modules/metadata-item-selector/metadata-item-selector.html', 'src/modules/metadata-list/answers/answer-disabled-alert-dialog.html', 'src/modules/metadata-list/answers/answers-list-page.html', 'src/modules/metadata-list/apply-label-menu.html', 'src/modules/metadata-list/data-management/data-management-page.html', 'src/modules/metadata-list/data-management/data-sources/data-sources-list-page.html', 'src/modules/metadata-list/data-management/tables/tables-list-page.html', 'src/modules/metadata-list/filters/list-filters-labels.html', 'src/modules/metadata-list/metadata/metadata-list-page.html', 'src/modules/metadata-list/pinboards/pinboard-report-list-component.html', 'src/modules/metadata-list/pinboards/pinboards-list-page.html', 'src/modules/name-description/name-description.html', 'src/modules/natural-query/clause-templates/aggregate-clause.html', 'src/modules/natural-query/clause-templates/filter-clause.html', 'src/modules/natural-query/clause-templates/grouping-clause.html', 'src/modules/natural-query/clause-templates/growth-clause.html', 'src/modules/natural-query/clause-templates/join-clause.html', 'src/modules/natural-query/clause-templates/list-clause.html', 'src/modules/natural-query/clause-templates/sort-clause.html', 'src/modules/natural-query/clause-templates/top-clause.html', 'src/modules/natural-query/clause-templates/worksheet-list-clause.html', 'src/modules/natural-query/info-card-icon/info-card-icon.html', 'src/modules/natural-query/info-card/info-card.html', 'src/modules/natural-query/natural-query/natural-query.html', 'src/modules/nav/nav.html', 'src/modules/object-migration/export/export-dialog.html', 'src/modules/object-migration/import/import-dialog.html', 'src/modules/pinboard/pb-card/pb-card.html', 'src/modules/pinboard/pb-cluster-viz/pb-cluster-viz.html', 'src/modules/pinboard/pb-generic-viz/pb-generic-viz.html', 'src/modules/pinboard/pinboard-data-viz/pinboard-data-viz.html', 'src/modules/pinboard/pinboard-page.html', 'src/modules/pinboard/pinboard-ribbon.html', 'src/modules/pinboard/pinboard-sharable-item-plugin.html', 'src/modules/pinboard/viz-context/viz-context.html', 'src/modules/powered-footer/powered-footer.html', 'src/modules/principal-selector/principal-selector.html', 'src/modules/print/print-view.html', 'src/modules/related-link/editor/related-link-editor.html', 'src/modules/related-link/editor/related-link-list-viewer.html', 'src/modules/related-link/editor/related-link-popup.html', 'src/modules/related-link/filter/runtime-filter.html', 'src/modules/related-link/related-link.html', 'src/modules/row-level-security/rls-rule-editor/rls-rule-editor.html', 'src/modules/row-level-security/row-level-security.html', 'src/modules/sage/data-panel/answer-formula-panel-component/answer-formula-list.html', 'src/modules/sage/data-panel/bulk-sage-data-columns/bulk-sage-data-columns.html', 'src/modules/sage/data-panel/columns-panel-component/bulk-columns-panel-component.html', 'src/modules/sage/data-panel/columns-panel-component/columns-panel-component.html', 'src/modules/sage/data-panel/formula-panel-component/formula-list.html', 'src/modules/sage/data-panel/formula-panel-component/formulae-panel-component.html', 'src/modules/sage/data-panel/sage-data-columns/sage-data-columns.html', 'src/modules/sage/data-panel/sage-data.html', 'src/modules/sage/data-panel/sources-panel-component/data-scope.html', 'src/modules/sage/data-panel/sources-panel-component/sage-data-sources.html', 'src/modules/sage/data-panel/sources-panel-component/sources-v2-panel-component.html', 'src/modules/sage/data-source-preview/data-source-preview.html', 'src/modules/sage/join-disambiguation/join-disambiguation.html', 'src/modules/sage/read-only-sage/read-only-sage.html', 'src/modules/sage/sage-bar/sage-bar.html', 'src/modules/sage/sage-bubble/sage-bubble.html', 'src/modules/sage/sage-dropdown/sage-default-dropdown-item.html', 'src/modules/sage/sage-dropdown/sage-dropdown-header.html', 'src/modules/sage/sage-dropdown/sage-dropdown.html', 'src/modules/sage/sage-dropdown/sage-feedback-dropdown-item.html', 'src/modules/sage/sage-dropdown/sage-object-result-dropdown-item.html', 'src/modules/sage/sage-dropdown/sage-search-history-dropdown-item.html', 'src/modules/sage/sage.html', 'src/modules/scheduler/scheduler.html', 'src/modules/search-doctor/object-list.html', 'src/modules/search-doctor/query-completions.html', 'src/modules/search-doctor/search-doctor.html', 'src/modules/search-pages/aggregated-worksheet-editor/aggregated-worksheet-editor.html', 'src/modules/search-pages/answer/answer.html', 'src/modules/search-pages/saved-answer/saved-answer.html', 'src/modules/sharable-item/sharable-item.html', 'src/modules/share/share-dialog.html', 'src/modules/share/share-permissions/permission-dropdown.html', 'src/modules/share/share-permissions/permissions-list.html', 'src/modules/share/share-permissions/share-permission.html', 'src/modules/share/share-principal/principal-viewer.html', 'src/modules/shuttle-control/general-item-viewer.html', 'src/modules/shuttle-control/shuttle-viewer.html', 'src/modules/slack-register/slack-register.html', 'src/modules/slack/slack-auth.html', 'src/modules/slack/slack-channels/slack-channels.html', 'src/modules/slack/slack-comments/slack-comments.html', 'src/modules/table-viz/table-viz.html', 'src/modules/user-data/create-schema/create-schema-page.html', 'src/modules/user-data/create-schema/create-schema.html', 'src/modules/user-data/create-schema/import-confirmation.html', 'src/modules/user-data/import-wizard/import-confirmation.html', 'src/modules/user-data/import-wizard/import-system-error.html', 'src/modules/user-data/import-wizard/import-wizard-footer-step-1.html', 'src/modules/user-data/import-wizard/import-wizard-page.html', 'src/modules/user-data/import-wizard/import-wizard-step-1.html', 'src/modules/user-data/import-wizard/import-wizard-step-2.html', 'src/modules/user-data/import-wizard/import-wizard-step-4.html', 'src/modules/user-data/import-wizard/import-wizard.html', 'src/modules/user-preference/profile-pic-upload/profile-pic-upload.html', 'src/modules/user-preference/user-preference/a3/user-a3-preference.html', 'src/modules/user-preference/user-preference/user-preference.html', 'src/modules/viz-context-menu/templates/menu-item-a3-analysis.html', 'src/modules/viz-context-menu/templates/menu-item-apply-as-runtime-filter.html', 'src/modules/viz-context-menu/templates/menu-item-custom-a3-analysis.html', 'src/modules/viz-context-menu/templates/menu-item-drill.html', 'src/modules/viz-context-menu/templates/menu-item-exclude.html', 'src/modules/viz-context-menu/templates/menu-item-include.html', 'src/modules/viz-context-menu/templates/menu-item-leaf-level-data.html', 'src/modules/viz-context-menu/templates/related-items.html', 'src/modules/viz-layout/answer/answer-visualization-viewer/answer-visualization-viewer.html', 'src/modules/viz-layout/answer/pinboard-content.html', 'src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-panel/chart-type-selector-panel.html', 'src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-v2/chart-type-selector-v2.html', 'src/modules/viz-layout/answer/viz-type-selector/table-type-selector/table-type-selector.html', 'src/modules/viz-layout/pinboard/pinboard-answer.html', 'src/modules/viz-layout/viz/axis-label/axis-label.html', 'src/modules/viz-layout/viz/chart/chart-export-control.html', 'src/modules/viz-layout/viz/chart/chart-legend/chart-legend.html', 'src/modules/viz-layout/viz/chart/chart-pagination.html', 'src/modules/viz-layout/viz/chart/chart.html', 'src/modules/viz-layout/viz/chart/color-scale/color-scale.html', 'src/modules/viz-layout/viz/chart/geomap/2d/blink-geo-map.html', 'src/modules/viz-layout/viz/column-control/column-control.html', 'src/modules/viz-layout/viz/common/pinboard-drop-down/pinboard-drop-down.html', 'src/modules/viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner.html', 'src/modules/viz-layout/viz/common/pinboard-snapshot/pinboard-snapshot.html', 'src/modules/viz-layout/viz/filter-v2/attribute-filter/attribute-filter.html', 'src/modules/viz-layout/viz/filter-v2/bulk-filter/bulk-filter.html', 'src/modules/viz-layout/viz/filter-v2/checkbox-filter-v3/checkbox-filter-v3.html', 'src/modules/viz-layout/viz/filter-v2/checkbox-filter/checkbox-filter.html', 'src/modules/viz-layout/viz/filter-v2/filter.html', 'src/modules/viz-layout/viz/filter/empty-filter.html', 'src/modules/viz-layout/viz/headline/headline.html', 'src/modules/viz-layout/viz/pivot/pivot.html', 'src/modules/viz-layout/viz/table/column-menu/body/column-menu-body.html', 'src/modules/viz-layout/viz/table/column-menu/button/column-menu-button.html', 'src/modules/viz-layout/viz/table/more-items-download-footer.html', 'src/modules/viz-layout/viz/table/table-download-control.html', 'src/modules/viz-layout/viz/table/table.html', 'src/modules/viz-layout/viz/table/templates/download-as.html', 'src/modules/viz-layout/viz/viz-cluster/viz-cluster.html', 'src/modules/viz-layout/viz/viz-icon/viz-icon.html', 'src/modules/worksheet/worksheet-content.html', 'src/modules/worksheet/worksheet-page/worksheet-page.html', 'src/modules/worksheet/worksheet.html', 'src/style-guide/box-model.html', 'src/style-guide/buttons.html', 'src/style-guide/color.html', 'src/style-guide/dev-guide.html', 'src/style-guide/icons.html', 'src/style-guide/layout.html', 'src/style-guide/overview.html', 'src/style-guide/style-guide.html', 'src/style-guide/style-guide2.html', 'src/style-guide/typography.html', 'src/style-guide/widgets-browser/widgets-browser.html', 'src/test/test.html']);

angular.module("src/base/app-canvas/app-canvas.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-canvas/app-canvas.html",
    "<div class=\"bk-page bk-page-app-canvas bk-canvas-state-{{ canvasState }}\">\n" +
    "\n" +
    "    <div blink-alert></div>\n" +
    "    <div class=\"bk-vertical-flex-container-sized\" ng-switch=\"canvasState\">\n" +
    "        <bk-a3-dashboard ng-switch-when=\"insights\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-a3-dashboard>\n" +
    "        <bk-answer ng-switch-when=\"answer\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-answer>\n" +
    "        <bk-saved-answer ng-switch-when=\"saved-answer\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-saved-answer>\n" +
    "        <bk-aggregated-worksheet-editor ng-switch-when=\"aggregated-worksheet\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-aggregated-worksheet-editor>\n" +
    "        <bk-answer-replay ng-switch-when=\"answer-replay\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-answer-replay>\n" +
    "        <bk-home ng-switch-when=\"home\" bk-ctrl=\"innerCtrl\" class=\"bk-vertical-flex-container-sized\"></bk-home>\n" +
    "        <bk-pinboard-reports-list bk-ctrl=\"innerCtrl\" ng-switch-when=\"schedules\" class=\"bk-vertical-flex-container-sized\">\n" +
    "        </bk-pinboard-reports-list>\n" +
    "        <bk-schedule-report bk-ctrl=\"innerCtrl\" ng-switch-when=\"schedule\" class=\"bk-vertical-flex-container-sized\">\n" +
    "        </bk-schedule-report>\n" +
    "        <bk-slack-register class=\"bk-vertical-flex-container-sized\" bk-ctrl=\"innerCtrl\" ng-switch-when=\"slack-register\">\n" +
    "        </bk-slack-register>\n" +
    "        <bk-related-link class=\"bk-vertical-flex-container-sized\" bk-ctrl=\"innerCtrl\" ng-switch-when=\"related-link\">\n" +
    "        </bk-related-link>\n" +
    "        <bk-user-preference class=\"bk-vertical-flex-container-sized\" bk-ctrl=\"innerCtrl\" ng-switch-when=\"user-preference\">\n" +
    "        </bk-user-preference>\n" +
    "\n" +
    "        <div ng-switch-default class=\"bk-vertical-flex-container-sized\">\n" +
    "            <div class=\"bk-vertical-flex-container-sized\" ng-include=\"canvasUrl[canvasState]\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"showDebugModeBanner && !forceHideDebugBanner\" class=\"bk-debug-banner\">\n" +
    "        <div class=\"bk-text-red\">{{strings.Version_info}}</div>\n" +
    "        <div class=\"bk-text-white\"><span>{{strings.gitcommit}}</span>{{ debugInfo.commitId }}</div>\n" +
    "        <div class=\"bk-text-white\"><span>{{strings.gitbranch}}</span>{{ debugInfo.gitBranch }}</div>\n" +
    "        <div class=\"bk-text-white\"><span>{{strings.built_on}}</span>{{ debugInfo.timestamp }}</div>\n" +
    "        <div class=\"bk-close\" ng-click=\"forceHideDebugBanner = true\">&times;</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/base/app-canvas/pages/insight.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-canvas/pages/insight.html",
    "<pinboard-page class=\"bk-vertical-flex-container-sized\" is-insights-pinboard=\"true\">\n" +
    "</pinboard-page>");
}]);

angular.module("src/base/app-canvas/pages/pinboard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-canvas/pages/pinboard.html",
    "<pinboard-page class=\"bk-vertical-flex-container-sized\">\n" +
    "</pinboard-page>");
}]);

angular.module("src/base/app-canvas/pages/schema-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-canvas/pages/schema-viewer.html",
    "<div class=\"bk-full-screen-mode-container\">\n" +
    "    <graph-viewer class=\"bk-vertical-flex-container-sized\">\n" +
    "    </graph-viewer>\n" +
    "</div>");
}]);

angular.module("src/base/app-canvas/pages/worksheet.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-canvas/pages/worksheet.html",
    "<div worksheet-page class=\"bk-vertical-flex-container-sized\"></div>");
}]);

angular.module("src/base/app-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app-page.html",
    "<div ng-switch on=\"getEffectivePage()\" class=\"bk-app-content bk-app-background-customizable\" ng-class=\"{ 'bk-content-login': isLoginPage(),\n" +
    "                 'bk-embedded': isEmbedPage()}\">\n" +
    "\n" +
    "    <div ng-switch-when=\"login\" class=\"bk-page-wrapper\">\n" +
    "        <bk-login bk-ctrl=\"loginComponent\"></bk-login>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"embed\" class=\"bk-embed-page\">\n" +
    "        <blink-embed class=\"bk-vertical-flex-container-sized\"></blink-embed>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"print\" class=\"bk-print-page\" ng-if=\"!!printViewComponent\">\n" +
    "        <bk-print-view bk-ctrl=\"printViewComponent\"></bk-print-view>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"app-canvas\" ng-hide=\"$root.waitForRefresh\" class=\"bk-page-wrapper\">\n" +
    "        \n" +
    "        <div blink-nav ng-if=\"canShowNavBar()\" class=\"bk-primary-nav-container\"></div>\n" +
    "\n" +
    "        \n" +
    "        <div blink-app-canvas></div>\n" +
    "\n" +
    "        <bk-powered-footer class=\"bk-powered-by-ts-ribbon\" ng-if=\"showPoweredByRibbon()\" bk-ctrl=\"poweredFooterComponent\"></bk-powered-footer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/base/app.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/app.html",
    "<blink-app-page ng-if=\"$ctrl.isAppInitialised()\" class=\"bk-app-container\">\n" +
    "</blink-app-page>");
}]);

angular.module("src/base/empty-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/base/empty-template.html",
    "<div></div>");
}]);

angular.module("src/common/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/alert/alert.html",
    "<div class=\"bk-alert alert\" ng-class=\"['bk-alert-' + type]\" ng-show=\"!hidden\">\n" +
    "    <button type=\"button\" ng-show=\"canClose()\" class=\"bk-close close\" ng-click=\"onCloseAlertAction()\">&times;</button>\n" +
    "    <span class=\"bk-preamble-text\">\n" +
    "        <span class=\"bk-icon bk-success\" ng-if=\"type=='success'\"></span>\n" +
    "        <span class=\"bk-icon bk-problem\" ng-if=\"type=='problem'\"></span>\n" +
    "        <span class=\"bk-icon bk-error\" ng-if=\"type=='error'\"></span>\n" +
    "    </span>\n" +
    "    <span class=\"bk-text\" ng-show=\"formattedMessageUrl\" ng-include=\"formattedMessageUrl\"></span>\n" +
    "    <span class=\"bk-text\" ng-hide=\"formattedMessageUrl\">{{message}}</span>\n" +
    "    <a class=\"bk-text bk-action-link\" ng-click=\"handleAction()\" href=\"{{action.link}}\" ng-if=\"shouldShowActionMessageLink()\">\n" +
    "       {{action.message}}\n" +
    "    </a>\n" +
    "\n" +
    "    <span class=\"bk-text bk-link\" ng-click=\"handleAction()\" ng-if=\"shouldShowActionMessage()\">\n" +
    "      {{action.message}}\n" +
    "    </span>\n" +
    "\n" +
    "    <div class=\"bk-link\" ng-if=\"hasDetails()\" ng-click=\"toggleDetails()\">\n" +
    "        {{ strings.alerts.WHAT_HAPPENED }}\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-show=\"showDetails\" class=\"bk-details\">\n" +
    "        <div ng-if=\"!!customUrl\" ng-include=\"customUrl\"></div>\n" +
    "        <div ng-if=\"!!details\" class=\"bk-detail-header\">{{details}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/alert/templates/api-alert-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/alert/templates/api-alert-template.html",
    "<div>\n" +
    "    <div ng-if=\"customData.detailMessage\">{{customData.detailMessage}}</div>\n" +
    "    <span class=\"bk-details-left-column\">\n" +
    "        <div class=\"bk-details-key-value\" ng-repeat=\"nameValuePair in customData.leftColumnPairs\">\n" +
    "            <span class=\"bk-details-key\">{{nameValuePair.name}}: </span>\n" +
    "            <span class=\"bk-details-value\">{{nameValuePair.value}}</span>\n" +
    "        </div>\n" +
    "    </span>\n" +
    "    <span class=\"fr\">\n" +
    "        <div class=\"bk-details-key-value\" ng-repeat=\"nameValuePair in customData.rightColumnPairs\">\n" +
    "            <span class=\"bk-details-key\">{{nameValuePair.name}}: </span>\n" +
    "            <span class=\"bk-details-value\">{{nameValuePair.value}}</span>\n" +
    "        </div>\n" +
    "    </span>\n" +
    "    <div ng-if=\"!!customData.traceId\" class=\"bk-details-footer\">\n" +
    "        <span class=\"fl\">\n" +
    "            <a ng-click=\"customData.downloadTrace(traceId)\">{{customData.downloadTraceText}}</a>\n" +
    "        </span>\n" +
    "        <span class=\"fr\">\n" +
    "            <a ng-click=\"customData.emailTrace(traceId)\">{{customData.reportProblemText}}</a>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/alert/templates/missing-document-alert-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/alert/templates/missing-document-alert-template.html",
    "<div>\n" +
    "    <div class=\"bk-detail-header\" ng-if=\"customData.detailMessage\">{{customData.detailMessage}}</div>\n" +
    "\n" +
    "    <div class=\"bk-detail-content\">\n" +
    "        <div ng-repeat=\"detail in customData.incompleteDetails\" class=\"bk-detail-block\">\n" +
    "            <div class=\"bk-name\"><span>{{strings.Name}}</span>{{detail.header.name}}</div>\n" +
    "            <div>\n" +
    "                <span class=\"bk-key\">{{strings.Type}}</span>\n" +
    "                <span class=\"bk-value\">{{customData.getDisplayNameForMetadataTypeName(detail.type)}}</span>\n" +
    "                <span class=\"bk-key\">{{strings.Id}}</span>\n" +
    "                <span class=\"bk-value\">{{detail.header.id}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <span class=\"bk-details-key-value\" ng-repeat=\"nameValuePair in customData.nameValuePairs\" ng-class=\"{'fr': ($index % 2)}\">\n" +
    "        <span class=\"bk-details-key\">{{nameValuePair.name}}: </span>\n" +
    "        <span class=\"bk-details-value\">{{nameValuePair.value}}</span>\n" +
    "    </span>\n" +
    "\n" +
    "    <div ng-if=\"!!customData.traceId\" class=\"bk-details-footer\">\n" +
    "        <a class=\"fl\" ng-click=\"customData.downloadTrace(traceId)\">{{strings.Download_Trace}}</a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/list/actionable-list/actionable-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/list/actionable-list/actionable-list.html",
    "<div class=\"bk-actionable-list\" ng-switch=\"listModel.hasNoData()\">\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-no-content\">\n" +
    "        <div class=\"bk-no-content-icon\"></div>\n" +
    "        <div class=\"bk-no-content-label\">\n" +
    "            {{listModel.getTitle()}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-no-content-message\">{{ listModel.noContentMessage}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-actionable-list-content\">\n" +
    "        <div class=\"bk-list-bulk-actions\">\n" +
    "            \n" +
    "            <div class=\"bk-action-container\" ng-if=\"!swapHeaderItems\">\n" +
    "                <div class=\"bk-action-item {{ action.class }}\" ng-repeat=\"action in actionItems\">\n" +
    "                    <bk-secondary-button text=\"{{ action.text }}\" icon=\"{{ action.icon }}\" is-disabled=\"isActionItemDisabled(action)\" ng-click=\"onActionItemClick(action)\">\n" +
    "                    </bk-secondary-button>\n" +
    "                    <div ng-include=\"action.accessoryContentUrl\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div class=\"bk-pagination\" ng-if=\"listModel.isPaginated()\">\n" +
    "                <div class=\"bk-pagination-btn bk-prev\" ng-class=\"{'bk-disabled': !listModel.hasPrevPage()}\" ng-click=\"listModel.onPrevClick()\">\n" +
    "                </div>\n" +
    "                <div class=\"bk-pagination-btn bk-next\" ng-class=\"{'bk-disabled': !listModel.hasNextPage()}\" ng-click=\"listModel.onNextClick()\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"listModel.canShowTitle()\" class=\"bk-title\">{{ listModel.getTitle() }}</div>\n" +
    "            \n" +
    "            <div class=\"bk-list-search\" ng-class=\"{ 'bk-swap-action-item' : swapHeaderItems }\">\n" +
    "                <input type=\"text\" class=\"bk-search-input\" blink-on-enter=\"onEnterCallback()\" placeholder=\"search by name\" ng-model=\"listModel.searchText\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        \n" +
    "        <blink-list model=\"listModel\" on-column-click=\"onColumnClicked\" on-render-complete=\"onRenderComplete\">\n" +
    "        </blink-list>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/list/list/list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/list/list/list.html",
    "<div class=\"bk-list\">\n" +
    "    \n" +
    "    <div class=\"bk-list-header\" ng-show=\"!!model.isHeaderEnabled()\">\n" +
    "        <div class=\"bk-select-all-checkbox\" ng-show=\"model.isSelectionEnabled()\">\n" +
    "            <bk-checkbox bk-ctrl=\"selectAllCheckbox\"></bk-checkbox>\n" +
    "        </div>\n" +
    "        <div class=\"{{ column.class}} bk-column-title\" ng-repeat=\"column in model.getColumns()\" ng-show=\"!column.hidden\" ng-class=\"{'bk-clickable': !!column.sortBy}\" ng-click=\"setSortingColumn(column, $index)\">\n" +
    "            <div class=\"bk-column-title-text\">\n" +
    "                {{ column.label }}\n" +
    "            </div>\n" +
    "            <div class=\"bk-sort-indicator\" ng-if=\"sortColIdx == $index\" ng-class=\"{'slick-sort-indicator-desc': model.isSortedReverse(), 'slick-sort-indicator-asc': !model.isSortedReverse()}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-list-content\" vs-repeat=\"55\">\n" +
    "        \n" +
    "        <li ng-repeat=\"row in model.getFilteredData() | orderBy:sortBy:sortReverse\" ng-class=\"{'bk-row-selected-bg' : row._selected}\" post-repeat=\"onRenderComplete\">\n" +
    "            <div ng-if=\"model.isGrouped() && model.showGroupMarker($index)\">\n" +
    "                <div ng-include=\"model.groupMarkerTemplate\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-row-flex\">\n" +
    "                <div ng-show=\"model.isSelectionEnabled()\" class=\"bk-item-selector-checkbox\">\n" +
    "                    <bk-checkbox bk-ctrl=\"getItemCheckboxCtrl(row)\"></bk-checkbox>\n" +
    "                </div>\n" +
    "                <div class=\"{{column.class}} bk-column\" ng-repeat=\"column in model.getColumns()\" ng-click=\"onColumnClick(column, row, $event)\" ng-show=\"!column.hidden\">\n" +
    "                    <div ng-include=\"column.templateUrl\" ng-if=\"!!column.templateUrl\" include-replace></div>\n" +
    "                    <div blink-bind-and-compile=\"column.template\" ng-if=\"!!column.template\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/loading-indicator/loading-indicator-overlay.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/loading-indicator/loading-indicator-overlay.html",
    "<div class=\"bk-loading-indicator-overlay\">\n" +
    "    <div class=\"bk-loading-indicator-box\">\n" +
    "        <div blink-loading-indicator></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/loading-indicator/loading-indicator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/loading-indicator/loading-indicator.html",
    "<div class=\"bk-loading-indicator\">\n" +
    "    <div class=\"bk-loading-message\">\n" +
    "        <span class=\"bk-loading-message-text\" ng-if=\"!!loadingText\">{{ loadingText }}</span>\n" +
    "        <div class=\"bk-loader\">\n" +
    "            <div class=\"bk-dot dot1\"></div>\n" +
    "            <div class=\"bk-dot dot2\"></div>\n" +
    "            <div class=\"bk-dot dot3\"></div>\n" +
    "            <div class=\"bk-dot dot4\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/new-button-dropdown/new-button-dropdown.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/new-button-dropdown/new-button-dropdown.html",
    "<div class=\"bk-new-item-container {{ menu.css }}\" blink-tooltip=\"{{ menu.tooltip }}\" blink-overlay=\"hideNewButtonDropdown()\">\n" +
    "    <bk-primary-button text=\"{{ getTitle() }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"onClick()\"></bk-primary-button>\n" +
    "    <div ng-show=\"showNewButtonDropdown\" class=\"bk-new-button-dropdown\">\n" +
    "        <div class=\"bk-new-action-item\" ng-class=\"{'bk-disabled': action.isDisabled()}\" ng-repeat=\"action in menu.actions\" ng-click=\"onMenuClick(action)\" blink-tooltip=\"{{ getTooltip(action) }}\">\n" +
    "            {{ action.title }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/paged-repeat/paged-repeat-expand-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/paged-repeat/paged-repeat-expand-button.html",
    "<div class=\"bk-repeat-view-all\" ng-show=\"showExpansionButton()\" ng-class=\"{'bk-small-mode': list.smallMode}\">\n" +
    "    <span ng-switch=\"!!isFetching\">\n" +
    "        <span ng-switch-when=\"true\">\n" +
    "             <div class=\"bk-repeat-loading-indicator\"></div>\n" +
    "        </span>\n" +
    "        <span ng-switch-when=\"false\">\n" +
    "            <span ng-show=\"showAllInSecondPage\">{{ viewAllButtonText || ('View all' + ' ' + model.length) }}</span>\n" +
    "            <span ng-show=\"!showAllInSecondPage\">{{ viewAllButtonText || 'View more' }}</span>\n" +
    "            <span class=\"bk-expand-btn-light-bg bk-arrow-expanded\"></span>\n" +
    "        </span>\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/common/relationship/relationship-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/relationship/relationship-editor.html",
    "<div class=\"bk-relationship-editor\">\n" +
    "    <div class=\"bk-relationship-header\">\n" +
    "        <div class=\"bk-autogrow-block\"></div>\n" +
    "        <div class=\"bk-relationship-name-header\">\n" +
    "            <div>{{strings.Relationship_Name}}</div>\n" +
    "            <div class=\"bk-document-title bk-editable-title bk-relationship-title\">\n" +
    "                <div blink-content-editable fullspan ng-model=\"config.name\" description=\"config.desc\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <div>{{strings.Destination_Table}}</div>\n" +
    "            <ui-select ng-model=\"config.destinationTable\" theme=\"select2\" class=\"bk-select-destination-table\">\n" +
    "                <ui-select-match placeholder=\"Destination table\">{{$select.selected.name}}</ui-select-match>\n" +
    "                <ui-select-choices repeat=\"table in config.destinationTableOptions | filter: $select.search\">\n" +
    "                   <div blink-tooltip=\"{{getTooltipHtml(table)}}\" data-html=\"true\" data-delay=\"{&quot;show&quot;:&quot;250&quot;}\" data-placement=\"right\">\n" +
    "                        {{table.name}}\n" +
    "                   </div>\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </div>\n" +
    "        <div class=\"bk-autogrow-block\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-column-relationships\">\n" +
    "        <div class=\"bk-source\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <ui-select ng-model=\"config.newSourceColumn\" theme=\"select2\" class=\"bk-select-source-column\">\n" +
    "                    <ui-select-match placeholder=\"Source column\">{{$select.selected.name}}</ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in config.sourceColumnOptions | filter: $select.search\">\n" +
    "                        {{column.name}}\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </div>\n" +
    "\n" +
    "            <ul class=\"bk-column-list\" ng-show=\"!!config.sourceColumns.length\">\n" +
    "                <li class=\"bk-column-cell\" ng-repeat=\"row in config.sourceColumns track by $index\" ng-mouseenter=\"config.currentHighlightedIndex = $index\" ng-mouseleave=\"config.currentHighlightedIndex = -1\" ng-class=\"{'bk-hovered': (config.currentHighlightedIndex === $index)}\">\n" +
    "                    {{ row.name }}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-link-ui\" ng-class=\"{'bk-success': isLinked()}\">\n" +
    "            <div class=\"bk-link-left\"></div>\n" +
    "            <div class=\"bk-link-icon-container\">\n" +
    "                <div class=\"bk-link-icon\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-link-right\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-target\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <div ng-if=\"config.destinationColumnOptions.length\">\n" +
    "                    <ui-select ng-model=\"config.newDestinationColumn\" theme=\"select2\" class=\"bk-select-destination-column\">\n" +
    "                        <ui-select-match placeholder=\"Destination column\">{{$select.selected.name}}</ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"column in config.destinationColumnOptions | filter: $select.search\">\n" +
    "                            {{column.name}}\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"chosen-container chosen-container-single chosen-disabled\" ng-if=\"!config.destinationColumnOptions.length\">\n" +
    "                    <div class=\"chosen-single\">\n" +
    "                        <span>{{strings.No_values}}</span>\n" +
    "                        <div><b></b></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <ul class=\"bk-column-list\" ng-show=\"!!config.destinationColumns.length\">\n" +
    "                <li class=\"bk-column-cell\" ng-repeat=\"row in config.destinationColumns track by $index\" ng-mouseenter=\"config.currentHighlightedIndex = $index\" ng-mouseleave=\"config.currentHighlightedIndex = -1\" ng-class=\"{'bk-hovered': (config.currentHighlightedIndex === $index)}\">\n" +
    "                    {{ row.name }}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"buttons\">\n" +
    "        <bk-secondary-button text=\"{{ relationshipEditorMessages.ADD_KEY }}\" icon=\"bk-style-icon-small-plus\" is-disabled=\"!isCompositeKeyValid()\" ng-click=\"addCompositeKey()\" class=\"bk-add-key-button\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ relationshipEditorMessages.ADD_RELATIONSHIP }}\" icon=\"bk-style-icon-small-plus\" is-disabled=\"!isValidRelationship()\" ng-click=\"addRelationship()\" class=\"bk-add-relationship-button\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ strings.CANCEL }}\" ng-if=\"hasExistingRelationships()\" ng-click=\"goToRelationshipViewer()\" class=\"bk-cancel-relationship-edits\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/relationship/relationship-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/relationship/relationship-list.html",
    "<div class=\"bk-relationship-list\" ng-class=\"{'bk-loading': isLoading}\">\n" +
    "    <div ng-if=\"!!tableModel\">\n" +
    "        <relationship-editor ng-if=\"!!inAddRelationshipMode\" source-table-model=\"tableModel\" source-ids=\"sourceIds\" is-ad-hoc-relationship-builder=\"isAdHocRelationshipBuilder\" should-own-target=\"shouldOwnTarget\" sage-context=\"sageContext\">\n" +
    "        </relationship-editor>\n" +
    "        <relationship-viewer ng-if=\"!inAddRelationshipMode\" ng-repeat=\"relationship in relationships\" relationship=\"relationship\" destination-table-model=\"relationship.destinationTableModel\" source-table-model=\"tableModel\" is-read-only=\"isReadOnlyRelationship(relationship)\" is-ad-hoc-relationship-builder=\"isAdHocRelationshipBuilder\" sage-context=\"sageContext\">\n" +
    "        </relationship-viewer>\n" +
    "        <bk-secondary-button text=\"{{ addRelationshipMessage }}\" ng-if=\"showAddRelationshipBtn()\" ng-click=\"setRelationshipEditMode(true)\" class=\"bk-add-mode-btn\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "    <div ng-if=\"showIsEmpty()\" class=\"bk-no-content\">\n" +
    "        <div class=\"bk-no-content-icon\"></div>\n" +
    "        <div class=\"bk-no-content-label\">\n" +
    "            {{ emptyMessage }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/relationship/relationship-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/relationship/relationship-popup.html",
    "<div class=\"bk-big-popup\" table-id=\"tableId\" source-ids=\"sourceIds\" is-ad-hoc-relationship-builder=\"isAdHocRelationshipBuilder\" sage-context=\"sageContext\" hide=\"hide\">\n" +
    "    <div class=\"bk-context-dialog\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <span class=\"bk-header-title\">{{strings.Relationship_Builder}}</span>\n" +
    "            <a type=\"button\" class=\"bk-close\" ng-click=\"hide()\">&times;</a>\n" +
    "        </div>\n" +
    "        <relationship-list class=\"popup-content\" table-id=\"tableId\" source-ids=\"sourceIds\" is-ad-hoc-relationship-builder=\"isAdHocRelationshipBuilder\" sage-context=\"sageContext\">\n" +
    "        </relationship-list>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/relationship/relationship-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/relationship/relationship-viewer.html",
    "<div class=\"bk-relationship-viewer\">\n" +
    "\n" +
    "    <div class=\"bk-relationship-header\">\n" +
    "        <div class=\"key-value-pair\">\n" +
    "            <span class=\"key\">{{strings.Relationship_Name}}</span>\n" +
    "            <span ng-show=\"isAdHocRelationshipBuilder || !canChangeRelationshipName()\" class=\"value\">{{relationship.getName()}}</span>\n" +
    "            <div ng-show=\"!isAdHocRelationshipBuilder && canChangeRelationshipName()\" class=\"bk-relationship-title-container\">\n" +
    "                <div class=\"bk-document-title bk-editable-title bk-relationship-title\">\n" +
    "                    <div blink-content-editable fullspan ng-model=\"relationshipName\" description=\"relationshipDesc\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"key-value-pair\">\n" +
    "            <span class=\"key\">{{strings.Destination_Table}}</span>\n" +
    "            <span class=\"value\">{{destinationTableModel.getName()}}</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-column-relationships\">\n" +
    "        <div class=\"bk-source\">\n" +
    "            <div class=\"title\">{{strings.SOURCE_COLUMN}}</div>\n" +
    "\n" +
    "            <ul class=\"bk-column-list\">\n" +
    "                <li class=\"bk-column-cell\" ng-repeat=\"row in relationship.getSourceColumnIds() track by $index\" ng-mouseenter=\"relationship.currentHighlightedIndex = $index\" ng-mouseleave=\"relationship.currentHighlightedIndex = -1\" ng-class=\"{'bk-hovered': (relationship.currentHighlightedIndex === $index)}\">\n" +
    "                    {{getSourceColumnName(row)}}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-target\">\n" +
    "            <div class=\"title\">{{strings.DESTINATION_COLUMN}}</div>\n" +
    "            <ul class=\"bk-column-list\">\n" +
    "                <li class=\"bk-column-cell\" ng-repeat=\"row in relationship.getDestinationColumnIds() track by $index\" ng-mouseenter=\"relationship.currentHighlightedIndex = $index\" ng-mouseleave=\"relationship.currentHighlightedIndex = -1\" ng-class=\"{'bk-hovered': (relationship.currentHighlightedIndex === $index)}\">\n" +
    "                    {{getDestinationColumnName(row)}}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-actions-relationship\">\n" +
    "        <bk-secondary-button text=\"{{ strings.DELETE }}\" ng-if=\"!isReadOnly && canChangeRelationshipName()\" ng-click=\"deleteRelationship()\" class=\"bk-delete-relationship-btn\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ strings.UPDATE }}\" is-disabled=\"!hasRelationshipNameChanged()\" ng-if=\"!isAdHocRelationshipBuilder && canChangeRelationshipName()\" ng-click=\"updateRelationshipName()\" class=\"bk-update-relationship-btn\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/tree-menu/tree-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/tree-menu/tree-menu.html",
    "<div class=\"bk-tree-menu\">\n" +
    "    <div class=\"bk-tree-levels\">\n" +
    "        <div class=\"bk-tree-level\" ng-repeat=\"widthFraction in spaceDistribution\" style=\"width:{{ widthFraction * 100 }}%\">\n" +
    "            <ul>\n" +
    "                <li class=\"bk-tree-item\" ng-repeat=\"value in (formattedValuesForLevels[$index] || [])\">\n" +
    "                    <span class=\"bk-tree-item-value\" ng-click=\"selectNode($parent.$index, $index)\" ng-class=\"{'selected': isSelectedItem($parent.$index, $index)}\" ng-switch=\"!!value.templateUrl\">\n" +
    "                        <span ng-switch-when=\"true\" ng-include=\"value.templateUrl\" ng-init=\"data = value.data\"></span>\n" +
    "                        <span ng-switch-when=\"false\" ng-bind-html=\"value\"></span>\n" +
    "                    </span>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/accordion-list-viewer/accordion-list-viewer-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/accordion-list-viewer/accordion-list-viewer-item.html",
    "<div class=\"list-item-header\" ng-click=\"$ctrl.click()\">\n" +
    "                        <span class=\"bk-expand-btn-light-bg\" ng-class=\"{'bk-arrow-collapsed': !$ctrl.isClicked(),\n" +
    "                          'bk-arrow-expanded': !!$ctrl.isExpanded()}\"></span>\n" +
    "    <div class=\"heading\">{{$ctrl.header}}</div>\n" +
    "</div>\n" +
    "<div class=\"list-item-description\" ng-class=\"{expand: $ctrl.isExpanded()}\" ng-if=\"!!$ctrl.description\" ng-bind-html=\"$ctrl.description\">\n" +
    "</div>\n" +
    "<li class=\"bk-accordion-item\" ng-transclude>\n" +
    "\n" +
    "</li>");
}]);

angular.module("src/common/widgets/accordion-list-viewer/accordion-list-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/accordion-list-viewer/accordion-list-viewer.html",
    "<ul class=\"bk-accordion-list-viewer\" ng-transclude>\n" +
    "\n" +
    "</ul>");
}]);

angular.module("src/common/widgets/accordion/accordion-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/accordion/accordion-item.html",
    "<div class=\"bk-accordion-item-header\" ng-click=\"$ctrl.click()\">\n" +
    "    <div class=\"bk-accordion-btn\">\n" +
    "        <span class=\"bk-expand-btn-light-bg\" ng-class=\"{'bk-arrow-collapsed': !$ctrl.isExpanded(),\n" +
    "              'bk-arrow-expanded': !!$ctrl.isExpanded()}\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"bk-accordion-item-header-title\" ng-bind-html=\"$ctrl.header\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-accordion-item-description\" ng-class=\"{expand: $ctrl.isExpanded()}\" ng-if=\"!!$ctrl.description\" ng-bind-html=\"$ctrl.description\">\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-accordion-item-content\" ng-class=\"{expand: $ctrl.isExpanded()}\" ng-transclude>\n" +
    "");
}]);

angular.module("src/common/widgets/accordion/accordion-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/accordion/accordion-list.html",
    "<div class=\"bk-accordion-list\" ng-transclude>");
}]);

angular.module("src/common/widgets/action-confirmation-popup/action-confirmation-popup-content.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/action-confirmation-popup/action-confirmation-popup-content.html",
    "<div class=\"bk-auto-popup bk-opens-right\">\n" +
    "    <div class=\"bk-container bk-bigger\">\n" +
    "        <span class=\"bk-popup-text\" ng-bind-html=\"popupText\"></span>\n" +
    "        <div class=\"bk-action-buttons\" ng-class=\"{'bk-has-suppress-option': showSuppressOption}\">\n" +
    "            <bk-secondary-button text=\"{{ cancelButtonText || strings.CANCEL }}\" ng-click=\"onCancel($event)\" class=\"bk-cancel-btn\"></bk-secondary-button>\n" +
    "            <bk-primary-button text=\"{{ actionButtonText || strings.OK }}\" ng-click=\"onAction($event)\" class=\"bk-save-btn\"></bk-primary-button>\n" +
    "        </div>\n" +
    "        <div class=\"bk-popup-text\">\n" +
    "            <bk-checkbox bk-ctrl=\"dontShowAgainCheckboxCtrl\"></bk-checkbox>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/action-links-list/action-links-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/action-links-list/action-links-list.html",
    "<div class=\"bk-actions-lists\">\n" +
    "    <div class=\"bk-action\" ng-repeat=\"action in $ctrl.actionLinksList\">\n" +
    "        <a ng-click=\"$ctrl.onClick($index)\">\n" +
    "            <span>{{action.text}}</span>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/action-menu/action-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/action-menu/action-menu.html",
    "<div class=\"bk-action-menu\">\n" +
    "    <div ng-repeat=\"action in $ctrl.menuItems\">\n" +
    "        <div ng-if=\"$ctrl.shouldShowItem(action)\">\n" +
    "            <div class=\"bk-dropdown-item {{ action.class }}\" ng-if=\"!action.customContent\" ng-class=\"{'bk-dropdown-item-disabled' : $ctrl.isItemDisabled(action)}\" blink-tooltip=\"{{ $ctrl.getDisabledTooltip(action) }}\" ng-click=\"$ctrl.onMenuItemClick(action, $event)\">\n" +
    "                <div class=\"bk-dropdown-icon\">\n" +
    "                    <span class=\"{{ action.icon }}\"></span>\n" +
    "                </div>\n" +
    "                <div class=\"bk-dropdown-text\">{{ action.label }}</div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-dropdown-item {{action.class}}\" ng-if=\"!!action.customContent\" blink-bind-and-compile=\"action.customContent\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/add-new-item/add-new-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/add-new-item/add-new-item.html",
    "<div class=\"bk-add-new-item\" ng-switch=\"currentState\" class=\"size4of5\">\n" +
    "     <div ng-switch-when=\"SHOW_SPINNER\" class=\"bk-spinner\">\n" +
    "         <div class=\"bk-indicator bk-loading\"></div>\n" +
    "     </div>\n" +
    "     <a ng-switch-when=\"SHOW_ADD_BTN\" class=\"bk-add-label\" ng-click=\"onAddBtnClick()\" ng-transclude></a>\n" +
    "     <div ng-switch-when=\"SHOW_NAME_INPUT\">\n" +
    "         <input type=\"text\" class=\"bk-input\" ng-class=\"{'bk-input-error': !!inputError}\" ng-model=\"newItem.name\" ng-change=\"onTextChange()\" blink-on-tab=\"onComplete()\" blink-on-escape=\"moveStateTo('SHOW_ADD_BTN')\" blink-on-enter=\"onComplete()\">\n" +
    "         <div ng-show=\"!!inputError\" class=\"bk-error-message\">\n" +
    "             {{inputError}}\n" +
    "         </div>\n" +
    "     </div>\n" +
    " </div>");
}]);

angular.module("src/common/widgets/auto-hide/auto-hide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/auto-hide/auto-hide.html",
    "<div class=\"bk-auto-hide\" ng-show=\"$ctrl.isShowing()\">\n" +
    "    <div ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/blob/blob-uploader/blob-uploader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/blob/blob-uploader/blob-uploader.html",
    "<div class=\"bk-blob-uploader\">\n" +
    "    <div class=\"bk-blob-uploader-content\">\n" +
    "        <div class=\"bk-blob-uploader-overlay\">\n" +
    "            <div class=\"bk-blob-uploader-overlay-content\">\n" +
    "                <fieldset class=\"bk-blob-uploader-drop-zone\">\n" +
    "                    <input class=\"bk-blob-uploader-file-input\" type=\"file\" name=\"content\" title=\"\" blink-on-change=\"$ctrl.updateFile($event.target.files[0])\">\n" +
    "                </fieldset>\n" +
    "                <div class=\"bk-blob-uploader-overlay-upload-button-container\">\n" +
    "                    <bk-icon-button icon=\"bk-style-icon-upload\" tooltip=\"$ctrl.getUploadFileActionText()\" is-borderless=\"true\"></bk-icon-button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-transclude></div>\n" +
    "    </div>\n" +
    "    <bk-auto-hide class=\"bk-blob-uploader-error\" bk-ctrl=\"$ctrl.getAutoHideErrorMessageComponent()\">\n" +
    "        <span class=\"bk-blob-uploader-error-message\">{{ $ctrl.getError() }}</span>\n" +
    "    </bk-auto-hide>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/blob/image-blob-editor/image-blob-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/blob/image-blob-editor/image-blob-editor.html",
    "<div class=\"bk-image-blob-editor\">\n" +
    "    <bk-blob-uploader bk-ctrl=\"$ctrl.getBlobUploaderComponent()\">\n" +
    "        <div class=\"bk-image-blob-editor-preview\">\n" +
    "            <bk-image-view bk-ctrl=\"$ctrl.getImageViewComponent()\"></bk-image-view>\n" +
    "        </div>\n" +
    "    </bk-blob-uploader>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/buttons/action-button-dropdown/action-button-dropdown.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/buttons/action-button-dropdown/action-button-dropdown.html",
    "<div class=\"bk-dropdown-button-wrapper bk-button-wrapper\" blink-on-escape=\"closeDropdown()\" ng-show=\"hasAnyActionItem()\">\n" +
    "    <div ng-switch=\"state.showActionDropdownMenu\" class=\"bk-button-switch\">\n" +
    "        <div ng-switch-when=\"true\" ng-class=\"{active: state.showMenu}\" class=\"bk-button-switch-when\">\n" +
    "            <bk-button button-class=\"{{ buttonClass }}\" button-text=\"{{ buttonText }}\" button-icon=\"{{icon}}\" uib-popover-template=\"'action-dropdown'\" popover-class=\"bk-action-dropdown\" popover-placement=\"{{menu.placement || 'auto bottom-right'}}\" popover-trigger=\"none\" popover-is-open=\"state.showMenu\" ng-click=\"toggleDropdown()\" popover-append-to-body=\"true\"></bk-button>\n" +
    "            <div ng-if=\"showLoading()\" class=\"bk-action-progress\">\n" +
    "                <div class=\"bk-in-progress\">\n" +
    "                    <div class=\"bk-dot dot1\"></div>\n" +
    "                    <div class=\"bk-dot dot2\"></div>\n" +
    "                    <div class=\"bk-dot dot3\"></div>\n" +
    "                    <div class=\"bk-dot dot4\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"false\">\n" +
    "            <bk-secondary-button text=\"{{ menu.actions[0].label }}\" icon=\"{{ menu.actions[0].icon }}\" is-disabled=\"menu.actions[0].dropdownItemDisabled\" ng-click=\"menu.actions[0].onClick();\">\n" +
    "            </bk-secondary-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"action-dropdown\">\n" +
    "        <div blink-overlay=\"closeDropdown()\"\n" +
    "             ng-click=\"closeDropdown()\"\n" +
    "             ignore-click-selector=\"['.bk-dropdown-button-wrapper .active']\">\n" +
    "            <bk-action-menu bk-ctrl=\"actionMenu\"></bk-action-menu>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/buttons/base-button/button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/buttons/base-button/button.html",
    "<div class=\"{{ buttonClass }} bk-button-body\" ng-class=\"{'bk-disabled-button': isDisabled,\n" +
    "                'bk-selected-button' : isSelected,\n" +
    "                'bk-button-text-icon': buttonIcon && buttonText,\n" +
    "                'bk-borderless-button': isBorderless,\n" +
    "                'bk-reverse-text-icon': reverseTextIcon}\" blink-tooltip=\"{{ setTooltip(buttonTooltip) }}\" data-placement=\"{{ buttonTooltipPlacement }}\">\n" +
    "    <div ng-if=\"!isBusy\" class=\"bk-button-icon-text\">\n" +
    "        <div ng-if=\"buttonIcon\" class=\"bk-icons {{ buttonIcon }}\"></div>\n" +
    "        <div ng-if=\"buttonText\" class=\"bk-text\">{{ buttonText }}</div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!!isBusy\" class=\"bk-button-loading-indicator\">\n" +
    "        <div class=\"bk-in-progress\">\n" +
    "            <div class=\"bk-dot dot1\"></div>\n" +
    "            <div class=\"bk-dot dot2\"></div>\n" +
    "            <div class=\"bk-dot dot3\"></div>\n" +
    "            <div class=\"bk-dot dot4\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/buttons/icon-button/icon-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/buttons/icon-button/icon-button.html",
    "<div class=\"bk-button-wrapper\">\n" +
    "    <bk-button button-class=\"bk-icons-button\" button-icon=\"{{ icon }}\" button-tooltip=\"{{ tooltip }}\" is-disabled=\"isDisabled\" is-selected=\"isSelected\" is-borderless=\"isBorderless\"></bk-button>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/buttons/primary-button/primary-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/buttons/primary-button/primary-button.html",
    "<div class=\"bk-button-wrapper\">\n" +
    "    <bk-button button-class=\"bk-primary-button\" button-text=\"{{ text }}\" button-icon=\"{{ icon }}\" button-tooltip=\"{{ tooltip }}\" button-tooltip-placement=\"{{ tooltipPlacement }}\" is-disabled=\"isDisabled\" is-busy=\"isBusy\" reverse-text-icon=\"reverseTextIcon\"></bk-button>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/buttons/secondary-button/secondary-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/buttons/secondary-button/secondary-button.html",
    "<div class=\"bk-button-wrapper\">\n" +
    "    <bk-button button-class=\"bk-secondary-button\" button-text=\"{{ text }}\" button-icon=\"{{ icon }}\" button-tooltip=\"{{ tooltip }}\" button-tooltip-placement=\"{{ tooltipPlacement }}\" is-disabled=\"isDisabled\" is-busy=\"isBusy\" reverse-text-icon=\"reverseTextIcon\"></bk-button>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/carousel/carousel.html",
    "<div id=\"{{ carousel.carouselId }}\" class=\"carousel {{ carousel.carouselClass }}\" data-interval=\"false\">\n" +
    "\n" +
    "    \n" +
    "    <ol class=\"carousel-indicators\" ng-show=\"carousel.indicators\">\n" +
    "        <li data-target=\"#{{ carousel.carouselId }}\" class=\"slider-indicator\" ng-repeat=\"slide in carousel.slides\" data-slide-to=\"{{$index}}\" ng-class=\"{'active': slide.active }\"></li>\n" +
    "    </ol>\n" +
    "\n" +
    "    \n" +
    "    <span ng-show=\"carousel.prevBtn\" class=\"{{ carousel.prevBtnClass }}\" data-target=\"#{{ carousel.carouselId }}\" role=\"button\" data-slide=\"prev\">\n" +
    "        <span class=\"{{ carousel.prevIcon }} left\">{{ carousel.prevBtnLabel }}</span>\n" +
    "    </span>\n" +
    "    <span ng-show=\"carousel.nextBtn\" class=\"{{ carousel.nextBtnClass }}\" data-target=\"#{{ carousel.carouselId }}\" role=\"button\" data-slide=\"next\">\n" +
    "        <span class=\"{{ carousel.nextIcon }} right\">{{ carousel.nextBtnLabel }}</span>\n" +
    "    </span>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"carousel-inner\" role=\"listbox\">\n" +
    "        <div class=\"item\" ng-repeat=\"slide in carousel.slides\" ng-class=\"{'active': slide.active}\">\n" +
    "            <div ng-include=\"slide.contentUrl\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/carousel/templates/help-tip/advanced-search-tip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/carousel/templates/help-tip/advanced-search-tip.html",
    "<div class=\"deck advanced-search\">\n" +
    "    <div class=\"title\">{{strings.Ready_for}}</div>\n" +
    "    <div class=\"content\">\n" +
    "        <div>{{strings.You_can_do}}\n" +
    "</div>\n" +
    "        <a class=\"bk-btn-blue\" href=\"{{ mindTouchUrlKeywords }}\" target=\"_blank\">{{strings.View_Keywords}}</a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/carousel/templates/help-tip/choose-sources-tip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/carousel/templates/help-tip/choose-sources-tip.html",
    "<div class=\"deck choose-sources\">\n" +
    "    <div class=\"title\">{{strings.Whats_your}}</div>\n" +
    "    <div class=\"content\">\n" +
    "        <div>{{strings.To_begin_a}}\n" +
    "</div>\n" +
    "        <span class=\"bk-btn-blue\" ng-click=\"highlightChooseSources($event)\">{{strings.Show_me}}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/carousel/templates/help-tip/know-your-data-tip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/carousel/templates/help-tip/know-your-data-tip.html",
    "<div class=\"deck know-your-data\">\n" +
    "    <div class=\"title\">{{strings.Get_to_know}}</div>\n" +
    "    <div class=\"content\">\n" +
    "        <div>{{strings.Knowing_your_data}}\n" +
    "</div>\n" +
    "        <span class=\"bk-btn-blue\" ng-click=\"highlightColumnsPanel($event)\">{{strings.Show_me}}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/carousel/templates/help-tip/search-video-tip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/carousel/templates/help-tip/search-video-tip.html",
    "<div class=\"deck search-video\">\n" +
    "    <div class=\"title\">{{strings.Are_you}}</div>\n" +
    "    <div class=\"content\">\n" +
    "{{strings.This_video_shows}}\n" +
    "<iframe src=\"//fast.wistia.net/embed/iframe/ffg9r6ccbv?videoFoam=true\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\" class=\"wistia_embed\" name=\"wistia_embed\" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width=\"267\" height=\"150\"></iframe>\n" +
    "        <script src=\"//fast.wistia.net/assets/external/E-v1.js\"></script>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/checkbox-collection/checkbox-collection.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/checkbox-collection/checkbox-collection.html",
    "<div class=\"bk-checkbox-collection\">\n" +
    "    <bk-checkbox class=\"select-all-checkbox\" ng-if=\"$ctrl.allowSelectAll\" bk-ctrl=\"$ctrl.selectAllCBCtrl\">\n" +
    "    </bk-checkbox>\n" +
    "    <div ng-repeat=\"checkboxItemCtrl in $ctrl.checkboxItemCtrls\">\n" +
    "        <bk-checkbox bk-ctrl=\"checkboxItemCtrl\">\n" +
    "        </bk-checkbox>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/checkbox-collection/smart-checkbox-collection.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/checkbox-collection/smart-checkbox-collection.html",
    "<div class=\"bk-smart-checkbox-collection\">\n" +
    "    <div class=\"bk-checkbox-search\">\n" +
    "        <input type=\"text\" class=\"bk-search-input\" name=\"filter-input\" class=\"admin-list-filter\" placeholder=\"{{$ctrl.strings.CHECKBOX_SEARCH_PLACEHOLDER}}\" ng-change=\"$ctrl.doFilter()\" ng-model=\"$ctrl.checkboxFilterSearchText\">\n" +
    "    </div>\n" +
    "    <blink-loading-indicator ng-if=\"$ctrl.isLoading\" class=\"bk-smart-checkbox-loading-indicator\"></blink-loading-indicator>\n" +
    "    <div class=\"bk-checkbox-collections\" ng-if=\"!$ctrl.isLoading\" ng-switch=\"!!$ctrl.checkboxFilterSearchText\">\n" +
    "        <div ng-switch-when=\"false\">\n" +
    "            <div class=\"bk-smart-cb-bulk-action-container\" ng-if=\"!$ctrl.smartCheckboxCollectionConfig.hideBulkActions\">\n" +
    "                <div ng-class=\"{'bk-disabled': !$ctrl.showClearSelectedItems}\" class=\"bk-clear-selected-options\" ng-click=\"$ctrl.clearSelectedItems()\">\n" +
    "                    {{$ctrl.strings.CLEAR_SELECTED_ITEMS}}\n" +
    "                </div>\n" +
    "                <div ng-class=\"{'bk-disabled': !$ctrl.showSelectAllItems\n" +
    "                || $ctrl.smartCheckboxCollectionConfig.disallowSelectAll}\" blink-tooltip=\"{{$ctrl.smartCheckboxCollectionConfig.disallowSelectAllMsg}}\" class=\"bk-select-all-options\" ng-click=\"$ctrl.selectAllItems()\">\n" +
    "                    {{$ctrl.strings.SELECT_ALL_ITEMS}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"!!$ctrl.selectedCheckboxCollectionCtrl\" class=\"bk-checkbox-section\">\n" +
    "                <blink-checkbox-collection class=\"bk-selected-checkboxes\" bk-ctrl=\"$ctrl.selectedCheckboxCollectionCtrl\">\n" +
    "                </blink-checkbox-collection>\n" +
    "                <div ng-if=\"$ctrl.showSearchToFindMoreSelectedItems\" class=\"bk-search-selected-items-msg\">\n" +
    "                    {{$ctrl.strings.SEARCH_TO_FIND_MORE_SELECTED_ITEMS}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"$ctrl.unselectedCheckboxCollectionCtrl\" class=\"bk-checkbox-section\">\n" +
    "                <blink-checkbox-collection class=\"bk-unselected-checkboxes\" bk-ctrl=\"$ctrl.unselectedCheckboxCollectionCtrl\">\n" +
    "                </blink-checkbox-collection>\n" +
    "                <div ng-if=\"$ctrl.showSearchToFindMoreItems\" class=\"bk-search-unselected-items-msg\">\n" +
    "                    {{$ctrl.strings.SEARCH_TO_FIND_MORE_ITEMS}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"$ctrl.readOnlyCheckboxCollectionCtrl\" class=\"bk-checkbox-section\">\n" +
    "                <blink-checkbox-collection class=\"bk-readonly-checkboxes\" bk-ctrl=\"$ctrl.readOnlyCheckboxCollectionCtrl\">\n" +
    "                </blink-checkbox-collection>\n" +
    "                <div ng-if=\"$ctrl.showSearchToFindMoreReadOnlyItems\" class=\"bk-search-readonly-items-msg\">\n" +
    "                    {{$ctrl.strings.SEARCH_TO_FIND_MORE_READ_ONLY_ITEMS}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"true\">\n" +
    "            <div ng-if=\"!!$ctrl.searchedCheckboxCollectionCtrl\" class=\"bk-checkbox-section\">\n" +
    "                <blink-checkbox-collection class=\"bk-search-checkboxes\" bk-ctrl=\"$ctrl.searchedCheckboxCollectionCtrl\">\n" +
    "                </blink-checkbox-collection>\n" +
    "                <div ng-if=\"$ctrl.showRefineFurtherMessage\" class=\"bk-refine-search-msg\">\n" +
    "                    {{$ctrl.strings.SEARCH_TO_REFINE_ITEMS_FURTHER}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"!!$ctrl.searchedReadOnlyCheckboxCollectionCtrl\" class=\"bk-checkbox-section\">\n" +
    "                <blink-checkbox-collection class=\"bk-search-readonly-checkboxes\" bk-ctrl=\"$ctrl.searchedReadOnlyCheckboxCollectionCtrl\">\n" +
    "                </blink-checkbox-collection>\n" +
    "                <div ng-if=\"$ctrl.showReadOnlyRefineFurtherMessage\" class=\"bk-refine-search-readonly-msg\">\n" +
    "                    {{$ctrl.strings.SEARCH_TO_REFINE_ITEMS_FURTHER}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/checkbox/checkbox.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/checkbox/checkbox.html",
    "<div class=\"bk-checkbox-container\" ng-click=\"$ctrl.onClick($event)\" ng-class=\"{\n" +
    "       'bk-checked': $ctrl.stateGetter(),\n" +
    "       'bk-disabled': $ctrl.isReadOnly,\n" +
    "       'bk-partial': $ctrl.isPartialState()\n" +
    "     }\">\n" +
    "    <div class=\"bk-checkbox\" ng-class=\"{'bk-checked': $ctrl.stateGetter()}\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-checkbox-title\" ng-if=\"!!$ctrl.label\" ng-class=\"{'bk-overflow-ellipsis': $ctrl.shouldTruncate}\" data-html=\"true\" blink-tooltip=\"{{$ctrl.label}}\" ng-bind-html=\"$ctrl.label\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/click-effect/click-effect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/click-effect/click-effect.html",
    "<div class=\"bk-click-effect\"></div>");
}]);

angular.module("src/common/widgets/color-palette/color-palette-editor/color-palette-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/color-palette/color-palette-editor/color-palette-editor.html",
    "<div class=\"bk-color-palette-editor\">\n" +
    "    <ul class=\"bk-color-palette-editor-list\">\n" +
    "        <li ng-repeat=\"removableItem in $ctrl.getRemovableItems()\" class=\"bk-color-palette-editor-list-item\">\n" +
    "            <bk-removable bk-ctrl=\"removableItem\">\n" +
    "                <bk-color-configurator class=\"bk-color-palette-editor-color-configurator\" bk-ctrl=\"removableItem.getContainedComponent()\">\n" +
    "                </bk-color-configurator>\n" +
    "            </bk-removable>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/color-palette/color-palette-list-editor/color-palette-list-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/color-palette/color-palette-list-editor/color-palette-list-editor.html",
    "<div class=\"bk-color-palette-list-editor\">\n" +
    "    <ul class=\"bk-color-palette-list-editor-list\">\n" +
    "        <li ng-repeat=\"removableItem in $ctrl.getRemovableItems()\" class=\"bk-color-palette-list-editor-list-item\">\n" +
    "            <bk-removable bk-ctrl=\"removableItem\">\n" +
    "                <bk-color-palette-editor bk-ctrl=\"removableItem.getContainedComponent()\"></bk-color-palette-editor>\n" +
    "            </bk-removable>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/color-picker/color-picker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/color-picker/color-picker.html",
    "<div class=\"bk-color-picker\" ng-style=\"{'border-color': color}\" ng-click=\"onClick()\">\n" +
    "    <div class=\"bk-color-picker-fill\" ng-style=\"{'background-color': shouldFill() && color || 'transparent' }\"></div>\n" +
    "    <div class=\"bk-color-picker-anchor\"></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/column-metrics/column-metrics.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/column-metrics/column-metrics.html",
    "<div class=\"bk-column-metrics-widget\">\n" +
    "    <div class=\"bk-column-metric-add\" ng-if=\"$ctrl.isEditable\">\n" +
    "        <span class=\"bk-icon bk-clickable bk-style-icon-small-plus\" ng-click=\"$ctrl.addNewMetric()\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"bk-column-metrics-list\" ng-switch=\"$ctrl.hasNoMetrics()\">\n" +
    "        <div class=\"bk-column-metrics-defined\" ng-switch-when=\"false\">\n" +
    "            <div class=\"bk-column-metrics\">\n" +
    "                <div ng-if=\"!$ctrl.isEditable\" class=\"bk-filter-read-only bk-column-metric\">\n" +
    "                    {{strings.filtersMessages.READONLY}}\n" +
    "                </div>\n" +
    "                <div ng-repeat=\"metric in $ctrl.metricsEditBuffer.row\" class=\"bk-column-metric\">\n" +
    "                    <div class=\"bk-numeric-range\" ng-class=\"{'bk-numeric-range-invalid': $ctrl.rowHasValidationErrors($index)}\">\n" +
    "                          <span class=\"bk-numeric-metric-value bk-numeric-metric-value-min\" ng-class=\"{'bk-numeric-range-invalid': $ctrl.cellHasValidationErrors($index, 0)}\">\n" +
    "                              <input type=\"text\" ng-model=\"metric.range.min\" placeholder=\">=\" ng-disabled=\"!$ctrl.isEditable\">\n" +
    "                          </span>\n" +
    "                        <span class=\"bk-numeric-metric-value bk-numeric-metric-value-max\" ng-class=\"{'bk-numeric-range-invalid': $ctrl.cellHasValidationErrors($index, 1)}\">\n" +
    "                              <input type=\"text\" ng-model=\"metric.range.max\" placeholder=\"<\" ng-disabled=\"!$ctrl.isEditable\">\n" +
    "                          </span>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-clickable bk-metric-color\">\n" +
    "                        <color-picker ng-model=\"metric.color\" fill=\"true\" not-editable=\"!$ctrl.isColorPickerEditable()\" class=\"bk-metric-color-picker\">\n" +
    "                        </color-picker>\n" +
    "                    </div>\n" +
    "                    <div ng-if=\"$ctrl.isEditable\" class=\"bk-metric-remove-button\">\n" +
    "                        <span class=\"bk-icon bk-clickable bk-style-icon-cross\" ng-click=\"$ctrl.removeMetric(metric)\"></span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"bk-column-metric-validation-error-message\" ng-if=\"!!$ctrl.validationErrors\">{{$ctrl.validationErrors.message}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-column-metrics-not-defined\" ng-switch-when=\"true\">\n" +
    "            <div class=\"bk-column-metrics-add-new-message\">{{ $ctrl.getNoMetricsDefinedMessage() }}</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/contact-support/contact-support.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/contact-support/contact-support.html",
    "<span class=\"bk-support-info\" ng-click=\"toggleSupportPopup()\" uib-popover-template=\"'contact-support-info.html'\" popover-is-open=\"showSupportPopup\" popover-append-to-body=\"true\" popover-placement=\"bottom\" popover-class=\"bk-support-popover\">\n" +
    "    {{getTitleText()}}\n" +
    "</span>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"contact-support-info.html\">\n" +
    "    <div>\n" +
    "        {{strings.Email}} <a href=\"mailto:{{getAdminEmail()}}\">{{getAdminEmail()}}</a>\n" +
    "    </div>\n" +
    "    <div>{{strings.Call}} {{getAdminPhoneNumber()}}</div>\n" +
    "</script>");
}]);

angular.module("src/common/widgets/content-editable/content-editable.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/content-editable/content-editable.html",
    "<div class=\"bk-editable\" ng-class=\"{'bk-in-edit-mode': isBeingEdited,\n" +
    "                'bk-empty-content': !text || !text.trim(),\n" +
    "                'bk-readonly': isNotEditable(),\n" +
    "                'bk-external': isExternal(),\n" +
    "                'bk-full-width': fullSpan,\n" +
    "                'bk-show-editable': autoShowEditable,\n" +
    "                'bk-error-input': !!error}\" ng-mouseenter=\"mouseEntered()\" ng-mouseleave=\"mouseLeft()\">\n" +
    "\n" +
    "    <div class=\"bk-description-edit-dropdown\" ng-class=\"{'bk-visible': isDescEnabled && (isBeingEdited)}\">\n" +
    "        <div class=\"bk-visible bk-error-popup bk-opens-right fr\" ng-show=\"!!error\">\n" +
    "            <div class=\"bk-container\">\n" +
    "                {{error}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <input type=\"text\" class=\"bk-visible bk-editable-input\" ng-class=\"{'bk-readonly' : isReadOnly || isNotEditable()}\" ng-click=\"contentClicked($event)\" spellcheck=\"false\" placeholder=\"{{ getPlaceHolderText() }}\" size=\"{{ getSize() }}\" name=\"{{ text }}\" blink-on-escape=\"reset();\" blink-on-enter=\"submit();\" ng-change=\"onTextChange()\" ng-model=\"text\" ng-readonly=\"isReadOnly || isNotEditable()\" uib-tooltip-template=\"'content-editable-tooltip-template.html'\" tooltip-class=\"bk-content-editable-tooltip\" tooltip-placement=\"auto bottom\" tooltip-popup-delay=\"500\" tooltip-append-to-body=\"true\">\n" +
    "        <div class=\"bk-description-container\" ng-show=\"isDescEnabled && (isBeingEdited)\">\n" +
    "            <textarea class=\"bk-description-editarea\" ng-class=\"{'bk-readonly' : isReadOnly || isNotEditable()}\" ng-readonly=\"isReadOnly || isNotEditable()\" placeholder=\"Description\" ng-model=\"description\">\n" +
    "            </textarea>\n" +
    "            <bk-primary-button class=\"bk-content-editable-done-button\" text=\"{{ strings.DONE }}\" ng-click=\"changeEditMode(false)\"></bk-primary-button>\n" +
    "        </div>\n" +
    "\n" +
    "        <script type=\"text/ng-template\" id=\"content-editable-tooltip-template.html\">\n" +
    "            <div>\n" +
    "                <span ng-if=\"description\" class=\"bk-tooltip-title\">{{strings.TITLE}}:</span> {{text}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"description\" >\n" +
    "                <span class=\"bk-tooltip-description\">{{strings.DESCRIPTION}}:</span> {{description}}\n" +
    "            </div>\n" +
    "        </script>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/context-menu/context-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/context-menu/context-menu.html",
    "<div class=\"bk-context-menu\" blink-on-escape=\"close()\" blink-overlay=\"close()\" ignore-click-selector=\"config.ignoreOverlayClickSelectors\">\n" +
    "    <div class=\"bk-context-menu-header\" ng-show=\"!!config.title\">\n" +
    "        <div class=\"bk-context-menu-title\" ng-bind-html=\"config.title\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-sub-menu-container\">\n" +
    "        <div class=\"bk-sub-menu\" ng-repeat=\"item in config.subMenuItems\">\n" +
    "            <div ng-include=\"item.url\" blink-tooltip=\"{{item.disabledHelp}}\" ng-show=\"canShowSubMenu(item.id)\" class=\"bk-sub-menu-item\" ng-class=\"{'bk-sub-menu-item-disabled': !item.enabled}\" capture-click=\"onSubMenuItemClick($event, item)\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <bk-related-items ng-if=\"(showRelatedItems() && !!relatedItemsComponent)\" bk-ctrl=\"relatedItemsComponent\" class=\"bk-sub-menu\">\n" +
    "        </bk-related-items>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/cross-font-icon/cross-font-icon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/cross-font-icon/cross-font-icon.html",
    "<span class=\"bk-style-icon-circled-x\">\n" +
    "    <span class=\"bk-background\"></span><span class=\"bk-cross\"></span>\n" +
    "</span>");
}]);

angular.module("src/common/widgets/dialog/dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialog/dialog.html",
    "<div class=\"bk-dialog\" ng-click=\"$event.stopPropagation();\">\n" +
    "        <div class=\"modal-header\">\n" +
    "            <a class=\"bk-close\" ng-click=\"$ctrl.dismiss()\">&times;</a>\n" +
    "            <h3>{{ $ctrl.data.title }}</h3>\n" +
    "        </div>\n" +
    "        <div class=\"modal-body\" ng-show=\"!!$ctrl.data.customBodyUrl\" ng-include=\"$ctrl.data.customBodyUrl\"></div>\n" +
    "        <div class=\"modal-body\" ng-hide=\"!!$ctrl.data.customBodyUrl\">\n" +
    "            <div ng-show=\"!$ctrl.processingAsyncConfirm && !$ctrl.asyncConfirmError\" ng-bind-html=\"$ctrl.data.message\"></div>\n" +
    "            <div class=\"async-confirm-error-message\" ng-show=\"!$ctrl.processingAsyncConfirm && !!$ctrl.asyncConfirmError && !$ctrl.data.showErrorOnFooter\" ng-bind-html=\"$ctrl.asyncConfirmError.message\"></div>\n" +
    "            <div ng-show=\"!!$ctrl.processingAsyncConfirm\">\n" +
    "                <div class=\"bk-modal-loading-indicator\" blink-loading-indicator></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"modal-footer\">\n" +
    "            <div class=\"bk-req-field-statement\" ng-show=\"!!$ctrl.data.hasAnyRequiredField && (!$ctrl.data.showErrorOnFooter || !$ctrl.asyncConfirmError)\">\n" +
    "                {{strings.REQUIRED_FIELD}}\n" +
    "            </div>\n" +
    "            <div class=\"bk-error-message\" ng-hide=\"!$ctrl.data.showErrorOnFooter\">\n" +
    "                <div ng-show=\"!$ctrl.processingAsyncConfirm && !!$ctrl.asyncConfirmError\">\n" +
    "                    {{$ctrl.asyncConfirmError.message}}.\n" +
    "                    <a ng-if=\"!!$ctrl.asyncConfirmError.custom$ctrl.data.traceId\" ng-click=\"$ctrl.asyncConfirmError.custom$ctrl.data.downloadTrace(traceId)\">{{strings.DOWNLOAD_TRACE}}</a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-modal-action-buttons\">\n" +
    "                <bk-secondary-button text=\"{{ $ctrl.data.cancelBtnLabel || strings.CANCEL }}\" is-disabled=\"!!$ctrl.data.disableCancelBtn\" ng-hide=\"$ctrl.data.skipCancelBtn\" ng-click=\"$ctrl.cancelBtnClick()\" class=\"bk-cancel-button\" blink-tooltip=\"{{ $ctrl.data.cancelTooltip }}\"></bk-secondary-button>\n" +
    "                <div ng-switch=\"!!$ctrl.data.onConfirmAsync\" class=\"bk-modal-confirmation-buttons\">\n" +
    "                    <div ng-switch-when=\"true\">\n" +
    "                        <bk-secondary-button text=\"{{ $ctrl.data.confirmBtnLabel || strings.CONFIRM }}\" is-disabled=\"$ctrl.processingAsyncConfirm\" ng-hide=\"$ctrl.data.skipConfirmBtn\" ng-click=\"$ctrl.confirmSync()\" class=\"bk-confirm-btn\"></bk-secondary-button>\n" +
    "                        <bk-primary-button text=\"{{ $ctrl.data.confirmAsyncBtnLabel }}\" is-disabled=\"$ctrl.processingAsyncConfirm || $ctrl.isConfirmDisabled()\" is-busy=\"$ctrl.processingAsyncConfirm\" ng-click=\"$ctrl.confirmAsync()\" class=\"bk-confirm-async-btn\"></bk-primary-button>\n" +
    "                    </div>\n" +
    "                    <div ng-switch-when=\"false\">\n" +
    "                        <bk-primary-button text=\"{{ $ctrl.data.confirmBtnLabel || strings.CONFIRM }}\" is-disabled=\"$ctrl.processingAsyncConfirm || $ctrl.isConfirmDisabled()\" ng-hide=\"$ctrl.data.skipConfirmBtn\" ng-click=\"$ctrl.confirmSync()\" class=\"bk-confirm-async-btn\"></bk-primary-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>");
}]);

angular.module("src/common/widgets/dialogs/templates/add-prefix-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/add-prefix-dialog.html",
    "<div ng-hide=\"$ctrl.data.customData.isPrefixForExistingColumns\">\n" +
    "{{strings.Some_columns_names}}\n" +
    "</div>\n" +
    "\n" +
    "<div ng-show=\"$ctrl.data.customData.isPrefixForExistingColumns\">\n" +
    "{{strings.Add_a_prefix}}\n" +
    "</div>\n" +
    "\n" +
    "<div style=\"margin: 15px 40px 10px 0\">\n" +
    "    <input style=\"width: 100%\" blink-auto-sele type=\"text\" ng-model=\"$ctrl.data.customData.prefixLabel\" spellcheck=\"false\" placeholder=\"Enter prefix\">\n" +
    "</div>\n" +
    "<div ng-hide=\"$ctrl.data.customData.isPrefixForExistingColumns\">\n" +
    "    <input type=\"checkbox\" ng-model=\"$ctrl.data.customData.shouldPrefixOnlyConflictColumns\">\n" +
    "    <span>{{strings.Only_add_prefix}}</span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/add-users-to-groups-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/add-users-to-groups-dialog.html",
    "<form name=\"form\" class=\"bk-dialog-field\" blink-dialog-password-check>\n" +
    "    <blink-smart-checkbox-collection bk-ctrl=\"$ctrl.data.customData.checkboxController\"></blink-smart-checkbox-collection>\n" +
    "</form>");
}]);

angular.module("src/common/widgets/dialogs/templates/confirm-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/confirm-dialog.html",
    "<div name=\"form\" class=\"bk-dialog-field\">\n" +
    "\n" +
    "</div>\n" +
    "{{ $ctrl.data.customData.message }}");
}]);

angular.module("src/common/widgets/dialogs/templates/confirm-empty-pinboard-viz-removal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/confirm-empty-pinboard-viz-removal.html",
    "{{strings.Are_you_sure}}");
}]);

angular.module("src/common/widgets/dialogs/templates/confirm-pinboard-viz-removal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/confirm-pinboard-viz-removal.html",
    "<span>{{strings.Are_you_sure2}}</span>{{ $ctrl.data.vizType }} <span class=\"bk-text-gray\"><b>\"{{ $ctrl.data.vizTitle }}\"</b></span> {{strings.from_the}}");
}]);

angular.module("src/common/widgets/dialogs/templates/create-connection-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/create-connection-dialog.html",
    "<div class=\"bk-dialog-field\" blink-dialog-password-check>\n" +
    "    <div class=\"bk-connection-property\">\n" +
    "        <div class=\"bk-property-label\">\n" +
    "            <blink-required-field>{{$ctrl.data.connectionName}}</blink-required-field>\n" +
    "        </div>\n" +
    "        <div class=\"bk-property-value\">\n" +
    "            <input class=\"bk-property-input\" ng-model=\"$ctrl.data.customData.name\" type=\"text\" ng-readonly=\"!!$ctrl.data.customData.nameReadOnly\" ng-required=\"true\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-connection-property\" ng-repeat=\"attribute in $ctrl.data.customData.attributes\">\n" +
    "        <div class=\"bk-property-label\" ng-if=\"!!attribute.isRequired\">\n" +
    "            <blink-required-field>{{attribute.displayName}}</blink-required-field>\n" +
    "        </div>\n" +
    "        <div class=\"bk-property-label\" ng-if=\"!attribute.isRequired\">\n" +
    "            {{attribute.displayName}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-property-value\" ng-switch=\"attribute.type\">\n" +
    "            <div ng-switch-when=\"PASSWORD\">\n" +
    "                <input class=\"bk-property-input\" ng-model=\"attribute.value\" type=\"password\" ng-required=\"{{attribute.isRequired}}\">\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"TEXT\">\n" +
    "                <input class=\"bk-property-input\" ng-model=\"attribute.value\" type=\"text\" ng-init=\"$ctrl.data.initializeWithDefaultValue(attribute)\" ng-required=\"{{attribute.isRequired}}\">\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"BOOL\">\n" +
    "                <span class=\"bk-bool-container\">\n" +
    "                <span class=\"bk-select-box\">\n" +
    "                    <ui-select ng-model=\"attribute.value\" ng-init=\"$ctrl.data.translateBoolSelection($ctrl.data.initializeWithDefaultValue(attribute))\" class=\"bk-connection-select\" theme=\"select2\" search-enabled=\"false\">\n" +
    "                        <ui-select-match>{{$ctrl.data.translateBoolSelection($select.selected)}}</ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"value as value in $ctrl.data.getBoolTypeListOptions()\">\n" +
    "                            {{ $ctrl.data.translateBoolSelection(value) }}\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </span>\n" +
    "                </span>\n" +
    "\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"LIST\">\n" +
    "                <span class=\"bk-select-box\">\n" +
    "                    <ui-select ng-model=\"attribute.value\" ng-init=\"$ctrl.data.initializeWithDefaultValue(attribute)\" class=\"bk-connection-select\" theme=\"select2\" search-enabled=\"false\">\n" +
    "                        <ui-select-match>{{ $select.selected }}</ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"value as value in attribute.listOptions\">\n" +
    "                            {{ value }}\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/create-edit-admin-item-dialog.html",
    "<admin-dialog-component bk-ctrl=\"$ctrl.data.customData.dialogController\"></admin-dialog-component>");
}]);

angular.module("src/common/widgets/dialogs/templates/create-pinboard-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/create-pinboard-dialog.html",
    "<div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{strings.Pinboard_name}}</div>\n" +
    "        <input type=\"text\" ng-model=\"$ctrl.data.customData.pinboardName\" spellcheck=\"false\" blink-auto-focus>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{strings.Description}}</div>\n" +
    "        <textarea ng-model=\"$ctrl.data.customData.pinboardDescription\" spellcheck=\"false\"></textarea>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/currency-type-editor-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/currency-type-editor-dialog.html",
    "<bk-currency-type-editor bk-ctrl=\"$ctrl.data.customData.ctrl\"></bk-currency-type-editor>");
}]);

angular.module("src/common/widgets/dialogs/templates/data-filter-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/data-filter-dialog.html",
    "<label>{{$ctrl.data.customData.constants.NO_FILTER_TEXT}}\n" +
    "</label>\n" +
    "<div class=\"bk-filter-target\">\n" +
    "    <label class=\"bk-property-label-bold\">{{$ctrl.data.customData.constants.OBJECT}}</label>\n" +
    "    <span class=\"bk-select-box\">\n" +
    "        <ui-select ng-model=\"$ctrl.data.customData.config.name\" on-select=\"$ctrl.data.customData.config.onChange($select.selected, $ctrl.data.customData.config.columns)\" theme=\"select2\" search-enabled=\"true\">\n" +
    "            <ui-select-match placeholder=\"Select a table\">{{$select.selected}}</ui-select-match>\n" +
    "            <ui-select-choices repeat=\"table in $ctrl.data.customData.config.tables | filter: $select.search\">\n" +
    "                {{table}}\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "    </span>\n" +
    "</div>\n" +
    "<div class=\"bk-filter-properties\">\n" +
    "    <label class=\"bk-property-label font-family-bold\">{{$ctrl.data.customData.constants.FILTER}}</label>\n" +
    "    <div class=\"bk-data-filter-options\">\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <ui-select ng-model=\"$ctrl.data.customData.config.column\" class=\"bk-filter-column\" theme=\"select2\" search-enabled=\"true\">\n" +
    "                    <ui-select-match>{{$select.selected.name}}</ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in $ctrl.data.customData.config.columns[$ctrl.data.customData.config.name] | filter: $select.search \">\n" +
    "                        {{ column.name }}\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </span>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <ui-select ng-model=\"$ctrl.data.customData.config.option\" class=\"bk-filter-operand\" theme=\"select2\" search-enabled=\"false\">\n" +
    "                    <ui-select-match>{{$select.selected}}</ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"option in $ctrl.data.customData.config.options\">\n" +
    "                        {{ option }}\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </span>\n" +
    "    </div>\n" +
    "    <div class=\"column-type\">\n" +
    "        {{$ctrl.data.customData.config.column.dataType}}\n" +
    "    </div>\n" +
    "    <div ng-if=\"$ctrl.data.customData.config.isTextRequired($ctrl.data.customData.config.option)\" ng-switch=\"$ctrl.data.customData.config.isDateType($ctrl.data.customData.config.column)\">\n" +
    "        <input class=\"operand-value\" ng-switch-when=\"true\" placeholder=\"{{$ctrl.data.customData.config.getPlaceholderValue($ctrl.data.customData.config.column)}}\" bs-datepicker date-format=\"MM/DD/YYYY\" date-type=\"string\" ng-model=\"$ctrl.data.customData.config.text\">\n" +
    "        <input class=\"operand-value\" ng-switch-when=\"false\" placeholder=\"{{$ctrl.data.customData.config.getPlaceholderValue($ctrl.data.customData.config.column)}}\" ng-model=\"$ctrl.data.customData.config.text\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/delete-checkbox-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/delete-checkbox-dialog.html",
    "<div>\n" +
    "    <div ng-bind-html=\"$ctrl.data.message\"></div>\n" +
    "    <bk-checkbox ng-if=\"!!$ctrl.data.customData.ctrl\" bk-ctrl=\"$ctrl.data.customData.ctrl\">\n" +
    "    </bk-checkbox>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/edit-schema-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/edit-schema-dialog.html",
    "<div class=\"bk-dialog-field edit-schema-dialog\">\n" +
    "    <div class=\"schema-container expand\">\n" +
    "        <div class=\"bk-schema expand\" ng-model=\"$ctrl.data.customData.schemaText\" ui-ace=\"{\n" +
    "                useWrapMode : true,\n" +
    "                mode: 'tql',\n" +
    "                theme: 'sqlserver',\n" +
    "                require: ['ace/ext/language_tools'],\n" +
    "                workerPath: 'app/lib/min/ace',\n" +
    "                advanced: {\n" +
    "                    enableBasicAutocompletion: true,\n" +
    "                    enableLiveAutocompletion: true\n" +
    "                }\n" +
    "         }\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/geo-config-editor-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/geo-config-editor-dialog.html",
    "<bk-geo-config-editor bk-ctrl=\"$ctrl.data.customData.ctrl\"></bk-geo-config-editor>");
}]);

angular.module("src/common/widgets/dialogs/templates/import-selected-tables-warning-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/import-selected-tables-warning-dialog.html",
    "<div class=\"bk-dialog-field\">\n" +
    "    <div>{{$ctrl.data.customData.message}}</div>\n" +
    "    <div ng-if=\"!!$ctrl.data.customData.tables\" ng-repeat=\"table in $ctrl.data.customData.tables\">\n" +
    "        <div ng-bind-html=\"$ctrl.data.customData.listFunction($index, table)\"></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/join-workflow-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/join-workflow-dialog.html",
    "<bk-join-disambiguation bk-ctrl=\"$ctrl.data.customData.joinDisambiguation\">\n" +
    " </bk-join-disambiguation>");
}]);

angular.module("src/common/widgets/dialogs/templates/list-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/list-dialog.html",
    "<div>{{$ctrl.data.customData.message}}</div>\n" +
    "<ul>\n" +
    "    <li class=\"bk-dialog-list-item\" ng-repeat=\"item in $ctrl.data.customData.items\">\n" +
    "        <a class=\"bk-dialog-link\" ng-if=\"!!item.href\" target=\"{{!!item.embedApp ? '_self' : '_blank'}}\" ng-href=\"{{item.href}}\">{{item.name}}</a>\n" +
    "        <span ng-if=\"!item.href\"> {{item.name}}</span>\n" +
    "        <span ng-if=\"!!item.typeName\">&nbsp;({{item.typeName}})</span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/common/widgets/dialogs/templates/pinboard-snapshot-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/pinboard-snapshot-dialog.html",
    "<blink-pinboard-snapshot pinboard-model=\"$ctrl.data.customData.pinboardModel\"></blink-pinboard-snapshot>");
}]);

angular.module("src/common/widgets/dialogs/templates/replay-answer-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/replay-answer-dialog.html",
    "<div class=\"bk-dialog\">\n" +
    "    <div class=\"info-item\">\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"label\">\n" +
    "                {{ $ctrl.data.customData.nameLabel }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"info\">\n" +
    "                {{ $ctrl.data.customData.name }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"info-item\">\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"label\">\n" +
    "                {{ $ctrl.data.customData.descriptionLabel }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"info\">\n" +
    "                {{ $ctrl.data.customData.description }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"info-item\">\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"label\">\n" +
    "                {{ $ctrl.data.customData.lastModifiedLabel }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"info\">\n" +
    "                {{ $ctrl.data.customData.lastModifiedTime }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"info-item\">\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"label\">\n" +
    "                {{ $ctrl.data.customData.authorLabel }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "            <blink-profile-pic class=\"bk-profile-pic\" user-id=\"$ctrl.data.customData.userId\" user-display-name=\"$ctrl.data.customData.author\">\n" +
    "            </blink-profile-pic>\n" +
    "\n" +
    "        <div class=\"bk-dialog-field\">\n" +
    "            <span class=\"info\">\n" +
    "                {{ $ctrl.data.customData.author }}\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/row-detail-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/row-detail-dialog.html",
    "<leaf-level-data init-document-model=\"$ctrl.data.customData.documentModel\" summary-info=\"$ctrl.data.customData.summaryInfo\"></leaf-level-data>");
}]);

angular.module("src/common/widgets/dialogs/templates/sage-feedback-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/sage-feedback-dialog.html",
    "<div class=\"bk-sage-feedback-dialog\">\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <span class=\"bk-select-box\">\n" +
    "            <ui-select ng-model=\"$ctrl.data.customData.userRating\" theme=\"select2\" search-enabled=\"false\">\n" +
    "                <ui-select-match placeholder=\"{{$ctrl.data.customData.strings.SELECT_A_RATING}}\">\n" +
    "                    {{$select.selected.text}}\n" +
    "                </ui-select-match>\n" +
    "                <ui-select-choices repeat=\"rating.number as rating in $ctrl.data.customData.ratingList\">\n" +
    "                    {{rating.text}}\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </span>\n" +
    "        <span class=\"bk-asterisk\">*</span>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <textarea class=\"bk-description-editarea\" placeholder=\"{{$ctrl.data.customData.strings.ENTER_DESCRIPTION_PLACEHOLDER}}\" ng-model=\"$ctrl.data.customData.description\">\n" +
    "        </textarea>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/save-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/save-dialog.html",
    "<div class=\"bk-answer-save-dialog\">\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{strings.Name2}}</div>\n" +
    "        <input blink-auto-select class=\"bk-name-text\" type=\"text\" ng-model=\"$ctrl.data.customData.questionHeader\" spellcheck=\"false\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{strings.Description}}</div>\n" +
    "        <textarea class=\"description-text\" ng-model=\"$ctrl.data.customData.questionDescription\" spellcheck=\"false\"></textarea>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/scheduler-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/scheduler-dialog.html",
    "<bk-scheduler schedule-config=\"$ctrl.data.customData.schedulerConfig\"></bk-scheduler>");
}]);

angular.module("src/common/widgets/dialogs/templates/simple-save-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/simple-save-dialog.html",
    "<div class=\"bk-answer-save-dialog\">\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{strings.Name2}}</div>\n" +
    "        <input blink-auto-select class=\"bk-name-text\" type=\"text\" ng-model=\"$ctrl.data.customData.documentName\" spellcheck=\"false\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/dialogs/templates/visualization-pinner-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/dialogs/templates/visualization-pinner-dialog.html",
    "<blink-pinboard-drop-down viz-model=\"$ctrl.data.customData.vizModel\"></blink-pinboard-drop-down>");
}]);

angular.module("src/common/widgets/editable-list/removable-component/removable-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/editable-list/removable-component/removable-component.html",
    "<div class=\"bk-removable-component\">\n" +
    "    <span class=\"bk-removable-component-remover\" ng-click=\"$ctrl.handleRemoval()\" ng-if=\"!$ctrl.isDisabled()\">×</span>\n" +
    "    <div ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/expiration-button/expiration-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/expiration-button/expiration-button.html",
    "<div class=\"bk-expiration-button\">\n" +
    "    <div ng-switch=\"$ctrl.isDisabled\">\n" +
    "        <div ng-switch-when=\"false\">\n" +
    "            <div class=\"bk-expiration-timer\">\n" +
    "                {{ $ctrl.remainingTimeDisplay }}\n" +
    "            </div>\n" +
    "            <div class=\"bk-button bk-grey-outline-button\" ng-click=\"$ctrl.handleClick()\">\n" +
    "                <div class=\"button-text\">\n" +
    "                    {{ $ctrl.strings.expirationButton.SAVE }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"true\">\n" +
    "            <div class=\"saved-text\" ng-if=\"$ctrl.savedDialogActive\">\n" +
    "                 {{ $ctrl.strings.expirationButton.SAVED }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/file-upload/html5-file-upload/html5-file-upload.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/file-upload/html5-file-upload/html5-file-upload.html",
    "<form class=\"bk-html5-upload-form\">\n" +
    "    <fieldset class=\"bk-drop-zone\">\n" +
    "        <label for=\"bk-file-input\">\n" +
    "            <bk-secondary-button text=\"{{ browseYourFiles }}\" ng-hide=\"showFileReadCompletionUI\" class=\"bk-file-upload-btn\"></bk-secondary-button>\n" +
    "            <bk-secondary-button text=\"{{ diskFileName }}\" ng-show=\"showFileReadCompletionUI\" class=\"bk-file-name-label\"></bk-secondary-button>\n" +
    "        </label>\n" +
    "        <input type=\"file\" name=\"content\" id=\"bk-file-input\" ng-hide=\"showFileReadCompletionUI\">\n" +
    "        <div ng-hide=\"showFileReadCompletionUI\" class=\"upload-size-info\">\n" +
    "            {{ fileSizeInfo }}\n" +
    "        </div>\n" +
    "    </fieldset>\n" +
    "</form>");
}]);

angular.module("src/common/widgets/fonts/font-editor/font-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/fonts/font-editor/font-editor.html",
    "<div class=\"bk-font-editor\">\n" +
    "    <bk-blob-uploader class=\"bk-font-editor-font-uploader\" bk-ctrl=\"$ctrl.getFontUploaderComponent()\">\n" +
    "        <bk-font-preview bk-ctrl=\"$ctrl.getFontPreviewComponent()\"></bk-font-preview>\n" +
    "    </bk-blob-uploader>\n" +
    "    <div class=\"bk-font-editor-properties-list\" ng-if=\"$ctrl.isCustomFontFace()\">\n" +
    "        <ul>\n" +
    "            <li class=\"bk-font-editor-property-family\">\n" +
    "                <span class=\"bk-font-editor-prop-name\">{{ $ctrl.getFontFamilyPropertyName()}}</span>\n" +
    "                <input type=\"text\" class=\"bk-font-editor-prop-field\" ng-model=\"$ctrl.fontFamily\">\n" +
    "            </li>\n" +
    "            <li class=\"bk-font-editor-property-color\">\n" +
    "                <span class=\"bk-font-editor-prop-name\">{{ $ctrl.getFontColorPropertyName()}}</span>\n" +
    "                <bk-color-configurator class=\"bk-font-editor-color-configurator\" bk-ctrl=\"$ctrl.getColorConfiguratorComponent()\">\n" +
    "                </bk-color-configurator>\n" +
    "            </li>\n" +
    "            <li class=\"bk-font-editor-property-weight\">\n" +
    "                <span class=\"bk-font-editor-prop-name\">{{ $ctrl.getFontWeightPropertyName()}}</span>\n" +
    "                <span class=\"bk-font-editor-property-weight-selector\">\n" +
    "                    <ui-select ng-model=\"$ctrl.fontWeight\" search-enabled=\"false\" allow-clear=\"false\" theme=\"select2\">\n" +
    "                        <ui-select-match>\n" +
    "                            {{ $ctrl.convertFontFaceWeightToLabel($ctrl.fontWeight) }}\n" +
    "                        </ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"fontFaceWeight in $ctrl.getFontFaceWeights()\">\n" +
    "                            {{ $ctrl.convertFontFaceWeightToLabel(fontFaceWeight) }}\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </span>\n" +
    "            </li>\n" +
    "            <li class=\"bk-font-editor-property-style\">\n" +
    "                <span class=\"bk-font-editor-prop-name\">{{ $ctrl.getFontStylePropertyName()}}</span>\n" +
    "                <span class=\"bk-font-editor-property-style-selector\">\n" +
    "                    <ui-select ng-model=\"$ctrl.fontStyle\" search-enabled=\"false\" allow-clear=\"false\" theme=\"select2\">\n" +
    "                        <ui-select-match>\n" +
    "                            {{ $ctrl.convertFontFaceStyleToLabel($ctrl.fontStyle) }}\n" +
    "                        </ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"fontFaceStyle in $ctrl.getFontFaceStyles()\">\n" +
    "                            {{ $ctrl.convertFontFaceStyleToLabel(fontFaceStyle) }}\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </span>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "    <div class=\"bk-font-editor-footer\">\n" +
    "        <bk-secondary-button class=\"bk-font-editor-cancel-button\" text=\"{{ $ctrl.getCancelButtonLabel()}}\" ng-click=\"$ctrl.handleCancel()\"></bk-secondary-button>\n" +
    "        <bk-primary-button class=\"bk-font-editor-save-button\" text=\"{{ $ctrl.getSaveButtonLabel()}}\" is-disabled=\"!$ctrl.isCustomFontFace()\" ng-click=\"$ctrl.handleSave()\"></bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/fonts/font-preview/font-preview.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/fonts/font-preview/font-preview.html",
    "<div class=\"bk-font-preview\" blink-tooltip=\"{{ $ctrl.getFontInfoToolTipHtml() }}\" data-html=\"true\" ng-switch=\"$ctrl.isFontFaceAvailable()\">\n" +
    "    <span class=\"bk-font-preview-font-available\" ng-switch-when=\"true\">\n" +
    "        <span class=\"bk-font-preview-font-name\">{{ $ctrl.getFontFamily() }}</span>\n" +
    "        <span class=\"bk-font-preview-text\" ng-style=\"$ctrl.getFontCSSStyle()\">{{ $ctrl.getPreviewText() }}</span>\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"false\">\n" +
    "        <span class=\"bk-font-preview-no-font-message\">{{ $ctrl.getNoFontFaceMessage() }}</span>\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/fonts/font-selector/font-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/fonts/font-selector/font-selector.html",
    "<div class=\"bk-font-selector\">\n" +
    "    <span class=\"bk-font-selector-select\">\n" +
    "        <ui-select ng-model=\"$ctrl.selectedFontFace\" search-enabled=\"false\" allow-clear=\"false\" on-select=\"$ctrl.handleFontFaceSelection($item)\" theme=\"select2\">\n" +
    "            <ui-select-match placeholder=\"{{ $ctrl.getPlaceholderText() }}\">\n" +
    "                <bk-font-preview class=\"bk-font-selector-select-selected-preview\" bk-ctrl=\"$ctrl.getSelectedFontFacePreviewComponent()\"></bk-font-preview>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices repeat=\"fontFace in $ctrl.getFontFaces()\">\n" +
    "                <bk-font-preview bk-ctrl=\"$ctrl.getFontFacePreviewComponent(fontFace)\"></bk-font-preview>\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "    </span>\n" +
    "    <bk-icon-button class=\"bk-font-selector-edit-button\" ng-if=\"$ctrl.isSelectedFontFaceEditable()\" icon=\"bk-style-icon-edit\" tooltip=\"$ctrl.getEditFontActionText()\" ng-click=\"$ctrl.showSelectedFontEditorComponent()\">\n" +
    "    </bk-icon-button>\n" +
    "    <bk-icon-button class=\"bk-font-selector-create-button\" icon=\"bk-style-icon-small-plus\" tooltip=\"$ctrl.getAddFontActionText()\" ng-click=\"$ctrl.showNewFontEditorComponent()\">\n" +
    "    </bk-icon-button>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/fonts/multi-font-selector/multi-font-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/fonts/multi-font-selector/multi-font-selector.html",
    "<div class=\"bk-multi-font-selector\">\n" +
    "    <div class=\"bk-multi-font-selector-item-selector\">\n" +
    "        <ui-select ng-model=\"$ctrl.selectedItem\" search-enabled=\"false\" allow-clear=\"false\" on-select=\"$ctrl.handleItemSelection($item)\" theme=\"select2\">\n" +
    "            <ui-select-match>\n" +
    "                <span>{{ $ctrl.getSelectedItemLabel() }}</span>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices repeat=\"item in $ctrl.getItems()\">\n" +
    "                <span>{{ item.getLabel() }}</span>\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "    </div>\n" +
    "    <div class=\"bk-multi-font-selector-font-selector\">\n" +
    "        <bk-font-selector bk-ctrl=\"$ctrl.getFontSelectorComponent()\"></bk-font-selector>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/image-view/image-view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/image-view/image-view.html",
    "<div class=\"bk-image-viewer\">\n" +
    "    <img class=\"bk-image-viewer-image\" ng-src=\"{{ $ctrl.getImageUrl() }}\">\n" +
    "</div>");
}]);

angular.module("src/common/widgets/info-header/info-header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/info-header/info-header.html",
    "<div class=\"bk-info-header\">\n" +
    "    <span class=\"bk-style-icon-circled-information\"></span>\n" +
    "    <span class=\"bk-info-header-text\"> {{$ctrl.headerText}}</span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/input/input.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/input/input.html",
    "<div class=\"bk-input\" ng-class=\"{'is-editing': $ctrl.isEditing}\">\n" +
    "    <img ng-if=\"$ctrl.icon\" class=\"bk-input-icon\" ng-src=\"{{$ctrl.icon}}\">\n" +
    "    <input ng-focus=\"$ctrl.isEditing = true;\" ng-blur=\"$ctrl.isEditing = false;\" class=\"bk-input-field\" ng-model=\"$ctrl.value\" placeholder=\"{{$ctrl.placeholder}}\">\n" +
    "</div>");
}]);

angular.module("src/common/widgets/key-value-viewer/key-value-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/key-value-viewer/key-value-viewer.html",
    "<div class=\"bk-key-value-viewer\" ng-class=\"{\n" +
    "     'bk-vertical': $ctrl.alignment === $ctrl.Alignments.VERTICAL\n" +
    "     }\">\n" +
    "    <div class=\"bk-kv-key\" ng-bind-html=\"$ctrl.key\"></div>\n" +
    "    <div class=\"bk-kv-value\" ng-bind-html=\"$ctrl.value\"></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/menu/button-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/menu/button-menu.html",
    "<div class=\"bk-menu-btn-group {{ menu.className }}\" ng-mouseenter=\"mouseOutsideMenuGroup = false\" ng-mouseleave=\"mouseOutsideMenuGroup = true\" blink-on-escape=\"menuBtnPressed = false\" on-global-click=\"mouseOutsideMenuGroup && (menuBtnPressed = false)\">\n" +
    "    <div class=\"bk-button-menu clearfix\">\n" +
    "        <div class=\"bk-menu-btn fl bk-btn {{ menu.btnClass }}\" ng-class=\"{'bk-pressed': menuBtnPressed, 'bk-disabled': menu.inactive, 'btn-with-dropdown': menu.submenus.length > 0}\" ng-click=\"onMenuItemClick(menu.primaryMenu.event, menu.inactive)\">\n" +
    "            <div class=\"bk-menu-primary\" ng-switch=\"!!isBusy()\">\n" +
    "                <div ng-switch-when=\"true\">\n" +
    "                    <div class=\"bk-in-progress\">\n" +
    "                        <div class=\"bk-dot dot1\"></div>\n" +
    "                        <div class=\"bk-dot dot2\"></div>\n" +
    "                        <div class=\"bk-dot dot3\"></div>\n" +
    "                        <div class=\"bk-dot dot4\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"false\">\n" +
    "                    <span class=\"bk-submenu-item-label\">{{menu.primaryMenu.label}}</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"fl dropdownButton {{ menu.dropdownBtnClass }}\" ng-show=\"menu.submenus.length > 0\" ng-click=\"!isBusy() && (menuBtnPressed = !menuBtnPressed)\" ng-class=\"{ 'dropdown-open': menuBtnPressed }\">\n" +
    "            <div class=\"bk-icon-arrow-down {{menu.btnArrowClass}}\"></div>\n" +
    "            <div class=\"bk-menu-body\" ng-hide=\"!menuBtnPressed\" ng-click=\"menu.keepMenuOpenOnSelect && (menuBtnPressed = false)\">\n" +
    "                <div ng-repeat=\"submenu in menu.submenus\" class=\"bk-menu-submenu\">\n" +
    "                    <div ng-repeat=\"item in submenu\" class=\"bk-submenu-item\" ng-click=\"onMenuItemClick(item.event)\">\n" +
    "                        <span class=\"bk-submenu-item-label\">{{item.label}}</span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/multi-section-list/multi-section-list-item/multi-section-list-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/multi-section-list/multi-section-list-item/multi-section-list-item.html",
    "<div class=\"bk-multi-section-list-item\">\n" +
    "    <div class=\"bk-multi-section-list-item-name\">{{ $ctrl.getItemName() }}</div>\n" +
    "    <div class=\"bk-multi-section-list-item-action\">\n" +
    "        <bk-secondary-button class=\"bk-multi-section-list-item-action-button\" text=\"{{ $ctrl.getActionLabel()}}\" ng-click=\"$ctrl.handleAction()\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "    <div class=\"bk-multi-section-list-item-content\" ng-transclude></div>\n" +
    "    <div class=\"bk-multi-section-list-item-subtext\">{{ $ctrl.getItemSubtext() }}</div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/multi-section-list/multi-section-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/multi-section-list/multi-section-list.html",
    "<div class=\"bk-multi-section-list\" ng-transclude></div>");
}]);

angular.module("src/common/widgets/multi-sections-navigable-list/base-item-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/multi-sections-navigable-list/base-item-template.html",
    "<div class=\"bk-simple-item\">\n" +
    "    <span class=\"bk-title\">{{item.title}} </span>\n" +
    "    <span class=\"bk-subtitle\">{{item.subTitle}}</span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/multi-sections-navigable-list/multi-section-navigable-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/multi-sections-navigable-list/multi-section-navigable-list.html",
    "<div class=\"bk-multi-section\" ng-keypress=\"$ctrl.keyPressed($event)\" ng-click=\"$ctrl.onClick($event)\" ng-mousedown=\"$ctrl.onMouseDown($event)\" ng-mouseenter=\"$ctrl.onMouseEnter()\" ng-mouseleave=\"$ctrl.onMouseLeave()\">\n" +
    "\n" +
    "    <div class=\"bk-sections\">\n" +
    "       <bk-multi-expandable-section class=\"bk-section-container\" bk-ctrl=\"section\" ng-repeat=\"section in $ctrl._sections track by $index\">\n" +
    "       </bk-multi-expandable-section>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/multi-sections-navigable-list/navigable-section.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/multi-sections-navigable-list/navigable-section.html",
    "<ul class=\"bk-section\">\n" +
    "    <div class=\"bk-section-header\">\n" +
    "        <div class=\"bk-section-header-text\" ng-if=\"$ctrl.headerTitle\">\n" +
    "            {{ $ctrl.headerTitle}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-section-items\">\n" +
    "         <div ng-repeat=\"item in $ctrl.items | limitTo:$ctrl.limitTo track by $index\" class=\"bk-multi-section-item-container\" ng-class=\"{'bk-active' : $ctrl.isItemHighlighted($index)}\" ng-click=\"$ctrl.onItemClicked($index)\" ng-include=\"$ctrl.itemTemplateUrl\">\n" +
    "             <p></p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-repeat-view-all\" ng-if=\"$ctrl.allowExpansion && !$ctrl.isFullyExpanded\">\n" +
    "        <span ng-switch=\"$ctrl.isFetching\" ng-show=\"$ctrl.showExpansionButton()\">\n" +
    "            <span ng-switch-when=\"true\">\n" +
    "                 <div class=\"bk-repeat-loading-indicator\"></div>\n" +
    "            </span>\n" +
    "            <span ng-switch-when=\"false\" class=\"bk-repeat-view-all-label\" ng-click=\"$ctrl.viewAllClicked()\">\n" +
    "                <span>{{ $ctrl.strings.View_All }}</span>\n" +
    "                <span class=\"bk-expand-btn-light-bg bk-arrow-expanded\"></span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</ul>");
}]);

angular.module("src/common/widgets/name-value-pairs/name-value-pairs.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/name-value-pairs/name-value-pairs.html",
    "<div ng-repeat=\"nameValuePair in $ctrl.nameValuePairs\" class=\"bk-name-value-component\">\n" +
    "    <span class=\"bk-name\">\n" +
    "        {{nameValuePair.name}}:\n" +
    "    </span>\n" +
    "    <span class=\"bk-value\">\n" +
    "        {{nameValuePair.value}}\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/popover/blink-positionable-popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/popover/blink-positionable-popover.html",
    "<div class=\"bk-popover\" ng-class=\"additionalCssClasses\" ng-show=\"show\" ng-style=\"{'top': y, 'left': x}\">\n" +
    "    <ul>\n" +
    "        <li class=\"bk-popover-row\" ng-repeat=\"(key, value) in data\">\n" +
    "            <span class=\"bk-key\">{{key}}:</span>\n" +
    "            <span class=\"bk-value\">{{value}}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/profile-pic/profile-pic.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/profile-pic/profile-pic.html",
    "<div class=\"bk-profile-pic-container\" ng-switch=\"!!userAvatar\" blink-tooltip=\"{{getTooltip()}}\">\n" +
    "    <span ng-switch-when=\"false\" class=\"bk-profile-content\">\n" +
    "            <img ng-src=\"{{picUrl}}\">\n" +
    "    </span>\n" +
    "    <div ng-switch-when=\"true\" ng-style=\"{'background-color' : userAvatar.userColor}\">\n" +
    "        <div class=\"bk-profile-content\">{{userAvatar.userIcon}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/radio-button/radio-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/radio-button/radio-button.html",
    "<div class=\"bk-form-radio\" ng-class=\"{'bk-selected': $ctrl.isSelected(), 'bk-disabled': $ctrl.isDisabled()}\" ng-click=\"$ctrl.handleClick()\">\n" +
    "    <div class=\"bk-radio-button\"></div>\n" +
    "    <div class=\"bk-radio-label\">{{$ctrl.getLabel()}}</div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/range-select/numeric-range-selector/date-range-select/date-range-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/range-select/numeric-range-selector/date-range-select/date-range-select.html",
    "<div class=\"bk-range-select\">\n" +
    "    <div class=\"bk-range-select-row bk-range-select-first-operator\">\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <select class=\"bk-op-selector\" ng-model=\"selectedFirstOperatorOption\" ng-options=\"option.label for option in firstOperatorOptions track by option.operator\" ng-change=\"onFirstOperatorChange()\" ng-disabled=\"isReadOnly\" chosen data-width=\"54\"></select>\n" +
    "        </div>\n" +
    "        <input type=\"text\" bs-datepicker date-format=\"{{dateFormat}}\" placeholder=\"{{getPlaceholderText()}}\" today-btn=\"true\" today-highlight=\"true\" ng-model=\"rangeDefinition.firstOperand\" ng-disabled=\"isReadOnly\" ng-readonly=\"isReadOnly\" data-date-type=\"string\" class=\"bk-value-selector\" blink-on-enter=\"firstOperandOnEnter()\" blink-on-escape=\"firstOperandOnEscape()\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-range-select-row bk-range-select-second-operator\">\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <select ng-disabled=\"disableSecondOperator || isReadOnly\" class=\"bk-op-selector\" ng-model=\"selectedSecondOperatorOption\" ng-change=\"onSecondOperatorChange()\" ng-options=\"option.label for option in secondOperatorOptions track by option.operator\" chosen data-width=\"54\"></select>\n" +
    "        </div>\n" +
    "        <input type=\"text\" bs-datepicker date-format=\"{{dateFormat}}\" placeholder=\"{{getPlaceholderText()}}\" today-btn=\"true\" today-highlight=\"true\" ng-model=\"rangeDefinition.secondOperand\" ng-disabled=\"isReadOnly\" ng-readonly=\"disableSecondOperator || isReadOnly\" data-date-type=\"string\" class=\"bk-value-selector\" blink-on-enter=\"secondOperandOnEnter()\" blink-on-escape=\"secondOperandOnEscape()\" ng-click=\"autoSelectSecondOperator()\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/range-select/numeric-range-selector/numeric-range-select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/range-select/numeric-range-selector/numeric-range-select.html",
    "<div class=\"bk-range-select\">\n" +
    "    <form name=\"rangeSelectForm\">\n" +
    "        <div class=\"bk-range-select-row bk-range-select-first-operator\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <select class=\"bk-op-selector\" ng-model=\"selectedFirstOperatorOption\" ng-options=\"option.label for option in firstOperatorOptions track by option.operator\" ng-change=\"onFirstOperatorChange()\" ng-disabled=\"isReadOnly\" chosen data-width=\"54\"></select>\n" +
    "            </div>\n" +
    "            <input class=\"bk-value-selector\" type=\"text\" name=\"firstOperand\" ng-pattern=\"getValidator()\" ng-model=\"rangeDefinition.firstOperand\" placeholder=\"{{getPlaceholderText(rangeDefinition.firstOperator)}}\" ng-class=\"{'bk-validation-failed': rangeSelectForm.firstOperand.$error.pattern }\" ng-readonly=\"isReadOnly\" blink-on-enter=\"firstOperandOnEnter()\" blink-on-escape=\"firstOperandOnEscape()\">\n" +
    "        </div>\n" +
    "        <div class=\"bk-range-select-row bk-range-select-second-operator\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <select class=\"bk-op-selector\" ng-model=\"selectedSecondOperatorOption\" ng-options=\"option.label for option in secondOperatorOptions track by option.operator\" ng-change=\"onSecondOperatorChange()\" ng-disabled=\"disableSecondOperator || isReadOnly\" chosen data-width=\"54\"></select>\n" +
    "            </div>\n" +
    "            <input class=\"bk-value-selector\" type=\"text\" name=\"secondOperand\" ng-pattern=\"getValidator()\" ng-model=\"rangeDefinition.secondOperand\" placeholder=\"{{getPlaceholderText(secondOperator)}}\" ng-readonly=\"disableSecondOperator || isReadOnly\" ng-click=\"autoSelectSecondOperator()\" blink-on-enter=\"secondOperandOnEnter()\" blink-on-escape=\"secondOperandOnEscape()\">\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/replay-controls/replay-controls.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/replay-controls/replay-controls.html",
    "<div class=\"bk-replay-controls\">\n" +
    "    <div class=\"bk-replay-paused\" ng-show=\"isPaused()\">\n" +
    "       <div class=\"container\">\n" +
    "        <div class=\"bk-viz-btn-icon bk-style-icon-pause\"></div>\n" +
    "            <h2>{{strings.Press_escape_to}}</h2>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-replay-played\" ng-show=\"!isPaused()\">\n" +
    "        <div class=\"container\">\n" +
    "            <div class=\"bk-viz-btn-icon bk-style-icon-play\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/select/select.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/select/select.html",
    "<div class=\"bk-select {{$ctrl.customCssClass}}\" ng-class=\"{'bk-dropdown-open': $ctrl.showDropdown, 'bk-disabled': $ctrl.isDisabled}\">\n" +
    "    <div class=\"bk-select-head\" ng-click=\"$ctrl.onHeadClick($event)\" ng-class=\"{'bk-disabled': $ctrl.isDisabled}\">\n" +
    "        <div class=\"bk-selected-value\">{{$ctrl.getSelectedText()}}</div>\n" +
    "        <img class=\"bk-select-arrow\" ng-src=\"{{$ctrl.getDropdownArrowIcon()}}\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-select-body {{$ctrl.customCssClass}}\" ng-show=\"$ctrl.showDropdown\" blink-overlay=\"$ctrl.closeDropdown()\" ignore-click-selector=\"['.bk-select-body.{{$ctrl.customCssClass}}', '.bk-select.{{$ctrl.customCssClass}} .bk-select-head']\">\n" +
    "        <div ng-repeat=\"(optionID, option) in $ctrl.optionsMap\">\n" +
    "            <div class=\"bk-select-option\" ng-class=\"{'bk-disabled': option.isDisabled, 'bk-selected': $ctrl.isOptionSelected(option)}\" ng-click=\"$ctrl.onOptionClick(option, $event)\">\n" +
    "                <img ng-if=\"$ctrl.isOptionSelected(option)\" class=\"bk-selected-icon\" src=\"/resources/img/checkmark_16.svg\">\n" +
    "                <div class=\"bk-caption\">{{option.caption}}</div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"option.showSeparator\" class=\"bk-separator\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/slick-table/slick-table.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slick-table/slick-table.html",
    "<div class=\"bk-table\" ng-class=\"{'bk-table-with-header-dropdown': $ctrl.containsHeaderDropdown()}\"></div>\n" +
    "<div class=\"bk-pagination-info\" ng-if=\"!!$ctrl.getPaginationInfo()\">\n" +
    "    <span> {{$ctrl.strings.showing.assign({lower: $ctrl.getPaginationInfo().topRow, higher: $ctrl.getPaginationInfo().bottomRow, total: $ctrl.getPaginationInfo().totalRows})}}</span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/slickgrid/clipboard-copy-confirmation-view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slickgrid/clipboard-copy-confirmation-view.html",
    "<div class=\"bk-data-copy-confirmation\">\n" +
    "    <i class=\"bk-style-icon-circled-checkmark\"></i>\n" +
    "    <span>{{strings.Copied_to}}</span>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/slickgrid/context-menu-item-copy-data.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slickgrid/context-menu-item-copy-data.html",
    "<div class=\"context-sub-menu\" table-context-menu-copy-data>\n" +
    "    <div class=\"context-sub-menu-title-container\">\n" +
    "        <div class=\"bk-icon bk-style-icon-clipboard\"></div>\n" +
    "{{strings.Copy_to}}\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/slickgrid/slickgrid-table.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slickgrid/slickgrid-table.html",
    "<div class=\"bk-slickgrid-table\" blink-on-escape=\"onEscape()\">\n" +
    "    <div clipboard-copy-confirmation-view blink-auto-hide-view show=\"showCopyConfirmation\"></div>\n" +
    "    <div ng-hide=\"noData\" class=\"bk-table-container\"></div>\n" +
    "    <div ng-show=\"noData\" class=\"bk-no-content-placeholder\">{{ 'No data to display' | l10n }}</div>\n" +
    "    <div ng-hide=\"noData\" class=\"bk-pagination-info\">\n" +
    "        <span>{{strings.showing.assign(\n" +
    "                {lower: paginationInfo.topRow,\n" +
    "                higher: paginationInfo.bottomRow,\n" +
    "                total: paginationInfo.totalRows})}}\n" +
    "        </span>\n" +
    "        <span ng-switch on=\"paginationInfo.hasMoreData\">\n" +
    "            <span ng-switch-when=\"true\">\n" +
    "                <span>{{strings.Results_are_limited}}</span>{{ paginationInfo.maxRows }}\n" +
    "                <span>{{strings.rows}}</span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"read-only-text-cell\">\n" +
    "    <div class=\"bk-readonly-value\">{1}</div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"editable-text-cell\">\n" +
    "    <div class=\"edit-wrapper\">\n" +
    "        <div class=\"bk-value\">{1}</div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"text-cell-placeholder\">\n" +
    "    <span class=\"placeholder\">{1}</span>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"select-cell\">\n" +
    "    <span class=\"bk-select-box\">\n" +
    "        <ui-select ng-model=\"selectedValue\"\n" +
    "                   on-select=\"onEdit($item)\"\n" +
    "                   class=\"slick-cell-editor\"\n" +
    "                   theme=\"select2\"\n" +
    "                   append-to-body=\"true\"\n" +
    "                   search-enabled=\"false\">\n" +
    "            <ui-select-match>{{$select.selected}}</ui-select-match>\n" +
    "            <ui-select-choices repeat=\"option in options\">\n" +
    "                {{option}}\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "    </span>\n" +
    "</script>");
}]);

angular.module("src/common/widgets/slide-show/slide-show-navigator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slide-show/slide-show-navigator.html",
    "<div class=\"bk-presentation-mode-container\">\n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    <div class=\"bk-slide-show-navigator\">\n" +
    "        <div class=\"bk-scrollable-container\" ng-show=\"!$ctrl.inSizingTransition\">\n" +
    "            <h3>{{ $ctrl.navigator.getTitle() }}</h3>\n" +
    "            <ol>\n" +
    "                <li ng-repeat=\"slide in $ctrl.navigator.slides\" ng-click=\"$ctrl.navigator.goToSlide(slide)\" ng-class=\"{ 'bk-active': slide.isActive()}\"><span ng-bind-html=\"slide.getTitle()\"></span></li>\n" +
    "            </ol>\n" +
    "        </div>\n" +
    "        <bk-primary-button text=\"{{ $ctrl.strings.CLOSE }}\" ng-click=\"$ctrl.navigator.stopSlideShow()\" class=\"bk-close-slideshow\"></bk-primary-button>\n" +
    "    </div>\n" +
    "    <div class=\"bk-sizing-btn bk-collapse-btn\" ng-show=\"!$ctrl.isCollapsed && !$ctrl.inSizingTransition\" ng-click=\"$ctrl.collapsePanel()\">&laquo;</div>\n" +
    "    <div class=\"bk-sizing-btn bk-expand-btn\" ng-show=\"$ctrl.isCollapsed && !$ctrl.inSizingTransition\" ng-click=\"$ctrl.expandPanel()\">&raquo;</div>\n" +
    "    <div class=\"bk-close-btn\" ng-click=\"$ctrl.navigator.stopSlideShow()\" blink-tooltip=\"Exit fullscreen\" data-placement=\"left\">&times;</div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/slider/slider.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/slider/slider.html",
    "<blink-slider-handle type=\"low\" class=\"bk-low\" title=\"{{$parent.getLowHandleTooltipText()}}\" left=\"pixelLeft\" right=\"pixelHighHandle\" fixed=\"isDisabled() || isLowBarFixed()\">\n" +
    "    <div class=\"bk-handle-grip\"></div>\n" +
    "</blink-slider-handle>\n" +
    "<blink-slider-handle type=\"high\" class=\"bk-high\" title=\"{{$parent.getHighHandleTooltipText()}}\" left=\"pixelLowHandle\" right=\"pixelRight\" fixed=\"isDisabled() || isHighBarFixed()\">\n" +
    "</blink-slider-handle>\n" +
    "<div class=\"selection-indicator\" ng-style=\"{'opacity': (!shouldHideSelectionBar() && 1) || 0}\"></div>");
}]);

angular.module("src/common/widgets/style-configuration/background-configurator/background-configurator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/style-configuration/background-configurator/background-configurator.html",
    "<div class=\"bk-style-background-configurator\">\n" +
    "    <ul class=\"bk-style-background-configurator-prop-list\">\n" +
    "        <li>\n" +
    "            <div class=\"bk-style-background-configurator-prop-name\">\n" +
    "                {{ $ctrl.getColorPropertyName() }}\n" +
    "            </div>\n" +
    "            <div class=\"bk-style-background-configurator-prop-configurator\">\n" +
    "                <bk-color-configurator bk-ctrl=\"$ctrl.getColorConfiguratorComponent()\">\n" +
    "                </bk-color-configurator>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/style-configuration/color-configurator/color-configurator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/style-configuration/color-configurator/color-configurator.html",
    "<div class=\"bk-style-color-configurator\">\n" +
    "    <color-picker ng-model=\"$ctrl.color\" on-change=\"$ctrl.handleColorChange()\" fill=\"true\" class=\"bk-style-color-configurator-color-picker\">\n" +
    "    </color-picker>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/tab-control-component/tab-control-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/tab-control-component/tab-control-component.html",
    "<div class=\"bk-tab-control\">\n" +
    "    <ul class=\"bk-tab-header {{$ctrl.headerClass}}\">\n" +
    "        <li ng-repeat=\"tab in $ctrl.tabs\" class=\"tab-header-item\" ng-class=\"{ 'bk-clickable': !$ctrl.isTabDisabled(tab),\n" +
    "                        'bk-tab-header-item-selected': $ctrl.isCurrentTab(tab),\n" +
    "                        'bk-disabed-tab': $ctrl.isTabDisabled(tab)\n" +
    "                        }\" blink-tooltip=\"{{$ctrl.getToolTipText(tab)}}\" ng-click=\"$ctrl.onTabSelected(tab)\">\n" +
    "            <span>{{tab.tabName}}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"bk-tab-body\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/tab-control/tab-control-tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/tab-control/tab-control-tab.html",
    "<div class=\"bk-tab-control-tab\" ng-if=\"isCurrentTab()\" ng-transclude></div>");
}]);

angular.module("src/common/widgets/tab-control/tab-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/tab-control/tab-control.html",
    "<div class=\"bk-tab-control\">\n" +
    "    <ul class=\"bk-tab-header {{headerClass}}\">\n" +
    "        <li ng-repeat=\"tab in tabs\" class=\"bk-clickable tab-header-item\" ng-class=\"{'bk-tab-header-item-selected': isCurrentTab(tab)}\" ng-click=\"onTabSelected(tab)\">\n" +
    "            <span>{{tab.tabName}}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"bk-tab-body\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("src/common/widgets/text-box-customizer/text-box-configurator-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/common/widgets/text-box-customizer/text-box-configurator-component.html",
    "<div class=\"bk-text-box-configurator\">\n" +
    "    <input type=\"text\" placeholder=\"{{ $ctrl.placeHolderText }}\" value=\"{{ $ctrl.inputValue }}\" maxlength=\"{{ $ctrl.textBoxLength }}\" ng-change=\"$ctrl.setTextBox()\" ng-model=\"$ctrl.textBoxModel\" class=\"bk-text-box-input\">\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-algorithm-customizer/a3-algorithm-customizer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-algorithm-customizer/a3-algorithm-customizer.html",
    "<div class=\"bk-a3-algorithm-customizer\">\n" +
    "    <div class=\"bk-section bk-algorithm-customization\" ng-show=\"$ctrl.isA3Viz\">\n" +
    "        <div class=\"bk-title\">{{$ctrl.strings.a3.customizeVizAnalysisAlgorithmsTitle}}</div>\n" +
    "        <form>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Min_Rows}}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"min_rows\" ng-model=\"$ctrl.minRows\" ng-change=\"$ctrl.verifyMinRows()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Multiplier}}</div>\n" +
    "                <input class=\"field-input\" type=\"text\" name=\"multiplier\" ng-model=\"$ctrl.multiplier\" ng-change=\"$ctrl.verifyMultiplier()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"bk-section bk-algorithm-customization\" ng-show=\"$ctrl.isA3Diff\">\n" +
    "        <div class=\"bk-title\">{{$ctrl.strings.a3.customizeDiffAnalysisAlgorithmsTitle}}</div>\n" +
    "        <form>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Max_Diff_Elements}}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"max_diff_elements\" ng-model=\"$ctrl.maxDiffElements\" ng-change=\"$ctrl.verifyMaxDiffElements()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Max_Fraction}}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"max_fraction\" ng-model=\"$ctrl.maxFraction\" ng-change=\"$ctrl.verifyMaxFraction()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Min_Abs_Change_Ratio}}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"min_abs_change_ratio\" ng-model=\"$ctrl.minAbsChangeRatio\" ng-change=\"$ctrl.verifyMinAbsChangeRatio()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <div class=\"label\">{{$ctrl.strings.a3.Min_Change_Ratio}}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"min_change_ratio\" ng-model=\"$ctrl.minChangeRatio\" ng-change=\"$ctrl.verifyMinChangeRatio()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"bk-invalid-input-message\" id=\"invalid_input\" ng-show=\"$ctrl.isInputInvalid\">{{$ctrl.invalidInputMessageString}}\n" +
    "    </div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-analysis-customizer/a3-analysis-customizer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-analysis-customizer/a3-analysis-customizer.html",
    "<div class=\"bk-a3-analysis-customizer\">\n" +
    "    <tab-control class=\"bk-a3-analysis-customizer-tab-container\" on-tab-activated=\"$ctrl.onTabActivated(activeTab)\">\n" +
    "        <tab-control-tab class=\"bk-a3-columns-selector-container\" tab-name=\"{{ $ctrl.strings.a3.selectColumnsTabHeader }}\" tab-id=\"selectColumns\">\n" +
    "            <bk-a3-drill-column-selector class=\"bk-a3-columns-selector-viewer-container\" bk-ctrl=\"$ctrl.a3DrillColumnSelectorComponent\">\n" +
    "            </bk-a3-drill-column-selector>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-exclude-columns-container\" tab-name=\"{{ $ctrl.strings.a3.excludeColumnsTabHeader }}\" tab-id=\"excludedColumns\">\n" +
    "            <bk-a3-exclude-column-selector class=\"bk-a3-exclude-columns-viewer-container\" bk-ctrl=\"$ctrl.a3ExcludeColumnSelectorComponent\">\n" +
    "            </bk-a3-exclude-column-selector>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-customize-algorithms-container\" tab-name=\"{{ $ctrl.strings.a3.customizeAlgorithmsTabHeader }}\" tab-id=\"customizeAlgorithms\">\n" +
    "            <bk-a3-algorithm-customizer class=\"bk-a3-customize-algorithms-viewer-container\" bk-ctrl=\"$ctrl.a3AlgorithmCustomizerComponent\">\n" +
    "            </bk-a3-algorithm-customizer>\n" +
    "        </tab-control-tab>\n" +
    "    </tab-control>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-dashboard/a3-dashboard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-dashboard/a3-dashboard.html",
    "<div class=\"bk-a3-dashboard\">\n" +
    "    <tab-control class=\"bk-a3-dashboard-tab-container\" default-tab-id=\"{{$ctrl.defaultTabId}}\" on-tab-activated=\"$ctrl.onTabActivated(activeTab)\">\n" +
    "        <tab-control-tab class=\"bk-a3-insights-list-container\" tab-name=\"{{strings.a3.dashboard.RESULTS_TAB}}\" tab-id=\"results\">\n" +
    "            <bk-a3-jobs-viewer class=\"bk-a3-results-viewer-container\" bk-ctrl=\"$ctrl.a3ResultsViewerComponent\">\n" +
    "            </bk-a3-jobs-viewer>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-jobs-container\" tab-name=\"{{strings.a3.dashboard.ANALYSIS_TAB}}\" tab-id=\"analyses\">\n" +
    "            <bk-a3-jobs-viewer class=\"bk-a3-jobs-viewer-container\" bk-ctrl=\"$ctrl.a3JobsViewerComponent\">\n" +
    "            </bk-a3-jobs-viewer>\n" +
    "        </tab-control-tab>\n" +
    "    </tab-control>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-dialog-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-dialog-popup.html",
    "<div class=\"bk-a3-dialog-popup\">\n" +
    "    <div class=\"bk-big-popup\" hide=\"$ctrl.hide\">\n" +
    "        <div class=\"bk-context-dialog\">\n" +
    "            <div class=\"popup-header\">\n" +
    "                <span class=\"bk-header-title\">{{$ctrl.strings.a3.customAnalysisTitle}}</span>\n" +
    "                <a type=\"button\" class=\"bk-close\" ng-click=\"$ctrl.hide()\">&times;</a>\n" +
    "            </div>\n" +
    "            <bk-a3-dialog bk-ctrl=\"$ctrl.a3DialogComponent\" class=\"popup-content\">\n" +
    "            </bk-a3-dialog>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-dialog.html",
    "<div class=\"bk-a3-dialog\">\n" +
    "    <bk-a3-analysis-customizer ng-show=\"!$ctrl.isTableAnalysis\" bk-ctrl=\"$ctrl.a3AnalysisCustomizerComponent\">\n" +
    "    </bk-a3-analysis-customizer>\n" +
    "    <bk-a3-table-analysis-customizer ng-show=\"!!$ctrl.isTableAnalysis\" bk-ctrl=\"$ctrl.a3TableAnalysisCustomizerComponent\">\n" +
    "    </bk-a3-table-analysis-customizer>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-drill-column-selector/a3-drill-column-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-drill-column-selector/a3-drill-column-selector.html",
    "<div class=\"bk-a3-column-selector\">\n" +
    "    <div class=\"bk-section\">\n" +
    "        <div class=\"bk-title\">{{$ctrl.strings.a3.selectColumnsTitle}}</div>\n" +
    "        <blink-smart-checkbox-collection class=\"bk-smart-checkbox-collection\" bk-ctrl=\"$ctrl.smartCheckboxCollectionComponent\">\n" +
    "        </blink-smart-checkbox-collection>\n" +
    "    </div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-exclude-column-selector/a3-exclude-column-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-exclude-column-selector/a3-exclude-column-selector.html",
    "<div class=\"bk-a3-exclude-column-selector\">\n" +
    "    <div class=\"bk-section\">\n" +
    "        <div class=\"bk-title\">{{$ctrl.strings.a3.excludeColumnsTitle}}</div>\n" +
    "        <blink-smart-checkbox-collection class=\"bk-smart-checkbox-collection\" bk-ctrl=\"$ctrl.smartCheckboxCollectionComponent\">\n" +
    "        </blink-smart-checkbox-collection>\n" +
    "    </div>\n" +
    "    <bk-checkbox class=\"bk-remember-setting-checkbox\" bk-ctrl=\"$ctrl.checkboxComponent\">\n" +
    "    </bk-checkbox>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-insights-summary/a3-insights-summary.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-insights-summary/a3-insights-summary.html",
    "<div class=\"bk-a3-insights-summary\">\n" +
    "    <div class=\"bk-a3-insights-description-container\">\n" +
    "        <div class=\"bk-a3-insights-description\">\n" +
    "            {{ $ctrl.getInsightsHeaderDescription() }}\n" +
    "            <a class=\"bk-a3-insights-edit-query\" ng-click=\"$ctrl.launchCustomizationDialog()\">\n" +
    "               {{ $ctrl.strings.a3.EDIT_ANALYSIS_TEXT }}\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <br>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-a3-insights-original-query\">\n" +
    "        <span class=\"bk-a3-insights-summary-key\" blink-tooltip=\"{{$ctrl.originalQuery}}\">\n" +
    "              {{$ctrl.strings.a3.ORIGINAL_QUERY}}\n" +
    "              </span>:\n" +
    "        {{$ctrl.originalQuery}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-job-detail-popup/a3-job-detail-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-job-detail-popup/a3-job-detail-popup.html",
    "<div class=\"bk-a3-job-detail-popup\">\n" +
    "    <div class=\"bk-big-popup\" hide=\"$ctrl.hide\">\n" +
    "        <div class=\"bk-context-dialog\">\n" +
    "            <div class=\"popup-header\">\n" +
    "                <span class=\"bk-header-title\">{{$ctrl.strings.a3.customAnalysisTitle}}</span>\n" +
    "                <a type=\"button\" class=\"bk-close\" ng-click=\"$ctrl.hide()\">&times;</a>\n" +
    "            </div>\n" +
    "            <bk-a3-job-detail bk-ctrl=\"$ctrl.a3JobDetailComponent\" class=\"popup-content\">\n" +
    "            </bk-a3-job-detail>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-job-detail/a3-job-detail.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-job-detail/a3-job-detail.html",
    "<div class=\"bk-a3-job-detail\">\n" +
    "    <tab-control class=\"bk-a3-job-detail-tab-container\" on-tab-activated=\"$ctrl.onTabActivated(activeTab)\">\n" +
    "        <tab-control-tab class=\"bk-a3-job-run-tab\" tab-name=\"Job Runs\" tab-id=\"jobs\">\n" +
    "            <bk-a3-runs-viewer class=\"bk-a3-runs-viewer-container\" bk-ctrl=\"$ctrl.a3RunsViewerComponent\">\n" +
    "            </bk-a3-runs-viewer>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-job-schedule-container\" tab-name=\"Job Schedule\" tab-id=\"schedule\">\n" +
    "            <bk-a3-job-schedule-configurator class=\"bk-a3-job-schedule-configurator-container\" bk-ctrl=\"$ctrl.a3JobScheduleConfiguratorComponent\">\n" +
    "            </bk-a3-job-schedule-configurator>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-job-customization-container\" tab-name=\"Customize\" tab-id=\"customize\">\n" +
    "            <bk-a3-analysis-customizer class=\"bk-a3-analysis-customizer-container\" bk-ctrl=\"$ctrl.a3AnalysisCustomizerComponent\" ng-show=\"!!$ctrl.a3AnalysisCustomizerComponent\">\n" +
    "            </bk-a3-analysis-customizer>\n" +
    "            <bk-a3-table-analysis-customizer class=\"bk-a3-table-analysis-customizer-container\" bk-ctrl=\"$ctrl.a3TableAnalysisCustomizerComponent\" ng-show=\"!!$ctrl.a3TableAnalysisCustomizerComponent\">\n" +
    "            </bk-a3-table-analysis-customizer>\n" +
    "        </tab-control-tab>\n" +
    "    </tab-control>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-job-schedule-configurator/a3-job-schedule-configurator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-job-schedule-configurator/a3-job-schedule-configurator.html",
    "<div class=\"bk-a3-job-schedule-configurator bk-job-schedule-page\">\n" +
    "    <div class=\"bk-job-schedule\">\n" +
    "        <div class=\"bk-job-schedule-body\">\n" +
    "            <div class=\"bk-schedule-section\">\n" +
    "                <div class=\"bk-schedule bk-dialog\">\n" +
    "                    <bk-scheduler schedule-config=\"$ctrl.scheduleConfig\">\n" +
    "                    </bk-scheduler>\n" +
    "                    <div class=\"bk-configurator-buttons\">\n" +
    "                        <bk-secondary-button text=\"{{ strings.Cancel }}\" ng-click=\"$ctrl.onCancel()\" class=\"bk-cancel-btn\">\n" +
    "                        </bk-secondary-button>\n" +
    "                        <bk-primary-button text=\"{{ strings.report.schedule }}\" ng-click=\"$ctrl.onSchedule()\" class=\"bk-schedule-btn\">\n" +
    "                        </bk-primary-button>\n" +
    "                        <div style=\"clear:both\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/a3-jobs-viewer/a3-jobs-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-jobs-viewer/a3-jobs-viewer.html",
    "<metadata-list-page class=\"bk-a3-jobs-viewer\" bk-ctrl=\"$ctrl.listPageController\"></metadata-list-page>");
}]);

angular.module("src/modules/a3/a3-results-viewer/a3-results-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-results-viewer/a3-results-viewer.html",
    "<metadata-list-page class=\"bk-a3-results-viewer\" bk-ctrl=\"$ctrl.listPageController\">\n" +
    "</metadata-list-page>");
}]);

angular.module("src/modules/a3/a3-runs-viewer/a3-runs-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/a3-runs-viewer/a3-runs-viewer.html",
    "<div class=\"bk-a3-runs-viewer\">\n" +
    "    <actionable-list on-row-click=\"$ctrl.onRowClick\" list-model=\"$ctrl.listModel\">\n" +
    "    </actionable-list>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/table/a3-table-analysis.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/table/a3-table-analysis.html",
    "<div class=\"bk-a3-table-analysis\">\n" +
    "    <div class=\"bk-title\">{{$ctrl.analysisTitle}}</div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ $ctrl.strings.a3.autoAnalyze }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "    <div class=\"bk-title\">{{$ctrl.customAnalysisTitle}}</div>\n" +
    "    <bk-primary-button class=\"bk-custom-analysis-button\" text=\"{{ $ctrl.strings.a3.customAnalysisTitle }}\" ng-click=\"$ctrl.customize()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/table/algorithm-customizer/table-algorithm-customizer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/table/algorithm-customizer/table-algorithm-customizer.html",
    "<div class=\"bk-table-algorithm-customizer\">\n" +
    "    <div class=\"bk-section bk-table-algorithm-customization\">\n" +
    "        <div class=\"bk-title\">{{ strings.a3.customizeTableAnalysisAlgorithmsTitle }}</div>\n" +
    "        <form>\n" +
    "            <div>\n" +
    "                <div class=\"label2\">{{ strings.a3.Min_Rows }}</div>\n" +
    "                <input class=\"field-input\" type=\"number\" name=\"min_rows\" ng-model=\"$ctrl.minRows\" ng-change=\"$ctrl.verifyMinRows()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <div class=\"label2\">{{ strings.a3.Multiplier }}</div>\n" +
    "                <input class=\"field-input\" type=\"text\" name=\"multiplier\" ng-model=\"$ctrl.multiplier\" ng-change=\"$ctrl.verifyMultiplier()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"bk-invalid-input-message2\" id=\"invalid_input\" ng-show=\"$ctrl.isInputInvalid\">{{$ctrl.invalidInputMessageString}}\n" +
    "    </div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/table/analysis-customizer/a3-table-analysis-customizer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/table/analysis-customizer/a3-table-analysis-customizer.html",
    "<div class=\"bk-a3-table-analysis-customizer\">\n" +
    "    <tab-control class=\"bk-a3-table-analysis-customizer-tab-container\" on-tab-activated=\"$ctrl.onTabActivated(activeTab)\">\n" +
    "        <tab-control-tab class=\"bk-a3-table-columns-selector-container\" tab-name=\"{{ $ctrl.strings.a3.selectColumnsTabHeader }}\" tab-id=\"selectColumns\">\n" +
    "            <bk-a3-table-column-selector class=\"bk-a3-table-columns-selector-viewer-container\" bk-ctrl=\"$ctrl.a3TableColumnSelectorComponent\">\n" +
    "            </bk-a3-table-column-selector>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-table-exclude-columns-container\" tab-name=\"{{ $ctrl.strings.a3.excludeColumnsTabHeader }}\" tab-id=\"excludedColumns\">\n" +
    "            <bk-a3-table-column-excluder class=\"bk-a3-table-exclude-columns-viewer-container\" bk-ctrl=\"$ctrl.a3TableColumnExcluderComponent\">\n" +
    "            </bk-a3-table-column-excluder>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab class=\"bk-a3-table-customize-algorithms-container\" tab-name=\"{{ $ctrl.strings.a3.customizeAlgorithmsTabHeader }}\" tab-id=\"customizeAlgorithms\">\n" +
    "            <bk-table-algorithm-customizer class=\"bk-a3-table-customize-algorithms-viewer-container\" bk-ctrl=\"$ctrl.tableAlgorithmCustomizerComponent\">\n" +
    "            </bk-table-algorithm-customizer>\n" +
    "        </tab-control-tab>\n" +
    "    </tab-control>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/table/column-excluder/a3-table-column-excluder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/table/column-excluder/a3-table-column-excluder.html",
    "<div class=\"bk-a3-table-column-excluder\">\n" +
    "    <div class=\"bk-section\">\n" +
    "        <div class=\"bk-title\">{{ strings.a3.excludeColumnsTitle }}</div>\n" +
    "        <blink-smart-checkbox-collection class=\"bk-smart-checkbox-collection\" bk-ctrl=\"$ctrl.smartCheckboxCollectionComponent2\">\n" +
    "        </blink-smart-checkbox-collection>\n" +
    "    </div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/a3/table/column-selector/a3-table-column-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/a3/table/column-selector/a3-table-column-selector.html",
    "<div class=\"bk-a3-table-column-selector\">\n" +
    "    <div class=\"bk-section\">\n" +
    "        <div class=\"bk-title\">{{ strings.a3.selectColumnsTitle }}</div>\n" +
    "        <blink-smart-checkbox-collection class=\"bk-smart-checkbox-collection\" bk-ctrl=\"$ctrl.smartCheckboxCollectionComponent2\">\n" +
    "        </blink-smart-checkbox-collection>\n" +
    "    </div>\n" +
    "    <bk-primary-button class=\"bk-trigger-analysis-button\" text=\"{{ strings.a3.triggerAnalysis }}\" ng-click=\"$ctrl.trigger()\">\n" +
    "    </bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/add-email/add-email.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/add-email/add-email.html",
    "<div class=\"bk-add-email\">\n" +
    "    <div class=\"label\">{{strings.Emails}}</div>\n" +
    "    <input class=\"input-box\" type=\"text\" ng-model=\"$ctrl.emails\" spellcheck=\"false\">\n" +
    "    <div class=\"bk-add-users-buttons\">\n" +
    "        <bk-primary-button text=\"{{strings.Add}}\" is-disabled=\"$ctrl.isAddEmailDisabled()\" ng-click=\"$ctrl.addClicked()\" class=\"bk-add-permissions-btn\">\n" +
    "\n" +
    "        </bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/add-principal/add-principal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/add-principal/add-principal.html",
    "<div class=\"bk-add-principal\">\n" +
    "    <div ng-if=\"$ctrl.name && !!$ctrl.name.length\" class=\"label\">{{$ctrl.name}}</div>\n" +
    "    <div class=\"bk-new-permission\">\n" +
    "        \n" +
    "        <div class=\"bk-multiselect-input\">\n" +
    "            <bk-principal-selector bk-ctrl=\"$ctrl.principalSelectorComponent\">\n" +
    "            </bk-principal-selector>\n" +
    "        </div>\n" +
    "        \n" +
    "        <bk-permission-dropdown class=\"bk-select-box\" bk-ctrl=\"$ctrl.newPermissionTypeDropDown\" ng-if=\"$ctrl.displayPermissionPlugin\">\n" +
    "        </bk-permission-dropdown>\n" +
    "    </div>\n" +
    "    <div class=\"bk-add-users-buttons\">\n" +
    "        <bk-secondary-button text=\"{{ strings.CANCEL }}\" ng-if=\"$ctrl.displayPermissionPlugin\" ng-click=\"$ctrl.cancel()\"></bk-secondary-button>\n" +
    "        <bk-primary-button text=\"{{ strings.ADD_AND_SAVE }}\" ng-click=\"$ctrl.addPermissions()\" class=\"bk-add-permissions-btn\"></bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/admin-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/admin-page.html",
    "<div blink-admin></div>");
}]);

angular.module("src/modules/admin/admin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/admin.html",
    "<div class=\"bk-vertical-flex-container-sized\">\n" +
    "    <div class=\"bk-metadata-list bk-admin\">\n" +
    "        <bk-secondary-button text=\"{{ userManagement.addUserButtonLabel }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"createUser()\" class=\"bk-add-user-button\" ng-if=\"showAddUserButtonDropdown\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ userManagement.addGroupButtonLabel }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"createGroup()\" class=\"bk-add-group-button\" ng-if=\"showAddGroupButtonDropdown\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ userManagement.addRoleButtonLabel }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"createRole()\" class=\"bk-add-role-button\" ng-if=\"showAddRoleButtonDropdown\"></bk-secondary-button>\n" +
    "        <div class=\"tab-navigation\">\n" +
    "            <tab-control header-class=\"primary-nav\" on-tab-activated=\"onPrimaryTabActivated(activeTab)\">\n" +
    "                <tab-control-tab tab-name=\"{{ userManagement.tabHeader }}\" tab-id=\"{{ userManagement.tabId }}\">\n" +
    "                    <tab-control on-tab-activated=\"onSecondaryTabActivated(activeTab)\">\n" +
    "                        <tab-control-tab tab-name=\"{{ userManagement.tabUsers.name }}\" tab-id=\"{{ userManagement.tabUsers.id }}\">\n" +
    "                            <metadata-list-page bk-ctrl=\"userListCtrl\" class=\"bk-table-list\"></metadata-list-page>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab tab-name=\"{{ userManagement.tabGroups.name }}\" tab-id=\"{{ userManagement.tabGroups.id }}\">\n" +
    "                            <metadata-list-page bk-ctrl=\"groupListCtrl\" class=\"bk-table-list\"></metadata-list-page>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab ng-if=\"isRoleEnabled\" tab-name=\"{{ userManagement.tabRoles.name }}\" tab-id=\"{{ userManagement.tabRoles.id }}\">\n" +
    "                            <metadata-list-page bk-ctrl=\"roleListCtrl\" class=\"bk-table-list\"></metadata-list-page>\n" +
    "                        </tab-control-tab>\n" +
    "                    </tab-control>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"{{ dataManagement.tabHeader }}\" tab-id=\"{{ dataManagement.tabId }}\">\n" +
    "                    <tab-control>\n" +
    "                        <tab-control-tab tab-name=\"{{ dataManagement.tabBusinessDataModel.name }}\" tab-id=\"dataManagement.tabBusinessDataModel.id\">\n" +
    "                            <div class=\"bk-file-upload-metadata tab-content\">\n" +
    "                                <div ng-include=\"'src/modules/admin/file-upload-metadata.html'\"></div>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab tab-name=\"{{ dataManagement.tabDataSecurity.name }}\" tab-id=\"{{ dataManagement.tabDataSecurity.id }}\">\n" +
    "                            <div class=\"bk-file-upload-metadata tab-content\">\n" +
    "                                <div ng-include=\"'src/modules/admin/file-upload-security.html'\"></div>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                    </tab-control>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"{{ healthManagement.tabHeader }}\" tab-id=\"{{ healthManagement.tabId }}\" class=\"larger-content\">\n" +
    "                    <tab-control on-tab-activated=\"onSecondaryTabActivated(activeTab)\">\n" +
    "                        <tab-control-tab tab-name=\"{{ healthManagement.tabOverview.name }}\" tab-id=\"{{ healthManagement.tabOverview.id }}\">\n" +
    "                            <div class=\"tab-content\" ng-controller=\"PinboardPageController\">\n" +
    "                                <pinboard-page class=\"bk-health-management-overview-pinboard\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"healthManagement.tabOverview.guid\" pinboard-page-config=\"pinboardPageConfig\">\n" +
    "                                </pinboard-page>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab tab-name=\"{{ healthManagement.tabData.name }}\" tab-id=\"{{ healthManagement.tabData.id }}\">\n" +
    "                            <div class=\"tab-content\" ng-controller=\"PinboardPageController\">\n" +
    "                                <pinboard-page class=\"bk-health-management-data-pinboard\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"healthManagement.tabData.guid\" pinboard-page-config=\"pinboardPageConfig\">\n" +
    "                                </pinboard-page>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab tab-name=\"{{ healthManagement.tabCluster.name }}\" tab-id=\"{{ healthManagement.tabCluster.id }}\">\n" +
    "                            <div class=\"tab-content\" ng-controller=\"PinboardPageController\">\n" +
    "                                <pinboard-page class=\"bk-health-management-cluster-pinboard\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"healthManagement.tabCluster.guid\" pinboard-page-config=\"pinboardPageConfig\">\n" +
    "                                </pinboard-page>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                        <tab-control-tab tab-name=\"{{ healthManagement.tabAlert.name }}\" tab-id=\"{{ healthManagement.tabAlert.id }}\">\n" +
    "                            <div class=\"tab-content\" ng-controller=\"PinboardPageController\">\n" +
    "                                <pinboard-page class=\"bk-health-management-alert-pinboard\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"healthManagement.tabAlert.guid\" pinboard-page-config=\"pinboardPageConfig\">\n" +
    "                                </pinboard-page>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                    </tab-control>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"{{ styleCustomization.tabHeader }}\" tab-id=\"{{ styleCustomization.tabId }}\" ng-if=\"isStyleCustomizationEnabled\">\n" +
    "                    <tab-control>\n" +
    "                        <tab-control-tab tab-name=\"{{ styleCustomization.tabRules.name }}\" tab-id=\"{{ styleCustomization.tabRules.id }}\">\n" +
    "                            <div class=\"tab-content\">\n" +
    "                                <bk-style-customizer bk-ctrl=\"styleCustomizer\"></bk-style-customizer>\n" +
    "                            </div>\n" +
    "                        </tab-control-tab>\n" +
    "                    </tab-control>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"{{ jobManagement.tabHeader }}\" tab-id=\"{{ jobManagement.tabId }}\" ng-if=\"isSchedulingEnabled\">\n" +
    "                        <div class=\"primary-tab-content bk-data-list\">\n" +
    "                            <bk-job-status-viewer class=\"status-viewer\" ng-if=\"shouldShowStatusViewer\" bk-ctrl=\"jobStatusViewerCtrl\"></bk-job-status-viewer>\n" +
    "                            <metadata-list-page bk-ctrl=\"jobsListCtrl\" class=\"bk-table-list\"></metadata-list-page>\n" +
    "                        </div>\n" +
    "                </tab-control-tab>\n" +
    "            </tab-control>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <script type=\"text/ng-template\" id=\"admin-author-column.html\">\n" +
    "        <blink-profile-pic user-id=\"column.format(row)[0]\"\n" +
    "                            user-display-name=\"column.format(row)[1]\"\n" +
    "                            class=\"bk-profile-pic\">\n" +
    "        </blink-profile-pic>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/file-upload-metadata.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/file-upload-metadata.html",
    "<div class=\"bk-upload-step bk-upload-step-left\">\n" +
    "    <div class=\"bk-upload-step-arrow-1\"></div>\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        1\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "{{strings.Download_the}}\n" +
    "</div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.Click_on_the}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-download-button\">\n" +
    "        <div class=\"bk-download-file-name\">{{ fileName.tabBusinessDataModel.DATA_MODEL_FILE_NAME }}</div>\n" +
    "        <a href=\"/callosum/v1/modeling/download\">\n" +
    "                <bk-secondary-button text=\"{{ strings.DOWNLOAD }}\" icon=\"bk-style-icon-download\" class=\"\"></bk-secondary-button>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"bk-upload-step bk-upload-step-right\">\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        2\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "{{strings.Update_the}}\n" +
    "</div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.Set_the_column}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-illustration\"></div>\n" +
    "</div>\n" +
    "<div class=\"bk-upload-step-full\">\n" +
    "    <div class=\"bk-upload-step-arrow-2\">\n" +
    "        <div class=\"bk-upload-file-icon-xls\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        3\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "            Upload the modeling file (.xls, size &lt; 50MB)\n" +
    "        </div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.After_your_file}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div blink-html5-file-upload upload-config=\"getSemanticModelingFileUploadConfig()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("src/modules/admin/file-upload-security.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/file-upload-security.html",
    "<div class=\"bk-upload-step bk-upload-step-left\">\n" +
    "    <div class=\"bk-upload-step-arrow-1\"></div>\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        1\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "{{strings.Download_the2}}\n" +
    "</div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.Click_on_the2}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-download-button\">\n" +
    "        <div class=\"bk-download-file-name\">{{ fileName.tabDataSecurity.SECURITY_FILE_NAME }}</div>\n" +
    "        <a href=\"/callosum/v1/security/download\">\n" +
    "            <bk-secondary-button text=\"{{ strings.DOWNLOAD }}\" icon=\"bk-style-icon-download\"></bk-secondary-button>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"bk-upload-step bk-upload-step-right\">\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        2\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "{{strings.Update_the}}\n" +
    "</div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.Set_the_column}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-illustration\"></div>\n" +
    "</div>\n" +
    "<div class=\"bk-upload-step-full\">\n" +
    "    <div class=\"bk-upload-step-arrow-2\">\n" +
    "        <div class=\"bk-upload-file-icon-xls\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-number\">\n" +
    "        3\n" +
    "    </div>\n" +
    "    <div class=\"bk-upload-step-explanations\">\n" +
    "        <div class=\"bk-upload-step-title\">\n" +
    "            Upload the security file (.xls, size &lt; 50MB)\n" +
    "        </div>\n" +
    "        <div class=\"bk-upload-step-description\">\n" +
    "{{strings.After_your_file}}\n" +
    "</div>\n" +
    "    </div>\n" +
    "    <div blink-html5-file-upload upload-config=\"getSecurityModelingFileUploadConfig()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("src/modules/admin/schema-viewer/legend/blink-graph-legend.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/legend/blink-graph-legend.html",
    "<div class=\"chart-legend\" ng-class=\"{\n" +
    "     'reduced' : $ctrl.reduced\n" +
    "    }\">\n" +
    "    <a class=\"bk-close-legend\" ng-click=\"$ctrl.reduceClicked()\">\n" +
    "        {{$ctrl.legendActionText}}\n" +
    "    </a>\n" +
    "    <h3>{{$ctrl.title}}</h3>\n" +
    "    <div ng-repeat=\"(key, value) in $ctrl.legendColors\" class=\"legend-content\">\n" +
    "        <div class=\"legend-color\" ng-style=\"{ 'background-color' : value }\">\n" +
    "        </div>\n" +
    "        <div class=\"legend\">\n" +
    "            {{key}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"(key, value) in $ctrl.legendPictures\" class=\"legend-content\">\n" +
    "        <img class=\"legend-picture\" ng-src=\"{{value}}\">\n" +
    "        <div class=\"legend\">\n" +
    "            {{key}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/schema-viewer/schema-navigation-list/schema-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/schema-navigation-list/schema-item.html",
    "<div data-html=\"true\" data-placement=\"right\" blink-tooltip=\"{{ row.item.getTooltip()}}\">\n" +
    "    <a ng-href=\"#/schema-viewer/table/{{row.id}}\">\n" +
    "        <span class=\"name\"> {{row.item.getDisplayName()}} </span>\n" +
    "        <span class=\"data-type\">{{row.item.getDisplayType()}}</span>\n" +
    "    </a>\n" +
    "    <tagged-labels tags=\"row.values.tags\" labels-registry=\"$ctrl.labelsRegistry\" deletable=\"false\"></tagged-labels>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/schema-viewer/schema-navigation-list/schema-navigation-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/schema-navigation-list/schema-navigation-list.html",
    "<div class=\"list-wrapper\">\n" +
    "    <div class=\"bk-list-search\">\n" +
    "        <input type=\"text\" class=\"bk-search-input\" placeholder=\"search by name\" ng-model=\"searchText\">\n" +
    "    </div>\n" +
    "    <div class=\"search-result\">\n" +
    "        <h3>{{ $ctrl.title}}</h3>\n" +
    "        <ul class=\"content\" vs-repeat=\"21\">\n" +
    "            <li class=\"schema-navigation-row\" ng-class=\"{ 'bk-selected' : row.selected }\" ng-repeat=\"row in $ctrl.listItems | filter:$ctrl.getFilterByInput(searchText) track by row.id\" ng-dblclick=\"$ctrl.itemDblClicked(row)\" ng-click=\"$ctrl.itemClicked(row)\">\n" +
    "                <ng-include src=\"$ctrl.itemTemplateURL\"></ng-include>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/schema-viewer/schema-navigation-list/worksheet-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/schema-navigation-list/worksheet-item.html",
    "<div>\n" +
    "      <div ng-class=\"{\n" +
    "        'bk-formula-column' : row.item.isFormula(),\n" +
    "        'bk-standard-column' : !row.item.isFormula()\n" +
    "      }\">\n" +
    "      </div>\n" +
    "      <div class=\"bk-wk-item\" data-html=\"true\" ng-class=\"{ 'bk-column-incomplete': !row.item.isColumnComplete()} \" data-placement=\"right\" blink-tooltip=\"{{ row.item.getTooltipInformationModel().getTemplate()}}\">\n" +
    "      {{row.item.getName()}}\n" +
    "      </div>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/schema-viewer/viewer-directive/schema-viewer-modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/viewer-directive/schema-viewer-modal.html",
    "<div class=\"bk-big-popup bk-viz-context\" blink-on-escape=\"$ctrl.close()\">\n" +
    "    <div class=\"bk-context-dialog\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <span class=\"bk-header-title\"> {{ $ctrl.title }}</span>\n" +
    "            <a type=\"button\" class=\"bk-close\" ng-click=\"$ctrl.close()\">&times;</a>\n" +
    "        </div>\n" +
    "        <div class=\"popup-content\">\n" +
    "            <div class=\"bk-vertical-flex-container-sized\">\n" +
    "                <schema-viewer bk-ctrl=\"$ctrl.contentCtrl\" class=\"bk-vertical-flex-container-sized\">\n" +
    "                </schema-viewer>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/admin/schema-viewer/viewer-directive/schema-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/viewer-directive/schema-viewer.html",
    "<div class=\"graph-container\">\n" +
    "    <div class=\"schema-filter\">\n" +
    "        <list-filters-and-labels class=\"bk-top-filters\" filters=\"$ctrl.filters\" ng-if=\"!!$ctrl.filters\" on-filter-applied=\"$ctrl.applyFilters()\" label-deleted-callback=\"$ctrl.onLabelDeletion(label)\" stickers=\"$ctrl.stickers\">\n" +
    "\n" +
    "        </list-filters-and-labels>\n" +
    "    </div>\n" +
    "    <div class=\"graph\">\n" +
    "        <div id=\"sidebarContainer\" resizable r-directions=\"['right']\" r-flex=\"true\" r-end=\"$ctrl.relayoutGraph()\" class=\"sidebar\">\n" +
    "\n" +
    "            <navigation-list class=\"navigation-list\" bk-ctrl=\"$ctrl.navigationController\">\n" +
    "            </navigation-list>\n" +
    "        </div>\n" +
    "        <div schema-canvas-list bk-ctrl=\"$ctrl.graphViewerController\" class=\"graph-content\">\n" +
    "            <div id=\"{{$ctrl.canvasId}}\" class=\"graph-body\">\n" +
    "                <h2 ng-if=\"$ctrl.hasError\"> {{ $ctrl.strings.HAS_ERRORS }} </h2>\n" +
    "            </div>\n" +
    "            <div id=\"{{$ctrl.outlineId}}\" class=\"outline\" ng-hide=\"!$ctrl.shouldShowOverview\"> </div>\n" +
    "            <div id=\"zoomContainer\" class=\"zoom\">\n" +
    "                <div class=\"zoom-in\" ng-click=\"$ctrl.zoom(true)\">\n" +
    "                    <span></span>\n" +
    "                </div>\n" +
    "                <div class=\"zoom-out\" ng-click=\"$ctrl.zoom(false)\">\n" +
    "                    <span></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <bk-graph-legend ng-if=\"$ctrl.shouldShowLegend\" bk-ctrl=\"$ctrl.legendController\"> </bk-graph-legend>\n" +
    "        \n" +
    "        <div ng-if=\"!$ctrl.showModal\" class=\"tooltip\" style=\"display: block\">\n" +
    "                <div class=\"tooltip-arrow\"></div>\n" +
    "                <div class=\"tooltip-inner\">\n" +
    "                        <div>\n" +
    "                        </div>\n" +
    "                </div>\n" +
    "        </div>\n" +
    "        <bk-schema-viewer-modal ng-if=\"$ctrl.showModal\" bk-ctrl=\"$ctrl.modalController\"></bk-schema-viewer-modal>\n" +
    "</div></div>");
}]);

angular.module("src/modules/admin/schema-viewer/viewer-directive/top-level-directive/graph-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/schema-viewer/viewer-directive/top-level-directive/graph-viewer.html",
    "<schema-viewer bk-ctrl=\"ctrl.viewerCtrl\" class=\"bk-vertical-flex-container-sized\">\n" +
    "</schema-viewer>");
}]);

angular.module("src/modules/admin/usersAdministration/admin-dialog-controller/admin-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/usersAdministration/admin-dialog-controller/admin-dialog.html",
    "<form name=\"form\" class=\"bk-dialog-field bk-admin-item-dialog\">\n" +
    "    <div class=\"flex-two-columns-container\" ng-class=\"{collapsed: $ctrl.shouldCollapseFormPanel}\">\n" +
    "        <div class=\"bk-admin-left-panel\" ng-if=\"!$ctrl.shouldCollapseFormPanel\">\n" +
    "            <admin-form bk-ctrl=\"$ctrl.formController\"></admin-form>\n" +
    "            <div class=\"form-row\" ng-if=\"!!$ctrl.privilegesListController\">\n" +
    "                <div class=\"label\"> {{$ctrl.strings.privilegesLabel}} </div>\n" +
    "                <div class=\"bk-privileges-list\">\n" +
    "                    <blink-checkbox-collection bk-ctrl=\"$ctrl.privilegesListController\">\n" +
    "                    </blink-checkbox-collection>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-non-matching-passwords-message\" ng-if=\"$ctrl.shouldShowErrors\" ng-show=\"form.email.$error.email\">\n" +
    "                {{$ctrl.strings.errors.emailNotValid}}\n" +
    "            </div>\n" +
    "            <div ng-show=\"!$ctrl.editedItem.matchingPasswords\" ng-if=\"$ctrl.shouldShowErrors\" class=\"bk-non-matching-passwords-message\">\n" +
    "                {{$ctrl.strings.errors.passwordNotMatching}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"!$ctrl.shouldCollapseFormPanel\" class=\"borderLeft\"></div>\n" +
    "        <div class=\"bk-admin-right-panel\">\n" +
    "            <admin-tabs-collection bk-ctrl=\"$ctrl.tabsController\"></admin-tabs-collection>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</form>");
}]);

angular.module("src/modules/admin/usersAdministration/admin-form/admin-item-form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/usersAdministration/admin-form/admin-item-form.html",
    "<div ng-repeat=\"field in $ctrl.fields\" class=\"form-row\">\n" +
    "    <div class=\"label\">\n" +
    "        {{field.label}}\n" +
    "        <span ng-if=\"field.required\" class=\"bk-asterisk\">*</span>\n" +
    "    </div>\n" +
    "    <input type=\"{{field.inputType}}\" name=\"{{field.name}}\" ng-disabled=\"{{field.disabled}}\" ng-model=\"$ctrl.model[field.modelKey]\" ng-required=\"{{field.required}}\" spellcheck=\"false\" ng-change=\"field.onChange()\" blink-auto-focus=\"!!field.autoFocus\">\n" +
    "</div>");
}]);

angular.module("src/modules/admin/usersAdministration/admin-tabs-controller/admin-tabs-collection.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/admin/usersAdministration/admin-tabs-controller/admin-tabs-collection.html",
    "<tab-control>\n" +
    "    <tab-control-tab ng-repeat=\"tab in $ctrl.tabModels track by tab.tabId\" tab-name=\"{{tab.tabName}}\" tab-id=\"{{tab.tabId}}\">\n" +
    "        <div class=\"form-row\">\n" +
    "            <div class=\"label comment\">\n" +
    "                {{tab.countItem()}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <blink-smart-checkbox-collection bk-ctrl=\"tab.adminListController\"></blink-smart-checkbox-collection>\n" +
    "    </tab-control-tab>\n" +
    "</tab-control>");
}]);

angular.module("src/modules/analyze/analyzer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/analyzer.html",
    "<div class=\"bk-analyze\" ng-if=\"!!$ctrl.isReady\">\n" +
    "    <div class=\"bk-analyze-header\">\n" +
    "        <div class=\"bk-analyze-header-title\">\n" +
    "            <div class=\"bk-analyze-header-suggestion\">\n" +
    "                {{strings.analyze.suggestions}}\n" +
    "            </div>\n" +
    "            <div class=\"bk-analyze-save-btn\">\n" +
    "                <bk-primary-button ng-if=\"$ctrl.showSaveBtn && $ctrl.totalViolationsCount > 0\" text=\"{{strings.SAVE}}\" blink-tooltip=\"{{strings.analyze.saveHelp}}\" ng-click=\"$ctrl.saveTable()\" is-disabled=\"!!$ctrl.isSaveDisabled()\" is-busy=\"$ctrl.isSaving\">\n" +
    "                </bk-primary-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyze-header-description\">\n" +
    "                <span ng-if=\"$ctrl.showSaveBtn && $ctrl.totalViolationsCount > 0\">\n" +
    "                    {{strings.analyze.suggestionDescription}}\n" +
    "                </span>\n" +
    "            <span ng-if=\"$ctrl.totalViolationsCount <= 0\">\n" +
    "                    {{strings.analyze.noSuggestions}}\n" +
    "                </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-analyze-body\" ng-if=\"$ctrl.totalViolationsCount > 0\">\n" +
    "        <bk-accordion-list bk-ctrl=\"$ctrl.accordionListComponent\">\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.longTableNameAnalyzer\" bk-ctrl=\"$ctrl.longTableNameAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.longTableNameAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-long-table-name-analyzer bk-ctrl=\"$ctrl.longTableNameAnalyzer\">\n" +
    "                    </bk-long-table-name-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.longColumnNamesAnalyzer\" bk-ctrl=\"$ctrl.longColumnNamesAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.longColumnNamesAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-long-column-names-analyzer bk-ctrl=\"$ctrl.longColumnNamesAnalyzer\">\n" +
    "                    </bk-long-column-names-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.chasmTrapAnalyzer\" bk-ctrl=\"$ctrl.chasmTrapAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.chasmTrapAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-chasm-trap-analyzer bk-ctrl=\"$ctrl.chasmTrapAnalyzer\">\n" +
    "                    </bk-chasm-trap-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.systemKeywordsAnalyzer\" bk-ctrl=\"$ctrl.systemKeywordsAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.systemKeywordsAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-system-keywords-analyzer bk-ctrl=\"$ctrl.systemKeywordsAnalyzer\">\n" +
    "                    </bk-system-keywords-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.commonPrefixAnalyzer\" bk-ctrl=\"$ctrl.commonPrefixAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.commonPrefixAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-common-prefix-analyzer bk-ctrl=\"$ctrl.commonPrefixAnalyzer\">\n" +
    "                    </bk-common-prefix-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.highColumnNumbersAnalyzer\" bk-ctrl=\"$ctrl.highColumnNumbersAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.highColumnNumbersAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-high-column-numbers-analyzer bk-ctrl=\"$ctrl.highColumnNumbersAnalyzer\">\n" +
    "                    </bk-high-column-numbers-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "            \n" +
    "            <bk-accordion-item ng-if=\"!!$ctrl.highIndexedColumnNumbersAnalyzer\" bk-ctrl=\"$ctrl.highIndexedColumnNumbersAnalyzer.accordionItem\">\n" +
    "                <div class=\"bk-accordion-item-content-template\" ng-class=\"{expand: $ctrl.highIndexedColumnNumbersAnalyzer.accordionItem.isExpanded()}\">\n" +
    "                    <bk-high-indexed-column-numbers-analyzer bk-ctrl=\"$ctrl.highIndexedColumnNumbersAnalyzer\">\n" +
    "                    </bk-high-indexed-column-numbers-analyzer>\n" +
    "                </div>\n" +
    "            </bk-accordion-item>\n" +
    "\n" +
    "\n" +
    "        </bk-accordion-list>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/chasm-trap.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/chasm-trap.html",
    "<div class=\"bk-chasm-trap-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.chasmTrapAnalyzer.description1}}\n" +
    "            <a href=\"{{strings.analyze.chasmTrapAnalyzer.description2chasmTrapUrl}}\" target=\"_blank\">\n" +
    "                {{strings.analyze.chasmTrapAnalyzer.description2chasmTrap}}\n" +
    "            </a>\n" +
    "            {{strings.analyze.chasmTrapAnalyzer.description3}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyzer-content\">\n" +
    "            <a href=\"{{strings.analyze.chasmTrapAnalyzer.learnMore1Url}}\" target=\"_blank\">\n" +
    "                {{strings.analyze.chasmTrapAnalyzer.learnMore1}}\n" +
    "            </a>\n" +
    "            {{strings.analyze.chasmTrapAnalyzer.learnMore2}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/common-prefix.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/common-prefix.html",
    "<div class=\"bk-common-prefix-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.commonPrefix.description}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyzer-content\">\n" +
    "            <div class=\"bk-common-prefix\" ng-repeat=\"prefixGroup in $ctrl.commonPrefixGroups\">\n" +
    "                <div class=\"bk-common-prefix-set\">\n" +
    "                    <div class=\"bk-analyzer-input\">\n" +
    "                        <div class=\"bk-common-prefix-set-columns\" ng-repeat=\"column in prefixGroup.columns\">\n" +
    "                            <input type=\"text\" id=\"common-prefix-name-{{column.originalName}}\" class=\"bk-input\" value=\"column.newName\" ng-model=\"column.newName\" ng-change=\"$ctrl.onChange(prefixGroup)\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-analyzer-status bk-common-prefix-status\">\n" +
    "                        <div class=\"bk-analyzer-status-{{prefixGroup.status}}\">\n" +
    "                            {{prefixGroup.commonPrefix.length}}/{{$ctrl.recommendedLength}}\n" +
    "                            {{strings.analyze.commonPrefix.identicalChars}}\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-common-prefix-footer\">\n" +
    "                    {{strings.analyze.commonPrefix.identicalStrings}}\n" +
    "                    <span class=\"bk-common-prefix-value\">\n" +
    "                        {{prefixGroup.commonPrefix}}\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/high-column-numbers.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/high-column-numbers.html",
    "<div class=\"bk-high-column-numbers-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.highColumnNumbersAnalyzer.description1}}\n" +
    "            {{$ctrl.recommendedColumnsNumber}}\n" +
    "            {{strings.analyze.highColumnNumbersAnalyzer.description2}}\n" +
    "            <div class=\"high-columns\">\n" +
    "                <div class=\"bk-analyzer-status\">\n" +
    "                    <div class=\"bk-analyzer-status-{{$ctrl.columnStatus}}\">\n" +
    "                        {{$ctrl.columnsNumber}}/{{$ctrl.recommendedColumnsNumber}}\n" +
    "                        {{strings.analyze.highColumnNumbersAnalyzer.columns}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/high-indexed-column-numbers.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/high-indexed-column-numbers.html",
    "<div class=\"bk-high-indexed-column-numbers-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.highColumnNumbersAnalyzer.indexedColumnsDescription1}}\n" +
    "            {{$ctrl.recommendedColumnsNumber}}\n" +
    "            {{strings.analyze.highColumnNumbersAnalyzer.indexedColumnsDescription2}}\n" +
    "            <a href=\"{{strings.analyze.highColumnNumbersAnalyzer.indexTypeUrl}}\" target=\"_blank\">\n" +
    "                {{strings.analyze.highColumnNumbersAnalyzer.indexType}}\n" +
    "            </a>\n" +
    "            {{strings.analyze.highColumnNumbersAnalyzer.indexedColumnsDescription3}}\n" +
    "\n" +
    "            <div class=\"high-indexed-columns\">\n" +
    "                <div class=\"bk-analyzer-status\">\n" +
    "                    <div class=\"bk-analyzer-status-{{$ctrl.columnStatus}}\">\n" +
    "                        {{$ctrl.columnsNumber}}/{{$ctrl.recommendedColumnsNumber}}\n" +
    "                        {{strings.analyze.highColumnNumbersAnalyzer.indexedColumns}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/long-column-names.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/long-column-names.html",
    "<div class=\"bk-long-column-names-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.longColumnNamesAnalyzer.description}}{{$ctrl.recommendedLength}}.\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyzer-content\">\n" +
    "            <div class=\"bk-long-column-names\" ng-repeat=\"column in $ctrl.longColumns\">\n" +
    "                <div class=\"bk-analyzer-input\">\n" +
    "                    <input type=\"text\" id=\"long-column-name-{{column.originalName}}\" class=\"bk-input\" value=\"column.newName\" ng-model=\"column.newName\" ng-change=\"$ctrl.onChange(column)\">\n" +
    "                </div>\n" +
    "                <div class=\"bk-analyzer-status\">\n" +
    "                    <div class=\"bk-analyzer-status-{{column.status}}\">\n" +
    "                        {{column.newName.length}}/{{$ctrl.recommendedLength}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/long-table-name.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/long-table-name.html",
    "<div class=\"bk-long-table-name-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.longTableNameAnalyzer.description}}{{$ctrl.recommendedLength}}.\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyzer-content\">\n" +
    "            <div class=\"bk-long-table-name\">\n" +
    "                <div class=\"bk-analyzer-input\">\n" +
    "                    <input type=\"text\" id=\"long-table-name\" class=\"bk-input\" value=\"{{$ctrl.tableName}}\" ng-model=\"$ctrl.tableName\" ng-change=\"$ctrl.onChange()\">\n" +
    "                </div>\n" +
    "                <div class=\"bk-analyzer-status\">\n" +
    "                    <div class=\"bk-analyzer-status-{{$ctrl.status}}\">\n" +
    "                        {{$ctrl.tableNameLength}}/{{$ctrl.recommendedLength}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/analyze/rules/system-keywords.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/analyze/rules/system-keywords.html",
    "<div class=\"bk-system-keywords-analyzer bk-analyzer\">\n" +
    "    <div class=\"bk-analyzer-body\">\n" +
    "        <div class=\"bk-analyzer-description\">\n" +
    "            {{strings.analyze.systemKeywords.description1}}\n" +
    "            <a href=\"{{strings.analyze.systemKeywords.description2Url}}\" target=\"_blank\">\n" +
    "                {{strings.analyze.systemKeywords.description2}}\n" +
    "            </a>\n" +
    "            {{strings.analyze.systemKeywords.description3}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-analyzer-content\">\n" +
    "            <div class=\"bk-system-keywords\" ng-repeat=\"column in $ctrl.systemKeywordsColumns\">\n" +
    "                <div class=\"bk-system-keywords-column\">\n" +
    "                    <div class=\"bk-analyzer-input\">\n" +
    "                        <input type=\"text\" id=\"system-keyword-name-{{column.originalName}}\" class=\"bk-input\" value=\"column.newName\" ng-model=\"column.newName\" ng-change=\"$ctrl.onChange(column)\">\n" +
    "                        <div class=\"bk-system-keywords-footer\">\n" +
    "                            {{strings.analyze.systemKeywords.keywordsFound}}\n" +
    "                            <span class=\"bk-system-keywords-value\">\n" +
    "                                {{column.keywordsString}}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-analyzer-status\">\n" +
    "                        <div class=\"bk-analyzer-status-{{column.status}}\">\n" +
    "                            {{column.keywords.length}}\n" +
    "                            {{strings.analyze.systemKeywords.keywordsMatched}}\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/answer-panel/answer-author/answer-author.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/answer-panel/answer-author/answer-author.html",
    "<div class=\"bk-document-author\" ng-show=\"canShowAuthor()\" blink-tooltip=\"{{ authorName }}\">\n" +
    "    <div ng-switch=\"!!authorId\">\n" +
    "        <div ng-switch-when=\"true\">\n" +
    "            <blink-profile-pic user-id=\"authorId\" user-display-name=\"authorName\"></blink-profile-pic>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/answer-panel/answer-document/answer-document.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/answer-panel/answer-document/answer-document.html",
    "<div class=\"answer-document\">\n" +
    "    <div class=\"answer-view\" ng-repeat=\"table in $ctrl.answerDocumentModel.getContextTables() track by $index\">\n" +
    "        <div ng-if=\"!$ctrl.isCurrentIndex($index)\" class=\"answer-preview clearfix\" ng-click=\"$ctrl.switchAnswerIndex(answerDocumentModel.getContext(), $index)\">\n" +
    "            <div class=\"bk-answer-preview-icon bk-style-icon-arrow-right\"></div>\n" +
    "            <div class=\"bk-answer-preview-text\">{{$ctrl.computeAnswerName(table)}}</div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"$ctrl.isCurrentIndex($index) && !!$ctrl.sageClient\" class=\"bk-vertical-flex-container-sized\">\n" +
    "            <bk-answer-page class=\"bk-answer-page-container\" ng-if=\"!!$ctrl.answerPageComponent\" bk-ctrl=\"$ctrl.answerPageComponent\">\n" +
    "            </bk-answer-page>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/answer-panel/answer-page/answer-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/answer-panel/answer-page/answer-page.html",
    "<div class=\"bk-answer-page\">\n" +
    "    <div class=\"bk-data-panel\" ng-show=\"!$ctrl.showDataSourcePreview\" resizable r-directions=\"['right']\" r-flex=\"true\" r-end=\"$ctrl.onDataPanelResizeCallback()\">\n" +
    "        <sage-data config=\"$ctrl.dataPanelConfig\" column-panel-component-config=\"$ctrl.columnPanelComponentConfig\" on-header-click-callback=\"$ctrl.panelHeaderClickCallback\">\n" +
    "        </sage-data>\n" +
    "    </div>\n" +
    "    <div class=\"page-content\">\n" +
    "        <div class=\"bk-search-panel\">\n" +
    "            <bk-data-source-preview class=\"bk-answer-data-source-preview\" ng-if=\"!!$ctrl.dataSourcePreviewComponent\" bk-ctrl=\"$ctrl.dataSourcePreviewComponent\">\n" +
    "            </bk-data-source-preview>\n" +
    "            <bk-sage-bar class=\"bk-answer-sage-bar\" ng-if=\"!!$ctrl.sageBarComponent\" bk-ctrl=\"$ctrl.sageBarComponent\">\n" +
    "            </bk-sage-bar>\n" +
    "            <bk-info-card-icon class=\"bk-answer-info-card-icon\" ng-show=\"!!$ctrl.answerModel\" ng-if=\"!!$ctrl.infoCardIconComponent\" bk-ctrl=\"$ctrl.infoCardIconComponent\">\n" +
    "            </bk-info-card-icon>\n" +
    "        </div>\n" +
    "        <div class=\"bk-answer-content\" ng-switch=\"$ctrl.viewerState\">\n" +
    "            <bk-empty-page-placeholder ng-switch-when=\"0\" class=\"bk-empty-answer-placeholder-container\" bk-ctrl=\"$ctrl.emptyPagePlaceholderComponent\">\n" +
    "            </bk-empty-page-placeholder>\n" +
    "            <search-doctor ng-switch-when=\"1\" class=\"search-doctor\" sage-client=\"$ctrl.sageClient\" model=\"$ctrl.searchDoctorModel\" on-search-corrected=\"$ctrl.onSearchCorrectedCallback\">\n" +
    "            </search-doctor>\n" +
    "            <div ng-switch-when=\"2\" class=\"bk-answer-content-viewer\">\n" +
    "                <div class=\"bk-title-panel\">\n" +
    "                    <div class=\"bk-answer-title\">\n" +
    "                        <blink-content-editable class=\"\" not-editable=\"!$ctrl.answerPageTitle.isTitleEditingAllowed\" fullspan placeholder=\"$ctrl.answerPageTitle.placeholder\" ng-model=\"$ctrl.answerPageTitle.name\" description=\"$ctrl.answerPageTitle.desc\">\n" +
    "                        </blink-content-editable>\n" +
    "                    </div>\n" +
    "                    <bk-visualization-pinner-launcher class=\"bk-pin-launcher\" ng-if=\"!!$ctrl.visualizationPinnerComponent\" bk-ctrl=\"$ctrl.visualizationPinnerComponent\">\n" +
    "                    </bk-visualization-pinner-launcher>\n" +
    "                    <bk-table-type-selector class=\"bk-table-type-selector-container\" bk-ctrl=\"$ctrl.tableTypeSelectorComponent\">\n" +
    "                    </bk-table-type-selector>\n" +
    "                    <div class=\"bk-toggle-chart-selector-display\" ng-class=\"{'bk-drawer-open': $ctrl.showChartSelector}\" blink-tooltip=\"{{$ctrl.strings.CHANGE_VISUALIZATION}}\" ng-click=\"$ctrl.toggleChartSelectorDisplay()\">\n" +
    "                        <img ng-src=\"{{$ctrl.getChartSelectorIconPath()}}\">\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-toggle-chart-editor-display\" ng-class=\"{'bk-drawer-open': $ctrl.showChartEditor,\n" +
    "                         'bk-disable-chart-editor-icon': !$ctrl.displayChartConfigEditorIcon}\" blink-tooltip=\"{{$ctrl.strings.EDIT_CHART_CONFIGURATION}}\" ng-click=\"$ctrl.toggleChartEditorDisplay()\">\n" +
    "                        <img src=\"resources/img/viz-selector-icons/chart-icons/chart_config_icon_24.svg\">\n" +
    "                    </div>\n" +
    "                    <bk-action-button-dropdown class=\"bk-answer-action-menu\" ng-if=\"!!$ctrl.actionMenu\" menu=\"$ctrl.actionMenu\">\n" +
    "                    </bk-action-button-dropdown>\n" +
    "                </div>\n" +
    "                <filter-panel class=\"bk-answer-page-filter-panel\" ng-if=\"!!$ctrl.answerPageFilterPanel.filterPanelController\" ng-show=\"$ctrl.answerPageFilterPanel.filterPanelController.showPanel()\" ctrl=\"$ctrl.answerPageFilterPanel.filterPanelController\">\n" +
    "                </filter-panel>\n" +
    "                <div class=\"bk-answer-body\">\n" +
    "                    <bk-answer-visualization-viewer class=\"bk-answer-viz-container\" ng-if=\"!!$ctrl.answerVisualizationViewerComponent\" bk-ctrl=\"$ctrl.answerVisualizationViewerComponent\">\n" +
    "                    </bk-answer-visualization-viewer>\n" +
    "                    <bk-chart-editor class=\"bk-chart-editor-container\" ng-if=\"$ctrl.showChartEditor\" bk-ctrl=\"$ctrl.chartEditorComponent\">\n" +
    "                    </bk-chart-editor>\n" +
    "                    <bk-chart-type-selector-panel class=\"bk-answer-viz-type-selector\" ng-if=\"$ctrl.showChartSelector\" bk-ctrl=\"$ctrl.chartTypeSelectorPanelComponent\">\n" +
    "                    </bk-chart-type-selector-panel>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/chart-viz/chart-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/chart-viz/chart-viz.html",
    "<blink-viz-chart class=\"bk-chart-viz\" viz=\"$ctrl.chartViz\" sage-client=\"$ctrl.sageClient\" on-render-complete=\"$ctrl.onRenderCompleteCallback\">\n" +
    "</blink-viz-chart>");
}]);

angular.module("src/modules/charts/chart-editor/chart-axis-configurator/chart-axis-configurator.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-axis-configurator/chart-axis-configurator.html",
    "<div class=\"bk-chart-axis-configurator\">\n" +
    "    <ul class=\"bk-chart-axes-selectors\">\n" +
    "        <li class=\"bk-chart-axis-selector\">\n" +
    "            <div class=\"bk-axis-header\">\n" +
    "                <div class=\"axis-name\">\n" +
    "                    {{ $ctrl.getAxesAlias().xAxis }}\n" +
    "                </div>\n" +
    "                <bk-chart-axis-locker class=\"bk-chart-axis-config-locker\" bk-ctrl=\"$ctrl.axisLockerComponent\">\n" +
    "                </bk-chart-axis-locker>\n" +
    "            </div>\n" +
    "            <div class=\"bk-multiselect-input bk-x-axis-selector-input\" ng-class=\"{'bk-invalid-selection': !!$ctrl.validationErrors.xAxis}\">\n" +
    "                <ui-select multiple=\"multiple\" ng-model=\"$ctrl.selectedAxisConfig.xAxisColumns\" search-enabled=\"false\" ng-change=\"$ctrl.onAxisColumnChange()\" theme=\"select2\" style=\"width: 160px\" class=\"bk-chart-editor-axis-selector\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.chart.chartEditor.chartAxisConfigurator.X_AXIS_PLACEHOLDER}}\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in $ctrl.xAxisColumnChoices | filter:$ctrl.filterByInput($select.search)\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li class=\"bk-chart-axis-selector\">\n" +
    "            <div class=\"axis-name\">{{ $ctrl.getAxesAlias().yAxis }}</div>\n" +
    "            <div class=\"bk-multiselect-input bk-y-axis-selector-input\" ng-class=\"{'bk-invalid-selection': !!$ctrl.validationErrors.yAxis}\">\n" +
    "                <ui-select multiple=\"multiple\" ng-model=\"$ctrl.selectedAxisConfig.yAxisColumns\" ng-change=\"$ctrl.onAxisColumnChange()\" theme=\"select2\" style=\"width: 160px\" class=\"bk-chart-editor-axis-selector\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.chart.chartEditor.chartAxisConfigurator.Y_AXIS_PLACEHOLDER}}\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in $ctrl.yAxisColumnChoices | filter:$ctrl.filterByInput($select.search)\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </div>\n" +
    "            <div class=\"bk-chart-shared-y-axis-button bk-btn\" ng-class=\"{'bk-toggle-btn-on': $ctrl.isYAxisShared}\" ng-click=\"$ctrl.toggleYAxisSharing()\" ng-show=\"$ctrl.showYAxisSharingButton()\" blink-tooltip=\"{{strings.chart.chartEditor.chartAxisConfigurator.LINK_Y_AXIS}}\">\n" +
    "                <span class=\"bk-style-icon-chart-link bk-icon\"></span>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li class=\"bk-chart-axis-selector\" ng-show=\"!$ctrl.isLegendSelectorDisabled()\">\n" +
    "            <div class=\"axis-name\">{{ $ctrl.getAxesAlias().legend }}</div>\n" +
    "            <div class=\"bk-multiselect-input bk-legend-axis-selector-input\" ng-class=\"{'bk-invalid-selection': !!$ctrl.validationErrors.legend}\">\n" +
    "                <ui-select multiple=\"multiple\" ng-model=\"$ctrl.selectedAxisConfig.legendColumns\" ng-change=\"$ctrl.onAxisColumnChange()\" theme=\"select2\" style=\"width: 160px\" class=\"bk-chart-editor-axis-selector\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.chart.chartEditor.chartAxisConfigurator.LEGEND_AXIS_PLACEHOLDER}}\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[$item.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in $ctrl.legendColumnChoices | filter:filterByInput($select.search)\">\n" +
    "                        <div blink-tooltip=\"{{$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]}}\" ng-bind-html=\"$ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()]\">\n" +
    "                        </div>\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </div>\n" +
    "        </li>\n" +
    "        <li class=\"bk-chart-axis-selector\" ng-show=\"$ctrl.isRadialSelectorEnabled()\">\n" +
    "            <div class=\"axis-name\">{{ $ctrl.getAxesAlias().radial }}</div>\n" +
    "            <ui-select class=\"bk-chart-config-selector\" ng-model=\"$ctrl.selectedAxisConfig.radialColumn\" theme=\"select2\" search-enabled=\"false\" on-select=\"$ctrl.onAxisColumnChange()\">\n" +
    "                <ui-select-match placeholder=\"{{strings.chart.chartEditor.chartAxisConfigurator.RADIAL_AXIS_PLACEHOLDER}}\">\n" +
    "                    {{ $ctrl.columnIdToDisambiguatedName[$select.selected.getSageOutputColumnId()]}}\n" +
    "                </ui-select-match>\n" +
    "                <ui-select-choices repeat=\"column in $ctrl.radialColumnChoices\">\n" +
    "                    {{ $ctrl.columnIdToDisambiguatedName[column.getSageOutputColumnId()] }}\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <ul class=\"bk-chart-axis-errors\">\n" +
    "                <li class=\"validation-error-message\" ng-show=\"!!$ctrl.validationErrors.xAxis\">{{$ctrl.validationErrors.xAxis}}</li>\n" +
    "                <li class=\"validation-error-message\" ng-show=\"!!$ctrl.validationErrors.yAxis\">{{$ctrl.validationErrors.yAxis}}</li>\n" +
    "                <li class=\"validation-error-message\" ng-show=\"!!$ctrl.validationErrors.legend\">{{$ctrl.validationErrors.legend}}</li>\n" +
    "                <li class=\"validation-error-message\" ng-show=\"!!$ctrl.validationErrors.radial\">{{$ctrl.validationErrors.radial}}</li>\n" +
    "                <li class=\"validation-error-message\" ng-show=\"!!$ctrl.validationErrors.other\">{{$ctrl.validationErrors.other}}</li>\n" +
    "\n" +
    "                \n" +
    "                <li class=\"validation-error-message\" ng-show=\"!$ctrl.hasValidationErrors() && !$ctrl.isConfigValidForChartType\">\n" +
    "                    {{strings.chart.chartEditor.chartAxisConfigurator.CONFIG_INVALID_FOR_CHART_TYPE}}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/chart-axis-locker/chart-axis-locker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-axis-locker/chart-axis-locker.html",
    "<div class=\"bk-chart-axis-locker\" blink-tooltip=\"{{strings.chart.chartEditor.chartAxisLocker.ICON_TOOLTIP}}\">\n" +
    "    <img class=\"bk-chart-locker-button\" ng-src=\"{{$ctrl.getIconPath()}}\" ng-click=\"$ctrl.toggleConfigurationLock()\">\n" +
    "    \n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/chart-configurator/chart-config-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-configurator/chart-config-item.html",
    "<div class=\"bk-chart-config-item\" ng-switch=\"$ctrl.type\">\n" +
    "    <bk-chart-config-toggler-item ng-switch-when=\"toggler\" bk-ctrl=\"$ctrl\">\n" +
    "    </bk-chart-config-toggler-item>\n" +
    "    <bk-chart-config-selector-item ng-switch-when=\"selector\" bk-ctrl=\"$ctrl\">\n" +
    "    </bk-chart-config-selector-item>\n" +
    "    <bk-chart-config-range-item ng-switch-when=\"range\" bk-ctrl=\"$ctrl\">\n" +
    "    </bk-chart-config-range-item>\n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/chart-configurator/chart-config-range-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-configurator/chart-config-range-item.html",
    "<div class=\"bk-chart-config-range\">\n" +
    "    <div class=\"bk-chart-config-range-title\">{{$ctrl.title}}</div>\n" +
    "    <input class=\"bk-chart-config-range-start-value\" ng-model=\"$ctrl.start\" placeholder=\"{{strings.start}}\" ng-change=\"$ctrl.onChange()\">\n" +
    "    <input class=\"bk-chart-config-range-end-value\" ng-model=\"$ctrl.end\" placeholder=\"{{strings.end}}\" ng-change=\"$ctrl.onChange()\">\n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/chart-configurator/chart-config-selector-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-configurator/chart-config-selector-item.html",
    "<ui-select class=\"bk-chart-config-selector\" ng-model=\"$ctrl.selectedOption\" theme=\"select2\" ng-disabled=\"$ctrl.isDisabled\" search-enabled=\"false\" on-select=\"$ctrl.onSelectionChange($item)\">\n" +
    "    <ui-select-match placeholder=\"{{$ctrl.placeholder}}\">\n" +
    "        {{ $select.selected}}\n" +
    "    </ui-select-match>\n" +
    "    <ui-select-choices repeat=\"selectOption in $ctrl.selectOptions\">\n" +
    "        {{ selectOption }}\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>");
}]);

angular.module("src/modules/charts/chart-editor/chart-configurator/chart-config-toggler-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-configurator/chart-config-toggler-item.html",
    "<bk-checkbox class=\"bk-chart-toggler-checkbox\" ng-if=\"!!$ctrl.chartTogglerCBCtrl\" bk-ctrl=\"$ctrl.chartTogglerCBCtrl\">\n" +
    "</bk-checkbox>");
}]);

angular.module("src/modules/charts/chart-editor/chart-configurator/chart-config.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-configurator/chart-config.html",
    "<div class=\"bk-chart-config\">\n" +
    "    <bk-chart-config-item ng-repeat=\"chartConfigItem in $ctrl.chartConfigItems\" class=\"{{chartConfigItem.cssClass}}\" bk-ctrl=\"chartConfigItem\">\n" +
    "    </bk-chart-config-item>\n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/chart-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/chart-editor.html",
    "<div class=\"bk-chart-editor\">\n" +
    "    <div class=\"bk-chart-editor-title\">\n" +
    "        <img class=\"bk-chart-editor-title-image\" ng-src=\"{{$ctrl.getTitleIconPath()}}\">\n" +
    "        <div class=\"bk-chart-editor-title-text\">\n" +
    "            {{$ctrl.getTitleText()}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-close-selector\" ng-click=\"$ctrl.onClose()\">\n" +
    "            <img src=\"{{'/resources/img/cancel_icon_16.svg'}}\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <bk-chart-axis-configurator class=\"bk-chart-axis-configurator-container\" bk-ctrl=\"$ctrl.chartAxisConfiguratorComponent\">\n" +
    "    </bk-chart-axis-configurator>\n" +
    "    <bk-chart-config class=\"bk-chart-configurator-container\" bk-ctrl=\"$ctrl.chartConfiguratorComponent\">\n" +
    "    </bk-chart-config>\n" +
    "    <bk-chart-zoom class=\"bk-chart-zoom-container\" ng-if=\"!!$ctrl.chartZoomComponent\" bk-ctrl=\"$ctrl.chartZoomComponent\">\n" +
    "    </bk-chart-zoom>\n" +
    "</div>");
}]);

angular.module("src/modules/charts/chart-editor/zoom-state-configurator/chart-zoom.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/charts/chart-editor/zoom-state-configurator/chart-zoom.html",
    "<div class=\"bk-chart-zoom\" ng-class=\"{'bk-disabled': !$ctrl.isDisabled()}\" blink-tooltip=\"{{$ctrl.getTooltip()}}\" data-placement=\"auto bottom\">\n" +
    "    <div class=\"bk-area-select\" ng-class=\"{'bk-active': !$ctrl.isInPanMode()}\" ng-click=\"$ctrl.switchMode()\">\n" +
    "        <span class=\"bk-style-icon-zoom-zone\"></span>\n" +
    "        <span class=\"bk-chart-zoom-text\">{{strings.chart.chartEditor.chartConfigurator.SELECT_AN_AREA}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"bk-zoom-reset\" ng-class=\"{'bk-disabled': !$ctrl.isZoomedIn()}\" ng-click=\"$ctrl.zoomOut()\">\n" +
    "        <span class=\"bk-style-icon-reset\"></span>\n" +
    "        <span class=\"bk-chart-zoom-text\">{{strings.chart.chartEditor.chartConfigurator.RESET_ZOOM}}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/cluster-status-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/cluster-status-page.html",
    "{{strings.TEST}}");
}]);

angular.module("src/modules/clusterstatus/vizs/alert-detail-alerts-viz/alert-detail-alerts-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/alert-detail-alerts-viz/alert-detail-alerts-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/alert-detail-events-viz/alert-detail-events-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/alert-detail-events-viz/alert-detail-events-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/alert-detail-notifications-viz/alert-detail-notifications-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/alert-detail-notifications-viz/alert-detail-notifications-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/alert-summary-viz/alert-summary-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/alert-summary-viz/alert-summary-viz.html",
    "<div class=\"alert-summary-viz\">\n" +
    "    <div class=\"alert-box\" ng-repeat=\"alert in viz.getModel().getRecentAlerts()\">\n" +
    "        <div class=\"alert-title\">\n" +
    "            <div class=\"alert-type\" ng-class=\"{'alert-type-warning': alert.isWarning(),\n" +
    "                            'alert-type-critical': alert.isCritical()}\">\n" +
    "                <span class=\"alert-icon\" ng-class=\"{'bk-style-icon-circled-information': alert.isWarning(),\n" +
    "                            'bk-style-icon-circled-warning': alert.isCritical()}\"></span>\n" +
    "                <span>{{alert.getAlertTitle()}}</span>\n" +
    "            </div>\n" +
    "            <div class=\"alert-timestamp\">{{alert.getTimeAgoString()}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"alert-message\">{{alert.getAlertMessage()}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/cluster-detail-info-viz/cluster-detail-info-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/cluster-detail-info-viz/cluster-detail-info-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/cluster-detail-log-viz/cluster-detail-log-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/cluster-detail-log-viz/cluster-detail-log-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/cluster-detail-snapshot-viz/cluster-detail-snapshot-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/cluster-detail-snapshot-viz/cluster-detail-snapshot-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/cluster-summary-viz/cluster-summary-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/cluster-summary-viz/cluster-summary-viz.html",
    "<div class=\"cluster-summary-viz\">\n" +
    "    <div class=\"cluster-summary\">\n" +
    "        <div class=\"summary-title\">{{ clusterName }}</div>\n" +
    "        <div class=\"summary-content truncate\" blink-tooltip=\"{{viz.getModel().getClusterName()}}\" auto-tooltip-style=\"bootstrap\">\n" +
    "            {{viz.getModel().getClusterName()}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cluster-summary\">\n" +
    "        <div class=\"summary-title\">{{ release }}</div>\n" +
    "        <div class=\"summary-content truncate\" blink-tooltip=\"{{viz.getModel().getRelease()}}\" auto-tooltip-style=\"bootstrap\">\n" +
    "            {{viz.getModel().getRelease()}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"cluster-summary\">\n" +
    "        <div class=\"summary-title\">{{ numberOfNodes }}</div>\n" +
    "        <div class=\"summary-content\">{{viz.getModel().getNumNodes()}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"cluster-summary\">\n" +
    "        <div class=\"summary-title\">{{ lastSnapshotTime }}</div>\n" +
    "        <div class=\"summary-content\">{{viz.getModel().getLastSnapshotTime()}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/database-detail-viz/database-detail-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/database-detail-viz/database-detail-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/database-summary-viz/database-summary-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/database-summary-viz/database-summary-viz.html",
    "<div class=\"database-summary-viz\">\n" +
    "    <div class=\"falcon-status\">\n" +
    "        <div class=\"falcon-summary-last-update\">\n" +
    "            <span class=\"lastUpdate\">{{ databaseSummaryViz.LAST_DATA_UPDATE }} </span>\n" +
    "            {{viz.getModel().getLastUpdateTime()}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"falcon-stats\">\n" +
    "        <div class=\"falcon-summary\">\n" +
    "            <div class=\"content\">\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">{{ tablesLoaded }}</div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.TABLES_LOADED }}</div>\n" +
    "                </div>\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">\n" +
    "                        {{viz.getModel().getNumStaleTables()}} <span>{{strings.of}}</span>{{ tablesLoaded }}\n" +
    "                    </div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.TABLES_BEING_UPDATED }}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"falcon-summary\">\n" +
    "            <div class=\"content\">\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">{{viz.getModel().getNumInProgressTables()}}</div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.NEW_TABLES_BEING_LOADED }}</div>\n" +
    "                </div>\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\" blink-tooltip=\"{{ numRowsTooltip }}\">\n" +
    "                        {{ numRows }}\n" +
    "                    </div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.ROWS }}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/event-summary-viz/event-summary-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/event-summary-viz/event-summary-viz.html",
    "<div class=\"event-summary-viz\">\n" +
    "    <div class=\"event-box\" ng-repeat=\"event in viz.getModel().getRecentEvents()\">\n" +
    "        <div class=\"clearfix\">\n" +
    "            <div class=\"event-title fl\">{{event.getEventCategory()}}</div>\n" +
    "            <div class=\"event-timestamp fr\">{{event.getTimeAgoString()}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"event-message\" blink-tooltip=\"{{event.getEventSummary()}}\" auto-tooltip-style=\"bootstrap\">{{event.getEventSummary()}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/generic-viz/blink-generic-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/generic-viz/blink-generic-viz.html",
    "<div class=\"generic-viz\" ng-switch=\"$ctrl.viz.getModel().getVizSubtype()\">\n" +
    "    <search-summary-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"SEARCH_SUMMARY_VIZ\"></search-summary-viz>\n" +
    "    <search-detail-table-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"SEARCH_DETAIL_TABLE_VIZ\"></search-detail-table-viz>\n" +
    "    <database-summary-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"DATABASE_SUMMARY_VIZ\"></database-summary-viz>\n" +
    "    <database-detail-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"DATABASE_DETAIL_VIZ\"></database-detail-viz>\n" +
    "    <cluster-summary-viz viz=\"$ctrl.viz\" tile=\"$ctrl.tile\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"CLUSTER_SUMMARY_VIZ\"></cluster-summary-viz>\n" +
    "    <cluster-detail-info-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"CLUSTER_DETAIL_INFO_VIZ\"></cluster-detail-info-viz>\n" +
    "    <cluster-detail-log-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"CLUSTER_DETAIL_LOG_VIZ\"></cluster-detail-log-viz>\n" +
    "    <cluster-detail-snapshot-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"CLUSTER_DETAIL_SNAPSHOT_VIZ\"></cluster-detail-snapshot-viz>\n" +
    "    <alert-summary-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"ALERT_SUMMARY_VIZ\"></alert-summary-viz>\n" +
    "    <event-summary-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"EVENT_SUMMARY_VIZ\"></event-summary-viz>\n" +
    "    <alert-detail-alerts-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"ALERT_DETAIL_ALERTS_VIZ\"></alert-detail-alerts-viz>\n" +
    "    <alert-detail-events-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"ALERT_DETAIL_EVENTS_VIZ\"></alert-detail-events-viz>\n" +
    "    <alert-detail-notifications-viz viz=\"$ctrl.viz\" class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"ALERT_DETAIL_NOTIFICATIONS_VIZ\"></alert-detail-notifications-viz>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/search-detail-table-viz/search-detail-table-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/search-detail-table-viz/search-detail-table-viz.html",
    "<div>\n" +
    "    <blink-slick-grid-table class=\"bk-vertical-flex-container-sized\" table-model=\"tableModel\">\n" +
    "    </blink-slick-grid-table>\n" +
    "</div>");
}]);

angular.module("src/modules/clusterstatus/vizs/search-summary-viz/search-summary-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/clusterstatus/vizs/search-summary-viz/search-summary-viz.html",
    "<div class=\"search-summary-viz\">\n" +
    "    <div class=\"sage-status\">\n" +
    "        <span class=\"lastIndexed\">{{ searchSummaryViz.LAST_INDEXED }} </span>\n" +
    "        {{viz.getModel().getLastBuildFinishTime()}}\n" +
    "    </div>\n" +
    "    <div class=\"sage-stats\">\n" +
    "        <div class=\"sage-summary\">\n" +
    "            <div class=\"content\">\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">{{viz.getModel().getNumReadyTables()}}</div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.TABLES_SEARCHABLE }}</div>\n" +
    "                </div>\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">\n" +
    "                        {{ viz.getModel().getNumBuildingAndServing() }} <span>{{strings.of}}</span>{{viz.getModel().getNumReadyTables()}}\n" +
    "                    </div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.TABLES_BEING_INDEXED }}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"sage-summary\">\n" +
    "            <div class=\"content\">\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\">{{ newTablesIndexedNum }}</div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.NEW_TABLES_BEING_INDEXED }}</div>\n" +
    "                </div>\n" +
    "                <div class=\"summary-block\">\n" +
    "                    <div class=\"summary-number\" blink-tooltip=\"{{ tokenIndexedTooltip }}\">\n" +
    "                        {{ numTokenIndexed }}\n" +
    "                    </div>\n" +
    "                    <div class=\"summary-title\">{{ contentTitle.TOKENS_SEARCHABLE }}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"sage-summary-failure\" ng-if=\"notSearchable()\">\n" +
    "        <span class=\"content\">\n" +
    "            <span class=\"bk-style-icon-circled-warning vam\"></span>\n" +
    "            <span>{{strings.Not_Searchable}}</span>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/comment/comment.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/comment/comment.html",
    "<div class=\"bk-comment-panel\">\n" +
    "    <div blink-loading-indicator loading-text=\"Load comments\" ng-if=\"!isInitCommentListFilled\"></div>\n" +
    "    <div class=\"bk-comment-inputbox\">\n" +
    "        <textarea mentio mentio-typed-text=\"typedTerm\" mentio-items=\"user\" mentio-require-leading-space=\"true\" placeholder=\"Add your comment here\" ng-model=\"newCommentMessage\" mentio-template-url=\"src/modules/comment/user-mentions.html\" mentio-search=\"getMatchingUsers(term)\" mentio-select=\"formatForSelectedUser(item)\" ng-readonly=\"createCommentPending\" ng-trim=\"false\">\n" +
    "        </textarea>\n" +
    "        <blink-button-menu menu=\"postButtonConifg\" busy=\"createCommentPending\"></blink-button-menu>\n" +
    "    </div>\n" +
    "    <ul infinite-scroll=\"renderMoreItems()\">\n" +
    "        <li class=\"bk-animate animate-repeat\" ng-repeat=\"comment in comments | limitTo: maxComments track by comment.id\">\n" +
    "            <blink-profile-pic user-id=\"comment.author\" user-display-name=\"comment.authorDisplayName\">\n" +
    "            </blink-profile-pic>\n" +
    "            <span class=\"bk-bubble\">\n" +
    "                <span class=\"bk-user-name bk-animate animate-if\" ng-if=\"!comment.inEdit\">\n" +
    "                    {{ comment.authorDisplayName }}\n" +
    "                </span>\n" +
    "                <span class=\"bk-time-label animate-if\" ng-if=\"showEditedSign(comment)\" blink-tooltip=\"{{convertToTimeAgo(comment.modifiedTime)}}\">\n" +
    "{{strings.Edited}}\n" +
    "</span>\n" +
    "                <div class=\"bk-message bk-animate animate-if\" ng-if=\"!comment.inEdit\">{{comment.currentlyEditingMessageBackup}}</div>\n" +
    "                <textarea type=\"text\" ng-model=\"comment.message\" ng-if=\"comment.inEdit\" ng-readonly=\"comment.modifiedCommentPending\">\n" +
    "                </textarea>\n" +
    "                <div class=\"bk-btn-blue bk-animate animate-if\" ng-click=\"endEditMode($index)\" ng-if=\"showEditModeButtons(comment)\" ng-class=\"{ 'bk-disabled': comment.modifiedCommentPending}\">{{strings.Done}}</div>\n" +
    "                <div class=\"bk-btn bk-animate animate-if\" ng-click=\"cancelEditMode($index)\" ng-if=\"showEditModeButtons(comment)\">{{strings.Cancel}}</div>\n" +
    "                <div class=\"bk-viz-btn-icon bk-style-icon-edit animate-if\" blink-tooltip=\"Edit\" ng-if=\"showModifiedButtons(comment)\" ng-click=\"startEditMode($index)\">\n" +
    "                </div>\n" +
    "                <span class=\"bk-time-ago bk-animate animate-if\" ng-if=\"showTimeAgo(comment)\">\n" +
    "                    <span class=\"bk-clock-icon\"></span>\n" +
    "                    <span class=\"bk-time-label\">{{convertToTimeAgo(comment.createdTime)}}</span>\n" +
    "                </span>\n" +
    "                <span class=\"bk-delete-btn bk-animate animate-if\" blink-tooltip=\"Delete\" ng-click=\"deleteComment($index)\" ng-if=\"showModifiedButtons(comment)\">&times;\n" +
    "                </span>\n" +
    "                <span class=\"bk-bubble-arrow-shadow\"></span>\n" +
    "                <span class=\"bk-bubble-arrow\"></span>\n" +
    "            </span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div ng-if=\"isInitCommentListFilled\">\n" +
    "        <div class=\"bk-more-comment-hint\" ng-if=\"hasMoreItemsToLoad()\" blink-tooltip=\"Total number of comments: {{comments.length}}\" data-placement=\"top\">\n" +
    "{{strings.Scroll_down_to}}</div>\n" +
    "        <div class=\"bk-more-comment-hint\" ng-if=\"!hasMoreItemsToLoad()\"><span>{{strings.All}}</span>{{comments.length}} <span>{{strings.comments_are}}</span></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/comment/user-mentions.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/comment/user-mentions.html",
    "<ul class=\"list-group-item user-search\">\n" +
    "    <li mentio-menu-item=\"user\" ng-repeat=\"user in items\" class=\"list-group-item\">\n" +
    "        <blink-profile-pic user-id=\"user.getId()\" user-display-name=\"user.getDisplayName()\">\n" +
    "        </blink-profile-pic>\n" +
    "                    <span class=\"text-primary\" ng-bind-html=\"user.getName() | mentioHighlight:typedTerm:'menu-highlighted' | unsafe\"></span>\n" +
    "                    <span class=\"text-muted\" ng-bind-html=\"user.getDisplayName() | mentioHighlight:typedTerm:'menu-highlighted' | unsafe\">\n" +
    "                    </span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/conditional-formatting/conditional-formatting.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/conditional-formatting/conditional-formatting.html",
    "<bk-column-metrics bk-ctrl=\"$ctrl.data.customData.columnMetricsComponent\"></bk-column-metrics>");
}]);

angular.module("src/modules/custom-styling/style-customizer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/custom-styling/style-customizer.html",
    "<div class=\"bk-style-customizer\">\n" +
    "    <bk-multi-section-list>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-app-logo-section\" bk-ctrl=\"$ctrl.getAppLogoSelectorListItem()\">\n" +
    "            <bk-image-blob-editor bk-ctrl=\"$ctrl.getAppLogoSelectorListItem().getItemContentComponent()\">\n" +
    "            </bk-image-blob-editor>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-wide-app-logo-section\" bk-ctrl=\"$ctrl.getWideAppLogoSelectorListItem()\">\n" +
    "            <bk-image-blob-editor bk-ctrl=\"$ctrl.getWideAppLogoSelectorListItem().getItemContentComponent()\">\n" +
    "            </bk-image-blob-editor>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-chart-font-section\" bk-ctrl=\"$ctrl.getChartFontSelectorListItem()\" ng-if=\"$ctrl.isFontCustomizationEnabled()\">\n" +
    "            <bk-multi-font-selector class=\"bk-style-customizer-chart-font-selector\" bk-ctrl=\"$ctrl.getChartFontSelectorListItem().getItemContentComponent()\">\n" +
    "            </bk-multi-font-selector>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-table-font-section\" bk-ctrl=\"$ctrl.getTableFontSelectorListItem()\" ng-if=\"$ctrl.isFontCustomizationEnabled()\">\n" +
    "            <bk-multi-font-selector bk-ctrl=\"$ctrl.getTableFontSelectorListItem().getItemContentComponent()\">\n" +
    "            </bk-multi-font-selector>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-app-background-section\" bk-ctrl=\"$ctrl.getAppBackgroundSelectorListItem()\">\n" +
    "            <bk-background-configurator class=\"bk-style-customizer-app-background-color-configurator\" bk-ctrl=\"$ctrl.getAppBackgroundSelectorListItem().getItemContentComponent()\">\n" +
    "            </bk-background-configurator>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-chart-color-section\" bk-ctrl=\"$ctrl.getChartColorPalettesEditorListItem()\">\n" +
    "            <bk-color-palette-list-editor class=\"bk-style-customizer-chart-color-palette-list-editor\" bk-ctrl=\"$ctrl.getChartColorPalettesEditorListItem().getItemContentComponent()\">\n" +
    "            </bk-color-palette-list-editor>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-customizer-footer-section\" bk-ctrl=\"$ctrl.getFooterTextListItem()\">\n" +
    "            <bk-text-box-configurator bk-ctrl=\"$ctrl.getFooterTextListItem().getItemContentComponent()\">\n" +
    "            </bk-text-box-configurator>\n" +
    "        </bk-multi-section-list-item>\n" +
    "        <bk-multi-section-list-item class=\"bk-style-page-title-section\" bk-ctrl=\"$ctrl.getPageTitleListItem()\">\n" +
    "            <bk-text-box-configurator bk-ctrl=\"$ctrl.getPageTitleListItem().getItemContentComponent()\">\n" +
    "            </bk-text-box-configurator>\n" +
    "        </bk-multi-section-list-item>\n" +
    "    </bk-multi-section-list>\n" +
    "</div>");
}]);

angular.module("src/modules/data-explorer/blink-data-explorer-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-explorer/blink-data-explorer-popup.html",
    "<div class=\"bk-big-popup\" blink-on-escape=\"hide()\">\n" +
    "    <div class=\"bk-context-dialog\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <span class=\"bk-header-title\">{{title}}</span>\n" +
    "            <a type=\"button\" class=\"bk-close\" ng-click=\"hide()\">&times;</a>\n" +
    "        </div>\n" +
    "        <blink-data-explorer on-navigate-away=\"hide()\" data=\"data\" permissions=\"permissions\" selected-table-id=\"selectedTable.tableId\" selectable-column-predicate=\"selectableColumnPredicate\" mode=\"mode\" class=\"popup-content\">\n" +
    "        </blink-data-explorer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/data-explorer/currency-type-editor/currency-type-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-explorer/currency-type-editor/currency-type-editor.html",
    "<ul>\n" +
    "    <li class=\"bk-currency-item\">\n" +
    "        <bk-radio-button class=\"bk-currency-radio\" bk-ctrl=\"$ctrl.noneRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "    </li>\n" +
    "    <li class=\"bk-currency-item\">\n" +
    "        <bk-radio-button class=\"bk-currency-radio\" bk-ctrl=\"$ctrl.localeRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "    </li>\n" +
    "    <li class=\"bk-currency-item\" ng-if=\"$ctrl.includeFromColumnRadioOption()\">\n" +
    "        <bk-radio-button class=\"bk-currency-radio\" bk-ctrl=\"$ctrl.columnRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "        <bk-select bk-ctrl=\"$ctrl.columnSelectCtrl\"></bk-select>\n" +
    "    </li>\n" +
    "    <li class=\"bk-currency-item\">\n" +
    "        <bk-radio-button class=\"bk-currency-radio\" bk-ctrl=\"$ctrl.isoCodeRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "        <bk-select bk-ctrl=\"$ctrl.isoCodeSelectCtrl\"></bk-select>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/data-explorer/custom-region-uploader/custom-region-uploader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-explorer/custom-region-uploader/custom-region-uploader.html",
    "<div class=\"bk-custom-region-file-uploader\">\n" +
    "    <input type=\"file\" id=\"bk-file-input\" name=\"content\">\n" +
    "    <a class=\"bk-upload-link\">{{'+ '}}{{$ctrl.label}}</a>\n" +
    "</div>");
}]);

angular.module("src/modules/data-explorer/data-explorer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-explorer/data-explorer.html",
    "<div class=\"bk-explorer\" ng-class=\"{ 'bk-explorer-mapping': inSelectionMode,  'bk-with-footer': inSelectionMode}\" blink-on-escape=\"cancelSelection()\">\n" +
    "    \n" +
    "    <blink-loading-indicator ng-show=\"!data\" loading-text=\"strings.LOADING_MSG\">\n" +
    "\n" +
    "    </blink-loading-indicator>\n" +
    "    <div class=\"bk-explorer-header\" ng-show=\"!!data\">\n" +
    "        <div class=\"bk-missing-underlying-label\" ng-show=\"needsUnderlyingAccess && !underlyingLabelClose\">\n" +
    "            {{ needsUnderlyingAccessMessage }}\n" +
    "            <span class=\"bk-close\" ng-click=\"underlyingLabelClose = true\">×</span>\n" +
    "        </div>\n" +
    "        <div class=\"view-all\" ng-show=\"hideTableList\">\n" +
    "            <bk-icon-button icon=\"bk-style-icon-arrow-right\" ng-click=\"onViewAllClick()\"></bk-icon-button>\n" +
    "        </div>\n" +
    "        <div class=\"bk-table-title\">\n" +
    "            <div class=\"table-type\">\n" +
    "                {{ tableDisplayType }}\n" +
    "            </div>\n" +
    "            <div ng-switch=\"isSaveButtonEnabled()\">\n" +
    "                <div ng-switch-when=\"true\" blink-content-editable class=\"bk-table-name\" ng-model=\"tableName\" description=\"tableDescription\" on-change=\"onHeadersEdit(tableName, tableDescription)\" disallow-empty=\"true\">\n" +
    "                </div>\n" +
    "                <div class=\"bk-table-name\" ng-switch-when=\"false\">\n" +
    "                    <div class=\"bk-table-name-readonly\" uib-tooltip=\"{{ tableName }}\" tooltip-placement=\"bottom\" tooltip-popup-delay=\"300\" tooltip-popup-close-delay=\"250\">\n" +
    "                        {{tableName}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"mode-select fr clearfix\">\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInPropMode() }\" ng-click=\"setPropMode()\">\n" +
    "                {{strings.Columns}}\n" +
    "            </div>\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInDataMode() }\" ng-click=\"setDataMode()\">\n" +
    "                {{strings.Data}}\n" +
    "            </div>\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInProfileMode() }\" ng-click=\"setProfileMode()\">\n" +
    "                {{strings.Profile}}\n" +
    "            </div>\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInRelationshipMode() }\" ng-click=\"setRelationshipMode()\">\n" +
    "                {{strings.Relationships}}</div>\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInDependentsMode() }\" ng-click=\"setDependentsMode()\">\n" +
    "                {{strings.Dependents}}\n" +
    "            </div>\n" +
    "            <div class=\"mode-item\" ng-class=\"{'select': isInSecurityMode() }\" ng-click=\"setSecurityMode()\">\n" +
    "                {{strings.Row_security}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"!!showAnalyzeMode\" class=\"mode-item\" ng-class=\"{'select': isInAnalyzeMode() }\" ng-click=\"setAnalyzeMode()\">\n" +
    "                {{strings.analyze.suggestions}}\n" +
    "                <span class=\"bk-analyze-total-count\" ng-if=\"!!analyzeCtrl && analyzeCtrl.isReady\">\n" +
    "                    ({{analyzeCtrl.totalViolationsCount}})\n" +
    "                </span>\n" +
    "                <span ng-if=\"!analyzeCtrl || !analyzeCtrl.isReady\">\n" +
    "                    (...)\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div ng-if=\"!!showA3Mode\" class=\"mode-item\" ng-class=\"{'select': isInA3Mode() }\" ng-click=\"setA3Mode()\">\n" +
    "                {{strings.metadataObjectMenuItems.triggerA3.label}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"explorer-header-btns clearfix\" ng-class=\"{invisible : areHeaderBtnsInvisible()}\">\n" +
    "            <div ng-switch=\"isOfLoadableType()\">\n" +
    "                <bk-secondary-button ng-switch-when=\"true\" text=\"{{ strings.importData.LOAD_DATA }}\" icon=\"bk-style-icon-data\" is-disabled=\"!isEditable\" class=\"bk-metadata-edit\" ng-click=\"isEditable ? onEditClick() : null\"></bk-secondary-button>\n" +
    "                <bk-secondary-button ng-switch-when=\"false\" text=\"{{ strings.EDIT }}\" icon=\"bk-style-icon-edit-small\" tooltip=\"{{buttonTooltip}}\" tooltip-placement=\"auto\" is-disabled=\"!isEditable\" class=\"bk-metadata-edit\" ng-click=\"isEditable ? onEditClick() : null\"></bk-secondary-button>\n" +
    "            </div>\n" +
    "            <div class=\"bk-flippable\" ng-switch=\"isEditable\">\n" +
    "                <bk-primary-button ng-switch-when=\"true\" text=\"{{ strings.SAVE }}\" icon=\"bk-style-icon-save\" is-busy=\"isSaving()\" is-disabled=\"saveInactive\" ng-click=\"onSaveClick()\"></bk-primary-button>\n" +
    "                <div ng-switch-when=\"false\" class=\"bk-label\"><span>{{strings.Readonly}}</span></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-explorer-mapping-explanation-wrapper\" ng-show=\"inSelectionMode\">\n" +
    "            <div class=\"bk-explorer-mapping-explanation\">\n" +
    "                <div class=\"bk-explorer-mapping-explanation-icon\"></div>\n" +
    "{{strings.Select_the_column}}\n" +
    "</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-content\" ng-show=\"!!data\">\n" +
    "        <div class=\"table-list-container\" ng-if=\"!hideTableList\">\n" +
    "            <input class=\"bk-explorer-table-search\" placeholder=\"Search table name\" type=\"text\" ng-model=\"explorer.tableFilter\">\n" +
    "\n" +
    "            <div class=\"bk-table-list\">\n" +
    "                <div class=\"bk-table\" ng-repeat=\"table in filtered = (data | filter:explorer.tableFilter)\">\n" +
    "                    <div class=\"bk-light-text-16px bk-tablename\" blink-tooltip=\"{{getTooltip(table)}}\" data-html=\"true\" data-placement=\"right\" data-delay=\"{&quot;show&quot;:&quot;750&quot;}\" ng-class=\"{'bk-loading': isLoading(table),\n" +
    "                        'bk-selected': (selectedTableId == table.values.id) }\" ng-click=\"onTableNameClick(table.values.id)\">\n" +
    "                        {{ table.values.name }}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <blink-loading-indicator loading-text=\"strings.LOADING_MSG\" ng-show=\"isLoading()\">\n" +
    "\n" +
    "        </blink-loading-indicator>\n" +
    "        <div class=\"bk-table-detail\" ng-show=\"!isLoading()\" ng-class=\"{\n" +
    "                 'table-list-present': !hideTableList\n" +
    "             }\">\n" +
    "            <div ng-if=\"isInRelationshipMode()\" class=\"bk-relationship-ui-mode\">\n" +
    "                <relationship-list table-id=\"selectedTableId\" showhidden=\"isRelationshipEditingUnrestricted()\" should-own-target=\"!isRelationshipEditingUnrestricted()\" can-edit-only-own-relationships=\"!isRelationshipEditingUnrestricted()\">\n" +
    "                </relationship-list>\n" +
    "            </div>\n" +
    "            <div ng-if=\"isInSecurityMode()\" class=\"bk-security-mode\">\n" +
    "                <row-level-security class=\"rls-container\" ctrl=\"rlsCtrl\" ng-if=\"canEditRowSecurity()\"></row-level-security>\n" +
    "                <div ng-if=\"!canEditRowSecurity()\">\n" +
    "                    {{ getRLSDisabledReason() }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-no-tables\" ng-if=\"noTableToShow()\">\n" +
    "                {{ getNoTableReason() }}\n" +
    "            </div>\n" +
    "            <bk-analyzer class=\"bk-analyze\" bk-ctrl=\"analyzeCtrl\" ng-if=\"!!isInAnalyzeMode() && !!analyzeCtrl\">\n" +
    "            </bk-analyzer>\n" +
    "            <bk-a3-table-analysis class=\"bk-a3-table-analysis\" bk-ctrl=\"a3Ctrl\" ng-if=\"!!isInA3Mode() && !!a3Ctrl\">\n" +
    "            </bk-a3-table-analysis>\n" +
    "        </div>\n" +
    "        <div class=\"bk-footer modal-footer\" ng-show=\"inSelectionMode\">\n" +
    "            <a class=\"bk-btn bk-btn-cancel\" ng-click=\"cancelSelection()\">{{strings.Cancel}}</a>\n" +
    "            <a class=\"bk-btn bk-save-btn\" ng-click=\"!!lastSelectedColumn && saveSelection()\" ng-class=\"{'bk-btn-disabled': !lastSelectedColumn, 'bk-btn-blue': !!lastSelectedColumn}\">{{strings.Save}}</a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("src/modules/data-explorer/geo-config-editor/geo-config-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-explorer/geo-config-editor/geo-config-editor.html",
    "<ul class=\"bk-geo-config-option-list\">\n" +
    "    <li ng-repeat=\"ctrl in $ctrl.rootLevelOptionsControllers\">\n" +
    "        <bk-radio-button class=\"bk-top-level-radio\" bk-ctrl=\"ctrl\">\n" +
    "        </bk-radio-button>\n" +
    "    </li>\n" +
    "    <li>\n" +
    "        <bk-radio-button class=\"bk-top-level-radio\" bk-ctrl=\"$ctrl.subNationRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "        <div class=\"bk-geo-config-sub-nation\" ng-if=\"$ctrl.showSubNationConfig()\">\n" +
    "            <div class=\"bk-sub-nation-country\">\n" +
    "                <div class=\"bk-country-label\">Country:</div>\n" +
    "                <bk-select bk-ctrl=\"$ctrl.countrySelectorCtrl\"></bk-select>\n" +
    "            </div>\n" +
    "            <div class=\"bk-sub-nation-options\">\n" +
    "                <div class=\"bk-sub-nation-option\" ng-repeat=\"ctrl in $ctrl.subNationOptionsControllers\">\n" +
    "                    <bk-radio-button class=\"bk-sub-nation-radio\" bk-ctrl=\"ctrl\">\n" +
    "                    </bk-radio-button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </li>\n" +
    "    <li ng-if=\"$ctrl.customRegionEnabled\">\n" +
    "        <bk-radio-button class=\"bk-top-level-radio\" bk-ctrl=\"$ctrl.customRegionRadioController\">\n" +
    "        </bk-radio-button>\n" +
    "        <div class=\"bk-geo-config-custom-region\" ng-if=\"$ctrl.customRegionRadioController.isSelected()\">\n" +
    "            <div class=\"bk-custom-region-name\" ng-switch=\"$ctrl.customRegionLoading\">\n" +
    "                <div ng-switch-when=\"true\">\n" +
    "                    <blink-loading-indicator>\n" +
    "                    </blink-loading-indicator>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"false\" class=\"bk-custom-region-def-name\" blink-tooltip=\"{{$ctrl.getCustomRegionName()}}\" ng-class=\"{'bk-no-def-selected': !$ctrl.customRegion}\">\n" +
    "                    {{$ctrl.getCustomRegionName()}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-custom-region-uploader\">\n" +
    "                <bk-custom-region-uploader bk-ctrl=\"$ctrl.customRegionUploader\">\n" +
    "                </bk-custom-region-uploader>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/data-sources/data-filters/data-filters.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/data-filters/data-filters.html",
    "<div class=\"bk-header\">\n" +
    "    <label><b>{{dataFilterConstantTexts.DATA_FILTERS}}</b></label>\n" +
    "    <bk-secondary-button class=\"bk-add-data-filter-btn\" text=\"{{dataFilterConstantTexts.ADD_FILTER}}\" icon=\"bk-style-icon-small-plus\" ng-click=\"showDataFilterPopup()\">\n" +
    "    </bk-secondary-button>\n" +
    "</div>\n" +
    "<div ng-if=\"isFilterNotDefined()\" class=\"bk-data-row\">\n" +
    "    <label>{{dataFilterConstantTexts.CREATE_FILTER_TEXT}}</label>\n" +
    "</div>\n" +
    "<div class=\"bk-datafilter-list\">\n" +
    "    <actionable-list ng-if=\"!isFilterNotDefined()\" on-row-click=\"onRowClick\" list-model=\"listModel\" action-items=\"actionItems\">\n" +
    "    </actionable-list>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-content-format.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{column.format(row)}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\">\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-footer-step-1.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-footer-step-1.html",
    "<div></div>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-page.html",
    "<blink-import-data></blink-import-data>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-step-datafilters.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-step-datafilters.html",
    "<div class=\"bk-dataload-step-data-filter\">\n" +
    "    <blink-data-filters filters=\"dataFilters\" tables=\"shuttleModel.selectedItems\" get-table-columns=\"getTableColumns\" class=\"bk-vertical-flex-container-sized\"></blink-data-filters>\n" +
    "    <hr>\n" +
    "    <blink-table-transformations transformations=\"transformations\" ds-metadata=\"dsMetaData\" tables=\"shuttleModel.selectedItems\" get-table-columns=\"getTableColumns\" class=\"bk-vertical-flex-container-sized\">\n" +
    "    </blink-table-transformations>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-step-final.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-step-final.html",
    "<div class=\"import-data\">\n" +
    "    <div class=\"bk-error-message\" ng-if=\"!dsMetaData.name\">\n" +
    "        {{ strings.NAME_DESCRIPTION_ERROR }}\n" +
    "    </div>\n" +
    "    <div blink-content-editable external=\"isEditMode()\" class=\"source-name-edit\" ng-model=\"dsMetaData.name\" placeholder=\"'Source name'\" description=\"dsMetaData.desc\">\n" +
    "    </div>\n" +
    "    <div class=\"table-viewer-container\">\n" +
    "        <div>\n" +
    "            <span class=\"tables-title\">{{strings.Tables}}</span>\n" +
    "            <general-item-viewer config=\"itemViewerConfig\" items=\"tablesToLoad\" get-sub-items=\"getTableColumns\">\n" +
    "            </general-item-viewer>\n" +
    "            <bk-checkbox class=\"truncate-checkbox\" bk-ctrl=\"truncateCheckboxCtrl\"></bk-checkbox>\n" +
    "            <bk-checkbox class=\"enable-emails-checkbox\" bk-ctrl=\"enableEmailsCheckboxCtrl\"></bk-checkbox>\n" +
    "        </div>\n" +
    "        <div class=\"advanced-options\">\n" +
    "            <bk-accordion-list-viewer class=\"advanced-options-list\" bk-ctrl=\"accordion\">\n" +
    "                <bk-accordion-list-viewer-item class=\"advanced-options-list-item\" bk-ctrl=\"accordionItem.Schedule\">\n" +
    "                    <div class=\"list-item-tpl\" ng-class=\"{expand: accordionItem.Schedule.isExpanded()}\" ng-include=\"'scheduler_id'\"></div>\n" +
    "                </bk-accordion-list-viewer-item>\n" +
    "                <bk-accordion-list-viewer-item ng-if=\"isTimelySchedulingEnabled\" class=\"advanced-options-list-item\" bk-ctrl=\"accordionItem.PreScript\">\n" +
    "                    <div class=\"list-item-tpl\" ng-class=\"{expand: accordionItem.PreScript.isExpanded()}\" ng-include=\"'pre_script'\"></div>\n" +
    "                </bk-accordion-list-viewer-item>\n" +
    "                <bk-accordion-list-viewer-item ng-if=\"isTimelySchedulingEnabled\" class=\"advanced-options-list-item\" bk-ctrl=\"accordionItem.PostScript\">\n" +
    "                    <div class=\"list-item-tpl\" ng-class=\"{expand: accordionItem.PostScript.isExpanded()}\" ng-include=\"'post_script'\"></div>\n" +
    "                </bk-accordion-list-viewer-item>\n" +
    "            </bk-accordion-list-viewer>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <script type=\"text/ng-template\" id=\"scheduler_id\">\n" +
    "        <div class=\"bk-scheduler-container\">\n" +
    "            <bk-scheduler schedule-config=\"scheduleConfig\"></bk-scheduler>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "    <script type=\"text/ng-template\" id=\"pre_script\">\n" +
    "        <div class=\"bk-schema\"\n" +
    "             ng-model=\"dsMetaData.preScriptText\"\n" +
    "             ui-ace=\"{\n" +
    "                useWrapMode : true,\n" +
    "                mode: 'tql',\n" +
    "                theme: 'sqlserver',\n" +
    "                require: ['ace/ext/language_tools'],\n" +
    "                workerPath: 'app/lib/min/ace',\n" +
    "                advanced: {\n" +
    "                    enableBasicAutocompletion: true,\n" +
    "                    enableLiveAutocompletion: true\n" +
    "                }\n" +
    "         }\">\n" +
    "        </div>\n" +
    "    </script>\n" +
    "    <script type=\"text/ng-template\" id=\"post_script\">\n" +
    "        <div class=\"bk-schema\"\n" +
    "             ng-model=\"dsMetaData.postScriptText\"\n" +
    "             ui-ace=\"{\n" +
    "                useWrapMode : true,\n" +
    "                mode: 'tql',\n" +
    "                theme: 'sqlserver',\n" +
    "                require: ['ace/ext/language_tools'],\n" +
    "                workerPath: 'app/lib/min/ace',\n" +
    "                advanced: {\n" +
    "                    enableBasicAutocompletion: true,\n" +
    "                    enableLiveAutocompletion: true\n" +
    "                }\n" +
    "         }\">\n" +
    "        </div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-step-shuttle.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-step-shuttle.html",
    "<div class=\"import-data import-step-shuttle\">\n" +
    "    <div class=\"bk-select-connection-dropdown\">\n" +
    "        <span class=\"bk-select-box\">\n" +
    "            <ui-select ng-model=\"dsMetaData.selectedConnection\" on-select=\"getTables()\" class=\"bk-conn-select\" search-enabled=\"!isEditMode()\" theme=\"select2\">\n" +
    "                <ui-select-match placeholder=\"Select a connection\">{{$select.selected.name}}</ui-select-match>\n" +
    "                <ui-select-choices repeat=\"connection.id as connection in connectionList\n" +
    "                        | filter: filterByConnectionName($select.search)\" class=\"bk-conn-item-holder\">\n" +
    "                    <span class=\"bk-conn-name\" ng-bind-html=\"connection.name | highlight: $select.search\">\n" +
    "                    </span>\n" +
    "                    <div class=\"bk-conn-delete-icon\" data-tip-animate=\"fade-in\" ng-hide=\"isEditMode()\" blink-tooltip=\"{{ strings.DELETE_CONN }}\" ng-click=\"deleteConnection($event, connection)\">   </div>\n" +
    "                    <div class=\"bk-conn-edit-icon\" data-tip-animate=\"fade-in\" blink-tooltip=\"{{ strings.EDIT_CONN }}\" ng-click=\"editConnection($event, connection)\"></div>\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </span>\n" +
    "        <span ng-if=\"shouldAllowNewConnection()\" class=\"bk-btn-create-conn\" blink-tooltip=\"{{ strings.CREATE_CONN }}\" data-tip-animate=\"fade-in\" ng-click=\"createNewConnection()\">\n" +
    "            <div class=\"bk-style-icon-small-plus\"></div>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"table-viewer-container\">\n" +
    "        <shuttle-viewer shuttle-model=\"shuttleModel\" disabled-tip=\"strings.DATATYPE_NOT_SUPPORTED_TIP\" get-sub-items=\"getTableColumns\">\n" +
    "        </shuttle-viewer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/import-data/import-data-step-type.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data-step-type.html",
    "<div class=\"bk-data-management\">\n" +
    "    <div class=\"bk-workflow-pane\">\n" +
    "        <div class=\"bk-type-search\">\n" +
    "            <input type=\"text\" class=\"bk-search-input\" placeholder=\"Search by name\" ng-model=\"searchText\">\n" +
    "        </div>\n" +
    "        <div class=\"bk-image-containers\">\n" +
    "            <div class=\"bk-show-case-image-container\" ng-repeat=\"dsDisplayName in displayNames | filter: searchText | orderBy : dsDisplayName\">\n" +
    "                <div class=\"bk-image-text\">\n" +
    "                    <div class=\"bk-image-container\" ng-click=\"selectSourceType(dsDisplayName)\" ng-class=\"{'bk-selected': isSelected(dsDisplayName)}\" blink-tooltip=\"{{getShowCaseImageTooltip(dsDisplayName)}}\">\n" +
    "\n" +
    "                        <img ng-src=\"{{getImageSource(dsDisplayName)}}\" class=\"bk-show-cased-data-source-img\" alt=\"{{ dsDisplayName }}\">\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-image-label\">\n" +
    "                        {{dsDisplayName}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/import-data/import-data.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/import-data/import-data.html",
    "<div class=\"bk-import-data-workflow\">\n" +
    "    <div blink-loading-indicator-overlay></div>\n" +
    "\n" +
    "    <div class=\"bk-wizard-header\">\n" +
    "        <div class=\"bk-wizard-header-item\" ng-repeat=\"step in userDataWizard.steps\">\n" +
    "            <div ng-class=\"{'bk-current': userDataWizard.isCurrentStep($index),\n" +
    "                                       'bk-done': userDataWizard.isCompletedStep($index),\n" +
    "                                       'bk-future': (!userDataWizard.isCurrentStep($index)\n" +
    "                                       && !userDataWizard.isCompletedStep($index))}\" class=\"bk-heading-desc\">\n" +
    "                <span class=\"bk-badge\">{{$index + 1}}</span>\n" +
    "                <span class=\"bk-heading\">{{step.title}}</span>\n" +
    "                <span class=\"bk-sub-heading\" ng-show=\"step.isOptional\">{{strings.OPTIONAL_STEP}}\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"bk-arrow\">\n" +
    "                <div class=\"bk-forward-arrow\" ng-if=\"showForwardArrow($index)\">\n" +
    "                    <div class=\"bk-line\"></div>\n" +
    "                    <div class=\"bk-point\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-wizard-step-error row\">\n" +
    "        <div class=\"span12\">\n" +
    "            <div class=\"bk-import-error-body\" ng-show=\"!!errorRowMsg\">\n" +
    "                \n" +
    "                {{ errorRowMsg }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-wizard-body row\">\n" +
    "        <div class=\"span12 bk-wizard-content\" ng-include=\"userDataWizard.getContentUrl()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-upload-footer\" ng-hide=\"!!userDataWizard.hideFooterForCurrentStep()\">\n" +
    "        <div class=\"bk-upload-footer-body\">\n" +
    "            <div class=\"bk-upload-footer-left\">\n" +
    "                <div ng-include=\"userDataWizard.getFooterUrl()\"></div>\n" +
    "                <bk-secondary-button text=\"{{ btnStrings.BACK }}\" ng-hide=\"userDataWizard.isCurrentStep(0)\" ng-click=\"userDataWizard.goToPreviousStep()\"></bk-secondary-button>\n" +
    "            </div>\n" +
    "            <div class=\"bk-wizard-btn-group\">\n" +
    "                <bk-secondary-button text=\"{{ btnStrings.CANCEL }}\" ng-click=\"onCancel()\" ng-show=\"isWizardCancellable\"></bk-secondary-button>\n" +
    "                <div class=\"bk-wizard-button\" data-title=\"{{ userDataWizard.getProceedInstructions() }}\">\n" +
    "                    <bk-primary-button text=\"{{ nextBtnLabel }}\" is-disabled=\"userDataWizard.isNextDisabled()\" class=\"bk-next-button\" ng-hide=\"userDataWizard.isLastStep()\" ng-click=\"userDataWizard.goToNextStep()\"></bk-primary-button>\n" +
    "                </div>\n" +
    "                <div class=\"bk-wizard-button\">\n" +
    "                    <bk-primary-button text=\"{{ btnStrings.IMPORT }}\" ng-if=\"userDataWizard.isLastStep()\" is-disabled=\"isImportDisabled()\" blink-tooltip=\"{{getImportTooltip()}}\" data-placement=\"right\" ng-click=\"startImportDataWorkflow()\" class=\"bk-btn-finish\"></bk-primary-button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/status-viewer/status-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/status-viewer/status-viewer.html",
    "<div class=\"bk-status-viewer\">\n" +
    "    <div class=\"status-viewer-header\">\n" +
    "        <div class=\"view-all\">\n" +
    "            <bk-icon-button icon=\"bk-style-icon-arrow-right\" ng-click=\"onHide()\"></bk-icon-button>\n" +
    "        </div>\n" +
    "        <div class=\"bk-status-spacer\"></div>\n" +
    "        <div class=\"bk-viewer-button\">\n" +
    "            <bk-secondary-button text=\"{{ strings.importData.SCHEDULE }}\" class=\"bk-open-scheduler\" ng-click=\"openScheduler()\"></bk-secondary-button>\n" +
    "            <bk-secondary-button text=\"{{strings.EDIT}}\" class=\"bk-edit-click\" ng-click=\"onEditClick()\"></bk-secondary-button>\n" +
    "            <bk-secondary-button text=\"{{strings.REFRESH}}\" class=\"bk-refresh-status\" ng-click=\"refreshStatus()\"></bk-secondary-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-status-viewer-list\">\n" +
    "        <actionable-list on-row-click=\"onRowClick\" list-model=\"listModel\" action-items=\"actionItems\">\n" +
    "        </actionable-list>\n" +
    "        <hr>\n" +
    "        <div class=\"bk-status-details\">\n" +
    "            {{ selectedItem.name }}\n" +
    "            <div class=\"status-message\">\n" +
    "                {{ selectedItem.message }}\n" +
    "            </div>\n" +
    "            <div class=\"status-message\" ng-if=\"canDownloadTrace(selectedItem)\">\n" +
    "                <a ng-click=\"selectedItem.sessionLog.fetchLog(selectedItem.dataSourceID, selectedItem.name)\">\n" +
    "                    {{selectedItem.sessionLog.clickText}}</a>\n" +
    "            </div>\n" +
    "            <div class=\"script-status-message\" ng-if=\"!!selectedItem\">\n" +
    "                <div class=\"status-message\" ng-if=\"!!selectedItem.preScriptStatus\">\n" +
    "                    <span class=\"status-message-title\">\n" +
    "                        {{strings.importData.PRE_SCRIPT_STATUS}}:\n" +
    "                    </span>\n" +
    "                    {{selectedItem.preScriptStatus }}\n" +
    "                </div>\n" +
    "                <div class=\"status-message\" ng-if=\"!!selectedItem.postScriptStatus\">\n" +
    "                    <span class=\"status-message-title\">\n" +
    "                        {{strings.importData.POST_SCRIPT_STATUS}}:\n" +
    "                    </span>\n" +
    "                    {{selectedItem.postScriptStatus }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"status-format.html\">\n" +
    "        <div class=\"bk-status-content\">\n" +
    "            <div class=\"bk-status-{{column.format(row)[0]}}\">\n" +
    "                <span class=\"status-text\">{{column.format(row)[1]}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/modules/data-sources/transformation-editor/table-transformations/table-transformations.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/transformation-editor/table-transformations/table-transformations.html",
    "<div class=\"bk-header\">\n" +
    "    <label><b>{{ strings.transformationEditor.TRANSFORMATION }}</b></label>\n" +
    "    <bk-secondary-button class=\"bk-add-transform-btn\" text=\"{{strings.transformationEditor.ADD_EXPRESSION}}\" icon=\"bk-style-icon-small-plus\" ng-click=\"showTransformationsEditor()\">\n" +
    "    </bk-secondary-button>\n" +
    "</div>\n" +
    "<div ng-if=\"isTransformationNotDefined()\" class=\"bk-data-row\">\n" +
    "    <label>{{ strings.transformationEditor.NO_TRANSFORMATIONS_DEFINED }}</label>\n" +
    "</div>\n" +
    "<div ng-if=\"!isTransformationNotDefined()\" class=\"bk-data-row\">\n" +
    "    <actionable-list class=\"bk-transformations-list\" on-row-click=\"onRowClick\" list-model=\"listModel\" action-items=\"actionItems\">\n" +
    "    </actionable-list>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"transformation-editor-popup.html\">\n" +
    "    <div class=\"bk-transformation-editor-popup\">\n" +
    "        <bk-transformation-editor transformation=\"transformation\"\n" +
    "                                  on-upsert-transform=\"onUpsertTransform\"\n" +
    "                                  ds-metadata=\"dsMetadata\"\n" +
    "                                  tables=\"tables\"\n" +
    "                                  on-done=\"onDone\"\n" +
    "                                  get-table-columns=\"getTableColumns\">\n" +
    "        </bk-transformation-editor>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/data-sources/transformation-editor/transformation-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-sources/transformation-editor/transformation-editor.html",
    "<div class=\"transformation-editor-container\">\n" +
    "  <form name=\"expressionEditorForm\">\n" +
    "      <div class=\"bk-editor-header\">\n" +
    "          <div class=\"transformation-table-selector-row\">\n" +
    "              <span class=\"bk-select-box\">\n" +
    "                  <ui-select ng-model=\"transformationModel.table\" ng-disabled=\"transformationModel.isExisting\" on-select=\"updateColumnNames()\" theme=\"select2\" search-enabled=\"true\">\n" +
    "                      <ui-select-match placeholder=\"{{strings.transformationEditor.SELECT_TABLE}}\">\n" +
    "                          {{$select.selected.name}}\n" +
    "                      </ui-select-match>\n" +
    "                      <ui-select-choices repeat=\"table in tables | filter: $select.search\">\n" +
    "                          {{table.name}}\n" +
    "                      </ui-select-choices>\n" +
    "                  </ui-select>\n" +
    "              </span>\n" +
    "              <a class=\"bk-transformation-assistant-link\" target=\"_blank\" ng-href=\"{{getTransformationAssistantLink()}}\">\n" +
    "                  <span class=\"bk-style-icon-formulae-assistant bk-icon\"></span>\n" +
    "                  <span>{{ strings.transformationEditor.TRANSFORM_ASSISTANT }}</span>\n" +
    "              </a>\n" +
    "          </div>\n" +
    "          <div class=\"transformation-column-selector-row\">\n" +
    "              <span class=\"bk-select-box\">\n" +
    "                  <ui-select ng-model=\"props.selectedColumnName\" ng-if=\"!transformationModel.isExisting\" on-select=\"updateTargetName($item)\" theme=\"select2\" search-enabled=\"true\">\n" +
    "                      <ui-select-match placeholder=\"{{strings.transformationEditor.SELECT_COLUMN}}\">\n" +
    "                          {{getColumnDropdownValue($select.selected)}}\n" +
    "                      </ui-select-match>\n" +
    "                      <ui-select-choices repeat=\"column.name as column in columns | filter: $select.search\">\n" +
    "                          {{getColumnDropdownValue(column)}}\n" +
    "                      </ui-select-choices>\n" +
    "                  </ui-select>\n" +
    "              </span>\n" +
    "              <input class=\"bk-transformation-name\" type=\"text\" name=\"newColumnName\" ng-if=\"showNameEditor()\" disallow-empty ng-model=\"transformationModel.name\" ng-pattern=\"getValidator()\" ng-class=\"{'bk-validation-failed': expressionEditorForm.newColumnName.$error.pattern }\" not-editable=\"transformationModel.isExisting\" placeholder=\"'Enter new column name'\" class=\"bk-transformation-name\">\n" +
    "          </div>\n" +
    "      </div>\n" +
    "  </form>\n" +
    "    <div class=\"bk-editor-body\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"transformation-editable\" ng-model=\"transformationModel.expression\" ui-ace=\"{\n" +
    "                        useWrapMode : true,\n" +
    "                        theme: 'sqlserver',\n" +
    "                        mode: 'transformations',\n" +
    "                        require: ['ace/ext/language_tools'],\n" +
    "                        workerPath: 'app/lib/min/ace',\n" +
    "                        advanced: {\n" +
    "                            enableBasicAutocompletion: true,\n" +
    "                            enableLiveAutocompletion: true\n" +
    "                        },\n" +
    "                        onLoad : onEditorLoaded\n" +
    "                }\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-editor-footer\">\n" +
    "        <div class=\"error-message\" ng-show=\"!!error\">{{ error.message }}\n" +
    "            <a ng-if=\"!!error.customData.traceId\" ng-click=\"error.customData.downloadTrace(traceId)\">{{strings.DOWNLOAD_TRACE}}</a>\n" +
    "        </div>\n" +
    "        <div class=\"validation-message\" ng-show=\"!error  && !!footerMessage\">{{ footerMessage }}</div>\n" +
    "\n" +
    "        <a class=\"bk-btn bk-btn-cancel\" ng-click=\"cancelTransformationEditing()\">{{strings.CANCEL}}</a>\n" +
    "        <a class=\"bk-btn bk-btn-primary bk-confirm-btn\" ng-class=\"{'bk-btn-blue':canAddTransformationToDocument(),\n" +
    "            'bk-btn-disabled': !canAddTransformationToDocument()}\" blink-tooltip=\"{{ getSaveBtnTooltip() }}\" ng-click=\"onTransformationAdded()\">{{ strings.transformationEditor.ADD_COLUMN }}</a>\n" +
    "        <a class=\"bk-btn bk-btn-primary bk-confirm-btn\" ng-class=\"{'bk-btn-blue':canAddTransformationToDocument(),\n" +
    "            'bk-btn-disabled': !canAddTransformationToDocument()}\" blink-tooltip=\"{{ getSaveBtnTooltip() }}\" ng-click=\"onValidateTransformation()\">{{ strings.transformationEditor.VALIDATE_COLUMN }}</a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/data-viz/data-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/data-viz/data-viz.html",
    "<div class=\"bk-data-viz\" ng-switch=\"$ctrl.state\">\n" +
    "    <blink-loading-indicator ng-switch-when=\"initial\" class=\"bk-data-viz-placeholder\">\n" +
    "    </blink-loading-indicator>\n" +
    "    <blink-loading-indicator ng-switch-when=\"loadingData\" class=\"bk-data-viz-placeholder\">\n" +
    "    </blink-loading-indicator>\n" +
    "    <blink-loading-indicator ng-switch-when=\"dataLoaded\" class=\"bk-data-viz-placeholder\">\n" +
    "    </blink-loading-indicator>\n" +
    "    <div ng-switch-when=\"corrupt\" class=\"bk-data-viz-corrupt\">\n" +
    "        {{$ctrl.strings.dataViz.CORRUPT_VIZ}}\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"dataLoadFailed\" class=\"bk-data-viz-data-load-failed\">\n" +
    "        {{$ctrl.strings.dataViz.FAILED_DATA_LOAD}}\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"render\" class=\"bk-data-viz-content\" ng-switch=\"$ctrl.type\">\n" +
    "        <bk-chart-viz ng-switch-when=\"chart\" class=\"bk-data-viz-chart-container\" bk-ctrl=\"$ctrl\">\n" +
    "        </bk-chart-viz>\n" +
    "        <bk-headline-viz ng-switch-when=\"headline\" class=\"bk-data-viz-headline-container\" bk-ctrl=\"$ctrl\">\n" +
    "        </bk-headline-viz>\n" +
    "        <bk-table-viz ng-switch-when=\"table\" class=\"bk-data-viz-table-container\" bk-ctrl=\"$ctrl\">\n" +
    "        </bk-table-viz>\n" +
    "        <bk-visualization-pinner-launcher class=\"bk-viz-btn-icon\" ng-if=\"$ctrl.allowPinning\" bk-ctrl=\"$ctrl.vizPinnerLauncherComponent\">\n" +
    "        </bk-visualization-pinner-launcher>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/columns/author.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/author.html",
    "<div title=\"{{column.getAuthorDisplayName(row)}}\">\n" +
    "    <blink-profile-pic user-id=\"column.getAuthorId(row)\" user-display-name=\"column.getAuthorDisplayName(row)\" class=\"bk-profile-pic\">\n" +
    "    </blink-profile-pic>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/columns/datetime.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/datetime.html",
    "<div title=\"{{column.formatTimestamp(row)}}\">{{column.fromNow(row)}}</div>");
}]);

angular.module("src/modules/debug/columns/deleted.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/deleted.html",
    "<div><div ng-show=\"row.isDeleted\" class=\"circle-icon-red\"></div></div>");
}]);

angular.module("src/modules/debug/columns/dependency-group-marker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/dependency-group-marker.html",
    "<div class=\"bk-group-marker\">\n" +
    "{{strings.Dependency}}\n" +
    "<span class=\"mono\">{{row.dependency}} ({{model.getDependencyName(row.dependency)}})</span>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/columns/hidden.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/hidden.html",
    "<div><div ng-show=\"row.isHidden\" class=\"circle-icon-blue\"></div></div>");
}]);

angular.module("src/modules/debug/columns/id.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/id.html",
    "<div title=\"{{row.id}}\"><a class=\"bk-guid\">{{column.format(row)}}</a></div>");
}]);

angular.module("src/modules/debug/columns/name.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/name.html",
    "<div>{{row.name}}</div>");
}]);

angular.module("src/modules/debug/columns/owner.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/owner.html",
    "<div title=\"{{row.owner}}\">\n" +
    "    <a class=\"bk-guid\" ng-if=\"row.owner !== row.id\">{{column.format(row)}}</a>\n" +
    "    <span ng-if=\"row.owner === row.id\">{{column.constants.IS_ROOT}}</span>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/columns/type.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/columns/type.html",
    "<div>{{row.type}}</div>");
}]);

angular.module("src/modules/debug/debug-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/debug-page.html",
    "<blink-debug></blink-debug>");
}]);

angular.module("src/modules/debug/debug.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/debug.html",
    "<div class=\"bk-app-canvas-module-inner\">\n" +
    "    <div class=\"bk-metadata-list bk-debug\">\n" +
    "        <div class=\"bk-header clearfix\">\n" +
    "            <div class=\"bk-page-title fl\">{{strings.Debug}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"tab-navigation\">\n" +
    "            <tab-control on-tab-activated=\"onTabActivated(activeTab)\">\n" +
    "                <tab-control-tab tab-name=\"Loggers\" tab-id=\"loggers\">\n" +
    "                    <div class=\"tab-content\">\n" +
    "                        <blink-loggers-management></blink-loggers-management>\n" +
    "                    </div>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"Memcache\" tab-id=\"memcache\">\n" +
    "                    <div class=\"bk-debug-content-inner tab-content\">\n" +
    "                        <blink-memcache-management></blink-memcache-management>\n" +
    "                    </div>\n" +
    "                </tab-control-tab>\n" +
    "                <tab-control-tab tab-name=\"Metadata\" tab-id=\"metadata\">\n" +
    "                    <div class=\"tab-content\">\n" +
    "                        <blink-metadata-management></blink-metadata-management>\n" +
    "                    </div>\n" +
    "                </tab-control-tab>\n" +
    "            </tab-control>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/loggers-management.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/loggers-management.html",
    "<blink-loading-indicator ng-show=\"isLoading\"></blink-loading-indicator>\n" +
    "<div ng-repeat=\"logger in loggers track by logger.name\" ng-show=\"!isLoading\">\n" +
    "    <div class=\"bk-logger-item\">\n" +
    "        <div class=\"row-fluid bk-row-margin\">\n" +
    "            <div class=\"span6\">\n" +
    "                <b>{{logger.name}}</b>\n" +
    "                <div>\n" +
    "                    {{logger.description}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"span6\">\n" +
    "                <div class=\"bk-select-box\">\n" +
    "                    <select ng-model=\"logger.currentLevel\" ng-options=\"level for level in logLevels\" chosen>\n" +
    "                    </select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"row-fluid bk-row-margin\" ng-show=\"logger.currentLevel != logger.originalLevel\">\n" +
    "            <div class=\"span7\"></div>\n" +
    "            <div class=\"span1 text-right\">{{strings.Timeout}}</div>\n" +
    "            <div class=\"span3 text-right\">\n" +
    "                <div class=\"bk-select-box\">\n" +
    "                    <select ng-model=\"logger.timeout\" ng-options=\"timeout.title for timeout in timeouts track by timeout.value\" chosen>\n" +
    "                    </select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"span1 text-right\">\n" +
    "                <button class=\"bk-btn\" ng-disabled=\"logger.timeout === null\" ng-click=\"onLevelApplyClick(logger)\">\n" +
    "{{strings.Apply}}\n" +
    "</button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/memcache-management.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/memcache-management.html",
    "<blink-loading-indicator ng-show=\"isLoading\"></blink-loading-indicator>\n" +
    "<div ng-show=\"!isLoading\">\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <div class=\"span10\"></div>\n" +
    "        <div class=\"span2\">\n" +
    "            <button class=\"bk-btn\" ng-click=\"onMemcacheClearClick()\">\n" +
    "{{strings.Clear_cache}}\n" +
    "</button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row-fluid bk-row-margin\">\n" +
    "        <div class=\"instance-select\">\n" +
    "            <div ng-repeat=\"instance in stats track by instance.addr\" class=\"instance-item\" ng-class=\"{'select': instance.addr === currentInstance.addr}\" ng-click=\"selectInstance(instance)\">\n" +
    "                {{instance.addr}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <pie-chart class=\"span6\" data=\"memoryChartData\" title=\"Memory usage\"></pie-chart>\n" +
    "        <pie-chart class=\"span6\" data=\"efficiencyChartData\" title=\"Efficiency\"></pie-chart>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row-fluid bk-row-margin\">\n" +
    "        <span class=\"bk-stat-header\"><small>{{strings.Objects_count}}</small>{{currentInstance.total_items}}</span>\n" +
    "        <span class=\"bk-stat-header\"><small>{{strings.Connections}}</small>{{currentInstance.curr_connections}}</span>\n" +
    "        <span class=\"bk-stat-header\"><small>{{strings.Data_read}}</small>{{currentInstance.bytes_read | bytes}}</span>\n" +
    "        <span class=\"bk-stat-header\"><small>{{strings.Data_written}}</small>{{currentInstance.bytes_written | bytes}}</span>\n" +
    "        <span class=\"bk-stat-header\"><small>{{strings.Memory_used}}</small>{{currentInstance.bytes | bytes}}</span>\n" +
    "        <a class=\"bk-more\" ng-show=\"!statsExpanded\" ng-click=\"toggleStats()\">\n" +
    "{{strings.More}}\n" +
    "</a>\n" +
    "        <a ng-show=\"statsExpanded\" ng-click=\"toggleStats()\">\n" +
    "{{strings.Less}}\n" +
    "</a>\n" +
    "    </div>\n" +
    "\n" +
    "    <pre class=\"bk-row-margin\" ng-if=\"statsExpanded\">\n" +
    "        <json-formatter json=\"currentInstance\" open=\"1\"></json-formatter>\n" +
    "    </pre>\n" +
    "\n" +
    "    <h4 class=\"bk-row-margin\">{{strings.Search_memcache}}</h4>\n" +
    "\n" +
    "    <div class=\"row-fluid bk-row-margin\">\n" +
    "        <form class=\"form-inline\">\n" +
    "            <div class=\"span6\">\n" +
    "                <div class=\"bk-select-box\">\n" +
    "                    <select ng-model=\"memcacheSearch.objectType\" ng-options=\"type for type in memcacheSearch.objectTypes\" ng-change=\"refreshChoices()\" chosen>\n" +
    "                    </select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"span3\">\n" +
    "                <input type=\"checkbox\" ng-model=\"memcacheSearch.showHidden\" ng-change=\"refreshChoices()\" ng-change=\"refreshSearchResults()\">\n" +
    "                <label>{{strings.Show_hidden}}</label>\n" +
    "            </div>\n" +
    "            <div class=\"span3\">\n" +
    "                <input type=\"checkbox\" ng-change=\"refreshChoices()\" ng-model=\"memcacheSearch.useUnsecured\" ng-change=\"refreshSearchResults()\">\n" +
    "                <label>{{strings.Use_unsecured}}</label>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row-fluid bk-row-margin\">\n" +
    "        <div class=\"span4\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <select ng-model=\"memcacheSearch.user\" ng-options=\"user.getDisplayName() for user in users track by user.getId()\" ng-change=\"refreshChoices()\" chosen>\n" +
    "                </select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"span8\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <select ng-model=\"memcacheSearch.currentObject\" ng-options=\"object.getTitle() for object in memcacheSearch.objectChoices track by object.id\" ng-enabled=\"!!memcacheSearch.user && !!memcacheSearch.objectTypes && !!memcacheSearch.objectChoices\" ng-change=\"refreshSearchResults()\" chosen>\n" +
    "                </select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <pre class=\"bk-row-margin\" ng-if=\"memcacheSearchResults\">\n" +
    "        <json-formatter json=\"memcacheSearchResults\" open=\"2\"></json-formatter>\n" +
    "    </pre>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/metadata-management.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/metadata-management.html",
    "<div class=\"bk-metadata-management\">\n" +
    "    <div class=\"bk-metadata-schema-version\">\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <div class=\"span2\">\n" +
    "                <small>{{strings.Logical_version}}</small>{{schemaVersion.logicalVersion}}\n" +
    "            </div>\n" +
    "            <div class=\"span2\">\n" +
    "                <small>{{strings.Physical_version}}</small>{{schemaVersion.physicalVersion}}\n" +
    "            </div>\n" +
    "            <div class=\"span2\">\n" +
    "                <small>{{strings.Installed_version}}</small>{{schemaVersion.installedMetadataSchemaVersion}}\n" +
    "            </div>\n" +
    "            <div class=\"span3\">\n" +
    "                <small>{{strings.Current_version}}</small>{{schemaVersion.metadataSchemaVersion}}\n" +
    "            </div>\n" +
    "            <div class=\"span3\">\n" +
    "                <a href=\"/callosum/v1/admin/debug/sagemetadata\" target=\"_blank\">{{strings.download_sage}}</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-metadata-search bk-row-margin\" ng-show=\"!showingDetails\">\n" +
    "        \n" +
    "        <div class=\"row-fluid\" ng-show=\"!showingDependencies\">\n" +
    "            <form class=\"form-inline\">\n" +
    "                <div class=\"span4\">\n" +
    "                    <div class=\"bk-select-box\">\n" +
    "                        <select ng-model=\"currentSearch.objectType\" ng-options=\"type for type in currentSearch.objectTypes\" ng-change=\"refreshSearchResults()\" chosen>\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"span4\">\n" +
    "                    <input type=\"text\" class=\"form-control bk-filter-control\" ng-model=\"currentSearch.id\" ng-change=\"applyClientFilters()\" placeholder=\"Filter by ID\">\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"span2\">\n" +
    "                    <input type=\"checkbox\" ng-model=\"currentSearch.showHidden\" ng-change=\"refreshSearchResults()\">\n" +
    "                    <label>{{strings.Show_hidden}}</label>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"span2\">\n" +
    "                    <input type=\"checkbox\" ng-model=\"currentSearch.incompleteOnly\" ng-change=\"applyClientFilters()\">\n" +
    "                    <label>{{strings.Incomplete_only}}</label>\n" +
    "                </div>\n" +
    "\n" +
    "            </form>\n" +
    "        </div>\n" +
    "\n" +
    "        \n" +
    "        <div class=\"row-fluid\" ng-show=\"showingDependencies\">\n" +
    "            <div class=\"span1\">\n" +
    "                <div class=\"bk-btn\" ng-click=\"clearDependencies()\"><span>{{strings.Back}}</span></div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-token-layer span11\">\n" +
    "                <div class=\"bk-token\" ng-repeat=\"item in showingDependenciesFor track by item.id\">\n" +
    "                 {{item.name}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <actionable-list action-items=\"listActions\" list-model=\"searchResultsModel\" class=\"bk-row-margin bk-metadata-list\" ng-show=\"!isLoading && !showingDetails\">\n" +
    "    </actionable-list>\n" +
    "\n" +
    "    <div ng-show=\"showingDetails && !isLoading\" class=\"bk-row-margin bk-metadata-details-list\">\n" +
    "        <a ng-click=\"closeDetails()\" class=\"bk-back-link\">{{strings.Back2}}</a>\n" +
    "        <div ng-repeat=\"item in detailsData track by item.header.id\">\n" +
    "            <div class=\"bk-metadata-header\">\n" +
    "                    <div class=\"header-id\">\n" +
    "                        {{item.header.id}}\n" +
    "                    </div>\n" +
    "                    <div class=\"header-type\">\n" +
    "                        {{item.type}}\n" +
    "                    </div>\n" +
    "                    <div class=\"header-name\">\n" +
    "                        {{item.header.name}}\n" +
    "                    </div>\n" +
    "                    <div class=\"header-status\">\n" +
    "                        <span class=\"complete\" ng-show=\"item.complete\">{{strings.complete}}</span>\n" +
    "                        <span class=\"incomplete\" ng-show=\"!item.complete\">{{strings.incomplete}}</span>\n" +
    "                    </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-metadata-details\">\n" +
    "                <json-formatter json=\"item\" open=\"1\"></json-formatter>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <blink-loading-indicator ng-show=\"isLoading\"></blink-loading-indicator>\n" +
    "</div>");
}]);

angular.module("src/modules/debug/pie-chart.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/debug/pie-chart.html",
    "<div class=\"canvas\"></div>");
}]);

angular.module("src/modules/embed/blink-embed.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/embed/blink-embed.html",
    "<div class=\"bk-embed\" ng-switch=\"isEmbedConfigurationValid()\">\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-invalid-embed-config\">\n" +
    "        {{ getInvalidEmbedConfigurationMessage() }}\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-embed-content-container\">\n" +
    "        <pinboard-page class=\"bk-pinboard-page\" ng-class=\"{'single-viz-mode': singleVizMode}\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"pinboardId\" pinboard-page-config=\"pinboardPageConfig\">\n" +
    "        </pinboard-page>\n" +
    "    </div>\n" +
    "    <bk-powered-footer class=\"bk-embed-powered-by-ts-ribbon\" ng-if=\"showPoweredByRibbon()\" bk-ctrl=\"poweredFooterComponent\"></bk-powered-footer>\n" +
    "</div>");
}]);

angular.module("src/modules/embed/embedding-control/embedding-control-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/embed/embedding-control/embedding-control-dialog.html",
    "<div class=\"bk-embedding-control-dialog\">\n" +
    "    <div>{{ $ctrl.data.customData.actionMessage }}</div>\n" +
    "    <textarea readonly=\"readonly\" class=\"bk-embedding-snippet\">{{ $ctrl.data.customData.embedSnippet }}</textarea>\n" +
    "</div>");
}]);

angular.module("src/modules/embed/embedding-control/embedding-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/embed/embedding-control/embedding-control.html",
    "<div class=\"bk-embedding-control\" ng-click=\"showEmbeddingControlPopup($event)\">\n" +
    "    <div class=\"bk-viz-btn-icon bk-style-icon-link\" blink-tooltip=\"{{ getControlTooltip() }}\"></div>\n" +
    "</div>");
}]);

angular.module("src/modules/empty-page-placeholder/empty-page-placeholder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/empty-page-placeholder/empty-page-placeholder.html",
    "<div class=\"bk-empty-page-placeholder\">\n" +
    "    <div class=\"bk-empty-page-placeholder-icon bk-style-icon-logo\" ng-if=\"!$ctrl.isCustomizationEnabled()\"></div>\n" +
    "    <div class=\"bk-empty-page-placeholder-label\">\n" +
    "        {{ $ctrl.placeholderText }}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/expression-editor/expression-editor-tooltip/expression-editor-tooltip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/expression-editor/expression-editor-tooltip/expression-editor-tooltip.html",
    "<div class=\"bk-expression-editor-tooltip\">\n" +
    "    <div ng-bind-html=\"bubbleData\"></div>\n" +
    "    <div class=\"bk-bubble-arrow-wrapper\">\n" +
    "        <div class=\"bk-bubble-arrow\"></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/expression-editor/expression-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/expression-editor/expression-editor.html",
    "<div class=\"bk-expression-editor\">\n" +
    "    <div class=\"bk-content-editor-container\">\n" +
    "        <expression-editor-tooltip></expression-editor-tooltip>\n" +
    "        <div contenteditable=\"true\" spellcheck=\"false\" class=\"content-editor\" data-placeholder=\"start typing your formula here\" ng-class=\"{'expression-error': hasValidationErrors(),\n" +
    "                     'expression-busy': hasIncompleteExpression(),\n" +
    "                     'expression-valid' : hasValidCompleteExpression()}\"></div>\n" +
    "\n" +
    "        <div class=\"expression-editor-context-menu\" ng-show=\"shouldShowContextMenu()\" blink-overlay=\"hideContextMenu()\">\n" +
    "            <div ng-include=\"'src/modules/expression-editor/expression-suggestions-menu.html'\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"expression-editor-validation-message\" ng-class=\"{'expression-error': hasValidationErrors(),\n" +
    "                     'expression-busy': hasIncompleteExpression(),\n" +
    "                     'expression-valid' : hasValidCompleteExpression()}\" ng-show=\"shouldShowValidationMessage()\">\n" +
    "                    <span ng-switch=\"hasValidCompleteExpression()\" class=\"bk-validation-icons\">\n" +
    "                        <span ng-switch-when=\"true\" class=\"bk-style-icon-circled-checkmark bk-icon bk-success-icon\">\n" +
    "                        </span>\n" +
    "                        <span ng-switch-when=\"false\" ng-switch=\"hasValidationErrors()\">\n" +
    "                            <bk-cross-icon ng-switch-when=\"true\" class=\"bk-icon bk-error-icon\" data-placement=\"bottom\" blink-tooltip=\"{{getExpressionMessage()}}\"></bk-cross-icon>\n" +
    "                            <span ng-switch-when=\"false\" class=\"bk-style-icon-circled-information bk-icon bk-warn-icon\">\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "        <span class=\"bk-message\" ng-bind-html=\"getExpressionMessage()\"></span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/expression-editor/expression-suggestion-item-tooltip.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/expression-editor/expression-suggestion-item-tooltip.html",
    "<span class=\"bk-formula-suggestion-tooltip\">\n" +
    "    \n" +
    "    <span ng-if=\"!suggestion.getSuggestionToken().isFunctionToken()\">\n" +
    "        <span ng-bind-html=\"suggestion.getMetaInfoHtml()\"></span>\n" +
    "    </span>\n" +
    "    <div ng-if=\"!!suggestion.getSuggestionToken().isFunctionToken()\" ng-init=\"helpData = suggestion.getHelpDataForFunctionSuggestion()\" class=\"bk-suggestion-examples\">\n" +
    "        <div ng-bind-html=\"helpData.helpText\" class=\"bk-help-text\"></div>\n" +
    "        <div class=\"bk-examples-list\" ng-if=\"!!helpData.fixedExample || !!helpData.queryExample\">\n" +
    "            <div>{{strings.Examples}}</div>\n" +
    "            <ul>\n" +
    "                <li ng-if=\"!!helpData.fixedExample\">\n" +
    "                    <span ng-repeat=\"token in helpData.fixedExample\">\n" +
    "                        <span>{{ token.value }}</span>\n" +
    "                        <span ng-switch=\"!!token.spaceAfter\">\n" +
    "                            <span ng-switch-when=\"true\">&nbsp;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </li>\n" +
    "                <li ng-if=\"!!helpData.queryExample\">\n" +
    "                    <span ng-repeat=\"token in helpData.queryExample\">\n" +
    "                        <span>{{ token.value }}</span>\n" +
    "                        <span ng-switch=\"!!token.spaceAfter\">\n" +
    "                            <span ng-switch-when=\"true\">&nbsp;</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</span>");
}]);

angular.module("src/modules/expression-editor/expression-suggestion-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/expression-editor/expression-suggestion-item.html",
    "<span>\n" +
    "    <span class=\"suggestion-name\" ng-class=\"suggestion.getTokenCssClass()\">{{ suggestion.getSuggestionTokenText() }}</span>\n" +
    "    <span ng-show=\"!!suggestion.getLinks()\"> - {{ suggestion.getLinks() }}</span>\n" +
    "    <span class=\"lineage\" ng-show=\"!!suggestion.getLineage()\"> {{ suggestion.getLineage().replace('->', '\\u2192') }}</span>\n" +
    "</span>");
}]);

angular.module("src/modules/expression-editor/expression-suggestions-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/expression-editor/expression-suggestions-menu.html",
    "<div class=\"bk-expression-suggestions-menu\">\n" +
    "    <div class=\"header\" ng-switch=\"getHeaderType()\">\n" +
    "        <div ng-switch-when=\"ErrorQueryCompletion\" class=\"bk-overflow-ellipsis\">\n" +
    "            <div class=\"header-text\">\n" +
    "                <span class=\"header-text-error\" blink-tooltip=\"{{ expressionEditorModel.sageCompletionError.errorMessage || '' }}\"><u>{{strings.I_didnt}}</u></span>\n" +
    "                <span> {{strings.Did_you}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"WarnQueryCompletion\" class=\"bk-overflow-ellipsis\">\n" +
    "            <div class=\"header-text\">{{strings.Multiple_matches}}</div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"EditJoinPath\" class=\"bk-overflow-ellipsis header-edit-join-path\">\n" +
    "            <a ng-click=\"requestJoinPathEdit()\"><span>{{strings.See_other}}</span>{{ getCurrentTokenWithSuggestions().getTokenTextLowerCase() }}<span>{{strings.types}}</span></a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"items\" scroll-into-view=\"{{ 'ul li:nth-child({1})'.assign(getActiveCompletionIndex() + 1) }}\">\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"(index, suggestion) in getSuggestionsForCurrentCursor()\" ng-class=\"{active: isActiveCompletionIndex(index)}\" ng-click=\"onCompletionClick($event, index)\" ng-mouseover=\"onCompletionMouseOver($event, index)\" ng-mousedown=\"onCompletionMouseDown($event)\">\n" +
    "                <div class=\"suggestion\" data-tooltip-html=\"true\" data-placement=\"right\" data-html=\"true\" blink-tooltip-model=\"{'suggestion': suggestion}\" blink-tooltip-template-url=\"'src/modules/expression-editor/expression-suggestion-item-tooltip.html'\" blink-tooltip>\n" +
    "                    <span ng-include=\"'src/modules/expression-editor/expression-suggestion-item.html'\"></span>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/filter-panel/filter-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/filter-panel/filter-dialog.html",
    "<blink-filter-v2 ctrl=\"$ctrl.data.customData.filterController\">\n" +
    "</blink-filter-v2>");
}]);

angular.module("src/modules/filter-panel/filter-panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/filter-panel/filter-panel.html",
    "<div class=\"bk-filter-panel\" ng-class=\"{'bk-read-only': isReadOnly}\">\n" +
    "    <ul class=\"bk-filter-list-items\">\n" +
    "        <li class=\"bk-filter-list-item\" ng-repeat=\"filter in filterList\" ng-show=\"filter.shouldDisplay()\" ng-click=\"onFilterItemClick(filter)\" ng-class=\"{'selected': isFilterOpened(filter),\n" +
    "                   'active': isFilterActive(filter)}\">\n" +
    "            <div class=\"bk-filter-container\">\n" +
    "                <div class=\"filter-title-text\" blink-tooltip=\"{{ getFilterDisplayName(filter) }}\" auto-tooltip-style=\"bootstrap\">\n" +
    "                    {{ getFilterDisplayName(filter) }}\n" +
    "                </div>\n" +
    "                <div class=\"filter-value-text\" blink-tooltip=\"{{ getFilterValueText(filter) }}\" auto-tooltil-style=\"bootstrap\">\n" +
    "                    {{ getFilterValueText(filter) }}\n" +
    "                </div>\n" +
    "                <div class=\"bk-filter-dropdown-icon\">\n" +
    "                    <div class=\"bk-style-icon-triangle-solid\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <span ng-show=\"!isReadOnly\" class=\"close-icon bk-style-icon-circled-x\" ng-click=\"onDeleteFilterClick($event, filter)\">\n" +
    "                <span class=\"bk-background\"></span>\n" +
    "                <span class=\"bk-cross\"></span>\n" +
    "            </span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/modules/formula-editor/formula-assistant/formula-assistant-help-section.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/formula-editor/formula-assistant/formula-assistant-help-section.html",
    "<div ng-switch=\"!!selectedItem\">\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-no-example-item-selected-view\">\n" +
    "        <div class=\"bk-no-examples-selected-message\">{{strings.Select_an_entity}}</div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-formula-examples\">\n" +
    "        <div class=\"bk-title\">{{ selectedItem.value }}</div>\n" +
    "        <div class=\"bk-help-text\">\n" +
    "            <span ng-bind-html=\"exampleData.helpText\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"bk-examples\">\n" +
    "            <ul>\n" +
    "                <li ng-show=\"!!exampleData.fixedExample\">\n" +
    "                        <span ng-repeat=\"token in exampleData.fixedExample\" ng-class=\"{'attribute': (token.type == 'attribute'),\n" +
    "                                         'measure': (token.type == 'measure'),\n" +
    "                                         'operator': (token.type == 'operator'),\n" +
    "                                         'function-name': (token.type == 'function-name')}\">\n" +
    "                            <span>{{ token.value }}</span>\n" +
    "                            <span ng-switch=\"!!token.spaceAfter\">\n" +
    "                                <span ng-switch-when=\"true\">&nbsp;</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                </li>\n" +
    "                <li ng-show=\"!!exampleData.queryExample\">\n" +
    "                        <span ng-repeat=\"token in exampleData.queryExample\" ng-class=\"{'attribute': (token.type == 'attribute'),\n" +
    "                                         'measure': (token.type == 'measure'),\n" +
    "                                         'operator': (token.type == 'operator'),\n" +
    "                                         'function-name': (token.type == 'function-name')}\">\n" +
    "                            <span>{{ token.value }}</span>\n" +
    "                            <span ng-switch=\"!!token.spaceAfter\">\n" +
    "                                <span ng-switch-when=\"true\">&nbsp;</span>\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/formula-editor/formula-assistant/formula-assistant.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/formula-editor/formula-assistant/formula-assistant.html",
    "<div class=\"bk-formula-assistant\">\n" +
    "    <div class=\"bk-formula-assistant-header\">\n" +
    "        <span class=\"bk-formula-assistant-header-title\">{{title}}</span>\n" +
    "        <span class=\"bk-formula-assistant-close-button\" ng-click=\"close()\">&times;</span>\n" +
    "    </div>\n" +
    "    <div class=\"bk-formula-assistant-body\">\n" +
    "        <div class=\"bk-formula-assistant-examples-tree\">\n" +
    "            <div ui-tree data-drag-enabled=\"false\">\n" +
    "                <ol ui-tree-nodes=\"\" ng-model=\"data.children\" data-nodrag>\n" +
    "                    <li ui-tree-node ng-repeat=\"exampleSection in data.children\" data-collapsed=\"true\">\n" +
    "                        <div ui-tree-handle ng-click=\"$event.stopPropagation(); toggle()\">\n" +
    "                            <span class=\"bk-expand-btn-light-bg bk-clickable\" ng-class=\"{'bk-arrow-collapsed': !!collapsed, 'bk-arrow-expanded': !collapsed}\"></span>\n" +
    "                            <span>{{ getValue(exampleSection) }}</span>\n" +
    "                        </div>\n" +
    "                        <ol ui-tree-nodes=\"\" ng-model=\"exampleSection.children\" ng-class=\"{hidden: collapsed}\">\n" +
    "                            <li ui-tree-node class=\"bk-leaf-node\" ng-repeat=\"exampleItem in exampleSection.children\" ng-click=\"onLeafSelected(exampleItem)\" ng-class=\"{selected: isSelectedItem(exampleItem)}\">\n" +
    "                                <div ui-tree-handle>{{ getValue(exampleItem) }}</div>\n" +
    "                            </li>\n" +
    "                        </ol>\n" +
    "                    </li>\n" +
    "                </ol>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-formula-assistant-help-section\" ng-include=\"'src/modules/formula-editor/formula-assistant/formula-assistant-help-section.html'\"></div>\n" +
    "</div>");
}]);

angular.module("src/modules/formula-editor/formula-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/formula-editor/formula-editor.html",
    "<div class=\"bk-formula-editor\">\n" +
    "    <div class=\"bk-editor-body\">\n" +
    "        <div blink-content-editable fullspan disallow-empty ng-model=\"formulaEditorModel.formulaName\" on-change=\"updateFormulaName()\" placeholder=\"'Enter formula name'\" class=\"bk-formula-name\"></div>\n" +
    "\n" +
    "        <div class=\"bk-formula-assistant-link\" ng-click=\"openFormulaAssistant()\">\n" +
    "            <span class=\"bk-style-icon-formulae-assistant bk-icon\"></span>\n" +
    "            <span>{{strings.Formula_Assistant}}</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-basic-settings-panel\">\n" +
    "            <expression-editor expression-editor-model=\"::formulaEditorModel.expressionEditorModel\" on-valid-expression=\"syncModelWithCallosum(expressionEditorModel)\" on-invalid-expression=\"setCurrentFormulaInvalid()\">\n" +
    "            </expression-editor>\n" +
    "            <div ng-switch=\"isFormulaAssistantOpen\">\n" +
    "                <formula-assistant title=\"strings.formulaEditor.FORMULA_ASSISTANT\" data=\"examplesTreeData\" on-close=\"closeFormulaAssistant()\" blink-draggable blink-draggable-handle=\".bk-formula-assistant-header\" class=\"bk-formula-assistant-container\" ng-switch-when=\"true\"></formula-assistant>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-advanced-settings-panel\">\n" +
    "            <div class=\"bk-advanced-settings-header\" ng-click=\"advancedSettingsPanelShowing = !advancedSettingsPanelShowing\">\n" +
    "                <div class=\"bk-header-content\">\n" +
    "                    <span class=\"bk-style-icon-settings bk-icon\"></span>\n" +
    "                    <span class=\"bk-header-text\">{{strings.Advanced_settings}}</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-advanced-settings-content\" ng-show=\"advancedSettingsPanelShowing\">\n" +
    "                <div>\n" +
    "                    <div class=\"bk-advanced-settings-option bk-data-type-selector\">\n" +
    "                        <div class=\"bk-option-name\">{{strings.Data_type}}</div>\n" +
    "                        <div class=\"bk-select-box\">\n" +
    "                            <select ng-model=\"types.dataType\" ng-options=\"typeLabel for (typeLabel, typeValue) in typeOptions.dataType\" ng-change=\"onTypeOptionChange()\" chosen disabled=\"disabled\" disable-search=\"true\" data-width=\"178\">\n" +
    "                            </select>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-advanced-settings-option bk-measure-attribute-selector\">\n" +
    "                        <div class=\"bk-option-name\">\n" +
    "                            <span>{{strings.Measure_or}}</span>\n" +
    "                            <span class=\"bk-description-question-mark\" data-html=\"true\" blink-tooltip=\"<div class='bk-left-aligned'><b>{{strings.attribute}}</b> {{strings.a_property}}\n" +
    "<br><b>{{strings.measure}}</b> {{strings.a_numeric}}\n" +
    "</div>\">?</span>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-select-box\">\n" +
    "                            <select ng-model=\"types.type\" ng-options=\"typeOption for typeOption in typeOptions.type\" ng-change=\"onTypeOptionChange()\" chosen disable-search=\"true\" blink-disabled-options=\"disabledTypeOptions.type\" data-width=\"178\">\n" +
    "                            </select>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-advanced-settings-option bk-default-aggregation-selector\">\n" +
    "                        <div class=\"bk-option-name\">{{strings.Aggregation}}</div>\n" +
    "                        <div class=\"bk-select-box\">\n" +
    "                            <select ng-model=\"types.aggrType\" ng-options=\"typeLabel for (typeLabel, typeValue) in typeOptions.aggrType\" ng-change=\"onTypeOptionChange()\" blink-attr=\"disabled: !isAggregationEditingAllowed()\" chosen disable-search=\"true\" blink-disabled-options=\"disabledTypeOptions.aggrType\" data-width=\"178\">\n" +
    "                            </select>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-editor-footer\">\n" +
    "        <div class=\"busy-indicator\" ng-show=\"addingFormulaToDocument && !lastSaveError\">\n" +
    "            <div blink-loading-indicator></div>\n" +
    "        </div>\n" +
    "        <div class=\"error-message\" ng-show=\"!!lastSaveError\" ng-bind-html=\"lastSaveError\"></div>\n" +
    "\n" +
    "        <bk-secondary-button text=\"{{ strings.CANCEL }}\" ng-click=\"cancelFormulaEditing(); cancel()\" class=\"bk-formula-edit-cancel\"></bk-secondary-button>\n" +
    "        <bk-primary-button text=\"{{ initFormulaColumn && strings.UPDATE || strings.SAVE }}\" is-disabled=\"!isCurrentFormulaValid\" ng-click=\"addFormulaToDocument()\" class=\"bk-confirm-btn\"></bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/headline-viz/headline-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/headline-viz/headline-viz.html",
    "<blink-viz-headline class=\"bk-headline-viz\" viz=\"$ctrl.headlineViz\" on-render-complete=\"$ctrl.onRenderCompleteCallback\">\n" +
    "</blink-viz-headline>");
}]);

angular.module("src/modules/help-widget/help-no-connection.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/help-widget/help-no-connection.html",
    "<div class=\"help-no-connection\">\n" +
    "    <div class=\"help-no-connection-content\">\n" +
    "        <div class=\"info-module clearfix\" ng-if=\"showInfoMessage\">\n" +
    "            <div class=\"fl info-icon\">\n" +
    "                <div class=\"bk-style-icon-circled-information\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"fl info-msg\">\n" +
    "                {{ noConnectionMessages.INFO_MESSAGE }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"keywords\">\n" +
    "            <div class=\"title\">{{ noConnectionMessages.KEYWORD_TITLE }}</div>\n" +
    "            <div class=\"description\">\n" +
    "                {{ noConnectionMessages.KEYWORD_DESCRIPTION }}:\n" +
    "            </div>\n" +
    "\n" +
    "            <div ng-repeat=\"menu in menus\">\n" +
    "                <ul>\n" +
    "                    <li ng-repeat=\"menuItem in menu.items\">\n" +
    "                        <div class=\"keyword-title\" ng-click=\"onMenuItemClick(menuItem)\" ng-class=\"{ 'bk-selected': menuItem.selected }\">\n" +
    "                            <span ng-class=\"menuItem.selected ? 'bk-style-icon-arrow-down' : 'bk-style-icon-arrow-right'\"></span>\n" +
    "                            <span class=\"pas\">{{ menuItem.label }}</span>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-keyword-set-list\" ng-repeat=\"keywords in keywordHelpDefinition[menuItem.actionType]\" ng-if=\"menuItem.selected\">\n" +
    "                            <div class=\"bk-keyword-set-name\">{{ keywords.keywordTitle }}</div>\n" +
    "                            <div ng-class=\"{'bk-keyword-set-item': keywords.cssBottomBorder}\">\n" +
    "                                <div ng-repeat=\"example in keywords.example\" class=\"keywords-list clearfix\">\n" +
    "                                    <ul class=\"fl keyword\">\n" +
    "                                        <li ng-class=\"{'bk-margin-left-20': keywords.keywordTitle}\">\n" +
    "                                            {{ example.keyword }}\n" +
    "                                        </li>\n" +
    "                                    </ul>\n" +
    "                                    <ul class=\"fl example\">\n" +
    "                                        <li ng-bind-html=\"example | blinkRangeHighlight:'text-bold'\">\n" +
    "                                        </li>\n" +
    "                                    </ul>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/help-widget/help-widget.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/help-widget/help-widget.html",
    "<div class=\"bk-draggable-help-portal\" blink-draggable blink-draggable-handle=\".bk-draggable-bar\">\n" +
    "    <div class=\"bk-help-portal\" ng-class=\"{'help-portal-minimized': isMinimized}\">\n" +
    "        <div class=\"bk-help-hd\">\n" +
    "            <div class=\"bk-help-title\">{{strings.Help}}</div>\n" +
    "            <div class=\"bk-draggable-bar\">\n" +
    "                <div class=\"bk-draggable-handle\">\n" +
    "                    <div class=\"clearfix\">\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                    </div>\n" +
    "                    <div class=\"clearfix\">\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                        <div class=\"circle fl\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-help-controls\">\n" +
    "                <span class=\"bk-style-icon-min-max\" ng-click=\"minMaxHelp()\"></span>\n" +
    "                <span class=\"bk-style-icon-close\" ng-click=\"closeHelp()\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"help-bd\" ng-show=\"!isMinimized\">\n" +
    "            <div ng-if=\"showLoadingIndicator()\">\n" +
    "                <div class=\"bk-in-progress\">\n" +
    "                    <div class=\"bk-dot dot1\"></div>\n" +
    "                    <div class=\"bk-dot dot2\"></div>\n" +
    "                    <div class=\"bk-dot dot3\"></div>\n" +
    "                    <div class=\"bk-dot dot4\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-show=\"isMindtouchReady()\" class=\"help-default\">\n" +
    "                <div class=\"bk-help-link\">\n" +
    "                    <span class=\"bk-style-icon-tour\"></span>\n" +
    "                    <div class=\"bk-mindtouch-link\">\n" +
    "                        <a href=\"{{ mindTouchUrlHome }}\" target=\"_blank\" ng-click=\"closeHelp()\">\n" +
    "                            {{mindTouchLinks.home.TITLE}}\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-help-link\">\n" +
    "                    <span class=\"bk-style-icon-key\"></span>\n" +
    "                    <div class=\"bk-mindtouch-link\">\n" +
    "                        <a href=\"{{ mindTouchUrlKeywords }}\" target=\"_blank\" ng-click=\"closeHelp()\">\n" +
    "                            {{mindTouchLinksStrings.keywords.TITLE}}\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-help-link\">\n" +
    "                    <span class=\"bk-style-icon-clipboard-text\"></span>\n" +
    "                    <div class=\"bk-mindtouch-link\">\n" +
    "                        <a href=\"{{ mindTouchUrlReleaseNotes }}\" target=\"_blank\" ng-click=\"closeHelp()\">\n" +
    "                            {{mindTouchLinksStrings.releaseNotes.TITLE}}\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-help-link\">\n" +
    "                    <span class=\"bk-style-icon-open-book\"></span>\n" +
    "                    <div class=\"bk-mindtouch-link\">\n" +
    "                        <a href=\"{{ mindTouchUrlAdminGuide }}\" target=\"_blank\" ng-click=\"closeHelp()\">\n" +
    "                            {{mindTouchLinksStrings.adminGuide.TITLE}}\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-help-link\">\n" +
    "                    <span class=\"bk-style-icon-download-bold\"></span>\n" +
    "                    <div class=\"bk-mindtouch-link\">\n" +
    "                        <a href=\"{{ mindTouchUrlDownloads }}\" target=\"_blank\" ng-click=\"closeHelp()\">\n" +
    "                            {{mindTouchLinksStrings.downloads.TITLE}}\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"showKeywordsFallback()\" ng-controller=\"HelpWidgetController\" ng-include=\"'src/modules/help-widget/help-no-connection.html'\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-help-footer\" ng-show=\"!isMinimized\">\n" +
    "            <div>\n" +
    "                {{strings.Still_need}}\n" +
    "                <contact-support></contact-support>\n" +
    "            </div>\n" +
    "            <div>\n" +
    "                <span>{{strings.Version}}</span>{{ getReleaseNameDisplayString() }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/help/help-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/help/help-page.html",
    "<div blink-help></div>");
}]);

angular.module("src/modules/help/help.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/help/help.html",
    "<div class=\"bk-help bk-sidebar-layout\">\n" +
    "    \n" +
    "    <div class=\"bk-left-menu\">\n" +
    "        <h3 class=\"mvl mll plm font-family-light\">{{strings.Help}}</h3>\n" +
    "        <div class=\"mtl\" ng-repeat=\"menu in menus\">\n" +
    "            <span class=\"font-smaller font-family-bold font-uppercase font-primary-darker mll plm\">{{ menu.header }}</span>\n" +
    "            <ul class=\"bk-filters bk-red\">\n" +
    "                <li ng-repeat=\"menuItem in menu.items\" ng-click=\"onMenuItemClick(menuItem)\" ng-class=\"{ 'bk-selected': menuItem.selected }\">\n" +
    "                    {{ menuItem.label }}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"bk-list-container\" ng-switch=\"currentMenuItem.actionType\">\n" +
    "        <div class=\"bk-title-bar\">\n" +
    "            <div class=\"bk-list-title\">{{ currentMenuItem.label }}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-help-container\" ng-switch-default>\n" +
    "            \n" +
    "            <div class=\"line mbl\">\n" +
    "                <ul class=\"unit size1of5\">\n" +
    "                    <li class=\"font-small font-family-bold font-uppercase font-primary-darker\">\n" +
    "{{strings.Keyword}}\n" +
    "</li>\n" +
    "                </ul>\n" +
    "                <ul class=\"unit size2of5 lastUnit\">\n" +
    "                    <li class=\"font-small font-family-bold font-uppercase font-primary-darker\">\n" +
    "{{strings.Example}}\n" +
    "</li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "            \n" +
    "            <div ng-repeat=\"keywords in keywordHelpDefinition[currentMenuItem.actionType]\">\n" +
    "                <div class=\"text-bold mbm\">{{ keywords.keywordTitle }}</div>\n" +
    "                <div ng-class=\"{'br-bottom-gray mbl pbl': keywords.cssBottomBorder}\">\n" +
    "                    <div ng-repeat=\"example in keywords.example\">\n" +
    "                        <div class=\"line keywordsList\">\n" +
    "                            <ul class=\"unit size1of5\">\n" +
    "                                <li class=\"text-bold mvx\" ng-class=\"{'mll': keywords.keywordTitle}\">\n" +
    "                                    {{ example.keyword }}\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                            <ul class=\"unit size2of5 lastUnit\">\n" +
    "                                <li class=\"mvx\" ng-bind-html=\"example | blinkRangeHighlight:'text-bold'\">\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        \n" +
    "        <div ng-switch-when=\"system-info\" class=\"bk-help-container\">\n" +
    "            <h4 class=\"text-bold mbl font-capitalize\">\n" +
    "<span>{{strings.Version}}</span>{{ getReleaseNameDisplayString() }}\n" +
    "            </h4>\n" +
    "            <div ng-show=\"releaseNameComputationStatus == 'complete'\">\n" +
    "                <a href=\"/version/release-notes/ThoughtSpot_{{ versionNameForLink }}_Release_Notes.pdf\">\n" +
    "                    <div class=\"bk-btn\"><span>{{strings.Release_Notes}}</span>{{ versionNameForLink }}</div>\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <h4 class=\"text-bold mvl\">\n" +
    "{{strings.Support}}\n" +
    "</h4>\n" +
    "            <div class=\"media\">\n" +
    "                <div class=\"img\">\n" +
    "{{strings.Phone}}\n" +
    "</div>\n" +
    "                <div class=\"bd pll\">\n" +
    "{{strings.key_1_8005087008}}\n" +
    "</div>\n" +
    "            </div>\n" +
    "            <div class=\"media\">\n" +
    "                <div class=\"img\">\n" +
    "{{strings.Email}}\n" +
    "</div>\n" +
    "                <div class=\"bd pll\">\n" +
    "                    <a href=\"mailto:support@thoughtspot.com\">\n" +
    "{{strings.supportthoughtspotcom}}\n" +
    "</a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/home/home-activity/home-activity.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/home/home-activity/home-activity.html",
    "<div class=\"bk-home-activity-container\">\n" +
    "    <bk-icon-button icon=\"bk-style-icon-activity-feed\" class=\"bk-slider-btn\" ng-click=\"toggleShow()\" blink-tooltip=\"{{ activityFeedStrings.VIEW_ACTIVITY }}\" is-selected=\"isShowingActivity()\"></bk-icon-button>\n" +
    "\n" +
    "    <div class=\"bk-home-activity\" ng-class=\"{'slide-in': isShowingActivity(), 'slide-out': !isShowingActivity()};\">\n" +
    "        <div ng-switch=\"isInitializing()\" class=\"bk-sidebar-container\">\n" +
    "            <div class=\"bk-sidebar-header\">\n" +
    "                <div class=\"bk-close-sidebar-panel\" ng-click=\"toggleShow()\"></div>\n" +
    "                <div class=\"bk-sidebar-title\">\n" +
    "                    {{ activityFeedStrings.RECENT_ACTIVITY }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"true\" class=\"bk-home-activity-loading-indicator\" blink-loading-indicator>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"false\" ng-switch=\"showEmptyState\" class=\"bk-sidebar-body\">\n" +
    "                <div ng-switch-when=\"true\" class=\"bk-empty-state\">{{ activityFeedStrings.NO_ITEMS_TO_DISPLAY }}</div>\n" +
    "                <div ng-switch-when=\"false\" class=\"bk-activity-feed bk-vertical-flex-container-sized\">\n" +
    "                    <div ng-repeat=\"item in items\" class=\"bk-activity-feed-item\">\n" +
    "                        <a ng-href=\"{{ item.href }}\">\n" +
    "                            <blink-profile-pic user-id=\"item.author\" user-display-name=\"item.authorDisplayName\"></blink-profile-pic>\n" +
    "                        <span class=\"bk-bubble bk-{{ item.type }}-item\">\n" +
    "                            <span class=\"bk-user-name\">{{ item.authorDisplayName }}</span>\n" +
    "                            <span class=\"bk-message\">{{ item.message }}</span>\n" +
    "                            <span class=\"bk-item-name bk-overflow-ellipsis\">{{ item.name }}</span>\n" +
    "                            <span class=\"bk-time-ago\">\n" +
    "                            <span class=\"bk-clock-icon\"></span>\n" +
    "                                <span class=\"bk-time-label\">{{ item.timeAgo }}</span>\n" +
    "                            </span>\n" +
    "                            <span class=\"bk-bubble-arrow-shadow\"></span>\n" +
    "                            <span class=\"bk-bubble-arrow\"></span>\n" +
    "                        </span>\n" +
    "                        </a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/home/home-dashboard/home-dashboard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/home/home-dashboard/home-dashboard.html",
    "<div class=\"bk-home-dashboard\" ng-switch=\"homeDashboardState === 'NO_PINBOARDS'\">\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-no-content\">\n" +
    "        <div class=\"bk-no-content-icon\"></div>\n" +
    "        <div class=\"bk-no-content-label\">\n" +
    "            {{strings.No_Pinboards}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-no-content-message\">{{strings.Create_a_pinboard}}</div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-vertical-flex-container-sized\">\n" +
    "        <div class=\"bk-homepage-pinboard-title-bar\">\n" +
    "            <div class=\"bk-homepage-pinboard-title\">{{ strings.PINBOARD }}:</div>\n" +
    "            <bk-pinboard-selector class=\"bk-pinboard-picker-drop-down\" bk-ctrl=\"pinboardSelectorComponent\">\n" +
    "            </bk-pinboard-selector>\n" +
    "            <div blink-home-activity></div>\n" +
    "        </div>\n" +
    "        <div ng-show=\"homeDashboardState === HomeDashboardStates.EMPTY_PINBOARD\" class=\"bk-no-content\">\n" +
    "            <div class=\"bk-no-content-icon\"></div>\n" +
    "            <div class=\"bk-no-content-label\">\n" +
    "                {{strings.Empty_Pinboard}}\n" +
    "            </div>\n" +
    "            <div class=\"bk-no-content-message\">{{strings.Add_charts_or}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-dashboard-answer\" ng-show=\"homeDashboardState !== HomeDashboardStates.EMPTY_PINBOARD\">\n" +
    "            <pinboard-page class=\"bk-vertical-flex-container-sized\" hide-panel=\"true\" dont-watch-url=\"true\" pinboard-page-config=\"pinboardPageConfig\" on-model-update-success=\"onPinboardModelUpdateSuccess(newModel, oldModel)\" on-model-update-failure=\"onPinboardModelUpdateFailure(error)\" id=\"getSelectedPinboardId()\">\n" +
    "            </pinboard-page>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/home/home-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/home/home-page.html",
    "<div class=\"bk-home\" ng-class=\"{'bk-home-fade-out': sageBarClicked}\">\n" +
    "    <div class=\"bk-home-content\">\n" +
    "        <div blink-home-sage></div>\n" +
    "        <blink-home-dashboard></blink-home-dashboard>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/home/home-sage/home-sage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/home/home-sage/home-sage.html",
    "<div class=\"bk-home-sage\">\n" +
    "    <div class=\"bk-home-sage-bar\" ng-click=\"onSageBarClick()\">\n" +
    "        <div class=\"bk-style-icon-search\"></div>\n" +
    "        <div class=\"bk-sage-placeholder\">{{ sagePlaceHolderText }}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/jobs-scheduling/job-metadata-component/job-metadata.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/jobs-scheduling/job-metadata-component/job-metadata.html",
    "<div class=\"bk-job-metadata\">\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">\n" +
    "            <blink-required-field>{{$ctrl.reportStrings.name}}</blink-required-field>\n" +
    "        </div>\n" +
    "        <input type=\"text\" class=\"bk-job-name\" ng-model=\"$ctrl.job.backingProto.name\" ng-required=\"true\" spellcheck=\"false\" blink-auto-focus>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">\n" +
    "            {{$ctrl.reportStrings.description}}\n" +
    "        </div>\n" +
    "                    <textarea ng-readonly=\"\" class=\"bk-job-description\" ng-model=\"$ctrl.job.backingProto.description\" spellcheck=\"false\">\n" +
    "                    </textarea>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{$ctrl.reportStrings.type}}</div>\n" +
    "        <div class=\"bk-format-item\">\n" +
    "            <bk-radio-button class=\"bk-format-radio\" bk-ctrl=\"$ctrl.csvRadioController\">\n" +
    "            </bk-radio-button>\n" +
    "           \n" +
    "            <bk-radio-button class=\"bk-format-radio\" bk-ctrl=\"$ctrl.pdfRadioController\">\n" +
    "            </bk-radio-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"$ctrl.isCsvJob()\" class=\"bk-warning\">\n" +
    "        {{$ctrl.reportStrings.csvWarning}}\n" +
    "    </div>\n" +
    "    <div ng-if=\"$ctrl.hasNoTable\" class=\"bk-warning\">\n" +
    "        {{$ctrl.reportStrings.noTableWarning}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/jobs-scheduling/job-status-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/jobs-scheduling/job-status-viewer.html",
    "<div class=\"bk-status-viewer\" ng-class=\" {'bk-loading' : $ctrl.isLoading}\">\n" +
    "    <div class=\"status-viewer-header\">\n" +
    "        <div class=\"bk-icons-button\">\n" +
    "            <div class=\"bk-icons\" ng-click=\"$ctrl.onHide()\">\n" +
    "                <div class=\"bk-style-icon-arrow-right\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-job-title\">\n" +
    "            {{$ctrl.getTitle()}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch on=\"$ctrl.isLoading\" class=\"bk-status-viewer-list\">\n" +
    "        <div ng-switch-when=\"false\" class=\"bk-list-container\">\n" +
    "            <actionable-list on-row-click=\"$ctrl.onRowClick\" list-model=\"$ctrl.listModel\" action-items=\"$ctrl.actionItems\">\n" +
    "            </actionable-list>\n" +
    "            <div class=\"bk-status-details\">\n" +
    "                {{$ctrl.titleString}}\n" +
    "                <div ng-if=\"$ctrl.exitDetail\" class=\"bk-job-status-detail\">\n" +
    "                    <div ng-repeat=\"detail in $ctrl.exitDetail track by $index\">\n" +
    "                        {{detail}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <hr>\n" +
    "                <div ng-repeat=\"step in $ctrl.steps\">\n" +
    "                    {{step.description}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"true\"></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"status-format.html\">\n" +
    "    <div class=\"bk-status-content\">\n" +
    "        <div class=\"bk-status-{{column.format(row)[0]}}\">\n" +
    "            <span class=\"status-text\">{{column.format(row)[1]}}</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/jobs-scheduling/schedule-report-content.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/jobs-scheduling/schedule-report-content.html",
    "<div class=\"bk-job-schedule-page\">\n" +
    "    <div class=\"bk-job-schedule-error\" ng-if=\"$ctrl.hasError\">\n" +
    "        {{$ctrl.errorMessage}}\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-job-schedule\" ng-if=\"$ctrl.canDisplayEditor()\">\n" +
    "        <div class=\"bk-header\">\n" +
    "            <div class=\"bk-page-title\">\n" +
    "                {{$ctrl.getTitle()}}\n" +
    "                <a ng-href=\"{{$ctrl.getLinkToPinboard()}}\"> {{$ctrl.getLinkTitle()}} </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-job-schedule-body\">\n" +
    "            <div class=\"bk-schedule-section\">\n" +
    "                <span class=\"bk-section-title\">{{$ctrl.strings.schedule}}</span>\n" +
    "                <div class=\"bk-schedule bk-dialog\">\n" +
    "                    \n" +
    "                    <bk-scheduler schedule-config=\"$ctrl.scheduleConfig\"></bk-scheduler>\n" +
    "                    <div class=\"bk-dialog-field\" ng-if=\"false\"> \n" +
    "                        <div class=\"label\">{{$ctrl.strings.nextOccurence}}</div>\n" +
    "                        <div class=\"bk-occurences\">{{$ctrl.getNextOccurenceOfSchedule()}}</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-dialog-field\">\n" +
    "                        <div class=\"label\">{{$ctrl.strings.serverTimeZone}} </div>\n" +
    "                        <div class=\"bk-occurences\">{{$ctrl.timeZoneString}}</div>\n" +
    "                    </div>\n" +
    "                    \n" +
    "                    <bk-job-metadata bk-ctrl=\"$ctrl.jobMetadataComponent\"></bk-job-metadata>\n" +
    "                    <div ng-if=\"$ctrl.pinboardHasNoTable\">\n" +
    "                       {{$ctrl.noTableString}}\n" +
    "                    </div>\n" +
    "                    <hr>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-recipient-section\">\n" +
    "                <span class=\"bk-section-title\">{{$ctrl.strings.recipients}}</span>\n" +
    "                <bk-principals-selector class=\"bk-principals-selector-container\" bk-ctrl=\"$ctrl.principalsSelectorComponent\">\n" +
    "                </bk-principals-selector>\n" +
    "            </div>\n" +
    "            \n" +
    "            <hr>\n" +
    "        </div>\n" +
    "        <div class=\"bk-schedule-footer\">\n" +
    "            <div class=\"bk-req-field-statement\">\n" +
    "                {{$ctrl.requiredString}}\n" +
    "            </div>\n" +
    "            <bk-primary-button text=\"{{$ctrl.saveButtonString}}\" ng-click=\"$ctrl.scheduleJob()\" is-disabled=\"!$ctrl.isScheduleEnabled()\" class=\"bk-btn-schedule\"></bk-primary-button>\n" +
    "            <bk-secondary-button text=\"{{$ctrl.strings.cancel}}\" ng-click=\"$ctrl.cancel()\" class=\"bk-btn-back\"></bk-secondary-button>\n" +
    "            <div style=\"clear:both\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/jobs-scheduling/scheduled-jobs-list/scheduled-jobs-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/jobs-scheduling/scheduled-jobs-list/scheduled-jobs-list.html",
    "<metadata-list-page bk-ctrl=\"ctrl\"></metadata-list-page>");
}]);

angular.module("src/modules/labels/label-removal-alert-message.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/labels/label-removal-alert-message.html",
    "{{strings.Existing_pinboards_answers}}\n" +
    "<p></p>\n" +
    "{{strings.Are_you_sure3}}");
}]);

angular.module("src/modules/labels/labels.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/labels/labels.html",
    "<div class=\"bk-label-panel\">\n" +
    "     <div ng-hide=\"labelsPanel.isLoading\" class=\"bk-label-wrapper\">\n" +
    "\n" +
    "         <div class=\"bk-label bk-clickable\" ng-repeat=\"label in labelsPanel.getLabels() | filter: {deleted: false}\" ng-class=\"{'bk-active': labelsPanel.isCurrentlyActive(label)}\" ng-click=\"labelsPanel.onLabelClick(label)\">\n" +
    "             <div class=\"label-icon\" ng-click=\"labelsPanel.isEditingAllowed(label)\">\n" +
    "                 <color-picker class=\"bk-label-color\" fill=\"labelsPanel.isCurrentlyActive(label)\" ng-model=\"label.color\" is-triggered-externally=\"true\" not-editable=\"!labelsPanel.isEditingAllowed(label)\" on-change=\"labelsPanel.saveLabel(label)\"></color-picker>\n" +
    "             </div>\n" +
    "             <div class=\"bk-label-name\">\n" +
    "                 <div blink-content-editable ng-model=\"label.name\" external=\"true\" validate-input=\"labelsPanel.validateLabelName(label.name, true)\" on-change=\"labelsPanel.saveLabel(label)\"></div>\n" +
    "             </div>\n" +
    "             <div class=\"dropdown\" ng-show=\"labelsPanel.isEditingAllowed(label)\" ng-click=\"labelsPanel.onEditBtnClick($event)\">\n" +
    "                 <div class=\"bk-style-icon-edit-small\" role=\"button\" data-toggle=\"dropdown\"></div>\n" +
    "                 <ul class=\"dropdown-menu\" role=\"menu\" ng-click=\"$event.stopPropagation()\">\n" +
    "                     <li role=\"presentation\" ng-repeat=\"item in labelsPanel.editMenuItems\">\n" +
    "                         <a ng-click=\"labelsPanel.onMenuItemClick($event, item, label)\">{{ item.text }}</a>\n" +
    "                     </li>\n" +
    "                 </ul>\n" +
    "             </div>\n" +
    "         </div>\n" +
    "\n" +
    "     </div>\n" +
    "     <div ng-show=\"labelsPanel.isLoading\" class=\"bk-indicator bk-loading\">\n" +
    "     </div>\n" +
    "     <div ng-show=\"labelsPanel.isLabelCreationAllowed()\">\n" +
    "         <add-new-item on-add=\"labelsPanel.createNewLabel(itemName)\" validate-input=\"labelsPanel.validateLabelName(itemName, false)\">\n" +
    "             <div class=\"add-label-button\">\n" +
    "                 <div class=\"bk-icon bk-style-icon-small-plus\"></div>\n" +
    "                 <div>{{strings.Add}}</div>\n" +
    "             </div>\n" +
    "         </add-new-item>\n" +
    "     </div>\n" +
    " </div>");
}]);

angular.module("src/modules/labels/tagged-labels.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/labels/tagged-labels.html",
    "<div class=\"bk-tagged-labels\" ng-class=\"{'bk-with-multiple-rows': hasMultipleRows}\">\n" +
    "    <div ng-repeat=\"label in labels | limitTo:allowedLabelCount\" ng-click=\"$event.stopPropagation(); makeFilterRequest(label)\" ng-style=\"{'background-color': label.getCommittedColor(), 'color': label.getTextColor() }\" ng-class=\"{'bk-deletable': isDeletable}\" class=\"bk-tagged-label bk-clickable\">\n" +
    "        <span class=\"bk-label-text bk-overflow-ellipsis\" blink-tooltip=\"{{ label.getName() }}\" auto-tooltip-style=\"bootstrap\">{{ label.getName() }}</span>\n" +
    "        <span ng-show=\"isDeletable\" class=\"bk-delete bk-clickable\" ng-click=\"$event.stopPropagation(); removeLabel(label)\">&times;</span>\n" +
    "    </div>\n" +
    "    <span ng-show=\"labels.length > allowedLabelCount\" class=\"dropdown\">\n" +
    "        <span class=\"bk-clickable bk-show-more\" data-toggle=\"dropdown\" ng-click=\"$($event.target).trigger('click.bs.dropdown')\">...</span>\n" +
    "        <div class=\"dropdown-menu\" ng-click=\"$event.stopPropagation()\">\n" +
    "            <div class=\"bk-label-rows-container\">\n" +
    "                <div ng-repeat=\"label in labels\" class=\"bk-label-row\">\n" +
    "                    <span ng-style=\"{'background-color': label.getCommittedColor()}\" class=\"bk-color-indicator\"></span>\n" +
    "                    <span class=\"bk-overflow-ellipsis\">{{ label.getName() }}</span>\n" +
    "                    <span ng-show=\"isDeletable\" ng-click=\"removeLabelFromDropdown(label)\" class=\"fr bk-clickable\">&times;</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/modules/leaf-level-data/add-columns-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/leaf-level-data/add-columns-menu.html",
    "<div class=\"bk-menu-content-container\">\n" +
    "\n" +
    "    <input class=\"bk-search-input bk-column-search\" type=\"text\" placeholder=\"{{$ctrl.strings.Search_Columns}}\" ng-change=\"$ctrl.onFilterChange()\" ng-model=\"$ctrl.colFilter.value\">\n" +
    "\n" +
    "    \n" +
    "    <div class=\"bk-menu-content\">\n" +
    "        <div ng-repeat=\"srcInfo in $ctrl.sourceIdToSourceList\" ng-show=\"!!srcInfo.filteredColumns.length\">\n" +
    "            <div class=\"name-container\" ng-click=\"$ctrl.toggleSourceExpansion(srcInfo)\">\n" +
    "                <div class=\"bk-src-arrow bk-expand-btn-light-bg\" ng-class=\"{'bk-arrow-collapsed ': !srcInfo.expanded, 'bk-arrow-expanded': srcInfo.expanded}\">\n" +
    "                </div>\n" +
    "                <div class=\"bk-source-checkbox\">\n" +
    "                    <bk-checkbox bk-ctrl=\"srcInfo.checkboxCtrl\"></bk-checkbox>\n" +
    "                </div>\n" +
    "\n" +
    "            </div>\n" +
    "            <div class=\"bk-source-columns-container\" ng-switch on=\"srcInfo.expanded\">\n" +
    "                <div ng-switch-when=\"true\">\n" +
    "                    <div class=\"bk-column-container\" ng-repeat=\"colInfo in srcInfo.filteredColumns\" ng-class=\"{'bk-disabled': colInfo.noEdit}\">\n" +
    "                        <div class=\"name-container\">\n" +
    "                            <div class=\"bk-col-arrow bk-expand-btn-light-bg\" ng-class=\"{'bk-arrow-collapsed ': !colInfo.expanded, 'bk-arrow-expanded': colInfo.expanded}\" ng-click=\"$event.stopPropagation(); $ctrl.toggleColumnExpansion(colInfo)\" ng-show=\"colInfo.joinPathList.length > 1\">\n" +
    "                            </div>\n" +
    "                            <div class=\"bk-column-checkbox\">\n" +
    "                                <bk-checkbox bk-ctrl=\"colInfo.checkboxCtrl\"></bk-checkbox>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-join-paths-container\" ng-show=\"colInfo.joinPathList.length > 1 && colInfo.expanded\">\n" +
    "                            <div ng-repeat=\"jpInfo in colInfo.joinPathList\">\n" +
    "                                <div class=\"name-container\">\n" +
    "                                    <div class=\"bk-join-path-checkbox\">\n" +
    "                                        <bk-checkbox bk-ctrl=\"jpInfo.checkboxCtrl\"></bk-checkbox>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-btn-blue bk-btn-full-width\" ng-class=\"{'bk-disabled': $ctrl.disableConfirmBtn}\" ng-click=\"$ctrl.confirmSelection()\"> {{$ctrl.strings.Confirm_Changes}}</div>\n" +
    "</div>");
}]);

angular.module("src/modules/leaf-level-data/leaf-level-data.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/leaf-level-data/leaf-level-data.html",
    "<div class=\"bk-leaf-level-data {{ customizationClass }}\">\n" +
    "    <div class=\"bk-summary-container\">\n" +
    "        <div class=\"section-heading\">{{strings.Summary}}</div>\n" +
    "        <div class=\"bk-summary-columns-container\">\n" +
    "            <div ng-repeat=\"colInfo in getSummaryInfo()\" class=\"column-info\">\n" +
    "                <div class=\"column-name bk-overflow-ellipsis\" blink-tooltip=\"{{colInfo.column.getName()}}\">\n" +
    "                    {{ colInfo.column.getName() }}: </div>\n" +
    "                <div class=\"column-value bk-overflow-ellipsis\" blink-tooltip=\"{{colInfo.formattedValue}}\" ng-bind-html=\"colInfo.formattedValue\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-mid-section-container\">\n" +
    "        <div class=\"section-heading\">{{strings.Underlying_Data}}</div>\n" +
    "        <bk-primary-button text=\"{{ strings.ADD_COLUMNS }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"onClickAddColumnsBtn()\" class=\"add-columns-btn\"></bk-primary-button>\n" +
    "        <bk-secondary-button text=\"{{ strings.DOWNLOAD }}\" icon=\"bk-style-icon-download\" ng-click=\"onClickDownloadBtn()\" class=\"download-btn\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "    <div ng-switch on=\"showColumnMenu\">\n" +
    "        <div ng-switch-when=\"true\">\n" +
    "            <bk-add-columns-menu bk-ctrl=\"addColumnsMenuComponent\">\n" +
    "            </bk-add-columns-menu>\n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-leaf-data-table-container\" ng-switch on=\"!!slickTableModelInfo.model\">\n" +
    "        <div class=\"bk-vertical-flex-container-sized\" ng-switch-when=\"true\">\n" +
    "            <blink-slick-grid-table table-model=\"slickTableModelInfo.model\" config=\"slickTableModelInfo.config\" class=\"bk-leaf-data-table\"></blink-slick-grid-table>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/login/login.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/login/login.html",
    "<div class=\"bk-login\">\n" +
    "    <div class=\"bk-logo-big bk-logo-wide-customizable\"></div>\n" +
    "    <form class=\"bk-login-form\">\n" +
    "        <ul>\n" +
    "            <li class=\"bk-login-header\">\n" +
    "                {{strings.Enter_The}}\n" +
    "            </li>\n" +
    "            <li class=\"bk-login-section\">\n" +
    "                <label class=\"bk-style-icon-login\" for=\"login-email\"></label>\n" +
    "                <input ng-model=\"$ctrl.user\" blink-auto-focus type=\"text\" id=\"login-email\" maxlength=\"100\" placeholder=\"{{ strings.LOGIN }}\" ng-trim=\"true\" ng-change=\"$ctrl.onUserNameChange()\" blink-on-enter=\"$ctrl.submitLogin()\">\n" +
    "            </li>\n" +
    "            <li class=\"bk-login-section\" ng-class=\"{ 'bk-login-failed': loginFailed}\">\n" +
    "                <label class=\"bk-style-icon-password\" for=\"login-password\"></label>\n" +
    "                <input ng-model=\"$ctrl.password\" type=\"password\" id=\"login-password\" ng-change=\"$ctrl.onPasswordChange()\" placeholder=\"{{ strings.PASSWORD }}\" blink-on-enter=\"$ctrl.submitLogin()\">\n" +
    "            </li>\n" +
    "             <li class=\"bk-login-error\" ng-show=\"$ctrl.loginFailed\">\n" +
    "                 <span ng-if=\"$ctrl.invalidCreds\">{{strings.Invalid_loginpassword}}</span>\n" +
    "                 <span ng-if=\"!$ctrl.invalidCreds\">{{strings.Could_not_reach}}</span>\n" +
    "             </li>\n" +
    "            <li class=\"bk-login-section\">\n" +
    "                <bk-primary-button text=\"{{ strings.Enter_Now }}\" is-disabled=\"$ctrl.isLoginButtonDisabled()\" ng-click=\"$ctrl.submitLogin()\" class=\"bk-login-btn\">\n" +
    "                </bk-primary-button>\n" +
    "                <div class=\"bk-login-verifying\" ng-show=\"$ctrl.isVerifying\">\n" +
    "                    <div class=\"bk-loader\">\n" +
    "                        <div class=\"bk-dot dot1\"></div>\n" +
    "                        <div class=\"bk-dot dot2\"></div>\n" +
    "                        <div class=\"bk-dot dot3\"></div>\n" +
    "                        <div class=\"bk-dot dot4\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-rememberme\">\n" +
    "                    <label for=\"login-rememberme\">{{ strings.Remember_me }}</label>\n" +
    "                    <input type=\"checkbox\" ng-model=\"$ctrl.rememberMe\" id=\"login-rememberme\">\n" +
    "                </div>\n" +
    "                \n" +
    "            </li>\n" +
    "            <li class=\"bk-login-saml-section\" ng-show=\"$ctrl.samlEnabled\">\n" +
    "                <div class=\"bk-saml-login-link\" ng-click=\"$ctrl.samlLogin()\">\n" +
    "                    {{ strings.loginConstants.LOGIN_WITH_SAML_MESSAGE }}\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-item-selector/metadata-item-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-item-selector/metadata-item-selector.html",
    "<div class=\"bk-metadata-item-selector\">\n" +
    "    <div class=\"bk-select-box\">\n" +
    "        \n" +
    "        <ui-select ng-if=\"!$ctrl.isMultiple()\" ng-model=\"$ctrl.selectedItems\" search-enabled=\"true\" allow-clear=\"false\" on-select=\"$ctrl.onItemSelected()\" reset-search-input=\"true\" theme=\"select2\" blink-select on-drop-down-toggled=\"$ctrl.onDropDownToggled(isOpen)\">\n" +
    "            <ui-select-match>\n" +
    "                <span>{{ $ctrl.getSelectedItemName() }}</span>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices ui-disable-choice=\"!item.id\" group-by=\"$ctrl.groupBy\" refresh=\"$ctrl.onInputChange($select.search)\" refresh-delay=\"$ctrl.getDebounceTime()\" repeat=\"item in $ctrl.getItemsList()\">\n" +
    "                <span>{{ $ctrl.getItemName(item) }}</span>\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "        <ui-select ng-if=\"$ctrl.isMultiple()\" class=\"bk-multiple-select\" ng-model=\"$ctrl.selectedItems\" search-enabled=\"true\" allow-clear=\"false\" on-select=\"$ctrl.onItemSelected()    \" reset-search-input=\"true\" theme=\"select2\" blink-select multiple=\"multiple\" on-drop-down-toggled=\"$ctrl.onDropDownToggled(isOpen)\">\n" +
    "            <ui-select-match>\n" +
    "                <span>{{ $ctrl.getSelectedItemName($index) }}</span>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices ui-disable-choice=\"!item.id\" group-by=\"$ctrl.getGroupByFunction()\" refresh=\"$ctrl.onInputChange($select.search)\" refresh-delay=\"$ctrl.getDebounceTime()\" repeat=\"item in $ctrl.getItemsList()\">\n" +
    "                <div>\n" +
    "                    <span ng-bind-html=\"$ctrl.getItemName(item) | highlight: $select.search\"></span>\n" +
    "                </div>\n" +
    "                <small ng-bind-html=\"$ctrl.getItemDetails(item) | highlight: $select.search\"></small>\n" +
    "            </ui-select-choices>\n" +
    "        </ui-select>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/answers/answer-disabled-alert-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/answers/answer-disabled-alert-dialog.html",
    "<div class=\"bk-answer-disabled-dialog\">\n" +
    "    {{ data.customData.messagePartA }}\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/answers/answers-list-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/answers/answers-list-page.html",
    "<div ng-controller=\"AnswersPageController\" class=\"bk-answer-list\">\n" +
    "    <div class=\"bk-metadata-list\">\n" +
    "        <metadata-list-page bk-ctrl=\"ctrl\" class=\"bk-vertical-flex-container-sized\"></metadata-list-page>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/apply-label-menu.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/apply-label-menu.html",
    "<div class=\"bk-apply-label-menu\" ng-show=\"action.showMenu\" ng-mouseover=\"$event.stopPropagation()\" ng-mouseenter=\"$event.stopPropagation()\" ng-click=\"$event.stopPropagation()\" blink-overlay=\"action.showMenu = false\">\n" +
    "    <div class=\"bk-apply-label-menu-inner\">\n" +
    "        <labels-panel readonly=\"readonly\" selectable=\"false\" ng-model=\"labelsRegistry\" on-label-click=\"action.applyLabel($label); action.showMenu = false\"></labels-panel>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/data-management/data-management-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/data-management/data-management-page.html",
    "<div ng-controller=\"DataManagementPageController\" class=\"bk-data-list\">\n" +
    "    <div class=\"bk-metadata-list\">\n" +
    "        <tab-control-component bk-ctrl=\"ctrl\" class=\"bk-vertical-flex-container-sized\">\n" +
    "            <tab-control-component-tab tab-ctrl=\"ctrl\" tab-name=\"{{strings.tables.tabHeader}}\" tab-id=\"{{constants.tables.tabId}}\" disabled=\"isTabDisabled(constants.tables.tabId)\" tooltip-text=\"{{getToolTipText(constants.tables.tabId)}}\" class=\"bk-vertical-flex-container-sized\" ng-show=\"isTabOpen(constants.tables)\">\n" +
    "                <tables-list-page class=\"bk-vertical-flex-container-sized\"></tables-list-page>\n" +
    "            </tab-control-component-tab>\n" +
    "            <tab-control-component-tab tab-ctrl=\"ctrl\" tab-name=\"{{strings.dataSources.tabHeader}}\" tab-id=\"{{constants.dataSources.tabId}}\" disabled=\"isTabDisabled(constants.dataSources.tabId)\" tooltip-text=\"{{getToolTipText(constants.dataSources.tabId)}}\" class=\"bk-vertical-flex-container-sized\" ng-show=\"isTabOpen(constants.dataSources)\">\n" +
    "                <ds-list-page class=\"bk-vertical-flex-container-sized\"></ds-list-page>\n" +
    "            </tab-control-component-tab>\n" +
    "        </tab-control-component>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/data-management/data-sources/data-sources-list-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/data-management/data-sources/data-sources-list-page.html",
    "<metadata-list-page bk-ctrl=\"ctrl\" class=\"bk-data-source-list\"></metadata-list-page>\n" +
    "<blink-status-viewer class=\"status-viewer\" ng-if=\"shouldShowStatusViewer\" item-details=\"sourceDetails\" on-hide=\"hideStatusViewer\" refresh=\"refreshStatus\">\n" +
    "</blink-status-viewer>");
}]);

angular.module("src/modules/metadata-list/data-management/tables/tables-list-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/data-management/tables/tables-list-page.html",
    "<metadata-list-page bk-ctrl=\"ctrl\" class=\"bk-table-list\"></metadata-list-page>\n" +
    "<blink-data-explorer class=\"data-explorer\" ng-if=\"shouldShowExplorer\" permissions=\"ctrl.permissions\" selected-table-id=\"selectedTableId\" hide-explorer=\"hideExplorer\" hide-table-list=\"true\" data=\"ctrl.getData()\" mode=\"mode\" on-save=\"updateSelectedTableProps(name, description)\">\n" +
    "</blink-data-explorer>");
}]);

angular.module("src/modules/metadata-list/filters/list-filters-labels.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/filters/list-filters-labels.html",
    "<div class=\"top-list-filters\">\n" +
    "    <div class=\"bk-filter-item\" ng-repeat=\"filter in filters\">\n" +
    "        <ul class=\"bk-top-menu-filters\">\n" +
    "            <li class=\"bk-category-{{ menuItem.category.toLowerCase() }}\" ng-repeat=\"menuItem in filter.values\" ng-click=\"onFilterClick(filter, $index)\" ng-class=\"{ 'bk-selected': $index == filter.currentFilterIndex }\">\n" +
    "                {{ menuItem.label }}\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "    <div class=\"stickers\" ng-if=\"!!stickers\">\n" +
    "        <div class=\"bk-style-icon-label\"></div>\n" +
    "        <div class=\"bk-title\">{{ stickers.stickersLabel.pluralize() }}</div>\n" +
    "        <div class=\"sticker-selector-container\">\n" +
    "            <div class=\"selected-label\" ng-click=\"showMenu = !showMenu\" ng-class=\"{'menu-shown': showMenu}\">\n" +
    "                <div class=\"label-icon\">\n" +
    "                    <color-picker class=\"bk-label-color\" fill=\"true\" ng-model=\"stickers.selectedSticker.color\" not-editable=\"true\"></color-picker>\n" +
    "                </div>\n" +
    "                <div class=\"bk-sticker-name\">{{ stickers.selectedSticker.name }}</div>\n" +
    "                <div class=\"bk-style-icon-arrow-down\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"bk-apply-label-menu\" ng-show=\"showMenu\" ng-mouseover=\"$event.stopPropagation()\" ng-mouseenter=\"$event.stopPropagation()\" ng-click=\"$event.stopPropagation()\" blink-overlay=\"showMenu = false\">\n" +
    "                <div class=\"bk-apply-label-menu-inner\" ng-switch=\"hasAdminPrivileges\">\n" +
    "                    <labels-panel ng-switch-when=\"false\" class=\"bk-labels-container\" readonly=\"readonly\" selected-label-id=\"stickers.selectedSticker.id\" on-label-click=\"onLabelClicked($label)\"></labels-panel>\n" +
    "                    <labels-panel ng-switch-when=\"true\" class=\"bk-labels-container\" selected-label-id=\"stickers.selectedSticker.id\" on-label-click=\"onLabelClicked($label)\" on-label-deletion=\"onLabelDeletion($label)\" on-label-update=\"onLabelUpdate($label)\"></labels-panel>\n" +
    "                </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "");
}]);

angular.module("src/modules/metadata-list/metadata/metadata-list-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/metadata/metadata-list-page.html",
    "<div class=\"bk-metadata-list-header\" ng-if=\"$ctrl.showHeader()\">\n" +
    "    <div class=\"bk-metadata-list-title\">\n" +
    "        <div ng-if=\"$ctrl.headerTitle\">{{$ctrl.headerTitle}}</div>\n" +
    "    </div>\n" +
    "    <list-filters-and-labels filters=\"$ctrl.filters\" on-filter-applied=\"$ctrl.onFiltering()\" label-deleted-callback=\"$ctrl.onLabelDeleted(label)\" stickers=\"$ctrl.stickers\" class=\"bk-filter-label-bar\">\n" +
    "    </list-filters-and-labels>\n" +
    "    <div class=\"bk-metadata-list-action-button-wrapper\">\n" +
    "        <bk-action-button-dropdown ng-if=\"$ctrl.dropdownMenu\" blink-tooltip=\"{{$ctrl.dropdownMenu.tooltip}}\" menu=\"$ctrl.dropdownMenu\">\n" +
    "        </bk-action-button-dropdown>\n" +
    "\n" +
    "        <bk-secondary-button ng-if=\"$ctrl.button\" text=\"{{ $ctrl.button.text }}\" icon=\"{{ $ctrl.button.icon }}\" ng-class=\"$ctrl.button.class\" ng-click=\"$ctrl.button.onClick()\">\n" +
    "        </bk-secondary-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"list-layout bk-generic-list\">\n" +
    "    <actionable-list list-model=\"$ctrl.listModel\" action-items=\"$ctrl.actionItems\" on-row-click=\"$ctrl.onRowClick\" on-render-complete=\"$ctrl.onListRenderCallback\" swap-header-items=\"$ctrl.swapHeaderItems\" class=\"tab-content bk-list-container\">\n" +
    "    </actionable-list>\n" +
    "</div>\n" +
    "<div ng-switch=\"$ctrl.showShareDialog\">\n" +
    "    <bk-share-dialog bk-ctrl=\"$ctrl.shareDialogComponent\" ng-switch-when=\"true\">\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-content-format.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{column.format(row)}}\"\n" +
    "         data-placement=\"auto bottom\"\n" +
    "         auto-tooltip-style=\"bootstrap\">\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-date-format.html\">\n" +
    "    <div class=\"bk-clock-icon\"></div><div class=\"bk-time-author-label\">{{column.format(row)}}</div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-author-format.html\">\n" +
    "    <blink-profile-pic user-id=\"column.format(row)[0]\"\n" +
    "                       user-display-name=\"column.format(row)[1]\"\n" +
    "                       show-tooltip=\"true\"\n" +
    "                       class=\"bk-profile-pic\">\n" +
    "    </blink-profile-pic>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-source-format.html\">\n" +
    "    <div class=\"{{column.format(row)[1]}}\"></div>\n" +
    "    <div class=\"bk-source-content\">{{column.format(row)[0]}}</div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-stickers-format.html\">\n" +
    "    <tagged-labels tags=\"column.format(row)[0]\"\n" +
    "                   deletable=\"column.format(row)[1]\"\n" +
    "                   on-remove-label=\"column.format(row)[2](row, $label)\">\n" +
    "    </tagged-labels>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"data-source-list-format.html\">\n" +
    "    <div class=\"bk-ds-type-content bk-overflow-ellipsis\"\n" +
    "         blink-tooltip=\"{{column.format(row)}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\">\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"data-source-load-status-format.html\">\n" +
    "    <div class=\"bk-ds-load-status-content\">\n" +
    "        <div class=\"ds-load-status green\">{{column.format(row)[0]}} <span>{{strings.Successful}}</span></div>\n" +
    "        <div class=\"ds-load-status yellow\">{{column.format(row)[1]}} <span>{{strings.In_progress}}</span></div>\n" +
    "        <div class=\"ds-load-status red\">{{column.format(row)[2]}} <span>{{strings.Failed}}</span></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-list-view-status.html\">\n" +
    "    <div>\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-list-status-format.html\">\n" +
    "    <div ng-switch=\"row.getState()\" class=\"bk-job-content\">\n" +
    "        <div ng-switch-when=\"1\" class=\"bk-style-icon-play\">\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"bk-style-icon-pause\"></div>\n" +
    "        <div ng-switch-when=\"3\" class=\"bk-style-icon-checkmark\"></div>\n" +
    "    </div>\n" +
    "    {{column.format(row)}}\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-list-schedule-format.html\">\n" +
    "  <div>\n" +
    "      {{column.format(row)}}\n" +
    "  </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-list-recipient-format.html\">\n" +
    "    <span  data-html=\"true\" class=\"bk-recipient\" blink-tooltip=\"{{row.getRecipientTooltip()}}\">\n" +
    "          {{column.format(row)}}\n" +
    "    </span>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-run-start-date.html\">\n" +
    "\n" +
    "    <div>\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-run-end-date.html\">\n" +
    "    <div>\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-run-state.html\">\n" +
    "    <div class=\"bk-status-content\">\n" +
    "        <div class=\"bk-status-{{column.format(row)[0]}}\">\n" +
    "            <span class=\"status-text\">{{column.format(row)[1]}}</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"a3-job-result.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{row.getLastFailureMessage()}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\"\n" +
    "         ng-bind-html=\"column.format(row)\">\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"a3-job-run-result.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{row.getFailureMessage()}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\"\n" +
    "         ng-bind-html=\"column.format(row)\">\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"job-name-with-link.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{column.format(row)}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\">\n" +
    "         <a ng-href=\"{{row.href}}\">{{column.format(row)}}</a>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/metadata-list/pinboards/pinboard-report-list-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/pinboards/pinboard-report-list-component.html",
    "<div class=\"bk-report-list\">\n" +
    "    <div class=\"bk-metadata-list\">\n" +
    "        <bk-job-status-viewer class=\"status-viewer bk-vertical-flex-container-sized\" ng-if=\"$ctrl.shouldShowStatusViewer\" bk-ctrl=\"$ctrl.jobStatusViewerCtrl\"></bk-job-status-viewer>\n" +
    "        <metadata-list-page bk-ctrl=\"$ctrl.jobListCtrl\" class=\"bk-vertical-flex-container-sized\"></metadata-list-page>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/metadata-list/pinboards/pinboards-list-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/metadata-list/pinboards/pinboards-list-page.html",
    "<div ng-controller=\"PinboardsPageController\" class=\"bk-pinboard-list\">\n" +
    "    <div class=\"bk-metadata-list\">\n" +
    "        <metadata-list-page bk-ctrl=\"ctrl\" class=\"bk-vertical-flex-container-sized\"></metadata-list-page>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/name-description/name-description.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/name-description/name-description.html",
    "<div class=\"bk-name-description\">\n" +
    "    <div class=\"bk-name\">{{$ctrl.name()}}</div>\n" +
    "    <div class=\"bk-description\">{{$ctrl.description()}}</div>\n" +
    "</div>");
}]);

angular.module("src/modules/natural-query/clause-templates/aggregate-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/aggregate-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <span ng-repeat=\"(aggregation, columns) in outputColumnValues\">\n" +
    "        <li>\n" +
    "            <span class=\"bk-aggr-label\">{{ aggregationTranslation[aggregation] }}</span>\n" +
    "            <span ng-repeat=\"column in columns\">\n" +
    "                <span ng-switch on=\"$index == maxMeasuresToShow - 1\">\n" +
    "                    <span ng-switch-when=\"true\">\n" +
    "                        {{ strings.aggregateMetricMeasures.assign({\n" +
    "                                length: columns.length - maxMeasuresToShow + 1\n" +
    "                            })\n" +
    "                        }}\n" +
    "                    </span>\n" +
    "                    <span ng-switch-when=\"false\" ng-switch on=\"$index > maxMeasuresToShow - 1\">\n" +
    "                        <span ng-switch-when=\"false\">\n" +
    "                            {{ getSequenceSymbol($index, columns) }}\n" +
    "                            <span class=\"bk-output-column bk-text-{{getColumnColor(column)}}\" blink-tooltip=\"{{ column.table.name }}\">{{ column.name}}</span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </li>\n" +
    "    </span>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/filter-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/filter-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <span ng-repeat=\"(type, userFilters) in userFiltersValues\">\n" +
    "        \n" +
    "        \n" +
    "	    <span ng-repeat=\"(columnId, colData) in userFilters\">\n" +
    "            <li>\n" +
    "                <span class=\"bk-aggr-label\">{{ aggregationTranslation[colData.havingFilterPredicate] }}</span>\n" +
    "                <span class=\"bk-filter-column bk-text-{{getColumnColor(colData.column)}}\" blink-tooltip=\"{{ colData.column.table.name }}\">\n" +
    "                    {{ colData.column.name }}\n" +
    "                </span>\n" +
    "                <span ng-repeat=\"(i, operatorAndValues) in colData.opAndVal\">\n" +
    "                    <span>{{ getSequenceSymbol(i, colData.opAndVal) }}</span>\n" +
    "                    <span>\n" +
    "                        {{ filterOperatorDescription[operatorAndValues.operator][0] }}\n" +
    "                        <span ng-repeat=\"(j, value) in operatorAndValues.effectiveValues\">\n" +
    "                            {{ getSequenceSymbol(j, operatorAndValues.effectiveValues) }}\n" +
    "                            <span class=\"bk-filter-value bk-text-{{getColumnColor(colData.column)}}\">\n" +
    "                                {{ truncateLongString(value) }}\n" +
    "                            </span>\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </li>\n" +
    "        </span>\n" +
    "    </span>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/grouping-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/grouping-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <li>\n" +
    "        <span ng-repeat=\"groupingColumn in query.groupingColumns\">\n" +
    "            <span ng-switch on=\"$index == maxGroupingColumnsToShow - 1\">\n" +
    "                <span ng-switch-when=\"true\">\n" +
    "                    {{ strings.groupingClause.assign({\n" +
    "                                length: query.groupingColumns.length - maxGroupingColumnsToShow + 1\n" +
    "                            })\n" +
    "                        }}\n" +
    "                </span>\n" +
    "                <span ng-switch-when=\"false\" ng-switch on=\"$index > maxGroupingColumnsToShow - 1\">\n" +
    "                    <span ng-switch-when=\"false\">\n" +
    "                        {{ getSequenceSymbol($index, query.groupingColumns) }}\n" +
    "                        <span class=\"bk-grouping-column bk-text-{{getColumnColor(groupingColumn.column)}}\" blink-tooltip=\"{{ groupingColumn.column.table.name }}\">{{ groupingColumn.column.name }}</span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/growth-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/growth-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    {{\n" +
    "        strings.And_then_determined.assign({\n" +
    "            bucketing: growthBucketTranslation[query.growthRepresentation.growthBucket].toLowerCase()\n" +
    "        })\n" +
    "    }}\n" +
    "    <span ng-repeat=\"outputColumn in query.outputColumns\">\n" +
    "        {{ getSequenceSymbol($index, query.outputColumns) }}\n" +
    "        <span class=\"bk-output-column bk-text-{{getColumnColor(outputColumn.column)}}\" blink-tooltip=\"{{ outputColumn.column.table.name }}\">\n" +
    "            {{ outputColumn.column.name }}\n" +
    "        </span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"query.growthRepresentation.isYOY\">\n" +
    "        {{ strings.over_successive_year }}\n" +
    "    </span>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/join-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/join-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <li>\n" +
    "        <span ng-repeat=\"joinRepresentation in query.joinRepresentations\">\n" +
    "            {{ getSequenceSymbol($index, query.joinRepresentations) }}\n" +
    "            <span class=\"bk-table\" blink-tooltip=\"{{ joinRepresentation.source.name }}\">\n" +
    "                {{ joinRepresentation.source.name }}\n" +
    "            </span>\n" +
    "            {{strings.and}}\n" +
    "            <span class=\"bk-table\" blink-tooltip=\"{{ joinRepresentation.destination.name }}\">\n" +
    "                {{ joinRepresentation.destination.name }}\n" +
    "            </span>\n" +
    "            {{strings.tables_using}}\n" +
    "            <span class=\"bk-join-name\">\n" +
    "                {{ joinRepresentation.relationshipName }}\n" +
    "            </span>\n" +
    "            {{strings.relation}}\n" +
    "        </span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/list-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/list-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <li>\n" +
    "        <span ng-repeat=\"groupingColumn in query.groupingColumns\">\n" +
    "            <span ng-switch on=\"$index == maxListColumnsToShow - 1\">\n" +
    "                <span ng-switch-when=\"true\">\n" +
    "                    {{ strings.columnMeasures.assign({\n" +
    "                                length: query.groupingColumns.length - maxListColumnsToShow + 1\n" +
    "                            })\n" +
    "                        }}\n" +
    "</span>\n" +
    "                <span ng-switch-when=\"false\" ng-switch on=\"$index > maxListColumnsToShow - 1\">\n" +
    "                    <span ng-switch-when=\"false\">\n" +
    "                        {{ getSequenceSymbol($index, query.groupingColumns) }}\n" +
    "                        <span class=\"bk-grouping-column bk-text-{{getColumnColor(groupingColumn.column)}}\" blink-tooltip=\"{{ groupingColumn.column.table.name }}\">{{ groupingColumn.column.name.pluralize() }}</span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/sort-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/sort-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <span ng-repeat=\"(order, columns) in sortColumnValues\">\n" +
    "        <li>\n" +
    "            <span ng-repeat=\"(i, column) in columns\">\n" +
    "                {{ getSequenceSymbol(i, columns) }}\n" +
    "                <span class=\"bk-sort-column bk-text-{{getColumnColor(column)}}\" blink-tooltip=\"{{ column.table.name }}\"> {{column.name}} </span>\n" +
    "            </span>\n" +
    "            <span>\n" +
    "                {{ strings.order.assign({\n" +
    "                                order: order\n" +
    "                            })\n" +
    "                        }}\n" +
    "                </span>\n" +
    "</li>\n" +
    "    </span>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/top-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/top-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <span>\n" +
    "        {{ strings.regionCount.assign({\n" +
    "        topKeyword: query.topRepresentation.topKeyword.toLowerCase(),\n" +
    "        topCount: query.topRepresentation.topCount\n" +
    "             })\n" +
    "        }}\n" +
    "    </span>\n" +
    "    <span ng-repeat=\"topColumn in query.topRepresentation.topColumns\">\n" +
    "        {{ getSequenceSymbol($index, query.topRepresentation.topColumns) }}\n" +
    "        <span class=\"bk-output-column bk-text-{{getColumnColor(topColumn)}}\" blink-tooltip=\"{{ topColumn.table.name }}\">{{ topColumn.name.pluralize() }}</span>\n" +
    "    </span>\n" +
    "    {{strings.ranked_by}}\n" +
    "    <span ng-repeat=\"rankedByColumn in query.topRepresentation.rankedByColumns\">\n" +
    "        {{ getSequenceSymbol($index, query.topRepresentation.rankedByColumns) }}\n" +
    "        <span class=\"bk-output-column bk-text-{{getColumnColor(rankedByColumn.column)}}\" blink-tooltip=\"{{ rankedByColumn.column.table.name }}\">\n" +
    "            {{ rankedByColumn.column.name }}\n" +
    "        </span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"query.topRepresentation.groupLimitColumns.length > 0\">\n" +
    "        {{strings.for_each}}\n" +
    "        <span ng-repeat=\"forEachColumn in query.topRepresentation.groupLimitColumns\">\n" +
    "            {{ getSequenceSymbol($index, query.topRepresentation.groupLimitColumns) }}\n" +
    "            <span class=\"bk-output-column bk-text-{{getColumnColor(forEachColumn)}}\" blink-tooltip=\"{{ forEachColumn.table.name }}\">\n" +
    "                {{ forEachColumn.name }}\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </span>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/clause-templates/worksheet-list-clause.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/clause-templates/worksheet-list-clause.html",
    "<ul class=\"bk-clause-template\">\n" +
    "    <li>\n" +
    "        <span ng-repeat=\"outputColumn in query.outputColumns\">\n" +
    "            <span ng-switch on=\"$index == maxListColumnsToShow - 1\">\n" +
    "                <span ng-switch-when=\"true\">\n" +
    "                    {{ strings.columnMeasures.assign({\n" +
    "                                length: query.outputColumns.length - maxListColumnsToShow + 1\n" +
    "                            })\n" +
    "                        }}\n" +
    "</span>\n" +
    "                <span ng-switch-when=\"false\" ng-switch on=\"$index > maxListColumnsToShow - 1\">\n" +
    "                    <span ng-switch-when=\"false\">\n" +
    "                        {{ getSequenceSymbol($index, query.outputColumns) }}\n" +
    "                        <span class=\"bk-grouping-column bk-text-{{getColumnColor(outputColumn.column)}}\" blink-tooltip=\"{{ outputColumn.column.table.name }}\">{{ outputColumn.column.name.pluralize() }}</span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/natural-query/info-card-icon/info-card-icon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/info-card-icon/info-card-icon.html",
    "<div class=\"bk-infocard-icon\">\n" +
    "    <div class=\"bk-infocard-button\" ng-class=\"{'bk-active': $ctrl.showInfoCard}\" ng-click=\"toggleInfoCard()\" blink-tooltip=\"{{$ctrl.tooltipText}}\" uib-popover-template=\"$ctrl.popoverTemplateUrl\" popover-is-open=\"$ctrl.isInfoCardOpen()\" popover-append-to-body=\"true\" popover-placement=\"bottom-right\" popover-class=\"bk-info-card-popover\">\n" +
    "        <span class=\"bk-style-icon-circled-question bk-icon\"></span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"info-card.html\">\n" +
    "    <bk-info-card bk-ctrl=\"$ctrl.infoCardComponent\"></bk-info-card>\n" +
    "</script>");
}]);

angular.module("src/modules/natural-query/info-card/info-card.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/info-card/info-card.html",
    "<div class=\"bk-info-card\">\n" +
    "    <div class=\"bk-info-card-header\">\n" +
    "        <div class=\"bk-title\" ng-show=\"$ctrl.shouldShowTitle()\">{{$ctrl.titleText}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-info-card-body\">\n" +
    "        <blink-natural-query answer-model=\"$ctrl.answerModel\"></blink-natural-query>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/natural-query/natural-query/natural-query.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/natural-query/natural-query/natural-query.html",
    "<div class=\"bk-natural-query\" ng-switch=\"pendingNaturalQueryCall\">\n" +
    "    <blink-loading-indicator ng-switch-when=\"true\"></blink-loading-indicator>\n" +
    "    <div class=\"bk-natural-query\" ng-switch-when=\"false\">\n" +
    "        <div ng-repeat=\"entity in queryTemplate\">\n" +
    "            <div ng-switch on=\"entity\">\n" +
    "                <div ng-switch-when=\"MEASURE_GROUP\">\n" +
    "                    <div ng-switch on=\"queryType\">\n" +
    "                        <div ng-switch-when=\"aggregated\">\n" +
    "                            <div class=\"bk-natural-query-item\">\n" +
    "{{strings.ThoughtSpot_computed}}<span ng-include=\"template('aggregate-clause')\"></span>\n" +
    "                            </div>\n" +
    "                            <div class=\"bk-natural-query-item\" ng-switch on=\"query.groupingColumns.length > 0\">\n" +
    "                                <div ng-switch-when=\"true\">\n" +
    "                                    <span>{{strings.for_each}}</span>\n" +
    "                                <span ng-switch on=\"query.groupingColumns.length > 1\">\n" +
    "                                    <span ng-switch-when=\"true\"> {{strings.combination_of}}</span>\n" +
    "                                </span>\n" +
    "                                    <span ng-include=\"template('grouping-clause')\"></span>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                        <div ng-switch-when=\"list\" class=\"bk-natural-query-item\">\n" +
    "{{strings.ThoughtSpot_compiled_a}}<span ng-include=\"template('list-clause')\"></span>\n" +
    "                        </div>\n" +
    "                        <div ng-switch-when=\"worksheetList\" class=\"bk-natural-query-item\">\n" +
    "{{strings.ThoughtSpot_compiled_a}}<span ng-include=\"template('worksheet-list-clause')\"></span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"FILTER\">\n" +
    "                    <div class=\"bk-natural-query-item\" ng-switch on=\"query.userFilters.length > 0\">\n" +
    "                        <div ng-switch-when=\"true\">\n" +
    "                            {{strings.filtered_on}}\n" +
    "                            <span ng-include=\"template('filter-clause')\"></span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"SORT\">\n" +
    "                    <div class=\"bk-natural-query-item\" ng-switch on=\"query.sortColumns.length > 0\">\n" +
    "                        <div ng-switch-when=\"true\">\n" +
    "                            {{strings.sorted_by}}\n" +
    "                            <span ng-include=\"template('sort-clause')\"></span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"TOP\">\n" +
    "                    <div class=\"bk-natural-query-item\" ng-if=\"query.topRepresentation.topCount > 0\">\n" +
    "                       <div ng-include=\"template('top-clause')\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"GROWTH\">\n" +
    "                    <div class=\"bk-natural-query-item\" ng-if=\"!!query.growthRepresentation\">\n" +
    "                        <div ng-include=\"template('growth-clause')\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"JOIN\">\n" +
    "                    <div class=\"bk-natural-query-item\" ng-switch on=\"query.joinRepresentations.length > 0\">\n" +
    "                        <div ng-switch-when=\"true\">\n" +
    "                            {{strings.by_linking}}\n" +
    "                            <span ng-include=\"template('join-clause')\"></span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/nav/nav.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/nav/nav.html",
    "<div class=\"bk-primary-nav\" ng-hide=\"navState == 'login'\">\n" +
    "    <div class=\"bk-primary-nav-logo\">\n" +
    "        <a href=\"#/home\" class=\"bk-primary-nav-home-logo bk-logo-customizable\"></a>\n" +
    "    </div>\n" +
    "    <div class=\"bk-primary-nav-menu\" ng-class=\"{'bk-nav-menu-expanded': isExpanded}\" blink-overlay=\"closeNavExpansion()\" ignore-click-selector=\"['.bk-primary-nav-expand']\" ng-click=\"toggleNavExpansion()\">\n" +
    "        <a href=\"#/answer/\" class=\"bk-primary-nav-search\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'answer') }\">\n" +
    "            <div>{{ strings.SEARCH }}</div>\n" +
    "        </a>\n" +
    "        <a ng-if=\"showAnswerTab()\" href=\"#/answers\" class=\"bk-primary-nav-answers\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'answers') }\">\n" +
    "            <div>{{ strings.ANSWERS }}</div>\n" +
    "        </a>\n" +
    "        <a href=\"#/pinboards\" class=\"bk-primary-nav-pinboards\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'pinboards' || navState == 'pinboard') }\">\n" +
    "            <div>{{ strings.PINBOARDS }}</div>\n" +
    "        </a>\n" +
    "        <a ng-if=\"showInsights()\" href=\"#/insights\" class=\"bk-primary-nav-insights\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'insights' || navState == 'insight') }\">\n" +
    "            <div>{{ strings.INSIGHTS }}</div>\n" +
    "        </a>\n" +
    "        <a href=\"#/data\" class=\"bk-primary-nav-manage-data\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'data') }\">\n" +
    "            <div>{{ strings.MANAGE_DATA }}</div>\n" +
    "        </a>\n" +
    "        <a href=\"#/admin\" ng-if=\"showAdminTab\" class=\"bk-primary-nav-admin\" ng-class=\"{ 'bk-selected-nav-item': (navState == 'admin') }\">\n" +
    "            <div>{{ strings.ADMIN }}</div>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "    <div class=\"bk-answer-capture-btn bk-blue-capture-btn\" ng-click=\"testCapture.captureAndDownload()\" ng-show=\"canShowCaptureButton()\">v\n" +
    "    </div>\n" +
    "\n" +
    "    <a class=\"bk-primary-nav-expand\" ng-click=\"toggleNavExpansion()\">\n" +
    "        <div class=\"bk-style-icon-hamburger\"></div>\n" +
    "    </a>\n" +
    "\n" +
    "    <div class=\"bk-help-menu\">\n" +
    "        <bk-action-button-dropdown menu=\"actionMenuConfig\" only-icon=\"true\" icon=\"bk-style-icon-help-grey\" custom-button=\"true\">\n" +
    "        </bk-action-button-dropdown>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-user-menu\">\n" +
    "        <blink-current-user-profile-pic ng-click=\"onClickUserMenuButton()\" class=\"bk-user-profile-pic\" ng-mouseenter=\"mouseOutsideMenu = false\" ng-mouseleave=\"mouseOutsideMenu = true\" blink-on-escape=\"showUserMenu = false\" on-global-click=\"mouseOutsideMenu && (showUserMenu = false)\"></blink-current-user-profile-pic>\n" +
    "        <div class=\"bk-user-menu-panel\" ng-hide=\"!showUserMenu\">\n" +
    "            <div class=\"bk-user-name\">\n" +
    "                {{ $root.sessionService.getUserDisplayName() }}\n" +
    "            </div>\n" +
    "            <a href=\"#/user-preference\" class=\"bk-user-profile\">\n" +
    "                <span class=\"bk-style-icon-login\"></span>\n" +
    "                {{ strings.userMenu.PROFILE }}\n" +
    "            </a>\n" +
    "            <a ng-hide=\"disableSignOut()\" class=\"bk-sign-out\" ng-click=\"logout()\">\n" +
    "                <span class=\"bk-style-icon-logout\"></span>\n" +
    "                {{ strings.userMenu.SIGN_OUT }}\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"helpWidget.isHelpOpen\">\n" +
    "    <help-widget on-close=\"helpWidget.isHelpOpen = false; helpWidget.pagePath = ''\" page-path=\"helpWidget.pagePath\"></help-widget>\n" +
    "</div>");
}]);

angular.module("src/modules/object-migration/export/export-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/object-migration/export/export-dialog.html",
    "<div>\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">{{ data.customData.stringConstants.EXPORT_URL }}</div>\n" +
    "        <input ng-disabled=\"data.customData.disableURLField\" type=\"url\" ng-model=\"data.customData.exportURL\" spellcheck=\"false\" blink-auto-focus required>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\" ng-show=\"data.customData.showImportSteps\">\n" +
    "        <div class=\"label\">{{ data.customData.stringConstants.STEP.ONE }}</div>\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.STEP_INFO.ONE }}\n" +
    "            <a href=\"{{ data.customData.importURL }}\" target=\"_blank\">\n" +
    "                {{ data.customData.stringConstants.IMPORT_URL_MSG }}\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\" ng-show=\"data.customData.showImportSteps\">\n" +
    "        <div class=\"label\">{{ data.customData.stringConstants.STEP.TWO }}</div>\n" +
    "        <div class=\"label\">{{ data.customData.stringConstants.STEP_INFO.TWO }}</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\" ng-show=\"data.customData.showImportSteps\">\n" +
    "        <div class=\"label\">{{ data.customData.stringConstants.STEP.THREE }}</div>\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.STEP_INFO.THREE + data.customData.filePath }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/object-migration/import/import-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/object-migration/import/import-dialog.html",
    "<div class=\"bk-import-status\">\n" +
    "    <div class=\"bk-dialog-field\">\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.IMPORT_FILE }}\n" +
    "        </div>\n" +
    "        <input ng-disabled=\"data.customData.disableFilePathField\" type=\"text\" ng-model=\"data.customData.filePath\" spellcheck=\"false\" blink-auto-focus required>\n" +
    "    </div>\n" +
    "    <div class=\"bk-dialog-field\" ng-show=\"data.customData.showStatusMsg\">\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.SUMMARY_LABEL }}\n" +
    "        </div>\n" +
    "        <div class=\"label-content\">\n" +
    "            <div class=\"bk-import-msg\">\n" +
    "                {{ data.customData.summary }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.IMPORTED_LABEL }}\n" +
    "        </div>\n" +
    "        <div class=\"label-content\">\n" +
    "            <div class=\"bk-import-msg\">\n" +
    "                <div ng-repeat=\"importedObj in data.customData.importedObjectNames\">\n" +
    "                    {{ importedObj }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-show=\"!data.customData.importedObjectNames.length\">\n" +
    "                {{ data.customData.stringConstants.NONE_LABEL }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"label\">\n" +
    "            {{ data.customData.stringConstants.UNIMPORTED_LABEL }}\n" +
    "        </div>\n" +
    "        <div class=\"label-content\">\n" +
    "            <div class=\"bk-import-msg\">\n" +
    "                <div ng-repeat=\"unimportedObj in data.customData.unimportedObjectNames\">\n" +
    "                    {{ unimportedObj }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-show=\"!data.customData.unimportedObjectNames.length\">\n" +
    "                {{ data.customData.stringConstants.NONE_LABEL }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pb-card/pb-card.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pb-card/pb-card.html",
    "<div class=\"bk-pinboard-card\" slide viz-id=\"{{$ctrl.vizModel.getId()}}\">\n" +
    "    <bk-action-button-dropdown class=\"bk-pb-card-action-menu\" menu=\"$ctrl.actionMenuConfig\" only-icon=\"true\" icon=\"bk-style-icon-table-column-options\" ng-if=\"!!$ctrl.actionMenuConfig\">\n" +
    "    </bk-action-button-dropdown>\n" +
    "    <div class=\"bk-pinboard-card-content\" ng-switch=\"$ctrl.contentType\">\n" +
    "        <bk-pb-generic-viz class=\"bk-pb-generic-viz-container\" ng-switch-when=\"GENERIC\" bk-ctrl=\"$ctrl.contentCtrl\">\n" +
    "        </bk-pb-generic-viz>\n" +
    "        <bk-pinboard-data-viz class=\"bk-pinboard-data-viz-container\" ng-switch-when=\"DATA\" bk-ctrl=\"$ctrl.contentCtrl\">\n" +
    "        </bk-pinboard-data-viz>\n" +
    "        <bk-pb-cluster-viz class=\"bk-pb-cluster-viz-container\" ng-switch-when=\"CLUSTER\" bk-ctrl=\"$ctrl.contentCtrl\">\n" +
    "        </bk-pb-cluster-viz>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pb-cluster-viz/pb-cluster-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pb-cluster-viz/pb-cluster-viz.html",
    "<div class=\"bk-pb-cluster-viz\">\n" +
    "    <div class=\"bk-pinboard-viz-header\">\n" +
    "        <bk-name-description class=\"bk-pinboard-viz-name\" bk-ctrl=\"$ctrl.nameDescriptionComponent\">\n" +
    "        </bk-name-description>\n" +
    "    </div>\n" +
    "    <div class=\"bk-pinboard-viz-content\" uib-carousel active=\"$ctrl.activeVizIndex\" on-active-slide-change=\"$ctrl.onActiveSlideChangeCallback\" interval=\"-1\" no-pause=\"true\" no-transition=\"true\">\n" +
    "        <div class=\"bk-viz-cluster-viz\" uib-slide ng-repeat=\"dataVisualization in $ctrl.dataVisualizations\" index=\"$index\">\n" +
    "            <div ng-if=\"!!$ctrl.dataVisualizations &&\n" +
    "            $ctrl.dataVisualizations.length > 0 &&\n" +
    "            $ctrl.activeVizIndex >= 0\" class=\"bk-viz-details-title-info\">\n" +
    "                ( {{strings.a3.SHOWING_INSIGHT}} {{$ctrl.activeVizIndex + 1}} {{strings.of}} {{$ctrl.dataVisualizations.length}} )\n" +
    "            </div>\n" +
    "            <bk-pinboard-data-viz class=\"bk-data-viz-container\" bk-ctrl=\"dataVisualization\">\n" +
    "            </bk-pinboard-data-viz>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pb-generic-viz/pb-generic-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pb-generic-viz/pb-generic-viz.html",
    "<div class=\"bk-pinboard-generic-viz\">\n" +
    "    <div class=\"bk-pinboard-viz-header\">\n" +
    "        <bk-name-description class=\"bk-pinboard-viz-name\" bk-ctrl=\"$ctrl.nameDescriptionComponent\">\n" +
    "        </bk-name-description>\n" +
    "    </div>\n" +
    "    <bk-generic-viz class=\"bk-pinboard-viz-content\" bk-ctrl=\"$ctrl.genericVizComponent\">\n" +
    "    </bk-generic-viz>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pinboard-data-viz/pinboard-data-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pinboard-data-viz/pinboard-data-viz.html",
    "<div class=\"bk-pinboard-data-viz\">\n" +
    "    <div class=\"bk-pinboard-viz-header\">\n" +
    "        <bk-name-description class=\"bk-pinboard-viz-name\" bk-ctrl=\"$ctrl.nameDescriptionComponent\">\n" +
    "        </bk-name-description>\n" +
    "        <bk-action-button-dropdown class=\"bk-pinboard-data-viz-action-menu\" menu=\"$ctrl.actionMenuConfig\" only-icon=\"true\" icon=\"bk-style-icon-table-column-options\" ng-if=\"!$ctrl.config.hideActions && !!$ctrl.actionMenuConfig\">\n" +
    "        </bk-action-button-dropdown>\n" +
    "    </div>\n" +
    "    <blink-loading-indicator ng-if=\"$ctrl.showLoading\">\n" +
    "    </blink-loading-indicator>\n" +
    "    <bk-data-viz class=\"bk-pinboard-viz-content\" ng-if=\"!$ctrl.showLoading\" bk-ctrl=\"$ctrl.dataVizComponent\">\n" +
    "    </bk-data-viz>\n" +
    "    <div ng-include=\" 'transformed-viz-marker.html' \"></div>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"transformed-viz-marker.html\">\n" +
    "    <img ng-src=\"/resources/img/drilldown-icon.png\"\n" +
    "         class=\"bk-transformed-marker\"\n" +
    "         ng-if=\"$ctrl.isTransformed()\"\n" +
    "         blink-tooltip=\"{{$ctrl.getTransformedQuestion()}}\"\n" +
    "         data-html=\"true\"\n" +
    "         ng-click=\"$ctrl.resetTransformation()\"\n" +
    "         data-placement=\"bottom\"/>\n" +
    "</script>\n" +
    "<script type=\"text/ng-template\" id=\"transformation-marker-tooltip.html\">\n" +
    "    <div>{questionText}</div>\n" +
    "    <div class=\"bk-separator\"></div>\n" +
    "    <div>{resetLabel}</div>\n" +
    "</script>");
}]);

angular.module("src/modules/pinboard/pinboard-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pinboard-page.html",
    "<div>\n" +
    "    <div class=\"bk-pinboard-page-content\" ng-if=\"!!metadataConfig.model\">\n" +
    "        <blink-sharable-item type=\"'PINBOARD'\" with-sage-bar=\"false\" metadata-config=\"metadataConfig\" content-url=\"'src/modules/viz-layout/answer/pinboard-content.html'\" class=\"bk-vertical-flex-container-sized\" ng-class=\"{ 'bk-insight-page': pinboardPageConfig.isAutoCreated }\">\n" +
    "        </blink-sharable-item>\n" +
    "        <bk-viz-context-answer ng-if=\"!!vizContextAnswerComponent\" bk-ctrl=\"vizContextAnswerComponent\">\n" +
    "        </bk-viz-context-answer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pinboard-ribbon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pinboard-ribbon.html",
    "<div ng-switch=\"metadataConfig.pinboardPageConfig.viewState\">\n" +
    "    <div ng-switch-when=\"PRINT_STATE\" class=\"bk-pinboard-cover-page\">\n" +
    "        <div class=\"bk-pinboard-details\">\n" +
    "            <div class=\"bk-pinboard-headers\">\n" +
    "                <div class=\"bk-pinboard-name\">{{metadataConfig.model.getName()}}</div>\n" +
    "                <div class=\"bk-pinboard-description\">\n" +
    "                    {{metadataConfig.model.getDescription()}}\n" +
    "                </div>\n" +
    "                <div class=\"bk-current-date\">\n" +
    "                    {{metadataConfig.strings.DATE}}{{': '}}{{currentDate}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-if=\"metadataConfig.hasFilters\">\n" +
    "                <div class=\"bk-filter-heading\">\n" +
    "                    {{metadataConfig.strings.FILTER_HEADING}}\n" +
    "                </div>\n" +
    "                <filter-panel class=\"pinboard-filter-panel\" ctrl=\"metadataConfig.filterPanelController\">\n" +
    "                </filter-panel>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-cover-logo\">\n" +
    "            <img width=\"60\" height=\"60\" src=\"resources/img/logo/TS-logo-white.png\">\n" +
    "        </div>\n" +
    "     </div>\n" +
    "    <div ng-switch-when=\"RELATED_LINK_STATE\" class=\"bk-pinboard-cover-page\">\n" +
    "        <div class=\"bk-pinboard-headers\">\n" +
    "            <div class=\"bk-pinboard-name\">\n" +
    "                {{metadataConfig.strings.PINBOARD_TAB}}{{': '}}{{metadataConfig.model.getName()}}\n" +
    "            </div>\n" +
    "            <div class=\"bk-pinboard-description\">{{metadataConfig.model.getDescription()}}</div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"metadataConfig.hasFilters\">\n" +
    "            <div class=\"bk-filter-heading\">\n" +
    "                {{metadataConfig.strings.FILTER_HEADING}}\n" +
    "            </div>\n" +
    "            <filter-panel class=\"pinboard-filter-panel\" ctrl=\"metadataConfig.filterPanelController\">\n" +
    "            </filter-panel>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "        <bk-a3-insights-summary ng-if=\"!!metadataConfig.a3InsightsSummaryComponent\" bk-ctrl=\"metadataConfig.a3InsightsSummaryComponent\">\n" +
    "        </bk-a3-insights-summary>\n" +
    "        <filter-panel class=\"pinboard-filter-panel\" ctrl=\"metadataConfig.filterPanelController\">\n" +
    "        </filter-panel>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/pinboard-sharable-item-plugin.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/pinboard-sharable-item-plugin.html",
    "<div class=\"bk-sharable-item-pinboard-plugin clearfix\">\n" +
    "    <bk-pinboard-selector class=\"bk-pinboard-drop-down\" bk-ctrl=\"pluginConfig.pinboardSelectorComponent\">\n" +
    "    </bk-pinboard-selector>\n" +
    "\n" +
    "    <div class=\"bk-edit-btn fl\" ng-click=\"pluginConfig.onEditDetails()\">\n" +
    "        <div class=\"bk-viz-btn-icon bk-style-icon-edit\" blink-tooltip=\"{{pluginConfig.editIconTooltip}}\"></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/pinboard/viz-context/viz-context.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/pinboard/viz-context/viz-context.html",
    "<div class=\"bk-viz-context bk-big-popup\" blink-on-escape=\"$ctrl.close()\">\n" +
    "    <div class=\"bk-context-dialog\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <span ng-bind-html=\"$ctrl.headerTitle\"></span>\n" +
    "            <a type=\"button\" class=\"bk-close\" ng-click=\"$ctrl.close()\">&times;</a>\n" +
    "        </div>\n" +
    "        <div class=\"popup-content\">\n" +
    "            <div class=\"bk-content\">\n" +
    "                <blink-loading-indicator ng-if=\"$ctrl.showLoading\">\n" +
    "                </blink-loading-indicator>\n" +
    "                <bk-answer-document class=\"bk-viz-context-answer-document-container\" ng-if=\"!!$ctrl.answerDocumentComponent\" bk-ctrl=\"$ctrl.answerDocumentComponent\">\n" +
    "                </bk-answer-document>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/powered-footer/powered-footer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/powered-footer/powered-footer.html",
    "<div class=\"bk-powered-footer\">\n" +
    "    <div class=\"bk-footer-text\">{{ $ctrl.setFooterTextValue() }}</div>\n" +
    "    <div class=\"bk-ts-powered-footer-logo\">\n" +
    "        <img src=\"/resources/img/logo/TS-logo-grayscale.svg\" class=\"bk-footer-logo-image\">\n" +
    "        <div class=\"bk-footer-logo-text\">\n" +
    "            <span class=\"bk-logo-title-part1\">{{ $ctrl.logoTextPart1 }}</span><span>{{ $ctrl.logoTextPart2 }}</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/principal-selector/principal-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/principal-selector/principal-selector.html",
    "<div class=\"bk-principal-selector\">\n" +
    "    \n" +
    "    <bk-permissions-list bk-ctrl=\"$ctrl.permissionsListComponent\"></bk-permissions-list>\n" +
    "    \n" +
    "    <div class=\"bk-add-principals\">\n" +
    "        <div class=\"bk-add-principals-header\" ng-click=\"$ctrl.toggleAddPrincipalSection()\">\n" +
    "            <span class=\"bk-plus-icon bk-style-icon-small-plus\"></span>\n" +
    "            <span class=\"bk-add-principals-title\">{{$ctrl.strings.addRecipients}}</span>\n" +
    "        </div>\n" +
    "        <div class=\"bk-add-principals-body\">\n" +
    "            <bk-add-principal bk-ctrl=\"$ctrl.addPrincipalComponent\"></bk-add-principal>\n" +
    "            <hr>\n" +
    "            <bk-add-email bk-ctrl=\"$ctrl.addEmailComponent\"></bk-add-email>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/print/print-view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/print/print-view.html",
    "<div class=\"bk-print\" ng-class=\"{'bk-screenshot-mode': $ctrl.isScreenshotMode}\" ng-switch=\"$ctrl.isViewValid()\">\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-invalid-print-config\">\n" +
    "        {{ $ctrl.getInvalidPrintConfigurationMessage() }}\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-print-content-container\">\n" +
    "        <pinboard-page class=\"bk-pinboard-page\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"$ctrl.getPinboardId()\" pinboard-page-config=\"$ctrl.getPinboardPageConfig()\">\n" +
    "        </pinboard-page>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/related-link/editor/related-link-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/related-link/editor/related-link-editor.html",
    "<div class=\"bk-related-link-editor\">\n" +
    "\n" +
    "    <div class=\"bk-related-link-header\">\n" +
    "        <div class=\"bk-related-link-header-name\">\n" +
    "            <div class=\"bk-related-link-title\">{{strings.relatedLink.relatedLinkName}}</div>\n" +
    "            <div class=\"bk-document-title bk-editable-title bk-related-link-title\">\n" +
    "                <div blink-content-editable ng-model=\"$ctrl.relatedLink.name\" description=\"$ctrl.relatedLink.description\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-related-link-source&quot;\">\n" +
    "            <div class=\"bk-select-box\">\n" +
    "                <div class=\"bk-related-link-title\">{{strings.metadataListPage.captions.SOURCE}}</div>\n" +
    "                <div>{{strings.Type}} {{$ctrl.getSourceType()}}</div>\n" +
    "                <div>{{strings.Name}} {{$ctrl.getSourceBookName()}}</div>\n" +
    "                <div>{{strings.embed.embeddedObjectType.VISUALIZATION}}: {{$ctrl.getSourceVizTitle()}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-link-ui\" ng-class=\"{'bk-success': $ctrl.isValidRelatedLink()}\">\n" +
    "            <div class=\"bk-link-left\"></div>\n" +
    "            <div class=\"bk-link-icon-container\">\n" +
    "                <div class=\"bk-link-icon\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-link-right\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-related-link-target&quot;\">\n" +
    "             <div class=\"bk-select-box\">\n" +
    "                <div class=\"bk-related-link-title\">{{strings.relatedLink.destination}}</div>\n" +
    "                <ui-select ng-model=\"$ctrl.destinationBookType\" on-select=\"$ctrl.destinationBookTypeSelected()\" theme=\"select2\" class=\"bk-select-destination-table\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.relatedLink.destinationType}}\">\n" +
    "                        {{$ctrl.destinationBookTypeEnum[$select.selected]}}\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"type in $ctrl.destinationBookTypeOptions\">\n" +
    "                        <div blink-tooltip=\"{{getTooltipHtml(table)}}\" data-html=\"true\" data-delay=\"{&quot;show&quot;:&quot;250&quot;}\" data-placement=\"right\">\n" +
    "                            {{$ctrl.destinationBookTypeEnum[type]}}\n" +
    "                        </div>\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "                <bk-pinboard-selector ng-if=\"$ctrl.destinationBookType === $ctrl.destinationBookTypeEnum.Pinboard\" bk-ctrl=\"$ctrl.pinboardSelector\" class=\"bk-select-destination-table\">\n" +
    "                </bk-pinboard-selector>\n" +
    "                <bk-answer-selector ng-if=\"$ctrl.destinationBookType === $ctrl.destinationBookTypeEnum.Answer\" bk-ctrl=\"$ctrl.answerSelector\">\n" +
    "                </bk-answer-selector>\n" +
    "                <ui-select ng-model=\"$ctrl.dstVizModel\" ng-if=\"$ctrl.vizModels.length > 0\" theme=\"select2\" class=\"bk-select-destination-table\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.relatedLink.selectVisualization}}\">\n" +
    "                        {{$ctrl.getDstVizTitle()}}\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"viz in $ctrl.getDestinationVizChoices()\">\n" +
    "                        {{$ctrl.getVizTitle(viz)}}\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "             </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"!!$ctrl.dstVizModel\" blink-tooltip=\"{{$ctrl.getDestinationToolTip()}}\" data-delay=\"{&quot;show&quot;:&quot;250&quot;}\" data-html=\"true\">\n" +
    "        {{strings.relatedLink.selectedVisualization}}{{$ctrl.getDstVizId()}}\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-related-link-create-mapping\">\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <ui-select ng-model=\"$ctrl.newSourceColumn\" theme=\"select2\" class=\"bk-select-source-column\">\n" +
    "                <ui-select-match placeholder=\"{{strings.relatedLink.sourceColumn}}\">\n" +
    "                    {{$select.selected.getUnderlyingColumnName()}}\n" +
    "                </ui-select-match>\n" +
    "                <ui-select-choices repeat=\"column in $ctrl.srcVizModel.getVizColumns() | filter: $select.search\">\n" +
    "                    {{column.getUnderlyingColumnName()}}\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </div>\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <ui-select ng-model=\"$ctrl.newOperator\" theme=\"select2\" class=\"bk-select-destination-operator\">\n" +
    "                <ui-select-match placeholder=\"{{strings.relatedLink.operator}}\">{{$select.selected}}</ui-select-match>\n" +
    "                <ui-select-choices repeat=\"filter in $ctrl.supportedOperators\">\n" +
    "                    {{filter}}\n" +
    "                </ui-select-choices>\n" +
    "            </ui-select>\n" +
    "        </div>\n" +
    "        <div class=\"bk-select-box\">\n" +
    "            <div ng-if=\"$ctrl.getDestinationVizColumns().length > 0\">\n" +
    "                <ui-select ng-model=\"$ctrl.newDestinationColumn\" theme=\"select2\" class=\"bk-select-destination-column\">\n" +
    "                    <ui-select-match placeholder=\"{{strings.relatedLink.destinationColumn}}\">\n" +
    "                        {{$select.selected.getUnderlyingColumnName()}}\n" +
    "                    </ui-select-match>\n" +
    "                    <ui-select-choices repeat=\"column in $ctrl.getDestinationVizColumns() | filter: $select.search\">\n" +
    "                        {{column.getUnderlyingColumnName()}}\n" +
    "                    </ui-select-choices>\n" +
    "                </ui-select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-related-link-show-mapping\" ng-if=\"$ctrl.relatedLink.content.relationships.length > 0 \">\n" +
    "        <table class=\"table table-bordered related-link-mapping-filters\">\n" +
    "            <div class=\"bk-relationship-name-header\">\n" +
    "                <caption>{{strings.relatedLink.mappings}}</caption>\n" +
    "            </div>\n" +
    "            <tr class=\"bk-related-list-table-row-header\">\n" +
    "                <th>{{strings.relatedLink.sourceColumn}}</th>\n" +
    "                <th>{{strings.relatedLink.operator}}</th>\n" +
    "                <th>{{strings.relatedLink.destinationColumn}}</th>\n" +
    "                <th>{{strings.relatedLink.action}}</th>\n" +
    "            </tr>\n" +
    "            <tr class=\"bk-related-list-table-row-data\" ng-repeat=\"relation in $ctrl.relatedLink.content.relationships track by $index\">\n" +
    "                <td>{{relation.sourceColumnName}}</td>\n" +
    "                <td>{{relation.operator}}</td>\n" +
    "                <td>{{relation.destinationColumnName}}</td>\n" +
    "                <td>\n" +
    "                    <bk-secondary-button text=\"{{strings.DELETE}}\" ng-click=\"$ctrl.removeRelationColumn($index)\" class=\"bk-add-related-link-mapping-button\">\n" +
    "                    </bk-secondary-button>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"buttons\">\n" +
    "            <bk-secondary-button text=\"{{strings.relatedLink.addMapping}}\" icon=\"bk-style-icon-small-plus\" is-disabled=\"!$ctrl.isValidRelationship()\" ng-click=\"$ctrl.addRelationship()\" class=\"bk-add-relationship-button\">\n" +
    "            </bk-secondary-button>\n" +
    "            <bk-primary-button text=\"{{strings.CREATE}}\" is-disabled=\"!$ctrl.isValidRelatedLink()\" ng-if=\"!$ctrl.isExistingRelation\" ng-click=\"$ctrl.createRelatedLink()\" class=\"bk-add-relationship-button\">\n" +
    "            </bk-primary-button>\n" +
    "            <bk-primary-button text=\"{{strings.SAVE}}\" icon=\"bk-style-icon-save\" is-disabled=\"!$ctrl.isValidRelatedLink()\" ng-if=\"$ctrl.isExistingRelation\" ng-click=\"$ctrl.updateRelatedLink()\" class=\"bk-add-relationship-button\">\n" +
    "            </bk-primary-button>\n" +
    "            <bk-secondary-button text=\"{{strings.CANCEL}}\" ng-click=\"$ctrl.cancel()\" class=\"bk-add-relationship-button\">\n" +
    "            </bk-secondary-button>\n" +
    "    </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("src/modules/related-link/editor/related-link-list-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/related-link/editor/related-link-list-viewer.html",
    "<div class=\"bk-related-link-viewer-component\">\n" +
    "<div ng-if=\"!!$ctrl.isValid\">\n" +
    "    <div class=\"bk-related-link-viewer\" ng-if=\"!$ctrl.inEditorMode\">\n" +
    "        <div class=\"bk-related-link-list\">\n" +
    "            <metadata-list-page bk-ctrl=\"$ctrl.relatedLinkListController\" class=\"bk-vertical-flex-container-sized\">\n" +
    "            </metadata-list-page>\n" +
    "        </div>\n" +
    "        <bk-secondary-button text=\"{{strings.relatedLink.createLink }}\" ng-click=\"$ctrl.showEditorComponent()\" class=\"bk-add-related-link-button\" icon=\"bk-style-icon-small-plus\">\n" +
    "        </bk-secondary-button>\n" +
    "    </div>\n" +
    "    <bk-related-link-editor ng-if=\"!!$ctrl.inEditorMode\" bk-ctrl=\"$ctrl.editorComponent\">\n" +
    "    </bk-related-link-editor>\n" +
    "</div>\n" +
    "<div ng-if=\"!$ctrl.isValid\" class=\"bk-no-content\">\n" +
    "    <div class=\"bk-no-content-icon\"></div>\n" +
    "    <div class=\"bk-no-content-label\">\n" +
    "        {{ $ctrl.emptyMessage }}\n" +
    "    </div>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/modules/related-link/editor/related-link-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/related-link/editor/related-link-popup.html",
    "<div class=\"bk-related-link-popup\">\n" +
    "     <div class=\"bk-big-popup\" hide=\"$ctrl.hide\">\n" +
    "        <div class=\"bk-context-dialog\">\n" +
    "            <div class=\"popup-header\">\n" +
    "                <span ng-bind-html=\"$ctrl.relatedLinkListViewerComponent.headerTitle\"></span>\n" +
    "                <a type=\"button\" class=\"bk-close\" ng-click=\"$ctrl.hide()\">&times;</a>\n" +
    "            </div>\n" +
    "            <bk-related-link-list-viewer bk-ctrl=\"$ctrl.relatedLinkListViewerComponent\" class=\"popup-content\">\n" +
    "            </bk-related-link-list-viewer>\n" +
    "        </div>\n" +
    "     </div>\n" +
    "</div>");
}]);

angular.module("src/modules/related-link/filter/runtime-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/related-link/filter/runtime-filter.html",
    "<div class=\"bk-runtime-filter-panel\">\n" +
    "    <div class=\"bk-filter-panel\" ng-class=\"{'bk-read-only': $ctrl.isReadOnly}\">\n" +
    "        <ul class=\"bk-filter-list-items\">\n" +
    "            <li class=\"bk-filter-list-item\" ng-repeat=\"filter in $ctrl.runtimeFilterList\">\n" +
    "                <div popover-append-to-body=\"true\" popover-placement=\"bottom-left\" class=\"bk-filter-container\" popover-class=\"bk-filter-panel-popover\">\n" +
    "                    <div class=\"filter-title-text\" blink-tooltip=\"{{ filter.name }}\" auto-tooltip-style=\"bootstrap\">\n" +
    "                        {{ filter.name }}\n" +
    "                    </div>\n" +
    "                    <div class=\"filter-value-text\" blink-tooltip=\"{{ filter.value }}\" auto-tooltip-style=\"bootstrap\">\n" +
    "                        {{ filter.value }}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/related-link/related-link.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/related-link/related-link.html",
    "<div class=\"bk-related-link\" ng-switch=\"$ctrl.isConfigurationValid()\">\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-invalid-related-link-config\">\n" +
    "        {{ $ctrl.getInvalidConfigurationMessage() }}\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"true\" class=\"bk-related-link-content-container\">\n" +
    "        <div class=\"bk-related-link-filter-selector\" ng-if=\"!!$ctrl.runtimeFilterChoices && $ctrl.runtimeFilterChoices.length > 0\">\n" +
    "            <div class=\"bk-related-link-title\">\n" +
    "                <caption>\n" +
    "                    {{strings.relatedLink.availableFilters}}\n" +
    "                    {{\" ( \"}}\n" +
    "                    {{strings.relatedLink.generatedFrom}}\n" +
    "                    {{\" '\"}}{{$ctrl.relatedLinkName}}\n" +
    "                    {{\"' ):\"}}</caption>\n" +
    "            </div>\n" +
    "            <div class=\"bk-related-link-filter-choice\">\n" +
    "                <span class=\"bk-select-box\">\n" +
    "                    <ui-select ng-model=\"$ctrl.selectedFilterComponent\" on-select=\"$ctrl.onFilterRowClicked()\" search-enabled=\"false\" theme=\"select2\">\n" +
    "                        <ui-select-match placeholder=\"{{$ctrl.getSelectRowAsRunTimeFilterMessage()}}\">\n" +
    "                            <bk-runtime-filter bk-ctrl=\"$ctrl.selectedFilterComponent\">\n" +
    "                            </bk-runtime-filter>\n" +
    "                        </ui-select-match>\n" +
    "                        <ui-select-choices repeat=\"runtimeFilter in $ctrl.runtimeFilterChoices\">\n" +
    "                            <runtime-filter bk-ctrl=\"runtimeFilter\">\n" +
    "                            </runtime-filter>\n" +
    "                        </ui-select-choices>\n" +
    "                    </ui-select>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <pinboard-page ng-if=\"$ctrl.isFilterRowSelected()\" class=\"bk-pinboard-page\" ng-class=\"{'single-viz-mode': $ctrl.singleVizMode}\" hide-panel=\"true\" dont-watch-url=\"true\" id=\"$ctrl.pinboardId\" pinboard-page-config=\"$ctrl.pinboardPageConfig\">\n" +
    "        </pinboard-page>\n" +
    "        <div ng-if=\"!$ctrl.isFilterRowSelected()\" class=\"bk-invalid-related-link-config\">\n" +
    "            {{ strings.relatedLink.selectRunTimeFilter }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/row-level-security/rls-rule-editor/rls-rule-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/row-level-security/rls-rule-editor/rls-rule-editor.html",
    "<div class=\"bk-rule-editor\">\n" +
    "\n" +
    "    <div class=\"bk-editor-content\">\n" +
    "        <div class=\"bk-editor-header\">\n" +
    "            <div ng-if=\"ruleModel.canEditJoinPath()\" ng-click=\"editJoinPath()\" blink-tooltip=\"{{strings.rlsRuleEditor.EDIT_JOIN_PATH}}\" class=\"bk-edit-jp-btn\">\n" +
    "            </div>\n" +
    "            <div blink-content-editable fullspan disallow-empty ng-model=\"props.name\" description=\"props.desc\" placeholder=\"getPlaceholder()\" class=\"bk-rule-name\"></div>\n" +
    "\n" +
    "            <div class=\"bk-rule-assistant-link\" ng-click=\"showRuleAssistant()\">\n" +
    "                <span class=\"bk-style-icon-formulae-assistant\"></span>\n" +
    "                <span>{{strings.rlsRuleEditor.RULE_ASSISTANT}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-editor-body\">\n" +
    "            <expression-editor expression-editor-model=\"::expressionEditorModel\" on-valid-expression=\"onValidRule(expressionEditorModel)\" on-invalid-expression=\"onInvalidRule()\">\n" +
    "            </expression-editor>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <formula-assistant title=\"strings.rlsRuleEditor.RULE_ASSISTANT\" data=\"examplesTreeData\" on-close=\"closeRuleAssistant()\" blink-draggable blink-draggable-handle=\".bk-formula-assistant-header\" class=\"bk-rule-assistant-container\" ng-if=\"props.isRuleAssistantOpen\">\n" +
    "    </formula-assistant>\n" +
    "    <div class=\"bk-editor-footer\">\n" +
    "        <div class=\"error-message\" ng-show=\"!!saveError\">\n" +
    "            <span>{{ saveError.message }}</span>\n" +
    "            <a ng-if=\"!!saveError.customData.traceId\" ng-click=\"saveError.customData.downloadTrace()\">{{strings.alertService.DOWNLOAD_TRACE}}</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <bk-secondary-button class=\"bk-padding-right-10 bk-cancel-btn\" text=\"{{strings.CANCEL}}\" ng-click=\"onCancel()\"></bk-secondary-button>\n" +
    "        <bk-primary-button class=\"bk-confirm-btn\" is-disabled=\"!isSaveRuleEnabled()\" text=\"{{strings.SAVE}}\" ng-click=\"saveRule()\"></bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/row-level-security/row-level-security.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/row-level-security/row-level-security.html",
    "<div class=\"row-level-security-container\" ng-switch=\"$ctrl.areRulesDefined()\">\n" +
    "    <div class=\"bk-rls-rules-container\" ng-switch-when=\"true\">\n" +
    "        <div class=\"bk-rls-header\">\n" +
    "            <div ng-bind-html=\"$ctrl.strings.RLS_DESCRIPTION\">\n" +
    "            </div>\n" +
    "            <bk-secondary-button text=\"Add\" icon=\"bk-style-icon-small-plus\" class=\"fr bk-rls-add-btn\" ng-click=\"$ctrl.addUpdateRule()\"></bk-secondary-button>\n" +
    "        </div>\n" +
    "        <actionable-list class=\"bk-rls-rules-list\" list-model=\"$ctrl.listModel\" on-row-click=\"$ctrl.onRowClick\" action-items=\"$ctrl.getActionBtns()\"></actionable-list>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-rls-help-container\">\n" +
    "        <div class=\"rls-explain-content\"> {{ $ctrl.strings.EXPLAIN_RLS }}</div>\n" +
    "        <bk-secondary-button text=\"{{ $ctrl.strings.ADD_RULE }}\" icon=\"bk-style-icon-small-plus\" class=\"bk-rls-add-btn\" ng-click=\"$ctrl.addUpdateRule()\"></bk-secondary-button>\n" +
    "        <div class=\"help-assistant\">\n" +
    "            <div class=\"assistant-image\">\n" +
    "            </div>\n" +
    "            <div class=\"rls-help-text\">\n" +
    "                <div ng-bind-html=\"$ctrl.strings.EXAMPLE1\"></div>\n" +
    "                <div class=\"img-example1\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-content-format.html\">\n" +
    "    <div class=\"bk-overflow-ellipsis bk-name-text\"\n" +
    "         blink-tooltip=\"{{column.format(row)}}\"\n" +
    "         auto-tooltip-style=\"bootstrap\">\n" +
    "        {{column.format(row)}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-date-format.html\">\n" +
    "    <div class=\"bk-clock-icon\"></div><div class=\"bk-time-author-label\">{{column.format(row)}}</div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"metadata-list-author-format.html\">\n" +
    "    <blink-profile-pic user-id=\"column.format(row)[0]\"\n" +
    "                       user-display-name=\"column.format(row)[1]\"\n" +
    "                       class=\"bk-profile-pic\">\n" +
    "    </blink-profile-pic>\n" +
    "</script>");
}]);

angular.module("src/modules/sage/data-panel/answer-formula-panel-component/answer-formula-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/answer-formula-panel-component/answer-formula-list.html",
    "<li class=\"bk-source-item bk-clickable\" ng-if=\"shouldShowFormulaList()\">\n" +
    "\n" +
    "    <div class=\"bk-source-header\" ng-click=\"isExpanded = !isExpanded\">\n" +
    "        <span class=\"bk-expand-btn-light-bg bk-clickable\" ng-class=\"{'bk-arrow-collapsed ': !isExpanded, 'bk-arrow-expanded': isExpanded}\">\n" +
    "        </span>\n" +
    "        <span class=\"bk-source-name bk-label bk-overflow-ellipsis\">{{strings.Formulas}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-formulae\" ng-class=\"{'bk-read-only': isReadOnly()}\" ng-if=\"isExpanded\">\n" +
    "        <div class=\"bk-list\">\n" +
    "            <ul class=\"bk-columns-list bk-list-items\">\n" +
    "                <li class=\"bk-column-item bk-clickable bk-list-item\" ng-repeat=\"formula in getFormulaList()\">\n" +
    "                    <div>\n" +
    "                        <span class=\"bk-style-icon-x bk-actionable-icon\" data-delay=\"{&quot;show&quot;: &quot;750&quot;, &quot;hide&quot;: &quot;0&quot;}\" blink-tooltip=\"Remove Formula\" ng-click=\"$event.stopPropagation(); removeFormula(formula)\" ng-dblclick=\"$event.stopPropagation()\">\n" +
    "                        </span>\n" +
    "                            <span class=\"bk-label bk-overflow-ellipsis bk-column-name\" blink-tooltip=\"{{formula.getName()}}\" ng-dblclick=\"onFormulaDblClick(formula)\">{{ formula.getName() }}</span>\n" +
    "                            <span class=\"bk-style-icon-edit bk-actionable-icon\" ng-click=\"onFormulaClick(formula)\"></span>\n" +
    "                    </div>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</li>");
}]);

angular.module("src/modules/sage/data-panel/bulk-sage-data-columns/bulk-sage-data-columns.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/bulk-sage-data-columns/bulk-sage-data-columns.html",
    "<div class=\"bk-sage-data-columns bk-bulk-data-columns\" ng-class=\"{'bk-read-only': panelComponent.isReadOnly()}\" blink-overlay=\"onFocusOut()\">\n" +
    "    <div class=\"bk-search-wrapper\">\n" +
    "        <input class=\"bk-search-input\" type=\"text\" ng-model=\"colItemFilter\" spellcheck=\"false\" placeholder=\"Search Columns\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-bulk-columns-container\" ng-controller=\"GroupedColumnsController\">\n" +
    "        <div class=\"bk-columns-body-section\" ng-class=\"{'bk-loading': isLoadingColumns()}\">\n" +
    "            <div class=\"bk-source-list-wrapper\">\n" +
    "                <ul class=\"bk-source-list\">\n" +
    "                    <li class=\"bk-source-item bk-clickable\" ng-repeat=\"sourceObj in selectedSources\" post-repeat ng-click=\"onGroupClick(sourceObj)\" ng-show=\"isSourceAccessible(sourceObj.sourceId) && sourceObj.filteredColumns.length\">\n" +
    "                        <div class=\"bk-source-header\">\n" +
    "                            <span class=\"bk-expand-btn-light-bg bk-clickable\" ng-class=\"{'bk-arrow-collapsed ': !sourceObj.expanded, 'bk-arrow-expanded': sourceObj.expanded}\" ng-click=\"$event.stopPropagation(); toggleGroup(sourceObj.sourceId, sourceObj)\"></span>\n" +
    "                            <span class=\"bk-source-name bk-label bk-overflow-ellipsis\" blink-tooltip=\"{{sourceObj.tooltip}}\" data-html=\"true\" auto-tooltip-style=\"bootstrap\" data-placement=\"right\">\n" +
    "                                {{ sourceObj.sourceName }}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-list\" ng-switch=\"sourceObj.expanded\">\n" +
    "                            <ul ng-switch-when=\"true\" class=\"bk-columns-list bk-list-items\" blink-selectable=\"{ modelGetter: 'col' }\" on-selection-change=\"onSelectionChange($model, sourceObj.sourceId)\" on-custom-dbl-click=\"addColumn($model)\" id=\"{{sourceObj.sourceId}}\">\n" +
    "                                <li class=\"bk-column-item bk-clickable bk-list-item\" ng-repeat=\"col in sourceObj.filteredColumns\">\n" +
    "                                    <span class=\"bk-label bk-overflow-ellipsis bk-column-name\" blink-tooltip=\"{{col.getTooltipInformationModel().getTemplate()}}\" data-html=\"true\" auto-tooltip-style=\"bootstrap\" data-placement=\"right\">{{ col.getName() }}</span>\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <bk-secondary-button text=\"{{ addColumnsBtnLabel }}\" icon=\"bk-style-icon-small-plus\" ng-show=\"shouldShowAddBulkColumnsBtn()\" ng-click=\"addSelectedColumns()\" class=\"bk-add-columns-btn\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/data-panel/columns-panel-component/bulk-columns-panel-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/columns-panel-component/bulk-columns-panel-component.html",
    "<bulk-sage-data-columns class=\"bk-bulk-columns\" component=\"panelComponent\"></bulk-sage-data-columns>");
}]);

angular.module("src/modules/sage/data-panel/columns-panel-component/columns-panel-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/columns-panel-component/columns-panel-component.html",
    "<sage-data-columns class=\"bk-vertical-flex-container-sized\" component=\"panelComponent\" column-panel-component-config=\"columnPanelComponentConfig\">\n" +
    "</sage-data-columns>");
}]);

angular.module("src/modules/sage/data-panel/formula-panel-component/formula-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/formula-panel-component/formula-list.html",
    "<div class=\"bk-formula-list\">\n" +
    "    <div class=\"bk-title-header\">\n" +
    "        <div class=\"bk-section-title\">{{ getTitle() }}</div>\n" +
    "        <bk-icon-button icon=\"bk-style-icon-small-plus\" is-disabled=\"!hasWorksheetModel()\" tooltip=\"headerAddButtonTooltip()\" ng-show=\"showHeaderAddButton()\" ng-click=\"onAddButtonClick()\" class=\"header-add-button\"></bk-icon-button>\n" +
    "    </div>\n" +
    "    <div class=\"bk-formulae\" blink-scroll ng-class=\"{'bk-read-only': isReadOnly()}\">\n" +
    "        <ul class=\"bk-formula-list\">\n" +
    "            <li class=\"bk-formula-list-item\" ng-repeat=\"formula in getFormulae()\" post-repeat>\n" +
    "                <div class=\"bk-formula-list-item-content\">\n" +
    "                    <span class=\"bk-style-icon-x bk-actionable-icon\" data-delay=\"{&quot;show&quot;: &quot;750&quot;, &quot;hide&quot;: &quot;0&quot;}\" blink-tooltip=\"Remove Formula\" ng-click=\"$event.stopPropagation();removeFormulaFromContext(formula)\" ng-dblclick=\"$event.stopPropagation()\">\n" +
    "                    </span>\n" +
    "                    <span class=\"bk-label bk-overflow-ellipsis bk-column-name\" blink-tooltip=\"{{ formula.getName() }}\" ng-dblclick=\"addFormulaToWorksheet(formula)\">\n" +
    "                        {{ formula.getName() }}\n" +
    "                    </span>\n" +
    "                    <span class=\"bk-style-icon-edit bk-actionable-icon\" ng-click=\"onFormulaEdit(formula)\">\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/data-panel/formula-panel-component/formulae-panel-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/formula-panel-component/formulae-panel-component.html",
    "<formula-list read-only=\"!panelComponent.isEditingAllowed()\" worksheet-model=\"panelComponent.getDocumentConfig().model\" data-sources=\"panelComponent.getDataSources()\" document-config=\"panelComponent.getDocumentConfig()\" blink-overlay=\"onFocusOut()\">\n" +
    "</formula-list>");
}]);

angular.module("src/modules/sage/data-panel/sage-data-columns/sage-data-columns.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/sage-data-columns/sage-data-columns.html",
    "<div class=\"bk-sage-data-columns bk-bulk-data-columns bk-highlight-area\" ng-class=\"{'bk-read-only': panelComponent.isReadOnly()}\" ng-click=\"colPanel.deselectAll()\" blink-overlay=\"colPanel.deselectAll()\">\n" +
    "    <div class=\"bk-search-wrapper\" ng-click=\"$event.stopPropagation()\">\n" +
    "        <input class=\"bk-search-input\" type=\"text\" ng-model=\"colPanel.searchText\" ng-change=\"onColumnPanelSearchTextChange()\" spellcheck=\"false\" placeholder=\"Search Columns\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-columns-body-section\" ng-class=\"{ 'bk-loading': colPanel.isLoading() }\">\n" +
    "        <div ng-if=\"colPanel.dataSources.length > 0 && !colPanel.isLoading()\" class=\"bk-source-list-wrapper\">\n" +
    "            <ul class=\"bk-source-list\">\n" +
    "                <li class=\"bk-source-item\" ng-repeat=\"source in colPanel.dataSources track by source.getId()\" post-repeat id=\"{{ source.getId() }}\" ng-click=\"$event.stopPropagation()\" ng-class=\"{'bk-disabled': !source.isAccessible()}\" ng-show=\"source.hasAnyFilteredColumns()\">\n" +
    "                    <div class=\"bk-source-header-container\">\n" +
    "                        <div class=\"bk-source-header bk-clickable\" blink-tooltip=\"{{!source.isAccessible() ? 'This source cannot work with your search.' : source.getMetadataInfo().getTemplate()}}\" data-html=\"true\" data-delay=\"{&quot;show&quot;:&quot;750&quot;}\" data-placement=\"right\" ng-click=\"source.toggleExpansion()\">\n" +
    "                            <span class=\"bk-expand-btn-light-bg bk-clickable\" ng-class=\"{'bk-arrow-collapsed ': !source.isExpanded(), 'bk-arrow-expanded': source.isExpanded()}\"></span>\n" +
    "                            <span class=\"bk-source-name bk-label bk-overflow-ellipsis\">\n" +
    "                                {{ source.getName() }}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                        <span class=\"bk-icon bk-style-icon-link\" ng-click=\"source.launchRelationshipEditor()\" ng-if=\"isInQueryOnQueryMode()\"></span>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-list\" ng-lazy-show=\"source.isExpanded()\" ng-switch=\"source.hasNestedSubsources()\">\n" +
    "                        <div ng-switch-when=\"false\">\n" +
    "                            <ul class=\"bk-columns-list bk-list-items\">\n" +
    "                                <li class=\"bk-column-item bk-list-item\" ng-repeat=\"column in source.getFilteredColumns()\" ng-include=\"'columnList'\">\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                        <div ng-switch-when=\"true\">\n" +
    "                            <ul class=\"bk-columns-list bk-list-items\">\n" +
    "                                <li class=\"bk-column-item\" ng-repeat=\"(srcTable, columns) in source.getColumnsByColumnSource()\">\n" +
    "                                    <div class=\"bk-clickable\" ng-click=\"columns.isExpanded = !columns.isExpanded\">\n" +
    "                                        <span class=\"bk-expand-btn-light-bg\" ng-class=\"{'bk-arrow-collapsed ': !columns.isExpanded, 'bk-arrow-expanded': columns.isExpanded}\"></span>\n" +
    "                                        <span class=\"bk-source-name bk-label bk-overflow-ellipsis\">\n" +
    "                                            {{ srcTable.toLowerCase() }}\n" +
    "                                        </span>\n" +
    "                                    </div>\n" +
    "                                    <ul ng-show=\"columns.isExpanded\">\n" +
    "                                        <li class=\"bk-column-item bk-list-item\" ng-repeat=\"column in columns track by column.getId()\" ng-include=\"'columnList'\">\n" +
    "                                        </li>\n" +
    "                                    </ul>\n" +
    "                                </li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </li>\n" +
    "                <answer-formula-list ng-if=\"showFormulas\" formula-handler=\"columnPanelComponentConfig.formulaHandler\" on-success=\"addColumnSuccessHandler\" sage-client=\"panelComponent.getSageClient()\">\n" +
    "                </answer-formula-list>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "        <div ng-if=\"colPanel.showNoSourcePlaceholder()\" class=\"bk-no-sources-placeholder\">\n" +
    "            {{noSourcesPlaceholderString}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-columns-footer-section\" ng-hide=\"colPanel.disallowColumnAddition() || !colPanel.canShowAddColumns()\">\n" +
    "        <bk-secondary-button text=\"{{ addColumnsBtnLabel }}\" icon=\"bk-style-icon-small-plus\" ng-click=\"colPanel.addSelectedColumns(); colPanel.deselectAll()\" tooltip=\"{{colPanel.getColumnAdditionNotAllowedReason()}}\" tooltip-placement=\"top\" class=\"bk-add-columns-btn\"></bk-secondary-button>\n" +
    "        <a ng-click=\"colPanel.deselectAll()\" class=\"bk-clear-all-columns\">{{strings.Clear}}</a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"columnList\">\n" +
    "        <div\n" +
    "            id=\"{{ column.getId() }}\"\n" +
    "            class=\"bk-clickable\"\n" +
    "            ng-class=\"column.getCssList()\"\n" +
    "            blink-tooltip = \"{{ colPanel.getColumnTooltip(column) || '' }}\"\n" +
    "            blink-changeable-tooltip=\"true\"\n" +
    "            data-html=\"true\"\n" +
    "            data-delay='{\"show\": \"750\"}'\n" +
    "            data-placement=\"right\"\n" +
    "            ng-click=\"$event.stopPropagation(); colPanel.onColumnClick(column, source)\"\n" +
    "            ng-dblclick=\"colPanel.onColumnDblClick(column)\">\n" +
    "            <div class=\"bk-column-left-actions\">\n" +
    "                <div class=\"bk-style-icon-checkmark\" ng-show=\"column.isInUse() && !column.isUpdating()\"></div>\n" +
    "                <div class=\"bk-style-icon-x bk-actionable-icon\" ng-show=\"column.isInUse() && !column.isUpdating()\"\n" +
    "                     data-delay='{\"show\": \"750\", \"hide\": \"0\"}' blink-tooltip=\"Remove column\"\n" +
    "                     ng-click=\"$event.stopPropagation(); colPanel.removeColumn(column)\"\n" +
    "                     ng-dblclick=\"$event.stopPropagation()\"></div>\n" +
    "                <div class=\"bk-working\" ng-show=\"column.isUpdating()\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-label bk-overflow-ellipsis bk-column-name\">{{ column.getName() }}</div>\n" +
    "            <div class=\"bk-style-icon-filter bk-actionable-icon\"\n" +
    "                  ng-show=\"!colPanel.isFilterUpdating()\"\n" +
    "                  data-delay='{\"show\": \"750\", \"hide\": \"0\"}' blink-tooltip=\"Add filter\"\n" +
    "                  ng-click=\"$event.stopPropagation(); column.addFilter()\"\n" +
    "                  ng-dblclick=\"$event.stopPropagation()\"></div>\n" +
    "            <div class=\"bk-filter-working\"\n" +
    "                  ng-show=\"column.isFilterUpdating()\"\n" +
    "                  ng-click=\"$event.stopPropagation()\"\n" +
    "                  ng-dblclick=\"$event.stopPropagation()\"></div>\n" +
    "        </div>\n" +
    "</script>");
}]);

angular.module("src/modules/sage/data-panel/sage-data.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/sage-data.html",
    "<div class=\"bk-sage-data\" ng-class=\"[panel.getTopLevelCssClass(), panel.getExpansionClass()]\" blink-on-animation-end=\"onPanelAnimationDone()\">\n" +
    "    <div class=\"bk-header-container\" ng-click=\"onHeaderClick()\">\n" +
    "        <div class=\"header-text\">{{getHeaderText()}}</div>\n" +
    "        <div class=\"header-arrow {{getHeaderIconClass()}}\"></div>\n" +
    "    </div>\n" +
    "    <div uib-popover-template=\"'addSourcesPopover.html'\" ng-if=\"showAddSourcesPopover\" popover-is-open=\"true\" popover-append-to-body=\"true\" popover-placement=\"right\" popover-class=\"bk-add-sources-popover\">\n" +
    "    </div>\n" +
    "    <div ng-repeat=\"panelComponent in panel.getComponents()\" class=\"bk-sage-data-component {{ panelComponent.getComponentClass() }}\">\n" +
    "        <div ng-if=\"panelComponent.isOutOfFlow()\" class=\"bk-out-of-flow-panel-component\" ng-include=\"panelComponent.getTemplateUrl()\">\n" +
    "        </div>\n" +
    "        <div ng-if=\"!panelComponent.isOutOfFlow()\" class=\"bk-in-flow-panel-component\" ng-include=\"panelComponent.getTemplateUrl()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"addSourcesPopover.html\">\n" +
    "        <div blink-overlay=\"hideAddSourcesPopover()\">\n" +
    "            <div class=\"bk-header\">{{ strings.dataPanel.popover.ADD_SOURCES }}</div>\n" +
    "            <div class=\"bk-popup-text\">\n" +
    "                {{ strings.dataPanel.popover.SELECT_DATA_SOURCES }}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/data-panel/sources-panel-component/data-scope.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/sources-panel-component/data-scope.html",
    "<div class=\"bk-data-scope bk-sage-data-sources-open\" ng-class=\"{'bk-read-only': panelComponent.isReadOnly()}\">\n" +
    "    <div class=\"header clearfix\">\n" +
    "        <div class=\"fl\">\n" +
    "            <span class=\"bk-text-white\">{{strings.Sources}}</span>\n" +
    "        </div>\n" +
    "        <div class=\"fr\">\n" +
    "            <bk-secondary-button text=\"{{ strings.DONE }}\" ng-click=\"panelComponent.collapse()\" class=\"close-popover\"></bk-secondary-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"body\">\n" +
    "        <div class=\"left-pane\">\n" +
    "            <div class=\"body-lt\" ng-show=\"panelComponent.documentHasUnderlyingDataAccess()\">\n" +
    "                <div class=\"bk-light-text-14px bk-clickable bk-filter\" ng-click=\"onSelectionFilterChanged(false)\" ng-class=\"{'bk-selected-filter': !listOfLabelFilters.length && !isSelectedFilterApplied}\">{{strings.All}}\n" +
    "</div>\n" +
    "                <div class=\"bk-light-text-14px bk-clickable bk-filter\" ng-click=\"onSelectionFilterChanged(true)\" ng-class=\"{'bk-selected-filter': !listOfLabelFilters.length && isSelectedFilterApplied}\"><span>{{strings.Selected}}</span>{{ getSelectedSourcesCount() }})\n" +
    "                </div>\n" +
    "                <div class=\"bk-label-container\">\n" +
    "                    <labels-panel readonly=\"readonly\" on-label-click=\"onLabelClicked($label)\" ng-model=\"labelsRegistry\"></labels-panel>\n" +
    "                </div>\n" +
    "                <div class=\"bk-explore-data\">\n" +
    "                    <bk-secondary-button text=\"{{ strings.exploreAllData }}\" is-disabled=\"hasAccessToNoDataSources()\" ng-click=\"showExplorer()\"></bk-secondary-button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    <div class=\"right-pane\">\n" +
    "        <div class=\"header-rt\">\n" +
    "            <div class=\"fl\" ng-switch=\"!listOfLabelFilters.length && isSelectedFilterApplied\">\n" +
    "                <div ng-switch-when=\"false\" class=\"bk-select-all\" ng-show=\"hasItems(pageFilter)\">\n" +
    "                    <bk-checkbox bk-ctrl=\"selectAllCheckboxCtrl\"></bk-checkbox>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"true\" class=\"bk-clear-selections\">\n" +
    "                    <a class=\"bk-text-blue\" ng-show=\"!noItemsSelected(pageFilter)\" ng-click=\"!clearItemsSelection(pageFilter, $event)\">{{strings.Clear_Selections}}</a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-search fr\">\n" +
    "                <input class=\"bk-search-input\" type=\"text\" ng-model=\"searchText\" spellcheck=\"false\" placeholder=\"Filter by Name\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "            <div class=\"body-rt\">\n" +
    "                <div ng-switch=\"getSourcesAvailabilityState()\">\n" +
    "                    <div class=\"bk-waiting-data-sources\" ng-switch-when=\"WAITING\">\n" +
    "                        <blink-loading-indicator></blink-loading-indicator>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-no-data-sources\" ng-switch-when=\"ERROR\">\n" +
    "                        <div class=\"bk-no-tables-message\">\n" +
    "{{strings.Oops_There_was}}\n" +
    "</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-no-data-sources\" ng-switch-when=\"NONE\">\n" +
    "                        <div class=\"bk-style-icon-password bk-icon\"></div>\n" +
    "                        <div ng-switch=\"hasAdminPrivileges\" class=\"bk-no-tables-message\">\n" +
    "                            <div ng-switch-when=\"true\">{{strings.There_is_no}}</div>\n" +
    "                            <div ng-switch-when=\"false\">{{strings.You_dont_have}}<br>{{strings.Please_contact_your}}\n" +
    "</div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div ng-switch-when=\"AVAILABLE\">\n" +
    "                        <div ng-switch=\"hasItems(visibilityFilter)\">\n" +
    "                            <div ng-switch-when=\"false\" class=\"bk-no-data-sources\">\n" +
    "                                <div class=\"bk-style-icon-password bk-icon\"></div>\n" +
    "                                <div>{{strings.No_matched}}</div>\n" +
    "                            </div>\n" +
    "                            <div ng-switch-when=\"true\">\n" +
    "                                <div ng-repeat=\"list in lists\" post-repeat class=\"bk-list\" ng-show=\"list.data.filter(visibilityFilter).length > 0\">\n" +
    "                                    <span class=\"bk-list-header\">{{ list.headerLabel }}</span>\n" +
    "                                    <ul>\n" +
    "                                        <li class=\"bk-list-item bk-overflow-ellipsis bk-link\" ng-class=\"{'bk-selected': tempSelectedIdsMap[item.id]}\" blink-tooltip=\"{{item.tooltip}}\" test-hook-table-id=\"{{item.id}}\" data-html=\"true\" data-delay=\"{&quot;show&quot;:&quot;750&quot;}\" ng-repeat=\"item in list.data | filter: visibilityFilter\">\n" +
    "                                            <div ng-show=\"!panelComponent.isReadonly()\">\n" +
    "                                                <div ng-repeat=\"tag in item.tags\" class=\"bk-stackable-label\" ng-style=\"{'background-color': tag.clientState && tag.clientState.color,\n" +
    "                                                    'right': (5 + $index * 4) + 'px'}\"></div>\n" +
    "                                            </div>\n" +
    "                                            <div>\n" +
    "                                                <bk-checkbox bk-ctrl=\"item.checkboxCtrl\"></bk-checkbox>\n" +
    "                                            </div>\n" +
    "                                        </li>\n" +
    "                                    </ul>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "            <div class=\"bk-panel-footer\" ng-class=\"{'bk-with-join-type-selector': needsJoinTypeFooter}\" ng-switch=\"needsJoinTypeFooter\">\n" +
    "                <div ng-switch-when=\"true\" ng-switch=\"!panelComponent.isReadOnly()\">\n" +
    "                    <div ng-switch-when=\"true\">\n" +
    "                        <span class=\"bk-light-text-13px\">{{strings.Choose_the}}</span>\n" +
    "                        <p></p>\n" +
    "                        \n" +
    "                        <div class=\"bk-join-type-selector\" ng-repeat=\"queryTypeData in worksheetQueryTypes\" ng-class=\"{'bk-selected': queryTypeData.radioBtnCtrl.isSelected()}\">\n" +
    "                            <bk-radio-button bk-ctrl=\"queryTypeData.radioBtnCtrl\">\n" +
    "                            </bk-radio-button>\n" +
    "                            <div class=\"bk-join-type-desc\">({{ queryTypeData.description }})</div>\n" +
    "                        </div>\n" +
    "                        <p></p>\n" +
    "                        <span class=\"bk-light-text-13px\">{{strings.Choose_the_worksheet}}</span>\n" +
    "                        <p></p>\n" +
    "                        <div ng-repeat=\"wTypeButtonCtrl in worksheetTypes\">\n" +
    "                            <bk-radio-button bk-ctrl=\"wTypeButtonCtrl\">\n" +
    "                            </bk-radio-button>\n" +
    "                        </div>\n" +
    "                        <div ng-switch-default>\n" +
    "                            <span class=\"bk-light-text-13px\">{{strings.Inclusion_rule_is}}</span>\n" +
    "                            <p></p>\n" +
    "                            <span class=\"bk-dark-title-14px\">{{ getCurrentQueryTypeLabel() }}&nbsp;({{ getCurrentQueryTypeDescription() }})</span>\n" +
    "                            <p></p>\n" +
    "                            <span class=\"bk-light-text-13px\">{{strings.Worksheet_join_rule}}</span>\n" +
    "                            <p></p>\n" +
    "                            <span class=\"bk-dark-title-14px\">{{ getCurrentWorksheetTypeLabel() }}</span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div></div>");
}]);

angular.module("src/modules/sage/data-panel/sources-panel-component/sage-data-sources.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/sources-panel-component/sage-data-sources.html",
    "<div class=\"bk-sage-data-sources-old\" ng-class=\"{'bk-read-only': panelComponent.isReadOnly()}\">\n" +
    "    <div class=\"bk-explore-link-old bk-link\" ng-show=\"panelComponent.isExpanded()\" ng-click=\"showExplorer()\">\n" +
    "{{strings.Explore_all}}\n" +
    "</div>\n" +
    "    <div class=\"bk-sage-data-sources-dialog\" blink-on-escape=\"panelComponent.collapse()\" blink-overlay=\"panelComponent.collapse()\" ignore-click-selector=\"'.bk-sources-container'\" ng-show=\"showDialog\">\n" +
    "        <div class=\"bk-search-wrapper\">\n" +
    "            <div class=\"bk-search-icon\"></div>\n" +
    "            <input class=\"bk-search-input\" type=\"text\" ng-model=\"srcItemFilter\" spellcheck=\"false\" placeholder=\"Search sources\">\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"bk-list-wrapper\" ng-switch=\"getSourcesAvailabilityState()\">\n" +
    "            <div class=\"bk-waiting-data-sources\" ng-switch-when=\"WAITING\">\n" +
    "            </div>\n" +
    "            <div class=\"bk-no-data-sources\" ng-switch-when=\"ERROR\">\n" +
    "                <div class=\"bk-no-tables-message\">\n" +
    "{{strings.Oops_There_was}}\n" +
    "</div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-no-data-sources\" ng-switch-when=\"NONE\">\n" +
    "                <div class=\"bk-style-icon-password bk-icon\"></div>\n" +
    "                <div ng-switch=\"hasAdminPrivileges\" class=\"bk-no-tables-message\">\n" +
    "                    <div ng-switch-when=\"true\">{{strings.There_is_no}}</div>\n" +
    "                    <div ng-switch-when=\"false\">{{strings.You_dont_have}}<br>{{strings.Please_contact_your}}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-list-wrapper-inner\" ng-switch-when=\"AVAILABLE\">\n" +
    "                <div class=\"bk-list\" ng-repeat=\"list in lists\">\n" +
    "                    <div class=\"bk-list-header\">{{ list.headerLabel }}</div>\n" +
    "                    <div class=\"bk-list-select-all\" ng-click=\"selectAllItems($event, list)\">\n" +
    "                        <div class=\"bk-checkbox-container\">\n" +
    "                            <div class=\"bk-checkbox\" ng-class=\"{'bk-checked': list._selected}\"></div>\n" +
    "                        </div>\n" +
    "                        <span class=\"bk-source-name\">{{strings.Select_All}}</span>\n" +
    "                    </div>\n" +
    "                    <ul class=\"bk-list-items\">\n" +
    "                        <li class=\"bk-list-item bk-overflow-ellipsis\" ng-click=\"selectItem($event, list, item)\" ng-repeat=\"item in list.data | filter:srcItemFilter\">\n" +
    "                            <div class=\"bk-checkbox-container\">\n" +
    "                                <div class=\"bk-checkbox\" ng-class=\"{'bk-checked': tempSelectedIdsMap[item.id]}\"></div>\n" +
    "                            </div>\n" +
    "                            <span class=\"bk-source-name\">{{ item.name }}</span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-req-field-statement\" ng-show=\"!!data.hasAnyRequiredField\">{{strings.Cannot_Deselect_Already}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-panel-footer\" ng-switch=\"needsJoinTypeFooter\">\n" +
    "        <div ng-switch-when=\"true\" ng-switch=\"!panelComponent.isReadOnly()\">\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <span class=\"bk-light-text-13px\">{{strings.Choose_the}}</span>\n" +
    "                <p></p>\n" +
    "                <div class=\"bk-form-radio bk-clickable\" ng-repeat=\"queryType in worksheetQueryTypes\" ng-click=\"setCurrentQueryType(queryType)\" ng-class=\"{'bk-selected': isCurrentQueryType(queryType)}\">\n" +
    "                        <div class=\"bk-radio-button bk-radio-10\">\n" +
    "                            <div class=\"bk-radio-inner\"></div>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-radio-label bk-inline-block bk-top-aligned\">{{ queryType.label }}&nbsp;\n" +
    "                            <span class=\"bk-light-text-12px\">({{ queryType.description }})</span>\n" +
    "                        </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-switch-default>\n" +
    "                <span class=\"bk-light-text-13px\">{{strings.Inclusion_rule_is}}</span>\n" +
    "                <p></p>\n" +
    "                <span class=\"bk-dark-title-14px\">{{ getCurrentQueryTypeLabel() }}&nbsp;({{ getCurrentQueryTypeDescription() }})</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/data-panel/sources-panel-component/sources-v2-panel-component.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-panel/sources-panel-component/sources-v2-panel-component.html",
    "<div class=\"bk-manage-sources\">\n" +
    "    <bk-secondary-button text=\"{{ panelComponent.getString() }}\" ng-click=\"panelComponent.toggleExpansion()\" class=\"bk-choose-sources-btn\"></bk-secondary-button>\n" +
    "    <div class=\"bk-sources-popover\" ng-show=\"panelComponent.isExpanded()\" blink-overlay=\"panelComponent.collapse()\" blink-on-escape=\"panelComponent.collapse()\">\n" +
    "        <div class=\"bk-arrow-left\">\n" +
    "            <div class=\"bk-arrow-left-inner\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-sources-popover-inner\">\n" +
    "            <blink-data-scope component=\"panelComponent\" sources-change-callback=\"onDataSourcesChange\">\n" +
    "            </blink-data-scope>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/data-source-preview/data-source-preview.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/data-source-preview/data-source-preview.html",
    "<div class=\"bk-data-source-preview\" data-html=\"true\" data-aligned-placement=\"true\" ng-hide=\"$ctrl.hide\" blink-tooltip=\"{{$ctrl.tooltipText}}\" ng-click=\"$ctrl.onPreviewClickCallback()\">\n" +
    "    <div class=\"bk-data-source-preview-inner\">\n" +
    "        <div class=\"bk-data-source-preview-icon\"></div>\n" +
    "        <span class=\"bk-text-blue\"> {{ $ctrl.getSourcesCount() }}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/join-disambiguation/join-disambiguation.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/join-disambiguation/join-disambiguation.html",
    "<div class=\"bk-join-disambiguation\">\n" +
    "    <div class=\"bk-column bk-column-one-third\">\n" +
    "        <div ng-show=\"$ctrl.canShowHistory()\">\n" +
    "            <div class=\"bk-heading\">{{strings.You_have}}</div>\n" +
    "            <div class=\"bk-clickable bk-mjp-previous-list bk-overflow-ellipsis\" ng-class=\"{'bk-selected': $ctrl.item.question == $parent.question}\" ng-repeat=\"item in $ctrl.previousSelections\" ng-click=\"$ctrl.selectItemFromHistory(item)\">\n" +
    "                <span class=\"bk-icon bk-style-icon-checkmark bk-text-green\"></span>\n" +
    "                <span class=\"bk-label\">{{ item.text }}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-column bk-column-two-third\">\n" +
    "        <div ng-show=\"$ctrl.question.options.length\" class=\"bk-mjp-question\">\n" +
    "            <div class=\"bk-heading\" ng-show=\"$ctrl.question.prefaceText\">{{$ctrl.question.prefaceText }}<br></div>\n" +
    "            <div class=\"bk-heading\" ng-hide=\"$ctrl.question.prefaceText\">\n" +
    "                <span>{{$ctrl.strings.terminalToken_confirmation.assign({\n" +
    "                          terminal_Token: $ctrl.question.terminalToken\n" +
    "                      })}}\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"bk-mjp-options\">\n" +
    "                <div class=\"bk-mjp-option\" ng-repeat=\"radioBtnCtrl in $ctrl.question.optionCtrls\">\n" +
    "                    <bk-radio-button bk-ctrl=\"radioBtnCtrl\"></bk-radio-button>\n" +
    "                    <div class=\"bk-radio-label-secondary\" ng-show=\"option.showTableName\">&nbsp;({{ option.tableName }})</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/read-only-sage/read-only-sage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/read-only-sage/read-only-sage.html",
    "<div class=\"bk-sage bk-read-only-sage\">\n" +
    "    <form class=\"bk-sage-bar\">\n" +
    "        <span class=\"bk-style-icon-lock bk-icon\" blink-tooltip=\"You have read-only permissions\"></span>\n" +
    "        <div class=\"bk-sage-input-wrapper\" ng-click=\"onSageBarClick()\">\n" +
    "            <div class=\"bk-sage-real-input\" ng-class=\"{'bk-overflow-ellipsis': !sageExpanded}\" blink-tooltip=\"{{ queryText }}\">{{ queryText }}</div>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-bar/sage-bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-bar/sage-bar.html",
    "<div class=\"bk-sage-bar\" ng-switch=\"$ctrl.canEdit\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        <blink-sage ng-if=\"!!$ctrl.sageClient\" sage-search-on-init=\"$ctrl.sageSearchOnInit\" sage-client=\"$ctrl.sageClient\" on-force-invalid-search=\"$ctrl.onForceInvalidSearch\" on-edit=\"$ctrl.onSageEdit\" on-search-corrected=\"$ctrl.onSearchCorrected\">\n" +
    "        </blink-sage>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "        <blink-read-only-sage query-text=\"$ctrl.readOnlyText\">\n" +
    "        </blink-read-only-sage>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-bubble/sage-bubble.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-bubble/sage-bubble.html",
    "<div class=\"bk-sage-bubble-wrapper\">\n" +
    "    <div class=\"bk-sage-bubble\" ng-class=\"{ 'bk-sticky': bubbleData.isSticky,\n" +
    "                                            'bk-error': isErrorMessage(),\n" +
    "                                            'bk-warning': isWarningMessage(),\n" +
    "                                            'bk-suggestion': isSuggestionMessage()}\">\n" +
    "        <div class=\"bk-sage-bubble-content\">\n" +
    "            <div ng-bind-html=\"bubbleData.content\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-sage-bubble-close\" ng-click=\"dismissSageBubble()\">&times;</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-default-dropdown-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-default-dropdown-item.html",
    "<div ng-switch=\"list.smallMode\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        <div class=\"item-text search-result\">\n" +
    "            <span blink-tooltip=\"{{ getCompletionTooltip()(match) }}\" data-placement=\"auto right\" data-html=\"true\" data-additional-classes=\"bk-sage-suggestion-tooltip\">\n" +
    "                <span ng-class=\"{'token-error': list.type === 'ErrorQueryCompletion',\n" +
    "                             'token-warn': list.type === 'WarnQueryCompletions'}\" ng-bind-html=\"match.getNewTokensQueryString() | blinkHighlight:match.getSearchText():'matched-substring'\"></span>\n" +
    "            <span class=\"lineage\" ng-bind-html=\"getLineageDropdown()(match, true, list)\"></span>\n" +
    "            </span>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "        <div class=\"bk-icon bk-style-icon-search\"></div>\n" +
    "        <div class=\"item-text search-result\">\n" +
    "            <span>\n" +
    "                <span class=\"prefix-token\">{{ match.getPrefixTokensQueryString() }}</span>\n" +
    "                <span ng-class=\"{'token-error': list.type === 'ErrorQueryCompletion',\n" +
    "                                 'token-warn': list.type === 'WarnQueryCompletion',\n" +
    "                                 'suffix-token': !match.getSearchText(),\n" +
    "                                 'new-token': !!match.getSearchText()}\" ng-bind-html=\"match.getNewTokensQueryString() | blinkHighlight:match.getSearchText():'matched-substring'\">\n" +
    "                </span>\n" +
    "                <span class=\"lineage\" ng-bind-html=\"getLineageDropdown()(match, false, list)\"></span>\n" +
    "            </span>\n" +
    "\n" +
    "            \n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-dropdown-header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-dropdown-header.html",
    "<div class=\"bk-dropdown-list-header\" ng-switch=\"list.type\" ng-click=\"$event.stopPropagation()\">\n" +
    "    <div ng-switch-when=\"ErrorQueryCompletion\">\n" +
    "        <div class=\"header-text\">\n" +
    "            <span>{{strings.I_didnt_get}}</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"OutOfScopeCompletion\">\n" +
    "        <div class=\"header-text out-of-scope\">\n" +
    "            <span class=\"bk-style-icon-circled-information\"></span>\n" +
    "            <span ng-if=\"hasDataSources\" class=\"bk-message-text\">{{strings.No_suggestions_from}}</span>\n" +
    "            <span ng-if=\"!hasDataSources\" class=\"bk-message-text\">{{strings.No_sources}}</span>\n" +
    "        </div>\n" +
    "        <hr>\n" +
    "        <div class=\"header-text\">\n" +
    "            {{ strings.suggestions.ADDITIONAL_SOURCES }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"SynonymCompletion\">\n" +
    "        <div class=\"header-text\">\n" +
    "            {{ strings.suggestions.SYNONYMS }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"SearchHistoryCompletion\">\n" +
    "        <div class=\"header-text\">\n" +
    "            {{ strings.suggestions.SEARCH_HISTORY }}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"WarnQueryCompletion\">\n" +
    "        <div class=\"header-text\">{{strings.Multiple_matches}}</div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"EditJoinPath\" class=\"header-edit-join-path\">\n" +
    "        <a ng-click=\"list.misc && list.misc.requestJoinPathEdit()\"><span>{{strings.See_other}}</span>{{list.misc.tokenForEditMapping.getTokenTextLowerCase()}}<span>{{strings.types}}</span></a>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"ObjectResult\" class=\"header-object-results\"></div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-dropdown.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-dropdown.html",
    "<div class=\"bk-dropdown-wrapper\" ng-class=\"{ 'bk-show': isOpen()}\" ng-mousedown=\"$event.stopPropagation()\" ng-mouseenter=\"onMouseEnter()\" ng-mouseleave=\"onMouseLeave()\">\n" +
    "    <div class=\"bk-dropdown-lists\">\n" +
    "        <div ng-repeat=\"(listIndex, list) in matches\" class=\"bk-dropdown-list-wrapper {{ list.css || '' }}\">\n" +
    "            <div ng-show=\"list.items.length > 0\">\n" +
    "                <div ng-include=\"listHeaderTemplateUrl\"></div>\n" +
    "                <ul class=\"bk-dropdown-list\">\n" +
    "                <span class=\"bk-paged-dropdown-list-wrapper\">\n" +
    "                    <span blink-paged-repeat=\"match in list.items\" model=\"list.items\" page-size=\"list.paging.pageSize\" allow-expansion=\"list.paging.allowExpansion\" show-all-in-second-page=\"list.paging.showAllInSecondPage\" add-next-page=\"getMoreCompletions()\" use-virtual-scroll=\"true\" view-all-button-text=\"'View More'\">\n" +
    "                        <li ng-class=\"{active: isActive($index, listIndex), 'bk-small-mode': list.smallMode }\" ng-mouseenter=\"selectHoverState($index, listIndex)\" ng-click=\"selectMatch($index, listIndex)\">\n" +
    "                            <div ng-include=\"getItemTemplateUrl()(match, list)\"></div>\n" +
    "                        </li>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"isScrollActive()\" class=\"bk-scroll-indicator\">{{strings.Scroll_for}}</div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-feedback-dropdown-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-feedback-dropdown-item.html",
    "<div class=\"item-text feedback-item\">{{list.displayText}}</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-object-result-dropdown-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-object-result-dropdown-item.html",
    "<div class=\"bk-icon object-result\" ng-class=\"{'bk-style-icon-answer': match.isAnswer(),\n" +
    "                                                'bk-style-icon-pinboard': match.isPinboard()}\"></div>\n" +
    "<div class=\"item-text\">\n" +
    "    <span ng-bind-html=\"match.getHighlightedName() | blinkRangeHighlight:formatters.getMatchHighlightClass()\"></span>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage-dropdown/sage-search-history-dropdown-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage-dropdown/sage-search-history-dropdown-item.html",
    "<div ng-switch=\"list.smallMode\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        <div class=\"item-text history-result\">\n" +
    "            <span blink-tooltip=\"{{ getCompletionTooltip()(match) }}\" data-placement=\"auto right\" data-html=\"true\" data-additional-classes=\"bk-sage-suggestion-tooltip\">\n" +
    "                <span ng-class=\"{'token-error': list.type === 'ErrorQueryCompletion',\n" +
    "                             'token-warn': list.type === 'WarnQueryCompletions'}\" ng-bind-html=\"match.getNewTokensQueryString() | blinkHighlight:match.getSearchText():'matched-substring'\"></span>\n" +
    "            <span class=\"lineage\" ng-bind-html=\"getLineageDropdown()(match, true, list)\"></span>\n" +
    "            </span>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-default>\n" +
    "        <div class=\"bk-icon bk-style-icon-clock\"></div>\n" +
    "        <div class=\"item-text history-result\">\n" +
    "            <span>\n" +
    "                <span class=\"prefix-token\">{{ match.getPrefixTokensQueryString() }}</span>\n" +
    "                <span ng-class=\"{'token-error': list.type === 'ErrorQueryCompletion',\n" +
    "                                 'token-warn': list.type === 'WarnQueryCompletion',\n" +
    "                                 'suffix-token': !match.getSearchText(),\n" +
    "                                 'new-token': !!match.getSearchText()}\" ng-bind-html=\"match.getNewTokensQueryString() | blinkHighlight:match.getSearchText():'matched-substring'\">\n" +
    "                </span>\n" +
    "                <span class=\"lineage\" ng-bind-html=\"getLineageDropdown()(match, false, list)\"></span>\n" +
    "            </span>\n" +
    "\n" +
    "            \n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/sage/sage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sage/sage.html",
    "<div class=\"bk-sage\" ng-class=\"{'bk-active': sageBarHasFocus}\">\n" +
    "    <div class=\"bk-sage-inner\" ng-mouseenter=\"onMouseOverSageBar()\" ng-mouseleave=\"onMouseOutOfSageBar()\">\n" +
    "        <div blink-sage-bubble></div>\n" +
    "        <form class=\"bk-sage-bar\">\n" +
    "\n" +
    "            \n" +
    "            <span class=\"bk-sage-search-icon\" ng-class=\"{'bk-pressed': !!sageStickyBubbleShowing,\n" +
    "                                                         'bk-error-exists': sageClient.getSageModel().sageResponseErrorInfo.severity == 1,\n" +
    "                                                         'bk-warning-exists': sageClient.getSageModel().sageResponseErrorInfo.severity == 2}\" ng-click=\"showIntelligentAlert({force: true})\"></span>\n" +
    "            <div class=\"bk-sage-input-wrapper\">\n" +
    "                <div class=\"bk-sage-ghost-tokens\" ng-show=\"!!sageInput\" ng-class=\"{'bk-sage-hover': isMouseOverInput}\">\n" +
    "                    \n" +
    "                    <span class=\"bk-sage-ghost-token\" ng-repeat=\"(i, rtoken) in getTokens()\" ng-class=\"{'bk-unrecognized': rtoken.isUnrecognized() && !sageBarHasFocus,\n" +
    "                                     'bk-is-target-of-cursor': isTokenTargetOfCursor(rtoken, i),\n" +
    "                                    'bk-empty': rtoken.getTokenText() == '',\n" +
    "                                    'bk-nostyleinfo': !rtoken.cssProperties,\n" +
    "                                    'bk-absolute': rtoken.cssProperties && rtoken.cssProperties.position == 'absolute',\n" +
    "                                    'bk-error': isVisibleErrorToken(rtoken, i, false),\n" +
    "                                    'bk-warning': isVisibleWarningToken(rtoken, i, false),\n" +
    "                                    'bk-truncated-token': !!rtoken.truncated,\n" +
    "                                    'bk-no-jpath-token': isJoinPathWorkingToken(rtoken, i),\n" +
    "                                    'bk-error-last': isVisibleErrorToken(rtoken, i, true),\n" +
    "                                    'bk-warning-last': isVisibleWarningToken(rtoken, i, true)}\" ng-style=\"{'left': (rtoken.cssProperties && rtoken.cssProperties.left) + 'px',\n" +
    "                                     'width': (rtoken.cssProperties && rtoken.cssProperties.width) + 'px'}\">\n" +
    "                        {{ rtoken.getTokenTextLowerCase() }}\n" +
    "                    </span>\n" +
    "                    \n" +
    "                    \n" +
    "                    \n" +
    "                         \n" +
    "                         \n" +
    "                         \n" +
    "                         \n" +
    "                                   \n" +
    "                        \n" +
    "                              \n" +
    "                              \n" +
    "                              \n" +
    "                                         \n" +
    "                              \n" +
    "                        \n" +
    "                    \n" +
    "                </div>\n" +
    "                <input type=\"text\" ng-show=\"shouldShowInputGhost\" class=\"bk-sage-real-input-ghost\" ng-model=\"sageInputGhost\" ng-trim=\"false\" spellcheck=\"false\" readonly=\"readonly\" tabindex=\"-1\">\n" +
    "                <input type=\"text\" class=\"bk-sage-real-input\" ng-model=\"sageInput\" blink-overlay=\"closeDropDown()\" blink-on-escape=\"closeDropDown()\" sage-autocomplete=\"autocompleteConfig\" can-auto-close-dropdown=\"canAutoCloseDropdown\" ng-trim=\"false\" bk-ng-mouseenter=\"mouseEnterOnInput()\" bk-ng-mouseleave=\"mouseLeaveOnInput()\" ng-click=\"updateCaretState()\" spellcheck=\"false\">\n" +
    "            </div>\n" +
    "            <div ng-show=\"shouldShowBoxLayer()\" class=\"bk-boxed-token-layer\" ng-click=\"hideBoxLayer()\">\n" +
    "                <div class=\"bk-boxed-token {{ qf.getCssClass() }}\" ng-click=\"$event.stopPropagation()\" ng-class=\"{'bk-cross-hovered': mouseHoveredOnCross}\" ng-repeat=\"qf in sageClient.getSageModel().queryFragments\">\n" +
    "                    <div class=\"bk-display-text\" ng-click=\"onQueryFragmentClick($event, qf)\" ng-mouseleave=\"onMouseOutOfQueryFragment()\" ng-mouseenter=\"onMouseOverQueryFragment($event, qf)\">{{qf.getDisplayText()}}</div>\n" +
    "                    <div class=\"bk-cross-btn\" ng-mouseenter=\"mouseHoveredOnCross = true;\" ng-mouseleave=\"mouseHoveredOnCross = false;\" ng-click=\"onQueryFragmentDeletion($event, qf)\">@</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/scheduler/scheduler.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/scheduler/scheduler.html",
    "<div class=\"schedule-container\" id=\"schedule-container\">\n" +
    "    <div class=\"bk-form\">\n" +
    "        <div class=\"bk-data-row\" ng-if=\"!scheduleConfig.scheduleJob\">\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.STARTS}}</label>\n" +
    "            <input class=\"bk-start-day\" ng-model=\"scheduleConfig.startDate\" bs-datepicker date-type=\"string\" date-format=\"{{dateFormat}}\" placeholder=\"{{dateFormat}}\">\n" +
    "            <ng-include src=\"'atHourMinuteBox'\"></ng-include>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label-repeats\">{{schedulerUIText.REPEATS}}</label>\n" +
    "            <span class=\"bk-select-box bk-repeats\">\n" +
    "                <select id=\"freqid\" ng-model=\"scheduleConfig.interval\" class=\"bk-cell-content bk-selectable\" ng-options=\"interval as text for (interval, text) in schedulerUIText.intervals\" data-placeholder=\"\" chosen>\n" +
    "                    <option value=\"\"></option>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div id=\"everynminid\" ng-if=\"shouldShowOptionEveryNMins()\" ng-include=\"'everyNMin'\"></div>\n" +
    "    <div id=\"hourlyid\" ng-if=\"shouldShowOptionHourly()\" ng-include=\"'hourly'\"></div>\n" +
    "    <div id=\"dailyid\" ng-if=\"shouldShowOptionDaily()\" ng-include=\"'daily'\"></div>\n" +
    "    <div id=\"weeklyid\" ng-if=\"shouldShowOptionWeekly()\" ng-include=\"'weekly'\"></div>\n" +
    "    <div id=\"monthlyid\" ng-if=\"shouldShowOptionMonthly()\" ng-include=\"'monthly'\"></div>\n" +
    "    <div id=\"atid\" ng-if=\"shouldShowOptionAt()\" ng-include=\"'atTime'\"></div>\n" +
    "    <div ng-if=\"shouldShowStatusMessage()\" class=\"bk-form\">\n" +
    "        <hr>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                {{scheduleConfig.statusMessage}}\n" +
    "            </label>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"bk-schedule-disable\" ng-if=\"!scheduleConfig.scheduleJob && !!scheduleConfig.showDisable\">\n" +
    "    <bk-checkbox bk-ctrl=\"disableScheduleCtrl\"></bk-checkbox>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"atTime\">\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <ng-include src=\"'atHourMinuteBox'\"></ng-include>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"atHourMinuteBox\">\n" +
    "    <label class=\"bk-label\">{{schedulerUIText.AT}}</label>\n" +
    "    <span class=\"bk-select-box\">\n" +
    "        <select ng-model=\"scheduleConfig.hour\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                ng-options=\"hour for hour in uiConfig.hours\"\n" +
    "                data-placeholder=\"\"\n" +
    "                chosen>\n" +
    "        </select>\n" +
    "    </span>\n" +
    "    <label class=\"bk-label\">{{schedulerUIText.COLON}}</label>\n" +
    "    <span class=\"bk-select-box\">\n" +
    "        <select ng-model=\"scheduleConfig.min\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                ng-options=\"min for min in uiConfig.minutes\"\n" +
    "                data-placeholder=\"\"\n" +
    "                chosen>\n" +
    "            <option value=\"\">\n" +
    "            </option>\n" +
    "        </select>\n" +
    "    </span>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"everyNMin\">\n" +
    "    <!-- Repeat Frequency Options : Every N Minutes-->\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.RUN_EVERY}}</label>\n" +
    "            <span class=\"bk-select-box bk-frequency\">\n" +
    "                <select ng-model=\"scheduleConfig.frequency\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"minute for minute in uiConfig.everyNMinutes\"\n" +
    "                        chosen>\n" +
    "                    <option value=\"\"></option>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.MINUTES_ON}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-day-row\" ng-include=\"'weekday-selector'\"></div>\n" +
    "        <br>\n" +
    "        <!--Temporarily disabled <div ng-include=\"'time-range'\"></div>-->\n" +
    "        <div ng-include=\"'repeat-options'\"></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"hourly\">\n" +
    "    <!-- Repeat Frequency Options : Hourly-->\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.RUN_EVERY}}</label>\n" +
    "            <span class=\"bk-select-box bk-frequency\">\n" +
    "                <select ng-model=\"scheduleConfig.frequency\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"hr for hr in uiConfig.hrly\"\n" +
    "                        chosen>\n" +
    "                    <option value=\"\"></option>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.HOURS_ON}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-day-row\" ng-include=\"'weekday-selector'\"></div>\n" +
    "        <!-- Temporarily disabled <div ng-include=\"'time-range'\"></div>-->\n" +
    "        <div ng-include=\"'repeat-options'\"></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"daily\">\n" +
    "    <!-- Repeat Frequency Options : Daily-->\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.RUN_THE_TASK}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                <input type=\"radio\" name=\"time\" value=\"ALL\" ng-model=\"scheduleConfig.dayOption\" checked=true>\n" +
    "                {{schedulerUIText.EVERY_DAY}}\n" +
    "            </label><br>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                <input type=\"radio\" name=\"time\" value=\"WEEKDAY\" ng-model=\"scheduleConfig.dayOption\">\n" +
    "                {{schedulerUIText.EVERY_WEEKDAY}}\n" +
    "            </label>\n" +
    "        </div>\n" +
    "        <div ng-include=\"'repeat-options'\"></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"weekly\">\n" +
    "    <!-- Repeat Frequency Options : Weekly-->\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.RUN_WEEK}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-day-row\" ng-include=\"'weekday-selector'\"></div>\n" +
    "        <div ng-include=\"'repeat-options'\"></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"monthly\">\n" +
    "    <!-- Repeat Frequency Options : Monthly-->\n" +
    "    <div class=\"bk-options\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.RUN_ON}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\" ng-if=\"!scheduleConfig.scheduleJob\">\n" +
    "                <input type=\"radio\" ng-model=\"scheduleConfig.monthOption\" name=\"monthOption\" value={{timeRangeOptions.DATE}} checked=true>\n" +
    "                {{schedulerUIText.DAY}}\n" +
    "            </label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.dayOfMonth\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"day for day in uiConfig.daysOfMonth\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.OF_EVERY_MONTH}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\" ng-if=\"!scheduleConfig.scheduleJob\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                <input type=\"radio\" ng-model=\"scheduleConfig.monthOption\" name=\"monthOption\" value={{timeRangeOptions.WEEKDAY}}>\n" +
    "                {{schedulerUIText.THE}}\n" +
    "            </label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.weekOfMonth\" class=\"bk-month-content bk-selectable\"\n" +
    "                        ng-options=\"week for week in uiConfig.weeksOfMonth\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.dayOfWeek\" class=\"bk-month-content bk-selectable\"\n" +
    "                        ng-options=\"dayOfWeek.camelize() for dayOfWeek in uiConfig.daysOfWeek\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.OF_EVERY_MONTH}}</label>\n" +
    "        </div>\n" +
    "        <div ng-include=\"'repeat-options'\"></div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"weekday-selector\">\n" +
    "    <span class=\"bk-day-row\" ng-repeat=\"checkboxCtrl in dayCheckboxCtrls\">\n" +
    "        <div class=\"bk-day\">\n" +
    "            <bk-checkbox bk-ctrl=\"checkboxCtrl\"></bk-checkbox>\n" +
    "        </div>\n" +
    "    </span>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"repeat-options\">\n" +
    "    <div ng-if=\"!scheduleConfig.scheduleJob\">\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label bk-bold\">{{schedulerUIText.REPEAT_OPTIONS}}</label>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                <input type=\"radio\" ng-model=\"scheduleConfig.repeatOption\" name=\"repeatOption\" value=\"indefinitely\" checked=true>\n" +
    "                {{schedulerUIText.REPEAT_INDEFINITELY}}\n" +
    "            </label><br>\n" +
    "        </div>\n" +
    "        <div class=\"bk-data-row\">\n" +
    "            <label class=\"bk-label\">\n" +
    "                <input type=\"radio\" ng-model=\"scheduleConfig.repeatOption\" name=\"repeatOption\" value=\"repeatUntil\">\n" +
    "                {{schedulerUIText.REPEAT_UNTIL}}\n" +
    "            </label>\n" +
    "            <input class=\"bk-repeat-until\"\n" +
    "                   ng-model=\"scheduleConfig.endDate\"\n" +
    "                   bs-datepicker\n" +
    "                   date-type=\"string\"\n" +
    "                   date-format=\"{{dateFormat}}\"\n" +
    "                   placeholder=\"{{dateFormat}}\">\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.AT}}</label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.repeatHour\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"hour for hour in uiConfig.hours\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "            <label class=\"bk-label\">{{schedulerUIText.COLON}}</label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.repeatMin\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"min for min in uiConfig.minutes\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"time-range\">\n" +
    "    <div class=\"bk-data-row\">\n" +
    "        <label class=\"bk-label bk-bold\">{{schedulerUIText.TIME_RANGE}}</label>\n" +
    "    </div>\n" +
    "    <div class=\"bk-data-row\">\n" +
    "        <label class=\"bk-label\">\n" +
    "            <input type=\"radio\" name=\"time\" ng-model=\"scheduleConfig.timeRange\" value=\"{{timeRangeOptions.ALL_DAY}}\" checked=true>\n" +
    "            {{schedulerUIText.ALL_DAY}}\n" +
    "        </label><br>\n" +
    "    </div>\n" +
    "    <div class=\"bk-data-row\">\n" +
    "        <label class=\"bk-label\">\n" +
    "            <input type=\"radio\" name=\"time\" ng-model=\"scheduleConfig.timeRange\" value=\"{{timeRangeOptions.BETWEEN}}\">\n" +
    "            {{schedulerUIText.BETWEEN}}\n" +
    "        </label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.startHour\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"hour for hour in uiConfig.hours\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        <label class=\"bk-label\">{{schedulerUIText.COLON}}</label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.startMin\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"min for min in uiConfig.minutes\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        <label class=\"bk-label\">{{schedulerUIText.AND}}</label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.endHour\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"hour for hour in uiConfig.hours\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        <label class=\"bk-label\">{{schedulerUIText.COLON}}</label>\n" +
    "            <span class=\"bk-select-box\">\n" +
    "                <select ng-model=\"scheduleConfig.endMin\" class=\"bk-cell-hour-content bk-selectable\"\n" +
    "                        ng-options=\"min for min in uiConfig.minutes\"\n" +
    "                        chosen>\n" +
    "                </select>\n" +
    "            </span>\n" +
    "        <label class=\"bk-label\">{{schedulerUIText.EACH_DAY}}</label>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/search-doctor/object-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-doctor/object-list.html",
    "<div class=\"bk-expandable-list bk-object-list\">\n" +
    "    <div class=\"bk-list-title\">{{title}}</div>\n" +
    "    <div class=\"bk-list-content\" ng-show=\"!!objects.length\">\n" +
    "        <div blink-paged-repeat=\"object in objects\" model=\"objects\" page-size=\"10\" allow-expansion=\"true\">\n" +
    "            <div class=\"bk-list-row\" ng-click=\"onItemClick(object)\">\n" +
    "                <div class=\"bk-icon object-result\" ng-class=\"{'bk-style-icon-answer': object.isAnswer(), 'bk-style-icon-pinboard': object.isPinboard()}\"></div>\n" +
    "                <div class=\"bk-row-content\">\n" +
    "                    <div class=\"row-header\">\n" +
    "                        <span class=\"new-token\" ng-bind-html=\"object.name.text | blinkHighlight:object.getHighlightedName().getMatchedSubstring() :'matched-substring'\"></span>\n" +
    "                    </div>\n" +
    "                    <div class=\"row-subtext\" ng-if=\"hasSubtext(object)\">\n" +
    "                        <span ng-bind-html=\"getMatchedQuestion(object).getName() | blinkHighlight:getMatchedQuestion(object).getHighlightedName().getMatchedSubstring():'matched-substring'\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-empty-list\" ng-show=\"!objects.length\">\n" +
    "{{strings.NO_DATA}}\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/modules/search-doctor/query-completions.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-doctor/query-completions.html",
    "<div class=\"bk-expandable-list bk-query-completions\">\n" +
    "    <div class=\"bk-list-title\">{{strings.Did_you2}}</div>\n" +
    "    <div class=\"bk-list-content\" ng-show=\"!!queryCompletions.length\">\n" +
    "        <div blink-paged-repeat=\"item in queryCompletions\" model=\"queryCompletions\" page-size=\"10\" allow-expansion=\"true\">\n" +
    "            <div class=\"bk-list-row\" ng-click=\"onItemClick(item)\">\n" +
    "                <div class=\"bk-icon bk-style-icon-search\"></div>\n" +
    "                <div class=\"bk-row-content\">\n" +
    "                    <span class=\"prefix-token\">{{item.getPrefixTokensQueryString()}}</span>\n" +
    "                    <span ng-class=\"{'suffix-token': !item.getSearchText(), 'new-token': !!item.getSearchText()}\" ng-bind-html=\"item.getNewTokensQueryString() | blinkHighlight:item.getSearchText():'matched-substring'\">\n" +
    "                    </span>\n" +
    "                    <span class=\"lineage\" ng-bind-html=\"getLineageDropdown(item, false, queryCompletions)\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-empty-list\" ng-show=\"!queryCompletions.length\">\n" +
    "{{strings.NO_DATA}}\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/modules/search-doctor/search-doctor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-doctor/search-doctor.html",
    "<div class=\"bk-bad-search-header\" ng-bind-html=\"getHeaderMessage()\"></div>\n" +
    "<div class=\"bk-bad-search-container\" ng-class=\"{'layout1': isLayoutClass('layout1'), 'layout2': isLayoutClass('layout2')}\">\n" +
    "    <div class=\"bk-completions-container\">\n" +
    "        <query-completions ng-show=\"!!queryCompletions && !!queryCompletions.length\" query-completions=\"queryCompletions\" on-click=\"onClickQueryCompletion\"></query-completions>\n" +
    "        <object-list title=\"objectResultsTitle\" ng-show=\"!!objectResults && !!objectResults.length\" objects=\"objectResults\"></object-list>\n" +
    "    </div>\n" +
    "    <div class=\"bk-help-container\" ng-if=\"!isSearchHelpRestricted()\">\n" +
    "        <blink-carousel model=\"carousel\"></blink-carousel>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/search-pages/aggregated-worksheet-editor/aggregated-worksheet-editor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-pages/aggregated-worksheet-editor/aggregated-worksheet-editor.html",
    "<bk-answer-document ng-if=\"!!$ctrl.answerDocumentComponent\" bk-ctrl=\"$ctrl.answerDocumentComponent\" class=\"bk-vertical-flex-container-sized\">\n" +
    "</bk-answer-document>\n" +
    "<bk-share-dialog ng-if=\"$ctrl.showShareDialog\" bk-ctrl=\"$ctrl.shareDialogComponent\">\n" +
    "</bk-share-dialog>");
}]);

angular.module("src/modules/search-pages/answer/answer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-pages/answer/answer.html",
    "<bk-answer-document ng-if=\"!!$ctrl.answerDocumentComponent\" bk-ctrl=\"$ctrl.answerDocumentComponent\" class=\"bk-vertical-flex-container-sized\">\n" +
    "</bk-answer-document>");
}]);

angular.module("src/modules/search-pages/saved-answer/saved-answer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/search-pages/saved-answer/saved-answer.html",
    "<bk-answer-document ng-if=\"!!$ctrl.answerDocumentComponent\" bk-ctrl=\"$ctrl.answerDocumentComponent\" class=\"bk-vertical-flex-container-sized\">\n" +
    "</bk-answer-document>\n" +
    "<bk-share-dialog ng-if=\"$ctrl.showShareDialog\" bk-ctrl=\"$ctrl.shareDialogComponent\">\n" +
    "</bk-share-dialog>");
}]);

angular.module("src/modules/sharable-item/sharable-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/sharable-item/sharable-item.html",
    "<div class=\"bk-sharable-item {{ customClasses }}\" ng-show=\"!shouldShowSage() || isSageBarReady\" ng-class=\"{'bk-with-sage-data': shouldShowDataPanel && isDataPanelNeeded(),\n" +
    "           'bk-with-comment-panel': isCommentPanelExpanded() && isCommentable()}\">\n" +
    "\n" +
    "    <div ng-if=\"isDataPanelNeeded()\" class=\"bk-sage-data-container\" ng-hide=\"isDataPanelExplicitlyCollapsed()\" ng-class=\"{'bk-show-above-overlay': showDataPanelAboveOverlay(),\n" +
    "            show: isDataPanelExplicitlyExpanded()}\" resizable r-directions=\"['right']\" r-flex=\"true\" r-end=\"reflowContent(info)\">\n" +
    "        <sage-data config=\"config\" sources-change-callback=\"onDataSourcesChanged\" column-panel-component-config=\"config.columnPanelComponentConfig\" on-header-click-callback=\"panelHeaderClicked\">\n" +
    "        </sage-data>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-sharable-item-inner\" ng-class=\"{'bk-with-sage-bar': shouldShowSage()}\">\n" +
    "        <div class=\"bk-sharable-item-container\" ng-class=\"{ 'bk-scale-up-animation': needsScaleUpAnimation(),\n" +
    "                'unsaved-document': !config.model.isCreatedOnServer() }\" blink-on-animation-end=\"scaleUpAnimationDone()\" ng-controller=\"DocumentController\" ng-switch=\"config.shouldShowPlaceholderContainer()\" ng-if=\"!isSearchDoctorRequired\">\n" +
    "            <bk-empty-page-placeholder ng-switch-when=\"true\" bk-ctrl=\"emptyPagePlaceholderComponent\">\n" +
    "            </bk-empty-page-placeholder>\n" +
    "            <div ng-switch-when=\"false\" class=\"bk-sharable-content-container\">\n" +
    "                <div class=\"bk-missing-underlying-label\" ng-show=\"!underlyingLabelClose &&\n" +
    "                        config.permission &&\n" +
    "                        config.permission.isMissingUnderlyingAccess()\">\n" +
    "                    {{ getMissingUnderlyingAccessMessage() }}\n" +
    "                    <span class=\"bk-close\" ng-click=\"underlyingLabelClose = true\">×</span>\n" +
    "                </div>\n" +
    "                <div class=\"bk-missing-underlying-label\" ng-show=\"config.model && config.model.hasAnyEditorialWarnings()\">\n" +
    "                    {{ config.model.getEditorialWarnings() }}\n" +
    "                </div>\n" +
    "\n" +
    "                <bk-share-dialog ng-if=\"showShareDialog\" bk-ctrl=\"shareDialogComponent\">\n" +
    "                </bk-share-dialog>\n" +
    "                <div class=\"bk-sharable-item-content-container\">\n" +
    "                    <div class=\"sharable-item-panel\" ng-lazy-show=\"showPanel()\">\n" +
    "                        <div class=\"bk-sharable-item-title bk-editable-title\" ng-show=\"!config.hideTitle\">\n" +
    "                            <div blink-content-editable not-editable=\"!isTitleEditingAllowed()\" fullspan before-edit-mode=\"shouldAllowInPlaceTitleEditing()\" placeholder=\"getPlaceholder()\" validate-input=\"validate()\" ng-model=\"documentTitle.name\" description=\"documentTitle.desc\">\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                        <div ng-include=\"getPluginUrl()\" class=\"bk-control-panel-item\" ng-class=\"{'bk-left-aligned': !!pluginConfig.leftAlign}\">\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"config.showAuthor()\" class=\"bk-control-panel-item bk-control-panel-author\">\n" +
    "                            <blink-author answer-model=\"config.model\"></blink-author>\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-control-panel-item bk-style-icon-comments bk-btn\" blink-tooltip=\"Comment\" ng-click=\"toggleCommentPanel()\" ng-if=\"isCommentable()\">\n" +
    "                        </div>\n" +
    "                        <bk-expiration-button class=\"bk-control-panel-expiration\" bk-ctrl=\"expirationButtonComponent\" ng-if=\"config.showTTLTimer\">\n" +
    "                        </bk-expiration-button>\n" +
    "                        <bk-action-button-dropdown menu=\"config.actionMenuConfig\" busy=\"config.isActionMenuBusy()\" class=\"bk-control-panel-item\" ng-if=\"config.actionMenuConfig\">\n" +
    "                        </bk-action-button-dropdown>\n" +
    "                    </div>\n" +
    "                    <div class=\"content-container\">\n" +
    "                        <div ng-if=\"showRibbon()\" ng-include=\"getRibbonUrl()\" class=\"ribbon-item\">\n" +
    "                        </div>\n" +
    "                        <div ng-include=\"getContentUrl()\" class=\"sharable-item-content\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-comment-panel-container\" ng-if=\"isCommentPanelExpanded()\">\n" +
    "        <comment model=\"config.model\"></comment>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-generic-overlay\" ng-show=\"showOverlay\"></div>\n" +
    "    <div class=\"bk-progress-indicator\" ng-show=\"$root.workingIndicator && $root.workingIndicator.enabled\">\n" +
    "        <span>{{ $root.workingIndicator.text }}</span>\n" +
    "        <div class=\"bk-moving-dots\">\n" +
    "            <div class=\"bk-dot dot1\"></div>\n" +
    "            <div class=\"bk-dot dot2\"></div>\n" +
    "            <div class=\"bk-dot dot3\"></div>\n" +
    "            <div class=\"bk-dot dot4\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-query-progress-anchor\"></div>\n" +
    "    <div class=\"bk-query-latency-visualizer-container\" ng-show=\"showQueryLatencyVisualizer()\">\n" +
    "        <div query-latency-visualizer></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/share/share-dialog.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/share/share-dialog.html",
    "<div class=\"bk-dialog-overlay\" blink-on-escape=\"$ctrl.onEscape()\">\n" +
    "    <div class=\"bk-dialog modal bk-share-dialog\" ng-class=\"{ 'bk-sidebar-dialog-layout': $ctrl.showColumnPermissions }\">\n" +
    "        <div class=\"modal-header\">\n" +
    "            <a class=\"bk-close\" ng-click=\"$ctrl.clear()\" ng-show=\"!$ctrl.unsavedChanges\">&times;</a>\n" +
    "            <h3>{{ $ctrl.panelStrings.TITLE }}</h3>\n" +
    "        </div>\n" +
    "        <div class=\"bk-body\" ng-class=\"{\n" +
    "                'bk-loading' : $ctrl.isLoading && !$ctrl.showColumnPermissions,\n" +
    "                'bk-loading-sidebar' : $ctrl.isLoading && $ctrl.showColumnPermissions\n" +
    "                }\">\n" +
    "            <div class=\"bk-sidebar\" ng-show=\"$ctrl.showColumnPermissions\" ng-class=\"{ 'bk-disabled': $ctrl.unsavedChanges }\">\n" +
    "                \n" +
    "                <div class=\"bk-table-sharing-options\">\n" +
    "                    <label class=\"bk-column-option\">\n" +
    "                        <input type=\"radio\" ng-disabled=\"$ctrl.unsavedChanges\" ng-model=\"$ctrl.tableSharingMode\" ng-change=\"$ctrl.onTableOptionRadioClick()\" value=\"share-table\">\n" +
    "                        <span>{{ $ctrl.panelStrings.ENTIRE_TABLE }}</span>\n" +
    "                    </label>\n" +
    "                    <label class=\"bk-column-option\">\n" +
    "                        <input type=\"radio\" ng-disabled=\"$ctrl.unsavedChanges\" ng-model=\"$ctrl.tableSharingMode\" ng-change=\"$ctrl.onTableOptionRadioClick()\" value=\"share-columns\">\n" +
    "                        <span>{{ $ctrl.panelStrings.SPECIFIC_COLUMN }}</span>\n" +
    "                    </label>\n" +
    "                </div>\n" +
    "                \n" +
    "                <ul ng-show=\"$ctrl.tableSharingMode == 'share-columns'\" class=\"bk-share-columns\">\n" +
    "                    <li ng-repeat=\"column in $ctrl.columns\" ng-click=\"$ctrl.selectTableColumn(column)\" ng-class=\"{ 'bk-selected': $ctrl.column._selected }\">\n" +
    "                        {{ column.header.name }}\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "            <div class=\"bk-dialog-permission-view\">\n" +
    "                \n" +
    "                <div class=\"bk-permission-list\">\n" +
    "\n" +
    "                    <div ng-switch on=\"$ctrl.isLoading\">\n" +
    "                        <h2 ng-switch-when=\"false\">{{ $ctrl.panelStrings.WHO_ACCESS }}\n" +
    "                            <span ng-show=\"!$ctrl.bulkMode\">\n" +
    "                                <span>{{$ctrl.strings.to}}&nbsp;</span>\n" +
    "                                {{ $ctrl.sharedObject.typeLabel }} \"{{ $ctrl.sharedObject.name }}\"\n" +
    "                            </span>\n" +
    "                        </h2>\n" +
    "                        <h2 ng-switch-when=\"true\">{{ $ctrl.panelStrings.FETCHING_PERMISSIONS }}</h2>\n" +
    "                    </div>\n" +
    "                    <ul>\n" +
    "                        \n" +
    "                        <li class=\"bk-user-list\" ng-show=\"author\">\n" +
    "                            <div class=\"bk-permission-viewer\">\n" +
    "                                <bk-principal-viewer bk-ctrl=\"$ctrl.author\" class=\"bk-principal-container\">\n" +
    "                                </bk-principal-viewer>\n" +
    "                                <span class=\"bk-is-owner-label\">{{ $ctrl.panelStrings.IS_OWNER }}</span>\n" +
    "                            </div>\n" +
    "                        </li>\n" +
    "                        \n" +
    "                        <bk-permissions-list bk-ctrl=\"$ctrl.permissionsListComponent\">\n" +
    "                        </bk-permissions-list>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "                \n" +
    "                <div class=\"bk-add-users\" ng-class=\"{ 'bk-expanded': $ctrl.addUserSectionExpanded }\" ng-click=\"$ctrl.expandAddUserSection()\" ng-show=\"!$ctrl.isLoading && !$ctrl.unsavedChanges\">\n" +
    "                    <div class=\"bk-add-users-header\">\n" +
    "                        <span class=\"bk-plus-icon bk-style-icon-small-plus\"></span>\n" +
    "                        <span class=\"bk-add-users-title\">{{ $ctrl.panelStrings.ADD_USERS_OR_GROUPS }}</span>\n" +
    "                    </div>\n" +
    "                   <div class=\"alert warning\" ng-if=\"$ctrl.principalSelectorComponent.hasNoPrincipals()\">\n" +
    "                       {{$ctrl.panelStrings.USER_HAS_NO_PRINCIPALS}}\n" +
    "                   </div>\n" +
    "                    <div class=\"bk-add-users-body\" ng-click=\"$event.stopPropagation();\">\n" +
    "                       <bk-add-principal bk-ctrl=\"$ctrl.addPrincipalComponent\"></bk-add-principal>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                \n" +
    "                <div class=\"bk-unsaved-changes-message alert warning\" ng-show=\"$ctrl.unsavedChanges\">\n" +
    "                    <bk-primary-button text=\"{{ $ctrl.strings.SAVE }}\" ng-click=\"$ctrl.savePermissions()\" class=\"bk-save-btn\"></bk-primary-button>\n" +
    "                    <bk-secondary-button text=\"{{ $ctrl.strings.CANCEL }}\" ng-click=\"$ctrl.discardUnsavedChanges()\" class=\"bk-cancel-button\"></bk-secondary-button>\n" +
    "                    <span>{{ $ctrl.panelStrings.CLICK_TO_SAVE }}</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-clear\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"modal-footer\" ng-show=\"!$ctrl.unsavedChanges && !$ctrl.addUserSectionExpanded\">\n" +
    "            <bk-primary-button text=\"{{ $ctrl.strings.DONE }}\" ng-click=\"$ctrl.clear()\" class=\"bk-done-btn\">\n" +
    "            </bk-primary-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/share/share-permissions/permission-dropdown.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/share/share-permissions/permission-dropdown.html",
    "<div class=\"bk-permission-type-drop-down bk-select-box\" ng-class=\"{'bk-disabled': $ctrl.readOnly}\">\n" +
    "    <ui-select ng-model=\"$ctrl.permissionType\" ng-disabled=\"$ctrl.readOnly\" search-enabled=\"false\" append-to-body=\"true\" theme=\"select2\" ng-change=\"$ctrl.onChange()\">\n" +
    "        <ui-select-match placeholder=\"\">\n" +
    "            <span class=\"bk-selected-permission\">\n" +
    "                {{$ctrl.getPermissionTypeLabel($select.selected)}}\n" +
    "            </span>\n" +
    "        </ui-select-match>\n" +
    "        <ui-select-choices repeat=\"permission in $ctrl.getPermissionTypes($select.selected)\">\n" +
    "            <span class=\"bk-options-permission\">\n" +
    "                {{$ctrl.getPermissionTypeLabel(permission)}}\n" +
    "            </span>\n" +
    "        </ui-select-choices>\n" +
    "    </ui-select>\n" +
    "</div>");
}]);

angular.module("src/modules/share/share-permissions/permissions-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/share/share-permissions/permissions-list.html",
    "<li class=\"bk-user-list\" ng-repeat=\"viewer in $ctrl.principalViewers | filter:$ctrl.hasPermissions\">\n" +
    "\n" +
    "    <bk-sharing-row bk-ctrl=\"viewer\"></bk-sharing-row>\n" +
    "</li>");
}]);

angular.module("src/modules/share/share-permissions/share-permission.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/share/share-permissions/share-permission.html",
    "<div class=\"bk-permission-viewer\">\n" +
    "    <bk-principal-viewer bk-ctrl=\"$ctrl.principalViewer\" class=\"bk-principal-container\">\n" +
    "    </bk-principal-viewer>\n" +
    "    <bk-permission-dropdown ng-if=\"$ctrl.showPermissionPlugin\" class=\"bk-select-box\" bk-ctrl=\"$ctrl.permissionDropdown\">\n" +
    "    </bk-permission-dropdown>\n" +
    "    <span class=\"bk-delete-row-btn\" ng-click=\"$ctrl.onDelete($ctrl.sharePrincipal)\" ng-show=\"!$ctrl.readOnly\">&times;</span>\n" +
    "</div>");
}]);

angular.module("src/modules/share/share-principal/principal-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/share/share-principal/principal-viewer.html",
    "<div class=\"bk-principal-viewer\" ng-switch=\"$ctrl.principalType\">\n" +
    "     <span class=\"bk-group-icon\" ng-switch-when=\"1 \">\n" +
    "        <span class=\"bk-style-icon-users\"></span>\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"2\">\n" +
    "        <blink-profile-pic user-id=\"$ctrl.id\"></blink-profile-pic>\n" +
    "    </span>\n" +
    "    <span class=\"bk-group-icon\" ng-switch-when=\"3\">\n" +
    "        <span class=\"bk-style-icon-user\"></span>\n" +
    "    </span>\n" +
    "    <div class=\"bk-permission-principal\">\n" +
    "        <span class=\"bk-name\" ng-if=\"$ctrl.principalType == 1 || $ctrl.principalType == 2\">{{ $ctrl.name }}</span>\n" +
    "        <span class=\"bk-email\" ng-if=\"$ctrl.principalType == 3\">{{ $ctrl.name }}</span>\n" +
    "        <small ng-if=\"$ctrl.principalType != 3\" class=\"bk-display-name\">{{ $ctrl.displayName }}</small>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/shuttle-control/general-item-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/shuttle-control/general-item-viewer.html",
    "<ul class=\"bk-general-item-viewer\">\n" +
    "    <li ng-repeat=\"item in items\" ng-class=\"{'bk-row-selected-bg': !isItemUnchecked(item)}\">\n" +
    "        <div class=\"bk-general-item bk-overflow-ellipsis\">\n" +
    "            <span class=\"bk-working\" ng-show=\"isUpdating(item)\"></span>\n" +
    "            <span class=\"bk-expand-btn-light-bg\" ng-hide=\"isUpdating(item)\" ng-click=\"onItemExpanded(item); expanded = !expanded;\" ng-class=\"{'bk-arrow-collapsed': !expanded, 'bk-arrow-expanded': !!expanded}\"></span>\n" +
    "            <div class=\"bk-checkbox-container\" ng-click=\"toggleItemSelection(item)\">\n" +
    "                <div class=\"bk-checkbox\" ng-show=\"config.selectionAllowed && !item.disallowDeselection\" ng-class=\"{'bk-checked': isItemChecked(item),\n" +
    "                                                    'bk-indeterminate': isItemPartiallyChecked(item)}\"></div>\n" +
    "                <div class=\"bk-checkbox-title\">{{item.name}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <ul ng-show=\"!!expanded\" class=\"bk-subitems\">\n" +
    "            <li ng-repeat=\"subItem in item.subItems\">\n" +
    "                <div class=\"subitem-name bk-overflow-ellipsis\" blink-tooltip=\"{{getTooltip(subItem)}}\" data-placement=\"right\" ng-click=\"toggleSubItemSelection(item, subItem)\" ng-class=\"{disabled: subItem.isDisabled}\">\n" +
    "                    <div class=\"bk-checkbox-container\">\n" +
    "                        <div class=\"bk-checkbox\" ng-show=\"config.selectionAllowed\" ng-class=\"{'bk-checked': subItem.isChecked}\"></div>\n" +
    "                        <div class=\"bk-checkbox-title\">{{subItem.name}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("src/modules/shuttle-control/shuttle-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/shuttle-control/shuttle-viewer.html",
    "<div class=\"shuttle-viewer-container\" ng-show=\"shuttleModel.showShuttle\">\n" +
    "    <div class=\"left-shuttle\">\n" +
    "        <span class=\"shuttle-title\">{{shuttleModel.leftName}}</span>\n" +
    "        <div class=\"bk-list-search\">\n" +
    "            <input type=\"text\" class=\"bk-search-input\" blink-on-enter=\"onEnterCallback()\" placeholder=\"search by name\" ng-model=\"shuttleModel.searchText\">\n" +
    "        </div>\n" +
    "        <general-item-viewer config=\"itemSelectorConfig\" items=\"shuttleModel.availableItems\" disabled-tip=\"disabledTip\" get-sub-items=\"getSubItems\">\n" +
    "        </general-item-viewer>\n" +
    "    </div>\n" +
    "    <div class=\"center-col\" align=\"center\">\n" +
    "        <div class=\"buttons-mid\">\n" +
    "            <div class=\"bk-btn\" ng-click=\"moveRight()\">&nbsp&gt&nbsp</div>\n" +
    "            <div class=\"bk-btn\" ng-click=\"moveAllRight()\">&gt&gt</div>\n" +
    "            <div class=\"bk-btn\" ng-click=\"moveLeft()\">&nbsp&lt&nbsp</div>\n" +
    "            <div class=\"bk-btn\" ng-click=\"moveAllLeft()\">&lt&lt</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"right-shuttle\">\n" +
    "        <span class=\"shuttle-title\">{{shuttleModel.rightName}}</span>\n" +
    "        <general-item-viewer config=\"itemSelectorConfig\" items=\"shuttleModel.selectedItems\" disabled-tip=\"disabledTip\" get-sub-items=\"getSubItems\">\n" +
    "        </general-item-viewer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/slack-register/slack-register.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/slack-register/slack-register.html",
    "<div class=\"slack-register\" ng-if=\"$ctrl.isRegistered\">\n" +
    "    <div class=\"spotgirl-image\"></div>\n" +
    "    <div>\n" +
    "        {{ $ctrl.strings.slack.thanks_for_registering }}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/slack/slack-auth.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/slack/slack-auth.html",
    "<div ng-controller=\"SlackAuthController\"></div>");
}]);

angular.module("src/modules/slack/slack-channels/slack-channels.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/slack/slack-channels/slack-channels.html",
    "<div class=\"bk-viz-control bk-viz-menu bk-slack-channels-drop-down bk-open\" blink-on-escape=\"close()\">\n" +
    "    <div>\n" +
    "        <div class=\"bk-viz-menu-btn bk-viz-btn bk-pin-viz-btn\" ng-click=\"onDropDownClick($event)\">\n" +
    "            <div class=\"bk-viz-btn-icon bk-style-icon-slack\" blink-tooltip=\"Share on Slack\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-viz-menu-drop-down\" ng-if=\"isOpen\">\n" +
    "        <div class=\"bk-header\">{{strings.Share_with}}</div>\n" +
    "        <ul class=\"bk-pinboard-list\">\n" +
    "            <li ng-repeat=\"channel in slackChannels\" ng-click=\"onShareWithChannelClicked(channel)\" class=\"bk-pinboard-row bk-overflow-ellipsis\" data-html=\"true\" data-placement=\"left\">\n" +
    "                <span class=\"bk-style-icon-checkmark\" ng-show=\"channel.selected\"><span></span></span>\n" +
    "                <span class=\"bk-pinboard-working\" ng-show=\"!!channel.loading\"></span>\n" +
    "                <span class=\"bk-pinboard-name\" ng-bind-html=\"channel.name\"></span>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/slack/slack-comments/slack-comments.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/slack/slack-comments/slack-comments.html",
    "<div class=\"bk-viz-control bk-viz-menu bk-slack-comments-drop-down\" ng-class=\"{'bk-open': isOpen}\" blink-on-escape=\"close()\">\n" +
    "    <div>\n" +
    "        <div class=\"bk-viz-menu-btn bk-viz-btn bk-pin-viz-btn\" ng-click=\"onDropDownClick($event)\">\n" +
    "            <div class=\"bk-viz-btn-icon bk-style-icon-comments\" blink-tooltip=\"Comments\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-viz-menu-drop-down\" ng-show=\"isOpen\">\n" +
    "        <div class=\"bk-header\">{{strings.Comment_List}}</div>\n" +
    "        <a class=\"bk-btn bk-create-pinboard-btn\" style=\"margin-left : 10px\" ng-click=\"refreshComments()\">\n" +
    "{{strings.REFRESH}}\n" +
    "</a>\n" +
    "        <ul class=\"bk-pinboard-list\">\n" +
    "            <li ng-repeat=\"comment in fileComments\" class=\"bk-pinboard-row\" data-html=\"true\" data-placement=\"left\">\n" +
    "                \n" +
    "                      \n" +
    "                \n" +
    "                      \n" +
    "                <span class=\"bk-pinboard-name\"><b>{{getAuthorName(comment) + \": \"}}</b>{{comment.comment}}</span>\n" +
    "            </li>\n" +
    "            <li class=\"bk-create-pinboard-row\">\n" +
    "                <span class=\"bk-new-pinboard-input\">\n" +
    "                    <span class=\"bk-pinboard-icon\"></span>\n" +
    "                    <input type=\"text\" class=\"bk-input\" placeholder=\"Add a comment\" ng-model=\"newComment\" ng-enter=\"addComment()\">\n" +
    "                    <a class=\"bk-btn bk-create-pinboard-btn\" ng-click=\"addComment()\" ng-class=\"{ 'bk-disabled': !newComment }\">{{strings.ADD}}</a>\n" +
    "                </span>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/table-viz/table-viz.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/table-viz/table-viz.html",
    "<blink-viz-table viz=\"$ctrl.tableViz\" sage-client=\"$ctrl.sageClient\" on-render-complete=\"$ctrl.onRenderCompleteCallback\">\n" +
    "</blink-viz-table>");
}]);

angular.module("src/modules/user-data/create-schema/create-schema-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/create-schema/create-schema-page.html",
    "<div class=\"bk-metadata-list create-schema-page\">\n" +
    "    <div class=\"bk-header\">\n" +
    "        <div class=\"bk-page-title\">{{strings.Upload_your}}</div>\n" +
    "    </div>\n" +
    "    <create-schema class=\"create-schema-content\"></create-schema>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/create-schema/create-schema.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/create-schema/create-schema.html",
    "<div class=\"create-schema\">\n" +
    "    <div ng-if=\"!showConfirmationScreen\">\n" +
    "        \n" +
    "        <div class=\"header-menu\">\n" +
    "            <input class=\"bk-search-input\" placeholder=\"{{strings.SEARCH}}\" ng-model=\"searchText.value\">\n" +
    "            <div class=\"right-btns\">\n" +
    "                <bk-secondary-button text=\"{{strings.createSchema.WRITE_TQL}}\" icon=\"bk-style-icon-inverted-question\" ng-if=\"isUploadSqlMode\" class=\"bk-write-tql-button\" ng-click=\"write()\"></bk-secondary-button>\n" +
    "                <bk-secondary-button text=\"{{strings.createSchema.RESET}}\" icon=\"bk-style-icon-reset\" class=\"reset-btn\" ng-click=\"reset()\"></bk-secondary-button>\n" +
    "                <bk-primary-button text=\"{{ executeBtnConfig.label }}\" icon=\"bk-style-icon-play\" is-disabled=\"isUploadSqlMode\" is-busy=\"isExecuting()\" tooltip=\"{{ executeBtnConfig.tip }}\" ng-click=\"onExecuteClick()\"></bk-primary-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        \n" +
    "        <div ng-if=\"isUploadSqlMode\">\n" +
    "            <div blink-html5-file-upload upload-config=\"getSqlUploadConfig()\" indicate-file-read>\n" +
    "            </div>\n" +
    "            <div class=\"bk-upload-sql-arrow bk-flip-v\"></div>\n" +
    "            <div class=\"bk-sql-icon\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "        \n" +
    "        <ul ng-if=\"!isUploadSqlMode\" class=\"query-list\">\n" +
    "            <li ng-repeat=\"queryItem in queries | filter: textFilter track by queryItem.id\" class=\"query-list-item\" ng-class=\"{\n" +
    "                expand: queryItem.isExpanded,\n" +
    "                success: didQuerySucceed(queryItem),\n" +
    "                failure: didQueryFail(queryItem),\n" +
    "                'insert-allowed': canInsertQuery($index)}\" ng-click=\"expandQueryItem(queryItem, $index)\">\n" +
    "                <div ng-if=\"!queryItem.isExpanded\" class=\"bk-query\">\n" +
    "                    {{ getQuerySnippet(queryItem) }}\n" +
    "                </div>\n" +
    "                <div ng-if=\"queryItem.isExpanded\" class=\"query-editor-container\">\n" +
    "                    <div ng-class=\"{expand: queryItem.isExpanded}\" ng-model=\"queryItem.command\" ui-ace=\"{\n" +
    "                    useWrapMode : true,\n" +
    "                    theme: 'sqlserver',\n" +
    "                    mode: 'tql',\n" +
    "                    require: ['ace/ext/language_tools'],\n" +
    "                    workerPath: 'app/lib/min/ace',\n" +
    "                    advanced: {\n" +
    "                        enableBasicAutocompletion: true,\n" +
    "                        enableLiveAutocompletion: true\n" +
    "                    },\n" +
    "                    onLoad : editorLoaded\n" +
    "                }\">\n" +
    "                    </div>\n" +
    "                    <div ng-if=\"queryItem.isExpanded\" class=\"action-bar\">\n" +
    "                        <div class=\"bk-style-icon-minimize\" blink-tooltip=\"{{ strings.COLLAPSE }}\" ng-click=\"collapseQueryItem($event, queryItem)\"></div>\n" +
    "                        <div ng-include=\"'add-btn'\"></div>\n" +
    "                        <div ng-include=\"'delete-btn'\"></div>\n" +
    "                        <div ng-if=\"didQuerySucceed(queryItem)\">{{strings.Readonly}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"query-item-icons\" ng-if=\"!queryItem.isExpanded\">\n" +
    "                    <div ng-include=\"'add-btn'\"></div>\n" +
    "                    <div ng-include=\"'delete-btn'\"></div>\n" +
    "                    <div ng-if=\"didQuerySucceed(queryItem)\" class=\"bk-style-icon-circled-checkmark bk-icon bk-success-icon\">\n" +
    "                    </div>\n" +
    "                    <bk-cross-icon ng-if=\"didQueryFail(queryItem)\" class=\"bk-icon bk-failure-icon\"></bk-cross-icon>\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-import-confirmation\" ng-if=\"showConfirmationScreen\">\n" +
    "        <div ng-include=\"'src/modules/user-data/create-schema/import-confirmation.html'\"></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"delete-btn\">\n" +
    "    <div ng-if=\"!didQuerySucceed(queryItem)\"\n" +
    "         class=\"bk-delete-icon bk-style-icon-delete\"\n" +
    "         blink-tooltip=\"Delete\"\n" +
    "         ng-click=\"deleteItem($event, queryItem, $index)\">\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"add-btn\">\n" +
    "    <div class=\"bk-add-icon bk-icon bk-style-icon-small-plus\"\n" +
    "         blink-tooltip=\"Insert below\"\n" +
    "         ng-click=\"insertItem($event, queryItem, $index)\">\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/user-data/create-schema/import-confirmation.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/create-schema/import-confirmation.html",
    "<div class=\"bk-import-success\">\n" +
    "    <h1 class=\"bk-import-success-text\">\n" +
    "        <div class=\"bk-success-icon\"></div>\n" +
    "{{strings.Congratulations}}\n" +
    "</h1>\n" +
    "    <br>\n" +
    "    <div class=\"bk-imported-rows-number\">\n" +
    "        {{ importSchemaStats.queriesExecuted }}\n" +
    "    </div>\n" +
    "    <div class=\"bk-imported-rows-text\">\n" +
    "{{strings.statements_were}}\n" +
    "</div>\n" +
    "\n" +
    "    <div class=\"bk-import-action-buttons\">\n" +
    "        <bk-secondary-button text=\"{{ strings.createSchema.SAVE_COMMANDS }}\" blink-tooltip=\"{{strings.createSchema.SAVE_COMMANDS_TIP}}\" ng-click=\"dumpSql()\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ strings.createSchema.VIEW_TABLES }}\" ng-click=\"goToTables()\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-confirmation.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-confirmation.html",
    "<div class=\"bk-import-success\">\n" +
    "    <h1 class=\"bk-import-success-text\">\n" +
    "        <div class=\"bk-success-icon\"></div>\n" +
    "{{strings.Congratulations}}\n" +
    "</h1>\n" +
    "    <div class=\"bk-imported-rows-number\" ng-show=\"userSchema.getNumValidRows() > 0\">\n" +
    "        {{ userSchema.getNumValidRows() }}\n" +
    "    </div>\n" +
    "    <div class=\"bk-imported-rows-text\">\n" +
    "{{strings.rows_have}}\n" +
    "</div>\n" +
    "    <div class=\"bk-imported-rows-text-secondary\" ng-show=\"userSchema.getNumErrorRows() > 0\">\n" +
    "        We skipped {{ userSchema.getNumErrorRows() }} <span>{{strings.rows_while}}</span>\n" +
    "</div>\n" +
    "    <div class=\"bk-import-action-buttons\">\n" +
    "        <bk-secondary-button text=\"{{ strings.importData.LINK_TO_EXISTING_DATA }}\" icon=\"bk-style-icon-link\" ng-click=\"goToLinkingView()\" class=\"bk-link-existing-data\"></bk-secondary-button>\n" +
    "        <bk-primary-button text=\"{{ strings.importData.ASK_A_QUESTION }}\" icon=\"bk-style-icon-search\" ng-click=\"selectSourceAndGoToAnswer()\" class=\"bk-ask-a-question\"></bk-primary-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-system-error.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-system-error.html",
    "<div class=\"bk-import-error\">\n" +
    "    <h1 class=\"bk-import-error-text\">\n" +
    "        <div class=\"bk-error-icon\"></div>\n" +
    "{{strings.Oops_Sorry_there}}\n" +
    "</h1>\n" +
    "    <br>\n" +
    "    <div class=\"bk-imported-rows-text\" ng-hide=\"!systemError\">\n" +
    "        {{ systemError }}\n" +
    "    </div>\n" +
    "    <div class=\"bk-imported-rows-text-secondary\" ng-show=\"userSchema.getNumErrorRows() > 0\">\n" +
    "        Try the import again by clicking the button below. If it still doesn't work, check your file. There might be some errors in the file.\n" +
    "    </div>\n" +
    "    \n" +
    "    <bk-primary-button text=\"{{ strings.importData.TRY_OVER_AGAIN }}\" ng-click=\"resetWizard()\"></bk-primary-button>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard-footer-step-1.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard-footer-step-1.html",
    "<div ng-class=\"{'bk-upload-footer-error': headerQuesNotAns}\">\n" +
    "    <span class=\"bk-upload-question bk-header-question\">\n" +
    "        {{ strings.importWizard.HEADER_QUESTION }}\n" +
    "    </span>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"headerQuestion\" type=\"radio\" ng-model=\"uploadStep.headerDefined\" id=\"yes\" value=\"yes\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"yes\">{{strings.Yes}}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"headerQuestion\" type=\"radio\" ng-model=\"uploadStep.headerDefined\" id=\"no\" value=\"no\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"no\">{{strings.No}}</label>\n" +
    "</div>\n" +
    "<div ng-class=\"{'bk-upload-footer-error': dropAppendQuesNotAns}\" ng-show=\"existingDataId\">\n" +
    "    <span class=\"bk-upload-question bk-drop-append-question\">\n" +
    "        {{ strings.importWizard.DROP_APPEND_QUESTION }}\n" +
    "    </span>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"dropAppendQuestion\" type=\"radio\" ng-model=\"uploadStep.dropExistingData\" id=\"append\" value=\"append\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"append\">{{strings.Append}}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"dropAppendQuestion\" type=\"radio\" ng-model=\"uploadStep.dropExistingData\" id=\"overwrite\" value=\"overwrite\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"overwrite\">{{strings.Overwrite}}</label>\n" +
    "</div>\n" +
    "<div ng-init=\"uploadStep.separator='COMMA'\">\n" +
    "    <span class=\"bk-upload-question bk-separator-question\">\n" +
    "        {{ strings.importWizard.FIELD_SEPARATOR_QUESTION }}\n" +
    "    </span>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"separatorQuestion\" type=\"radio\" ng-model=\"uploadStep.separator\" id=\"comma\" value=\"COMMA\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"comma\">{{ strings.importWizard.fieldSeparators.COMMA }}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"separatorQuestion\" type=\"radio\" ng-model=\"uploadStep.separator\" id=\"semicolon\" value=\"SEMICOLON\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"semicolon\">{{ strings.importWizard.fieldSeparators.SEMICOLON }}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"separatorQuestion\" type=\"radio\" ng-model=\"uploadStep.separator\" id=\"pipe\" value=\"PIPE\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"pipe\">{{ strings.importWizard.fieldSeparators.PIPE }}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"separatorQuestion\" type=\"radio\" ng-model=\"uploadStep.separator\" id=\"space\" value=\"SPACE\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"space\">{{ strings.importWizard.fieldSeparators.SPACE }}</label>\n" +
    "    <input class=\"bk-upload-question-choice\" name=\"separatorQuestion\" type=\"radio\" ng-model=\"uploadStep.separator\" id=\"tab\" value=\"TAB\">\n" +
    "    <label class=\"bk-upload-question-choice-label\" for=\"tab\">{{ strings.importWizard.fieldSeparators.TAB }}</label>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard-page.html",
    "<blink-import-wizard></blink-import-wizard>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard-step-1.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard-step-1.html",
    "<div class=\"bk-upload-step-arrow-2\">\n" +
    "    <div class=\"bk-upload-file-icon-csv\"></div>\n" +
    "</div>\n" +
    "<div blink-html5-file-upload upload-config=\"uploadStep.getUploadWidgetConfig()\" indicate-file-read></div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard-step-2.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard-step-2.html",
    "<div class=\"bk-userdata-table\">\n" +
    "    <table>\n" +
    "        <tr class=\"bk-userdata-header-row bk-column-header-names\">\n" +
    "            <td class=\"bk-cell\" ng-repeat=\"column in getColumns()\" ng-class=\"{'bk-error-cell': isInvalidColName(column.logicalName) }\">\n" +
    "                <div class=\"bk-header-cell-container bk-cell-content\">\n" +
    "                    <div blink-content-editable fullspan not-editable=\"!!existingDataId\" auto-show-editable ng-model=\"column.logicalName\" placeholder=\"'Enter column name'\"></div>\n" +
    "                </div>\n" +
    "            </td>\n" +
    "            <td class=\"bk-cell\">&nbsp</td>\n" +
    "        </tr>\n" +
    "        <tr class=\"bk-userdata-header-row bk-column-types\" ng-show=\"shouldShowDataTypeRow()\">\n" +
    "            <td class=\"bk-cell\" ng-repeat=\"column in getColumns()\" ng-class=\"{'bk-error-cell': isInvalidColType($index) }\" blink-tooltip=\"{{ userSchema.getColumnError($index) }}\">\n" +
    "                <div ng-show=\"!!existingDataId\" class=\"bk-cell-content bk-overflow-ellipsis\">{{getLabelForColumnDataType(column.dataType)}}</div>\n" +
    "                <div ng-show=\"!existingDataId\">\n" +
    "                    <div class=\"bk-select-box\">\n" +
    "                        <ui-select ng-model=\"column.dataType\" theme=\"select2\" class=\"bk-column-data-type\" search-enabled=\"false\" append-to-body=\"true\">\n" +
    "                            <ui-select-match placeholder=\"{{strings.importWizard.SELECT_TYPE}}\">\n" +
    "                                {{ $select.selected.name }}\n" +
    "                            </ui-select-match>\n" +
    "                            <ui-select-choices repeat=\"type.id as type in typeStep.columnTypes\">\n" +
    "                                {{ type.name }}\n" +
    "                            </ui-select-choices>\n" +
    "                        </ui-select>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </td>\n" +
    "            <td class=\"bk-cell\">&nbsp</td>\n" +
    "        </tr>\n" +
    "        <tr class=\"bk-userdata-data-row\" ng-repeat=\"(rowIndex, dataRow) in getDataRows()\" ng-class=\"{'bk-error-row': userSchema.isRowWithError(rowIndex)}\" data-line-number=\"{{ userSchema.getLineNumber(rowIndex) }}\">\n" +
    "            <td class=\"bk-cell\" blink-tooltip=\"{{ userSchema.getCellError(rowIndex, colIndex) }}\" ng-class=\"{'bk-error-cell': userSchema.isCellWithError(rowIndex, colIndex) }\" ng-repeat=\"(colIndex, dataCell) in userSchema.getColumns()\">\n" +
    "                <div class=\"bk-cell-content bk-overflow-ellipsis\">\n" +
    "                    {{ dataRow[colIndex] }}\n" +
    "                </div>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </table>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard-step-4.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard-step-4.html",
    "<div class=\"bk-userdata-link-step\">\n" +
    "    <div class=\"bk-userdata-no-keys\" ng-hide=\"linkStep.hasSourceColumns()\">\n" +
    "        <div class=\"bk-userdata-no-keys-title\">{{strings.The_new_data}}</div>\n" +
    "        <div class=\"bk-userdata-no-keys-explanation\">\n" +
    "            <p>\n" +
    "{{strings.Add_a_column}}\n" +
    "</p>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"bk-userdata-with-keys container-fluid\" ng-show=\"linkStep.hasSourceColumns()\">\n" +
    "        <div class=\"row-fluid\">\n" +
    "            <div class=\"span2\"></div>\n" +
    "            <div class=\"span3 bk-link-section\">\n" +
    "                <div class=\"bk-link-section-header\">\n" +
    "                    <div>\n" +
    "{{strings.Your_uploaded}}\n" +
    "</div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-link-section-body\">\n" +
    "                    <div class=\"bk-select-box\">\n" +
    "                        <select ng-model=\"linkStep.sourceColumn\" ng-change=\"linkStep.onSourceColumnChange()\" ng-options=\"getUserColumnName(option) for option in linkStep.getSourceColumns()\" chosen data-width=\"290\">\n" +
    "                            <option value=\"\">{{strings.Select_a}}</option>\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-link-data-column\" ng-show=\"linkStep.sourceColumnData\">\n" +
    "                        <div class=\"bk-link-data-cell\" ng-repeat=\"dataRow in linkStep.sourceColumnData\">{{ dataRow }}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"span3\">\n" +
    "                <div class=\"bk-link-section-header\">\n" +
    "                    &nbsp;\n" +
    "                </div>\n" +
    "                <div class=\"bk-link-ui\" ng-class=\"{'bk-success': linkStep.isLinked()}\">\n" +
    "                    <div class=\"bk-link-left\"></div>\n" +
    "                    <div class=\"bk-link-icon-container\">\n" +
    "                        <div class=\"bk-link-icon\"></div>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-link-right\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"span3 bk-link-section\">\n" +
    "                <div class=\"bk-link-section-header\">\n" +
    "                    <div>\n" +
    "{{strings.Existing_data}}\n" +
    "</div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-link-section-body\" ng-class=\"{ 'bk-disabled': !linkStep.targetColumnOptions || linkStep.targetColumnOptions.length == 0 }\">\n" +
    "                    <div class=\"bk-select-box\">\n" +
    "                        <select ng-disabled=\"!linkStep.targetColumnOptions || linkStep.targetColumnOptions.length == 0\" ng-model=\"linkStep.targetColumnOption\" ng-change=\"linkStep.onTargetColumnChange()\" ng-options=\"getLogicalColumnName(option.column) + ' (' + option.tableName + ')' for option in linkStep.targetColumnOptions\" chosen data-width=\"290\">\n" +
    "                            <option value=\"\">{{strings.Select_a}}</option>\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-link-data-column\" ng-show=\"linkStep.targetColumnData\">\n" +
    "                        <div class=\"bk-link-data-cell\" ng-repeat=\"dataRow in linkStep.targetColumnData track by $index\">{{ dataRow }}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"span1 bk-link-section\">\n" +
    "                <div class=\"bk-link-section-header\">\n" +
    "                    &nbsp;\n" +
    "                </div>\n" +
    "                <div class=\"bk-link-section-body\" ng-class=\"{ 'bk-disabled': !linkStep.sourceColumn }\">\n" +
    "                    <div class=\"bk-btn\" ng-click=\"showExplorer(linkStep.sourceColumn[0])\">\n" +
    "{{strings.Browse}}\n" +
    "</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/user-data/import-wizard/import-wizard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-data/import-wizard/import-wizard.html",
    "<div class=\"bk-wizard-workflow bk-container bk-metadata-list\">\n" +
    "    <div blink-loading-indicator-overlay></div>\n" +
    "    <div class=\"bk-header\">\n" +
    "        <div class=\"bk-page-title\">{{strings.Upload_your2}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-wizard-workflow-inner container\">\n" +
    "        <div class=\"bk-wizard-container\" ng-hide=\"confirmationScreen || errorScreen\">\n" +
    "            <div class=\"bk-wizard-header row\">\n" +
    "                <ul class=\"bk-wizard span12\">\n" +
    "                    <li ng-class=\"{'current': userDataWizard.isCurrentStep($index),\n" +
    "                                       'done': userDataWizard.isCompletedStep($index)\n" +
    "                                      }\" ng-repeat=\"step in userDataWizard.steps\">\n" +
    "                        <span class=\"bk-badge\">{{$index + 1}}</span>\n" +
    "                        <i class=\"bk-checkmark\" ng-show=\"userDataWizard.isCompletedStep($index)\"></i>\n" +
    "                        <span class=\"bk-heading\">{{step.title}}</span>\n" +
    "                        <span class=\"bk-sub-heading\" ng-show=\"step.isOptional\">{{strings.Optional}}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "            <div class=\"bk-wizard-step-error row\">\n" +
    "                <div class=\"span12\" ng-show=\"!!errorRowMsg\">\n" +
    "                    \n" +
    "                    {{ errorRowMsg }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-wizard-body row\">\n" +
    "                <div class=\"bk-upload-step span12\" ng-include=\"userDataWizard.getContentUrl()\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-upload-footer row\">\n" +
    "                <div class=\"span9 bk-upload-footer-left\">\n" +
    "                    <div ng-include=\"userDataWizard.getFooterUrl()\"></div>\n" +
    "                    <bk-secondary-button text=\"{{ strings.BACK }}\" icon=\"bk-style-icon-arrow-left\" ng-hide=\"userDataWizard.isCurrentStep(0)\" ng-click=\"userDataWizard.goToPreviousStep()\"></bk-secondary-button>\n" +
    "                </div>\n" +
    "                <div class=\"span4 bk-wizard-btn-group\">\n" +
    "                    <div class=\"bk-wizard-button\" data-title=\"{{ userDataWizard.getProceedInstructions() }}\">\n" +
    "                        <bk-primary-button text=\"{{ nextBtnLabel }}\" icon=\"bk-style-icon-arrow-right\" reverse-text-icon=\"true\" is-disabled=\"userDataWizard.isNextDisabled()\" ng-hide=\"userDataWizard.isLastStep()\" ng-click=\"userDataWizard.goToNextStep()\" class=\"bk-next-button\"></bk-primary-button>\n" +
    "                    </div>\n" +
    "                    <div class=\"bk-wizard-button\">\n" +
    "                        <bk-primary-button text=\"{{ strings.UPLOAD }}\" is-disabled=\"userDataWizard.isTransitioningToNextStep\" ng-show=\"userDataWizard.isLastStep()\" ng-click=\"userDataWizard.finish()\" class=\"bk-finish-button\"></bk-primary-button>\n" +
    "                    </div>\n" +
    "                    <bk-secondary-button text=\"{{ strings.CANCEL }}\" ng-click=\"onCancel()\" ng-show=\"isWizardCancellable\"></bk-secondary-button>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-upload-confirmation\" ng-show=\"confirmationScreen\">\n" +
    "            <div ng-include=\"'src/modules/user-data/import-wizard/import-confirmation.html'\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-upload-error\" ng-show=\"errorScreen\">\n" +
    "            <div ng-include=\"'src/modules/user-data/import-wizard/import-system-error.html'\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/user-preference/profile-pic-upload/profile-pic-upload.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-preference/profile-pic-upload/profile-pic-upload.html",
    "<form class=\"bk-profile-pic-upload\">\n" +
    "    <fieldset>\n" +
    "        <blink-current-user-profile-pic></blink-current-user-profile-pic>\n" +
    "        <label for=\"bk-profile-pic-file-input\">\n" +
    "            <span class=\"bk-file-upload-btn bk-btn-orange\">{{strings.Upload_Picture}}</span>\n" +
    "        </label>\n" +
    "        <span class=\"bk-file-upload-toobig-message\" ng-show=\"fileTooBig\">{{alertTooBigMessage}}</span>\n" +
    "        <input class=\"bk-user-id\" type=\"text\" name=\"id\" value=\"{{ currentUserId }}\">\n" +
    "        <input type=\"file\" id=\"bk-profile-pic-file-input\" name=\"content\">\n" +
    "    </fieldset>\n" +
    "    <div class=\"bk-upload-instruction\">{{uploadInstructions}}</div>\n" +
    "</form>");
}]);

angular.module("src/modules/user-preference/user-preference/a3/user-a3-preference.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-preference/user-preference/a3/user-a3-preference.html",
    "<bk-checkbox class=\"notify-share-checkbox\" bk-ctrl=\"$ctrl.emailA3OnSuccessCheckbox\">\n" +
    "</bk-checkbox>\n" +
    "<bk-checkbox class=\"notify-share-checkbox\" bk-ctrl=\"$ctrl.emailA3OnFailureCheckbox\">\n" +
    "</bk-checkbox>\n" +
    "<bk-checkbox class=\"notify-share-checkbox\" bk-ctrl=\"$ctrl.emailAttachmentPdfCheckbox\">\n" +
    "</bk-checkbox>");
}]);

angular.module("src/modules/user-preference/user-preference/user-preference.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/user-preference/user-preference/user-preference.html",
    "<div class=\"bk-user-preference bk-sidebar-layout\">\n" +
    "    <div class=\"bk-left-menu\">\n" +
    "        <div class=\"bk-page-title\">{{$ctrl.strings.Preferences}}</div>\n" +
    "        <div class=\"bk-menu-group\" ng-repeat=\"menu in $ctrl.menus\">\n" +
    "            <ul class=\"bk-filters bk-orange\">\n" +
    "                <li ng-repeat=\"menuItem in menu.items\" ng-click=\"$ctrl.onMenuItemClick(menuItem)\" ng-class=\"{ 'bk-selected': menuItem.selected }\">\n" +
    "                    {{ menuItem.label }}\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bk-list-container\" ng-switch on=\"$ctrl.getCurrentAction().actionType\">\n" +
    "        <div blink-loading-indicator-overlay></div>\n" +
    "        <div class=\"bk-title-bar\">\n" +
    "            <div class=\"bk-list-title\">{{ $ctrl.getCurrentAction().label }}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-switch-when=\"my-profile\" class=\"bk-my-profile\">\n" +
    "\n" +
    "            <div class=\"bk-section-title\">{{$ctrl.strings.Update_my}}</div>\n" +
    "            <div class=\"bk-section bk-profile-picture\">\n" +
    "                <div blink-profile-pic-upload></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"bk-section-title\" ng-show=\"$ctrl.canChangePassword\">{{$ctrl.strings.Update_my2}}</div>\n" +
    "            <div class=\"bk-section bk-account-info\" ng-show=\"$ctrl.canChangePassword\">\n" +
    "                <form>\n" +
    "                    <div>\n" +
    "                        <div class=\"label\">{{$ctrl.strings.Current_Password}}</div>\n" +
    "                        <input class=\"field-input\" type=\"password\" name=\"current_password\" ng-model=\"$ctrl.currentPassword\" blink-on-enter=\"$ctrl.saveAccountInfo()\" spellcheck=\"false\">\n" +
    "                    </div>\n" +
    "                    <div>\n" +
    "                        <div class=\"label\">{{$ctrl.strings.Password}}</div>\n" +
    "                        <input class=\"field-input\" type=\"password\" name=\"password\" ng-model=\"$ctrl.password\" ng-change=\"$ctrl.comparePasswords()\" blink-on-enter=\"$ctrl.saveAccountInfo()\" spellcheck=\"false\">\n" +
    "                    </div>\n" +
    "                    <div>\n" +
    "                        <div class=\"label\">{{strings.Confirm_Password}}</div>\n" +
    "                        <input class=\"field-input\" type=\"password\" name=\"password\" ng-model=\"$ctrl.confirmPassword\" ng-change=\"$ctrl.comparePasswords()\" blink-on-enter=\"$ctrl.saveAccountInfo()\" spellcheck=\"false\">\n" +
    "                    </div>\n" +
    "                    <div ng-click=\"$ctrl.saveAccountInfo()\" class=\"bk-update-info-btn bk-btn-orange\" ng-class=\"{ 'bk-disabled': !$ctrl.allowSave }\">{{strings.Update_Password}}</div>\n" +
    "                    <span class=\"bk-non-matching-passwords-message\" ng-show=\"$ctrl.updatePasswordMessageReady\">{{$ctrl.updatePasswordMessageString}}</span>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"bk-section-title\">{{$ctrl.strings.Update_my3}}</div>\n" +
    "            <div class=\"bk-section bk-preferences\">\n" +
    "                <div>\n" +
    "                    <div class=\"label\">{{strings.preferred_locale}}</div>\n" +
    "                    <div class=\"bk-select-box field-input\">\n" +
    "                        <ui-select ng-model=\"$ctrl.selectedLocale\" ng-disabled=\"$ctrl.isLocalizationDisabled\" theme=\"select2\" on-select=\"$ctrl.onLocaleChanged($item)\">\n" +
    "                            <ui-select-match placeholder=\"{{strings.select_locale}}\">\n" +
    "                                {{$select.selected}}\n" +
    "                            </ui-select-match>\n" +
    "                            <ui-select-choices repeat=\"locale in $ctrl.locales\">\n" +
    "                                {{ locale }}\n" +
    "                            </ui-select-choices>\n" +
    "                        </ui-select>\n" +
    "                        <div class=\"bk-localization-disabled-message\" ng-show=\"$ctrl.isLocalizationDisabled\">\n" +
    "                            {{strings.localizationDisabled}}</div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <bk-checkbox class=\"notify-share-checkbox\" bk-ctrl=\"$ctrl.notifyOnShareCheckbox\"></bk-checkbox>\n" +
    "            </div>\n" +
    "\n" +
    "            \n" +
    "            <div class=\"bk-section-title\" ng-if=\"!!$ctrl.isA3Enabled()\">{{$ctrl.strings.preferences.a3.title}}</div>\n" +
    "            <div class=\"bk-section bk-preferences\" ng-if=\"!!$ctrl.isA3Enabled()\">\n" +
    "                <bk-user-a3-preference bk-ctrl=\"$ctrl.userA3PreferenceComponent\">\n" +
    "                </bk-user-a3-preference>\n" +
    "            </div>\n" +
    "\n" +
    "            \n" +
    "            <div class=\"bk-section-title\" ng-if=\"i$ctrl.sSlackEnabled()\">{{strings.Slack_Integration}}</div>\n" +
    "            <div class=\"bk-section\" ng-if=\"$ctrl.isSlackEnabled()\">\n" +
    "                <div ng-if=\"!$ctrl.hasLinkedSlackAccount()\" ng-click=\"$ctrl.linkSlackAccount()\" class=\"bk-update-info-btn bk-btn-orange\">{{strings.Integrate_Slack}}</div>\n" +
    "                <div ng-if=\"!!$ctrl.hasLinkedSlackAccount()\">\n" +
    "                    <div><span>{{$ctrl.strings.Slack_Username}}</span>{{$ctrl.slackUserInfo.userName}}</div>\n" +
    "                    <div><span>{{$ctrl.strings.Slack_TeamName}}</span>{{$ctrl.slackUserInfo.teamName}}</div>\n" +
    "                    <div ng-click=\"$ctrl.unlinkAccount()\" class=\"bk-update-info-btn bk-btn-orange\">{{$ctrl.strings.Unlink_Slack}}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-a3-analysis.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-a3-analysis.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemA3AnalysisController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"triggerA3()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-magic-wand\"></div>\n" +
    "{{strings.A3_Analysis}}\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-apply-as-runtime-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-apply-as-runtime-filter.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemApplyAsRuntimeFilterController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"applyAsRuntimeFilter()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-filter\"></div>\n" +
    "        <span>{{strings.ApplyAsRuntimeFilter}}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-custom-a3-analysis.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-custom-a3-analysis.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemCustomA3AnalysisController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"launchCustomAnalysis()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-configure\"></div>\n" +
    "        {{strings.customA3Analysis}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-drill.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-drill.html",
    "<div class=\"bk-drill-sub-menu context-sub-menu\" ng-controller=\"MenuItemDrillController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"toggleDrillOptions()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-drill-down\"></div>\n" +
    "{{strings.Drill_down}}\n" +
    "</div>\n" +
    "    <div ng-show=\"showDrillOptions\" class=\"bk-drill-content-container\">\n" +
    "        <div class=\"bk-search-wrapper\">\n" +
    "            <div class=\"bk-search-icon\"></div>\n" +
    "            <input type=\"text\" ng-model=\"itemFilter\" spellcheck=\"false\" blink-auto-focus ng-change=\"handleDrillSearch(itemFilter)\">\n" +
    "        </div>\n" +
    "        <div class=\"bk-items\">\n" +
    "            <li ng-repeat=\"item in items | filter:itemFilter\" ng-click=\"handleDrillCompletionClick(item)\" blink-tooltip=\"{{item.tooltipText}}\" class=\"bk-item\">\n" +
    "                {{ item.tokenText }}\n" +
    "                <span class=\"bk-lineage bk-right\">{{ item.lineage }}</span>\n" +
    "                </li>\n" +
    "            <li class=\"bk-no-select\" ng-show=\"!(items | filter:itemFilter).length\">{{strings.No_matches}}</li>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-exclude.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-exclude.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemExcludeIncludeController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"exclude()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-filter\"></div>\n" +
    "<span>{{strings.Exclude}}</span>{{ clickedValue }}\"\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-include.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-include.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemExcludeIncludeController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"showOnly()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-filter\"></div>\n" +
    "<span>{{strings.Only_show}}</span>{{ clickedValue }}\"\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/menu-item-leaf-level-data.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/menu-item-leaf-level-data.html",
    "<div class=\"context-sub-menu\" ng-controller=\"MenuItemLeafDataController\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"launchLeafLevelData()\">\n" +
    "        <div class=\"bk-icon bk-style-icon-layers\"></div>\n" +
    "{{strings.Show_underlying}}\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-context-menu/templates/related-items.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-context-menu/templates/related-items.html",
    "<div>\n" +
    "    <div class=\"bk-context-menu-subtitle\" ng-if=\"$ctrl.relatedItems.length > 0\">\n" +
    "        {{ $ctrl.RELATED_ITEMS_TITLE }}\n" +
    "    </div>\n" +
    "    <div ng-click=\"$ctrl.onRelatedItemClicked(item)\" ng-repeat=\"item in $ctrl.relatedItems\">\n" +
    "        <div class=\"bk-sub-menu-item\">\n" +
    "            <div class=\"context-sub-menu\">\n" +
    "                <div class=\"context-sub-menu-title-container\">\n" +
    "                    <div class=\"bk-icon bk-style-icon-{{item.type}}\"></div>\n" +
    "                    {{ item.name }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/answer/answer-visualization-viewer/answer-visualization-viewer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/answer/answer-visualization-viewer/answer-visualization-viewer.html",
    "<div class=\"bk-answer-visualization-viewer\" ng-switch=\"$ctrl.loadingData\">\n" +
    "    <blink-loading-indicator ng-switch-when=\"true\" loading-text=\"$ctrl.strings.LOADING_MSG\">\n" +
    "    </blink-loading-indicator>\n" +
    "    <div class=\"bk-answer-visualizations\" ng-switch-when=\"false\">\n" +
    "        <div class=\"bk-answer-table-mode-vizs\" ng-lazy-show=\"$ctrl.isTableMode()\">\n" +
    "            <bk-data-viz class=\"bk-answer-table-viz-container\" bk-ctrl=\"$ctrl.tableVizComponent\">\n" +
    "            </bk-data-viz>\n" +
    "            <div class=\"bk-headline-container\">\n" +
    "                <bk-data-viz class=\"bk-answer-headline-viz-container\" ng-repeat=\"headlineVizComponent in $ctrl.headlineVizComponents\" bk-ctrl=\"headlineVizComponent\">\n" +
    "                </bk-data-viz>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-answer-chart-mode-vizs\" ng-lazy-show=\"!$ctrl.isTableMode()\">\n" +
    "            <bk-data-viz class=\"bk-answer-chart-viz-container\" bk-ctrl=\"$ctrl.chartVizComponent\">\n" +
    "            </bk-data-viz>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/answer/pinboard-content.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/answer/pinboard-content.html",
    "<div class=\"bk-pinboard-content\">\n" +
    "    <div class=\"bk-pinboard-container\" ng-controller=\"PinboardContentController\">\n" +
    "        <bk-pinboard-answer class=\"bk-pinboard-answer-container\" bk-ctrl=\"config.pinboardAnswerController\">\n" +
    "        </bk-pinboard-answer>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-panel/chart-type-selector-panel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-panel/chart-type-selector-panel.html",
    "<div class=\"bk-viz-selector\">\n" +
    "    <div class=\"bk-close-selector\" ng-click=\"$ctrl.onClose()\">\n" +
    "        <img src=\"{{'/resources/img/cancel_icon_16.svg'}}\">\n" +
    "    </div>\n" +
    "    <bk-chart-type-selector-v2 class=\"bk-viz-selector-inner\" bk-ctrl=\"$ctrl.chartTypeSelectorComponent\"></bk-chart-type-selector-v2>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-v2/chart-type-selector-v2.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-v2/chart-type-selector-v2.html",
    "<div class=\"bk-chart-type-selector\">\n" +
    "    <div ng-repeat=\"chartType in $ctrl.getChartTypes()\" chart-type=\"{{chartType}}\" class=\"bk-viz-type-selector\" ng-class=\"{'bk-viz-type-selected': $ctrl.isCurrentType(chartType),\n" +
    "         'bk-disabled-chart-type-option': !$ctrl.isVizTypeSupported(chartType)}\" blink-tooltip=\"{{$ctrl.getTooltip(chartType)}}\" data-placement=\"auto bottom\" data-html=\"true\" ng-click=\"$ctrl.onVizTypeSelection(chartType)\">\n" +
    "        <div class=\"bk-viz-selector-icon\">\n" +
    "            <img src=\"{{$ctrl.getChartImagePath(chartType)}}\">\n" +
    "        </div>\n" +
    "        <span class=\"bk-viz-selector-title\">\n" +
    "                {{$ctrl.getDisplayName(chartType)}}\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/answer/viz-type-selector/table-type-selector/table-type-selector.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/answer/viz-type-selector/table-type-selector/table-type-selector.html",
    "<div class=\"bk-toggle-table-selector-display\" ng-class=\"{'bk-drawer-open' : $ctrl.isSelected}\" blink-tooltip=\"{{$ctrl.strings.VIEW_TABLE}}\" ng-click=\"$ctrl.onClick($ctrl.vizType)\">\n" +
    "    <div class=\"bk-viz-selector-icon\">\n" +
    "        <img src=\"/resources/img/viz-selector-icons/table_icon_24.svg\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/pinboard/pinboard-answer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/pinboard/pinboard-answer.html",
    "<div class=\"bk-pinboard-answer\" ng-class=\"{\n" +
    "      'bk-editable-layout': allowLayoutEdit,\n" +
    "      'bk-insightful-pinboard': $ctrl.isAutoCreated,\n" +
    "      'bk-pinboard-loaded': !!$ctrl.isLoaded()\n" +
    "    }\">\n" +
    "    <bk-slide-show-v2 class=\"bk-answer-canvas\" ng-class=\"{\n" +
    "                    'bk-answer-rendering-vizs': isRenderingVisualizations(),\n" +
    "                    'bk-narrow-margin': $ctrl.isAutoCreated\n" +
    "                }\" bk-ctrl=\"$ctrl.slideShow\">\n" +
    "        <div class=\"tile-container\">\n" +
    "            <li class=\"grid-sizer tile-size-xs\"></li>\n" +
    "            <li class=\"gutter-sizer tile-gutter\"></li>\n" +
    "            <div class=\"bk-pinboard-tile tile-size-{{$ctrl.vizIdToLayoutTileMap[vizId].size}} bk-packable\" ng-repeat=\"(vizId, pinboardVizCardComponent) in $ctrl.pinboardVizCardComponents track by vizId\" id=\"{{vizId}}\">\n" +
    "                <bk-pb-card class=\"bk-pinboard-viz-card-container\" bk-ctrl=\"pinboardVizCardComponent\">\n" +
    "                </bk-pb-card>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </bk-slide-show-v2>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/axis-label/axis-label.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/axis-label/axis-label.html",
    "<div class=\"bk-axis-label\" uib-popover-template=\"columnControlTemplateUrl\" popover-trigger=\"none\" popover-is-open=\"isColumnControlOpened\" popover-append-to-body=\"true\" popover-placement=\"{{getColumnControlPopoverDirection()}}\" popover-class=\"bk-column-control-popover\">\n" +
    "    <div class=\"bk-axis-label-control\" ng-click=\"openColumnControls()\">\n" +
    "        <div class=\"bk-axis-label-title\">{{vizColumn.getName()}}</div>\n" +
    "        <div class=\"bk-icon-arrow-down\" ng-show=\"areAxisOperationsAllowed()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-sort-indicator {{getDirectionClass()}}\" ng-click=\"onSortClick()\" ng-show=\"areAxisOperationsAllowed() && isSortedByColumn()\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"column-control.html\">\n" +
    "    <div class=\"column-control\"\n" +
    "         blink-overlay=\"closeColumnControls()\"\n" +
    "         ignore-click-selector=\"['.filter-text', '.datepicker.datepicker-dropdown']\">\n" +
    "        <column-control viz-model=\"vizModel\"\n" +
    "                        viz-column=\"vizColumn\"\n" +
    "                        close-column-control=\"closeColumnControls()\"\n" +
    "                        on-chart-redraw-needed=\"onChartRedrawNeeded()\"\n" +
    "                        sage-client=\"sageClient\">\n" +
    "        </column-control>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/viz-layout/viz/chart/chart-export-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/chart-export-control.html",
    "<div ng-show=\"viz.isDownloadChartSupported()\" class=\"bk-viz-image-download-btn\" ng-click=\"viz.onChartDownloadBtnClick($event)\">\n" +
    "    <div>\n" +
    "        <div class=\"bk-viz-btn-icon bk-style-icon-download\" ng-class=\"{'bk-viz-btn-disabled': !viz.isDataDownloadAllowed()}\" blink-tooltip=\"{{ viz.getDownloadTooltip() }}\"></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/chart/chart-legend/chart-legend.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/chart-legend/chart-legend.html",
    "<div class=\"bk-legend\">\n" +
    "    <div class=\"bk-legend-content\" ng-style=\"{'max-height': getAvailableHeight() + 'px'}\">\n" +
    "        <ul class=\"bk-legend-content-inner\">\n" +
    "            <li class=\"bk-legend-item\" ng-class=\"{'bk-selected': !!getSeriesColor(label) }\" sf-virtual-repeat=\"label in legendLabels\" ng-model=\"virtualRepeatModel\">\n" +
    "                <div class=\"bk-legend-marker-container\" ng-click=\"$event.stopPropagation()\">\n" +
    "                    <color-picker class=\"bk-legend-marker\" fill=\"true\" ng-model=\"getSerie(label).color\" on-change=\"updateSeriesColor()\"></color-picker>\n" +
    "                </div>\n" +
    "                <div class=\"bk-legend-label bk-overflow-ellipsis\" blink-tooltip=\"{{label}}\" ng-click=\"onContainerClick($event)\">{{label}}\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"bk-legend-singular-select\" ng-class=\"{'bk-legend-singular-select-selected': isOnlySelectedSeries(label)}\" ng-click=\"onSingularSeriesSelectionClick($event, label)\">{{strings.only}}\n" +
    "                </div>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/chart/chart-pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/chart-pagination.html",
    "<div class=\"bk-chart-pagination\" ng-show=\"chartPagination.canPaginate()\">\n" +
    "    <span class=\"bk-page-num\"><span>{{strings.Chart_page}}</span>{{ getCurrentPageNumber() }}</span>\n" +
    "    <span class=\"bk-link bk-control bk-next\" ng-class=\"{'bk-inactive': !chartPagination.canShowPrev()}\" ng-click=\"chartPagination.onPrev()\"></span>\n" +
    "    <span class=\"bk-link bk-control bk-prev\" ng-class=\"{'bk-inactive': !chartPagination.canShowNext()}\" ng-click=\"chartPagination.onNext()\"></span>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/chart/chart.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/chart.html",
    "<div ng-if=\"viz.isEmpty()\" class=\"bk-no-content-placeholder\">{{ 'No data to display' | l10n }}</div>\n" +
    "<div ng-if=\"viz.isPendingDataLoad()\" class=\"bk-no-content-placeholder\">{{ 'Loading data...' | l10n }}</div>\n" +
    "<div ng-if=\"viz.dataError\" class=\"alert alert-error\">{{ 'Invalid data' | l10n }}</div>\n" +
    "<div ng-if=\"isDataNotSupported()\" class=\"chartDataNotSupported\">{{ getDataDisabledChartExplanation() | l10n }}</div>\n" +
    "\n" +
    "<div class=\"chart-container\" ng-class=\"{ 'bk-vertical-layout': isLegendVertical(),\n" +
    "     'bk-horizontal-layout': isLegendHorizontal() }\">\n" +
    "\n" +
    "     <div class=\"bk-chart\" chart-type=\"{{getChartType()}}\" ng-hide=\"isChartHidden()\" ng-style=\"{'visibility': markChartInvisible() ?'hidden':'visible'}\" ng-mousedown=\"chartMouseDown = true\" ng-mouseup=\"chartMouseDown = false\" ng-class=\"{ 'bk-zoom-mode' : !isInPanMode(),\n" +
    "          'bk-pan-mode': isInPanMode() && isZoomedIn(),\n" +
    "          'bk-mouse-down': chartMouseDown }\"></div>\n" +
    "\n" +
    "     <div chart-legend ng-init=\"render()\" viz-model=\"viz.getModel()\" chart=\"chart\" chart-type=\"{{getChartType()}}\" available-height=\"getAvailableLegendHeight()\" ng-if=\"!legendDisabled && !isChartHidden()\" class=\"bk-chart-legend\" ng-class=\"{'bk-legend-vertical': isLegendVertical(),\n" +
    "          'bk-legend-horizontal': isLegendHorizontal()}\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"chart-axis.html\">\n" +
    "    <axis-label class=\"bk-axis-label\"\n" +
    "                viz-model=\"vizModel\"\n" +
    "                viz-column=\"vizColumn\"\n" +
    "                sage-client=\"sageClient\"\n" +
    "                is-axis-vertical=\"isAxisVertical\"\n" +
    "                is-column-control-opened=\"isColumnControlOpened\"\n" +
    "                axis-relative-position=\"axisRelativePosition\"\n" +
    "                blink-tooltip=\"{{tooltip}}\"\n" +
    "                data-html=\"true\"\n" +
    "                data-placement=\"{{tooltipPlacement}}\">\n" +
    "    </axis-label>\n" +
    "</script>");
}]);

angular.module("src/modules/viz-layout/viz/chart/color-scale/color-scale.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/color-scale/color-scale.html",
    "<div class=\"bk-color-scale\">\n" +
    "    <div class=\"bk-color-labels\">\n" +
    "        <div class=\"bk-color-left-value\">{{$ctrl.leftText}}</div>\n" +
    "        <div class=\"bk-color-right-value\">{{$ctrl.rightText}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-color-bar\">\n" +
    "        <div class=\"bk-color-scale-block\" ng-repeat=\"color in $ctrl.colors\" ng-style=\"{backgroundColor: color}\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/chart/geomap/2d/blink-geo-map.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/chart/geomap/2d/blink-geo-map.html",
    "<div class=\"bk-geomap-ol-container\"></div>\n" +
    "\n" +
    "<bk-color-scale ng-if=\"!!$ctrl.colorScaleCtrl\" bk-ctrl=\"$ctrl.colorScaleCtrl\">\n" +
    "</bk-color-scale>\n" +
    "\n" +
    "<div popover-class=\"bk-geo-map-tooltip\" uib-popover-template=\"'geo-map-tooltip.html'\" popover-is-open=\"$ctrl.tooltip.shown\" popover-append-to-body=\"true\" popover-trigger=\"none\" popover-placement=\"auto bottom-left\" ng-style=\"{position: 'fixed', top: $ctrl.tooltip.top, left: $ctrl.tooltip.left}\">\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"geo-map-tooltip.html\">\n" +
    "    <ul>\n" +
    "        <li class=\"bk-geo-map-tooltip-row\" ng-repeat=\"(key, value) in $ctrl.tooltip.content\">\n" +
    "            <span class=\"bk-key\">{{key}}:</span>\n" +
    "            <span class=\"bk-value\">{{value}}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</script>");
}]);

angular.module("src/modules/viz-layout/viz/column-control/column-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/column-control/column-control.html",
    "<div class=\"bk-menu-body bk-column-control\" blink-overlay=\"removeColumnControl()\" ignore-click-selector=\"['.datepicker.datepicker-dropdown']\">\n" +
    "    <div ng-if=\"!shouldShowMetricsUI() && !isFilterModelAvailable\">\n" +
    "        <div ng-if=\"shouldShowAggregates()\" class=\"bk-aggregates\" ng-repeat=\"(label, aggr) in aggregates\" ng-click=\"onAggregationClick(aggr)\" ng-class=\"{'bk-style-icon-checkmark': vizColumn.getEffectiveAggregateType() === aggr}\">\n" +
    "            {{label}}\n" +
    "        </div>\n" +
    "        <div ng-if=\"shouldShowTimeBuckets()\" class=\"bk-time-buckets\" ng-repeat=\"bucketing in timeBuckets\" ng-click=\"onTimeBucketingClick(bucketing)\" ng-class=\"{'bk-style-icon-checkmark': vizColumn.getTimeBucket() === bucketing}\">\n" +
    "            {{ timeBucketFormat(bucketing) }}\n" +
    "        </div>\n" +
    "        <div class=\"bk-separator\" ng-if=\"shouldShowAggregates() || shouldShowTimeBuckets()\"></div>\n" +
    "        <div ng-if=\"shouldShowFiltersOption()\" class=\"bk-filter\" ng-click=\"onFilterClick($event)\">{{strings.FILTER}}</div>\n" +
    "        <div ng-if=\"shouldShowFiltersOption()\" class=\"bk-separator\"></div>\n" +
    "        <div ng-if=\"shouldShowMetricsOption()\" class=\"bk-metrics\" ng-click=\"onMetricsClick()\">{{strings.Conditional_Formatting}}</div>\n" +
    "        <div ng-if=\"shouldShowMetricsOption()\" class=\"bk-separator\"></div>\n" +
    "        <div ng-if=\"isEditable\" class=\"bk-sort\" ng-click=\"onSortClick()\">{{strings.SORT}}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/common/pinboard-drop-down/pinboard-drop-down.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/common/pinboard-drop-down/pinboard-drop-down.html",
    "<div class=\"bk-viz-pinner-modal\">\n" +
    "    <div class=\"bk-viz-title\">\n" +
    "        <blink-content-editable fullspan ng-model=\"pinTitle.name\" description=\"pinTitle.desc\">\n" +
    "        </blink-content-editable>\n" +
    "    </div>\n" +
    "    <div class=\"bk-search\" ng-show=\"pinboards.length > 6\">\n" +
    "        <input type=\"text\" class=\"bk-search-input\" placeholder=\"{{strings.SEARCH_PLACEHOLDER}}\" ng-model=\"searchFilter.name\">\n" +
    "    </div>\n" +
    "    <ul class=\"bk-pinboard-list\" ng-class=\"{\n" +
    "            'bk-loading' : shouldShowLoadingIndicator()\n" +
    "        }\">\n" +
    "        <li class=\"bk-create-pinboard-row\">\n" +
    "                <div class=\"bk-show-create-pinboard-btn\" ng-hide=\"showNewPinboardInput\" ng-click=\"onShowCreatePinboardClick()\">\n" +
    "                    <span class=\"bk-pinboard-icon\"></span>\n" +
    "                    <span class=\"bk-label\">{{strings.CREATE_NEW_PINBOARD}}</span>\n" +
    "                </div>\n" +
    "                <div class=\"bk-new-pinboard-input\" ng-show=\"showNewPinboardInput\">\n" +
    "                    <div class=\"bk-pinboard-icon\"></div>\n" +
    "                    <input type=\"text\" class=\"bk-input\" placeholder=\"{{strings.NEW_PINBOARD_NAME_PLACEHOLDER}}\" ng-model=\"newPinboardName\" ng-enter=\"createPinboard()\">\n" +
    "                    <a class=\"bk-btn bk-create-pinboard-btn\" ng-click=\"createPinboard()\" ng-class=\"{ 'bk-disabled': !newPinboardNameIsValid || addingPinboard }\">\n" +
    "                        {{strings.ADD_PINBOARD}}\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "        </li>\n" +
    "        <li ng-repeat=\"pinboard in pinboards | filter:searchFilter\" ng-click=\"onAddToPinboardClick(pinboard)\" class=\"bk-pinboard-row bk-overflow-ellipsis\" ng-class=\"{ 'bk-selected': pinboard.selected }\" blink-tooltip=\"{{ pinboard.tooltip }}\" data-html=\"true\" data-placement=\"left\">\n" +
    "                <span class=\"bk-plus-icon\" ng-show=\"!pinboardsWithActiveVizAddition[pinboard.id]\">\n" +
    "                    <span></span>\n" +
    "                </span>\n" +
    "                <span class=\"bk-pinboard-working\" ng-show=\"!!pinboardsWithActiveVizAddition[pinboard.id]\">\n" +
    "                </span>\n" +
    "            <span class=\"bk-pinboard-name\" ng-bind-html=\"pinboard.name | searchResultHighlight:searchFilter.name\">\n" +
    "            </span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner.html",
    "<div ng-switch=\"$ctrl.isHeadlineVizType\">\n" +
    "    <bk-icon-button ng-switch-when=\"true\" icon=\"bk-style-icon-pin\" class=\"bk-add-to-pinboard\" blink-tooltip=\"{{$ctrl.strings.ADD_TO_PINBOARD}}\" ng-click=\"$ctrl.launchPinningWorkflow()\">\n" +
    "    </bk-icon-button>\n" +
    "    <div ng-switch-when=\"false\" class=\"bk-add-to-pinboard\" blink-tooltip=\"{{$ctrl.strings.ADD_TO_PINBOARD}}\" ng-click=\"$ctrl.launchPinningWorkflow()\">\n" +
    "        <img src=\"resources/img/pin_icon_24.svg\">\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/common/pinboard-snapshot/pinboard-snapshot.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/common/pinboard-snapshot/pinboard-snapshot.html",
    "<div class=\"bk-viz-pinner-modal\">\n" +
    "    <div class=\"bk-search\" ng-show=\"snapshots.length > 6\">\n" +
    "        <input type=\"text\" class=\"bk-search-input\" placeholder=\"{{strings.SEARCH_PLACEHOLDER}}\" ng-model=\"searchFilter.name\">\n" +
    "    </div>\n" +
    "    <ul class=\"bk-snapshot-list\" ng-class=\"{\n" +
    "            'bk-loading' : shouldShowLoadingIndicator()\n" +
    "        }\">\n" +
    "        <li class=\"bk-create-snapshot-row\">\n" +
    "                <span class=\"bk-show-create-snapshot-btn\" ng-hide=\"showNewSnapshotInput\" ng-click=\"onShowCreateSnapshotClick()\">\n" +
    "                    <span class=\"bk-snapshot-icon\"></span>\n" +
    "                    <span class=\"bk-label\">{{strings.CREATE_NEW_SNAPSHOT}}</span>\n" +
    "                </span>\n" +
    "                <span class=\"bk-new-snapshot-input\" ng-show=\"showNewSnapshotInput\">\n" +
    "                    <span class=\"bk-snapshot-icon\"></span>\n" +
    "                    <input type=\"text\" class=\"bk-input\" placeholder=\"{{strings.NEW_SNAPSHOT_NAME_PLACEHOLDER}}\" ng-model=\"newSnapshotName\" ng-enter=\"takeSnapshot()\">\n" +
    "                    <input type=\"text\" class=\"bk-input\" placeholder=\"{{strings.NEW_SNAPSHOT_DESCRIPTION_PLACEHOLDER}}\" ng-model=\"newSnapshotDescription\" ng-enter=\"takeSnapshot()\">\n" +
    "                    <a class=\"bk-btn bk-create-snapshot-btn\" ng-click=\"takeSnapshot()\" ng-class=\"{ 'bk-disabled': !newSnapshotInputIsValid || updatingSnapshotList }\">\n" +
    "                        {{strings.TAKE_SNAPSHOT}}\n" +
    "                    </a>\n" +
    "                </span>\n" +
    "        </li>\n" +
    "        <li ng-repeat=\"snapshot in snapshots | filter:searchFilter\" class=\"bk-snapshot-row bk-overflow-ellipsis\" ng-class=\"{ 'bk-selected': snapshot.selected }\" blink-tooltip=\"{{ snapshot.tooltip }}\" data-html=\"true\" data-placement=\"left\">\n" +
    "          <span class=\"bk-delete-icon\" ng-show=\"!snapshotsWithActiveVizAddition[snapshot.id]\" ng-click=\"onDeleteSnapshot(snapshot)\">\n" +
    "                    <span></span>\n" +
    "                </span>\n" +
    "            <span class=\"bk-snapshot-name\" ng-bind-html=\"snapshot.name | searchResultHighlight:searchFilter.name\" ng-click=\"onNavigateToSnapshot(snapshot)\">\n" +
    "            </span>\n" +
    "            <span class=\"bk-snapshot-timestamp\" ng-bind-html=\"formatSnapshotTimestamp(snapshot) | searchResultHighlight:searchFilter.name\" ng-click=\"onNavigateToSnapshot(snapshot)\">\n" +
    "            </span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/filter-v2/attribute-filter/attribute-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter-v2/attribute-filter/attribute-filter.html",
    "<div class=\"bk-attribute-filter\">\n" +
    "    <div ng-show=\"$ctrl.showCheckboxFilter()\">\n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        <blink-checkbox-filter-v3 class=\"bk-cb-filter-content\" bk-ctrl=\"$ctrl.checkboxFilterController\">\n" +
    "        </blink-checkbox-filter-v3>\n" +
    "        <div ng-show=\"!$ctrl.isReadOnly\" class=\"bk-add-filter-link-container\">\n" +
    "            <a class=\"bk-add-bulk-filter-link\" ng-click=\"$ctrl.onAddValuesInBulkClick()\">\n" +
    "                {{$ctrl.getAddValuesInBulkText()}}</a>\n" +
    "        </div>\n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "        \n" +
    "    </div>\n" +
    "    <div ng-show=\"$ctrl.showBulkFilter()\">\n" +
    "        <div class=\"bk-revert-to-checkbox-filter-container\">\n" +
    "            <a class=\"bk-revert-to-checkbox-filter-link\" ng-click=\"$ctrl.onRevertBackFromBulkAdd()\">\n" +
    "                {{$ctrl.getRevertBackToCheckBoxFilterText()}}\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <bulk-filter-v2 ctrl=\"$ctrl.bulkFilterController\">\n" +
    "        </bulk-filter-v2>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/filter-v2/bulk-filter/bulk-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter-v2/bulk-filter/bulk-filter.html",
    "<div class=\"bk-bulk-filter\">\n" +
    "    <div ng-switch=\"loading\">\n" +
    "        <blink-loading-indicator ng-switch-when=\"true\">\n" +
    "        </blink-loading-indicator>\n" +
    "        <div ng-switch-when=\"false\">\n" +
    "            <div ng-if=\"parsingErrors.length\" class=\"bk-bulk-filter-error bk-bulk-filter-parsing-error\">\n" +
    "                {{getParsingErrorString()}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"unmatchedValues.length\" class=\"bk-bulk-filter-error bk-bulk-filter-unmatched-error\">\n" +
    "                {{getErrorString()}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"invalidValueErrors.length\" class=\"bk-bulk-filter-error bk-bulk-filter-invalid-values-error\">\n" +
    "                {{getInvalidValueError()}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"limitErrors.oneTimeAdditionExceeded\" class=\"bk-bulk-filter-error bk-bulk-filter-one-time-error\">\n" +
    "                {{getOneTimeAdditionExceededLimitError()}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"limitErrors.filterValuesExceeded\" class=\"bk-bulk-filter-error bk-bulk-filter-limit-error\">\n" +
    "                {{getFilterValuesExceededLimitError()}}\n" +
    "            </div>\n" +
    "            <textarea class=\"bk-bulk-filter-text-area\" blink-auto-focus rows=\"3\" placeholder=\"{{getTextAreaPlaceholderText()}}\" ng-model=\"$parent.editorText.editorText\">\n" +
    "            </textarea>\n" +
    "            <blink-checkbox-collection ng-if=\"validatedCheckboxValues.length > 0\" bk-ctrl=\"checkboxCollectionCtrl.ctrl\">\n" +
    "            </blink-checkbox-collection>\n" +
    "        </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "");
}]);

angular.module("src/modules/viz-layout/viz/filter-v2/checkbox-filter-v3/checkbox-filter-v3.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter-v2/checkbox-filter-v3/checkbox-filter-v3.html",
    "<div>\n" +
    "    <blink-smart-checkbox-collection ng-if=\"!!$ctrl.showRelevantValues\" bk-ctrl=\"$ctrl.relevantSmartCheckboxCollectionCtrl\">\n" +
    "    </blink-smart-checkbox-collection>\n" +
    "    <blink-smart-checkbox-collection ng-if=\"!$ctrl.showRelevantValues\" bk-ctrl=\"$ctrl.allSmartCheckboxCollectionCtrl\">\n" +
    "    </blink-smart-checkbox-collection>\n" +
    "    <bk-checkbox class=\"bk-show-all-values-toggler-checkbox\" ng-if=\"!!$ctrl.showAllTogglerCBCtrl\" blink-tooltip=\"{{strings.filters.Show_All_Possible_Values_Tooltip}}\" bk-ctrl=\"$ctrl.showAllTogglerCBCtrl\">\n" +
    "    </bk-checkbox>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/filter-v2/checkbox-filter/checkbox-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter-v2/checkbox-filter/checkbox-filter.html",
    "<div class=\"bk-checkbox-filter\" ng-init=\"setCheckboxItems()\">\n" +
    "    <div class=\"bk-cb-filter-search-container\">\n" +
    "        <input class=\"bk-search-input\" type=\"text\" blink-auto-focus spellcheck=\"false\" placeholder=\"{{displayTextValues.TYPE_A_VALUE}}\" ng-model=\"searchText\" ng-hide=\"hideSearchBar()\" ng-change=\"onSearchTextChange()\">\n" +
    "    </div>\n" +
    "    <div class=\"bk-cb-filter-top-section\" ng-hide=\"isReadOnly\">\n" +
    "        <div class=\"bk-section-control\" ng-click=\"changeSectionTo('ALL')\" ng-class=\"{active: inAllSection()}\">{{displayTextValues.ALL}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-section-control\" ng-click=\"changeSectionTo('SELECTED')\" ng-class=\"{active: inSelectedSection()}\">{{displayTextValues.SELECTED}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-cb-filter-lists-section\" ng-switch on=\"selectedSection\">\n" +
    "        <div class=\"bk-cb-filter-selected-section\" ng-switch-when=\"SELECTED\">\n" +
    "            <blink-checkbox-collection bk-ctrl=\"selectedTabCheckboxCollectionCtrl\">\n" +
    "            </blink-checkbox-collection>\n" +
    "            <div ng-hide=\"selectedTabCheckboxCollection.length > 0\" class=\"bk-cb-no-selected-filter-container\">\n" +
    "                <div class=\"bk-no-content-placeholder bk-no-selected-filter-label\">\n" +
    "                    {{displayTextValues.NO_SELECTED_FILTER}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bk-cb-filter-all-section\" ng-switch-when=\"ALL\">\n" +
    "            <div ng-switch on=\"showLoadingIndicator\">\n" +
    "                <div ng-switch-when=\"true\" class=\"bk-filter-search-pending-indicator\">\n" +
    "                    <blink-loading-indicator></blink-loading-indicator>\n" +
    "                </div>\n" +
    "                <div ng-switch-when=\"false\" ng-switch=\"hasMoreValuesThanPageSize()\">\n" +
    "                    <div ng-switch-when=\"true\">\n" +
    "                        <div class=\"bk-no-content-placeholder bk-filter-too-many-values\">\n" +
    "                            {{ getTooManyValuesMessage() }}\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-filter-sample-value-header\">\n" +
    "                            {{displayTextValues.SAMPLE_VALUES}}\n" +
    "                        </div>\n" +
    "                        <div class=\"bk-filter-sample-values\" ng-repeat=\"sampleValue in getSampleValues()\" ng-bind-html=\"sampleValue\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div ng-switch-when=\"false\" ng-switch=\"allTabCheckboxCollection.length > 0\">\n" +
    "                        <div ng-switch-when=\"false\">\n" +
    "                            <div class=\"bk-no-content-placeholder bk-no-matches-message\">\n" +
    "                                {{displayTextValues.NO_MATCHES}}\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                        <div ng-switch-when=\"true\">\n" +
    "                            <blink-checkbox-collection bk-ctrl=\"allTabCheckboxCollectionCtrl\">\n" +
    "                            </blink-checkbox-collection>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/filter-v2/filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter-v2/filter.html",
    "<div class=\"bk-viz-filter\" ng-switch=\"loadingFilter\">\n" +
    "    <div class=\"bk-filter-loading-indicator\" ng-switch-when=\"true\">\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "        <div ng-switch=\"filterModel.isSupportedByUI()\">\n" +
    "            <div ng-switch-when=\"false\">\n" +
    "                 <div ng-include=\"'src/modules/viz-layout/viz/filter/empty-filter.html'\"></div>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <div ng-if=\"isReadOnly\" class=\"bk-filter-read-only\">\n" +
    "                    {{readOnlyFilterMessage}}\n" +
    "                </div>\n" +
    "                <div class=\"bk-filter-content\" ng-switch=\"getFilterType()\">\n" +
    "                    <blink-numeric-range-select ng-switch-when=\"RangeFilter\" ctrl=\"rangeFilterController\">\n" +
    "                    </blink-numeric-range-select>\n" +
    "                    <bk-attribute-filter ng-switch-when=\"AttributeFilter\" bk-ctrl=\"attributeFilterComponent\">\n" +
    "                    </bk-attribute-filter>\n" +
    "                    <blink-date-range-select ng-switch-when=\"DateFilter\" ctrl=\"dateFilterController\">\n" +
    "                    </blink-date-range-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/filter/empty-filter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/filter/empty-filter.html",
    "<div class=\"bk-unsupported-filter-placeholder\">{{strings.This_filter_type}}</div>");
}]);

angular.module("src/modules/viz-layout/viz/headline/headline.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/headline/headline.html",
    "<div ng-show=\"viz.isEmpty()\" class=\"bk-no-content-placeholder\">{{ 'No data to display' | l10n }}</div>\n" +
    "<div ng-show=\"viz.isPendingDataLoad()\" class=\"bk-no-content-placeholder\">{{ 'Loading data...' | l10n }}</div>\n" +
    "<div ng-show=\"!viz.isEmpty()\" class=\"bk-summary-container\" ng-class=\"{'bk-date-summaries': isDateHeadline()}\">\n" +
    "    <div class=\"bk-headline-content\">\n" +
    "        <div ng-if=\"!isDateHeadline()\">\n" +
    "            <div class=\"bk-overflow-ellipsis\" blink-tooltip=\"{{headline.summaries[0].tooltipContent}}\" auto-tooltip-style=\"bootstrap\">\n" +
    "                <div ng-hide=\"isUpdating\" class=\"bk-headline-value\">{{ headline.summaries[0].value }}</div>\n" +
    "                <div ng-show=\"isUpdating\" class=\"bk-headline-value-updating-placeholder\">{{strings.Updating}}</div>\n" +
    "            </div>\n" +
    "            <div ng-show=\"!viz.getModel().isPinboardViz()\">\n" +
    "                <div class=\"bk-headline-aggregation-selector\" ng-show=\"viz.getModel().shouldShowSummaryAggregates()\">\n" +
    "                    <div class=\"column-name bk-headline-title\">{{ getColumnName() }}</div>\n" +
    "                    <div class=\"bk-select-box\">\n" +
    "                        <ui-select ng-model=\"headline.summaries[0].aggregateType\" ng-change=\"headline.onSummaryChange()\" theme=\"select2\" class=\"bk-headline-aggregation-selector\" append-to-body=\"true\" search-enabled=\"false\">\n" +
    "                            <ui-select-match>{{ typeToLabel($select.selected) }}</ui-select-match>\n" +
    "                            <ui-select-choices repeat=\"aggrType in aggregateTypes\">\n" +
    "                                {{ typeToLabel(aggrType) }}\n" +
    "                            </ui-select-choices>\n" +
    "                        </ui-select>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"bk-headline-column-name bk-headline-title\" ng-show=\"!viz.getModel().shouldShowSummaryAggregates()\">\n" +
    "                    {{ getHeadlineTitle() }}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"isDateHeadline()\">\n" +
    "            \n" +
    "            <div class=\"bk-range-summary\" ng-class=\"{'bk-invisible-summary': isUpdating}\" ng-if=\"headline.isRangeAggregationSummary(headline.summaries[0])\">\n" +
    "                <span class=\"bk-overflow-ellipsis\">\n" +
    "                    <span class=\"bk-headline-value bk-range-headline-min-value\">\n" +
    "                        {{ headline.summaries[0].value.min }}\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                <span class=\"bk-headline-value\">-</span>\n" +
    "                <span class=\"bk-overflow-ellipsis\">\n" +
    "                    <span class=\"bk-headline-value bk-range-headline-max-value\">\n" +
    "                        {{ headline.summaries[0].value.max }}\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div ng-class=\"{'bk-invisible-summary': isUpdating}\" ng-if=\"!headline.isRangeAggregationSummary(headline.summaries[0])\" class=\"bk-date-headline-single-valued\">\n" +
    "                <div class=\"bk-overflow-ellipsis\">\n" +
    "                    <div class=\"bk-headline-value bk-range-headline-min-value\">{{ headline.summaries[0].value }}</div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"bk-headline-column-name bk-headline-title\" ng-show=\"!viz.getModel().isPinboardViz()\">{{ getHeadlineTitle() }}</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/pivot/pivot.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/pivot/pivot.html",
    "<div class=\"pivot-table\">\n" +
    "    <div class=\"pivot-content\">\n" +
    "        <div class=\"pivot-inner\" dx-pivot-grid=\"$ctrl.options\"></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"column-menu-btn\">\n" +
    "    <div class=\"pivot-header-item\">\n" +
    "        <div class=\"pivot-header-name\" blink-tooltip=\"{{item.getName()}}\">\n" +
    "            {{item.getName()}}\n" +
    "        </div>\n" +
    "        <div class=\"bk-options\"\n" +
    "            uib-popover-template=\"'column-control'\"\n" +
    "            popover-placement=\"right\"\n" +
    "            popover-class=\"bk-column-control-popover\"\n" +
    "            popover-trigger=\"outsideClick\"\n" +
    "            popover-close-callback-name=\"onCloseColumnControl\"\n" +
    "            popover-append-to-body=\"true\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/ng-template\" id=\"column-control\">\n" +
    "    <div class=\"column-control\">\n" +
    "        <column-control\n" +
    "                        viz-model=\"$ctrl.model\"\n" +
    "                        viz-column=\"item\"\n" +
    "                        sage-client=\"$ctrl.sageClient\"\n" +
    "                        close-column-control=\"onCloseColumnControl()\"\n" +
    "        </column-control>\n" +
    "    </div>\n" +
    "</script>");
}]);

angular.module("src/modules/viz-layout/viz/table/column-menu/body/column-menu-body.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/column-menu/body/column-menu-body.html",
    "<div class=\"bk-table-column-menu\">\n" +
    "    <bk-action-menu bk-ctrl=\"columnActionMenu\"></bk-action-menu>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/table/column-menu/button/column-menu-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/column-menu/button/column-menu-button.html",
    "<div blink-tooltip=\"{{strings.CONFIGURE}}\" class=\"bk-style-icon-table-column-options bk-column-menu-button\"></div>");
}]);

angular.module("src/modules/viz-layout/viz/table/more-items-download-footer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/more-items-download-footer.html",
    "<div class=\"bk-more-download-footer\">\n" +
    "    \n" +
    "    <style>.ui-widget-content.slick-row.full-colspan { width:{{getTableWidth()}}px;}</style>\n" +
    "    <span class=\"bk-dark-title-12px\">\n" +
    "        <span>{{strings.Showing_only}}</span>\n" +
    "        &nbsp;{{ viz.getModel().getData().length}}&nbsp;\n" +
    "        <span>{{strings.rows_here}}</span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"viz.showDownloadHelp()\" ng-switch=\"viz.isDataDownloadAllowed()\">\n" +
    "        <a ng-switch-when=\"true\" class=\"bk-link\" ng-click=\"viz.onDownloadMoreBtnClick($event)\">{{strings.dataDownload.DOWNLOAD_MORE}}\n" +
    "        </a>\n" +
    "        <a ng-switch-when=\"false\">{{strings.dataDownload.DOWNLOAD_MORE_INSUFFICIENT_PERMISSION}}</a>\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/table/table-download-control.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/table-download-control.html",
    "<div class=\"bk-viz-excel-download-btn\" ng-click=\"viz.onVizDownloadBtnClick($event)\">\n" +
    "    <div class=\"bk-viz-btn-icon bk-style-icon-download\" ng-class=\"{'bk-viz-btn-disabled' : !viz.isDownloadButtonEnabled()}\" blink-tooltip=\"{{viz.getDownloadTooltip()}}\"></div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/table/table.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/table.html",
    "<div clipboard-copy-confirmation-view blink-auto-hide-view show=\"showCopyConfirmation\">\n" +
    "</div>\n" +
    "<div class=\"bk-no-content-placeholder\" ng-if=\"viz.isEmpty()\">\n" +
    "    {{ 'No data to display' | l10n }}\n" +
    "</div>\n" +
    "<div class=\"bk-no-content-placeholder\" ng-if=\"viz.isPendingDataLoad()\">\n" +
    "    {{ 'Loading data...' | l10n }}\n" +
    "</div>\n" +
    "<div class=\"alert alert-error\" ng-if=\"viz.dataError\">\n" +
    "    {{ 'Invalid data' | l10n }}\n" +
    "</div>\n" +
    "<div class=\"bk-cannot-display\" ng-if=\"!viz.isEmpty() && !canDisplayInScreenshot\">\n" +
    "    {{strings.screenshot.tableTooWide }}\n" +
    "</div>\n" +
    "<div class=\"bk-table\" ng-class=\"{'bk-table-with-header-dropdown': containsHeaderDropdown()}\" ng-hide=\"viz.isEmpty() || !canDisplayInScreenshot\">\n" +
    "</div>\n" +
    "<div class=\"bk-pagination-info\" ng-if=\"!!viz.paginationInfo && !viz.noData && !viz.dataError\">\n" +
    "    <span>{{strings.showing.assign({lower: viz.paginationInfo.topRow, higher: viz.paginationInfo.bottomRow, total: viz.paginationInfo.totalRows})}}</span>\n" +
    "    <span ng-if=\"!!viz.showRelatedLink()\" blink-tooltip=\"{{strings.relatedLink.relatedLinkHelpMessage}}\" data-delay=\"{&quot;show&quot;:&quot;250&quot;}\" data-html=\"true\">\n" +
    "        ({{ strings.relatedLink.relatedLinksCount}}{{viz.getRelatedLinksCount()}}{{\" \"}})\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/table/templates/download-as.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/table/templates/download-as.html",
    "<div class=\"context-sub-menu\">\n" +
    "    <div class=\"context-sub-menu-title-container\" ng-click=\"item.onClick(item.id)\">\n" +
    "        <div class=\"bk-icon bk-style-icon-filter\"></div>\n" +
    "<span>{{strings.Download_as}}</span>&nbsp;{{ item.id }}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/viz-cluster/viz-cluster.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/viz-cluster/viz-cluster.html",
    "<div class=\"bk-viz-cluster\" uib-carousel active=\"$ctrl.activeVizIndex\" on-active-slide-change=\"$ctrl.onActiveSlideChangeCallback\" interval=\"-1\" no-pause=\"true\" no-transition=\"true\">\n" +
    "    <div class=\"bk-viz-cluster-viz\" uib-slide ng-repeat=\"vizClusterVisualization in $ctrl.vizClusterVisualizations\" index=\"$index\">\n" +
    "        <div ng-if=\"!!$ctrl.vizClusterVisualizations &&\n" +
    "            $ctrl.vizClusterVisualizations.length > 0 &&\n" +
    "            $ctrl.activeVizIndex >= 0\" class=\"bk-viz-details-title-info\">\n" +
    "            ( {{strings.a3.SHOWING_INSIGHT}} {{$ctrl.activeVizIndex + 1}} {{strings.of}} {{$ctrl.vizClusterVisualizations.length}} )\n" +
    "        </div>\n" +
    "        <blink-viz-tile class=\"bk-viz-clustered-viz\" viz-model=\"vizClusterVisualization.vizModel\" sage-client=\"vizClusterVisualization.sageClient\" bk-show-description=\"true\" should-show-action-menu=\"true\" on-render-complete=\"vizClusterVisualization.onRenderComplete\" allow-context-edit=\"vizClusterVisualization.vizModel.isPinboardViz()\">\n" +
    "        </blink-viz-tile>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/viz-layout/viz/viz-icon/viz-icon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/viz-layout/viz/viz-icon/viz-icon.html",
    "<div class=\"bk-viz-icon-wrapper\" ng-switch=\"vizTypePanel\">\n" +
    "    <div ng-switch-when=\"true\">\n" +
    "        <div class=\"bk-viz-icon-button\">\n" +
    "            <div class=\"bk-viz-icon\" ng-class=\"getIconClass()\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"false\">\n" +
    "        <bk-icon-button icon=\"{{ getIconClass() }}\" is-disabled=\"!vizTypeSelectorModel.isVizTypeSupported(vizType)\" is-selected=\"vizTypeSelectorModel.isCurrentType(vizType)\" class=\"bk-viz-icon-button\"></bk-icon-button>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/worksheet/worksheet-content.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/worksheet/worksheet-content.html",
    "<div blink-worksheet class=\"bk-worksheet-table\" document-config=\"config\" model-validation-error=\"modelValidationError\"></div>");
}]);

angular.module("src/modules/worksheet/worksheet-page/worksheet-page.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/worksheet/worksheet-page/worksheet-page.html",
    "<div class=\"bk-vertical-flex-container-sized\">\n" +
    "    <div class=\"bk-vertical-flex-container-sized\" ng-if=\"!!metadataConfig.model || isInWorksheetCreationMode()\">\n" +
    "        <blink-sharable-item type=\"'WORKSHEET'\" metadata-config=\"metadataConfig\" content-url=\"'src/modules/worksheet/worksheet-content.html'\" class=\"bk-vertical-flex-container-sized\"></blink-sharable-item>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/modules/worksheet/worksheet.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/modules/worksheet/worksheet.html",
    "<div class=\"bk-worksheet\" blink-on-escape=\"onEscape()\">\n" +
    "    <div ng-hide=\"noData || isReadOnly()\" class=\"bk-worksheet-actions\">\n" +
    "        <bk-secondary-button text=\"{{ strings.DELETE }}\" icon=\"bk-style-icon-delete\" is-disabled=\"!isAnyRowSelected()\" ng-click=\"onClickBulkDelete()\" class=\"bk-delete-action\"></bk-secondary-button>\n" +
    "        <bk-secondary-button text=\"{{ strings.worksheets.ADD_PREFIX }}\" icon=\"bk-style-icon-degree\" is-disabled=\"!isAnyRowSelected()\" ng-click=\"onClickBulkAddPrefix()\" class=\"bk-add-prefix-action\"></bk-secondary-button>\n" +
    "    </div>\n" +
    "    <div ng-show=\"isCorrupt()\" class=\"bk-warning-message\">\n" +
    "        <span>{{ getCorruptWorksheetWarningMessagePrefix() }}</span>\n" +
    "        <span class=\"bk-warning-message-action-link\" ng-click=\"onRemoveAllBrokenColumnsClick()\">\n" +
    "            {{ getCorruptWorksheetWarningLinkActionMessage() }}\n" +
    "        </span>\n" +
    "        <span>{{ getCorruptWorksheetWarningMessageSuffix() }}</span>\n" +
    "    </div>\n" +
    "    <div ng-hide=\"noData\" class=\"bk-table-container\" ng-class=\"{'bk-read-only': isReadOnly()}\"></div>\n" +
    "    <div ng-show=\"noData\" class=\"bk-no-content-placeholder\">{{ 'No data to display' | l10n }}</div>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"worksheet-column-tooltip\">\n" +
    "        <div>\n" +
    "            <div>{1}:</div>\n" +
    "            <div>{2}</div>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"worksheet-formula-column-table\">\n" +
    "        <div>{1}:</div>\n" +
    "        <div>{2}</div>\n" +
    "    </script>\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"worksheet-formula-column-row\">\n" +
    "        <div>{1}</div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("src/style-guide/box-model.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/box-model.html",
    "<div class=\"bk-pattern-heading\">Box Model</div>");
}]);

angular.module("src/style-guide/buttons.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/buttons.html",
    "<div class=\"bk-button-library\">\n" +
    "    <div class=\"bk-padding-all-10\">\n" +
    "        <div class=\"bk-pattern-sub-heading\">Primary button</div>\n" +
    "        <bk-primary-button text=\"Primary Button Example\"></bk-primary-button>\n" +
    "        <div class=\"bk-padding-top-20\"></div>\n" +
    "        <div class=\"code\">\n" +
    "            <div class=\"tag\">&lt;bk-primary-button</div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">text=\"Primary Button Example\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">icon=\"bk-style-icon-classname\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-disabled=\"isDisabledFunction()\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip=\"Tooltip Text\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip-placement=\"top\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-busy=\"isBusy()\"&gt;</span></div>\n" +
    "            <div class=\"tag\">&lt;/bk-primary-button&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-padding-all-10\">\n" +
    "        <div class=\"bk-pattern-sub-heading\">Secondary button</div>\n" +
    "        <bk-secondary-button text=\"Secondary Button Example\"></bk-secondary-button>\n" +
    "        <div class=\"bk-padding-top-20\"></div>\n" +
    "        <div class=\"code\">\n" +
    "            <div class=\"tag\">&lt;bk-secondary-button</div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">text=\"Secondary Button Example\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">icon=\"bk-style-icon-classname\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-disabled=\"isDisabledFunction()\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip=\"Tooltip Text\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip-placement=\"top\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-busy=\"isBusy()\"&gt;</span></div>\n" +
    "            <div class=\"tag\">&lt;/bk-secondary-button&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"bk-padding-all-10\">\n" +
    "        <div class=\"bk-pattern-sub-heading\">Secondary button</div>\n" +
    "        <bk-icon-button icon=\"bk-style-icon-table\"></bk-icon-button>\n" +
    "        <div class=\"bk-padding-top-20\"></div>\n" +
    "        <div class=\"code\">\n" +
    "            <div class=\"tag\">&lt;bk-icon-button</div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">icon=\"bk-style-icon-classname\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-disabled=\"isDisabledFunction()\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">is-selected=\"isSelectedFunction()\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip=\"Tooltip Text\"</span></div>\n" +
    "            <div class=\"tag\"><span class=\"bk-padding-left-50\">tooltip-placement=\"top\"&gt;</span></div>\n" +
    "            <div class=\"tag\">&lt;/bk-icon-button&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/style-guide/color.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/color.html",
    "<div class=\"bk-pattern-heading\">Color palette</div>\n" +
    "<img src=\"resources/img/style-guide/colors.png\">\n" +
    "\n" +
    "<div class=\"bk-pattern-heading\">Color palette variables</div>\n" +
    "\n" +
    "<div>LESS variables for these colors are defined in colors-v2.less. Any visual spec give by design should only use\n" +
    "    these colors. If a new color is needs to be added the library. Developer should add a LESS variable to colors-v2.less\n" +
    "    and create text/border/background color using that color variable.\n" +
    "</div>");
}]);

angular.module("src/style-guide/dev-guide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/dev-guide.html",
    "<div class=\"bk-pattern-heading\">LESS directory structure</div>\n" +
    "<div>All LESS files with common style patterns and mixins reside under <span class=\"font-family-semibold\">blink/app/resources/css</span>.\n" +
    "    Rest of the module related LESS files is created in the same directory as its HTML and JS files.\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-pattern-heading\">LESS class naming</div>\n" +
    "<div class=\"font-default font-primary-default\">\n" +
    "    Every class name added in a LESS file should have a prefix\n" +
    "    <span class=\"bk-pattern-text-highlight\">'bk'</span>.\n" +
    "    <div class=\"code\">\n" +
    "            <div class=\"tag\">.bk-test-class-name {</div>\n" +
    "            <div class=\"tag\">//CSS rules</div>\n" +
    "            <div class=\"tag\">}</div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"bk-pattern-heading\">How to structure a LESS class?</div>\n" +
    "<div>We have base patterns defined in various less file which you can find inside css folder.\n" +
    "    They should be self-explanatory. Whenever we create a new module we should try to re-use those patterns to create\n" +
    "    more patterns which will help in bringing visual harmony across the app.\n" +
    "</div>\n" +
    "<div class=\"bk-pattern-sub-heading\">Note:</div>\n" +
    "<div class=\"bk-padding-top-10\">\n" +
    "    - Maintain the order of elements in html as they appear visually in design\n" +
    "</div>\n" +
    "<div>\n" +
    "    - !important: important overrides and other css rules defined for a particular element.\n" +
    "    We <span class=\"font-family-bold\">never</span> want to use it.\n" +
    "</div>\n" +
    "<div class=\"bk-pattern-sub-heading\">Example:</div>\n" +
    "<div>\n" +
    "    <div class=\"code\">\n" +
    "        <div class=\"tag\">.bk-filter-list-heading {</div>\n" +
    "        <div class=\"tag color-orange1\">/* Positioning */</div>\n" +
    "        <div class=\"tag\">.pa;</div>\n" +
    "        <div class=\"tag\">top: 0;</div>\n" +
    "        <div class=\"tag\">right: 0</div>\n" +
    "        <div class=\"tag\">z-index: 10;</div>\n" +
    "\n" +
    "        <div class=\"tag color-orange1\">/* Display & Box Model */</div>\n" +
    "        <div class=\"tag\">.dib;</div>\n" +
    "        <div class=\"tag\">width: 100px;</div>\n" +
    "        <div class=\"tag\">height: 100px;</div>\n" +
    "        <div class=\"tag\">.bk-padding-all-10;></div>\n" +
    "        <div class=\"tag\">.bk-margin-vertical-5;</div>\n" +
    "\n" +
    "        <div class=\"tag color-orange1\">/* Color */</div>\n" +
    "        <div class=\"tag\">.bg-grey2;</div>\n" +
    "        <div class=\"tag\">.color-grey8;</div>\n" +
    "\n" +
    "        <div class=\"tag color-orange1\">/* Text */</div>\n" +
    "        <div class=\"tag\">.font-family-semibold;</div>\n" +
    "        <div class=\"tag\">.text-size-larger;</div>\n" +
    "        <div class=\"tag\">.text-uppercase;</div>\n" +
    "        <div class=\"tag\">.bk-align-right;</div>\n" +
    "        <div class=\"tag\">}</div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/style-guide/icons.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/icons.html",
    "<div class=\"bk-pattern-icon\">\n" +
    "    <div class=\"bk-padding-vertical-20\">\n" +
    "        We use font icons in our app. Icon fonts are just fonts. However, instead of containing letters or numbers, they\n" +
    "        contain symbols and glyphs. You can style them with CSS in the same way you style regular text. They are defined\n" +
    "        & used as any other font.\n" +
    "    </div>\n" +
    "    <img src=\"resources/font/thoughtspot_25/thoughtspot-iconfont-regular-webfont.png\">\n" +
    "    <div class=\"bk-pattern-heading\">Adding a new font icon</div>\n" +
    "    <div>\n" +
    "        Whenever we add a new icon we'll get a 6 font files from design. The font files can be found under <span class=\"font-family-semibold\">blink/app/resources/font/thoughtspot_21</span>.\n" +
    "        <ol>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.eot</li>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.png</li>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.svg</li>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.svg</li>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.woff</li>\n" +
    "            <li>thoughtspot-iconfont-regular-webfont.woof2</li>\n" +
    "        </ol>\n" +
    "\n" +
    "        <div class=\"bk-pattern-sub-heading\">2 step process</div>\n" +
    "        <div>\n" +
    "            <span class=\"font-family-semibold\">Step 1: Update files and folder - </span>\n" +
    "            Developer should replace the old files with new files. Make sure to keep the file names same and update the\n" +
    "            number in folder. Ex: thoughtspot_21 -> thoughtspot 22.\n" +
    "        </div>\n" +
    "        <div>\n" +
    "            <span class=\"font-family-semibold\">Step 2: Create new icon class - </span>\n" +
    "            Follow the pattern of any already defined icon class. Give a meaningful name to the class which represents\n" +
    "            the icon not it usage and update the content. The new icon will have a new unique content character associated with it. You can\n" +
    "            find that from <span class=\"font-family-semibold\">thoughtspot-iconfont-regular-webfont.png</span>.\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/style-guide/layout.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/layout.html",
    "<div class=\"bk-pattern-heading\">Layout templates</div>\n" +
    "<div class=\"bk-pattern-sub-heading\">Positioning:</div>\n" +
    "<div class=\"bk-padding-horizontal-10\">\n" +
    "    <div class=\"font-family-semibold\">Static</div>\n" +
    "    By default all elements are static.\n" +
    "\n" +
    "    <div class=\"font-family-semibold\">Relative</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">pr</span></div>\n" +
    "    Used when we want to position an element relative to its original position. You use the positioning attributes\n" +
    "    top, left bottom and right to set the location.\n" +
    "\n" +
    "    <div class=\"font-family-semibold\">Absolute</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">pa</span></div>\n" +
    "    Used when we want to position an element relative to body(top left corner of the page). You use the positioning\n" +
    "    attributes top, left bottom and right to set the location. These values will be relative to the next parent\n" +
    "    element with relative (or absolute) positioning.\n" +
    "\n" +
    "    <div class=\"font-family-semibold\">Fixed</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">pf</span></div>\n" +
    "    It's positioned relative to the viewport, or the browser window itself. The viewport doesn't change when the\n" +
    "    window is scrolled.\n" +
    "\n" +
    "    <div class=\"bk-margin-vertical-10\">\n" +
    "        <span class=\"font-family-semibold\">Tip:</span> In most cases <span class=\"font-family-semibold\">pa</span> is\n" +
    "        used on a\n" +
    "        <span class=\"font-family-semibold\">child</span> element when it's <span class=\"font-family-semibold\">parent</span>\n" +
    "        has <span class=\"font-family-semibold\">pr</span>.\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"code\">\n" +
    "        <div class=\"tag\">&lt;div class=\"pr\"&gt;Relatively positioned element</div>\n" +
    "        <div class=\"tag\">&lt;div class=\"pa\"&gt;</div>\n" +
    "        <div class=\"tag\">Absolutely positioned element</div>\n" +
    "        <div class=\"tag\">&lt;/div&gt;</div>\n" +
    "        <div class=\"tag\">&lt;/div&gt;</div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-pattern-sub-heading\">Floats</div>\n" +
    "<div class=\"bk-padding-horizontal-10\">\n" +
    "    <div>Float is a CSS positioning property. Page elements with the CSS float property applied to them are just like\n" +
    "        the images in the print layout where the text flows around them. Floated elements remain a part of the flow of\n" +
    "        the web page.\n" +
    "    </div>\n" +
    "    <div class=\"font-family-semibold\">Left</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">fl</span></div>\n" +
    "    Floats the element to left.\n" +
    "    <div class=\"font-family-semibold\">Right</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">fr</span></div>\n" +
    "    Floats the element to right.\n" +
    "    <div class=\"font-family-semibold\">Clearfix</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">clearfix</span></div>\n" +
    "    Applied on the parent element and it uses CSS pseudo selector (:after) to clear floats.\n" +
    "\n" +
    "    <div class=\"bk-margin-vertical-10 font-family-semibold\">Example:</div>\n" +
    "    <div class=\"code\">\n" +
    "        <div class=\"tag\">&lt;div class=\"clearfix\"&gt;</div>\n" +
    "        <div class=\"tag\">&lt;div class=\"fl\"&gt;</div>\n" +
    "        <div class=\"tag\">Float left this element</div>\n" +
    "        <div class=\"tag\">&lt;/div&gt;</div>\n" +
    "        <div class=\"tag\">&lt;div class=\"fr\"&gt;</div>\n" +
    "        <div class=\"tag\">Float right this element</div>\n" +
    "        <div class=\"tag\">&lt;/div&gt;</div>\n" +
    "        <div class=\"tag\">&lt;/div&gt;</div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-pattern-sub-heading\">Display:</div>\n" +
    "<div class=\"bk-padding-horizontal-10\">\n" +
    "    <div class=\"font-family-semibold\">None</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-bold\">dn</span></div>\n" +
    "    Totally removes the element from the page.\n" +
    "\n" +
    "    <div class=\"font-family-semibold\">Block</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-semibold\">db</span></div>\n" +
    "    By default (without setting a width) they take up as much horizontal space as they can and adds a break at the\n" +
    "    end.\n" +
    "    Elements like &lt;div&gt;, &lt;ul&gt;, &lt;p&gt;, &lt;section&gt; are block elements by default.\n" +
    "    <div class=\"font-family-semibold\">Inline</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-semibold\">di</span></div>\n" +
    "    Elements like &lt;span&gt;, &lt;em&gt;, &lt;b&gt; are block elements by default. Wrapping text in those elements\n" +
    "    within a string of text doesn't break the flow of the text. An inline element will accept margin and padding but\n" +
    "    ignore height and width. Margin and padding will only push the elements horizontally away.\n" +
    "    <div class=\"font-family-semibold\">Inline block</div>\n" +
    "    <div class=\"\">Class name - <span class=\"font-family-semibold\">dib</span></div>\n" +
    "    Similar to inline except that you are able to set a width and height.\n" +
    "    <div class=\"font-family-semibold\">Flex</div>\n" +
    "    \n" +
    "    \n" +
    "</div>");
}]);

angular.module("src/style-guide/overview.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/overview.html",
    "<div>At ThoughtSpot, we want to create a harmonious and coherent experience for our users. This pattern library is a\n" +
    "    collection of patterns and design guidelines that provide a common language for ThoughtSpot's design problems. It's\n" +
    "    intended for developers and designers to be used as a single source of truth.\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"bk-design-principle-heading\">Design Principles</div>\n" +
    "<div class=\"bk-design-principle-list\">\n" +
    "    <div>- Clarity</div>\n" +
    "    <div>- Consistency</div>\n" +
    "    <div>- Data</div>\n" +
    "    <div>- Delight</div>\n" +
    "</div>");
}]);

angular.module("src/style-guide/style-guide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/style-guide.html",
    "<div class=\"bk-pattern-library\">\n" +
    "    <div class=\"bk-style-guide-header\">\n" +
    "        <img src=\"resources/img/logo/TS-logo-login.png\">\n" +
    "        <div class=\"bk-logo-heading\">Pattern Library</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <tab-control on-tab-activated=\"onTabActivated(activeTab)\" class=\"bk-pattern-library-tab-control\">\n" +
    "        <tab-control-tab tab-name=\"Overview\" tab-id=\"overview\">\n" +
    "            <div ng-include=\"'src/style-guide/overview.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Dev guide\" tab-id=\"dev-guide\">\n" +
    "            <div ng-include=\"'src/style-guide/dev-guide.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Typography\" tab-id=\"typography\">\n" +
    "            <div ng-include=\"'src/style-guide/typography.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Colors\" tab-id=\"colors\">\n" +
    "            <div ng-include=\"'src/style-guide/color.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Icons\" tab-id=\"icons\">\n" +
    "            <div ng-include=\"'src/style-guide/icons.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Buttons\" tab-id=\"buttons\">\n" +
    "            <div ng-include=\"'src/style-guide/buttons.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Widgets\" tab-id=\"widgets\">\n" +
    "            <bk-widgets-browser bk-ctrl=\"widgetBrowserCtrl\"></bk-widgets-browser>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Layout\" tab-id=\"layout\">\n" +
    "            <div ng-include=\"'src/style-guide/layout.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "        <tab-control-tab tab-name=\"Box Model\" tab-id=\"box-model\">\n" +
    "            <div ng-include=\"'src/style-guide/box-model.html'\"></div>\n" +
    "        </tab-control-tab>\n" +
    "    </tab-control>\n" +
    "</div>");
}]);

angular.module("src/style-guide/style-guide2.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/style-guide2.html",
    "<div class=\"sg-body\">\n" +
    "<div class=\"sg-left-panel bg-black font-white-default pam br-orange-top\">\n" +
    "    <h1>{{strings.ThoughtSpot_Style}}</h1>\n" +
    "\n" +
    "    <div class=\"\">{{strings.CSS_classname}}</div>\n" +
    "    <div class=\"\">\n" +
    "        <div>{{strings.Layouts_templates}}</div>\n" +
    "        <div>{{strings.Positioning}}</div>\n" +
    "        <div>{{strings.Display}}</div>\n" +
    "        <div>{{strings.Floats}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"\">{{strings.CSS_templates}}</div>\n" +
    "</div>\n" +
    "<div class=\"sg-right-panel\">\n" +
    "<div class=\"mhl pvm br-bottom-gray\">\n" +
    "    <h2 class=\"font-primary-default mbm\">{{strings.CSS_classname}}</h2>\n" +
    "\n" +
    "    <div class=\"font-default font-primary-default\">\n" +
    "        <span class=\"font-family-bold\">{{strings.Style_class}}</span>\n" +
    "{{strings.No_prefix_required}}\n" +
    "</div>\n" +
    "    <div class=\"font-default font-primary-default\">\n" +
    "        <span class=\"font-family-bold\">{{strings.Javascript_class}}</span>\n" +
    "{{strings.Add_js_prefix}}\n" +
    "</div>\n" +
    "    <div class=\"font-default font-primary-default\">\n" +
    "        <span class=\"font-family-bold\">{{strings.E2E_and_Unit}}</span>\n" +
    "{{strings.Add_test_prefix}}\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class=\"mhl pvm br-bottom-gray\">\n" +
    "    <h2 class=\"font-primary-default mbm\">{{strings.Layouts_templates}}</h2>\n" +
    "    <h5 class=\"font-primary-default font-uppercase\">{{strings.Positioning2}}</h5>\n" +
    "\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Static}}</div>\n" +
    "{{strings.By_default_all}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Relative}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">pr</span></div>\n" +
    "{{strings.Used_when_we}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Absolute}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">pa</span></div>\n" +
    "{{strings.Used_when_we2}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Fixed}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">pf</span></div>\n" +
    "{{strings.Its_positioned_relative}}\n" +
    "</div>\n" +
    "    <div class=\"mvm pam br-blue\">\n" +
    "{{strings.Tip_In}}<span class=\"font-family-bold\">pa</span> {{strings.is_used}}<span class=\"font-family-bold\">{{strings.child}}</span>\n" +
    "{{strings.element_when}}<span class=\"font-family-bold\">{{strings.parent}}</span> {{strings.has}}<span class=\"font-family-bold\">pr</span>.\n" +
    "        <div class=\"mts\">\n" +
    "            &lt;div class=\"pr\"&gt;Relatively positioned element\n" +
    "            <div class=\"mll\">&lt;div class=\"pa\"&gt;</div>\n" +
    "            <div class=\"mlxl\">{{strings.Absolutely_positioned}}</div>\n" +
    "            <div class=\"mll\">&lt;/div&gt;</div>\n" +
    "            <div>&lt;/div&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <h5 class=\"font-uppercase\">{{strings.Display}}</h5>\n" +
    "\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.None}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.dn}}</span></div>\n" +
    "{{strings.Totally_removes_the}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Block}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.db}}</span></div>\n" +
    "        By default (without setting a width) they take up as much horizontal space as they can and adds a break at the\n" +
    "        end.\n" +
    "        Elements like &lt;div&gt;, &lt;ul&gt;, &lt;p&gt;, &lt;section&gt; are block elements by default.\n" +
    "    </div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Inline}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.di}}</span></div>\n" +
    "        Elements like &lt;span&gt;, &lt;em&gt;, &lt;b&gt; are block elements by default. Wrapping text in those elements\n" +
    "        within a string of text doesn't break the flow of the text. An inline element will accept margin and padding but\n" +
    "        ignore height and width. Margin and padding will only push the elements horizontally away.\n" +
    "    </div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Inline_block}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.dib}}</span></div>\n" +
    "{{strings.Similar_to_inline}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Table}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.dn}}</span></div>\n" +
    "{{strings.Totally_removes_the}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Flex}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.dn}}</span></div>\n" +
    "{{strings.Totally_removes_the}}\n" +
    "</div>\n" +
    "    <h5 class=\"font-uppercase\">{{strings.Floats}}</h5>\n" +
    "{{strings.Float_is_a}}\n" +
    "<div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Left}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">fl</span></div>\n" +
    "{{strings.Floats_the_element}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Right}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">fr</span></div>\n" +
    "{{strings.Floats_the_element2}}\n" +
    "</div>\n" +
    "    <div>\n" +
    "        <div class=\"font-family-bold\">{{strings.Clearfix}}</div>\n" +
    "        <div class=\"\">{{strings.Class_name}}<span class=\"font-family-bold\">{{strings.clearfix}}</span></div>\n" +
    "{{strings.Applied_on_the}}\n" +
    "</div>\n" +
    "\n" +
    "    <div class=\"mvm pam br-blue\">\n" +
    "{{strings.Example2}}\n" +
    "<div class=\"mts\">\n" +
    "            &lt;div class=\"clearfix\"&gt;\n" +
    "            <div class=\"mll\">&lt;div class=\"fl\"&gt;</div>\n" +
    "            <div class=\"mlxl\">{{strings.Float_left}}</div>\n" +
    "            <div class=\"mll\">&lt;/div&gt;</div>\n" +
    "            <div class=\"mll\">&lt;div class=\"fr\"&gt;</div>\n" +
    "            <div class=\"mlxl\">{{strings.Float_right}}</div>\n" +
    "            <div class=\"mll\">&lt;/div&gt;</div>\n" +
    "            <div>&lt;/div&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"mhl pvm br-bottom-gray\">\n" +
    "    <h2 class=\"font-primary-default mbm\">{{strings.How_to_structure}}</h2>\n" +
    "\n" +
    "    <div>{{strings.We_try_to}}\n" +
    "</div>\n" +
    "    <div class=\"mbm\">\n" +
    "        <h6 class=\"font-family-bold\">{{strings.CSS}}</h6>\n" +
    "\n" +
    "        <div class=\"font-secondary-default\">// First way is to use the default css element and apply it directly on html\n" +
    "            or from JS\n" +
    "        </div>\n" +
    "        <div>.font-red-default {</div>\n" +
    "        <div class=\"mll\">{{strings.colorreddefault}}</div>\n" +
    "        }\n" +
    "        <div class=\"font-secondary-default\">// Second way is to use the default css element directly in the css as a\n" +
    "            mixin.\n" +
    "        </div>\n" +
    "        <div>.left-panel-content {</div>\n" +
    "        <div class=\"mll\">.font-red-default; <span class=\"font-green-default\">// Correct</span></div>\n" +
    "        <div class=\"mll\">color: @red-default; <span class=\"font-red-default\">// Wrong</span></div>\n" +
    "        }\n" +
    "        <h6 class=\"font-family-bold\">{{strings.HTML}}</h6>\n" +
    "\n" +
    "        <div class=\"mts\">\n" +
    "            <div>&lt;div class=\"left-panel-content\"&gt;</div>\n" +
    "            <div class=\"mll\">{{strings.This_content_will}}</div>\n" +
    "            <div>&lt;/div&gt;</div>\n" +
    "\n" +
    "            <div>&lt;div class=\"font-red-default\"&gt;</div>\n" +
    "            <div class=\"mll\">{{strings.This_content_will2}}\n" +
    "</div>\n" +
    "            <div>&lt;/div&gt;</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    \n" +
    "        \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "        \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "    \n" +
    "\n" +
    "    <h6 class=\"font-family-bold font-uppercase\">{{strings.Grouping_of}}</h6>\n" +
    "\n" +
    "    <div>{{strings.While_implementing_the}}\n" +
    "</div>\n" +
    "    <div class=\"font-family-bold\">{{strings.Example2}}</div>\n" +
    "    <div>{{strings.selector}}</div>\n" +
    "    <div class=\"mll\">\n" +
    "        <div class=\"font-secondary-default\">{{strings.Positioning3}}</div>\n" +
    "{{strings.pa2}}<br>\n" +
    "{{strings.zindex_10}}<br>\n" +
    "{{strings.top_0}}<br>\n" +
    "{{strings.right_0}}<br><br>\n" +
    "\n" +
    "        <div class=\"font-secondary-default\">{{strings.Display2}}</div>\n" +
    "{{strings.dib2}}<br>\n" +
    "{{strings.ofhidden}}<br>\n" +
    "        width: 100px;<br>\n" +
    "        height: 100px;<br>\n" +
    "{{strings.pam}}<br>\n" +
    "{{strings.mam}}<br>\n" +
    "        border: 1px solid #333;<br>\n" +
    "        box-sizing: border-box;<br><br>\n" +
    "\n" +
    "\n" +
    "        <div class=\"font-secondary-default\">{{strings.Color}}</div>\n" +
    "        .bg-white;<br>\n" +
    "        .font-white-default;<br><br>\n" +
    "\n" +
    "        <div class=\"font-secondary-default\">{{strings.Text}}</div>\n" +
    "        font-family: sans-serif;<br>\n" +
    "        font-size: 16px;<br>\n" +
    "        line-height: 1.4;<br>\n" +
    "        text-align: right;<br><br>\n" +
    "{{strings.Other}}<br>\n" +
    "{{strings.cursor_pointer}}<br>\n" +
    "    </div>\n" +
    "    }\n" +
    "    <h5 class=\"font-uppercase\">{{strings.Other_tips}}</h5>\n" +
    "\n" +
    "    <div><b>-</b> {{strings.important_important_overrides}}\n" +
    "<span class=\"font-family-bold\">{{strings.never}}</span> {{strings.want_to}}\n" +
    "</div>\n" +
    "    <div><b>-</b> {{strings.Maintain_the_order}}</div>\n" +
    "</div>\n" +
    "\n" +
    "<h2 class=\"font-primary-default mhl\">{{strings.CSS_templates}}</h2>\n" +
    "\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Headings}}</h3>\n" +
    "\n" +
    "<div class=\"mll\">\n" +
    "    <h1>Heading 1</h1>\n" +
    "\n" +
    "    <h2>Heading 2</h2>\n" +
    "\n" +
    "    <h3>Heading 3</h3>\n" +
    "    <h4>Heading 4</h4>\n" +
    "    <h5>Heading 5</h5>\n" +
    "    <h6>Heading 6</h6>\n" +
    "</div>\n" +
    "\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Text_sizing}}</h3>\n" +
    "\n" +
    "<div class=\"mll\">\n" +
    "    <div class=\"font-smaller\">font-smaller</div>\n" +
    "    <div class=\"font-small\">font-small</div>\n" +
    "    <div class=\"font-default\">font-default</div>\n" +
    "    <div class=\"font-medium\">font-medium</div>\n" +
    "    <div class=\"font-large\">font-larger</div>\n" +
    "    <div class=\"font-extra-large\">font-extra-large</div>\n" +
    "</div>\n" +
    "\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Text_transformation}}</h3>\n" +
    "\n" +
    "<div class=\"mll\">\n" +
    "    <div class=\"font-capitalize\">font-capitalize</div>\n" +
    "    <div class=\"font-uppercase\">font-uppercase</div>\n" +
    "    <div class=\"font-lowercase\">font-lowercase</div>\n" +
    "</div>\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Text_colors}}</h3>\n" +
    "\n" +
    "<div class=\"font-extra-large font-family-bold mll\">\n" +
    "    <div class=\"font-red-default\">font-red-default</div>\n" +
    "    <div class=\"font-red-transparent\">font-red-transparent</div>\n" +
    "    <div class=\"font-red-darker\">font-red-darker</div>\n" +
    "    <div class=\"sg-red font-red-default mbm\">font-red-hover</div>\n" +
    "\n" +
    "    <div class=\"font-orange-default\">font-orange-default</div>\n" +
    "    <div class=\"font-orange-darker\">font-orange-darker</div>\n" +
    "    <div class=\"sg-orange font-orange-default mbm\">font-orange-hover</div>\n" +
    "\n" +
    "    <div class=\"font-blue-default\">font-blue-default</div>\n" +
    "    <div class=\"font-blue-darker\">font-blue-darker</div>\n" +
    "    <div class=\"sg-blue font-blue-default mbm\">font-blue-hover</div>\n" +
    "\n" +
    "    <div class=\"font-green-default\">font-green-default</div>\n" +
    "    <div class=\"font-green-darker\">font-green-darker</div>\n" +
    "    <div class=\"sg-green font-green-default mbm\">font-green-hover</div>\n" +
    "\n" +
    "    <div class=\"font-purple-default\">font-purple-default</div>\n" +
    "    <div class=\"font-purple-darker\">font-purple-darker</div>\n" +
    "    <div class=\"sg-purple font-purple-default mbm\">font-purple-hover</div>\n" +
    "\n" +
    "    <div class=\"font-yellow-default\">font-yellow-default</div>\n" +
    "    <div class=\"font-yellow-darker\">font-yellow-darker</div>\n" +
    "    <div class=\"sg-yellow font-yellow-default mbm\">font-yellow-hover</div>\n" +
    "\n" +
    "    <div class=\"font-pink-default mbm\">font-pink-default</div>\n" +
    "\n" +
    "    <div class=\"font-turquoise-default mbm\">font-turquoise-default</div>\n" +
    "\n" +
    "    <div class=\"font-dark-blue-default mbm\">font-dark-blue-default</div>\n" +
    "\n" +
    "    <div class=\"bg-black-lighter font-white-default mbm\">font-white-default</div>\n" +
    "\n" +
    "    <div class=\"font-primary-default\">font-primary-default</div>\n" +
    "    <div class=\"font-primary-light\">font-primary-light</div>\n" +
    "    <div class=\"sg-primary font-primary-default mbm\">font-primary-hover</div>\n" +
    "\n" +
    "    <div class=\"font-secondary-default\">font-secondary-default</div>\n" +
    "    <div class=\"sg-secondary font-secondary-default mbl\">font-secondary-hover</div>\n" +
    "</div>\n" +
    "\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Background_colors}}</h3>\n" +
    "\n" +
    "<div class=\"mam pam bg-red\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-red + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-orange\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-orange + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-blue\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-blue + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-green\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-green + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-purple\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-purple + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-yellow\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-yellow + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-white\">\n" +
    "    <span class=\"font-primary-default font-family-semibold\">bg-white + font-primary-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-white-transparent\">\n" +
    "    <span class=\"font-primary-default font-family-semibold\">bg-white-transparent + font-primary-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-black\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-black + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-black-lighter\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-black-lighter + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-gray\">\n" +
    "    <span class=\"font-primary-default font-family-semibold\">bg-gray + font-primary-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-overlay\">\n" +
    "    <span class=\"font-white-default font-family-semibold\">bg-overlay + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-overlay-faint\">\n" +
    "    <span class=\"font-primary-default font-family-semibold\">bg-overlay-faint + font-white-default + mam + pam</span>\n" +
    "</div>\n" +
    "<div class=\"mam pam bg-overlay-white\">\n" +
    "    <span class=\"font-primary-default font-family-semibold\">bg-overlay-white + font-primary-default + mam + pam</span>\n" +
    "</div>\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Buttons}}</h3>\n" +
    "\n" +
    "<div class=\"mvm mlm clearfix\">\n" +
    "    <div class=\"bk-btn fl mhm\">bk-btn</div>\n" +
    "    <div class=\"bk-btn-orange fl mhm\">bk-btn-orange</div>\n" +
    "    <div class=\"bk-btn-yellow fl mhm\">bk-btn-yellow</div>\n" +
    "    <div class=\"bk-btn-purple fl mhm\">bk-btn-purple</div>\n" +
    "    <div class=\"bk-btn-blue fl mhm\">bk-btn-blue</div>\n" +
    "    <div class=\"bk-btn-green fl mhm\">bk-btn-green</div>\n" +
    "</div>\n" +
    "<div class=\"mvm mlm clearfix\">\n" +
    "    <div class=\"bk-btn bk-disabled bk-btn-full-width mhm\">bk-btn + bk-disabled + bk-btn-full-width</div>\n" +
    "    <div class=\"bk-btn-orange bk-disabled bk-btn-full-width mam\">bk-btn-orange + bk-disabled + bk-btn-full-width</div>\n" +
    "    <div class=\"bk-btn-yellow bk-disabled bk-btn-full-width mam\">bk-btn-yellow + bk-disabled + bk-btn-full-width</div>\n" +
    "    <div class=\"bk-btn-purple bk-disabled bk-btn-full-width mam\">bk-btn-purple + bk-disabled + bk-btn-full-width</div>\n" +
    "    <div class=\"bk-btn-blue bk-disabled bk-btn-full-width mam\">bk-btn-blue + bk-disabled + bk-btn-full-width</div>\n" +
    "    <div class=\"bk-btn-green bk-disabled bk-btn-full-width mam\">bk-btn-green + bk-disabled + bk-btn-full-width</div>\n" +
    "</div>\n" +
    "\n" +
    "<h3 class=\"font-primary-default mvm mhl\">{{strings.Border}}</h3>\n" +
    "\n" +
    "<div class=\"mam pam br-gray\">br-gray + pam + mam</div>\n" +
    "<div class=\"mam pam br-green\">br-green + pam + mam</div>\n" +
    "<div class=\"mam pam br-red\">br-red + pam + mam</div>\n" +
    "<div class=\"mam pam br-yellow\">br-yellow + pam + mam</div>\n" +
    "<div class=\"mam pam br-blue\">br-blue + pam + mam</div>\n" +
    "<div class=\"mam pam br-purple\">br-purple + pam + mam</div>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("src/style-guide/typography.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/typography.html",
    "<div class=\"bk-typography-pattern\">\n" +
    "\n" +
    "</div>");
}]);

angular.module("src/style-guide/widgets-browser/widgets-browser.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/style-guide/widgets-browser/widgets-browser.html",
    "<div class=\"bk-widgets-browser\">\n" +
    "    <input type=\"text\" class=\"bk-search-query\" ng-model=\"$ctrl.query\" placeholder=\"Search available UI components\">\n" +
    "    \n" +
    "    <div class=\"bk-widgets\">\n" +
    "        <div class=\"bk-component\" ng-repeat=\"compDetail in $ctrl.getCompDetails() | filter:$ctrl.filter($ctrl.query)\">\n" +
    "            <div class=\"bk-component-name\">{{compDetail.displayName}}</div>\n" +
    "            <div class=\"bk-component-examples\">\n" +
    "                <div class=\"bk-component-example\" ng-repeat=\"compExample in compDetail.examples\">\n" +
    "                    <div class=\"bk-view\" ng-include=\"compExample.templateKey\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("src/test/test.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/test/test.html",
    "<join-disambiguation ambiguity-input=\"ambiguityInput\" on-complete=\"completed($resolvedTokens)\">\n" +
    "</join-disambiguation>");
}]);
