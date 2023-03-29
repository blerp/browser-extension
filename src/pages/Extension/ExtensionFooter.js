import React, { useEffect, useState } from "react";
import { Box, Tab, Tabs, Stack, Button, Text, Tooltip } from "@blerp/design";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import CloseIcon from "@mui/icons-material/Close";

import styled from "styled-components";

import VolumeSlider from "./VolumeSlider";
import ChannelPointsCollector from "./ChannelPointsCollector";
import selectedProject from "../../projectConfig";

const CurrencyTab = styled(Box)`
    display: flex;
    align-items: center;
    border-radius: 8px;
    padding: 0.2rem 0.4rem;
`;

const CurrencyIcon = styled("img")`
    width: 24px;
    height: 24px;
    margin-right: 0.5rem;
`;
const ImageStyle = styled("img")`
    &:hover {
        opacity: 0.7;
    }
`;

const ExtensionFooter = ({
    setTabState,
    tabState,
    setCurrencyGlobal,
    currencyGlobalState,
    userSignedIn,
    currentStreamerBlerpUser,
    activeBlerp,
    volume,
    setVolume,
    isStreaming,
    refetchAll,
}) => {
    const [openBeets, setOpenBeets] = useState(true);
    const handleIconClick = (state) => {
        if (tabState === state) {
            setTabState("HOME");
        } else {
            setTabState(state);
        }
    };

    const handleCurrencyChange = (event, newValue) => {
        setCurrencyGlobal(newValue);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpenBeets(true);
        }, 5000); // Show tooltip after 5 seconds

        // Cleanup function to clear the timer when the component is unmounted
        return () => {
            clearTimeout(timer);
        };
    }, []);

    const handleClose = () => {
        setOpenBeets(false);
    };

    useEffect(() => {
        if (currentStreamerBlerpUser?.soundEmotesObject) {
            if (
                currentStreamerBlerpUser?.soundEmotesObject?.beetsDisabled &&
                currentStreamerBlerpUser?.soundEmotesObject
                    ?.channelPointsDisabled
            ) {
                setCurrencyGlobal("");
                return;
            }

            if (
                currentStreamerBlerpUser?.soundEmotesObject?.beetsDisabled &&
                currencyGlobalState === "BEETS"
            ) {
                setCurrencyGlobal("POINTS");
            }

            if (
                currentStreamerBlerpUser?.soundEmotesObject
                    ?.channelPointsDisabled &&
                currencyGlobalState === "POINTS"
            ) {
                setCurrencyGlobal("BEETS");
            }
        }
    }, [
        currentStreamerBlerpUser?.soundEmotesObject?.beetsDisabled,
        currentStreamerBlerpUser?.soundEmotesObject?.channelPointsDisabled,
    ]);

    const leftSideMessage = currentStreamerBlerpUser?.soundEmotesObject
        ?.channelPointsDisabled
        ? "The creator has points disabled, points cannot be used on any sounds."
        : "Collect points when streamer is live";

    const rightSideMessage = currentStreamerBlerpUser?.soundEmotesObject
        ?.beetsDisabled
        ? "The creator has beets disabled, beets cannot be used on any sounds."
        : "Buy Beets to play sounds and support the creator";

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                position: "sticky",
                backgroundColor: "grey7.real",
                width: "100%",
                minHeight: "40px",
                padding: "2px 0",
                background: "rgba(71, 77, 79, 0.3)",
                boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(10px)",
                bottom: "0px",
                zIndex: 5001,
            }}
        >
            {!userSignedIn ? (
                <Button
                    variant='contained'
                    href={`${
                        selectedProject.host
                    }/login?returnTo=${`/soundboard-browser-extension`}`}
                    target='_blank'
                    rel='noreferrer'
                    color='notBlack'
                    sx={{
                        padding: "4px 2px",
                    }}
                    onClick={async () => {
                        setTimeout(() => {
                            refetchAll();
                        }, 5000);
                    }}
                >
                    <Text
                        sx={{
                            color: "#000000",
                            fontSize: "14px",
                            fontWeight: "600",
                        }}
                    >
                        Log in
                    </Text>
                </Button>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    {userSignedIn?.profileImage ? (
                        <ImageStyle
                            style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "100px",
                                cursor: "pointer",
                                boxShadow:
                                    tabState !== "PROFILE"
                                        ? "0px 4px 0px -1px rgba(0,0,0,0)"
                                        : "0px 4px 0px -1px rgba(0,0,0,1)",
                            }}
                            src={
                                userSignedIn.profileImage &&
                                userSignedIn.profileImage.original &&
                                userSignedIn.profileImage.original.url
                            }
                            onClick={() => handleIconClick("PROFILE")}
                        />
                    ) : (
                        <Stack
                            sx={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "100px",
                                backgroundColor: "grey4.real",
                                cursor: "pointer",
                                boxShadow:
                                    tabState !== "PROFILE"
                                        ? "0px 4px 0px -1px rgba(0,0,0,0)"
                                        : "0px 4px 0px -1px rgba(0,0,0,1)",
                                "&:hover": {
                                    opacity: 0.7,
                                },
                            }}
                            onClick={() => handleIconClick("PROFILE")}
                        />
                    )}
                    {activeBlerp?._id ? (
                        <Stack sx={{ margin: "0 8px" }}>
                            <VolumeSlider
                                volume={volume}
                                setVolume={setVolume}
                                filledColor='white'
                                backgroundColor='rgba(255, 255, 255, 0.3)'
                            />
                        </Stack>
                    ) : tabState === "FAVES" ? (
                        <FavoriteRoundedIcon
                            sx={{
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                margin: "0 8px",
                                "&:hover": {
                                    opacity: 0.7,
                                },
                            }}
                            onClick={() => handleIconClick("FAVES")}
                        />
                    ) : (
                        <FavoriteBorderRoundedIcon
                            sx={{
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                margin: "0 8px",
                                "&:hover": {
                                    opacity: 0.7,
                                },
                            }}
                            onClick={() => handleIconClick("FAVES")}
                        />
                    )}
                </Box>
            )}

            {activeBlerp?._id || tabState === "PROFILE" ? (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{
                        padding: "4px 4px",
                        backgroundColor: "transparent",
                        borderRadius: "8px",
                    }}
                >
                    <Tooltip
                        title={
                            leftSideMessage ? (
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "300",
                                        fontSize: "16px",
                                    }}
                                >
                                    {leftSideMessage}
                                </Text>
                            ) : (
                                ""
                            )
                        }
                        placement='top'
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
                                },
                            },
                        }}
                    >
                        <CurrencyTab
                            sx={{
                                color: "#fff",
                                opacity: 1,
                            }}
                        >
                            <CurrencyIcon
                                style={{
                                    color: "#fff",
                                    opacity: 1,
                                }}
                                src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            />
                            {currentStreamerBlerpUser?.soundEmotesObject
                                ?.channelPointsDisabled
                                ? "N/A"
                                : (currentStreamerBlerpUser &&
                                      currentStreamerBlerpUser.loggedInChannelPointBasket &&
                                      currentStreamerBlerpUser
                                          .loggedInChannelPointBasket.points) ||
                                  0}
                        </CurrencyTab>
                    </Tooltip>

                    <Tooltip
                        title={
                            rightSideMessage ? (
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "300",
                                        fontSize: "16px",
                                    }}
                                >
                                    {rightSideMessage}
                                </Text>
                            ) : (
                                ""
                            )
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
                        <CurrencyTab
                            sx={{
                                opacity: 1,
                                color: "#fff",
                            }}
                        >
                            <CurrencyIcon
                                style={{
                                    color: "#fff",
                                    opacity: 1,
                                }}
                                src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            />
                            {currentStreamerBlerpUser?.soundEmotesObject
                                ?.beetsDisabled
                                ? "N/A"
                                : (userSignedIn &&
                                      userSignedIn.userWallet &&
                                      userSignedIn.userWallet.beetBalance) ||
                                  0}{" "}
                        </CurrencyTab>
                    </Tooltip>
                </Stack>
            ) : (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{
                        padding: "4px 4px",
                        backgroundColor: "rgba(103, 111, 112, 0.6);",
                        borderRadius: "8px",
                    }}
                >
                    <Tooltip
                        title={
                            leftSideMessage ? (
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "300",
                                        fontSize: "16px",
                                    }}
                                >
                                    {leftSideMessage}
                                </Text>
                            ) : (
                                ""
                            )
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
                        <CurrencyTab
                            onClick={(e) => {
                                if (
                                    currentStreamerBlerpUser?.soundEmotesObject
                                        ?.channelPointsDisabled
                                ) {
                                    return;
                                }
                                handleCurrencyChange(e, "POINTS");
                            }}
                            selected={currencyGlobalState === "POINTS"}
                            sx={{
                                boxShadow:
                                    currencyGlobalState === "POINTS"
                                        ? "0px 4px 4px rgba(0, 0, 0, 0.25)"
                                        : "none",
                                backgroundColor:
                                    currencyGlobalState === "POINTS"
                                        ? "#474D4F"
                                        : "transparent",

                                color:
                                    currencyGlobalState === "POINTS"
                                        ? "#fff"
                                        : "grey3.real",
                                opacity: currentStreamerBlerpUser
                                    ?.soundEmotesObject?.channelPointsDisabled
                                    ? 0.5
                                    : currencyGlobalState === "POINTS"
                                    ? 1
                                    : 0.8,

                                "&:hover": {
                                    backgroundColor:
                                        currencyGlobalState === "POINTS"
                                            ? "#474D4F"
                                            : "trans",
                                },
                                cursor: "pointer",
                            }}
                        >
                            <CurrencyIcon
                                style={{
                                    color:
                                        currencyGlobalState === "POINTS"
                                            ? "#fff"
                                            : "grey3.real",
                                    opacity: currentStreamerBlerpUser
                                        ?.soundEmotesObject
                                        ?.channelPointsDisabled
                                        ? 0.5
                                        : currencyGlobalState === "POINTS"
                                        ? 1
                                        : 0.8,
                                }}
                                src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            />
                            {currentStreamerBlerpUser?.soundEmotesObject
                                ?.channelPointsDisabled
                                ? "N/A"
                                : (currentStreamerBlerpUser &&
                                      currentStreamerBlerpUser.loggedInChannelPointBasket &&
                                      currentStreamerBlerpUser
                                          .loggedInChannelPointBasket.points) ||
                                  0}
                        </CurrencyTab>
                    </Tooltip>

                    {!currentStreamerBlerpUser?.soundEmotesObject
                        ?.channelPointsDisabled && (
                        <ChannelPointsCollector
                            blerpStreamer={currentStreamerBlerpUser}
                            onTriggerSuccess={() => {}}
                            onTriggerFail={() => {}}
                            isStreaming={isStreaming}
                            intervalMs={
                                currentStreamerBlerpUser
                                    ?.loggedInChannelPointBasket?.standardMS
                            }
                        />
                    )}

                    <Tooltip
                        arrow={true}
                        title={
                            rightSideMessage ? (
                                <Stack
                                    direction='column'
                                    sx={{
                                        justifyContent: "center",
                                        alignItems: "center",

                                        padding: "10px",
                                        gap: "20px",

                                        width: "138px",
                                        height: "207.04px",

                                        backgroundColor: "grey6.real",
                                        backdropFilter: "blur(10px)",

                                        position: "relative",
                                    }}
                                >
                                    {/* <CloseIcon
                                        sx={{
                                            position: "absolute",
                                            width: "24px",
                                            height: "24px",
                                            cursor: "pointer",
                                            color: "whiteOverride.main",
                                            top: "8px",
                                            right: "8px",
                                        }}
                                        onClick={handleClose}
                                    /> */}

                                    <img
                                        style={{ width: "110px" }}
                                        src='https://cdn.blerp.com/design/twitch/blerpy_m.svg'
                                    />

                                    <Stack>
                                        <Text
                                            sx={{
                                                color: "white.override",
                                                fontWeight: "600",
                                                textAlign: "center",
                                                fontSize: "16px",
                                                lineHeight: "130%",
                                                letterSpacing: "0.1em",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            Time for More Beets
                                        </Text>

                                        <Button
                                            variant='contained'
                                            href={`${selectedProject.host}/tradeBeets`}
                                            target='_blank'
                                            rel='noreferrer'
                                            color='notBlack'
                                            sx={{
                                                padding: "4px 2px",
                                            }}
                                        >
                                            <Text
                                                sx={{
                                                    color: "#000000",
                                                    fontSize: "14px",
                                                    fontWeight: "600",
                                                    letterSpacing: "0.1em",
                                                }}
                                            >
                                                Add Beets
                                            </Text>
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                ""
                            )
                        }
                        placement='top'
                        componentsProps={{
                            popper: {
                                sx: {
                                    zIndex: 10000000,
                                },
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: "grey6.real",
                                    color: "white",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                },
                            },
                        }}
                        interactive
                    >
                        <CurrencyTab
                            onClick={(e) => {
                                if (
                                    currentStreamerBlerpUser?.soundEmotesObject
                                        ?.beetsDisabled
                                ) {
                                    return;
                                }

                                handleCurrencyChange(e, "BEETS");
                            }}
                            selected={currencyGlobalState === "BEETS"}
                            sx={{
                                boxShadow:
                                    currencyGlobalState === "BEETS"
                                        ? "0px 4px 4px rgba(0, 0, 0, 0.25)"
                                        : "none",
                                backgroundColor:
                                    currencyGlobalState === "BEETS"
                                        ? "#B43757"
                                        : "trans",
                                color:
                                    currencyGlobalState === "BEETS"
                                        ? "#fff"
                                        : "grey3.real",
                                "&:hover": {
                                    backgroundColor:
                                        currencyGlobalState === "BEETS"
                                            ? "#B43757"
                                            : "trans",
                                },
                                opacity: currentStreamerBlerpUser
                                    ?.soundEmotesObject?.beetsDisabled
                                    ? 0.5
                                    : currencyGlobalState === "BEETS"
                                    ? 1
                                    : 0.8,
                                cursor: "pointer",
                            }}
                        >
                            <CurrencyIcon
                                style={{
                                    color:
                                        currencyGlobalState === "BEETS"
                                            ? "#fff"
                                            : "grey3.real",
                                    opacity: currentStreamerBlerpUser
                                        ?.soundEmotesObject?.beetsDisabled
                                        ? 0.5
                                        : currencyGlobalState === "BEETS"
                                        ? 1
                                        : 0.8,
                                }}
                                src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            />
                            {currentStreamerBlerpUser?.soundEmotesObject
                                ?.beetsDisabled
                                ? "N/A"
                                : (userSignedIn &&
                                      userSignedIn.userWallet &&
                                      userSignedIn.userWallet.beetBalance) ||
                                  0}{" "}
                        </CurrencyTab>
                    </Tooltip>
                </Stack>
            )}
        </Box>
    );
};

export default ExtensionFooter;