import React, { useState, useRef } from "react";

import { Stack, Button, Text, BlerpyIcon } from "@blerp/design";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { useApollo } from "../../networking/apolloClient";
import { BITE_WITH_SOUND_EMOTES } from "../../mainGraphQl";
import CoolNewSearchBar from "./CoolNewSearchBar";

import EllipsisLoader from "./EllipsisLoader";
import StreamerNeedsToSetup from "./StreamerNeedsToSetup";

const ALL_CONTENT = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtensionSearchContent(
        $searchTerm: String!
        $page: Int
        $perPage: Int
        $audienceRatings: [AudienceRating]
        $audioDuration: Int
        $streamerId: MongoID
        $analytics: JSON
    ) {
        browserExtension {
            biteElasticSearch(
                query: $searchTerm
                page: $page
                perPage: $perPage
                audienceRating: $audienceRatings
                optionalAudioDuration: $audioDuration
                analytics: { data: $analytics }
                userId: $streamerId
                viewerSide: true
            ) {
                pageInfo {
                    perPage
                    currentPage
                    hasNextPage
                }
                items {
                    ...BiteSoundEmotesFragment
                }
            }
        }
    }
`;

const GET_FEATURED_LIST_SOUND_EMOTES = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtensionGetFeaturedBites(
        $page: Int
        $perPage: Int
        $streamerId: MongoID!
    ) {
        browserExtension {
            soundEmotesFeaturedContentPagination(
                page: $page
                perPage: $perPage
                userId: $streamerId
            ) {
                count
                items {
                    _id
                    biteId
                    beetAmount
                    bite {
                        ...BiteSoundEmotesFragment
                    }
                }
                pageInfo {
                    currentPage
                    pageCount
                    itemCount
                    hasNextPage
                }
            }
        }
    }
`;

const FEATURED_CONTENT = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtensionFeatured(
        $streamerId: MongoID
        $audienceRatings: [AudienceRating]
    ) {
        browserExtension {
            globalBlerps(
                limit: 10
                platforms: [GLOBAL]
                audienceRating: $audienceRatings
            ) {
                bites {
                    ...BiteSoundEmotesFragment
                }
            }

            globalTwo: globalBlerps(
                limit: 10
                platforms: [GLOBAL]
                audienceRating: $audienceRatings
                forcedSorting: 5
            ) {
                bites {
                    ...BiteSoundEmotesFragment
                }
            }
        }
    }
