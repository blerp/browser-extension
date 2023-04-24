import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";

import selectedProject from "../../projectConfig";

const NoSearchResultsFooter = ({ channelOwner }) => {
    return (
        <Stack
            sx={{
                display: "flex",
                flexDirection: "column",
                overflowY: "scroll",
                maxHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingBottom: "32px",
                margin: "0px auto 12px",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                gap: "4px",

                width: "280px",
                height: "170px",

                backgroundColor: "grey7.real",
                borderRadius: "8px",

                /* Inside auto layout */

                flex: "none",
                order: 1,
                alignSelf: "stretch",
                flexGrow: 0,
            }}
        >
            <Text
                sx={{
                    width: "260px",
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "18px",
                    lineHeight: "130%",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "black.real",
                }}
            >
                Can’t Find What You’re Looking For?
            </Text>

            <Text
                sx={{
                    maxWidth: "200px",
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "grey3.real",
                    margin: "4px 0 12px",
                }}
            >
                Go to blerp.com to find the sound you’re looking for
            </Text>

            <Stack
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "20px",
                    height: "36px",
                }}
            >
                <Button
                    variant='contained'
                    color='whiteOverride'
                    sx={{
                        whiteSpace: "nowrap",
                        color: "#000000",
                        fontSize: "14px",
                    }}
                    rel='noreferrer'
                    onClick={() => {
                        window.open(
                            `${selectedProject.host}/discover/top-blerps?pageType=SUGGESTIONS&channelOwnerId=${channelOwner?._id}`,
                            "_blank",
                        );
                    }}
                >
                    Suggest
                </Button>

                <Button
                    variant='outlined'
                    color='whiteOverride'
                    sx={{
                        whiteSpace: "nowrap",
                        borderColor: "whiteOverride.main",
                        fontSize: "14px",
                    }}
                    rel='noreferrer'
                    onClick={() => {
                        window.open(
                            `${selectedProject.host}/discover/trending-blerps?pageType=EXTENSION&channelOwnerId=${channelOwner?._id}`,
                            "_blank",
                        );
                    }}
                >
                    Discover
                </Button>
            </Stack>
        </Stack>
    );
};

export default NoSearchResultsFooter;
