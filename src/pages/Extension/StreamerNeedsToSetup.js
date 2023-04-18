import React, { useState, useRef, useEffect, useContext } from "react";
import { Stack, Button, Text } from "@blerp/design";
import selectedProject from "../../projectConfig";

const StreamerNeedsToSetup = ({}) => {
    return (
        <Stack
            sx={{
                display: "flex",
                flexDirection: "column",
                maxHeight: "200px",
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
                Streamer has not added Sounds
            </Text>

            <Text
                sx={{
                    width: "260px",

                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "16px",
                    margin: "8px 0 12px",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "grey3.real",
                }}
            >
                Tell streamer or mod to go to their dashboard and add sounds to
                this panel!
            </Text>

            <Stack
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: "0px",
                    gap: "4px",
                    height: "36px",
                }}
            >
                <Button
                    variant='contained'
                    color='whiteOverride'
                    sx={{
                        whiteSpace: "nowrap",
                        color: "#000000",
                        margin: "0 4px",
                        fontSize: "14px",
                    }}
                    href={`${selectedProject.host}/soundEmotes`}
                    target='_blank'
                    rel='noreferrer'
                >
                    Streamer Setup
                </Button>

                <Button
                    variant='outlined'
                    color='whiteOverride'
                    sx={{
                        whiteSpace: "nowrap",
                        borderColor: "whiteOverride.main",
                        fontSize: "14px",
                    }}
                    onClick={() => window.location.reload()}
                >
                    Reload
                </Button>
            </Stack>
        </Stack>
    );
};

export default StreamerNeedsToSetup;
