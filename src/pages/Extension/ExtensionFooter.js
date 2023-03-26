import React, { useState } from "react";
import { Box, Tab, Tabs, Stack } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

import styled from "styled-components";

import VolumeSlider from "./VolumeSlider";
import ChannelPointsCollector from "./ChannelPointsCollector";

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
}) => {
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
                zIndex: 5,
            }}
        >
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
                        {(currentStreamerBlerpUser &&
                            currentStreamerBlerpUser.loggedInChannelPointBasket &&
                            currentStreamerBlerpUser.loggedInChannelPointBasket
                                .points) ||
                            0}
                    </CurrencyTab>

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
                        {(userSignedIn &&
                            userSignedIn.userWallet &&
                            userSignedIn.userWallet.beetBalance) ||
                            0}{" "}
                    </CurrencyTab>
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
                    <CurrencyTab
                        onClick={(e) => handleCurrencyChange(e, "POINTS")}
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
                            opacity: currencyGlobalState === "POINTS" ? 1 : 0.8,

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
                                opacity:
                                    currencyGlobalState === "POINTS" ? 1 : 0.8,
                            }}
                            src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                        />
                        {(currentStreamerBlerpUser &&
                            currentStreamerBlerpUser.loggedInChannelPointBasket &&
                            currentStreamerBlerpUser.loggedInChannelPointBasket
                                .points) ||
                            0}
                    </CurrencyTab>

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

                    <CurrencyTab
                        onClick={(e) => handleCurrencyChange(e, "BEETS")}
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
                            opacity: currencyGlobalState === "BEETS" ? 1 : 0.8,
                            cursor: "pointer",
                        }}
                    >
                        <CurrencyIcon
                            style={{
                                color:
                                    currencyGlobalState === "BEETS"
                                        ? "#fff"
                                        : "grey3.real",
                                opacity:
                                    currencyGlobalState === "BEETS" ? 1 : 0.8,
                            }}
                            src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                        />
                        {(userSignedIn &&
                            userSignedIn.userWallet &&
                            userSignedIn.userWallet.beetBalance) ||
                            0}{" "}
                    </CurrencyTab>
                </Stack>
            )}
        </Box>
    );
};

export default ExtensionFooter;
