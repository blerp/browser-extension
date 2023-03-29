import React, { useState, useRef, useMemo } from "react";
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
import BlerpComponent from "./BlerpComponent";
import { EXTENSION_HEIGHT, EXTENSION_HEIGHT_PX } from "../../constants";

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

    width: 93px;
    height: 127px;
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
        $searchTerm: String
    ) {
        browserExtension {
            soundEmotesFeaturedContentPagination(
                page: $page
                perPage: $perPage
                userId: $streamerId
                showSavedOnly: $showSaved
                sortOverride: $sortOverride
                searchQuery: $searchTerm
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

const PER_PAGE = 300;

const renderEmptyBite = ({ index }) => {
    const delay = index * 0.2;
    return <SleekStack delay={delay}></SleekStack>;
};

const NewSection = ({
    bites,
    userSignedIn,
    setActiveBlerp,
    activeBlerp,
    currencyGlobalState,
    searchTerm,
}) => {
    return (
        <Stack
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "5px",
                background:
                    "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(315deg, rgba(253, 41, 92, 0.4) 0%, rgba(53, 7, 180, 0.4) 100%)",
                borderRadius: "12px",
                margin: "6px",
            }}
        >
            <Text
                sx={{
                    width: "27px",
                    height: "14px",
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "16px",
                    textAlign: "center",
                    letterSpacing: "0.5px",
                    color: "#FFFFFF",
                    marginBottom: "4px",
                }}
            >
                New
            </Text>

            <Stack
                direction='row'
                flexWrap='wrap'
                sx={{ justifyContent: "center" }}
            >
                {bites.map((bite, index) => {
                    return (
                        <BlerpComponent
                            bite={bite?.bite || bite}
                            setActiveBlerp={setActiveBlerp}
                            activeBlerp={activeBlerp}
                            currencyGlobalState={currencyGlobalState}
                            userSignedIn={userSignedIn}
                            marginBite='4px'
                        />
                    );
                })}
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
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "4px",
                width: "100%",
            }}
        >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
                return renderEmptyBite({ index: num });
            })}
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
    userSignedIn,
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
            showUserContent: showFavorites,
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
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "4px",
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

            {!data?.browserExtension?.biteElasticSearch?.items?.length &&
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
                    <Stack
                        direction='column'
                        sx={{ width: "100%", margin: "4px 12px 12px" }}
                    >
                        <NoSearchResults
                            searchTerm={searchTerm}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                        />
                    </Stack>
                ))}

            {loading && <EllipsisLoader />}

            {data?.browserExtension?.biteElasticSearch?.items &&
                data?.browserExtension?.biteElasticSearch?.items.map((bite) => {
                    return (
                        <>
                            <BlerpComponent
                                bite={bite?.bite || bite}
                                setActiveBlerp={setActiveBlerp}
                                activeBlerp={activeBlerp}
                                currencyGlobalState={currencyGlobalState}
                                userSignedIn={userSignedIn}
                                searchTerm={searchTerm}
                            />
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
    userSignedIn,
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
                            <BlerpComponent
                                bite={bite?.bite || bite}
                                setActiveBlerp={setActiveBlerp}
                                activeBlerp={activeBlerp}
                                currencyGlobalState={currencyGlobalState}
                                userSignedIn={userSignedIn}
                            />
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
    userSignedIn,
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
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "4px",
                width: "100%",
            }}
        >
            {/* {renderNewSection()} */}
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
                                <BlerpComponent
                                    bite={bite?.bite || bite}
                                    setActiveBlerp={setActiveBlerp}
                                    activeBlerp={activeBlerp}
                                    currencyGlobalState={currencyGlobalState}
                                    userSignedIn={userSignedIn}
                                />
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

const FeaturedPageNew = ({
    setActiveBlerp,
    activeBlerp,
    searchTerm,
    blerpSoundEmotesStreamer,
    showSavedOnly,
    currencyGlobalState,
    userSignedIn,
    showFavorites,
    currentStreamerBlerpUser,
}) => {
    // const [featuredSort, setFeaturedSort] = useState({
    //     name: "Newest",
    //     value:
    //         currencyGlobalState === "POINTS"
    //             ? "CHANNELPOINTSAMOUNT_ASC"
    //             : "BEETAMOUNT_ASC",
    // });
    //featuredSort?.value
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
            showSaved: showSavedOnly,
            sortOverride:
                currencyGlobalState === "POINTS"
                    ? "CHANNELPOINTSAMOUNT_ASC"
                    : "BEETAMOUNT_ASC", // make sure to only pass in if it's not null
        },
        fetchPolicy: "network-only",
    });

    const lastViewedAt =
        currentStreamerBlerpUser?.loggedInChannelPointBasket?.lastViewedAt;

    const allBites =
        data?.browserExtension?.soundEmotesFeaturedContentPagination?.items ||
        [];

    const [newBites, oldBites] = useMemo(() => {
        if (lastViewedAt) {
            const newItems = allBites.filter(
                (bite) =>
                    bite?.bite?.soundEmotesContext?.addedAt &&
                    new Date(bite?.bite?.soundEmotesContext?.addedAt) >
                        new Date(lastViewedAt),
            );

            const oldItems = allBites.filter(
                (bite) =>
                    !bite?.bite?.soundEmotesContext?.addedAt ||
                    new Date(bite?.bite?.soundEmotesContext?.addedAt) <=
                        new Date(lastViewedAt),
            );

            return [newItems, oldItems];
        } else {
            return [[], allBites];
        }
    }, [allBites, lastViewedAt]);

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
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "4px",
                width: "100%",
            }}
        >
            {/* <Stack
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
            </Stack> */}
            {!data?.browserExtension?.soundEmotesFeaturedContentPagination
                ?.items?.length &&
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

            {lastViewedAt && newBites.length > 0 && (
                <NewSection
                    bites={newBites}
                    userSignedIn={userSignedIn}
                    setActiveBlerp={setActiveBlerp}
                    activeBlerp={activeBlerp}
                    currencyGlobalState={currencyGlobalState}
                    searchTerm={searchTerm}
                />
            )}

            {oldBites.map((bite) => {
                return (
                    <>
                        <BlerpComponent
                            bite={bite?.bite || bite}
                            setActiveBlerp={setActiveBlerp}
                            activeBlerp={activeBlerp}
                            currencyGlobalState={currencyGlobalState}
                            searchTerm={searchTerm}
                            userSignedIn={userSignedIn}
                        />
                    </>
                );
            })}
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
    userSignedIn,

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
        userSignedIn,
    };

    return (
        <Stack
            sx={{
                display: "flex",
                alignItems: "center",
                padding: "0 4px 4px",
                width: "100%",
                height: "100%",
                maxHeight: `${EXTENSION_HEIGHT - 40}px`,
            }}
        >
            {!blerpSoundEmotesStreamer && !searchTerm ? (
                showFavorites ? (
                    <StreamerNeedsToSetup {...pageProps} />
                ) : (
                    <StreamerNeedsToSetup {...pageProps} />
                )
            ) : showFavorites ? (
                <FeaturedPageNew {...pageProps} showSavedOnly={true} />
            ) : searchTerm && searchTerm.length ? (
                <SearchPage {...pageProps} />
            ) : (
                <FeaturedPageNew {...pageProps} showSavedOnly={false} />
            )}
        </Stack>
    );
};

export default ExtensionRoot;