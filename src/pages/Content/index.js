import { createRoot } from "react-dom";
import HomeButton from "../Extension/HomeButton";
import WithBlerp from "../../WithBlerp";
import { setGlobalCacheJwt, setStreamerInfo } from "../../globalCache";
import "./content.styles.css";

let CURRENT_PLATFORM;
let TWITCH_NAV_BUTTON_CONTAINER;
let TWITCH_CHAT_BUTTON_CONTAINER;
let YT_NAV_BUTTON_CONTAINER;
let YT_CHAT_BUTTON_CONTAINER;
let KICK_CHAT_BUTTON_CONTAINER;

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
    } else if (host === "www.kick.com" || host === "kick.com") {
        CURRENT_PLATFORM = "KICK";
    } else {
        CURRENT_PLATFORM = "Unknown";
    }

    if (CURRENT_PLATFORM === "BLERP") {
        console.log("MESSAGE_CALL_LOGIN_AGAIN");
        return;
    }

    if (
        CURRENT_PLATFORM !== "TWITCH" &&
        CURRENT_PLATFORM !== "YOUTUBE" &&
        CURRENT_PLATFORM !== "KICK"
    ) {
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
    } else if (CURRENT_PLATFORM === "KICK") {
        const isStreamingElement = true;

        // TODO: Figure out why this isn't working
        // [
        //     document.querySelector("div.avatar-holder"),
        //     document.querySelector("div.owner-avatar"),
        //     document.querySelector("div.live-status"),
        //     document.querySelector("div.avatar-live-tag"),
        // ].find((element) => {
        //     console.log("EKENETB", element);
        //     const textContent =
        //         element && element.textContent && element.textContent.trim();
        //     return textContent === "Live";
        // });

        isStreaming = !!isStreamingElement;
    }

    const getElementByIdOrCreate = (id, target) => {
        // const existingElement = document.getElementById(id);
        if (false) {
            return existingElement;
        } else {
            const newElement = document.createElement("div");

            newElement.style.margin = "auto 0";

            if (target) {
                target.insertBefore(
                    newElement,
                    target.children[target.children.length - 2],
                );
            }

            return newElement;
        }
    };

    let kickChatIntervalId = null;

    const renderKickChat = ({ kickUsername }) => {
        let counter = 0;

        // setTimeout(() => {
        console.log("TIMEOUT_CALLED_CHAT_WITH_REPEAT", counter);
        if (kickChatIntervalId) {
            return;
        }

        kickChatIntervalId = setInterval(() => {
            let target = document.querySelector(".send-row");

            if (target) {
                clearInterval(kickChatIntervalId);
                kickChatIntervalId = null;

                const container = document.createElement("div");
                container.style.margin = "auto 0";

                target.insertBefore(container, target.firstChild || null);

                KICK_CHAT_BUTTON_CONTAINER = createRoot(container);

                KICK_CHAT_BUTTON_CONTAINER.render(
                    WithBlerp({
                        Component: HomeButton,
                        pageProps: {
                            userId: null,
                            youtubeChannelId: null,
                            twitchUsername: null,
                            kickUsername: kickUsername,
                            platform: CURRENT_PLATFORM,
                            isStreaming,
                        },
                    }),
                );
            } else if (counter >= 20) {
                clearInterval(kickChatIntervalId);
                kickChatIntervalId = null;
            }

            counter++;
            console.log("CHECK_RENDERER", target, counter);
        }, 5000);
        // }, 1000);
    };

    let twitchChatIntervalId = null;

    const renderTwitchChat = ({ twitchUsername }) => {
        let counter = 0;

        // setTimeout(() => {
        console.log("TIMEOUT_CALLED_CHAT_WITH_REPEAT", counter);
        if (twitchChatIntervalId) {
            return;
        }

        twitchChatIntervalId = setInterval(() => {
            let target = document.querySelector(
                `div[data-test-selector="chat-input-buttons-container"]`,
            );

            if (target) {
                clearInterval(twitchChatIntervalId);
                twitchChatIntervalId = null;

                const firstDivInsideTarget = target.querySelector(
                    ":scope > div:first-child",
                );

                if (!TWITCH_CHAT_BUTTON_CONTAINER) {
                    const container = getElementByIdOrCreate(
                        "twitch-chat-button-container-blerp",
                        firstDivInsideTarget ? firstDivInsideTarget : target,
                    );

                    TWITCH_CHAT_BUTTON_CONTAINER = createRoot(container);
                }

                TWITCH_CHAT_BUTTON_CONTAINER.render(
                    WithBlerp({
                        Component: HomeButton,
                        pageProps: {
                            userId: null,
                            youtubeChannelId: null,
                            twitchUsername: twitchUsername,
                            platform: CURRENT_PLATFORM,
                            isStreaming,
                        },
                    }),
                );
            } else if (counter >= 20) {
                clearInterval(twitchChatIntervalId);
                twitchChatIntervalId = null;
            }

            counter++;
            console.log("CHECK_RENDERER", target, counter);
        }, 5000);
        // }, 1000);
    };

    let twitchNavIntervalId = null;
    const renderTwitchNav = ({ twitchUsername }) => {
        // Nav Bar
        let counter = 0;
        // setTimeout(function () {
        if (twitchNavIntervalId) {
            return;
        }

        twitchNavIntervalId = setInterval(() => {
            let targetNav = document.querySelector(
                `[data-a-target="top-nav-container"]`,
            )?.firstChild?.lastChild;

            if (targetNav) {
                console.log("NAV_RENDERED", twitchNavIntervalId);
                clearInterval(twitchNavIntervalId);
                twitchNavIntervalId = null;

                if (!TWITCH_NAV_BUTTON_CONTAINER) {
                    const container = getElementByIdOrCreate(
                        "twitch-nav-button-container-blerp",
                        targetNav,
                    );

                    TWITCH_NAV_BUTTON_CONTAINER = createRoot(container);
                }

                TWITCH_NAV_BUTTON_CONTAINER.render(
                    WithBlerp({
                        Component: HomeButton,
                        pageProps: {
                            userId: null,
                            youtubeChannelId: null,
                            twitchUsername: twitchUsername,
                            platform: CURRENT_PLATFORM,
                            isStreaming,
                        },
                    }),
                );
            } else if (counter >= 20) {
                clearInterval(twitchNavIntervalId);
                twitchNavIntervalId = null;
            }

            counter++;
        }, 5000);
        // }, 1500);
    };

    let ytNavIntervalId = null;

    const renderYTNav = ({ youtubeChannelId }) => {
        let counter = 0;
        // setTimeout(function () {
        if (ytNavIntervalId) {
            return;
        }

        ytNavIntervalId = setInterval(() => {
            let targetNav = document.querySelector("#buttons");

            if (targetNav) {
                clearInterval(ytNavIntervalId);
                ytNavIntervalId = null;

                if (!YT_NAV_BUTTON_CONTAINER) {
                    const container = getElementByIdOrCreate(
                        "yt-nav-button-container-blerp",
                        targetNav,
                    );

                    YT_NAV_BUTTON_CONTAINER = createRoot(container);
                }

                YT_NAV_BUTTON_CONTAINER.render(
                    // <HomeButton/>
                    WithBlerp({
                        Component: HomeButton,
                        pageProps: {
                            userId: null,
                            youtubeChannelId: youtubeChannelId,
                            twitchUsername: null,
                            platform: CURRENT_PLATFORM,
                            isStreaming,
                        },
                    }),
                );
            } else if (counter >= 100) {
                clearInterval(ytNavIntervalId);
                ytNavIntervalId = null;
            }

            counter++;
            console.log("CHECK_RENDERER_NAV", targetNav, counter);
        }, 5000);
        // }, 3200);
    };

    let ytChatIntervalId = null;
    const renderYTChat = ({ youtubeChannelId }) => {
        let counter = 0;

        // setTimeout(function () {
        if (ytChatIntervalId) {
            return;
        }

        ytChatIntervalId = setInterval(() => {
            // const youtubeChatIframe = window.frames["chatframe"]
            //     ?.contentDocument
            //     ? window.frames["chatframe"]?.contentDocument
            //     : document.querySelector("#chatframe")?.contentDocument;

            // let target =
            //     document.querySelector("#top-level-buttons-computed")
            //         ?.firstChild ??
            //     youtubeChatIframe?.querySelector(
            //         "#picker-buttons.yt-live-chat-message-input-renderer",
            //     )?.parentElement ??
            //     youtubeChatIframe?.querySelector("#message-buttons")
            //         ?.parentElement;
            // const youtubeChatIframe = window.frames["chatframe"]
            //     ?.contentDocument
            //     ? window.frames["chatframe"]?.contentDocument
            //     : document.querySelector("#chatframe")?.contentDocument;

            let target = document.querySelector("#top-level-buttons-computed");

            if (target) {
                clearInterval(ytChatIntervalId);
                ytChatIntervalId = null;

                if (!YT_CHAT_BUTTON_CONTAINER) {
                    // const container = getElementByIdOrCreate(
                    //     "yt-nav-button-container-blerp",
                    //     target,
                    // );

                    const container = document.createElement("div");
                    container.style.margin = "auto 0";

                    target.insertBefore(container, target.firstChild || null);

                    YT_CHAT_BUTTON_CONTAINER = createRoot(container);
                }

                YT_CHAT_BUTTON_CONTAINER.render(
                    WithBlerp({
                        Component: HomeButton,
                        pageProps: {
                            userId: null,
                            youtubeChannelId: youtubeChannelId,
                            twitchUsername: null,
                            platform: CURRENT_PLATFORM,
                            isStreaming,
                        },
                    }),
                );
            } else if (counter >= 100) {
                clearInterval(ytChatIntervalId);
                ytChatIntervalId = null;
            }

            counter++;
            console.log("CHECK_RENDERER_CHAT", target, counter);
        }, 5000);
        // }, 1000);
    };

    const renderAllContentPage = () => {
        console.log("RENDER_ALL_CONTENT_PAGE", CURRENT_PLATFORM);

        if (CURRENT_PLATFORM === "KICK") {
            let kickUsername = null;

            if (!kickUsername) {
                let urlParts = window.location.href.split("/");
                let usernameIndex = urlParts.indexOf("username");

                if (
                    usernameIndex !== -1 &&
                    usernameIndex < urlParts.length - 1
                ) {
                    kickUsername = urlParts[usernameIndex + 1];
                }
            }

            console.log("FIRST_R", kickUsername);

            // If the username is still not found, try to get it from the URL

            console.log("SECOND", kickUsername);

            if (!kickUsername) {
                // Try to get the username from the page title
                let pageTitle = document.querySelector("title").textContent;

                if (pageTitle && pageTitle.includes(" | Kick")) {
                    kickUsername = pageTitle.replace(" | Kick", "");
                    kickUsername =
                        kickUsername !== "Search" ? kickUsername.trim() : "";
                }
            }

            console.log("THIRD", kickUsername);

            // If the username was not found in the page title, try to get it from the URL
            if (!kickUsername) {
                let match = window.location.pathname.match(/^\/user\/([^/]+)/);
                if (match) {
                    kickUsername = match[1];
                }
            }

            let streamUsername = document.querySelector(".stream-username");
            if (!kickUsername && streamUsername) {
                kickUsername = streamUsername.textContent.trim();
            }

            // renderKickNav({ kickUsername });

            // If the username was not found, display an error message
            if (!kickUsername) {
                console.error(
                    "BLERP: Could not find Kick username on this page!",
                );
                return;
            }

            setStreamerInfo({
                kickUsername: kickUsername,
                currentPlatform: CURRENT_PLATFORM,
            });

            // Finally, log or display the username as needed
            console.log(`Kick username: ${kickUsername}`);

            renderKickChat({ kickUsername });
        } else if (CURRENT_PLATFORM === "TWITCH") {
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

            // renderTwitchNav({ twitchUsername });

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

            let channelLink = document.querySelector("a.ytp-ce-channel-title");
            if (channelLink) {
                let regex = /\/channel\/([\w-]+)/;
                let match = channelLink.href.match(regex);
                if (match) {
                    youtubeChannelId = match[1];
                }
            }

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

            renderYTChat({ youtubeChannelId: youtubeChannelId });
        } else {
        }
    };

    renderAllContentPage();

    let locationUpdatesRegistered = false;

    const handleLocationUpdates = () => {
        if (!locationUpdatesRegistered) {
            // window.addEventListener("hashchange", renderAllContentPage);
            // window.addEventListener("popstate", renderAllContentPage);

            let lastUrl = location.href;

            // https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener/39508954#39508954
            new MutationObserver(() => {
                const url = location.href;
                if (url !== lastUrl) {
                    lastUrl = url;
                    onUrlChange();
                }
            }).observe(document, { subtree: true, childList: true });

            const onUrlChange = () => {
                if (YT_NAV_BUTTON_CONTAINER) {
                    YT_NAV_BUTTON_CONTAINER.unmount();
                    YT_NAV_BUTTON_CONTAINER = null;
                }

                if (YT_CHAT_BUTTON_CONTAINER) {
                    YT_CHAT_BUTTON_CONTAINER.unmount();
                    YT_CHAT_BUTTON_CONTAINER = null;
                }
                if (TWITCH_CHAT_BUTTON_CONTAINER) {
                    TWITCH_CHAT_BUTTON_CONTAINER.unmount();
                    TWITCH_CHAT_BUTTON_CONTAINER = null;
                }
                if (TWITCH_NAV_BUTTON_CONTAINER) {
                    TWITCH_NAV_BUTTON_CONTAINER.unmount();
                    TWITCH_NAV_BUTTON_CONTAINER = null;
                }

                clearInterval(ytNavIntervalId);
                ytNavIntervalId = null;

                clearInterval(ytChatIntervalId);
                ytChatIntervalId = null;

                clearInterval(twitchChatIntervalId);
                twitchChatIntervalId = null;

                clearInterval(twitchNavIntervalId);
                twitchNavIntervalId = null;

                renderAllContentPage();
            };

            // or, if neither of those work, you might have to poll:

            // const aDelayValueThatWorksForYou = 500;
            // setInterval(render, aDelayValueThatWorksForYou);

            locationUpdatesRegistered = true;
        }
    };

    handleLocationUpdates();

    // Listen for changes to the page using a MutationObserver
    // const chatObserver = new MutationObserver((mutationsList, observer) => {
    //     for (let mutation of mutationsList) {
    //         if (
    //             mutation.type === "childList" &&
    //             mutation.addedNodes.length > 0
    //         ) {
    //             for (let addedNode of mutation.addedNodes) {
    //                 const nodeClassList = addedNode.classList;
    //                 if (
    //                     nodeClassList &&
    //                     nodeClassList.contains(
    //                         "yt-live-chat-item-list-renderer",
    //                     ) &&
    //                     nodeClassList.contains("style-scope") &&
    //                     nodeClassList.contains("ytd-live-chat-frame")
    //                 ) {
    //                     observer.disconnect();
    //                     renderYTChat({ youtubeChannelId });
    //                 }
    //             }
    //         }
    //     }
    // });

    // chatObserver.observe(document.body, {
    //     childList: true,
    //     subtree: true,
    // });
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
