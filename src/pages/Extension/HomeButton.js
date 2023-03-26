import React, { useState, useRef, useContext } from "react";

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

import ChannelPointsCollector from "./ChannelPointsCollector";

import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";
import StreamerBlocked from "./StreamerBlocked";
import UserProfile from "./UserProfile";

import CoolNewSearchBar from "./CoolNewSearchBar";

import StreamerPaused from "./StreamerPaused";
import EllipsisLoader from "./EllipsisLoader";
import { EXTENSION_WIDTH_PX, EXTENSION_HEIGHT_PX } from "../../constants";
import CustomDrawer from "./CustomDrawer";
import TruncatedText from "./TruncatedText";

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
    platform,
    optionalButtonText,
    isStreaming,
    themeMode, // light/dark
}) => {
    const { loading, data, error, refetch } = useQuery(
        VIEWER_BROWSER_EXTENSION,
        {
            variables: {
                userId: userId,
                youtubeChannelId:
                    platform === "YOUTUBE" ? youtubeChannelId : null,
                twitchUsername: platform === "TWITCH" ? twitchUsername : null,
            },
            errorPolicy: "all",
        },
    );

    const [searchTerm, setSearchTerm] = useState("");

    const [volume, setVolume] = useState(0.8);

    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState("");
    const [tabState, setTabState] = useState("HOME");
    const [previousTabState, setPreviousTabState] = useState("HOME");

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

    const snackbarContext = useContext(SnackbarContext);

    const handleClick = async (event) => {
        setAnchorEl(event.currentTarget);
        await refetch();
    };

    const handleClose = () => {
        setSearchTerm("");
        setAnchorEl(null);
        setHideStreamerPaused(false);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const signedInUser = data?.browserExtension?.userSignedIn;
    const currentStreamerBlerpUser =
        data?.browserExtension?.currentStreamerPage?.streamerBlerpUser;

    const renderBlerpBasket = () => {
        if (!signedInUser) {
            return (
                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "4px",
                    }}
                >
                    <Button
                        href={`${
                            selectedProject.host
                        }/login?returnTo=${`/soundboard-browser-extension`}`}
                        target='_blank'
                        rel='noreferrer'
                        variant='contained'
                        sx={{ margin: "8px 12px 8px 16px" }}
                    >
                        Login to Share Sounds
                    </Button>
                </Stack>
            );
        }

        return (
            <>
                <Stack
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                    }}
                >
                    <Stack
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            width: "100%",
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
                            <ChannelPointsIcon
                                sx={{
                                    width: "32px",
                                    height: "32px",
                                    margin: "4px",
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
                                    {(currentStreamerBlerpUser &&
                                        currentStreamerBlerpUser.loggedInChannelPointBasket &&
                                        currentStreamerBlerpUser
                                            .loggedInChannelPointBasket
                                            .points) ||
                                        0}
                                </Text>

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
                                      currentStreamerBlerpUser
                                          .loggedInChannelPointBasket
                                          ?.showManualButton) ? (
                                    <Text
                                        fontColor='white'
                                        fontWeight='light'
                                        fontSize='12px'
                                        sx={{
                                            margin: 0,
                                            cursor: "pointer",

                                            "&:hover": {
                                                color: "seafoam.main",
                                            },
                                            textTransform: "capitalize",
                                        }}
                                        onClick={async () => {
                                            try {
                                                const { data } =
                                                    await earnSnootPoints({
                                                        variables: {
                                                            channelOwnerId:
                                                                currentStreamerBlerpUser?._id,
                                                            manualEarn: true,
                                                        },
                                                    });

                                                const pointsIncremented =
                                                    data?.browserExtension
                                                        ?.earningSnoots
                                                        ?.pointsIncremented;

                                                setPointsAdded(
                                                    pointsIncremented,
                                                );
                                                const timeoutId = setTimeout(
                                                    () => {
                                                        setPointsAdded(false);
                                                    },
                                                    3000,
                                                );

                                                snackbarContext.triggerSnackbar(
                                                    {
                                                        message:
                                                            "Points Collected!",
                                                        severity: "success",
                                                        transitionType: "fade",
                                                        position: {
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        },
                                                    },
                                                );
                                            } catch (err) {
                                                snackbarContext.triggerSnackbar(
                                                    {
                                                        message:
                                                            "Failed to Collect Points",
                                                        severity: "error",
                                                        transitionType: "fade",
                                                        position: {
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        },
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        Collect{" "}
                                        {/* {currentStreamerBlerpUser?.username}{" "} */}
                                        Points
                                    </Text>
                                ) : (
                                    <></>
                                )}
                            </Stack>
                        </Stack>

                        <Stack
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "space-between",
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
                                        width: "40px",
                                        margin: "0 2px",
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
                                        sx={{
                                            margin: 0,
                                            cursor: "pointer",
                                            "&:hover": {
                                                color: "seafoam.main",
                                            },
                                        }}
                                        onClick={() => {
                                            window.open(
                                                `${selectedProject.host}/tradeBeets`,
                                                "_blank",
                                            );
                                        }}
                                    >
                                        More Beets
                                    </Text>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </>
        );
    };

    const renderBlerpNav = () => {
        if (activeBlerp) {
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
                        zIndex: 30,
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
                            onClick={() => {
                                setActiveBlerp(null);
                            }}
                        />

                        <Tooltip
                            title={
                                <Text
                                    sx={{
                                        color: "white.override",
                                        fontWeight: "600",
                                    }}
                                >
                                    {activeBlerp?.title}
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
                                    text={activeBlerp?.title}
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
                                sx={{ marginRight: 1, color: "white" }}
                            />
                            <span style={{ color: "white" }}>
                                View on Blerp.com
                            </span>
                        </MenuItem>
                        <MenuItem onClick={handleCopyLink}>
                            <ContentCopyIcon
                                sx={{ marginRight: 1, color: "white" }}
                            />
                            <span style={{ color: "white" }}>{copyText}</span>
                        </MenuItem>
                    </Menu>

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
                            zIndex: 30,
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
                                onClick={() => {
                                    handleTabChange("HOME");
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
                                    sx={{ marginRight: 1, color: "white" }}
                                />
                                <span style={{ color: "white" }}>
                                    Profile on Blerp.com
                                </span>
                            </MenuItem>

                            <MenuItem onClick={handleCopyUserLink}>
                                <ContentCopyIcon
                                    sx={{ marginRight: 1, color: "white" }}
                                />
                                <span style={{ color: "white" }}>
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
                            zIndex: 30,
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
                            zIndex: 30,
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
                    </Stack>
                );
        }
    };

    const renderOnlineBanner = () => {
        if (!currentStreamerBlerpUser) {
            return <></>;
        }

        return (
            <Stack
                className='blerp-extension-container'
                direction='row'
                sx={{
                    backgroundColor: currentStreamerBlerpUser?.browserOnline
                        ? "seafoam.main"
                        : "ibisRed.main",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "24px",
                    margin: "6px 0",
                    cursor: "pointer",
                }}
                onClick={async () => {
                    await refetch();
                }}
            >
                <Text
                    sx={{
                        fontSize: "10px",
                        fontWeight: "300",
                        color: "notBlack.override",
                    }}
                >
                    Sharing to{" "}
                    <Text
                        sx={{
                            color: "notBlack.override",
                            fontSize: "10px",
                            cursor: "pointer",
                            fontWeight: "600",
                            display: "inline",

                            "&:hover": {
                                color: "buntingBlue.main",
                            },
                        }}
                        onClick={() => {
                            window.open(
                                `${selectedProject.host}/sound-emotes/${currentStreamerBlerpUser?._id}`,
                                "_blank",
                            );
                        }}
                    >
                        {currentStreamerBlerpUser?.username}
                    </Text>{" "}
                    stream!
                </Text>

                {currentStreamerBlerpUser?.browserOnline ? (
                    <Text
                        sx={{
                            fontSize: "10px",
                            fontWeight: "300",
                            color: "notBlack.override",
                            margin: "2px",
                        }}
                    >
                        - Online
                    </Text>
                ) : (
                    <Text
                        sx={{
                            fontSize: "10px",
                            fontWeight: "300",
                            color: "notBlack.override",
                            margin: "2px",
                        }}
                    >
                        - Offline
                    </Text>
                )}

                {/* 
            <Text
                sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    "&:hover": { opacity: 0.7 },
                    fontSize: "10px",
                    color: "notBlack.override",
                }}
                onClick={() => {
                    window.open(
                        `${selectedProject.host}/sound-emotes/${currentStreamerBlerpUser?._id}`,
                        "_blank",
                    );
                }}
            >
                or share sounds here
            </Text> */}
            </Stack>
        );
    };

    const renderTabPage = () => {
        switch (tabState) {
            case "HOME":
            case "FAVES":
            case "PROFILE":
                return (
                    <>
                        {!!anchorEl && (
                            <>
                                <CustomDrawer
                                    containerSelector={
                                        ".blerp-extension-container"
                                    }
                                    open={tabState === "PROFILE"}
                                    anchor='bottom'
                                    onClose={() => {
                                        handleTabChange(
                                            previousTabState || "HOME",
                                        );
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
                            backgroundColor: "grey8.real",
                            minWidth: EXTENSION_WIDTH_PX,
                            minHeight: EXTENSION_HEIGHT_PX,
                            height: "100%",
                        }}
                    >
                        {renderBlerpNav()}

                        {/* {!hideStreamerPaused && (
                            <StreamerPaused
                                currentStreamerBlerpUser={
                                    currentStreamerBlerpUser
                                }
                                handleClose={() => {
                                    setHideStreamerPaused(true);
                                }}
                            />
                        )} */}

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
                            currentStreamerBlerpUser={currentStreamerBlerpUser}
                            volume={volume}
                            setVolume={setVolume}
                            isStreaming={isStreaming}
                        />
                    </Stack>
                );
        }
    };

    return (
        <Stack
            sx={{
                padding: "4px",
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
                        margin: "0px",
                        padding: "4px",
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
                    }}
                >
                    <BlerpyIcon
                        sx={{
                            width: "21px",
                            marginRight: "2px",
                            fontSize: "2em",
                            color: themeMode === "light" ? "#000" : "#fff",
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
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                style={{ zIndex: 100000 }}
            >
                {renderMainPage()}
            </Popover>

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
