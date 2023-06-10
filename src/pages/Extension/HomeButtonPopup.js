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
import BlerpModalScreenPopup from "./BlerpModalScreenPopup";

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
import { EXTENSION_WIDTH_MAX, EXTENSION_HEIGHT_PX } from "../../constants";
import CustomDrawer from "./CustomDrawer";
import TruncatedText from "./TruncatedText";
import ExtensionDisabled from "./ExtensionDisabled";
import { useApollo } from "../../networking/apolloClient";

const VIEWER_BROWSER_EXTENSION = gql`
    ${BLERP_USER_STREAMER}
    ${BLERP_USER_SELF}
    query viewerBrowserExtension(
        $userId: MongoID
        $youtubeChannelId: String
        $twitchUsername: String
    ) {
        browserExtension {
            currentStreamerPage(
                userId: $userId
                youtubeChannelId: $youtubeChannelId
                twitchUsername: $twitchUsername
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
    trovoUsername,
    platform,
    optionalButtonText,
    isStreaming,
    themeMode, // light/dark
    showJustPanel,
}) => {
    const { loading, data, error, refetch } = useQuery(
        VIEWER_BROWSER_EXTENSION,
        {
            variables: {
                userId: userId,
                youtubeChannelId:
                    platform === "YOUTUBE" ? youtubeChannelId : null,
                twitchUsername: platform === "TWITCH" ? twitchUsername : null,
                kickUsername: platform === "KICK" ? kickUsername : null,
                trovoUsername: platform === "TROVO" ? trovoUsername : null,
            },
            errorPolicy: "all",
            awaitRefetchQueries: true, // Wait for refetches before resetting the store
        },
    );

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

    const handleClick = async (event) => {
        setAnchorEl(event.currentTarget);
        await refetch();
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
        // if (
        //     !currentStreamerBlerpUser?.soundEmotesObject ||
        //     currentStreamerBlerpUser?.soundEmotesObject?.extensionDisabled
        // ) {
        //     return (
        //         <Stack
        //             sx={{
        //                 display: "flex",
        //                 width: "100%",
        //                 flexDirection: "column",
        //                 alignItems: "center",
        //                 justifyContent: "flex-start",
        //                 width: EXTENSION_WIDTH_MAX,
        //                 height: EXTENSION_HEIGHT_PX,
        //                 backgroundColor: "grey8.real",
        //             }}
        //         >
        //             <ExtensionDisabled />
        //         </Stack>
        //     );
        // }

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
                                    isPopup={true}
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
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: EXTENSION_WIDTH_MAX,
                            height: "100%",
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

                        {/* <CustomDrawer
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
                        </CustomDrawer> */}

                        {activeBlerp ? (
                            <BlerpModalScreenPopup
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

                        {/* {tabState !== "PROFILE" && (
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
                        )} */}
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

            <BlerpModal setIsOpen={setIsOpen} isOpen={isOpen} />
        </Stack>
    );
};

export default HomeButton;
