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

const NoSearchResults = ({ currentStreamerBlerpUser, searchTerm }) => {
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
                        width: "148px",
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "21px",
                        lineHeight: "130%",
                        fontWeight: "light",

                        textAlign: "center",
                        letterSpacing: "0.05em",

                        color: "black.real",
                    }}
                >
                    No Results
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
                    }}
                >
                    {currentStreamerBlerpUser?.username} hasn’t added any sounds
                    that match {searchTerm}.
                </Text>
            </Stack>

            <NoSearchResultsFooter />
        </>
    );
};

export default NoSearchResults;
