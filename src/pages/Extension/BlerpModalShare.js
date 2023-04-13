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

const ModalContainer = styled.div`
    box-sizing: border-box;
    * {
        box-sizing: border-box;
    }
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    max-width: fit-content;
    padding: 30px 40px;
    margin: auto;
    border-radius: 12px;

    @media (max-width: 800px) {
        justify-content: start;
        max-height: 90%;
        padding: 12px;
        margin: 0 auto;
        overflow: scroll;
        width: 80%;

        .plansContainer {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 600px) {
        width: 90%;

        .subscriptionProsContainer {
            flex-direction: column;
            width: 100%;
        }

        .subscriptionProsItem {
            width: 100%;
        }
    }
`;

const BlerpModalShare = ({
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
}) => {
    const { loading, data, error } = useQuery(GET_RANDOM_BITE, {
        variables: {},
    });

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
        <Modal
            style={{ zIndex: 100001 }}
            sx={{
                backdropFilter: "blur(8px)",
            }}
            open={isOpen}
            onClose={() => {
                setActiveBlerp(null);
            }}
            aria-labelledby='subscription-gifting-modal'
            aria-describedby='subscription-gifting-modal'
        >
            <ModalContainer>
                {!userSignedIn || !blerpStreamer ? (
                    <Stack
                        sx={{
                            backgroundColor: "grey7.real",
                            padding: "32px",
                            borderRadius: "12px",
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
                            <CloseIcon
                                sx={{
                                    position: "absolute",
                                    top: "24px",
                                    right: "24px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setActiveBlerp(null);
                                }}
                            />

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
                            backgroundColor: "grey7.real",
                            padding: "32px",
                            borderRadius: "12px",
                            position: "relative",
                            alignItems: "center",
                        }}
                    >
                        <CloseIcon
                            sx={{
                                position: "absolute",
                                top: "24px",
                                right: "24px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setActiveBlerp(null);
                            }}
                        />

                        <Text sx={{ color: "black", paddingBottom: "4px" }}>
                            Share {activeBlerp?.title} Blerp?
                        </Text>

                        <Stack
                            sx={{
                                margin: "12px",
                                width: "200px",
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
                                <Text sx={{ color: "white" }}>
                                    Sharing Blerp!
                                </Text>
                            </Button>
                        ) : blerpStreamer?.browserOnline ? (
                            <>
                                {(activeBlerp?.soundEmotesContext?.playType ===
                                    "ALL" ||
                                    activeBlerp?.soundEmotesContext
                                        ?.playType === "BEETS") &&
                                beetBasket?.beetBalance <
                                    activeBlerp?.soundEmotesContext
                                        ?.beetAmount ? (
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
                                                backgroundColor:
                                                    "notBlack.main",
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
                                                backgroundColor:
                                                    "notBlack.main",
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
                                    activeBlerp?.soundEmotesContext
                                        ?.playType === "POINTS") &&
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
                                                backgroundColor:
                                                    "notBlack.main",
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
                                                backgroundColor:
                                                    "notBlack.main",
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

                        {!showShared && (
                            <Button
                                onClick={async () => {
                                    setActiveBlerp(null);
                                }}
                                sx={{}}
                            >
                                Cancel
                            </Button>
                        )}
                    </Stack>
                )}
            </ModalContainer>
        </Modal>
    );
};

export default BlerpModalShare;
