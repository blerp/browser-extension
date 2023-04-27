import React, { useState, useRef, useEffect, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
    Tooltip,
    DiscordIcon,
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

import selectedProject from "../../projectConfig";
import { removeAndLogoutOfCacheJwt } from "../../globalCache";
import UserBeetsWallet from "./UserBeetsWallet";
import UserChannelPointsBasket from "./UserChannelPointsBasket";
import UserLoginScreen from "./UserLoginScreen";

const LOG_OUT_QUERY = gql`
    query websiteLogout {
        web {
            userSignOut {
                complete
            }
        }
    }
`;

function eraseCookie({ name, sDomain, sPath }) {
    document.cookie =
        name +
        "=; Max-Age=-99999999;" +
        "expires=Thu, 01 Jan 1970 00:00:01 GMT;" +
        (sDomain ? "; domain=" + sDomain : "") +
        (sPath ? "; path=" + sPath : "");
}

const UserProfile = ({
    userSignedIn,
    refetchAll,
    currentStreamerBlerpUser,
    hideCollector,
}) => {
    const snackbarContext = useContext(SnackbarContext);
    const [earnSnootPoints, { loading }] = useMutation(EARN_SNOOT_POINTS);
    const [pointsAdded, setPointsAdded] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const apolloClient = useApollo();

    const logOut = async () => {
        if (window) {
            window.scrollTo(0, 0);
        }
        eraseCookie({ name: "jwt" });
        eraseCookie({
            name: "jwt",
            sDomain: selectedProject.jwtDomain,
            sPath: "/",
        });
        await apolloClient.resetStore();
        await apolloClient.clearStore();

        try {
            const logoutQuery = await apolloClient.query({
                query: LOG_OUT_QUERY,
                errorPolicy: "all",
            });
        } catch (err) {
        } finally {
            removeAndLogoutOfCacheJwt();
        }
    };

    if (!userSignedIn) {
        return <UserLoginScreen />;
    }

    return (
        <Stack
            sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
            }}
        >
            <Stack
                sx={{
                    width: "90%",
                    alignItems: "center",
                    padding: "24px 0",
                }}
            >
                <Stack
                    sx={{
                        margin: "8px",
                        alignItems: "center",
                        alignSelf: "flex-start",
                    }}
                >
                    <Stack
                        direction='row'
                        sx={{
                            justifyContent: "flex-start",
                            width: "100%",
                            cursor: "pointer",
                            "&:hover": {
                                opacity: 0.8,
                            },
                        }}
                        onClick={() => {
                            window.open(
                                `${selectedProject?.host}/u/${userSignedIn?.username}`,
                                "_blank",
                            );
                        }}
                    >
                        {userSignedIn.profileImage && (
                            <img
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    marginRight: "10px",
                                    borderRadius: "100px",
                                }}
                                src={
                                    userSignedIn.profileImage &&
                                    userSignedIn.profileImage.original &&
                                    userSignedIn.profileImage.original.url
                                }
                            />
                        )}

                        <Text
                            fontColor='notBlack'
                            style={{
                                margin: "0",
                                maxWidth: "460px",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                fontSize: "24px",
                                textTransform: "capitalize",
                            }}
                        >
                            {userSignedIn.username}
                        </Text>
                    </Stack>
                </Stack>

                {!currentStreamerBlerpUser?.soundEmotesObject
                    ?.beetsDisabled && (
                    <UserBeetsWallet userSignedIn={userSignedIn} />
                )}

                {currentStreamerBlerpUser &&
                    !currentStreamerBlerpUser?.soundEmotesObject
                        ?.channelPointsDisabled && (
                        <UserChannelPointsBasket
                            userSignedIn={userSignedIn}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                            hideCollector={true}
                        />
                    )}

                <Stack
                    direction='row'
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: "12px",
                    }}
                >
                    <Button
                        variant='text'
                        color='whiteOverride'
                        sx={{
                            whiteSpace: "nowrap",
                            margin: "8px",
                        }}
                        startIcon={
                            <DiscordIcon
                                style={{ fontSize: "16px" }}
                                sx={{
                                    color: "whiteOverride.main",
                                    fontSize: "16px",
                                }}
                            />
                        }
                        onClick={() => {
                            window.open(
                                `https://discord.gg/zsa7nSdx6X`,
                                "_blank",
                            );
                        }}
                        target='_blank'
                    >
                        <Text
                            fontColor='notBlack'
                            style={{
                                fontSize: "16px",
                                fontWeight: "600",
                            }}
                        >
                            {"Help Center"}
                        </Text>
                    </Button>

                    <Button
                        variant='outlined'
                        color='whiteOverride'
                        sx={{
                            whiteSpace: "nowrap",
                            margin: "8px",
                            borderColor: "whiteOverride.main",
                        }}
                        onClick={async () => {
                            try {
                                setLoggingOut(true);

                                await logOut();
                                if (refetchAll) await refetchAll();

                                setLoggingOut(false);
                            } catch (err) {
                                setLoggingOut(false);
                                console.log("Logging out error", err);
                            }
                        }}
                        target='_blank'
                    >
                        <Text
                            fontColor='notBlack'
                            style={{
                                fontSize: "16px",
                                fontWeight: "600",
                            }}
                        >
                            {loggingOut ? "Logging Out" : "Log Out"}
                        </Text>
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default UserProfile;
