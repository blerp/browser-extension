import React from "react";
import styled, { keyframes } from "styled-components";
import { Stack } from "@blerp/design";
import { EXTENSION_HEIGHT } from "../../constants";

// const slideInAnimation = keyframes`
// 0% {
//   transform: ${
//       anchor === "left"
//           ? "translateX(-100%)"
//           : anchor === "right"
//           ? "translateX(100%)"
//           : anchor === "top"
//           ? "translateY(-100%)"
//           : "translateY(100%)"
//   };
//   opacity: 0;
// }
// 100% {
//   transform: translateX(0) translateY(0);
//   opacity: 1;

// }
// `;

const slideInAnimation = keyframes`
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;

const Content = styled.div`
    position: absolute;
    top: 0;
    background: rgba(
        71,
        77,
        79,
        0.9
    ); // Change this to your desired background color
    padding: 24px 0;
    animation: ${slideInAnimation} 0.3s ease-in-out forwards;
    z-index: 1000;
    height: ${EXTENSION_HEIGHT - 134}px;
    overflow-y: scroll;
    width: 100%;

    ${(props) =>
        props.anchor === "left" || props.anchor === "right"
            ? "height: 100%;"
            : ""}
    ${(props) =>
        props.anchor === "top" || props.anchor === "bottom"
            ? "width: 100%;"
            : ""}
`;

const CustomDrawer = ({ open, anchor, onClose, children }) => {
    if (!open) return null;

    return (
        <Stack
            sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                background: "rgba(71, 77, 79, 0.8)",
                backdropFilter: "blur(46.5px)",
                zIndex: 1001,
            }}
            onClick={onClose}
            anchor={anchor}
        >
            <Content onClick={(e) => e.stopPropagation()}>{children}</Content>
        </Stack>
    );
};

export default CustomDrawer;
