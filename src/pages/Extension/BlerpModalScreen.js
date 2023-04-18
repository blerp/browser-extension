import React, { useState, useRef, useContext, useEffect } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Modal,
    SnackbarContext,
    ChannelPointsIcon,
    Tooltip,
} from "@blerp/design";
import { useQuery, useMutation, isReference } from "@apollo/client";
import gql from "graphql-tag";

import styled, { keyframes } from "styled-components";
import EllipsisLoader from "./EllipsisLoader";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import selectedProject from "../../projectConfig";
import BlerpAudioPlayer from "./BlerpAudioPlayer";
import SegmentedSwitch from "./SegmentedSwitch";

import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { UPDATE_VIEWER_LOG } from "../../mainGraphQl";

const headshake = keyframes`
  0% {
    transform: translateX(0);
  }
  6.5% {
    transform: translateX(-6px) rotateY(-9deg);
  }
  18.5% {
    transform: translateX(5px) rotateY(7deg);
  }
  31.5% {
    transform: translateX(-3px) rotateY(-5deg);
  }
  43.5% {
    transform: translateX(2px) rotateY(3deg);
  }
  50% {
    transform: translateX(0);
  }
`;

const StyledButton = styled(Button)`
    &.headshake {
        animation: ${headshake} 1.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
`;

const SAVE_BITE = gql`
    mutation webSaveBite($biteId: MongoID!, $data: JSON) {
        browserExtension {
            saveBite(biteId: $biteId, analytics: { data: $data }) {
                _id
                bite {
                    _id
                    saved
                }
            }
        }
    }
`;

const UNSAVE_BITE = gql`
    mutation webSaveBite($biteId: MongoID!, $data: JSON) {
        browserExtension {
            unsaveBite(biteId: $biteId, analytics: { data: $data }) {
                _id
                bite {
                    _id
                    saved
                }
            }
        }
    }
`;

