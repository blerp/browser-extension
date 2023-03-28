const GLOBAL_CACHE = {};

export const getStreamerInfo = async () => {
    if (typeof chrome !== "undefined") {
        // chrome.storage.local.remove([
        //     "twitchUsername",
        //     "youtubeChannelId",
        //     "currentPlatform",
        // ]);

        try {
            const data = await new Promise((resolve, reject) => {
                chrome.storage.local.get(
                    ["twitchUsername", "youtubeChannelId", "currentPlatform"],
                    function (result) {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(result);
                        }
                    },
                );
            });

            return {
                twitchUsername: data?.twitchUsername,
                youtubeChannelId: data?.youtubeChannelId,
                currentPlatform: data?.currentPlatform,
            };
        } catch (err) {
            console.log("Stream Info ERR:", err);
            return null;
        }
    } else if (typeof browser !== "undefined") {
        // browser.storage.local.remove([
        //     "twitchUsername",
        //     "youtubeChannelId",
        //     "currentPlatform",
        // ]);

        // Firefox code
        try {
            const data = await browser.storage.local.get([
                "twitchUsername",
                "youtubeChannelId",
                "currentPlatform",
            ]);

            return {
                twitchUsername: data?.twitchUsername,
                youtubeChannelId: data?.youtubeChannelId,
                currentPlatform: data?.currentPlatform,
            };
        } catch (err) {
            console.log("Stream Info ERR:", err);
            return null;
        }
    }
};

export const setStreamerInfo = ({
    twitchUsername,
    youtubeChannelId,
    currentPlatform,
}) => {
    if (typeof chrome === "undefined" && typeof browser === "undefined") {
        return;
    }

    if (chrome.storage || browser.storage) {
        const storage = chrome?.storage?.local || browser?.storage?.local;

        if (twitchUsername) {
            storage.remove(["twitchUsername"]);
            storage.set({ twitchUsername });
        }

        if (youtubeChannelId) {
            storage.remove(["youtubeChannelId"]);
            storage.set({ youtubeChannelId });
        }

        if (currentPlatform) {
            storage.remove(["currentPlatform"]);
            storage.set({ currentPlatform });
        }
    }
};

export const removeAndLogoutOfCacheJwt = () => {
    GLOBAL_CACHE.jwt = null;
    GLOBAL_CACHE.refreshToken = null;

    // if (window.localStorage) {
    //     window.localStorage.removeItem("jwt");
    //     window.localStorage.removeItem("refreshToken");
    // }

    if (typeof chrome === "undefined" && typeof browser === "undefined") {
        return;
    }

    if (chrome.storage || browser.storage) {
        const storage = chrome?.storage?.local || browser?.storage?.local;

        if (storage) {
            storage.remove(["jwt", "refreshToken"]);
        }
    }
};

export const setGlobalCacheJwt = (jwt, refreshToken) => {
    GLOBAL_CACHE.jwt = jwt;
    GLOBAL_CACHE.refreshToken = refreshToken;

    // if (window.localStorage) {
    //     if (jwt) {
    //         window.localStorage.removeItem("jwt");
    //         window.localStorage.setItem("jwt", jwt);
    //     }

    //     if (refreshToken) {
    //         window.localStorage.removeItem("refreshToken");
    //         window.localStorage.setItem("refreshToken", refreshToken);
    //     }
    // }

    if (typeof chrome === "undefined" && typeof browser === "undefined") {
        return;
    }

    if (chrome.storage || browser.storage) {
        const storage = chrome?.storage?.local || browser?.storage?.local;

        if (jwt) {
            storage.remove(["jwt"]);
            storage.set({ jwt: jwt });
        }

        if (refreshToken) {
            storage.remove(["refreshToken"]);
            storage.set({ refreshToken: refreshToken });
        }
    }
};

export const getGlobalCacheJwt = async () => {
    if (GLOBAL_CACHE.jwt) {
        return GLOBAL_CACHE.jwt;
    }

    let token = null;

    // if (!token && window.localStorage) {
    //     token = window.localStorage.getItem("jwt");
    // }

    if (token) {
        return token;
    }

    try {
        const storage = chrome?.storage?.local || browser?.storage?.local;

        const data = await new Promise((resolve, reject) => {
            storage.get("jwt", function (data) {
                if (storage.lastError) {
                    reject(storage.lastError);
                } else {
                    resolve(data);
                }
            });
        });

        return data.jwt;
    } catch (err) {
        console.log("Token ERR:", err);
        return null;
    }
};

export const getGlobalCacheRefreshToken = () => {
    return GLOBAL_CACHE.refreshToken;
};

export const setGlobalCacheTwitchJwt = (jwt) => {
    GLOBAL_CACHE.twitchJwt = jwt;
};

export const getGlobalCacheTwitchJwt = () => {
    return GLOBAL_CACHE.twitchJwt;
};
