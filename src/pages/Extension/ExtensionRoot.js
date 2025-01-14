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

import {
    BITE_WITH_SOUND_EMOTES,
    ALL_CONTENT,
    GET_FEATURED_LIST_SOUND_EMOTES,
} from "../../mainGraphQl";
import EllipsisLoader from "./EllipsisLoader";
import StreamerNeedsToSetup from "./StreamerNeedsToSetup";
import NoSearchResults from "./NoSearchResults";

import NoSearchResultsFavorites from "./NoSearchResultsFavorites";
import BlerpComponent from "./BlerpComponent";
import { EXTENSION_HEIGHT } from "../../constants";
import FavoritesFooter from "./FavoritesFooter";
import NoSearchResultsFooter from "./NoSearchResultsFooter";
import ExtensionLoadingBites from "./ExtensionLoadingBites";

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

const PER_PAGE = 180;

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
                // padding: "5px 0",
                background:
                    "linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(315deg, rgba(253, 41, 92, 0.4) 0%, rgba(53, 7, 180, 0.4) 100%)",
                borderRadius: "0",
                // margin: "8px 8px",
                width: "100%",
                marginBottom: "8px",
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
        // fetchPolicy: "network-only",
    });

    if (loading) {
        return <ExtensionLoadingBites />;
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

            {showFavorites ? (
                <FavoritesFooter
                    searchTerm={searchTerm}
                    currentStreamerBlerpUser={currentStreamerBlerpUser}
                />
            ) : (
                <NoSearchResultsFooter
                    searchTerm={searchTerm}
                    currentStreamerBlerpUser={currentStreamerBlerpUser}
                />
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageCount, setPageCount] = useState(1);

    const { loading, data, error, fetchMore } = useQuery(
        GET_FEATURED_LIST_SOUND_EMOTES,
        {
            variables: {
                searchTerm: searchTerm,
                audienceRatings: getArrayOfMpaaRatings(
                    blerpSoundEmotesStreamer?.mpaaRating,
                ),
                page: pageCount,
                perPage: PER_PAGE,
                streamerId: blerpSoundEmotesStreamer?.ownerId,
                showSaved: showSavedOnly,
                sortOverride:
                    currencyGlobalState === "POINTS"
                        ? "CHANNELPOINTSAMOUNT_ASC"
                        : "BEETAMOUNT_ASC", // make sure to only pass in if it's not null
            },
            fetchPolicy: showFavorites ? "network-only" : "cache-first",
        },
    );

    const handleLoadMore = async () => {
        if (
            !data.browserExtension.soundEmotesFeaturedContentPagination.pageInfo
                .hasNextPage ||
            loadingMore
        )
            return;

        setLoadingMore(true);

        await fetchMore({
            variables: {
                page:
                    data.browserExtension.soundEmotesFeaturedContentPagination
                        .pageInfo.currentPage + 1,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;

                return {
                    browserExtension: {
                        ...fetchMoreResult.browserExtension,
                        soundEmotesFeaturedContentPagination: {
                            ...fetchMoreResult.browserExtension
                                .soundEmotesFeaturedContentPagination,
                            items: [
                                ...prev.browserExtension
                                    .soundEmotesFeaturedContentPagination.items,
                                ...fetchMoreResult.browserExtension
                                    .soundEmotesFeaturedContentPagination.items,
                            ],
                        },
                    },
                };
            },
        });

        setLoadingMore(false);
    };

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
        return <ExtensionLoadingBites />;
    }

    return (
        <>
            <Stack
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    flexDirection: "row",
                    overflowY: "scroll",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    // paddingTop: "4px",
                    width: "100%",
                }}
            >
                {!!newBites?.length && newBites.length > 0 && (
                    <NewSection
                        bites={newBites}
                        userSignedIn={userSignedIn}
                        setActiveBlerp={setActiveBlerp}
                        activeBlerp={activeBlerp}
                        currencyGlobalState={currencyGlobalState}
                        searchTerm={searchTerm}
                    />
                )}
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
                    ?.items?.length ? (
                    showFavorites ? (
                        <Stack
                            direction='column'
                            sx={{ width: "100%", margin: "4px 12px 0px" }}
                        >
                            <NoSearchResultsFavorites
                                searchTerm={searchTerm}
                                currentStreamerBlerpUser={
                                    currentStreamerBlerpUser
                                }
                            />
                        </Stack>
                    ) : (
                        <Stack
                            direction='column'
                            sx={{ width: "100%", margin: "4px 12px 0px" }}
                        >
                            <StreamerNeedsToSetup
                                currentStreamerBlerpUser={
                                    currentStreamerBlerpUser
                                }
                            />
                        </Stack>
                    )
                ) : (
                    <></>
                )}

                {loading && <EllipsisLoader />}

                {!!oldBites?.length &&
                    oldBites.map((bite) => {
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

                {!!data?.browserExtension?.soundEmotesFeaturedContentPagination
                    ?.items?.length &&
                    (showFavorites ? (
                        <FavoritesFooter
                            searchTerm={searchTerm}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                            channelOwner={currentStreamerBlerpUser}
                        />
                    ) : (
                        <NoSearchResultsFooter
                            searchTerm={searchTerm}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                            channelOwner={currentStreamerBlerpUser}
                        />
                    ))}

                <Stack
                    direction={"column"}
                    sx={{
                        padding: "4px",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    {!loading &&
                        data?.browserExtension
                            ?.soundEmotesFeaturedContentPagination &&
                        data?.browserExtension
                            ?.soundEmotesFeaturedContentPagination.items
                            ?.length &&
                        data.browserExtension
                            .soundEmotesFeaturedContentPagination.items
                            ?.length >= PER_PAGE && (
                            <Button
                                variant='outlined'
                                onClick={handleLoadMore}
                                sx={{
                                    backgroundColor: "transparent",
                                    border: "#fff 1px solid",
                                    color: "white.override",
                                    margin: "0 auto",
                                    alignSelf: "center",
                                }}
                                disabled={
                                    !data.browserExtension
                                        .soundEmotesFeaturedContentPagination
                                        .pageInfo.hasNextPage
                                }
                            >
                                {loadingMore ? "Loading..." : "Load More"}
                            </Button>
                        )}
                </Stack>
            </Stack>
        </>
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

    isPopup,
}) => {
    const pageProps = {
        setActiveBlerp: setActiveBlerp,
        activeBlerp: activeBlerp,
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        blerpSoundEmotesStreamer: blerpSoundEmotesStreamer,
        currentStreamerBlerpUser:
            currentStreamerBlerpUser || blerpSoundEmotesStreamer,
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
                padding: "0 4px 0",
                width: "100%",
                height: "100%",
                maxHeight: isPopup ? "100%" : `${EXTENSION_HEIGHT - 40}px`,
                zIndex: 1,
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
