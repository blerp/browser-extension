import React from "react";
import { Stack, Text } from "@blerp/design";

const SegmentedSwitch = ({
    leftColor = "#B43757",
    rightColor = "grey2.real",
    selectedOption,
    setSelectedOption,
    selectedOptionLeft = "BEETS",
    selectedOptionRight = "POINTS",
    leftSideDisabled,
    rightSideDisabled,
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
                }}
                onClick={() => {
                    if (leftSideDisabled) {
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

                <Text
                    sx={{
                        color: "white",
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
                    {leftSideDisabled ? "Disabled" : formatText(leftSideAmount)}
                </Text>
            </Stack>

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
                }}
                onClick={() => {
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

                <Text
                    sx={{
                        color:
                            selectedOption === selectedOptionRight
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
                    {rightSideDisabled
                        ? "Disabled"
                        : formatText(rightSideAmount)}
                </Text>
            </Stack>
        </Stack>
    );
};

export default SegmentedSwitch;
