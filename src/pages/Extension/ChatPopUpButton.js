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
} from "@blerp/design";

import selectedProject from "../../projectConfig";
import BlerpModal from "./BlerpModal";
import BlerpModalShare from "./BlerpModalShare";

import CloseIcon from "@mui/icons-material/Close";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

import ExtensionRoot from "./ExtensionRoot";

import ChannelPointsCollector from "./ChannelPointsCollector";

import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {
    BLERP_USER_SELF,
    BLERP_USER_STREAMER,
    EARN_SNOOT_POINTS,
} from "../../mainGraphQl";
import StreamerNeedsToSetup from "./StreamerNeedsToSetup";
import UserProfile from "./UserProfile";

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

const ChatPopUpButton = ({
    userId,
    youtubeChannelId,
    twitchUsername,
    platform,
    optionalButtonText,
    isStreaming,
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

    const [isOpen, setIsOpen] = useState(false);
    const [tabState, setTabState] = useState("HOME");
    const [activeBlerp, setActiveBlerp] = useState(null);

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
                    minHeight: "40px",
                    padding: "2px 0",
                }}
            >
                {renderBlerpBasket()}
                <CloseIcon
                    sx={{
                        position: "absolute",
                        width: "20px",
                        height: "20px",
                        top: "12px",
                        right: "12px",
                        cursor: "pointer",
                        color: "notBlack.main",
                    }}
                    onClick={handleClose}
                />
            </Stack>
        );
    };

    const renderTabPage = () => {
        // if (!signedInUser) {
        //     return <LoginScreen refetchAll={refetch} />;
        // }

        switch (tabState) {
            case "HOME":
                return (
                    <>
                        {renderBlerpNav()}

                        {currentStreamerBlerpUser && (
                            <Stack
                                direction='row'
                                sx={{
                                    backgroundColor:
                                        currentStreamerBlerpUser?.browserOnline
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
                        )}

                        {!!anchorEl && (
                            <ExtensionRoot
                                activeBlerp={activeBlerp}
                                setActiveBlerp={setActiveBlerp}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                blerpSoundEmotesStreamer={
                                    currentStreamerBlerpUser?.soundEmotesObject
                                }
                                refetching={loading}
                                showSaved={false}
                            />
                        )}
                    </>
                );

            case "FAVES":
                return (
                    <>
                        {renderBlerpNav()}

                        {currentStreamerBlerpUser && (
                            <Stack
                                direction='row'
                                sx={{
                                    backgroundColor:
                                        currentStreamerBlerpUser?.browserOnline
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
                            </Stack>
                        )}

                        {!!anchorEl && (
                            <ExtensionRoot
                                activeBlerp={activeBlerp}
                                setActiveBlerp={setActiveBlerp}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                blerpSoundEmotesStreamer={
                                    currentStreamerBlerpUser?.soundEmotesObject
                                }
                                refetching={loading}
                                showSaved={true}
                            />
                        )}
                    </>
                );

            case "SETTINGS":
                return (
                    <>
                        {renderBlerpNav()}

                        {/* <Button
                            variant='contained'
                            color='starling'
                            sx={{
                                padding: "2px 8px",
                                cursor: "pointer",
                                fontSize: "1em",
                                width: "160px",
                                marginTop: "12px",
                            }}
                            onClick={() => {
                                setIsOpen(true);
                            }}
                        >
                            <ChannelPointsIcon
                                sx={{
                                    width: "24px",
                                    height: "24px",
                                    padding: "4px",
                                }}
                            />
                            Modal Open
                        </Button> */}

                        <Stack
                            sx={{
                                overflowY: "scroll",
                            }}
                        >
                            <UserProfile
                                userSignedIn={signedInUser}
                                refetchAll={refetch}
                            />
                        </Stack>

                        {/* <StreamerNeedsToSetup /> */}
                    </>
                );
            case "DEFAULT":
                return <></>;
        }
    };

    return (
        <Stack
            sx={{
                cursor: "pointer",
                padding: "4px",
            }}
        >
            <Button
                onClick={handleClick}
                target='_blank'
                rel='noreferrer'
                variant='contained'
                sx={{
                    margin: "0px",
                    padding: "2px 8px",
                    cursor: "pointer",
                    width: "72px",
                    fontSize: "1em",
                }}
            >
                <BlerpyIcon sx={{ marginRight: "2px", fontSize: "2em" }} />
                {optionalButtonText ? optionalButtonText : "Blerp"}
            </Button>

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
                <Stack
                    sx={{
                        display: "flex",
                        width: "100%",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        backgroundColor: "grey7.real",
                        minWidth: "320px",
                        minHeight: "320px",
                        height: "100%",
                    }}
                >
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
                    {renderTabPage()}

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
                            height: "40px",
                            minHeight: "0px",
                            borderRadius: false ? "0px" : "0 0 0 0",

                            "& .MuiTabs-flexContainer": {
                                height: "40px",
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

                        {/* {!showSearchBar && (
                    <ImageOverview
                        onClick={() => {
                            setShowSearchBar(false);
                            setShowViewerSideBar(!showViewerSideBar);
                        }}
                    >
                        <PendingSuggestionsDot
                            style={{
                                top: "3px",
                                left: "",
                                right: "3px",
                                width: "7px",
                                height: "7px",
                                backgroundColor: "ibisRed.main",
                            }}
                        />
                        <DragHandleIcon
                            sx={{
                                fontSize: "32px",
                                padding: "4px",
                                cursor: "pointer",
                                color: showSearchBar
                                    ? "white.override"
                                    : "notBlack.main",
                                "&:hover": { color: "grey4.main" },
                            }}
                        />
                    </ImageOverview>
                )} */}
                    </Tabs>
                </Stack>
            </Popover>

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
            />

            <BlerpModal setIsOpen={setIsOpen} isOpen={isOpen} />
        </Stack>
    );
};

export default ChatPopUpButton;
