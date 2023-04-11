import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
    Tooltip,
} from "@blerp/design";
import { useQuery, useMutation } from "@apollo/client";

import { useApollo } from "../../networking/apolloClient";
import { EARN_SNOOT_POINTS } from "../../mainGraphQl";
import selectedProject from "../../projectConfig";

const ExtensionDisabled = ({ currentStreamerBlerpUser }) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const apolloClient = useApollo();

    return (
        <Stack
            sx={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "space-around",
                m: "auto",
            }}
        >
            <Stack
                sx={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-around",
                    m: "auto",
                    paddingBottom: "16px",
                }}
            >
                <img
                    src='https://cdn.blerp.com/design/browser-extension/blerp_logo_transp.svg'
                    style={{ maxWidth: "200px", padding: "16px" }}
                />
                <Text
                    sx={{
                        color: "white",
                        fontSize: "18px",
                        alignItems: "center",
                        maxWidth: "96%",
                        textAlign: "center",

                        margin: "8px 12px 8px 16px",
                    }}
                >
                    This creator doesn’t have Blerp enabled, tell them to add it
                    to their stream.
                </Text>

                {/* 
                <Button
                    variant='contained'
                    href={`${
                        selectedProject.host
                    }/login?returnTo=${`/soundboard-browser-extension`}`}
                    target='_blank'
                    rel='noreferrer'
                    color='notBlack'
                    sx={{
                        margin: "8px 12px 8px 16px",
                    }}
                >
                    <Text
                        sx={{
                            color: "#000000",
                            fontSize: "18px",
                            fontWeight: "600",
                        }}
                    >
                        Login
                    </Text>
                </Button> */}
            </Stack>
        </Stack>
    );
};

export default ExtensionDisabled;
