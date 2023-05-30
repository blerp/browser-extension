import React, { useState, useRef, useContext, useEffect } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Popover,
    Tabs,
    Tab,
    ChannelPointsIcon,
    CogIcon,
    SnackbarContext,
    Tooltip,
    Drawer,
    Menu,
    MenuItem,
} from "@blerp/design";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import selectedProject from "../../projectConfig";
import BlerpModal from "./BlerpModal";
import BlerpModalShare from "./BlerpModalShare";
import BlerpModalScreen from "./BlerpModalScreen";

import CloseIcon from "@mui/icons-material/Close";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import ExtensionRoot from "./ExtensionRoot";
import ExtensionFooter from "./ExtensionFooter";

import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
    UPDATE_VIEWER_LOG,
} from "../../mainGraphQl";
import StreamerBlocked from "./StreamerBlocked";
import UserProfile from "./UserProfile";

import CoolNewSearchBar from "./CoolNewSearchBar";

import StreamerPaused from "./StreamerPaused";
import EllipsisLoader from "./EllipsisLoader";
import { EXTENSION_WIDTH_PX, EXTENSION_HEIGHT_PX } from "../../constants";
import CustomDrawer from "./CustomDrawer";
import TruncatedText from "./TruncatedText";
import ExtensionDisabled from "./ExtensionDisabled";
import { useApollo } from "../../networking/apolloClient";
import ChannelPointsCollector from "./ChannelPointsCollector";

const VIEWER_BROWSER_EXTENSION = gql`
    ${BLERP_USER_STREAMER}
    ${BLERP_USER_SELF}
    query viewerBrowserExtension(
        $userId: MongoID
        $youtubeChannelId: String
        $twitchUsername: String
        $kickUsername: String
    ) {
        browserExtension {
            currentStreamerPage(
                userId: $userId
                youtubeChannelId: $youtubeChannelId
                twitchUsername: $twitchUsername
                kickUsername: $kickUsername
            ) {
                streamerBlerpUser {
                    ...BlerpStreamerFragment
                }
            }
            userSignedIn {
                ...UserFragment
            }
        }
    }
`;

