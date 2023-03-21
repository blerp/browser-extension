import React, { useState, useRef } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Dropdown,
    Select,
    MenuItem,
} from "@blerp/design";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import styled from "styled-components";

import { BITE_WITH_SOUND_EMOTES } from "../../mainGraphQl";
import EllipsisLoader from "./EllipsisLoader";
import StreamerNeedsToSetup from "./StreamerNeedsToSetup";
import NoSearchResults from "./NoSearchResults";

import CustomDropdown from "./CustomDropdown";
import NoSearchResultsFavorites from "./NoSearchResultsFavorites";

const SleekStack = styled(Stack)`
    @keyframes fade-in-out {
        0%,
        100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }

    width: 90px;
    height: 120px;
    background-color: ${(props) => props.theme.colors.grey7};
    margin: 4px;
    border-radius: 8px;
    animation: fade-in-out 1.8s linear infinite;
    ${({ delay }) => delay && `animation-delay: ${delay}s;`}
`;

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
        $showUserContent: Boolean
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
                showUserContent: $showUserContent
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
        $showSaved: Boolean
        $sortOverride: String
    ) {
        browserExtension {
            soundEmotesFeaturedContentPagination(
                page: $page
                perPage: $perPage
                userId: $streamerId
                showSavedOnly: $showSaved
                sortOverride: $sortOverride
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

const PER_PAGE = 120;

const fadeInOutAnimation = `
  @keyframes fade-in-out {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
`;

const renderEmptyBite = ({ index }) => {
    const delay = index * 0.2;
    return <SleekStack delay={delay}></SleekStack>;
};

const renderNewSection = () => {
    return (
        <Stack
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "5px",
                gap: "5px",
                height: "280px",
                background:
                    "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(315deg, rgba(253, 41, 92, 0.4) 0%, rgba(53, 7, 180, 0.4) 100%)",
                borderRadius: "12px",
                margin: "8px",
            }}
        >
            <Text
                sx={{
                    width: "27px",
                    height: "14px",
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "16px",
                    textAlign: "center",
                    letterSpacing: "0.5px",
                    color: "#FFFFFF",
                }}
            >
                New
            </Text>
            <Stack direction='row' flexWrap='wrap'>
                {Array.from({ length: 6 }, (_, index) => (
                    <SleekStack key={index} delay={index * 0.5} />
                ))}
            </Stack>
        </Stack>
    );
};

const renderLoadingBites = () => {
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
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                return renderEmptyBite({ index: num });
            })}
        </Stack>
    );
};

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
    showFavorites,
    currentStreamerBlerpUser,
    currencyGlobalState,
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
            showUserContent: showFavorites,
        },
    });

    if (loading) {
        return renderLoadingBites();
    }

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
            {/* {showSaved && (
                <Stack direction='row' sx={{ width: "100%" }}>
                    <Text sx={{ width: "100%", margin: "4px 12px 12px" }}>
                        Your Favorite Sounds on this Channel
                    </Text>
                </Stack>
            )}

            {searchTerm && !showSaved && (
                <Stack
                    direction='row'
                    sx={{ width: "100%", margin: "4px 12px 12px" }}
                >
                    <Text sx={{ width: "98%" }}>
                        Search Results for {searchTerm}
                    </Text>
                </Stack>
            )} */}

            {searchTerm &&
                !data?.browserExtension?.biteElasticSearch?.items &&
                (showFavorites ? (
                    <Stack
                        direction='column'
                        sx={{ width: "100%", margin: "4px 12px 12px" }}
                    >
                        <NoSearchResultsFavorites
                            searchTerm={searchTerm}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                        />
                    </Stack>
                ) : (
                    <></>
                ))}

            {loading && <EllipsisLoader />}
            {data?.browserExtension?.biteElasticSearch?.items &&
                data?.browserExtension?.biteElasticSearch?.items.map((bite) => {
                    return (
                        <>
                            {renderBite({
                                bite,
                                setActiveBlerp,
                                activeBlerp,
                                currencyGlobalState,
                            })}
                        </>
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
    currencyGlobalState,
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
                        <>
                            {renderBite({
                                bite,
                                setActiveBlerp,
                                activeBlerp,
                                currencyGlobalState,
                            })}
                        </>
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
    showSaved,
    currencyGlobalState,
}) => {
    const [featuredSort, setFeaturedSort] = useState({
        name: "Newest",
        value: "CREATEDAT_DESC",
    });

    // figure out how to add featuredSort to variables only when it is not null

    const { loading, data, error } = useQuery(GET_FEATURED_LIST_SOUND_EMOTES, {
        variables: {
            searchTerm: searchTerm,
            audienceRatings: getArrayOfMpaaRatings(
                blerpSoundEmotesStreamer?.mpaaRating,
            ),
            page: 1,
            perPage: PER_PAGE,
            streamerId: blerpSoundEmotesStreamer?.ownerId,
            sortOverride: featuredSort?.value, // make sure to only pass in if it's not null
        },
        fetchPolicy: "network-only",
    });

    if (loading) {
        return renderLoadingBites();
    }

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
            {renderNewSection()}
            <Stack
                direction='row'
                sx={{ width: "100%", margin: "4px 12px 12px" }}
            >
                <Text sx={{ width: "100%" }}>Streamer Featured Sounds</Text>

                <CustomDropdown
                    buttonTitle={featuredSort?.name || "Newest"}
                    title={"Sort By"}
                    buttonStyle={{
                        width: "118px",
                        // color: "notBlack.main",
                        // fontColor: "notBlack.main",
                        backgroundColor: "grey3.main",
                    }}
                    paperStyle={{}}
                    onChange={async (option) => {
                        setFeaturedSort(option);
                    }}
                    options={[
                        { name: "Newest", value: "CREATEDAT_DESC" },
                        { name: "Oldest", value: "CREATEDAT_ASC" },
                        { name: "Beet Amount", value: "BEETAMOUNT_DESC" },
                        // { name: "Beet Amount Reverse", value: "BEETAMOUNT_ASC" },
                        {
                            name: "Channel Points",
                            value: "CHANNELPOINTSAMOUNT_DESC",
                        },
                        // {
                        //     name: "Channel Points Reverse",
                        //     value: "CHANNELPOINTSAMOUNT_ASC",
                        // },
                    ]}
                />
            </Stack>

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
                                    currencyGlobalState,
                                })}
                            </>
                        );
                    },
                )}

            {!blerpSoundEmotesStreamer?.simpleMode && !showSaved && (
                <>
                    <Text sx={{ width: "100%", margin: "4px 12px 12px" }}>
                        Global Sounds
                    </Text>

                    <GlobalSounds
                        setActiveBlerp={setActiveBlerp}
                        activeBlerp={activeBlerp}
                        searchTerm={searchTerm}
                        blerpSoundEmotesStreamer={blerpSoundEmotesStreamer}
                        currencyGlobalState={currencyGlobalState}
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
    showFavorites,
    currentStreamerBlerpUser,

    setCurrencyGlobal,
    currencyGlobalState,
}) => {
    const pageProps = {
        setActiveBlerp: setActiveBlerp,
        activeBlerp: activeBlerp,
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        blerpSoundEmotesStreamer: blerpSoundEmotesStreamer,
        currentStreamerBlerpUser: currentStreamerBlerpUser,
        showFavorites,

        setCurrencyGlobal,
        currencyGlobalState,
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
            {!blerpSoundEmotesStreamer && !searchTerm ? (
                showFavorites ? (
                    <NoSearchResultsFavorites {...pageProps} />
                ) : (
                    <StreamerNeedsToSetup {...pageProps} />
                )
            ) : showFavorites ? (
                <SearchPage {...pageProps} />
            ) : searchTerm && searchTerm.length ? (
                <SearchPage {...pageProps} />
            ) : (
                <FeaturedPage {...pageProps} />
            )}
        </Stack>
    );
};

export default ExtensionRoot;
