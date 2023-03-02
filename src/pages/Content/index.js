import { printLine } from "./modules/print";

import { render } from "react-dom";
import ChatPopUpButton from "../Extension/ChatPopUpButton";
import withBlerp from "../../withBlerp";
import { setGlobalCacheJwt, setStreamerInfo } from "../../globalCache";

let CURRENT_PLATFORM;

//[data-a-target="top-nav-container"]
(() => {
    const host = window.location.host;

    if (host === "www.youtube.com" || host === "youtube.com") {
        CURRENT_PLATFORM = "YOUTUBE";
    } else if (host === "www.twitch.tv" || host === "twitch.tv") {
        CURRENT_PLATFORM = "TWITCH";
    } else if (
        host === "www.blerp.com" ||
        host === "blerp.com" ||
        host === "localhost:3000" ||
        host === "localhost:1500"
    ) {
        CURRENT_PLATFORM = "BLERP";
    } else {
        CURRENT_PLATFORM = "Unknown";
    }

    console.log("HOSTYY1!!", host, CURRENT_PLATFORM);

    if (CURRENT_PLATFORM === "BLERP") {
        console.log("MESSAGE_CALL_LOGIN_AGAIN");
        return;
    }

    if (CURRENT_PLATFORM !== "TWITCH" && CURRENT_PLATFORM !== "YOUTUBE") {
        console.log("Platform not supported", CURRENT_PLATFORM);
        return;
    }

    let isStreaming = false;

    if (CURRENT_PLATFORM === "YOUTUBE") {
        const canonicalURLTag = document.querySelector("link[rel=canonical]");
        const canonicalURL = canonicalURLTag.getAttribute("href");
        isStreaming = canonicalURL.includes("/watch?v=");
    } else if (CURRENT_PLATFORM === "TWITCH") {
        // Twitch backend check is more reliable
        isStreaming = true;
    }

    console.log("STREAMING", isStreaming);

    const renderTwitchChat = ({ twitchUsername }) => {
        let counter = 0;
        setTimeout(function () {
            const intervalId = setInterval(() => {
                let target = document.querySelector(
                    `div[data-test-selector="chat-input-buttons-container"]`,
                );

                if (target) {
                    clearInterval(intervalId);

                    const container = document.createElement("div");
                    target.insertBefore(
                        container,
                        target.children[target.children.length - 2],
                    );

                    render(
                        withBlerp({
                            Component: ChatPopUpButton,
                            pageProps: {
                                userId: null,
                                youtubeChannelId: null,
                                twitchUsername: twitchUsername,
                                platform: CURRENT_PLATFORM,
                                isStreaming,
                            },
                        }),
                        container,
                    );
                } else if (counter >= 20) {
                    clearInterval(intervalId);
                }

                counter++;
                console.log("CHECK_RENDERER", target, counter);
            }, 5000);
        }, 1000);
    };

    const renderTwitchNav = ({ twitchUsername }) => {
        // Nav Bar
        let counter = 0;
        setTimeout(function () {
            const intervalId = setInterval(() => {
                let targetNav = document.querySelector(
                    `[data-a-target="top-nav-container"]`,
                )?.firstChild?.lastChild;

                if (targetNav) {
                    clearInterval(intervalId);

                    const container = document.createElement("div");
                    targetNav.insertBefore(
                        container,
                        targetNav.children[targetNav.children.length - 2],
                    );

                    render(
                        withBlerp({
                            Component: ChatPopUpButton,
                            pageProps: {
                                userId: null,
                                youtubeChannelId: null,
                                twitchUsername: twitchUsername,
                                platform: CURRENT_PLATFORM,
                                isStreaming,
                            },
                        }),
                        container,
                    );
                } else if (counter >= 20) {
                    clearInterval(intervalId);
                }

                counter++;
            }, 5000);
        }, 1500);
    };

    const renderYTNav = ({ youtubeChannelId }) => {
        let counter = 0;
        setTimeout(function () {
            const intervalId = setInterval(() => {
                let targetNav = document.querySelector("#buttons");

                if (targetNav) {
                    clearInterval(intervalId);

                    const container = document.createElement("div");

                    targetNav.insertBefore(
                        container,
                        targetNav.children[targetNav.children.length - 2],
                    );

                    render(
                        // <ChatPopUpButton/>
                        withBlerp({
                            Component: ChatPopUpButton,
                            pageProps: {
                                userId: null,
                                youtubeChannelId: youtubeChannelId,
                                twitchUsername: null,
                                platform: CURRENT_PLATFORM,
                                isStreaming,
                            },
                        }),
                        container,
                    );
                } else if (counter >= 100) {
                    clearInterval(intervalId);
                }

                counter++;
                console.log("CHECK_RENDERER_NAV", counter);
            }, 5000);
        }, 3200);
    };

    const renderYTChat = ({ youtubeChannelId }) => {
        let counter = 0;
        setTimeout(function () {
            const intervalId = setInterval(() => {
                const youtubeChatIframe = window.frames["chatframe"]
                    ?.contentDocument
                    ? window.frames["chatframe"]?.contentDocument
                    : document.querySelector("#chatframe")?.contentDocument;

                let target =
                    document.querySelector("#top-level-buttons-computed")
                        ?.firstChild ??
                    youtubeChatIframe?.querySelector(
                        "#picker-buttons.yt-live-chat-message-input-renderer",
                    )?.parentElement ??
                    youtubeChatIframe?.querySelector("#message-buttons")
                        ?.parentElement;

                if (target) {
                    clearInterval(intervalId);

                    const container = document.createElement("div");
                    target.insertBefore(
                        container,
                        target.children[target.children.length - 2],
                    );

                    render(
                        withBlerp({
                            Component: ChatPopUpButton,
                            pageProps: {
                                userId: null,
                                youtubeChannelId: youtubeChannelId,
                                twitchUsername: null,
                                platform: CURRENT_PLATFORM,
                                isStreaming,
                            },
                        }),
                        container,
                    );
                } else if (counter >= 100) {
                    clearInterval(intervalId);
                }

                counter++;
                console.log("CHECK_RENDERER", target, counter);
            }, 5000);
        }, 1000);
    };

    const renderAllContentPage = () => {
        if (CURRENT_PLATFORM === "TWITCH") {
            console.log("BLERP_TWITCH_INITIATE");

            let twitchUsername = null;

            // If the username was still not found, try to get it from the page URL
            if (!twitchUsername) {
                let match = window.location.pathname.match(/^\/([^/]+)/);
                if (match) {
                    twitchUsername = match[1];
                }
            }

            // If the username was not found in the page title, try to find it in the page metadata
            if (!twitchUsername) {
                let meta = document.querySelector(
                    'meta[property="og:site_name"]',
                );
                if (meta) {
                    let content = meta.getAttribute("content");
                    if (content.startsWith("Twitch: ")) {
                        twitchUsername = content.slice(8);
                    }
                }
            }

            renderTwitchNav({ twitchUsername });

            // If the username was not found, display an error message
            if (!twitchUsername) {
                console.error(
                    "BLERP: Could not find Twitch username on this page!",
                );
                return;
            }

            setStreamerInfo({
                twitchUsername: twitchUsername,
                currentPlatform: CURRENT_PLATFORM,
            });

            // Finally, log or display the username as needed
            console.log(`Twitch username: ${twitchUsername}`);

            renderTwitchChat({ twitchUsername });
        } else if (CURRENT_PLATFORM === "YOUTUBE") {
            // content script

            // First, try to get the channelId from the URL
            let searchParams = new URLSearchParams(window.location.search);
            let youtubeChannelId = searchParams.get("channel");

            // If the channelId was not found in the URL, try to find it in the page metadata
            if (!youtubeChannelId) {
                let meta = document.querySelector('meta[itemprop="channelId"]');
                if (meta) {
                    youtubeChannelId = meta.getAttribute("content");
                }
            }

            // If the channelId was still not found, try to get it from the page metadata using other properties
            if (!youtubeChannelId) {
                let meta = document.querySelector(
                    'meta[property="og:video:channel_id"]',
                );
                if (meta) {
                    youtubeChannelId = meta.getAttribute("content");
                }
            }

            renderYTNav({ youtubeChannelId: youtubeChannelId });

            // If the channelId was not found, display an error message
            if (!youtubeChannelId) {
                console.error("Could not find YouTube channel ID on this page");
                return;
            }

            setStreamerInfo({
                youtubeChannelId: youtubeChannelId,
                currentPlatform: CURRENT_PLATFORM,
            });

            // Finally, log or display the channelId as needed
            console.log(`YouTube channel ID: ${youtubeChannelId}`);

            renderYTChat({ youtubeChannelId: youtubeChannelId });
        } else {
        }
    };

    renderAllContentPage();

    console.log("Popstate registered");
})();

