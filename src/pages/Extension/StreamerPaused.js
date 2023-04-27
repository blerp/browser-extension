import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";

const useTimeRemaining = (pauseUntilDate) => {
    const [timeRemaining, setTimeRemaining] = useState("");

    useEffect(() => {
        if (!pauseUntilDate) {
            setTimeRemaining("");
            return;
        }

        const updateRemainingTime = () => {
            const now = new Date();
            const remainingTime = pauseUntilDate - now;

            if (remainingTime <= 0) {
                setTimeRemaining("");
            } else {
                const minutes = Math.ceil(remainingTime / (1000 * 60));
                setTimeRemaining(`Will resume in ${minutes}m`);
            }
        };

        updateRemainingTime();
        const interval = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(interval);
    }, [pauseUntilDate]);

    return timeRemaining;
};

const StreamerPaused = ({ currentStreamerBlerpUser, handleClose }) => {
    const currentDate = new Date();
    const pauseUntilDate = new Date(
        currentStreamerBlerpUser?.soundEmotesObject?.pauseUntilDate,
    );
    const timeRemaining = useTimeRemaining(pauseUntilDate);

    const isPaused =
        (currentStreamerBlerpUser?.soundEmotesObject?.extensionPaused &&
            !currentStreamerBlerpUser?.soundEmotesObject?.pauseUntilDate) ||
        (currentStreamerBlerpUser?.soundEmotesObject?.pauseUntilDate &&
            currentDate < pauseUntilDate);

    // const apolloClient = useApollo();

    if (!isPaused) {
        return <></>;
    }

    return (
        <Stack
            sx={{
                display: "flex",
                flexDirection: "column",
                // overflowY: "scroll",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                margin: "12px auto",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px",
                gap: "6px",

                width: "280px",
                // height: "360px",

                backgroundColor: "grey7.real",
                borderRadius: "8px",
                position: "relative",
            }}
        >
            {/* <CloseIcon
                sx={{
                    width: "28px",
                    height: "28px",
                    cursor: "pointer",
                    color: "notBlack.main",
                    marginRight: "8px",
                    top: "8px",
                    right: "8px",
                    position: "absolute",
                }}
                onClick={handleClose}
            /> */}

            <Text
                sx={{
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "18px",
                    lineHeight: "130%",

                    textAlign: "left",
                    letterSpacing: "0.1em",

                    color: "black.real",
                    textTransform: "capitalize",
                    width: "100%",
                }}
            >
                {currentStreamerBlerpUser?.username} Has Temporarily Paused
                Blerp!{" "}
            </Text>

            {timeRemaining && (
                <Text
                    sx={{
                        fontFamily: "Odudo",
                        fontStyle: "normal",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "130%",

                        textAlign: "left",
                        letterSpacing: "0.1em",

                        color: "grey3.real",
                        width: "100%",
                    }}
                >
                    {timeRemaining}.
                </Text>
            )}

            <Text
                sx={{
                    fontFamily: "Odudo",
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",

                    textAlign: "left",
                    letterSpacing: "0.1em",

                    color: "grey4.real",
                    width: "100%",
                }}
            >
                You can still preview sounds and add them to your favorites.
            </Text>

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

export default StreamerPaused;