const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const HomeButton = ({
    userId,
    youtubeChannelId,
    twitchUsername,
    kickUsername,

    platform,
    optionalButtonText,
    isStreaming,
    themeMode, // light/dark
    showJustPanel,
}) => {
    const [newYoutubeChannelId, setYoutubeChannelId] =
        useState(youtubeChannelId);
    const [newTwitchUsername, setTwitchUsername] = useState(twitchUsername);
    const [newKickUsername, setKickUsername] = useState(kickUsername);

    const { loading, data, error, refetch } = useQuery(
        VIEWER_BROWSER_EXTENSION,
        {
            variables: {
                userId: userId,
                youtubeChannelId:
                    platform === "YOUTUBE" ? newYoutubeChannelId : null,
                twitchUsername:
                    platform === "TWITCH" ? newTwitchUsername : null,
                kickUsername: platform === "KICK" ? newKickUsername : null,
            },
            errorPolicy: "all",
            // awaitRefetchQueries: true, // Wait for refetches before resetting the store
        },
    );

    // console.log(
    //     "CHECKINg HOMEBUTTON!!",
    //     platform,
    //     youtubeChannelId,
    //     twitchUsername,
    //     kickUsername,
    //     isStreaming,
    // );

    const [searchTerm, setSearchTerm] = useState("");

    const [volume, setVolume] = useState(0.8);

    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState("");
    const [tabState, setTabState] = useState("HOME");
    const [previousTabState, setPreviousTabState] = useState("HOME");

    const apolloClient = useApollo();

    const [anchorBlerpEl, setAnchorBlerpEl] = useState(null);
    const [copyText, setCopyText] = useState("Copy Link");

    const handleClickBlerp = (event) => {
        setAnchorBlerpEl(event.currentTarget);
    };

    const handleCloseBlerp = () => {
        setAnchorBlerpEl(null);
    };

    const handleOpenLink = () => {
        window.open(
            `${selectedProject.host}/soundbites/${activeBlerp?._id}`,
            "_blank",
        );
        handleCloseBlerp();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(
            `${selectedProject.host}/soundbites/${activeBlerp?._id}`,
        );
        setCopyText("Copied!");
        setTimeout(() => {
            setCopyText("Copy Link");
        }, 5000);
        handleCloseBlerp();
    };

    const handleOpenUserLink = () => {
        window.open(
            `${selectedProject.host}/u/${signedInUser?.username}`,
            "_blank",
        );
        handleCloseUser();
    };

    const [anchorUserEl, setAnchorUserEl] = useState(null);

    const handleClickUser = (event) => {
        setAnchorUserEl(event.currentTarget);
    };

    const handleCloseUser = () => {
        setAnchorUserEl(null);
    };

    const handleCopyUserLink = () => {
        navigator.clipboard.writeText(
            `${selectedProject.host}/u/${signedInUser?.username}`,
        );
        setCopyText("Copied!");
        setTimeout(() => {
            setCopyText("Copy Link");
        }, 5000);
        handleCloseUser();
    };

    // create a function that sets the new tab state and the previous tab state to what it used to be
    const handleTabChange = (newValue) => {
        setSearchTerm("");
        setPreviousTabState(tabState);
        setTabState(newValue);
    };

    const [currencyGlobalState, setCurrencyGlobal] = useState("BEETS");

    const [activeBlerp, setActiveBlerp] = useState(null);
    const [hideStreamerPaused, setHideStreamerPaused] = useState(false);

    const [pointsAdded, setPointsAdded] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [earnSnootPoints] = useMutation(EARN_SNOOT_POINTS);
    const [updateViewerLog] = useMutation(UPDATE_VIEWER_LOG);
    const snackbarContext = useContext(SnackbarContext);

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

    const handleClick = async (event) => {
        if (platform === "YOUTUBE") {
            // console.log(
            //     "NEW",
            //     newYoutubeChannelId,
            //     "OLD",
            //     youtubeChannelId,
            //     window.ytInitialData,
            // );
            // TODO: Implement
        } else if (platform === "TWITCH") {
            let matchMoreStuff = window.location.pathname.match(/^\/([^/]+)/);
            let nameInputOne = null;
            nameInputOne = matchMoreStuff[1];

            if (window.location.host === "dashboard.twitch.tv") {
                const pathSegments = window.location.pathname
                    .split("/")
                    .filter((segment) => segment.trim() !== "");
                if (pathSegments.length >= 2 && pathSegments[0] === "u") {
                    nameInputOne = pathSegments[1];
                }
            }

            // console.log(
            //     "NEW",
            //     newTwitchUsername,
            //     "OLD",
            //     twitchUsername,
            //     "TEST",
            //     nameInputOne,
            // );

            if (nameInputOne) {
                setTwitchUsername(nameInputOne);
            }
        } else if (platform === "KICK") {
            // Try to get the username from the page title
            let newNameInput2 = null;
            let pageTitleAgain = document.querySelector("title").textContent;

            if (pageTitleAgain && pageTitleAgain.includes(" | Kick")) {
                newNameInput2 = pageTitleAgain.replace(" | Kick", "");
                newNameInput2 =
                    newNameInput2 !== "Search" ? newNameInput2.trim() : "";
            }

            // console.log(
            //     "NEW",
            //     kickUsername,
            //     "OLD",
            //     newKickUsername,
            //     "NEW",
            //     newNameInput2,
            // );

            if (newNameInput2) {
                setKickUsername(newNameInput2);
            }
        }

        setAnchorEl(event.currentTarget);
        refetch();
    };

    const handleClose = () => {
        setSearchTerm("");
        setAnchorEl(null);
        setHideStreamerPaused(false);
        apolloClient.stop();
        apolloClient.resetStore();
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const signedInUser = data?.browserExtension?.userSignedIn;
    const currentStreamerBlerpUser =
        data?.browserExtension?.currentStreamerPage?.streamerBlerpUser;

    // Trigger first collection if not collected yet
    useEffect(() => {
        if (
            !currentStreamerBlerpUser?.loggedInChannelPointBasket?.standardMS &&
            currentStreamerBlerpUser?._id &&
            signedInUser &&
            isStreaming
        ) {
            earnSnootPoints({
                variables: {
                    channelOwnerId: currentStreamerBlerpUser?._id,
                    manualEarn: false,
                },
            })
                .then((data) => {
                    // const pointsIncremented =
                    //     data?.browserExtension?.earningSnoots?.pointsIncremented;
                    // setPointsAdded(pointsIncremented);
                    // const timeoutId = setTimeout(() => {
                    //     setPointsAdded(false);
                    // }, 3000);
                })
                .catch((err) => {
                    console.log("Initial cp error", err);
                });
        }
    }, [currentStreamerBlerpUser]);

    const renderBlerpNav = () => {
        if (activeBlerp && tabState !== "PROFILE") {
            return (
                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-around",
                        position: "relative",
                        backgroundColor: "grey7.real",
                        width: "100%",
                        minHeight: "44px",
                        padding: "2px 0",

                        position: "sticky",
                        top: "0px",
                        zIndex: 3001,
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
                        <ChevronLeftRoundedIcon
                            sx={{
                                width: "32px",
                                height: "36px",
                                cursor: "pointer",
                                color: "notBlack.main",
                                marginRight: "4px",
                            }}
                            onClick={async () => {
                                setActiveBlerp(null);
                                refetch();

                                // const [updateViewerLog] = useMutation(UPDATE_VIEWER_LOG);

                                // try {
                                //     const { data } = await updateViewerLog({
                                //         variables: {
                                //             channelOwnerId:
                                //                 currentStreamerBlerpUser?._id,
                                //         },
                                //     });
                                // } catch (err) {
                                //     console.log(err);
                                // }
                            }}
                        />

                        <Tooltip
                            title={
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                    }}
                                >
                                    {activeBlerp?.soundEmotesContext?.title
                                        ? activeBlerp?.soundEmotesContext?.title
                                        : activeBlerp?.title}
                                </Text>
                            }
                            placement='bottom'
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
                        >
                            <div style={{ cursor: "text" }}>
                                <TruncatedText
                                    text={
                                        activeBlerp?.soundEmotesContext?.title
                                            ? activeBlerp?.soundEmotesContext
                                                  ?.title
                                            : activeBlerp?.title
                                    }
                                    style={{
                                        fontSize: "16px",
                                        lineHeight: "130%",
                                        letterSpacing: "0.1em",
                                        fontWeight: "600",
                                        color: "white.override",
                                        margin: "2px",
                                        width: "198px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                />
                            </div>
                        </Tooltip>
                    </Stack>

                    <MoreVertRoundedIcon
                        sx={{
                            width: "28px",
                            height: "28px",
                            cursor: "pointer",
                            color: "notBlack.main",
                            marginRight: "8px",
                            "&:hover": { opacity: 0.7 },
                        }}
                        onClick={handleClickBlerp}
                    />
                    <Menu
                        anchorEl={anchorBlerpEl}
                        open={Boolean(anchorBlerpEl)}
                        onClose={handleCloseBlerp}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                        sx={{
                            zIndex: 1000000,
                            "& .MuiPaper-root": {
                                backgroundColor: "#2C3233",
                                borderRadius: "8px",
                            },
                        }}
                    >
                        <MenuItem onClick={handleOpenLink}>
                            <OpenInNewIcon
                                sx={{
                                    marginRight: 1,
                                    color: "white",
                                    fontSize: "16px",
                                }}
                            />
                            <span style={{ color: "white", fontSize: "16px" }}>
                                View on Blerp.com
                            </span>
                        </MenuItem>
                        <MenuItem onClick={handleCopyLink}>
                            <ContentCopyIcon
                                sx={{
                                    marginRight: 1,
                                    color: "white",
                                    fontSize: "16px",
                                }}
                            />
                            <span style={{ color: "white", fontSize: "16px" }}>
                                {copyText}
                            </span>
                        </MenuItem>
                    </Menu>

                    {!showJustPanel && (
                        <CloseIcon
                            sx={{
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                color: "notBlack.main",
                                marginRight: "8px",
                            }}
                            onClick={handleClose}
                        />
                    )}
                </Stack>
            );
        }

        switch (tabState) {
            case "PROFILE":
                return (
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            backgroundColor: "grey7.real",
                            width: "100%",
                            minHeight: "44px",
                            padding: "2px 0",

                            position: "sticky",
                            top: "0px",
                            zIndex: 3001,
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
                            <ChevronLeftRoundedIcon
                                sx={{
                                    width: "32px",
                                    height: "36px",
                                    cursor: "pointer",
                                    color: "notBlack.main",
                                    marginRight: "4px",
                                }}
                                onClick={async () => {
                                    handleTabChange("HOME");
                                    await refetch();
                                }}
                            />

                            <Text
                                sx={{
                                    fontSize: "18px",
                                    lineHeight: "130%",
                                    letterSpacing: "0.1em",
                                    fontWeight: "600",
                                    color: "white.override",
                                    margin: "2px",
                                    height: "24px",
                                    width: "198px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                Profile
                            </Text>
                        </Stack>
                        {/* <SearchRoundedIcon
                            sx={{
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                color: "notBlack.main",
                                marginRight: "8px",
                            }}
                            onClick={() => {
                            }}
                        /> */}

                        <MoreVertRoundedIcon
                            sx={{
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                color: "notBlack.main",
                                marginRight: "8px",
                                "&:hover": { opacity: 0.7 },
                            }}
                            onClick={handleClickUser}
                        />

                        <Menu
                            anchorEl={anchorUserEl}
                            open={Boolean(anchorUserEl)}
                            onClose={handleCloseUser}
                            MenuListProps={{
                                "aria-labelledby": "basic-button",
                            }}
                            sx={{
                                zIndex: 1000000,
                                "& .MuiPaper-root": {
                                    backgroundColor: "#2C3233",
                                    borderRadius: "8px",
                                },
                            }}
                        >
                            <MenuItem onClick={handleOpenUserLink}>
                                <OpenInNewIcon
                                    sx={{
                                        marginRight: 1,
                                        color: "white",
                                        fontSize: "16px",
                                    }}
                                />
                                <span
                                    style={{ color: "white", fontSize: "16px" }}
                                >
                                    Profile on Blerp.com
                                </span>
                            </MenuItem>

                            <MenuItem onClick={handleCopyUserLink}>
                                <ContentCopyIcon
                                    sx={{
                                        marginRight: 1,
                                        color: "white",
                                        fontSize: "16px",
                                    }}
                                />
                                <span
                                    style={{ color: "white", fontSize: "16px" }}
                                >
                                    {copyText}
                                </span>
                            </MenuItem>
                        </Menu>
                    </Stack>
                );
            case "FAVES":
                return (
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "grey7.real",
                            width: "100%",
                            minHeight: "44px",
                            padding: "2px 0",

                            position: "sticky",
                            top: "0px",
                            zIndex: 3001,
                        }}
                    >
                        <Stack
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <ChevronLeftRoundedIcon
                                sx={{
                                    width: "32px",
                                    height: "36px",
                                    cursor: "pointer",
                                    color: "notBlack.main",
                                    marginLeft: "8px",
                                }}
                                onClick={() => {
                                    handleTabChange("HOME");
                                }}
                            />

                            {showSearch ? (
                                <Stack
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            width: "96%",
                                        }}
                                    >
                                        <CoolNewSearchBar
                                            setSearchTerm={setSearchTerm}
                                            searchTerm={searchTerm}
                                            onClose={() => {
                                                setShowSearch(false);
                                            }}
                                            handleCloseBar={() => {
                                                setShowSearch(false);
                                            }}
                                            showFavorite={true}
                                            placeholderText='Search'
                                        />
                                    </Stack>
                                </Stack>
                            ) : (
                                <Text
                                    sx={{
                                        fontSize: "18px",
                                        lineHeight: "130%",
                                        letterSpacing: "0.1em",
                                        fontWeight: "600",
                                        color: "white.override",
                                        margin: "2px",
                                        height: "24px",
                                        width: "198px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    Favorites
                                </Text>
                            )}
                        </Stack>

                        <Stack
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            {showSearch ? (
                                <></>
                            ) : (
                                <SearchRoundedIcon
                                    sx={{
                                        width: "24px",
                                        height: "24px",
                                        cursor: "pointer",
                                        color: "notBlack.main",
                                        marginRight: "8px",
                                    }}
                                    onClick={() => {
                                        setShowSearch(true);
                                    }}
                                />
                            )}

                            {!showJustPanel && (
                                <CloseIcon
                                    sx={{
                                        width: "24px",
                                        height: "24px",
                                        cursor: "pointer",
                                        color: "notBlack.main",
                                        marginRight: "8px",
                                    }}
                                    onClick={handleClose}
                                />
                            )}
                        </Stack>
                    </Stack>
                );
            case "HOME":
            default:
                return (
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            backgroundColor: "grey7.real",
                            width: "100%",
                            minHeight: "44px",

                            padding: "2px 0",

                            position: "sticky",
                            top: "0px",
                            zIndex: 3001,
                        }}
                    >
                        <Stack
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                            }}
                        >
                            <Stack
                                sx={{
                                    width: "96%",
                                }}
                            >
                                <CoolNewSearchBar
                                    setSearchTerm={setSearchTerm}
                                    searchTerm={searchTerm}
                                    onClose={() => {}}
                                    placeholderText={`${capitalizeFirstLetter(
                                        currentStreamerBlerpUser?.username,
                                    )} Sounds`}
                                />
                            </Stack>
                        </Stack>

                        {!showJustPanel && (
                            <CloseIcon
                                sx={{
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                    color: "notBlack.main",
                                    marginRight: "8px",
                                }}
                                onClick={handleClose}
                            />
                        )}
                    </Stack>
                );
        }
    };

    const renderTabPage = () => {
        if (
            !currentStreamerBlerpUser?.soundEmotesObject ||
            currentStreamerBlerpUser?.soundEmotesObject?.extensionDisabled
        ) {
            return (
                <Stack
                    sx={{
                        display: "flex",
                        width: "100%",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        width: EXTENSION_WIDTH_PX,
                        height: EXTENSION_HEIGHT_PX,
                        backgroundColor: "grey8.real",
                    }}
                >
                    <ExtensionDisabled />
                </Stack>
            );
        }

        switch (tabState) {
            case "HOME":
            case "FAVES":
            case "PROFILE":
                return (
                    <>
                        {(!!anchorEl || showJustPanel) && (
                            <>
                                <ExtensionRoot
                                    activeBlerp={activeBlerp}
                                    setActiveBlerp={setActiveBlerp}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    blerpSoundEmotesStreamer={
                                        currentStreamerBlerpUser?.soundEmotesObject
                                    }
                                    currentStreamerBlerpUser={
                                        currentStreamerBlerpUser
                                    }
                                    refetching={loading}
                                    showFavorites={tabState === "FAVES"}
                                    userSignedIn={signedInUser}
                                    setCurrencyGlobal={setCurrencyGlobal}
                                    currencyGlobalState={currencyGlobalState}
                                />
                            </>
                        )}
                    </>
                );

            case "DEFAULT":
                return <></>;
        }
    };

    const renderMainPage = () => {
        if (
            newKickUsername === "Creator Dashboard" ||
            newKickUsername === "Moderation Dashboard"
        ) {
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
                            height: "180px",

                            backgroundColor: "grey7.real",
                            borderRadius: "8px",

                            /* Inside auto layout */

                            flex: "none",
                            order: 1,
                            alignSelf: "stretch",
                            flexGrow: 0,
                            margin: "24px",
                        }}
                    >
                        <Text
                            sx={{
                                width: "260px",
                                fontFamily: "Odudo",
                                fontStyle: "normal",
                                fontWeight: 400,
                                fontSize: "14px",
                                lineHeight: "130%",

                                textAlign: "center",
                                letterSpacing: "0.1em",
                                color: "black.real",
                                marginBottom: "12px",
                            }}
                        >
                            Watch your stream from the Kick Viewer page to share
                            sounds
                        </Text>

                        <Text
                            sx={{
                                width: "260px",
                                fontFamily: "Odudo",
                                fontStyle: "normal",
                                fontWeight: 300,
                                fontSize: "12px",
                                lineHeight: "140%",

                                textAlign: "center",
                                letterSpacing: "0.1em",
                                color: "black.real",
                            }}
                        >
                            Tell your viewers to go look underneath chat on your
                            Kick page and find this white Blerpy button to share
                            sounds{" "}
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
                                    display: "inline-flex",

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
                                href={`${selectedProject.host}/soundboard-browser-extension?referralId=univeralpc`}
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
        }
        if (loading) {
            return <EllipsisLoader />;
        }

        switch (currentStreamerBlerpUser?.loggedInUserIsBlocked) {
            case true:
                return (
                    <StreamerBlocked
                        currentStreamerBlerpUser={currentStreamerBlerpUser}
                        refetchAll={refetch}
                    />
                );
            case false:
            default:
                return (
                    <Stack
                        sx={{
                            display: "flex",
                            width: "100%",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: EXTENSION_WIDTH_PX,
                            height: EXTENSION_HEIGHT_PX,
                            backgroundColor: "grey8.real",
                        }}
                    >
                        {renderBlerpNav()}

                        {!currentStreamerBlerpUser?.soundEmotesObject
                            ?.extensionDisabled &&
                            !hideStreamerPaused &&
                            !activeBlerp && (
                                <StreamerPaused
                                    currentStreamerBlerpUser={
                                        currentStreamerBlerpUser
                                    }
                                    handleClose={() => {
                                        setHideStreamerPaused(true);
                                    }}
                                />
                            )}

                        <CustomDrawer
                            containerSelector={".blerp-extension-container"}
                            open={tabState === "PROFILE"}
                            anchor='bottom'
                            onClose={() => {
                                handleTabChange(previousTabState || "HOME");
                            }}
                        >
                            <UserProfile
                                userSignedIn={signedInUser}
                                refetchAll={refetch}
                                currentStreamerBlerpUser={
                                    currentStreamerBlerpUser
                                }
                            />
                        </CustomDrawer>

                        {activeBlerp ? (
                            <BlerpModalScreen
                                currencyGlobalState={currencyGlobalState}
                                activeBlerp={activeBlerp}
                                setActiveBlerp={setActiveBlerp}
                                isOpen={activeBlerp?._id}
                                blerpStreamer={currentStreamerBlerpUser}
                                userSignedIn={signedInUser}
                                refetchAll={async () => {
                                    await refetch();
                                }}
                                activeSearchQuery={searchTerm}
                                beetBasket={
                                    (signedInUser &&
                                        signedInUser.userWallet &&
                                        signedInUser.userWallet) || {
                                        beetBalance: 0,
                                    }
                                }
                                pointsBasket={
                                    (currentStreamerBlerpUser &&
                                        currentStreamerBlerpUser.loggedInChannelPointBasket &&
                                        currentStreamerBlerpUser.loggedInChannelPointBasket) || {
                                        points: 0,
                                    }
                                }
                                volume={volume}
                                setVolume={setVolume}
                            />
                        ) : (
                            renderTabPage()
                        )}

                        {tabState !== "PROFILE" && (
                            <ExtensionFooter
                                setTabState={(tabState) => {
                                    handleTabChange(tabState);
                                    setShowSearch(false);
                                }}
                                tabState={tabState}
                                setCurrencyGlobal={setCurrencyGlobal}
                                currencyGlobalState={currencyGlobalState}
                                userSignedIn={signedInUser}
                                activeBlerp={activeBlerp}
                                currentStreamerBlerpUser={
                                    currentStreamerBlerpUser
                                }
                                volume={volume}
                                setVolume={setVolume}
                                isStreaming={isStreaming}
                                refetchAll={refetch}
                            />
                        )}
                    </Stack>
                );
        }
    };

    if (showJustPanel) {
        return (
            <Stack
                sx={{
                    padding: "0",
                    position: "relative",
                }}
            >
                {renderMainPage()}
            </Stack>
        );
    }

    return (
        <Stack
            sx={{
                padding: "0 3px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Tooltip
                componentsProps={{
                    tooltip: {
                        sx: {
                            backgroundColor:
                                themeMode === "light"
                                    ? "notBlack.override"
                                    : "white.override",
                            zIndex: 100000,
                            fontFamily: "Odudo",
                        },
                    },
                }}
                placement='top'
                title={
                    <>
                        <Text
                            sx={{
                                color:
                                    themeMode === "light"
                                        ? "white.override"
                                        : "notBlack.override",
                                fontWeight: "600",
                                fontSize: "16px",
                                fontFamily: "Odudo",
                            }}
                        >
                            Blerp Sounds
                        </Text>
                    </>
                }
            >
                <Button
                    onClick={handleClick}
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

                        backgroundColor:
                            themeMode === "light" ? "#E2E2E6" : "#35353B",

                        "&:hover": {
                            backgroundColor: "grey4.real",
                        },
                    }}
                >
                    <BlerpyIcon
                        sx={{
                            width: "21px",
                            fontSize: "24px",
                            color: open
                                ? "ibisRed.main"
                                : themeMode === "light"
                                ? "#000"
                                : "#fff",
                        }}
                    />
                </Button>
            </Tooltip>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                PaperProps={{
                    // None of this works
                    // onClick: (event) => event.stopPropagation(),
                    // onMouseDown: (event) => event.stopPropagation(),
                    sx: {
                        backgroundColor: "grey8.real",
                    },
                }}
                style={{ zIndex: 100000 }}
                // disableBackdropClick={true}
                // disableCloseOnEscape={true}
            >
                {renderMainPage()}
            </Popover>

            {isStreaming &&
                currentStreamerBlerpUser &&
                currentStreamerBlerpUser?.loggedInChannelPointBasket
                    ?.standardMS &&
                !currentStreamerBlerpUser.soundEmotesObject.extensionDisabled &&
                !currentStreamerBlerpUser.soundEmotesObject.extensionPaused &&
                !currentStreamerBlerpUser?.soundEmotesObject
                    ?.channelPointsDisabled && (
                    <ChannelPointsCollector
                        blerpStreamer={currentStreamerBlerpUser}
                        onTriggerSuccess={() => {}}
                        onTriggerFail={() => {}}
                        isStreaming={isStreaming}
                        intervalMs={
                            currentStreamerBlerpUser?.loggedInChannelPointBasket
                                ?.standardMS
                        }
                    />
                )}

            <BlerpModal setIsOpen={setIsOpen} isOpen={isOpen} />
        </Stack>
    );
};

