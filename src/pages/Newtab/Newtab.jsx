import React, { useState } from "react";

import BlerpModal from "../Extension/BlerpModal";

import logo from "../../assets/img/logo.svg";
import "./Newtab.css";
import "./Newtab.scss";
import { Button } from "@blerp/design";
import HomeButton from "../Extension/HomeButton";
import { getStreamerInfo } from "../../globalCache";

const Newtab = () => {
    const [showPopup, setShowPopup] = useState();

    const [currentPlatform, setCurrentPlatform] = useState(null);
    const [youtubeChannelId, setYoutubeChannelId] = useState(null);
    const [twitchUsername, setTwitchUsername] = useState(null);

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

    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/pages/Newtab/Newtab.js</code> and save to
                    reload.
                </p>

                <HomeButton
                    userId={null}
                    youtubeChannelId={youtubeChannelId}
                    twitchUsername={twitchUsername}
                    platform={currentPlatform}
                    optionalButtonText='Share'
                    isStreaming={true}
                    showJustPanel={false}
                />

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
                <BlerpModal setIsOpen={setShowPopup} isOpen={showPopup} />
                {/* <h6>The color of this paragraph is defined using SASS!!!!</h6> */}
            </header>
        </div>
    );
};

export default Newtab;
