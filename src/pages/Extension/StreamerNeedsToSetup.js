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

import { useApollo } from "../../networking/apolloClient";
import { BITE } from "../../mainGraphQl";

import {
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";

import EllipsisLoader from "./EllipsisLoader";
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
                flexWrap: "wrap",
                flexDirection: "column",
                overflowY: "scroll",
                maxHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingBottom: "120px",
                maxWidth: "440px",
                margin: "12px auto",
                width: "100%",
            }}
        >
            <Text sx={{ textAlign: "center", maxWidth: "220px" }}>
                Navigate to a Streamer's livestream who has Blerp installed
            </Text>

            <Button
                href={`${selectedProject.host}/soundEmotes`}
                target='_blank'
                rel='noreferrer'
                variant='contained'
                sx={{ margin: "8px 12px 8px 16px" }}
            >
                Streamer Setup Here
            </Button>
        </Stack>
    );
};

export default StreamerNeedsToSetup;
