import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";

import selectedProject from "../../projectConfig";

const FavoritesFooter = ({ currentStreamerBlerpUser, searchTerm }) => {
    return (
        <>
            <Stack
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    overflowY: "scroll",
                    maxHeight: "200px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    paddingBottom: "32px",
                    margin: "12px auto",

                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    gap: "4px",

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
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "130%",

                        textAlign: "center",
                        letterSpacing: "0.1em",
                        margin: "0 6px",
                        fontSize: "14px",
                        maxWidth: "180px",

                        color: "black.real",
                    }}
                >
                    Find all your favorites on Blerp.com
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
                        onClick={() => {
                            window.open(
                                `${selectedProject.host}/my-library?channelOwnerId=${currentStreamerBlerpUser._id}`,
                                "_blank",
                            );
                        }}
                    >
                        My Faves
                    </Button>
                </Stack>
            </Stack>
        </>
    );
};

export default FavoritesFooter;
