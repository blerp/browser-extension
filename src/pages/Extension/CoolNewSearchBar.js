import { Button, InputAdornment, Stack, Divider, Input } from "@blerp/design";
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";

const TextFieldWrapper = styled(Input)`
    fieldset {
        border-radius: 50px;
    }
`;

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        const isClient = typeof window === "object";

        const widths = [window.innerWidth];
        const heights = [window.innerHeight];

        if (window.screen?.width) {
            widths.push(window.screen?.width);
        }
        if (window.screen?.height) {
            heights.push(window.screen?.height);
        }

        const defaultWidth = Math.min(...widths);
        const defaultHeight = Math.min(...heights);

        if (!isClient) {
            setWindowSize({
                width: isClient ? defaultWidth : undefined,
                height: isClient ? defaultHeight : undefined,
            });
            return false;
        }

        function getSize() {
            return {
                width: isClient ? window.innerWidth : undefined,
                height: isClient ? window.innerHeight : undefined,
            };
        }

        function handleResize() {
            setWindowSize(getSize());
        }

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return windowSize;
};

const slideIn = keyframes`
    0% {
        width: 0;
    }

    100% {
        width: 100%;
    }
`;

const CoolNewSearchbar = ({ onClose, setSearchTerm, searchTerm }) => {
    const size = useWindowSize();
    const [active, setActive] = useState(searchTerm);
    const [searchInput, setSearchInput] = useState("");
    const [searchRating, setSearchRating] = useState("R");
    const [searchDuration, setSearchDuration] = useState();

    // useEffect(() => {
    //     const handleKeydown = (e) => {
    //         if (e.key === "Enter") {
    //             // Dont do it something

    //             console.log("CHEKCNG ENTER KEY", e.key, searchInput);

    //             if (searchDuration) {
    //                 router.push(
    //                     `/search?q=${searchInput}&r=${searchRating}&d=${
    //                         searchDuration / 1000
    //                     }`,
    //                 );
    //             } else {
    //                 router.push(`/search?q=${searchInput}&r=${searchRating}`);
    //             }
    //         }
    //     };

    //     document.addEventListener("keydown", (e) => handleKeydown(e));

    //     return () => {
    //         document.removeEventListener("keydown", handleKeydown);
    //     };
    // }, []);

    const defaultHandleSearchSubmit = (event) => {
        setActive(false);
        event.preventDefault();
        if (!searchInput || searchInput === "") {
            return;
        }
        const searchValue = searchInput.split(" ").join("-");
        setSearchTerm(searchInput);
    };

    return (
        <ClickAwayListener onClickAway={() => onClose()}>
            <TextFieldWrapper
                placeholder='Search'
                value={searchInput}
                autoFocus={size.width < 800 ? false : true}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setSearchTerm(searchInput);
                    }
                }}
                onClick={() => setActive(true)}
                onBlur={() => setActive(false)}
                onChange={(e) => {
                    setSearchInput(e.target.value);
                }}
                sx={{
                    border: "none",
                    "& fieldset": {
                        border: "none !important",
                    },
                    "& div": {
                        padding: "0 0 0 5px",
                    },
                }}
                InputProps={{
                    sx: {
                        margin: "1.25px 0",
                        padding: "2px 6px",
                        border: "2px solid transparent",
                        borderColor: active ? "grey6.main" : "grey4.main",
                        backgroundColor: "grey2.main",
                        borderRadius: "50px",
                        color: "notBlack.main",
                        height: "44px",
                        boxSizing: "border-box",
                        transition: "0.2s",
                    },
                    endAdornment: (
                        <InputAdornment position='end'>
                            {searchTerm && (
                                <CloseRoundedIcon
                                    sx={{
                                        width: "20px",
                                        height: "20px",

                                        cursor: "pointer",
                                        color: "notBlack.main",
                                    }}
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSearchInput("");
                                    }}
                                />
                            )}

                            <Stack
                                direction='row'
                                alignItems='center'
                                justifyContent='space-between'
                            >
                                <Button
                                    disableElevation
                                    variant='contained'
                                    color='grey3'
                                    sx={{
                                        height: "44px",
                                        width: "64px",
                                        border: "2px solid transparent",
                                        borderLeft: "2px solid transparent",
                                        borderRight: "none",
                                        borderColor: active
                                            ? "grey6.main"
                                            : "grey4.main",
                                        borderRadius: "0 24px 24px 0",
                                        minWidth: "0",
                                        padding: "8px",
                                        transition: "0.2s",
                                        "& span": {
                                            margin: "0",
                                        },
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        defaultHandleSearchSubmit(e);
                                    }}
                                    startIcon={
                                        <SearchRoundedIcon
                                            sx={{ margin: "0" }}
                                        />
                                    }
                                ></Button>
                            </Stack>
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />
            {/* <WrappedAudioSearchFilterModal
                    audienceRating={searchRating}
                    setAudienceRating={(audienceRating) => {
                        setSearchRating(audienceRating);
                        const searchValue = searchInput.split(" ").join("-");

                        if (searchDuration) {
                            router.push(
                                `/search?q=${searchValue}&r=${audienceRating}&d=${
                                    searchDuration / 1000
                                }`,
                            );
                        } else {
                            router.push(
                                `/search?q=${searchInput}&r=${audienceRating}`,
                            );
                        }
                    }}
                    setValidAudienceRating={(audienceRatingList) => {
                        setSearchRating(
                            audienceRatingList[audienceRatingList.length - 1],
                        );
                    }}
                    setDuration={(duration) => {
                        setSearchDuration(duration);
                        const searchValue = searchInput.split(" ").join("-");

                        router.push(
                            `/search?q=${searchValue}&r=${searchRating}&d=${
                                duration / 1000
                            }`,
                        );
                    }}
                    selectedDuration={searchDuration}
                    filterButtonColor='notBlack.main'
                /> */}
        </ClickAwayListener>
    );
};

export default CoolNewSearchbar;
