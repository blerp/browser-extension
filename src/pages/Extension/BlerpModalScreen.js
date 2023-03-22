import React, { useState, useRef, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Modal,
    SnackbarContext,
    ChannelPointsIcon,
} from "@blerp/design";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircle from "@mui/icons-material/CheckCircle";

import { useApollo } from "../../networking/apolloClient";
import styled from "styled-components";
import EllipsisLoader from "./EllipsisLoader";
import AudioPlayer from "./BlerpAudioPlayer";
import selectedProject from "../../projectConfig";

const PLAY_AND_TRANSFER_BEETS = gql`
    mutation soundEmotesBeetsTradeToCreator(
        $record: PlaySoundEmotesBeetsInput!
    ) {
        soundEmotes {
            beetsTradeToCreatorPlaySoundEmotes(record: $record) {
                transactionSuccessful
                transactionJournalEntry {
                    _id
                    transactionId
                    senderUserId
                    targetBeetBalance
                    type
                    reversed
                }
                userWallet {
                    _id
                    beetBalance
                    creatorBalance
                    brainTreeNonce
                }
            }
        }
    }
`;

const SPEND_SNOOTS_CP = gql`
    mutation spendingSomeSnoots($record: spendSnootsInput!) {
        soundEmotes {
            spendingSnoots(record: $record) {
                channelPointsBasket {
                    _id
                    points
                    lastIncrementedAt
                    ownerId
                    channelOwnerId
                }
            }
        }
    }
`;

const PLAY_TEST_SOUND = gql`
    mutation soundEmotesAdminTestSound(
        $blerpId: MongoID!
        $soundEmotesStreamerId: MongoID!
    ) {
        soundEmotes {
            sendTestBlerp(
                blerpId: $blerpId
                soundEmotesStreamerId: $soundEmotesStreamerId
                testRealSound: true
            ) {
                soundEmotesStreamer {
                    _id
                }
            }
        }
    }
`;

const GET_RANDOM_BITE = gql`
    query getRandomBite {
        web {
            biteRandomOne {
                _id
                title
                saved
            }
            userSignedIn {
                _id
                username
            }
        }
    }
`;

