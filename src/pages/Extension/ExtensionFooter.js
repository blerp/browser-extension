import React, { useState } from "react";
import { Box, Tab, Tabs, Stack } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import styled from "styled-components";

const CurrencyTab = styled(Box)`
    display: flex;
    align-items: center;
    border-radius: 8px;
    padding: 0.2rem 0.4rem;
    cursor: pointer;
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
}) => {
    const points = 100;
    const beets = 50;

    const handleIconClick = (state) => {
        setTabState(state);

        // if (tabState === state) {
        //     setTabState("HOME");
        // } else {
        //     setTabState(state);
        // }
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
                position: "absolute",
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
                            width: "28px",
                            height: "28px",
                            borderRadius: "100px",
                            cursor: "pointer",
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
                            width: "28px",
                            height: "28px",
                            borderRadius: "100px",
                            backgroundColor: "grey4.real",
                            cursor: "pointer",
                            "&:hover": {
                                opacity: 0.7,
                            },
                        }}
                        onClick={() => handleIconClick("PROFILE")}
                    />
                )}
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
            </Box>

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
                                ? "#B43757"
                                : "transparent",

                        color:
                            currencyGlobalState === "POINTS"
                                ? "#fff"
                                : "grey3.real",
                        opacity: currencyGlobalState === "POINTS" ? 1 : 0.8,

                        "&:hover": {
                            backgroundColor:
                                currencyGlobalState === "POINTS"
                                    ? "#B43757"
                                    : "trans",
                        },
                    }}
                >
                    <CurrencyIcon
                        style={{
                            color:
                                currencyGlobalState === "POINTS"
                                    ? "#fff"
                                    : "grey3.real",
                            opacity: currencyGlobalState === "POINTS" ? 1 : 0.8,
                        }}
                        src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                    />
                    {points}
                </CurrencyTab>

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
                    }}
                >
                    <CurrencyIcon
                        style={{
                            color:
                                currencyGlobalState === "BEETS"
                                    ? "#fff"
                                    : "grey3.real",
                            opacity: currencyGlobalState === "BEETS" ? 1 : 0.8,
                        }}
                        src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                    />
                    {beets}
                </CurrencyTab>
            </Stack>
        </Box>
    );
};

export default ExtensionFooter;
