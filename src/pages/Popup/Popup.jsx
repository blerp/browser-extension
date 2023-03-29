import React, { useState } from "react";

import "./Popup.css";
import { Stack, Button, Text, Tab, Tabs, CogIcon } from "@blerp/design";
import selectedProject from "../../projectConfig";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { useApollo } from "../../networking/apolloClient";
import UserLoginScreen from "../Extension/UserLoginScreen";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
    getGlobalCacheJwt,
    getStreamerInfo,
    removeAndLogoutOfCacheJwt,
} from "../../globalCache";
import BlerpModal from "../Extension/BlerpModal";
import HomeButton from "../Extension/HomeButton";
import { BLERP_USER_SELF, BLERP_USER_STREAMER } from "../../mainGraphQl";
import EllipsisLoader from "../Extension/EllipsisLoader";
import UserProfile from "../Extension/UserProfile";

const HOME_PAGE_POPUP = gql`
    ${BLERP_USER_STREAMER}
    ${BLERP_USER_SELF}
    query viewerBrowserExtensionPopup(
        $userId: MongoID
        $youtubeChannelId: String
        $twitchUsername: String
    ) {
        browserExtension {
            biteRandomOne {
                _id
                title
                saved
            }
            userSignedIn {
                ...UserFragment
            }
            currentStreamerPage(
                userId: $userId
                youtubeChannelId: $youtubeChannelId
                twitchUsername: $twitchUsername
            ) {
                streamerBlerpUser {
                    ...BlerpStreamerFragment
                }
            }
        }
    }
`;