const BlerpModalScreen = ({
    isOpen,
    setActiveBlerp,
    activeBlerp,
    blerpStreamer,
    userSignedIn,
    activeSearchQuery,
    refetchAll,
    refetching,

    beetBasket,
    pointsBasket,
    currencyGlobalState,
}) => {
    const [localCurrencyType, setLocalCurrencyType] =
        useState(currencyGlobalState);

    const { loading, data, error } = useQuery(GET_RANDOM_BITE, {
        variables: {},
    });

    const apolloClient = useApollo();
    const [currentContent, setCurrentContent] = useState(false);
    const [showShared, setShowShared] = useState(false);

    const [shareBlerp] = useMutation(PLAY_AND_TRANSFER_BEETS);
    const [spendSnootsCP] = useMutation(SPEND_SNOOTS_CP);
    const [sendTest] = useMutation(PLAY_TEST_SOUND);

    const snackbarContext = useContext(SnackbarContext);

    const handleShareClicked = (isChannelPoints) => {
        if (!activeBlerp) {
            snackbarContext.triggerSnackbar({
                message: `Must select a blerp to share`,
                severity: "error",
                transitionType: "fade",
                position: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
            return;
        }

        if (!userSignedIn || !userSignedIn._id) {
            snackbarContext.triggerSnackbar({
                message: `Must be logged in to share a blerp`,
                severity: "error",
                transitionType: "fade",
                position: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });

            const returnTo =
                window.location.pathname !== "/tradeBeets"
                    ? window.location.pathname
                    : "/sound-emotes-live-stream-alerts";
            window.location = `/login?returnTo=${returnTo}`;
            return;
        }

        setShowShared(true);

        if (
            !isChannelPoints &&
            (userSignedIn && userSignedIn._id) === blerpStreamer?._id
        ) {
            sendTest({
                variables: {
                    blerpId: activeBlerp._id,
                    soundEmotesStreamerId: blerpStreamer?.soundEmotesStreamerId,
                },
            })
                .then((res) => {
                    snackbarContext.triggerSnackbar({
                        message: "Successfully shared Blerp!",
                        severity: "success",
                        transitionType: "fade",
                        position: {
                            vertical: "bottom",
                            horizontal: "right",
                        },
                    });
                })
                .catch((err) => {
                    snackbarContext.triggerSnackbar({
                        message: err && err.toString(),
                        severity: "error",
                        transitionType: "fade",
                        position: {
                            vertical: "bottom",
                            horizontal: "right",
                        },
                    });
                })
                .finally(() => {
                    setShowShared(false);
                    setActiveBlerp(null);
                });
        } else {
            const userAgent =
                typeof navigator?.userAgent === "string"
                    ? navigator?.platform
                    : undefined;
            const operatingSystem =
                typeof navigator?.platform === "string"
                    ? navigator?.platform
                    : undefined;
            const screenSizeWidth =
                typeof window?.innerWidth === "number"
                    ? window?.innerWidth
                    : undefined;
            const screenSizeHeight =
                typeof window?.innerHeight === "string"
                    ? window?.innerWidth
                    : undefined;

            isChannelPoints
                ? spendSnootsCP({
                      variables: {
                          record: {
                              blerpIdToPlay: activeBlerp._id,
                              channelOwnerId: blerpStreamer?._id,

                              userAgent,
                              operatingSystem,
                              screenSizeWidth,
                              screenSizeHeight,
                              searchQuery: activeSearchQuery,
                          },
                      },
                  })
                      .then((res) => {
                          snackbarContext.triggerSnackbar({
                              message: "Successfully shared Blerp!",
                              severity: "success",
                              transitionType: "fade",
                              position: {
                                  vertical: "bottom",
                                  horizontal: "right",
                              },
                          });
                          refetchAll();

                          // setShowSuccess(true);
                      })
                      .catch((err) => {
                          snackbarContext.triggerSnackbar({
                              message: err && err.toString(),
                              severity: "error",
                              transitionType: "fade",
                              position: {
                                  vertical: "bottom",
                                  horizontal: "right",
                              },
                          });
                          refetchAll();
                      })
                      .finally(() => {
                          setShowShared(false);
                          setActiveBlerp(null);
                      })
                : shareBlerp({
                      variables: {
                          record: {
                              blerpIdToPlay: activeBlerp._id,
                              soundEmotesStreamerId: blerpStreamer?._id,
                              userAgent,
                              operatingSystem,
                              screenSizeWidth,
                              screenSizeHeight,
                              searchQuery: activeSearchQuery,
                          },
                      },
                  })
                      .then((res) => {
                          snackbarContext.triggerSnackbar({
                              message: "Successfully shared Blerp!",
                              severity: "success",
                              transitionType: "fade",
                              position: {
                                  vertical: "bottom",
                                  horizontal: "right",
                              },
                          });
                          refetchAll();

                          // setShowSuccess(true);
                      })
                      .catch((err) => {
                          snackbarContext.triggerSnackbar({
                              message: err && err.toString(),
                              severity: "error",
                              transitionType: "fade",
                              position: {
                                  vertical: "bottom",
                                  horizontal: "right",
                              },
                          });

                          refetchAll();
                      })
                      .finally(() => {
                          setShowShared(false);
                          setActiveBlerp(null);
                      });
        }
    };

    return (
        <Stack sx={{}}>
            {!userSignedIn || !blerpStreamer ? (
                <Stack
                    sx={{
                        padding: "32px",
                        position: "relative",
                    }}
                >
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "4px",
                        }}
                    >
                        {!blerpStreamer ? (
                            <Button
                                // href={`${
                                //     selectedProject.host
                                // }/login?returnTo=${`/soundboard-browser-extension`}`}
                                // target='_blank'
                                // rel='noreferrer'
                                variant='outlined'
                                color='white'
                                sx={{
                                    "&[disabled]": {
                                        color: "white.main",
                                        backgroundColor: "notBlack.main",
                                        opacity: "0.5",
                                    },

                                    boxSizing: "border-box",
                                    color: "notBlack.main",
                                    maxWidth: "280px",
                                    textTransform: "none",
                                    border: "none",
                                    "&:hover": {
                                        opacity: 0.7,
                                        border: "none",
                                    },
                                    m: "4px",
                                }}
                            >
                                Find a Streamer with Blerp Setup
                            </Button>
                        ) : (
                            <Button
                                href={`${
                                    selectedProject.host
                                }/login?returnTo=${`/soundboard-browser-extension`}`}
                                target='_blank'
                                rel='noreferrer'
                                variant='contained'
                                color='notBlack'
                                sx={{
                                    "&[disabled]": {
                                        color: "white.main",
                                        backgroundColor: "notBlack.main",
                                        opacity: "0.5",
                                    },
                                    m: "4px",
                                    border: "1px solid",
                                    borderColor: "transparent",
                                    boxSizing: "border-box",
                                    color: "white.main",
                                    maxWidth: "280px",
                                    textTransform: "none",
                                }}
                            >
                                Login to Share Sounds
                            </Button>
                        )}
                    </Stack>
                </Stack>
            ) : (
                <Stack
                    sx={{
                        padding: "32px",
                        position: "relative",
                        alignItems: "center",
                    }}
                >
                    <Stack
                        sx={{
                            margin: "0",
                            width: "100px",
                        }}
                    >
                        {activeBlerp?.audio?.mp3?.url && (
                            <AudioPlayer
                                audioUrl={activeBlerp?.audio?.mp3?.url}
                                imageUrl={activeBlerp?.image?.original?.url}
                            />
                        )}
                    </Stack>

                    {showShared ? (
                        <Button
                            variant='ouline'
                            onClick={async () => {}}
                            sx={{
                                margin: "8px 12px 8px 16px",
                                fontSize: "18px",
                            }}
                        >
                            <Text sx={{ color: "white" }}>Sharing Blerp!</Text>
                        </Button>
                    ) : blerpStreamer?.browserOnline ? (
                        <>
                            {(activeBlerp?.soundEmotesContext?.playType ===
                                "ALL" ||
                                activeBlerp?.soundEmotesContext?.playType ===
                                    "BEETS") &&
                            beetBasket?.beetBalance <
                                activeBlerp?.soundEmotesContext?.beetAmount ? (
                                <Button
                                    onClick={async () => {
                                        window.open(
                                            `${selectedProject.host}/tradeBeets`,
                                            "_blank",
                                        );
                                    }}
                                    variant='contained'
                                    color='notBlack'
                                    sx={{
                                        "&[disabled]": {
                                            color: "white.main",
                                            backgroundColor: "notBlack.main",
                                            opacity: "0.5",
                                        },
                                        m: "4px",
                                        border: "1px solid",
                                        borderColor: "transparent",
                                        boxSizing: "border-box",
                                        color: "white.main",
                                        maxWidth: "280px",
                                        textTransform: "none",
                                    }}
                                    startIcon={
                                        <img
                                            src='https://cdn.blerp.com/blerp_products/Icons/Beet-NotBlack.svg'
                                            style={{ width: "12px" }}
                                        />
                                    }
                                >
                                    You Need{" "}
                                    {activeBlerp?.soundEmotesContext
                                        ?.beetAmount -
                                        activeBlerp?.soundEmotesContext
                                            ?.beetAmount}{" "}
                                    Beets
                                </Button>
                            ) : (
                                <Button
                                    onClick={async () => {
                                        console.log("Query Call");
                                        await handleShareClicked(false);

                                        // const { data } = await apolloClient.query({
                                        //     query: GET_RANDOM_BITE,
                                        //     variables: {},
                                        // });
                                    }}
                                    variant='contained'
                                    color='notBlack'
                                    sx={{
                                        "&[disabled]": {
                                            color: "white.main",
                                            backgroundColor: "notBlack.main",
                                            opacity: "0.5",
                                        },
                                        m: "4px",
                                        border: "1px solid",
                                        borderColor: "transparent",
                                        boxSizing: "border-box",
                                        color: "white.main",
                                        maxWidth: "280px",
                                        textTransform: "none",
                                    }}
                                    startIcon={
                                        <img
                                            src='https://cdn.blerp.com/blerp_products/Icons/Beet-NotBlack.svg'
                                            style={{ width: "12px" }}
                                        />
                                    }
                                >
                                    Share for{" "}
                                    {
                                        activeBlerp?.soundEmotesContext
                                            ?.beetAmount
                                    }{" "}
                                    Beets
                                </Button>
                            )}

                            {(activeBlerp?.soundEmotesContext?.playType ===
                                "ALL" ||
                                activeBlerp?.soundEmotesContext?.playType ===
                                    "POINTS") &&
                            pointsBasket?.points <
                                activeBlerp?.soundEmotesContext
                                    ?.channelPointsAmount ? (
                                <Button
                                    variant='outlined'
                                    color='white'
                                    onClick={async () => {}}
                                    sx={{
                                        "&[disabled]": {
                                            color: "white.main",
                                            backgroundColor: "notBlack.main",
                                            opacity: "0.5",
                                        },

                                        boxSizing: "border-box",
                                        color: "notBlack.main",
                                        maxWidth: "280px",
                                        textTransform: "none",
                                        border: "none",
                                        "&:hover": {
                                            opacity: 0.7,
                                            border: "none",
                                        },
                                        m: "4px",
                                    }}
                                    startIcon={
                                        <ChannelPointsIcon
                                            sx={{ fontSize: "12px" }}
                                        />
                                    }
                                >
                                    {activeBlerp?.soundEmotesContext
                                        ?.channelPointsAmount -
                                        activeBlerp?.soundEmotesContext
                                            ?.channelPointsAmount}{" "}
                                    More Points Needed
                                </Button>
                            ) : (
                                <Button
                                    variant='outlined'
                                    color='white'
                                    onClick={async () => {
                                        await handleShareClicked(true);
                                        // const { data } = await apolloClient.query({
                                        //     query: GET_RANDOM_BITE,
                                        //     variables: {},
                                        // });
                                    }}
                                    sx={{
                                        "&[disabled]": {
                                            color: "white.main",
                                            backgroundColor: "notBlack.main",
                                            opacity: "0.5",
                                        },

                                        boxSizing: "border-box",
                                        color: "notBlack.main",
                                        maxWidth: "280px",
                                        textTransform: "none",
                                        border: "none",
                                        "&:hover": {
                                            opacity: 0.7,
                                            border: "none",
                                        },
                                        m: "4px",
                                    }}
                                    startIcon={
                                        <ChannelPointsIcon
                                            sx={{ fontSize: "12px" }}
                                        />
                                    }
                                >
                                    Share for{" "}
                                    {
                                        activeBlerp?.soundEmotesContext
                                            ?.channelPointsAmount
                                    }{" "}
                                    Points
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            variant='outlined'
                            color='white'
                            onClick={async () => {
                                await refetchAll();
                            }}
                            rel='noreferrer'
                            sx={{
                                margin: "8px 12px 8px 16px",
                            }}
                        >
                            <Text sx={{ color: "white", fontSize: "12px" }}>
                                {" "}
                                {refetching
                                    ? "Loading..."
                                    : "Streamer browser source not connected"}
                            </Text>
                        </Button>
                    )}

                    {true ? (
                        <Stack
                            direction='row'
                            sx={{
                                borderRadius: "4px",
                                alignItems: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                justifyContent: "center",
                                zIndex: 3,
                            }}
                        >
                            <Stack
                                direction='row'
                                sx={{
                                    backgroundColor: "#B43757",
                                    height: "24px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={() => {
                                    setLocalCurrencyType("BEETS");
                                }}
                            >
                                <img
                                    src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        paddingRight: "4px",
                                    }}
                                />

                                {localCurrencyType === "BEETS" && (
                                    <Text
                                        sx={{
                                            color: "white",
                                            textAlign: "center",
                                            fontSize: "18px",
                                            paddingRight: "4px",
                                        }}
                                    >
                                        {
                                            activeBlerp?.soundEmotesContext
                                                ?.beetAmount
                                        }
                                    </Text>
                                )}
                            </Stack>

                            <Stack
                                direction='row'
                                sx={{
                                    backgroundColor: "grey6.main",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "24px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={() => {
                                    setLocalCurrencyType("POINTS");
                                }}
                            >
                                <img
                                    src='https://cdn.blerp.com/design/browser-extension/cp_2.svg'
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        paddingLeft: "4px",
                                    }}
                                />

                                {localCurrencyType === "POINTS" && (
                                    <Text
                                        sx={{
                                            color: "white",
                                            textAlign: "center",
                                            fontSize: "18px",
                                            paddingLeft: "4px",
                                        }}
                                    >
                                        {
                                            activeBlerp?.soundEmotesContext
                                                ?.channelPointsAmount
                                        }
                                    </Text>
                                )}
                            </Stack>
                        </Stack>
                    ) : (
                        <></>
                    )}

                    {/* {!showShared && (
                        <Button
                            onClick={async () => {
                                setActiveBlerp(null);
                            }}
                            sx={{}}
                        >
                            Cancel
                        </Button>
                    )} */}
                </Stack>
            )}
        </Stack>
    );
};

export default BlerpModalScreen;
