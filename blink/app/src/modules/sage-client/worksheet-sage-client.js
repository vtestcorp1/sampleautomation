/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoghtspot.com)
 *
 * The interface used by worksheet components to talk to sage and update the worksheet state.
 * Also a carrier of sageModel which acts as a state for sage bar.
 */

'use strict';

// TODO(Jasmeet/Rahul) Move worksheet sage call to be handled by this client.
blink.app.factory('WorksheetSageClient',[ 'SageModel',
    function(SageModel) {
        var WorksheetSageClient = function() {
            this.sageModel = new SageModel();
            this.sageContext = null;
        };

        WorksheetSageClient.prototype.getSageModel = function(){
            return this.sageModel;
        };

        WorksheetSageClient.prototype.setContext = function(context) {
            this.sageContext = context;
        };

        WorksheetSageClient.prototype.getContext = function() {
            return this.sageContext;
        };

        return WorksheetSageClient;
    }
]);
