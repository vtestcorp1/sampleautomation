(function(window){

    var SCREEN_SHOT_FORMAT = 'png',
        PORT_NAME = 'blink-e2e-screen-shot';

    function captureVisibleTab(callback) {
        chrome.tabs.captureVisibleTab(null, {format: SCREEN_SHOT_FORMAT}, function(imageDataURL){
            callback(imageDataURL);
        });
    }

    function processRequest(sender, callback) {
        chrome.tabs.getSelected(null, function(tab){
            if (tab.id === sender.tab.id) {
                captureVisibleTab(callback);
                return;
            }

            function onActiveTabChanged(tabId) {
                if (tabId !== sender.tab.id) {
                    return;
                }
                chrome.tabs.onActiveChanged.removeListener(onActiveTabChanged);
                captureVisibleTab(callback);
            }
            chrome.tabs.onActiveChanged.addListener(onActiveTabChanged);
        });
    }

    chrome.runtime.onConnect.addListener(function(port) {
        if (port.name !== PORT_NAME) {
            return;
        }

        port.onMessage.addListener(function(msg) {
            processRequest(port.sender, function(imageDataURL){
                port.postMessage({
                    id: msg.id,
                    imageData: {
                        url: imageDataURL
                    }
                });
            });
        });
    });

})(window);