console.log("Power of the awesomness!!!!!!!!");
// console.log("Must reload extension for modifications to take effect.");

// Select all text elements on the page
// const textElements = document.querySelectorAll("body *");

// // Replace the text content of each element with an image tag
// textElements.forEach(element => {
//   element.innerHTML = '<img src="https://cdn.blerp.com/design/twitch/blerpy_m.png" alt="blerp">';
// });

// Bottom makes a button in the youtube NAV
// Select the element with the ID "buttons"
// let buttons = document.querySelector("#buttons");

// // Create the HTML for your button
// let newButton = `<button id="butt_butt" style="cursor:pointer;width:40px;height:40px;"><img src="https://cdn.blerp.com/design/twitch/blerpy_m.png" style="width:100%;height:100%;"></img></button>`;

// // Insert your button before the "buttons" element
// buttons.insertAdjacentHTML("beforebegin", newButton);

// // Select the button
// let myButton = document.querySelector("#butt_butt");

// let css = `#popup{
//     visibility: visible;
//     opacity: 1;
//     position: absolute;
//     background-color: white;
//     width: 200px;
//     height: 100px;
//     padding: 10px;
//     z-index: 1;
//     /* other styles */
// }`;

// let style = document.createElement('style');
// style.type = 'text/css';
// style.appendChild(document.createTextNode(css));
// document.head.appendChild(style);

// // Create the HTML for the popup
// let popup = `<div id="popup" style="display:none;">Blerp!!!!</div>`;

// // Insert the popup after the button
// myButton.insertAdjacentHTML("afterend", popup);

// // Add an onclick event to the button
// myButton.addEventListener("click", function(){
//     console.log("Click pressed")
//     // Select the popup
//     let myPopup = document.querySelector("#popup");
//     let rect = myButton.getBoundingClientRect();

//     myPopup.style.left = rect.left + "px";
//     myPopup.style.top = rect.bottom + "px";

//     // toggle the display  property of the popup
//     myPopup.style.display = myPopup.style.display === "none" ? "block" : "none";
// });

// printLine("Using the 'printLine' function from the Print Module");
