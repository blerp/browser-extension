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
    BITE_WITH_SOUND_EMOTES,
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";

import AudioPlayer from "./BlerpAudioPlayer";
import EllipsisLoader from "./EllipsisLoader";
import { EXTENSION_HEIGHT_MAX, EXTENSION_WIDTH_MAX } from "../../constants";

const SAD_TROMBONE = gql`
    ${BITE_WITH_SOUND_EMOTES}
    query browserExtension($streamerId: MongoID) {
        browserExtension {
            biteElasticSearch(query: "sad trombone sad", page: 1, perPage: 1) {
                bites {
                    ...BiteSoundEmotesFragment
                }
            }
        }
    }
`;

const StreamerBlocked = ({ currentStreamerBlerpUser, refetchAll }) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);
    // const apolloClient = useApollo();

    const {
        loading: newLoading,
        data,
        error,
    } = useQuery(SAD_TROMBONE, {
        variables: {},
        fetchPolicy: "network-only",
    });

    const soundBite = data?.browserExtension?.biteElasticSearch?.bites[0];

    return (
        <Stack
            sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                width: EXTENSION_WIDTH_MAX,
                height: EXTENSION_HEIGHT_MAX,
                backgroundColor: "grey8.real",
                height: "100%",
            }}
        >
            <Stack
                sx={{
                    margin: "12px auto",
                    width: "100px",
                }}
                onClick={() => {
                    if (refetchAll) refetchAll();
                }}
            >
                {loading ? (
                    <EllipsisLoader />
                ) : (
                    soundBite?.audio?.mp3?.url && (
                        <AudioPlayer
                            audioUrl={soundBite?.audio?.mp3?.url}
                            imageUrl={soundBite?.image?.original?.url}
                        />
                    )
                )}
            </Stack>

            <Text
                sx={{
                    width: "260px",
                    fontStyle: "300",
                    fontWeight: 400,
                    fontSize: "21px",
                    lineHeight: "130%",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "black.real",
                    margin: "12px 0",
                }}
            >
                You’ve been banned from sharing sounds on this channel.
            </Text>

            <Text
                sx={{
                    width: "260px",

                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "130%",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "grey3.real",
                }}
            >
                You can still preview and share sounds from blerp.com!
            </Text>

            {/* <Text
                sx={{
                    width: "260px",

                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "130%",

                    textAlign: "center",
                    letterSpacing: "0.1em",

                    color: "grey3.real",
                }}
            >
                If you continue down this road Blerp will ban you too....
            </Text> */}

            {/* <Stack
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
            </Stack> */}
        </Stack>
    );
};

export default StreamerBlocked;
