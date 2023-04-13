import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Box,
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
    Tooltip,
} from "@blerp/design";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";

import { EARN_SNOOT_POINTS } from "../../mainGraphQl";

import EllipsisLoader from "./EllipsisLoader";
import selectedProject from "../../projectConfig";
import { removeAndLogoutOfCacheJwt } from "../../globalCache";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import HelpRounded from "@mui/icons-material/HelpRounded";

const UserProfile = ({
    userSignedIn,
    refetchAll,
    currentStreamerBlerpUser,
}) => {
    return (
        <Stack
            sx={{
                width: "280px",
                height: "104px",
                alignItems: "center",
                justifyContent: "space-around",
                mt: "12px",
                backgroundColor: "#B43757",
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
                            fontSize: "16px",
                        }}
                    >
                        Beets
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
                                        fontSize: "16px",
                                    }}
                                >
                                    Every beet lines your streamers pocket with
                                    another real penny.
                                </Text>
                            </>
                        }
                    >
                        <Button color='grey3' sx={{ zIndex: 100000 }}>
                            <HelpRounded sx={{ fontSize: "24px" }} />
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
                            src='https://cdn.blerp.com/design/browser-extension/beet.svg'
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
                            {(userSignedIn &&
                                userSignedIn.userWallet &&
                                userSignedIn.userWallet.beetBalance) ||
                                0}
                        </Text>
                    </Stack>

                    <Button
                        variant='contained'
                        href={`${selectedProject.host}/tradeBeets`}
                        target='_blank'
                        rel='noreferrer'
                        color='notBlack'
                        sx={{
                            margin: "8px 12px 8px 16px",
                        }}
                        disableElevation={true}
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
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );
};

export default UserProfile;
