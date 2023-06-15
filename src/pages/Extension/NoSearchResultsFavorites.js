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
                    marginTop: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    paddingBottom: "32px",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "10px",
                    gap: "4px",
                    borderRadius: "8px",
                    overflow: "none",
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
                            color: "grey3.real",
                        }}
                    />
                    on the blerp page
                </Text>
            </Stack>
        </>
    );
};

export default NoSearchResultsFavorites;
