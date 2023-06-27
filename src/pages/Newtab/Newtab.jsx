import React, { useState } from "react";

import BlerpModal from "../Extension/BlerpModal";

import logo from "../../assets/img/logo.svg";
import "./Newtab.css";
import "./Newtab.scss";
import { Button, Stack, Text, Input } from "@blerp/design";
import HomeButton from "../Extension/HomeButton";
import { getStreamerInfo } from "../../globalCache";
import LoginScreen from "../Popup/LoginScreen";

const InputComponent = (props) => {
    return (
        <Input
            color={props?.errorText ? "ibisRed" : "whiteOverride"}
            placeHolderText={props.placeHolderText}
            value={props.value}
            InputProps={{
                endAdornment: props.endAdornament,
                sx: {
                    "& .MuiInputLabel-root.Mui-focused": {
                        borderColor: "grey3.real",
                    },

                    color: "whiteOverride.main",

                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "grey3.real",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "currentColor",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "currentColor",
                    },
                },
            }}
            sx={{
                margin: "12px 0",
                // marginRight: "12px",
                // width: "80%",
                maxWidth: "320px",

                "& input": {
                    color: "whiteOverride.main",
                },

                "& input[type=number]": {
                    "-moz-appearance": "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button": {
                    "-webkit-appearance": "none",
                    margin: 0,
                },
                "& input[type=number]::-webkit-inner-spin-button": {
                    "-webkit-appearance": "none",
                    margin: 0,
                },
            }}
            {...props}
        />
    );
};

const Newtab = () => {
    const [showPopup, setShowPopup] = useState();
    const [currentPlatform, setCurrentPlatform] = useState(
        localStorage.getItem("tabPlatform") || "TWITCH",
    );
    const [youtubeChannelId, setYoutubeChannelId] = useState(
        localStorage.getItem("tabUsername") || "",
    );
    const [twitchUsername, setTwitchUsername] = useState(
        localStorage.getItem("tabUsername") || "",
    );
    const [kickUsername, setKickUsername] = useState(
        localStorage.getItem("tabUsername") || "",
    );
    const [trovoUsername, setTrovoUsername] = useState(
        localStorage.getItem("tabUsername") || "",
    );

    React.useEffect(() => {
        getStreamerInfo()
            .then((result) => {
                if (result.currentPlatform)
                    setCurrentPlatform(result.currentPlatform);
                if (result.youtubeChannelId)
                    setYoutubeChannelId(result.youtubeChannelId);
                if (result.twitchUsername)
                    setTwitchUsername(result.twitchUsername);
                if (result.kickUsername) setKickUsername(result.kickUsername);

                if (result.trovoUsername)
                    setTrovoUsername(result.trovoUsername);
            })
            .catch((err) => {
                console.log("ERROR_GETTING_INFO", err);
            });
    }, []);

    const handlePlatformChange = async (e) => {
        const platform = e.target.value && e.target.value.toUpperCase();

        setCurrentPlatform(platform);
        // setYoutubeChannelId(null);
        // setTwitchUsername(null);
        // setKickUsername(null);
        // setTrovoUsername(null);

        localStorage.setItem("tabPlatform", platform);
    };

    const handleChannelUsernameChange = async (e) => {
        const username = e.target.value;

        switch (currentPlatform) {
            case "YOUTUBE":
                setYoutubeChannelId(username);
                break;
            case "TWITCH":
                setTwitchUsername(username);
                break;
            case "KICK":
                setKickUsername(username);
                break;
            case "TROVO":
                setTrovoUsername(username);
                break;
            default:
                break;
        }
        localStorage.setItem("tabUsername", username);
    };

    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />

                <p style={{ fontSize: "12px" }}>
                    Edit <code>src/pages/Newtab/Newtab.js</code> and save to
                    reload.
                </p>

                <Stack
                    direction='column'
                    sx={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Text
                        sx={{
                            width: "260px",
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
                        Channel Picker
                    </Text>

                    <InputComponent
                        variant='outlined'
                        label='Platform'
                        value={currentPlatform || ""}
                        onChange={handlePlatformChange}
                        placeholder='Set Platform (All Caps)'
                    />

                    {currentPlatform && (
                        <InputComponent
                            variant='outlined'
                            label='Channel Username'
                            value={
                                currentPlatform === "YOUTUBE"
                                    ? youtubeChannelId || ""
                                    : currentPlatform === "TWITCH"
                                    ? twitchUsername || ""
                                    : currentPlatform === "KICK"
                                    ? kickUsername || ""
                                    : currentPlatform === "TROVO"
                                    ? trovoUsername || ""
                                    : ""
                            }
                            onChange={handleChannelUsernameChange}
                            placeholder='Channel Username'
                        />
                    )}
                </Stack>

                <HomeButton
                    userId={null}
                    kickUsername={kickUsername}
                    trovoUsername={trovoUsername}
                    youtubeChannelId={youtubeChannelId}
                    twitchUsername={twitchUsername}
                    platform={currentPlatform}
                    optionalButtonText='Share'
                    isStreaming={true}
                    showJustPanel={false}
                    forceHideInputProps={true}
                />

                <Button
                    target='_blank'
                    rel='noreferrer'
                    variant='contained'
                    sx={{ margin: "24px 12px 8px 16px" }}
                    onClick={() => {
                        setShowPopup(!showPopup);
                    }}
                >
                    {showPopup ? "Hide Login" : "Show Login"}
                </Button>

                {showPopup && (
                    <LoginScreen
                        showOnlyInput
                        onFinishedLoggingIn={() => {
                            setShowPopup(false);
                        }}
                    />
                )}

                {/* <BlerpModal setIsOpen={setShowPopup} isOpen={showPopup} /> */}
                {/* <h6>The color of this paragraph is defined using SASS!!!!</h6> */}
            </header>
        </div>
    );
};

export default Newtab;
