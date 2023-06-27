import React, { useState, useRef, useContext, useEffect } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Popover,
    Tabs,
    Tab,
    ChannelPointsIcon,
    CogIcon,
    SnackbarContext,
    Tooltip,
    Drawer,
    Menu,
    MenuItem,
    DiscordIcon,
} from "@blerp/design";

import selectedProject from "../../projectConfig";

const KickModPlaceholder = ({ handlePlayPause, themeMode }) => {
    return (
        <>
            <Stack
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "200px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    paddingBottom: "32px",
                    margin: "24px auto",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                    width: "280px",
                    height: "180px",

                    backgroundColor: "grey7.real",
                    borderRadius: "8px",

                    /* Inside auto layout */

                    flex: "none",
                    order: 1,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    margin: "24px",
                }}
            >
                <Text
                    sx={{
                        width: "260px",
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "130%",

                        textAlign: "center",
                        letterSpacing: "0.1em",
                        color: "black.real",
                        marginBottom: "12px",
                    }}
                >
                    Watch your stream from the Kick Viewer page to share sounds
                </Text>

                <Text
                    sx={{
                        width: "260px",
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 300,
                        fontSize: "12px",
                        lineHeight: "140%",

                        textAlign: "center",
                        letterSpacing: "0.1em",
                        color: "black.real",
                    }}
                >
                    Tell your viewers to go look underneath chat on your Kick
                    page and find this white Blerpy button to share sounds{" "}
                    <Button
                        onClick={() => {
                            handlePlayPause();
                        }}
                        target='_blank'
                        rel='noreferrer'
                        variant='custom'
                        sx={{
                            margin: "0 2px",
                            padding: "2px 4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            width: "30px",
                            height: "30px",
                            fontSize: "18px",
                            borderRadius: "4px",
                            minWidth: "0px",
                            display: "inline-flex",

                            backgroundColor:
                                themeMode === "light" ? "#E2E2E6" : "#35353B",

                            "&:hover": {
                                backgroundColor: "grey4.real",
                            },
                        }}
                    >
                        <BlerpyIcon
                            sx={{
                                width: "21px",
                                fontSize: "24px",
                                color: false
                                    ? "ibisRed.main"
                                    : themeMode === "light"
                                    ? "#000"
                                    : "#fff",
                            }}
                        />
                    </Button>
                </Text>
            </Stack>
            <Stack
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    // height: "80px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    paddingBottom: "32px",
                    margin: "0 auto",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                    width: "280px",

                    // backgroundColor: "grey7.real",
                    borderRadius: "8px",

                    /* Inside auto layout */

                    flex: "none",
                    order: 1,
                    alignSelf: "stretch",
                    flexGrow: 0,
                }}
            >
                <img
                    src='https://cdn.blerp.com/design/emotes/celebration2x.png'
                    style={{ width: "80px", height: "80px" }}
                />

                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        padding: "0px",
                        margin: "24px 0",
                    }}
                >
                    <Button
                        variant='outlined'
                        color='whiteOverride'
                        sx={{
                            whiteSpace: "nowrap",
                            // color: "#000000",
                            fontSize: "14px",
                        }}
                        href={`${selectedProject.host}/soundboard-browser-extension?referralId=univeralp`}
                        target='_blank'
                        rel='noreferrer'
                    >
                        Share Extension?
                    </Button>
                    <div style={{ margin: "4px" }} />

                    <Button
                        // variant='outlined'
                        color='whiteOverride'
                        startIcon={<DiscordIcon sx={{ color: "black.real" }} />}
                        sx={{
                            whiteSpace: "nowrap",
                            borderColor: "whiteOverride.main",
                            fontSize: "14px",
                        }}
                        onClick={() =>
                            window.open(
                                "https://discord.gg/7RdRZ29RHr",
                                "_blank",
                            )
                        }
                    >
                        Help
                    </Button>
                </Stack>
            </Stack>
        </>
    );
};

export default KickModPlaceholder;
