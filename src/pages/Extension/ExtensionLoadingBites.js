import React, { useState, useRef, useMemo } from "react";
import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Dropdown,
    Select,
    MenuItem,
} from "@blerp/design";

import styled from "styled-components";

const SleekStack = styled(Stack)`
    @keyframes fade-in-out {
        0%,
        100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }

    width: 86px;
    height: 127px;
    background-color: ${(props) => props.theme.colors.grey7};
    margin: 4px;
    border-radius: 8px;
    animation: fade-in-out 2.8s linear infinite;
    ${({ delay }) => delay && `animation-delay: ${delay}s;`}
`;

const renderEmptyBite = ({ index }) => {
    const delay = index * 0.2;
    return <SleekStack delay={delay}></SleekStack>;
};

const ExtensionLoadingBites = () => {
    return (
        <Stack
            sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                overflowY: "scroll",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                paddingTop: "4px",
                width: "100%",
            }}
        >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
                return renderEmptyBite({ index: num });
            })}
        </Stack>
    );
};

export default ExtensionLoadingBites;
