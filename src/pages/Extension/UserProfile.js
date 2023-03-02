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
import { removeAndLogoutOfCacheJwt } from "../../globalCache";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

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

const UserProfile = ({ userSignedIn, refetchAll }) => {
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
        return (
            <Stack
                sx={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-around",
                    mt: "12px",
                }}
            >
                <Button
                    variant='ouline'
                    href={`${
                        selectedProject.host
                    }/login?returnTo=${`/soundboard-browser-extension`}`}
                    target='_blank'
                    rel='noreferrer'
                    sx={{
                        margin: "8px 12px 8px 16px",
                        fontSize: "18px",
                    }}
                >
                    <Text sx={{ color: "white" }}>Login to See Profile</Text>
                </Button>
            </Stack>
        );
    }

    return (
        <Stack
            sx={{
                height: "70%",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-around",
                overflowY: "scroll",
                mt: "12px",
            }}
        >
            <Stack width='80%' sx={{ margin: "8px" }}>
                <Stack
                    direction='row'
                    sx={{
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    {userSignedIn.profileImage && (
                        <img
                            style={{
                                width: "60px",
                                height: "60px",
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
                            fontSize: "28px",
                        }}
                    >
                        {userSignedIn.username &&
                            userSignedIn.username.toUpperCase()}
                    </Text>
                </Stack>
            </Stack>

            <Button
                variant='outlined'
                color='whiteOverride'
                sx={{ whiteSpace: "nowrap", margin: "8px" }}
                startIcon={
                    <OpenInNewRoundedIcon
                        sx={{
                            color: "whiteOverride.main",
                        }}
                    />
                }
                onClick={() => {
                    window.open(
                        `${selectedProject?.host}/u/${userSignedIn.username}`,
                        "_blank",
                    );
                }}
                target='_blank'
            >
                {"View Account"}
            </Button>

            <Button
                variant='text'
                color='whiteOverride'
                sx={{ marginTop: "12px" }}
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
                {loggingOut ? "Logging Out" : "Logout"}
            </Button>
        </Stack>
    );
};

export default UserProfile;
