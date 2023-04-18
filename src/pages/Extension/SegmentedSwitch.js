import React from "react";
import { Stack, Text, Tooltip } from "@blerp/design";

const SegmentedSwitch = ({
    leftColor = "grey2.real",
    rightColor = "#B43757",
    selectedOption,
    setSelectedOption,
    selectedOptionLeft = "BEETS",
    selectedOptionRight = "POINTS",
    leftSideDisabled,
    rightSideDisabled,

    leftSideFullyDisabled,
    rightSideFullyDisabled,

    leftSideAmount,
    rightSideAmount,
    leftIcon,
    rightIcon,
    leftSelectedIcon,
    rightSelectedIcon,
}) => {
    const formatText = (text) => {
        if (text.length > 8) {
            return `${text.slice(0, 8)}...`;
        }
        return text;
    };

    const rightSideMessage = rightSideFullyDisabled
        ? "The creator has beets disabled, beets cannot be used on any sounds."
        : rightSideDisabled
        ? "The creator has beets disabled for this sound, beets can be used on other sounds"
        : "";

    const leftSideMessage = leftSideFullyDisabled
        ? "The creator has points disabled, points cannot be used on any sounds."
        : leftSideDisabled
        ? "The creator has points disabled for this sound, points can be used on other sounds"
        : "";

    return (
        <Stack
            direction='row'
            sx={{
                borderRadius: "32px",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                zIndex: 3,
                border: "1px solid #676F70",
            }}
        >
            <Tooltip
                title={
                    leftSideMessage ? (
                        <Text
                            sx={{
                                color: "white.override",
                                fontWeight: "300",
                                fontSize: "16px",
                            }}
                        >
                            {leftSideMessage}
                        </Text>
                    ) : (
                        ""
                    )
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
                <Stack
                    direction='row'
                    sx={{
                        backgroundColor:
                            selectedOption === selectedOptionLeft
                                ? leftColor
                                : "transparent",
                        height: "32px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: "1px solid #676F70",
                        padding: "0 4px",
                        cursor: leftSideDisabled ? "" : "pointer",
                        opacity: leftSideDisabled ? "0.5" : "1",

                        "&:hover": {
                            backgroundColor:
                                selectedOption === selectedOptionLeft
                                    ? leftColor
                                    : "#474D4F",
                        },
                    }}
                    onClick={() => {
                        if (leftSideDisabled || leftSideFullyDisabled) {
                            return;
                        }

                        setSelectedOption(selectedOptionLeft);
                    }}
                >
                    <img
                        src={
                            selectedOption === selectedOptionLeft
                                ? leftSelectedIcon
                                : leftIcon
                        }
                        style={{
                            width: "18px",
                            height: "18px",
                            margin: "4px",
                        }}
                    />

                    {!leftSideFullyDisabled && (
                        <Text
                            sx={{
                                color:
                                    selectedOption === selectedOptionLeft
                                        ? "#000"
                                        : "white",
                                textAlign: "center",
                                fontSize: "20px",
                                maxWidth: "120px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "14px",
                                fontWeight: "300",

                                padding: "4px",
                            }}
                        >
                            {leftSideFullyDisabled
                                ? ""
                                : leftSideDisabled
                                ? "Disabled"
                                : formatText(leftSideAmount)}
                        </Text>
                    )}
                </Stack>
            </Tooltip>

            <Tooltip
                title={
                    rightSideMessage ? (
                        <Text
                            sx={{
                                color: "white.override",
                                fontWeight: "300",
                                fontSize: "16px",
                            }}
                        >
                            {rightSideMessage}
                        </Text>
                    ) : (
                        ""
                    )
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
                <Stack
                    direction='row'
                    sx={{
                        backgroundColor:
                            selectedOption === selectedOptionRight
                                ? rightColor
                                : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "32px",
                        padding: "0 4px",
                        cursor: rightSideDisabled ? "" : "pointer",
                        opacity: rightSideDisabled ? "0.5" : "1",

                        "&:hover": {
                            backgroundColor:
                                selectedOption === selectedOptionRight
                                    ? rightColor
                                    : "#773B4B",
                        },
                    }}
                    onClick={() => {
                        if (rightSideDisabled || rightSideFullyDisabled) {
                            return;
                        }

                        setSelectedOption(selectedOptionRight);
                    }}
                >
                    <img
                        src={
                            selectedOption === selectedOptionRight
                                ? rightSelectedIcon
                                : rightIcon
                        }
                        style={{
                            width: "18px",
                            height: "18px",
                            margin: "4px",
                        }}
                    />

                    {!rightSideFullyDisabled && (
                        <Text
                            sx={{
                                color:
                                    selectedOption === selectedOptionRight
                                        ? "white"
                                        : "white",
                                textAlign: "center",
                                fontSize: "20px",
                                maxWidth: "120px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "14px",
                                fontWeight: "300",

                                padding: "4px",
                            }}
                        >
                            {rightSideFullyDisabled
                                ? ""
                                : rightSideDisabled
                                ? "Disabled"
                                : formatText(rightSideAmount)}
                        </Text>
                    )}
                </Stack>
            </Tooltip>
        </Stack>
    );
};

export default SegmentedSwitch;