const Popup = () => {
    const [currentPlatform, setCurrentPlatform] = useState(null);
    const [youtubeChannelId, setYoutubeChannelId] = useState(null);
    const [twitchUsername, setTwitchUsername] = useState(null);

    const { loading, data, error, refetch } = useQuery(HOME_PAGE_POPUP, {
        variables: {
            userId: null,
            youtubeChannelId:
                currentPlatform === "YOUTUBE" ? youtubeChannelId : null,
            twitchUsername:
                currentPlatform === "TWITCH" ? twitchUsername : null,
        },
        errorPolicy: "all",
    });

    const apolloClient = useApollo();

    const [tabState, setTabState] = useState("SETTINGS");
    const [showPopup, setShowPopup] = useState();

    const signedInUser = data?.browserExtension?.userSignedIn;
    const currentStreamerBlerpUser =
        data?.browserExtension?.currentStreamerPage?.streamerBlerpUser;

    React.useEffect(() => {
        getStreamerInfo()
            .then((result) => {
                setCurrentPlatform(result.currentPlatform);
                setYoutubeChannelId(result.youtubeChannelId);
                setTwitchUsername(result.twitchUsername);
            })
            .catch((err) => {
                console.log("ERROR_GETTING_INFO", err);
            });
    }, []);

    const renderTabPage = () => {
        if (loading) {
            return <EllipsisLoader />;
        }

        if (!signedInUser) {
            return <UserLoginScreen refetchAll={refetch} />;
        }

        switch (tabState) {
            case "HOME":
                return (
                    <>
                        <Stack
                            sx={{
                                display: "flex",
                                width: "100%",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-around",
                                marginTop: "12px",
                            }}
                        >
                            <Stack
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img
                                    src={
                                        "https://cdn.blerp.com/blerp_products/Icons/BasketoBeets-Grey7.svg"
                                    }
                                    style={{
                                        width: "60px",
                                        margin: "12px 4px",
                                    }}
                                />

                                <Stack
                                    sx={{
                                        display: "flex",
                                        direction: "column",
                                    }}
                                >
                                    <Text
                                        fontColor='ibisRed'
                                        fontSize='18px'
                                        style={{ margin: 0 }}
                                    >
                                        {(signedInUser &&
                                            signedInUser.userWallet &&
                                            signedInUser.userWallet
                                                .beetBalance) ||
                                            0}
                                    </Text>

                                    <Text
                                        fontColor='white'
                                        fontWeight='light'
                                        fontSize='12px'
                                        style={{
                                            margin: 0,
                                        }}
                                    >
                                        My Basket
                                    </Text>
                                </Stack>
                            </Stack>

                            {/* {(twitchUsername || youtubeChannelId) && (
                                <HomeButton
                                    userId={null}
                                    youtubeChannelId={youtubeChannelId}
                                    twitchUsername={twitchUsername}
                                    platform={currentPlatform}
                                    optionalButtonText='Share'
                                    isStreaming={true}
                                />
                            )} */}
                        </Stack>

                        <Button
                            href={`${selectedProject.host}/soundboard-browser-extension`}
                            target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            sx={{ margin: "8px 12px 8px 16px" }}
                        >
                            Setup Guide
                        </Button>

                        {/* <Button
                            onClick={async () => {
                                const { data } = await apolloClient.query({
                                    query: HOME_PAGE_POPUP,
                                    variables: {},
                                    fetchPolicy: "network-only",
                                });
                                console.log("Make Work", data);
                            }}
                            target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            sx={{ margin: "8px 12px 8px 16px" }}
                        >
                            Call Query
                        </Button> */}
                        {/* <Button
                            onClick={async () => {
                                const token = await getGlobalCacheJwt();
                                console.log("Make Work", token);
                            }}
                            target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            sx={{ margin: "8px 12px 8px 16px" }}
                        >
                            Check Token
                        </Button> */}

                        <Button
                            target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            sx={{ margin: "8px 12px 8px 16px" }}
                            onClick={() => {
                                setShowPopup(true);
                            }}
                        >
                            Open Modal
                        </Button>

                        <Button
                            // href={`${selectedProject.host}/tradeBeets`}
                            // target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            color='seafoam'
                            onClick={() => {
                                setShowPopup(true);
                            }}
                            sx={{
                                margin: "8px 12px 8px 16px",
                                cursor: "pointer",
                                // fontSize: "1em",
                                color: "#000",
                                // width: "160px",
                            }}
                        >
                            <img
                                src={
                                    "https://cdn.blerp.com/blerp_products/Icons/Beet-NotBlack.svg"
                                }
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    paddingRight: "4px",
                                }}
                            />
                            Get Beets
                        </Button>
                    </>
                );

            case "LIBRARY":
                return (
                    <>
                        <Button
                            onClick={async () => {
                                console.log("Query Call");
                                const { data } = await apolloClient.query({
                                    query: HOME_PAGE_POPUP,
                                    variables: {},
                                });
                                console.log("Make Work", data);
                            }}
                            target='_blank'
                            rel='noreferrer'
                            variant='contained'
                            sx={{ margin: "8px 12px 8px 16px" }}
                        >
                            Call Query
                        </Button>
                    </>
                );
            case "SETTINGS":
                return (
                    <>
                        {/* {(twitchUsername || youtubeChannelId) && (
                            <HomeButton
                                userId={null}
                                youtubeChannelId={youtubeChannelId}
                                twitchUsername={twitchUsername}
                                platform={currentPlatform}
                                optionalButtonText='Share'
                                isStreaming={true}
                            />
                        )} */}
                        <UserProfile
                            userSignedIn={signedInUser}
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                            refetchAll={refetch}
                        />
                    </>
                );
            case "DEFAULT":
                return <></>;
        }
    };

    return (
        <Stack sx={{ height: "100vh", backgroundColor: "grey7.real" }}>
            <Stack
                sx={{
                    width: "92%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "0 0 16px 16px",
                    alignSelf: "center",
                    backgroundColor: "grey7.real",
                }}
            >
                <img
                    src={
                        "https://cdn.blerp.com/blerp-products/Web/Misc/blerp_logo_transparent.svg"
                    }
                    style={{
                        margin: "12px",
                        width: "100px",
                        cursor: "pointer",
                    }}
                    alt='Blerp Logo'
                    onClick={() => {
                        window.open(selectedProject.host, "_blank");
                    }}
                />

                <CloseRoundedIcon
                    sx={{
                        color: "white.real",
                        cursor: "pointer",
                        padding: "12px",
                    }}
                    onClick={() => {
                        window.close();
                    }}
                />
            </Stack>

            <Stack
                sx={{
                    backgroundColor: "grey8.real",
                    height: "100%",
                }}
            >
                {renderTabPage()}
            </Stack>

            <BlerpModal setIsOpen={setShowPopup} isOpen={showPopup} />
        </Stack>
    );
};

