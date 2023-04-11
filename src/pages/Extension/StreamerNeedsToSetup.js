import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";

import {
    BITE,
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";

import selectedProject from "../../projectConfig";

const StreamerNeedsToSetup = ({}) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);
    // const apolloClient = useApollo();

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
                margin: "12px auto",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                gap: "20px",

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
                Streamer has not fully setup Blerp
            </Text>

            <Text
                sx={{
                    width: "260px",

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
                Tell streamer or mod to go to the setup link below to add more
                sounds to this panel!
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