`;

export const getArrayOfMpaaRatings = (rating) => {
    switch (rating) {
        case "UR":
            return ["G", "PG", "PG13", "R", "UR"];
        case "R":
            return ["G", "PG", "PG13", "R"];
        case "PG13":
            return ["G", "PG", "PG13"];
        case "PG":
            return ["G", "PG"];
        case "G":
        default:
            return ["G"];
            break;
    }
};

const PER_PAGE = 20;

const renderBite = ({ bite, activeBlerp, setActiveBlerp }) => {
    if (!bite) {
        return <></>;
    }

    return (
        <Stack
            key={bite?._id}
            sx={{
                width: "80px",
                height: "80px",
                position: "relative",
                borderRadius: "12px",
                margin: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",

                "&:hover": {
                    opacity: 0.7,
                },
                borderColor: "seafoam.main",
                borderStyle: "solid",
                borderWidth: activeBlerp?._id === bite?._id ? "8px" : "0px",
            }}
            onClick={() => {
                setActiveBlerp(bite);
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "12px",
                }}
            ></div>

            <Stack
                sx={{
                    height: "3.5em",
                    width: "94%",
                    overflow: "hidden",
                    position: "absolute",
                    top: "2px",
                }}
            >
                <Text
                    sx={{
                        color: "white",

                        textAlign: "center",
                        fontSize: "11px",
                        textOverflow: "ellipsis",
                        width: "100%",

                        lineHeight: "1.75em",
                    }}
                >
                    {bite?.title}
                </Text>
            </Stack>

            {bite?.image?.original?.url && (
                <img
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                    }}
                    src={bite?.image?.original?.url}
                />
            )}

            <Stack
                direction='column'
                sx={{
                    position: "absolute",
                    bottom: "12px",
                }}
            >
                <Text
                    sx={{
                        color: "white",
                        textAlign: "center",
                        fontSize: "8px",
                    }}
                >
                    Beets: {bite?.soundEmotesContext?.beetAmount}
                </Text>

                <Text
                    sx={{
                        color: "white",
                        textAlign: "center",
                        fontSize: "8px",
                    }}
                >
                    Points: {bite?.soundEmotesContext?.channelPointsAmount}
                </Text>
            </Stack>
        </Stack>
    );
};

const SearchPage = ({
    setActiveBlerp,
    activeBlerp,
    searchTerm,
    blerpSoundEmotesStreamer,
}) => {
    const { loading, data, error } = useQuery(ALL_CONTENT, {
        variables: {
            searchTerm: searchTerm,
            audienceRatings: getArrayOfMpaaRatings(
                blerpSoundEmotesStreamer?.mpaaRating,
            ),
            page: 1,
            perPage: PER_PAGE,
            streamerId: blerpSoundEmotesStreamer?.ownerId,
            fetchPolicy: "network-only",
        },
    });

    return (
        <Stack
            sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                overflowY: "scroll",
                maxHeight: "180px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingBottom: "120px",
                maxWidth: "440px",
                width: "100%",
            }}
        >
            {loading && <EllipsisLoader />}
            {data?.browserExtension?.biteElasticSearch?.items &&
                data?.browserExtension?.biteElasticSearch?.items.map((bite) => {
                    return (
                        <>{renderBite({ bite, setActiveBlerp, activeBlerp })}</>
                    );
                })}
        </Stack>
    );
};

const GlobalSounds = ({
    setActiveBlerp,
    activeBlerp,
    searchTerm,
    blerpSoundEmotesStreamer,
}) => {
    const { loading, data, error } = useQuery(FEATURED_CONTENT, {
        variables: {
            searchTerm: searchTerm,
            audienceRatings: getArrayOfMpaaRatings(
                blerpSoundEmotesStreamer?.mpaaRating,
            ),
            page: 1,
            perPage: PER_PAGE,
            streamerId: blerpSoundEmotesStreamer?.ownerId,
        },
        fetchPolicy: "network-only",
    });

    return (
        <>
            {loading && <EllipsisLoader />}

            {data?.browserExtension?.globalBlerps?.bites &&
                data?.browserExtension?.globalBlerps?.bites.map((bite) => {
                    return (
                        <>{renderBite({ bite, setActiveBlerp, activeBlerp })}</>
                    );
                })}
        </>
    );
};

const FeaturedPage = ({
    setActiveBlerp,
    activeBlerp,
    searchTerm,
    blerpSoundEmotesStreamer,
}) => {
    const { loading, data, error } = useQuery(GET_FEATURED_LIST_SOUND_EMOTES, {
        variables: {
            searchTerm: searchTerm,
            audienceRatings: getArrayOfMpaaRatings(
                blerpSoundEmotesStreamer?.mpaaRating,
            ),
            page: 1,
            perPage: PER_PAGE,
            streamerId: blerpSoundEmotesStreamer?.ownerId,
        },
        fetchPolicy: "network-only",
    });

    return (
        <Stack
            sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                overflowY: "scroll",
                maxHeight: "180px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingBottom: "120px",
                maxWidth: "440px",
                width: "100%",
            }}
        >
            <Text sx={{ width: "100%", margin: "4px 12px 12px" }}>
                Streamer Featured Sounds
            </Text>

            {loading && <EllipsisLoader />}
            {data?.browserExtension?.soundEmotesFeaturedContentPagination
                ?.items &&
                data?.browserExtension?.soundEmotesFeaturedContentPagination?.items.map(
                    (bite) => {
                        return (
                            <>
                                {renderBite({
                                    bite: bite?.bite,
                                    setActiveBlerp,
                                    activeBlerp,
                                })}
                            </>
                        );
                    },
                )}

            {!blerpSoundEmotesStreamer?.simpleMode && (
                <>
                    <Text sx={{ width: "100%", margin: "4px 12px 12px" }}>
                        Global Sounds
                    </Text>

                    <GlobalSounds
                        setActiveBlerp={setActiveBlerp}
                        activeBlerp={activeBlerp}
                        searchTerm={searchTerm}
                        blerpSoundEmotesStreamer={blerpSoundEmotesStreamer}
                    />
                </>
            )}
        </Stack>
    );
};

const ExtensionRoot = ({
    setActiveBlerp,
    activeBlerp,
    searchTerm,
    setSearchTerm,
    blerpSoundEmotesStreamer,
}) => {
    const pageProps = {
        setActiveBlerp: setActiveBlerp,
        activeBlerp: activeBlerp,
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        blerpSoundEmotesStreamer: blerpSoundEmotesStreamer,
    };

    return (
        <Stack
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                padding: "0 4px 4px",
                width: "100%",
            }}
        >
            <Stack
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    pb: "4px",
                }}
            >
                <Stack
                    sx={{
                        width: "96%",
                    }}
                >
                    <CoolNewSearchBar
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                        onClose={() => {}}
                    />
                </Stack>
            </Stack>

            {!blerpSoundEmotesStreamer ? (
                <StreamerNeedsToSetup {...pageProps} />
            ) : searchTerm && searchTerm.length ? (
                <SearchPage {...pageProps} />
            ) : (
                <FeaturedPage {...pageProps} />
            )}
        </Stack>
    );
};

export default ExtensionRoot;
