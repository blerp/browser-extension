import { setGlobalCacheJwt } from "../../globalCache";

try {
    console.log("This is the background page for chrome.");

    if (typeof chrome !== "undefined") {
        // https://stackoverflow.com/questions/14245334/sendmessage-from-extension-background-or-popup-to-content-script-doesnt-work
        chrome.runtime.onMessageExternal.addListener(function (
            message,
            sender,
            sendResponse,
        ) {
            console.log("MESSAGE COGT", message);

            // Check if the message is from localhost:1500
            if (
                // sender.tab &&
                // sender.tab.url.includes("localhost:1500") &&
                message.accessToken &&
                message.type === "initialSignIn"
            ) {
                // Store the access token and refresh token in chrome.storage
                console.log("MESSAGE SET", message);

                setGlobalCacheJwt(message.accessToken, message.refreshToken);
                sendResponse({ success: true });
            }

            // Return true to indicate that we will send a response asynchronously
            return true;
        });
    } else if (typeof browser !== "undefined") {
        //TODO: need to add a listener to a content script

        // window.addEventListener("message", (event) => {
        //     if (event.source !== window) {
        //         return;
        //     }
        //     const message = event.data;
        //     if (message.extensionId === "<your-extension-id>") {
        //         browser.runtime.sendMessage(message.message);
        //     }
        // });

        // TODO: need to add a postMessage to blerp.com login

        // const extensionId = '<your-extension-id>';
        // const message = { type: 'my-message', data: { /* message data */ } };
        // window.postMessage({ extensionId, message }, '*');

        console.log("This is the background page for firefox.");

        browser.runtime.onMessage.addListener(function (
            message,
            sender,
            sendResponse,
        ) {
            // Check if the message is from localhost:1500
            if (
                // sender.tab &&
                // sender.tab.url.includes("localhost:1500") &&
                message.accessToken &&
                message.type === "initialSignIn"
            ) {
                // Store the access token and refresh token in chrome.storage
                console.log("MESSAGE SET", message);

                setGlobalCacheJwt(message.accessToken, message.refreshToken);
                sendResponse({ success: true });
            }

            // Return true to indicate that we will send a response asynchronously
            return true;
        });
    }
} catch (e) {
    console.error(e);
}
