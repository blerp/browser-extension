import React, { useState } from "react";
import { IconButton, Slider, Stack, Tooltip } from "@blerp/design";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

const VolumeBar = ({ volume, setVolume, filledColor, backgroundColor }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [preMuteVolume, setPreMuteVolume] = useState(volume);
    const [hover, setHover] = useState(false);

    const volumeIcon = () => {
        if (volume === 0) return <VolumeOffIcon sx={{ fontSize: "24px" }} />;
        if (volume < 0.5) return <VolumeDownIcon sx={{ fontSize: "24px" }} />;
        return <VolumeUpIcon sx={{ fontSize: "24px" }} />;
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(preMuteVolume);
        } else {
            setPreMuteVolume(volume);
            setVolume(0);
        }
        setIsMuted(!isMuted);
    };

    return (
        <Tooltip
            title='Preview Volume'
            arrow
            placement='top'
            componentsProps={{
                popper: {
                    sx: {
                        zIndex: 10000000,
                        backgroundColor: "black",
                    },
                },
                tooltip: {
                    sx: {
                        backgroundColor: "black",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "16px",
                    },
                },
            }}
        >
            <Stack
                direction='row'
                alignItems='center'
                spacing={1}
                sx={{ width: 75, height: 25 }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <IconButton
                    size='small'
                    onClick={toggleMute}
                    sx={{ padding: 0 }}
                >
                    {volumeIcon()}
                </IconButton>
                {hover && (
                    <Slider
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e, newValue) => setVolume(newValue)}
                        color='whiteOverride'
                        sx={{
                            width: 55,
                            height: 5,
                            borderRadius: 2.5,
                            padding: "0 4px",
                            "& .MuiSlider-rail": {
                                backgroundColor: backgroundColor || "lightgray",
                                height: 5,
                            },

                            "& .MuiSlider-thumb": {
                                width: 10,
                                height: 10,
                                color: filledColor || "white",
                            },
                            "& .MuiSlider-track": {
                                backgroundColor: filledColor || "white",
                            },
                        }}
                    />
                )}
            </Stack>
        </Tooltip>
    );
};

export default VolumeBar;
