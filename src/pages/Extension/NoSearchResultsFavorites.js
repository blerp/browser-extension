import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";

import selectedProject from "../../projectConfig";
import NoSearchResultsFooter from "./NoSearchResultsFooter";

import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

const NoSearchResultsFavorites = ({ currentStreamerBlerpUser, searchTerm }) => {
    return (
        <>
            <Stack
                sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    paddingBottom: "32px",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                    gap: "4px",
                    width: "280px",
                    borderRadius: "8px",
                }}
            >
                <Text
                    sx={{
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "18px",
                        lineHeight: "130%",
                        fontWeight: "light",

                        textAlign: "center",
                        letterSpacing: "0.05em",
                        padding: "8px 0",

                        color: "black.real",
                    }}
                >
                    You haven’t favorited any of{" "}
                    {currentStreamerBlerpUser?.username} content yet.
                </Text>

                <Text
                    sx={{
                        width: "280px",
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "130%",

                        textAlign: "center",
                        letterSpacing: "0.1em",

                        color: "grey3.real",
                        textTransform: "capitalize",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    Click the{" "}
                    <FavoriteRoundedIcon
                        sx={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            margin: "0 4px",
                            color: "grey4.main",
                        }}
                    />
                    on the blerp page
                </Text>
            </Stack>

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

                        color: "black.real",
                    }}
                >
                    Find all your favorites on Blerp.com
                </Text>

                {/* <Text
                    sx={{
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",

                        textAlign: "center",
                        letterSpacing: "0.1em",

                        color: "grey3.real",
                    }}
                >
                    Go to blerp.com to find the sound you’re looking for
                </Text> */}

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
                        }}
                        href={`${selectedProject.host}/my-library`}
                        target='_blank'
                        rel='noreferrer'
                    >
                        My Faves
                    </Button>
                </Stack>
            </Stack>
        </>
    );
};

export default NoSearchResultsFavorites;
