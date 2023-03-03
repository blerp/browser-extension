// tiny wrapper with default env vars
module.exports = {
    NODE_ENV: process.env.NODE_ENV || "development", // || "production" || "beta"
    BROWSER_NODE_ENV: process.env.BROWSER_NODE_ENV || "development", // || "production" || "beta"
    PORT: process.env.PORT || 3000,
};
