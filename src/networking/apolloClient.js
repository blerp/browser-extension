/* eslint-disable default-case */
import { useMemo } from "react";
import { InMemoryCache } from "@apollo/client/cache";
import {
    ApolloClient,
    ApolloLink,
    fromPromise,
    gql,
    defaultDataIdFromObject,
} from "@apollo/client";

import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import {
    getGlobalCacheJwt,
    getGlobalCacheTwitchJwt,
    getGlobalCacheRefreshToken,
    setGlobalCacheJwt,
    removeAndLogoutOfCacheJwt,
} from "../globalCache";

import selectedProject from "../projectConfig";

const { createUploadLink } = require("apollo-upload-client");
export const APOLLO_STATE_PROP_NAME = "initialApolloState";

const isBrowser = typeof window !== "undefined";
const uri = `${
    selectedProject?.env === "DEV"
        ? "http://localhost:3002"
        : selectedProject?.env === "SANDBOX"
        ? "https://apisandbox.blerpy.com"
        : selectedProject?.env === "PRODUCTION"
        ? "https://api.blerp.com"
        : "https://api.blerpy.com"
}/graphql`;

let apolloClient;
let apolloCache;

const refreshTokenMutation = gql`
    mutation refreshToken($refreshToken: String!) {
        twitch {
            userRefreshToken(record: { refreshToken: $refreshToken }) {
                jwt
                refreshToken
                user {
                    _id
                    username
                }
            }
        }
    }
`;

const getNewToken = (refreshToken) => {
    return apolloClient.mutate({
        mutation: refreshTokenMutation,
        variables: { refreshToken },
        fetchPolicy: "no-cache",
    });
};

const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
            for (let err of graphQLErrors) {
                switch (err.extensions.code) {
                    case "UNAUTHENTICATED":
                        if (!isBrowser) {
                            return forward(operation);
                        }

                        try {
                            // TODO: figure out how to get from refreshToken cookie
                            const refreshToken = getGlobalCacheRefreshToken()
                                ? getGlobalCacheRefreshToken()
                                : window.localStorage
                                ? window.localStorage.getItem("refreshToken")
                                : "";

                            if (!refreshToken) {
                                return forward(operation);
                            }

                            return fromPromise(
                                getNewToken(refreshToken).catch((error) => {
                                    return forward(operation);
                                }),
                            ).flatMap((data) => {
                                if (
                                    !data ||
                                    !data.data ||
                                    !data.data.twitch ||
                                    !data.data.twitch.userRefreshToken ||
                                    !data.data.twitch.userRefreshToken.jwt
                                ) {
                                    operation.setContext({
                                        headers: {
                                            ...oldHeaders,
                                            // "twitch-auth":
                                            //     getGlobalCacheTwitchJwt() ||
                                            //     (isBrowser &&
                                            //         window.localStorage &&
                                            //         window.localStorage.getItem(
                                            //             "twitchjwt",
                                            //         )),
                                        },
                                    });

                                    removeAndLogoutOfCacheJwt();
                                    return forward(operation);
                                }

                                const accessToken =
                                    data.data.twitch.userRefreshToken.jwt;
                                const refreshToken =
                                    data.data.twitch.userRefreshToken
                                        .refreshToken;
                                const oldHeaders =
                                    operation.getContext().headers;

                                if (!refreshToken || !accessToken) {
                                    removeAndLogoutOfCacheJwt();
                                    return forward(operation);
                                }

                                removeAndLogoutOfCacheJwt();
                                setGlobalCacheJwt(accessToken, refreshToken);

                                operation.setContext({
                                    headers: {
                                        ...oldHeaders,
                                        // "twitch-auth":
                                        //     getGlobalCacheTwitchJwt() ||
                                        //     (isBrowser &&
                                        //         window.localStorage &&
                                        //         window.localStorage.getItem(
                                        //             "twitchjwt",
                                        //         )),
                                        authorization: `Bearer ${accessToken}`,
                                    },
                                });

                                return forward(operation);
                            });
                        } catch (err) {
                            console.log("CHECKING_ERRORS_APOLLO", err);
                            return forward(operation);
                        }
                }
            }
        }
    },
);

export const defaults = {
    globalVolume: 1.0,
    globalSrcId: "",
};

export const typeDefs = gql`
    extend type Query {
        globalVolume: Float
        globalSrcId: String
    }
`;

export const resolvers = {
    Mutation: {
        setGlobalVolume: (_, { volume }, { cache }) => {
            return null;
        },
        setGlobalSrc: (_, { id }, { cache }) => {
            return null;
        },
    },
};

