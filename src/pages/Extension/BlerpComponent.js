import React, { useState, useRef, useEffect, useContext } from "react";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Dropdown,
    Select,
    MenuItem,
    SnackbarContext,
} from "@blerp/design";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";

const SAVE_BITE = gql`
    mutation webSaveBite($biteId: MongoID!, $data: JSON) {
        web {
            saveBite(biteId: $biteId, analytics: { data: $data }) {
                _id
                bite {
                    _id
                    saved
                }
            }
        }
    }
`;

const UNSAVE_BITE = gql`
    mutation webSaveBite($biteId: MongoID!, $data: JSON) {
        web {
            unsaveBite(biteId: $biteId, analytics: { data: $data }) {
                _id
                bite {
                    _id
                    saved
                }
            }
        }
    }
`;

const BiteComponent = ({
    bite,
    activeBlerp,
    setActiveBlerp,
    currencyGlobalState,
    userSignedIn,
    searchQuery,
    showSavedIcon = true,
    marginBite,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredPoints, setIsHoveredPoints] = useState(false);
    const [isHoveredBeets, setIsHoveredBeets] = useState(false);

    const [savingBlerp, setIsBlerpSaving] = useState(false);
    const [localCurrencyType, setLocalCurrencyType] = useState(
        currencyGlobalState || "BEETS",
    );

    const snackbarContext = useContext(SnackbarContext);
    const [saveBlerp] = useMutation(SAVE_BITE);
    const [unsaveBlerp] = useMutation(UNSAVE_BITE);

    // useEffect(() => {
    //     if (currencyGlobalState) {
    //         setLocalCurrencyType(currencyGlobalState);
    //     }
    // }, []);

    if (!bite) {
        return <></>;
    }

    const handleSave = async (bite) => {
        try {
            setIsBlerpSaving(true);
            saveBlerp({
                variables: {
                    biteId: bite?._id,
                    data: {
                        searchQuery,
                    },
                },
            })
                .then((res) => {
                    setIsBlerpSaving(false);

                    if (res.data.web.saveBite?.bite?.saved) {
                        snackbarContext.triggerSnackbar({
                            message: "Saved!",
                            severity: "success",
                            position: {
                                vertical: "bottom",
                                horizontal: "right",
                            },
                        });
                    }
                })
                .catch((err) => {
                    setIsBlerpSaving(false);
                });
        } catch (err) {
            console.log(err);
        }
    };

    const handleUnsave = async (bite) => {
        try {
            setIsBlerpSaving(true);

            await unsaveBlerp({
                variables: {
                    biteId: bite?._id,
                    data: {
                        searchQuery,
                    },
                },
            }).then((res) => {
                setIsBlerpSaving(false);

                snackbarContext
                    .triggerSnackbar({
                        message: "Removed from Saved!",
                        severity: "success",
                        position: {
                            vertical: "bottom",
                            horizontal: "right",
                        },
                    })
                    .catch((err) => {
                        setIsBlerpSaving(false);
                    });
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Stack
            className='outer-component'
            key={bite?._id}
            sx={{
                width: "93px",
                height: "127px",
                position: "relative",
                borderRadius: "8px",
                margin: marginBite || "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                // borderColor: "seafoam.main",
                // borderStyle: "solid",
                // borderWidth: activeBlerp?._id === bite?._id ? "8px" : "0px",

                "&:hover": {
                    opacity: 1,
                },
                "&:hover .MuiSvgIcon-root": {
                    visibility: "visible",
                    opacity: 1,
                },
            }}
        >
            {showSavedIcon &&
                (savingBlerp ? (
                    <FavoriteRoundedIcon
                        sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            color: "grey4.real",
                            borderRadius: "8px",
                            zIndex: 2,
                            "&:hover": { opacity: 0.7 },
                            visibility: bite?.saved ? "visible" : "hidden",
                            cursor: "pointer",

                            width: "24px",
                            height: "24px",

                            filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                        }}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!userSignedIn) {
                                snackbarContext.triggerSnackbar({
                                    message: "You must be logged in!",
                                    severity: "error",
                                    position: {
                                        vertical: "bottom",
                                        horizontal: "right",
                                    },
                                });
                                return;
                            }

                            if (bite?.saved) {
                                await handleUnsave(bite);
                            } else {
                                await handleSave(bite);
                            }
                        }}
                    />
                ) : bite?.saved ? (
                    <FavoriteRoundedIcon
                        sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            borderRadius: "8px",
                            zIndex: 2,
                            opacity: savingBlerp ? 0.5 : 1,
                            "&:hover": { opacity: 0.7 },
                            visibility: bite?.saved ? "visible" : "hidden",
                            cursor: "pointer",

                            width: "24px",
                            height: "24px",

                            filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                        }}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!userSignedIn) {
                                snackbarContext.triggerSnackbar({
                                    message: "You must be logged in!",
                                    severity: "error",
                                    position: {
                                        vertical: "bottom",
                                        horizontal: "right",
                                    },
                                });
                                return;
                            }

                            if (bite?.saved) {
                                await handleUnsave(bite);
                            } else {
                                await handleSave(bite);
                            }
                        }}
                    />
                ) : (
                    <FavoriteBorderRoundedIcon
                        sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            borderRadius: "8px",
                            zIndex: 2,
                            opacity: savingBlerp ? 0.5 : 1,
                            "&:hover": { opacity: 0.7 },
                            visibility: bite?.saved ? "visible" : "hidden",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",

                            filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.6))",
                        }}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (!userSignedIn) {
                                return;
                            }

                            if (bite?.saved) {
                                await handleUnsave(bite);
                            } else {
                                await handleSave(bite);
                            }
                        }}
                    />
                ))}

            {bite?.image?.original?.url ? (
                <Stack
                    sx={{
                        width: "93px",
                        height: "93px",
                        borderRadius: "12px 12px 0 0",
                        position: "relative",
                    }}
                    onClick={() => {
                        setActiveBlerp(bite);
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            borderRadius: "12px 12px 0 0",
                            position: "absolute",
                            top: 0,
                            left: 0,
                        }}
                    ></div>
                    <img
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "12px 12px 0 0",
                            position: "absolute",
                            top: 0,
                            left: 0,
                        }}
                        src={bite?.image?.original?.url}
                    />
                </Stack>
            ) : (
                <Stack
                    sx={{
                        width: "93px",
                        height: "93px",
                        borderRadius: "12px 12px 0 0",
                        position: "relative",
                    }}
                ></Stack>
            )}

            {true ? (
                <Stack
                    direction='row'
                    sx={{
                        borderRadius: "4px",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        bottom: 22,
                        alignItems: "center",
                        overflow: "hidden",
                        justifyContent: "center",
                        zIndex: 3,
                    }}
                >
                    <Stack
                        direction='row'
                        sx={{
                            backgroundColor: "#B43757",
                            height: "24px",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() => {
                            // setLocalCurrencyType("BEETS");
                        }}
                        onMouseEnter={() => setIsHoveredBeets(true)}
                        onMouseLeave={() => setIsHoveredBeets(false)}
                    >
                        <img
                            src='https://cdn.blerp.com/design/browser-extension/beet.svg'
                            style={{
                                width: "16px",
                                height: "16px",
                                paddingRight: "4px",
                                paddingLeft: "2px",
                            }}
                        />

                        {(currencyGlobalState === "BEETS" || isHoveredBeets) &&
                            !isHoveredPoints && (
                                <Text
                                    sx={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: "12px",
                                        paddingRight: "4px",
                                        transition: "all 0.2s ease-in-out",
                                    }}
                                >
                                    {bite?.soundEmotesContext?.beetAmount}
                                </Text>
                            )}
                    </Stack>

                    <Stack
                        direction='row'
                        sx={{
                            backgroundColor: "grey6.real",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "24px",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() => {}}
                        onMouseEnter={() => setIsHoveredPoints(true)}
                        onMouseLeave={() => setIsHoveredPoints(false)}
                    >
                        <img
                            src='https://cdn.blerp.com/design/browser-extension/cp_sub.svg'
                            style={{
                                width: "16px",
                                height: "16px",
                                paddingLeft: "4px",
                                paddingRight: "2px",
                            }}
                        />

                        {(currencyGlobalState === "POINTS" ||
                            isHoveredPoints) &&
                            !isHoveredBeets && (
                                <Text
                                    sx={{
                                        color: "white",
                                        textAlign: "center",
                                        fontSize: "12px",
                                        padding: "0 4px",
                                        transition: "all 0.2s ease-in-out",
                                    }}
                                >
                                    {bite?.soundEmotesContext
                                        ?.channelPointsAmount || 0}
                                </Text>
                            )}
                    </Stack>
                </Stack>
            ) : (
                <></>
            )}

            <Stack
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    paddingTop: "4px",
                    height: "32px",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    backgroundColor: "grey7.real",

                    // add border radius to bottom two corners
                    borderRadius: "0 0 12px 12px",
                }}
                onClick={() => {
                    setActiveBlerp(bite);
                }}
            >
                <Text
                    sx={{
                        color: "white",
                        textAlign: "left",
                        fontSize: "12px",
                        textOverflow: "ellipsis",
                        lineHeight: "38px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        transition: "transform 3s linear",
                        transform: isHovered
                            ? "translateX(-100%)"
                            : "translateX(0%)",
                        padding: "0 6px",
                        fontWeight: "300",
                    }}
                >
                    {bite?.title}
                </Text>
            </Stack>
        </Stack>
    );
};

export default BiteComponent;