export default Popup;

{
    /* <Tabs
    value={tabState}
    onChange={(e, newValue) => {
        setTabState(newValue);
    }}
    variant='fullWidth'
    textColor='white'
    indicatorColor='white'
    TabIndicatorProps={{
        children: <span className='MuiTabs-indicatorSpan' />,
    }}
    sx={{
        position: "absolute",
        bottom: "0px",
        margin: "0 auto",
        backgroundColor: "#000",
        width: "100%",
        height: "40px",
        minHeight: "0px",
        borderRadius: false ? "0px" : "0 0 0 0",

        "& .MuiTabs-flexContainer": {
            height: "40px",
        },
        "& .MuiTabs-indicator": {
            backgroundColor: "grey7.real",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "transparent",
            bottom: "5px",
        },
        "& .MuiTabs-indicatorSpan": {
            height: "3px",
            borderRadius: "5px",
            maxWidth: 20,
            width: "100%",
            backgroundColor: "notBlack.main",
        },
    }}
>
    <div
        style={{
            position: "absolute",
            width: "100%",
            backgroundColor: "#00000033",
            height: "100%",
        }}
    ></div>

    <Tab
        value='HOME'
        label='Home'
        icon={
            <HomeRoundedIcon
                sx={{
                    margin: "0 6px 0 0 !important",
                    fontSize: "18px",
                    color:
                        tabState === "HOME"
                            ? "notBlack.main"
                            : "rgba(255,255,255,0.5)",
                }}
            />
        }
        icon={
            <img
                src={
                    data?.twitch?.twitchChannelViewerPanel?.twitchChannel
                        ?.customLogoCachedUrl
                }
                style={{
                    width: "15px",
                    height: "15px",
                    borderRadius: "20px",
                    margin: "0 6px 0 0 !important",
                    backgroundColor: "notBlack.main",
                }}
            />
        }
        iconPosition='start'
        sx={{
            fontWeight: "600",
            minHeight: "0px !important",
            padding: "5px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            fontSize: "16px",
            color:
                tabState === "HOME" ? "notBlack.main" : "rgba(255,255,255,0.5)",
        }}
    />
    <Tab
        value='LIBRARY'
        label='Library'
        icon={
            <BookmarkAddRoundedIcon
                sx={{
                    margin: "0 6px 0 0 !important",
                    fontSize: "18px",
                    color:
                        tabState === "LIBRARY"
                            ? "notBlack.main"
                            : "rgba(255,255,255,0.5)",
                }}
            />
        }
        iconPosition='start'
        sx={{
            "& > .MuiTab-iconWrapper": {
                margin: "0 6px 0 0 !important",
            },
            fontWeight: "600",
            minHeight: "0px !important",
            padding: "5px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            color:
                tabState === "LIBRARY"
                    ? "notBlack.main"
                    : "rgba(255,255,255,0.5)",
        }}
    />
    <Tab
        value='SETTINGS'
        label='Profile'
        iconPosition='start'
        icon={
            <CogIcon
                sx={{
                    margin: "0 6px 0 0 !important",
                    fontSize: "18px",
                    color:
                        tabState === "SETTINGS"
                            ? "notBlack.main"
                            : "rgba(255,255,255,0.5)",
                }}
            />
        }
        sx={{
            minHeight: "0px !important",
            padding: "5px",
            display: "flex",
            fontWeight: "600",
            flexDirection: "row",
            whiteSpace: "nowrap",
            alignItems: "center",
            fontSize: "16px",
            color:
                tabState === "SETTINGS"
                    ? "notBlack.main"
                    : "rgba(255,255,255,0.5)",
        }}
    />
</Tabs>; */
}
