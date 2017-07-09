(function(window) {

    var WEB_SOCKET_SERVER_URL = 'ws://localhost:9065',
        REQUEST_EVENT_NAME = 'blink-get-screen-shot-request',
        RESPONSE_EVENT_NAME = 'blink-get-screen-shot-response';

    var ws,
        uiChangesSemaphore = 0;

    function changeUIForScreenShot(hide) {
        if (hide) {
            uiChangesSemaphore--;
        } else {
            uiChangesSemaphore++;
        }

        if (hide && uiChangesSemaphore > 0) {
            return;
        }

        window.document.body.scrollTop = 55;

        var elementsToHide = [[window.top, '#banner'], [window.top, '#browsers'], [window, '#html']];
        elementsToHide.forEach(function(elementToHide){
            var win = elementToHide[0],
                selector = elementToHide[1];

            var element = win.document.querySelector(selector);
            if (element) {
                element.style.display = hide ? 'none' : 'block';
            }
        });

        //expand the error alert for detailed info
        var errorText = document.querySelector('.bk-alert .bk-text');
        if (errorText) {
            errorText.click();
        }
    }

    window.top.addEventListener("message", function(event){
        var data = event.data;
        if (data.event !== RESPONSE_EVENT_NAME) {
            return true;
        }

        changeUIForScreenShot(false);
        ws.send(JSON.stringify({
            command: RESPONSE_EVENT_NAME,
            id: data.id,
            imageData: data.imageData
        }));
    });

    ws = new WebSocket(WEB_SOCKET_SERVER_URL);
    ws.onmessage = function(message) {
        var data = JSON.parse(message.data);
        if (data.command !== REQUEST_EVENT_NAME) {
            return;
        }

        changeUIForScreenShot(true);

        setTimeout(function(){
            window.top.postMessage({
                event: REQUEST_EVENT_NAME,
                id: data.id
            }, '*');
        }, 0);
    };

})(window);
