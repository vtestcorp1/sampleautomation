(function(window){
    var REQUEST_EVENT_NAME = 'blink-get-screen-shot-request',
        RESPONSE_EVENT_NAME = 'blink-get-screen-shot-response';

    var port = chrome.runtime.connect({name: "blink-e2e-screen-shot"});

    port.onMessage.addListener(function(response) {
        window.top.postMessage({
            event: RESPONSE_EVENT_NAME,
            id: response.id,
            imageData: response.imageData
        }, "*");
    });

    window.top.addEventListener("message", function(event){
        if (event.data.event !== REQUEST_EVENT_NAME) {
            return;
        }
        port.postMessage(event.data);
    });

})(window);

