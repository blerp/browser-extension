import React, { useState, useRef, useContext, useEffect } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Modal,
    SnackbarContext,
    ChannelPointsIcon,
} from "@blerp/design";
import { useQuery, useMutation, isReference } from "@apollo/client";
import gql from "graphql-tag";

import { useApollo } from "../../networking/apolloClient";
import styled from "styled-components";
import EllipsisLoader from "./EllipsisLoader";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import selectedProject from "../../projectConfig";
import { EXTENSION_HEIGHT_PX } from "../../constants";
import BlerpAudioPlayer from "./BlerpAudioPlayer";
import SegmentedSwitch from "./SegmentedSwitch";

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
    volume = 1,
}) => {
    const [localCurrencyType, setLocalCurrencyType] = useState(null); // currencyGlobalState

    const { loading, data, error } = useQuery(GET_RANDOM_BITE, {
        variables: {},
    });

    const apolloClient = useApollo();
    const [currentContent, setCurrentContent] = useState(false);
    const [showShared, setShowShared] = useState(false);

    const [maxCooldown, setMaxCooldown] = useState(0);

    useEffect(() => {
        const channelCooldown =
            blerpStreamer?.soundEmotesObject?.channelCooldownLeft || 0;
        const userCooldown =
            blerpStreamer?.soundEmotesObject?.userCooldownLeft || 0;
        setMaxCooldown(Math.max(channelCooldown, userCooldown));
    }, [blerpStreamer]);

    useEffect(() => {
        if (maxCooldown === 0) return;

        const timer = setInterval(() => {
            setMaxCooldown((prevMaxCooldown) => {
                if (prevMaxCooldown > 0) {
                    return prevMaxCooldown - 1;
                } else {
                    clearInterval(timer);
                    return 0;
                }
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [maxCooldown]);

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
                    refetchAll();
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

    const renderScreen = () => {
        if (!userSignedIn || !blerpStreamer) {
            return (
                <Stack
                    sx={{
                        padding: "32px",
                        position: "relative",
                        height: "100%",
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
            );
        }

        // Blocked or can't share
        if (blerpStreamer?.loggedInUserIsBlocked) {
            return (
                <Stack
                    sx={{
                        padding: "32px",
                        position: "relative",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <Stack
                        sx={{
                            margin: "0",
                            width: "160px",
                            height: "160px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "grey6.real",
                            borderRadius: "12px",
                        }}
                    >
                        <RemoveCircleOutlineRoundedIcon
                            sx={{ width: "70px", height: "70px" }}
                        />
                    </Stack>

                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",

                            margin: "16px",
                        }}
                    >
                        Oops, you have been blocked!
                    </Text>
                </Stack>
            );
        }

        const renderCorrectTinyText = () => {
            if (blerpStreamer?.soundEmotesObject?.extensionPaused) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        Temporarily Paused
                    </Text>
                );
            }

            if (!blerpStreamer?.browserOnline) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        Streamer Browser Source Offline
                    </Text>
                );
            }

            if (maxCooldown > 0) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        On Cooldown {maxCooldown} Sec
                    </Text>
                );
            }

            if (!localCurrencyType) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        Select a Payment Method
                    </Text>
                );
            } else if (
                localCurrencyType === "BEETS" &&
                beetBasket?.beetBalance <
                    activeBlerp?.soundEmotesContext?.beetAmount
            ) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        Oops not enough Beets
                    </Text>
                );
            } else if (localCurrencyType === "BEETS") {
                return;
            } else if (
                localCurrencyType === "POINTS" &&
                pointsBasket?.points <
                    activeBlerp?.soundEmotesContext?.channelPointsAmount
            ) {
                return (
                    <Text
                        sx={{
                            color: "grey4.real",

                            fontFamily: "Odudo",
                            fontStyle: "normal",
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "20px",
                            /* identical to box height, or 167% */

                            display: "flex",
                            alignItems: "center",
                            textAlign: "center",
                            letterSpacing: "0.1px",
                        }}
                    >
                        Oops not enough Points
                    </Text>
                );
            } else if (localCurrencyType === "POINTS") {
                return <></>;
            } else {
                return <></>;
            }
        };

        const renderShareButton = () => {
            if (maxCooldown > 0) {
                return;

                return (
                    <Button
                        variant='custom'
                        onClick={async () => {
                            if (refetching) return;

                            await refetchAll();
                        }}
                        sx={{
                            opacity: 0.5,
                            margin: "8px 12px 8px 16px",
                            fontSize: "16px",
                            lineHeight: "16px",
                            background: "#E2E6E7",
                            "&:hover": {
                                background: "#E2E6E7",
                            },
                        }}
                    >
                        <Text
                            sx={{
                                color: "#8A9193",
                                fontWeight: 600,
                            }}
                        >
                            {refetching
                                ? "Loading..."
                                : `Cooldown ${maxCooldown} seconds`}
                        </Text>
                    </Button>
                );
            }

            if (showShared) {
                if (localCurrencyType === "BEETS") {
                    return (
                        <Button
                            onClick={async () => {}}
                            variant='contained'
                            color='notBlack'
                            sx={{
                                "&[disabled]": {
                                    color: "white.main",
                                    backgroundColor: "notBlack.main",
                                    opacity: "0.5",
                                },
                                m: "4px",
                                "&:hover": {
                                    backgroundColor: "ibisRed.main",
                                    border: "3px solid #B43757",
                                },

                                boxSizing: "border-box",
                                backgroundColor: "ibisRed.main",
                                color: "#fff",
                                maxWidth: "280px",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "16px",
                                border: "3px solid #B43757",
                            }}
                        >
                            Play with Beets
                        </Button>
                    );
                } else {
                    return (
                        <Button
                            variant='contained'
                            color='white'
                            onClick={async () => {}}
                            sx={{
                                "&[disabled]": {
                                    color: "white.main",
                                    backgroundColor: "notBlack.main",
                                    opacity: "0.5",
                                },
                                color: "white.real",
                                backgroundColor: "black.real",
                                boxSizing: "border-box",
                                color: "notBlack.main",
                                maxWidth: "280px",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "black.real",
                                    border: "3px solid rgba(255, 255, 255, 0.5)",
                                },
                                m: "4px",
                                fontWeight: 600,
                                fontSize: "16px",
                                border: "3px solid rgba(255, 255, 255, 0.5)",
                            }}
                        >
                            Play with Points
                        </Button>
                    );
                }
            } else if (
                localCurrencyType === "BEETS" &&
                blerpStreamer?.browserOnline
            ) {
                if (
                    beetBasket?.beetBalance <
                    activeBlerp?.soundEmotesContext?.beetAmount
                ) {
                    return;
                }
                return (
                    <Button
                        onClick={async () => {
                            await handleShareClicked(false);
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
                            backgroundColor: "ibisRed.main",
                            color: "#fff",
                            maxWidth: "280px",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "16px",
                        }}
                        // startIcon={
                        //     <img
                        //         src='https://cdn.blerp.com/blerp_products/Icons/Beet-NotBlack.svg'
                        //         style={{ width: "12px" }}
                        //     />
                        // }
                    >
                        Play with Beets
                        {/* Share for {activeBlerp?.soundEmotesContext?.beetAmount}{" "}
                        Beets */}
                    </Button>
                );
            } else if (
                localCurrencyType === "POINTS" &&
                blerpStreamer?.browserOnline
            ) {
                if (
                    pointsBasket?.points <
                    activeBlerp?.soundEmotesContext?.channelPointsAmount
                ) {
                    return <></>;
                }

                return (
                    <Button
                        variant='contained'
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
                            color: "white.real",
                            backgroundColor: "black.real",
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
                            fontWeight: 600,
                            fontSize: "16px",
                        }}
                        // startIcon={
                        //     <ChannelPointsIcon sx={{ fontSize: "12px" }} />
                        // }
                    >
                        Play with Points
                        {/* Share for{" "}
                        {activeBlerp?.soundEmotesContext?.channelPointsAmount}{" "}
                        Points */}
                    </Button>
                );
            } else {
                return (
                    <Button
                        variant='custom'
                        onClick={async () => {
                            if (refetching) return;

                            await refetchAll();
                        }}
                        sx={{
                            opacity: 0.5,
                            margin: "8px 12px 8px 16px",
                            fontSize: "16px",
                            lineHeight: "16px",
                            background: "#E2E6E7",
                            "&:hover": {
                                background: "#E2E6E7",
                            },
                        }}
                    >
                        <Text
                            sx={{
                                color: "#8A9193",
                                fontWeight: 600,
                            }}
                        >
                            {refetching ? "Loading..." : "Play on Stream!"}
                        </Text>
                    </Button>
                );
            }
        };

        return (
            <Stack
                sx={{
                    padding: "32px",
                    position: "relative",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                <Stack
                    sx={{
                        margin: "0",
                        width: "160px",
                        height: "160px",
                    }}
                >
                    {activeBlerp?.audio?.mp3?.url && (
                        <BlerpAudioPlayer
                            audioUrl={activeBlerp?.audio?.mp3?.url}
                            imageUrl={activeBlerp?.image?.original?.url}
                            volume={volume}
                        />
                    )}
                </Stack>

                <Stack
                    sx={{
                        marginTop: "20px",
                    }}
                >
                    {true ? (
                        <SegmentedSwitch
                            selectedOption={localCurrencyType}
                            setSelectedOption={setLocalCurrencyType}
                            selectedOptionLeft='BEETS'
                            selectedOptionRight='POINTS'
                            leftSideDisabled={
                                activeBlerp?.soundEmotesContext.beetsDisabled ||
                                blerpStreamer?.soundEmotesObject?.beetsDisabled
                            }
                            rightSideDisabled={
                                activeBlerp?.soundEmotesContext
                                    .channelPointsDisabled ||
                                blerpStreamer?.soundEmotesObject
                                    ?.channelPointsDisabled
                            }
                            leftSideAmount={
                                activeBlerp?.soundEmotesContext.beetAmount
                            }
                            rightSideAmount={
                                activeBlerp?.soundEmotesContext
                                    .channelPointsAmount
                            }
                            leftIcon='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            rightIcon='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            leftSelectedIcon='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            rightSelectedIcon='https://cdn.blerp.com/design/browser-extension/cp_black.svg'
                        />
                    ) : (
                        <></>
                    )}
                </Stack>

                {renderCorrectTinyText()}
                <Stack sx={{ margin: "12px 6px 6px" }}>
                    {renderShareButton()}
                </Stack>
            </Stack>
        );
    };

    return (
        <Stack
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                width: "100%",
                minHeight: EXTENSION_HEIGHT_PX,
            }}
        >
            {renderScreen()}
        </Stack>
    );
};

export default BlerpModalScreen;