export default HomeButton;

{
    /* 
            <BlerpModalShare
                activeBlerp={activeBlerp}
                setActiveBlerp={setActiveBlerp}
                isOpen={activeBlerp?._id}
                blerpStreamer={currentStreamerBlerpUser}
                userSignedIn={signedInUser}
                refetchAll={async () => {
                    await refetch();
                }}
                activeSearchQuery={searchTerm}
                beetBasket={
                    signedInUser &&
                    signedInUser.userWallet &&
                    signedInUser.userWallet
                }
                pointsBasket={
                    currentStreamerBlerpUser &&
                    currentStreamerBlerpUser.loggedInChannelPointBasket &&
                    currentStreamerBlerpUser.loggedInChannelPointBasket
                }
            /> */
}

{
    /* 
                    <Tabs
                        value={tabState}
                        onChange={(e, newValue) => {
                            setTabState(newValue);
                        }}
                        variant='fullWidth'
                        textColor='white'
                        indicatorColor='white'
                        TabIndicatorProps={{
                            children: (
                                <span className='MuiTabs-indicatorSpan' />
                            ),
                        }}
                        sx={{
                            position: "absolute",
                            bottom: "0px",
                            margin: "0 auto",
                            backgroundColor: "#000",
                            width: "100%",
                            height: "44px",
                            minHeight: "0px",
                            borderRadius: false ? "0px" : "0 0 0 0",

                            "& .MuiTabs-flexContainer": {
                                height: "44px",
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "notBlack.main",
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
                            //             backgroundColor: "white.main",
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
                                fontSize: "16px",
                                color:
                                    tabState === "HOME"
                                        ? "notBlack.main"
                                        : "rgba(255,255,255,0.5)",
                            }}
                        />

                        <Tab
                            value='FAVES'
                            label='Faves'
                            icon={
                                <FavoriteRoundedIcon
                                    sx={{
                                        margin: "0 6px 0 0 !important",
                                        fontSize: "18px",
                                        color:
                                            tabState === "FAVES"
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
                                fontSize: "16px",
                                color:
                                    tabState === "FAVES"
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
                    </Tabs> */
}
