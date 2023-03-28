import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Box,
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
    Tooltip,
    ChannelPointsIcon,
} from "@blerp/design";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";

import { useApollo } from "../../networking/apolloClient";
import {
    BITE,
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";

import EllipsisLoader from "./EllipsisLoader";
import selectedProject from "../../projectConfig";
import { removeAndLogoutOfCacheJwt } from "../../globalCache";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import HelpRounded from "@mui/icons-material/HelpRounded";

const UserChannelPointsBasket = ({
    userSignedIn,
    refetchAll,
    currentStreamerBlerpUser,
}) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const apolloClient = useApollo();

    return (
        <Stack
            sx={{
                width: "280px",
                height: "104px",
                alignItems: "center",
                justifyContent: "space-around",
                mt: "12px",
                backgroundColor: "grey7.real",
                borderRadius: "12px",
            }}
        >
            <Box
                direction='column'
                sx={{
                    width: "100%",
                }}
            >
                <Stack
                    direction='row'
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Text
                        sx={{
                            color: "white.override",
                            fontWeight: "light",
                            padding: "0 12px",
                            textTransform: "capitalize",
                        }}
                    >
                        {currentStreamerBlerpUser?.soundEmotesObject
                            ?.channelPointsImageCached && (
                            <img
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    marginRight: "10px",
                                    borderRadius: "100px",
                                }}
                                src={
                                    currentStreamerBlerpUser?.soundEmotesObject
                                        ?.channelPointsImageCached
                                }
                            />
                        )}

                        {currentStreamerBlerpUser?.soundEmotesObject
                            ?.channelPointsTitle ||
                        currentStreamerBlerpUser?.username
                            ? `${currentStreamerBlerpUser?.username} Currency`
                            : "Channel Currency"}
                    </Text>

                    <Tooltip
                        componentsProps={{
                            popper: {
                                sx: {
                                    zIndex: 10000000,
                                },
                            },
                            tooltip: {
                                sx: {
                                    backgroundColor: "#000",
                                    color: "white",
                                    borderRadius: "4px",
                                    fontSize: "16px",
                                },
                            },
                        }}
                        title={
                            <>
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "light",
                                    }}
                                >
                                    Earn rewards by watching, subscribing and
                                    more.
                                </Text>
                            </>
                        }
                    >
                        <Button color='grey3' sx={{ zIndex: 100000 }}>
                            <HelpRounded sx={{ fontSize: "1.2rem" }} />
                        </Button>
                    </Tooltip>
                </Stack>

                <Stack
                    direction='row'
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Stack
                        direction='row'
                        sx={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            style={{}}
                        />

                        <Text
                            sx={{
                                color: "white.override",
                                fontWeight: "600",
                                fontSize: "18px",
                                maxWidth: "100px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                padding: "0 4px",
                            }}
                        >
                            {(currentStreamerBlerpUser &&
                                currentStreamerBlerpUser.loggedInChannelPointBasket &&
                                currentStreamerBlerpUser
                                    .loggedInChannelPointBasket.points) ||
                                0}
                        </Text>
                    </Stack>

                    {typeof pointsAdded === "number" ? (
                        <Text
                            sx={{
                                color: "seafoam.main",
                                fontSize: "18px",
                            }}
                        >
                            +{pointsAdded} points
                        </Text>
                    ) : currentStreamerBlerpUser &&
                      (!currentStreamerBlerpUser.loggedInChannelPointBasket ||
                          currentStreamerBlerpUser.loggedInChannelPointBasket
                              ?.showManualButton) ? (
                        <Button
                            variant='contained'
                            color='notBlack'
                            disableElevation={true}
                            sx={{
                                margin: "8px 12px 8px 16px",
                                cursor: "pointer",

                                "&:hover": {
                                    color: "seafoam.main",
                                },
                                textTransform: "capitalize",
                            }}
                            onClick={async () => {
                                try {
                                    const { data } = await earnSnootPoints({
                                        variables: {
                                            channelOwnerId:
                                                currentStreamerBlerpUser?._id,
                                            manualEarn: true,
                                        },
                                    });

                                    const pointsIncremented =
                                        data?.browserExtension?.earningSnoots
                                            ?.pointsIncremented;

                                    setPointsAdded(pointsIncremented);
                                    const timeoutId = setTimeout(() => {
                                        setPointsAdded(false);
                                    }, 3000);

                                    snackbarContext.triggerSnackbar({
                                        message: "Points Collected!",
                                        severity: "success",
                                        transitionType: "fade",
                                        position: {
                                            vertical: "bottom",
                                            horizontal: "right",
                                        },
                                    });
                                } catch (err) {
                                    snackbarContext.triggerSnackbar({
                                        message: "Failed to Collect Points",
                                        severity: "error",
                                        transitionType: "fade",
                                        position: {
                                            vertical: "bottom",
                                            horizontal: "right",
                                        },
                                    });
                                }
                            }}
                        >
                            <Text
                                sx={{
                                    color: "#000000",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                }}
                            >
                                Collect Points
                            </Text>
                        </Button>
                    ) : (
                        <div style={{ margin: "8px 12px 8px 16px" }}></div>
                    )}

                    {/* <Button
                        variant='contained'
                        href={`${selectedProject.host}/tradeBeets`}
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
                                fontSize: "16px",
                                fontWeight: "600",
                            }}
                        >
                            Add Funds
                        </Text>
                    </Button> */}
                </Stack>
            </Box>
        </Stack>
    );
};

export default UserChannelPointsBasket;
