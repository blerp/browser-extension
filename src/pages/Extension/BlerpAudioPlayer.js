import React, { useState, useRef, useEffect } from "react";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
const AudioPlayer = ({
    imageUrl,
    audioUrl,
    size = "100%",
    borderRadius = "12px",
    barColor = "#00b894",
    volume = 1,
}) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isPlaying) {
            const timer = setInterval(() => {
                const duration = audioRef.current.duration;
                const currentTime = audioRef.current.currentTime;
                const progressPercent = Math.round(
                    (currentTime / duration) * 100,
                );
                setProgress(progressPercent);
            }, 100);

            return () => clearInterval(timer);
        } else {
            setProgress(100);
        }
    }, [isPlaying]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        audioRef.current.volume = volume;
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
    };

    return (
        <div style={{ position: "relative", width: size, maxWidth: "320px" }}>
            {imageUrl ? (
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "100%",
                        background: `url(${imageUrl}) center / cover`,
                        borderRadius,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderRadius,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                        onClick={togglePlay}
                    >
                        {!isPlaying ? (
                            <PlayArrowRoundedIcon
                                sx={{ fontSize: "64px", color: "white" }}
                            />
                        ) : (
                            <PauseRoundedIcon
                                sx={{ fontSize: "64px", color: "white" }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        width: "100%",
                        paddingTop: "100%",
                        background: "#ccc",
                        borderRadius,
                    }}
                    onClick={togglePlay}
                >
                    {!isPlaying ? (
                        <PlayArrowRoundedIcon
                            style={{
                                fontSize: "64px",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    ) : (
                        <PauseRoundedIcon
                            style={{
                                fontSize: "64px",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    )}
                </div>
            )}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#444",
                    borderRadius: "0px 0px 12px 12px",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        height: "6px",
                        width: `${progress}%`,
                        backgroundColor: barColor,
                        borderRadius: "0px 0px 12px 12px",
                    }}
                />
            </div>
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
};

export default AudioPlayer;
