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

const ChannelPointsCollector = ({
    blerpStreamer,
    isStreaming,
    onTriggerSuccess,
    onTriggerFail,
    intervalMs = 1500000000,
}) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);

    useEffect(() => {
        let timeoutId;

        const executeMutationOnce = () => {
            if (loading || !isStreaming) {
                return;
            }

            earnSnootPoints({
                variables: {
                    channelOwnerId: blerpStreamer?._id,
                    manualEarn: false,
                },
            })
                .then(({ data }) => {
                    if (onTriggerSuccess) {
                        onTriggerSuccess();
                    }

                    const pointsIncremented =
                        data?.browserExtension?.earningSnoots
                            ?.pointsIncremented;

                    setPointsAdded(pointsIncremented);
                    timeoutId = setTimeout(() => {
                        setPointsAdded(false);
                    }, 3000);
                })
                .catch((error) => {
                    if (onTriggerFail) {
                        onTriggerFail();
                    }
                    // snackbarContext.triggerSnackbar({
                    //     message: "Failed to Collect Points",
                    //     severity: "error",
                    //     position: {
                    //         vertical: "bottom",
                    //         horizontal: "right",
                    //     },
                    // });
                });
        };

        const intervalId = setInterval(() => {
            executeMutationOnce();
        }, intervalMs);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [intervalMs, loading]);

    if (!pointsAdded) {
        return <></>;
    }

    return (
        <Stack sx={{}}>
            {pointsAdded && (
                <Text sx={{ color: "seafoam.main", fontSize: "8px" }}>
                    +{pointsAdded} points
                </Text>
            )}
        </Stack>
    );
};

export default ChannelPointsCollector;