const PLAY_AND_TRANSFER_BEETS = gql`
    mutation soundEmotesBeetsTradeToCreator(
        $record: PlaySoundEmotesBeetsInput!
    ) {
        browserExtension {
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
        browserExtension {
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
        browserExtension {
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
    searchQuery,
    showDefaultCurrency,
}) => {
    const [localCurrencyType, setLocalCurrencyType] = useState(null); // currencyGlobalState
    const [currentContent, setCurrentContent] = useState(false);
    const [showShared, setShowShared] = useState(false);

    const [maxCooldown, setMaxCooldown] = useState(0);

    const [savingBlerp, setIsBlerpSaving] = useState(false);
    const [saveBlerp] = useMutation(SAVE_BITE);
    const [unsaveBlerp] = useMutation(UNSAVE_BITE);

    const [shake, setShake] = useState(false);
    const [showCongrats, setCongrats] = useState(false);

    const snackbarContext = useContext(SnackbarContext);

    const [updateViewerLog] = useMutation(UPDATE_VIEWER_LOG);

    const currentDate = new Date();
    const pauseUntilDate = new Date(
        blerpStreamer?.soundEmotesObject?.pauseUntilDate,
    );
    const isPaused =
        (blerpStreamer?.soundEmotesObject?.extensionPaused &&
            !blerpStreamer?.soundEmotesObject?.pauseUntilDate) ||
        (blerpStreamer?.soundEmotesObject?.pauseUntilDate &&
            currentDate < pauseUntilDate);

    const handleSave = async (bite) => {
        try {
            setIsBlerpSaving(true);
            saveBlerp({
                variables: {
                    biteId: bite?._id,
                    data: {
                        searchQuery,
                    },
                },
            })
                .then((res) => {
                    setIsBlerpSaving(false);

                    setActiveBlerp({
                        ...activeBlerp,
                        saved: res.data.browserExtension.saveBite?.bite?.saved,
                    });
                    if (res.data.browserExtension.saveBite?.bite?.saved) {
                        snackbarContext.triggerSnackbar({
                            message: "Saved!",
                            severity: "success",
                            position: {
                                vertical: "bottom",
                                horizontal: "right",
                            },
                        });
                    }
                })
                .catch((err) => {
                    setIsBlerpSaving(false);
                });
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnsave = async (bite) => {
        try {
            setIsBlerpSaving(true);

            await unsaveBlerp({
                variables: {
                    biteId: bite?._id,
                    data: {
                        searchQuery,
                    },
                },
            }).then((res) => {
                setIsBlerpSaving(false);

                setActiveBlerp({
                    ...activeBlerp,
                    saved: res.data.browserExtension.unsaveBite?.bite?.saved,
                });

                snackbarContext
                    .triggerSnackbar({
                        message: "Removed from Saved!",
                        severity: "success",
                        position: {
                            vertical: "bottom",
                            horizontal: "right",
                        },
                    })
                    .catch((err) => {
                        setIsBlerpSaving(false);
                    });
            });
        } catch (err) {
            console.log(err);
        }
    };

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
                    setShake(true);
                    setTimeout(() => setShake(false), 820);

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
                    // setActiveBlerp(null);
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

                          try {
                              const { data } = updateViewerLog({
                                  variables: {
                                      channelOwnerId: blerpStreamer?._id,
                                  },
                              });
                          } catch (err) {
                              console.log(err);
                          }

                          // setShowSuccess(true);
                      })
                      .catch((err) => {
                          setShake(true);
                          setTimeout(() => setShake(false), 820);
                          refetchAll();

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
                          //   setActiveBlerp(null);
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

                          try {
                              const { data } = updateViewerLog({
                                  variables: {
                                      channelOwnerId: blerpStreamer?._id,
                                  },
                              });
                          } catch (err) {
                              console.log(err);
                          }

                          // setShowSuccess(true);
                      })
                      .catch((err) => {
                          setShake(true);
                          setTimeout(() => setShake(false), 820);
                          refetchAll();
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
                          //   setActiveBlerp(null);
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Stack
                        sx={{
                            margin: "0",
                            width: "160px",
                            height: "160px",
                            position: "relative",
                        }}
                    >
                        {activeBlerp?.audio?.mp3?.url && (
                            <BlerpAudioPlayer
                                audioUrl={activeBlerp?.audio?.mp3?.url}
                                imageUrl={
                                    activeBlerp?.soundEmotesContext
                                        ?.imageUrlCached
                                        ? activeBlerp?.soundEmotesContext
                                              ?.imageUrlCached
                                        : activeBlerp?.image?.original?.url
                                }
                                volume={volume}
                            />
                        )}
                    </Stack>

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
                                    m: "12px 4px",
                                    border: "1px solid",
                                    borderColor: "transparent",
                                    boxSizing: "border-box",
                                    color: "white.main",
                                    maxWidth: "280px",
                                    textTransform: "none",
                                    fontSize: "12px",
                                }}
                            >
                                Login to Share
                            </Button>
                        )}
                    </Stack>
                </Stack>
            );
        }

        // Blocked or can't share
        if (!activeBlerp?.soundEmotesContext?.hasAdded) {
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
                        Oops, this sound has been removed!
                    </Text>
                </Stack>
            );
        }

        if (activeBlerp?.blockedContext?._id) {
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
                        This sound has been blocked by the streamer.
                    </Text>
                </Stack>
            );
        }

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
            if (isPaused) {
                return (
                    <Tooltip
                        title={
                            <Text
                                sx={{
                                    color: "white.override",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                }}
                            >
                                {blerpStreamer?.username} has paused Blerp on
                                stream. They can resume on Blerp.com
                            </Text>
                        }
                        placement='bottom'
                        componentsProps={{
                            popper: {
                                sx: {
                                    zIndex: 10000000,
                                },
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: "#000",
                                    color: "white",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                },
                            },
                        }}
                    >
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
                                margin: "2px",
                            }}
                        >
                            Temporarily Paused
                        </Text>
                    </Tooltip>
                );
            }

            if (!blerpStreamer?.browserOnline) {
                return (
                    <Tooltip
                        title={
                            <Text
                                sx={{
                                    color: "white.override",
                                    fontWeight: "300",
                                    fontSize: "16px",
                                }}
                            >
                                {blerpStreamer?.username} does not have their
                                Browser Source connected. They can get their URL
                                at blerp.com
                            </Text>
                        }
                        placement='bottom'
                        componentsProps={{
                            popper: {
                                sx: {
                                    zIndex: 10000000,
                                },
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: "#000",
                                    color: "white",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                },
                            },
                        }}
                    >
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
                                margin: "2px",
                            }}
                        >
                            Streamer Browser Source Offline
                        </Text>
                    </Tooltip>
                );
            }

            if (maxCooldown > 0) {
                return (
                    <Tooltip
                        title={
                            <Text
                                sx={{
                                    color: "white.override",
                                    fontWeight: "300",
                                    fontSize: "16px",
                                }}
                            >
                                This channel only allows sounds to be played
                                every{" "}
                                {blerpStreamer?.soundEmotesObject
                                    ?.channelCooldown / 1000}{" "}
                                sec and individuals to play sounds every{" "}
                                {blerpStreamer?.soundEmotesObject
                                    ?.userCooldown / 1000}{" "}
                                sec.
                            </Text>
                        }
                        placement='bottom'
                        componentsProps={{
                            popper: {
                                sx: {
                                    zIndex: 10000000,
                                },
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: "#000",
                                    color: "white",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                },
                            },
                        }}
                    >
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

                                margin: "2px",
                            }}
                        >
                            On Cooldown {maxCooldown} Sec
                        </Text>
                    </Tooltip>
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
                            margin: "2px",
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
                            margin: "2px",
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
                            margin: "2px",
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
                return <></>;
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
                        <StyledButton
                            className={shake ? "headshake" : ""}
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
                        </StyledButton>
                    );
                } else {
                    return (
                        <StyledButton
                            className={shake ? "headshake" : ""}
                            variant='contained'
                            color='whiteOverride'
                            onClick={async () => {}}
                            sx={{
                                "&[disabled]": {
                                    color: "white.main",
                                    backgroundColor: "notBlack.main",
                                    opacity: "0.5",
                                },
                                backgroundColor: "black.real",
                                boxSizing: "border-box",
                                color: "#000",
                                maxWidth: "280px",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "black.real",
                                    border: "3px solid #8c8e8f",
                                },
                                m: "4px",
                                fontWeight: 600,
                                fontSize: "16px",
                                border: "3px solid #8c8e8f",
                            }}
                        >
                            Play with Points
                        </StyledButton>
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
                    <StyledButton
                        className={shake ? "headshake" : ""}
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
                            "&:hover": {
                                backgroundColor: "ibisRed.main",
                            },
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
                    </StyledButton>
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
                    <StyledButton
                        className={shake ? "headshake" : ""}
                        variant='contained'
                        color='whiteOverride'
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
                            color: "#000",
                            boxSizing: "border-box",
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
                    </StyledButton>
                );
            } else {
                return (
                    <StyledButton
                        className={shake ? "headshake" : ""}
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
                                fontSize: "16px",
                            }}
                        >
                            {refetching ? "Loading..." : "Play on Stream!"}
                        </Text>
                    </StyledButton>
                );
            }
        };

        return (
            <Stack
                sx={{
                    padding: "32px 0",
                    position: "relative",
                    alignItems: "center",
                }}
            >
                <Stack
                    sx={{
                        margin: "0",
                        width: "160px",
                        height: "160px",
                        position: "relative",
                    }}
                >
                    <Stack
                        direction='row'
                        sx={{
                            position: "absolute",
                            top: 9,
                            left: 9,
                            display: "flex",
                            alignItems: "flex-start",
                            zIndex: 200,
                            gap: "4px",
                        }}
                    >
                        {activeBlerp?.newAudienceRating &&
                            activeBlerp?.newAudienceRating.includes("E") && (
                                <Tooltip
                                    title={
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                            }}
                                        >
                                            This sound may be Explict
                                        </Text>
                                    }
                                    placement='bottom'
                                    componentsProps={{
                                        popper: {
                                            sx: {
                                                zIndex: 10000000,
                                            },
                                        },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#000",
                                                color: "white",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            boxShadow:
                                                "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: "white.override",
                                            borderRadius: "2px",
                                            fontSize: "10px",
                                            padding: "2px",
                                            color: "black.override",
                                            fontWeight: "600",
                                        }}
                                    >
                                        E
                                    </Stack>
                                </Tooltip>
                            )}

                        {activeBlerp?.newAudienceRating &&
                            activeBlerp?.newAudienceRating.includes("SAFE") && (
                                <Tooltip
                                    title={
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                            }}
                                        >
                                            This is a safe sound
                                        </Text>
                                    }
                                    placement='bottom'
                                    componentsProps={{
                                        popper: {
                                            sx: {
                                                zIndex: 10000000,
                                            },
                                        },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#000",
                                                color: "white",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            boxShadow:
                                                "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: "white.override",
                                            borderRadius: "2px",
                                            fontSize: "10px",
                                            padding: "2px",
                                            color: "black.override",
                                            fontWeight: "600",
                                        }}
                                    >
                                        SAFE
                                    </Stack>
                                </Tooltip>
                            )}

                        {activeBlerp?.newAudienceRating &&
                            activeBlerp?.newAudienceRating.includes("A") && (
                                <Tooltip
                                    title={
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                            }}
                                        >
                                            This sound may be abrasive
                                        </Text>
                                    }
                                    placement='bottom'
                                    componentsProps={{
                                        popper: {
                                            sx: {
                                                zIndex: 10000000,
                                            },
                                        },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#000",
                                                color: "white",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            boxShadow:
                                                "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: "white.override",
                                            borderRadius: "2px",
                                            fontSize: "10px",
                                            padding: "2px",
                                            color: "black.override",
                                            fontWeight: "600",
                                        }}
                                    >
                                        A
                                    </Stack>
                                </Tooltip>
                            )}

                        {activeBlerp?.newAudienceRating &&
                            activeBlerp?.newAudienceRating.includes("DMCA") && (
                                <Tooltip
                                    title={
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                            }}
                                        >
                                            This sound may contain DMCA risk
                                        </Text>
                                    }
                                    placement='bottom'
                                    componentsProps={{
                                        popper: {
                                            sx: {
                                                zIndex: 10000000,
                                            },
                                        },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#000",
                                                color: "white",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            boxShadow:
                                                "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: "white.override",
                                            borderRadius: "2px",
                                            fontSize: "10px",
                                            padding: "2px",
                                            color: "black.override",
                                            fontWeight: "600",
                                        }}
                                    >
                                        DMCA
                                    </Stack>
                                </Tooltip>
                            )}

                        {activeBlerp?.newAudienceRating &&
                            activeBlerp?.newAudienceRating.includes("NSFW") && (
                                <Tooltip
                                    title={
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                fontSize: "16px",
                                            }}
                                        >
                                            Not safe for work
                                        </Text>
                                    }
                                    placement='bottom'
                                    componentsProps={{
                                        popper: {
                                            sx: {
                                                zIndex: 10000000,
                                            },
                                        },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#000",
                                                color: "white",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            boxShadow:
                                                "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: "white.override",
                                            borderRadius: "2px",
                                            fontSize: "10px",
                                            padding: "2px",
                                            color: "black.override",
                                            fontWeight: "600",
                                        }}
                                    >
                                        NSFW
                                    </Stack>
                                </Tooltip>
                            )}
                    </Stack>
                    {true &&
                        (savingBlerp ? (
                            <FavoriteRoundedIcon
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    color: "grey4.real",
                                    borderRadius: "8px",
                                    zIndex: 200,
                                    "&:hover": { opacity: 0.7 },
                                    visibility: "visible",

                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",

                                    filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!userSignedIn) {
                                        snackbarContext.triggerSnackbar({
                                            message: "You must be logged in!",
                                            severity: "error",
                                            position: {
                                                vertical: "bottom",
                                                horizontal: "right",
                                            },
                                        });
                                        return;
                                    }

                                    if (activeBlerp?.saved) {
                                        await handleUnsave(activeBlerp);
                                    } else {
                                        await handleSave(activeBlerp);
                                    }
                                }}
                            />
                        ) : activeBlerp?.saved ? (
                            <FavoriteRoundedIcon
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    borderRadius: "8px",
                                    zIndex: 200,
                                    opacity: savingBlerp ? 0.5 : 1,
                                    "&:hover": { opacity: 0.7 },
                                    visibility: "visible",

                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",

                                    filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!userSignedIn) {
                                        snackbarContext.triggerSnackbar({
                                            message: "You must be logged in!",
                                            severity: "error",
                                            position: {
                                                vertical: "bottom",
                                                horizontal: "right",
                                            },
                                        });
                                        return;
                                    }

                                    if (activeBlerp?.saved) {
                                        await handleUnsave(activeBlerp);
                                    } else {
                                        await handleSave(activeBlerp);
                                    }
                                }}
                            />
                        ) : (
                            <FavoriteBorderRoundedIcon
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    borderRadius: "8px",
                                    zIndex: 200,
                                    opacity: savingBlerp ? 0.5 : 1,
                                    "&:hover": { opacity: 0.7 },
                                    visibility: "visible",

                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",

                                    filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!userSignedIn) {
                                        return;
                                    }

                                    if (activeBlerp?.saved) {
                                        await handleUnsave(activeBlerp);
                                    } else {
                                        await handleSave(activeBlerp);
                                    }
                                }}
                            />
                        ))}

                    {activeBlerp?.audio?.mp3?.url && (
                        <BlerpAudioPlayer
                            audioUrl={activeBlerp?.audio?.mp3?.url}
                            imageUrl={
                                activeBlerp?.soundEmotesContext?.imageUrlCached
                                    ? activeBlerp?.soundEmotesContext
                                          ?.imageUrlCached
                                    : activeBlerp?.image?.original?.url
                            }
                            volume={volume}
                        />
                    )}
                </Stack>

                <Stack
                    sx={{
                        marginTop: "20px",
                        marginBottom: "2px",
                    }}
                >
                    {true ? (
                        <SegmentedSwitch
                            selectedOption={localCurrencyType}
                            setSelectedOption={setLocalCurrencyType}
                            selectedOptionRight='BEETS'
                            selectedOptionLeft='POINTS'
                            rightSideFullyDisabled={
                                blerpStreamer?.soundEmotesObject?.beetsDisabled
                            }
                            rightSideDisabled={
                                activeBlerp?.soundEmotesContext.beetsDisabled ||
                                blerpStreamer?.soundEmotesObject?.beetsDisabled
                            }
                            leftSideFullyDisabled={
                                blerpStreamer?.soundEmotesObject
                                    ?.channelPointsDisabled
                            }
                            leftSideDisabled={
                                activeBlerp?.soundEmotesContext
                                    .channelPointsDisabled ||
                                blerpStreamer?.soundEmotesObject
                                    ?.channelPointsDisabled
                            }
                            rightSideAmount={
                                activeBlerp?.soundEmotesContext.beetAmount
                            }
                            leftSideAmount={
                                activeBlerp?.soundEmotesContext
                                    .channelPointsAmount
                            }
                            rightIcon='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            leftIcon='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            rightSelectedIcon='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            leftSelectedIcon='https://cdn.blerp.com/design/browser-extension/cp_black.svg'
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
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "100%",
            }}
        >
            {renderScreen()}
        </Stack>
    );
};

export default BlerpModalScreen;
