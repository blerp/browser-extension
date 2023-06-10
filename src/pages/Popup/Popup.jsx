import React, { useEffect, useState } from "react";

import "./Popup.css";
import {
    Stack,
    Button,
    Text,
    Tab,
    Tabs,
    CogIcon,
    BlerpyIcon,
} from "@blerp/design";
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
import HomeButton from "../Extension/HomeButtonPopup";
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
        $kickUsername: String
        $trovoUsername: String
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
                kickUsername: $kickUsername
                trovoUsername: $trovoUsername
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
    const [kickUsername, setKickUsername] = useState(null);
    const [trovoUsername, setTrovoUsername] = useState(null);
    const [storedUserId, setUserId] = useState(null);

    const { loading, data, error, refetch } = useQuery(HOME_PAGE_POPUP, {
        variables: {
            userId: storedUserId,
            youtubeChannelId:
                currentPlatform === "YOUTUBE" ? youtubeChannelId : null,
            twitchUsername:
                currentPlatform === "TWITCH" ? twitchUsername : null,
            kickUsername: currentPlatform === "KICK" ? kickUsername : null,
            trovoUsername: currentPlatform === "TROVO" ? trovoUsername : null,
        },
        errorPolicy: "all",
    });

    const apolloClient = useApollo();

    const [tabState, setTabState] = useState("HOME");
    const [showPopup, setShowPopup] = useState();

    const signedInUser = data?.browserExtension?.userSignedIn;
    const currentStreamerBlerpUser =
        data?.browserExtension?.currentStreamerPage?.streamerBlerpUser ||
        data?.browserExtension?.userSignedIn;

    const themeMode = "dark";

    const [isPlaying, setIsPlaying] = useState(false);
    const [audioClip, setAudioClip] = useState();

    useEffect(() => {
        if (typeof window !== "undefined")
            setAudioClip(
                new Audio(
                    "https://cdn.blerp.com/normalized/400876b0-4412-11ed-a2d4-6748414eda0b",
                ),
            );
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioClip.currentTime = 0;
            audioClip.pause();
            setIsPlaying(false);
        } else {
            audioClip.play();
            setIsPlaying(true);
        }
    };

    // React.useEffect(() => {
    //     setUserId(signedInUser?._id);
    //     // getStreamerInfo()
    //     //     .then((result) => {
    //     //         setCurrentPlatform(result.currentPlatform);
    //     //         setYoutubeChannelId(result.youtubeChannelId);
    //     //         setTwitchUsername(result.twitchUsername);
    //     //     })
    //     //     .catch((err) => {
    //     //         console.log("ERROR_GETTING_INFO", err);
    //     //     });
    // }, [signedInUser]);

    const renderTabPage = () => {
        if (loading) {
            return <EllipsisLoader />;
        }

        if (!signedInUser) {
            return <UserLoginScreen refetchAll={refetch} />;
        }

        switch (tabState) {
            case "PROFILE":
                return (
                    <UserProfile
                        userSignedIn={signedInUser}
                        currentStreamerBlerpUser={currentStreamerBlerpUser}
                        refetchAll={refetch}
                        hideCollector={true}
                    />
                );
            case "HOME_OLD":
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

            case "HOME":
                return (
                    <>
                        <Stack
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                maxHeight: "200px",
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                paddingBottom: "32px",
                                margin: "24px auto",

                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "10px",
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
                                    fontSize: "16px",
                                    lineHeight: "130%",

                                    textAlign: "center",
                                    letterSpacing: "0.1em",
                                    color: "black.real",
                                    marginBottom: "12px",
                                }}
                            >
                                Share Sounds on Stream?
                            </Text>

                            <Text
                                sx={{
                                    width: "260px",
                                    fontFamily: "Odudo",
                                    fontStyle: "normal",
                                    fontWeight: 300,
                                    fontSize: "14px",
                                    lineHeight: "140%",

                                    textAlign: "center",
                                    letterSpacing: "0.1em",
                                    color: "black.real",
                                }}
                            >
                                Look underneath chat on a Blerp enabled stream
                                for this white Blerpy button{" "}
                                <Button
                                    onClick={() => {
                                        handlePlayPause();
                                    }}
                                    target='_blank'
                                    rel='noreferrer'
                                    variant='custom'
                                    sx={{
                                        margin: "0 2px",
                                        padding: "2px 4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",

                                        width: "30px",
                                        height: "30px",
                                        fontSize: "18px",
                                        borderRadius: "4px",
                                        minWidth: "0px",

                                        display: "inline",
                                        backgroundColor:
                                            themeMode === "light"
                                                ? "#E2E2E6"
                                                : "#35353B",

                                        "&:hover": {
                                            backgroundColor: "grey4.real",
                                        },
                                    }}
                                >
                                    <BlerpyIcon
                                        sx={{
                                            width: "21px",
                                            fontSize: "24px",
                                            color: false
                                                ? "ibisRed.main"
                                                : themeMode === "light"
                                                ? "#000"
                                                : "#fff",
                                        }}
                                    />
                                </Button>
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
                                    variant='outlined'
                                    color='whiteOverride'
                                    sx={{
                                        whiteSpace: "nowrap",
                                        // color: "#000000",
                                        margin: "12px 4px",
                                        fontSize: "14px",
                                    }}
                                    href={`${selectedProject.host}/soundboard-browser-extension?referralId=bsp`}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    Share Extension?
                                </Button>

                                <Button
                                    variant='outlined'
                                    color='whiteOverride'
                                    sx={{
                                        whiteSpace: "nowrap",
                                        borderColor: "whiteOverride.main",
                                        fontSize: "14px",
                                    }}
                                    onClick={() => window.location.reload()}
                                >
                                    Reload
                                </Button>
                            </Stack> */}
                        </Stack>
                        <Stack
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                // height: "80px",
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                paddingBottom: "32px",
                                margin: "0 auto",

                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                padding: "10px",
                                width: "280px",

                                // backgroundColor: "grey7.real",
                                borderRadius: "8px",

                                /* Inside auto layout */

                                flex: "none",
                                order: 1,
                                alignSelf: "stretch",
                                flexGrow: 0,
                            }}
                        >
                            <img
                                src='https://cdn.blerp.com/design/emotes/celebration2x.png'
                                style={{ width: "80px", height: "80px" }}
                            />

                            {/* <Text
                                sx={{
                                    width: "260px",
                                    fontFamily: "Odudo",
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                    fontSize: "16px",
                                    lineHeight: "130%",

                                    textAlign: "center",
                                    letterSpacing: "0.1em",
                                    color: "black.real",
                                    marginBottom: "12px",
                                }}
                            >
                                Share Sounds on Stream?
                            </Text>

                            <Text
                                sx={{
                                    width: "260px",
                                    fontFamily: "Odudo",
                                    fontStyle: "normal",
                                    fontWeight: 300,
                                    fontSize: "12px",
                                    lineHeight: "130%",

                                    textAlign: "center",
                                    letterSpacing: "0.1em",
                                    color: "black.real",
                                }}
                            >
                                Look underneath chat on a Blerp enabled stream
                                for this white Blerpy button{" "}
                                <Button
                                    onClick={() => {
                                        handlePlayPause();
                                    }}
                                    target='_blank'
                                    rel='noreferrer'
                                    variant='custom'
                                    sx={{
                                        margin: "0 2px",
                                        padding: "2px 4px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",

                                        width: "30px",
                                        height: "30px",
                                        fontSize: "18px",
                                        borderRadius: "4px",
                                        minWidth: "0px",

                                        display: "inline",
                                        backgroundColor:
                                            themeMode === "light"
                                                ? "#E2E2E6"
                                                : "#35353B",

                                        "&:hover": {
                                            backgroundColor: "grey4.real",
                                        },
                                    }}
                                >
                                    <BlerpyIcon
                                        sx={{
                                            width: "21px",
                                            fontSize: "24px",
                                            color: false
                                                ? "ibisRed.main"
                                                : themeMode === "light"
                                                ? "#000"
                                                : "#fff",
                                        }}
                                    />
                                </Button>
                            </Text> */}

                            <Stack
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    padding: "0px",
                                    gap: "4px",
                                }}
                            >
                                <Button
                                    variant='outlined'
                                    color='whiteOverride'
                                    sx={{
                                        whiteSpace: "nowrap",
                                        // color: "#000000",
                                        margin: "12px 4px",
                                        fontSize: "14px",
                                    }}
                                    href={`${selectedProject.host}/soundboard-browser-extension?referralId=univeralp`}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    Share Extension?
                                </Button>

                                {/* <Button
                                variant='outlined'
                                color='whiteOverride'
                                sx={{
                                    whiteSpace: "nowrap",
                                    borderColor: "whiteOverride.main",
                                    fontSize: "14px",
                                }}
                                onClick={() => window.location.reload()}
                            >
                                Reload
                            </Button> */}
                            </Stack>
                        </Stack>
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
            case "SOUNDBOARD":
                return (
                    <>
                        <HomeButton
                            userId={signedInUser?._id}
                            // youtubeChannelId={youtubeChannelId}
                            // twitchUsername={twitchUsername}
                            platform={currentPlatform}
                            // optionalButtonText='Share'
                            isStreaming={true}
                            showJustPanel={true}
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

            <Tabs
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
                    position: "fixed",
                    bottom: "0",
                    margin: "0 auto",
                    backgroundColor: "grey8.real",
                    width: "100%",
                    height: "40px",
                    minHeight: "40px",
                    borderRadius: false ? "0px" : "0 0 0 0",
                    zIndex: 100000,

                    "& .MuiTabs-flexContainer": {
                        height: "40px",
                    },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "whiteOverride.main",
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
                        backgroundColor: "whiteOverride.main",
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
                                        ? "whiteOverride.main"
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
                            tabState === "HOME"
                                ? "whiteOverride.main"
                                : "rgba(255,255,255,0.5)",
                        fontSize: "14px",
                    }}
                />

                <Tab
                    value='SOUNDBOARD'
                    label='My Sounds'
                    iconPosition='start'
                    icon={
                        <BlerpyIcon
                            sx={{
                                margin: "0 6px 0 0 !important",
                                fontSize: "18px",
                                color:
                                    tabState === "SOUNDBOARD"
                                        ? "whiteOverride.main"
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
                        fontSize: "14px",
                        color:
                            tabState === "SOUNDBOARD"
                                ? "whiteOverride.main"
                                : "rgba(255,255,255,0.5)",
                    }}
                />

                <Tab
                    value='PROFILE'
                    label='Profile'
                    icon={
                        <HomeRoundedIcon
                            sx={{
                                margin: "0 6px 0 0 !important",
                                fontSize: "18px",
                                color:
                                    tabState === "PROFILE"
                                        ? "whiteOverride.main"
                                        : "rgba(255,255,255,0.5)",
                            }}
                        />
                    }
                    // icon={
                    //     <img
                    //         src={
                    //             data?.twitch?.twitchChannelViewerPanel
                    //                 ?.twitchChannel?.customLogoCachedUrl
                    //         }
                    //         style={{
                    //             width: "15px",
                    //             height: "15px",
                    //             borderRadius: "20px",
                    //             margin: "0 6px 0 0 !important",
                    //             backgroundColor: "whiteOverride.main",
                    //         }}
                    //     />
                    // }
                    iconPosition='start'
                    sx={{
                        fontWeight: "600",
                        minHeight: "0px !important",
                        padding: "5px",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        fontSize: "14px",
                        color:
                            tabState === "PROFILE"
                                ? "whiteOverride.main"
                                : "rgba(255,255,255,0.5)",
                    }}
                />
            </Tabs>
        </Stack>
    );
};

export default Popup;