const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    let token;

    token = await getGlobalCacheJwt();

    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            // "twitch-auth":
            //     getGlobalCacheTwitchJwt() ||
            //     (isBrowser &&
            //         window.localStorage &&
            //         window.localStorage.getItem("twitchjwt")),
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// https://www.apollographql.com/docs/react/caching/cache-configuration/
const createApolloCache = ({ initialState = {} }) => {
    return new InMemoryCache({
        dataIdFromObject(responseObject) {
            switch (responseObject.__typename) {
                case "Audio":
                    return `Audio:${responseObject.filename}`;
                case "Image":
                    return `Image:${responseObject.filename}`;
                case "Bite":
                    return `Bite:${responseObject._id}`;
                case "Playlist":
                    return `Playlist:${responseObject._id}`;
                case "Category":
                    return `Category:${responseObject.urlKey}`;
                case "User":
                    return `User:${responseObject._id}`;
                case "TwitchChannel":
                    return `TwitchChannel:${responseObject.channelId}`;
                case "BlogPostRow":
                    return `BlogPostRow:${responseObject._id}`;
                default:
                    return defaultDataIdFromObject(responseObject);
            }
        },
        typePolicies: {
            Query: {
                queryType: true,
                fields: {
                    web: {
                        merge: true,
                        queryType: true,
                        // read(existing, { args: { offset, limit } }) {
                        //     // A read function should always return undefined if existing is
                        //     // undefined. Returning undefined signals that the field is
                        //     // missing from the cache, which instructs Apollo Client to
                        //     // fetch its value from your GraphQL server.
                        //     return (
                        //         existing &&
                        //         existing.slice(offset, offset + limit)
                        //     );
                        // },

                        // The keyArgs list and merge function are the same as above.
                        keyArgs: [],
                        // merge(existing, incoming, { args: { offset = 0 } }) {
                        //     const merged = existing ? existing.slice(0) : [];
                        //     for (let i = 0; i < incoming.length; ++i) {
                        //         merged[offset + i] = incoming[i];
                        //     }
                        //     return merged;
                        // },
                    },
                    crm: {
                        merge: true,
                        queryType: true,
                    },
                    admin: {
                        merge: true,
                        queryType: true,
                    },
                    blog: {
                        merge: true,
                        queryType: true,
                    },
                    twitch: {
                        merge: true,
                        queryType: true,
                    },
                    soundEmotes: {
                        merge: true,
                        queryType: true,
                    },
                    discord: {
                        merge: true,
                        queryType: true,
                    },
                    browserExtension: {
                        merge: true,
                        queryType: true,
                    },
                },
            },
            Mutation: {
                queryType: true,
                fields: {
                    web: {
                        merge: true,
                        queryType: true,
                    },
                    crm: {
                        merge: true,
                        queryType: true,
                    },
                    admin: {
                        merge: true,
                        queryType: true,
                    },
                    blog: {
                        merge: true,
                        queryType: true,
                    },
                    twitch: {
                        merge: true,
                        queryType: true,
                    },
                    soundEmotes: {
                        merge: true,
                        queryType: true,
                    },
                    discord: {
                        merge: true,
                        queryType: true,
                    },
                    browserExtension: {
                        merge: true,
                        queryType: true,
                    },
                },
            },
        },
    }).restore(initialState);
};

export function createApolloClient({ apc }) {
    return new ApolloClient({
        cache: apc,
        connectToDevTools: !!isBrowser,
        link: ApolloLink.from([
            errorLink,
            authLink,
            createUploadLink({ credentials: "include", uri }),
        ]),
        ssrMode: !isBrowser,
        typeDefs,
        resolvers,
        // defaultOptions: {
        //     watchQuery: {
        //         fetchPolicy: "cache-first",
        //         errorPolicy: "all",
        //     },
        //     query: {
        //         fetchPolicy: "cache-first",
        //         errorPolicy: "all",
        //     },
        // },
    });
}

export function initializeApolloSync(initialState = null) {
    const _apolloCache = apolloCache ?? createApolloCache({ initialState });

    if (!apolloCache) {
        apolloCache = _apolloCache;
    }

    const _apolloClient =
        apolloClient ?? createApolloClient({ initialState, apc: apolloCache });

    // gets hydrated here
    if (initialState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _apolloClient.extract();

        // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
        const data = {};

        for (const key in existingCache) {
            if (existingCache.hasOwnProperty(key)) {
                data[key] = existingCache[key];
            }
        }

        for (const key in initialState) {
            if (initialState.hasOwnProperty(key)) {
                if (Array.isArray(initialState[key])) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [];
                    }

                    for (const item of initialState[key]) {
                        if (!data[key].some((d) => d === item)) {
                            data[key].push(item);
                        }
                    }
                } else {
                    data[key] = initialState[key];
                }
            }
        }

        // Restore the cache with the merged data
        _apolloClient.cache.restore(data);
    }

    // For SSG and SSR always create a new Apollo Client
    if (typeof window === "undefined") return _apolloClient;
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export async function initializeApollo(initialState = null) {
    const apolloClient = initializeApolloSync(initialState);

    return apolloClient;
}

// https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js
export function addApolloState(client, pageProps) {
    if (pageProps?.props) {
        pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
    }

    return pageProps;
}

export function useApollo(initialState = {}) {
    const state = initialState[APOLLO_STATE_PROP_NAME];
    const store = useMemo(() => initializeApolloSync(state), [state]);
    return store;
}
