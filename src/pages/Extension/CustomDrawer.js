import React from "react";
import styled, { keyframes } from "styled-components";
import { Stack } from "@blerp/design";

const CustomDrawer = ({ open, anchor, onClose, children }) => {
    if (!open) return null;

    const slideInAnimation = keyframes`
    0% {
      transform: ${
          anchor === "left"
              ? "translateX(-100%)"
              : anchor === "right"
              ? "translateX(100%)"
              : anchor === "top"
              ? "translateY(-100%)"
              : "translateY(100%)"
      };
    }
    100% {
      transform: translateX(0) translateY(0);
    }
  `;

    const Content = styled.div`
        position: absolute;
        top: 0;
        background: rgba(
            71,
            77,
            79,
            0.8
        ); // Change this to your desired background color
        border-radius: 4px;
        padding: 16px;
        animation: ${slideInAnimation} 0.3s ease-in-out forwards;
        z-index: 1000; // Add this to ensure the drawer stays above other elements
        ${anchor === "left" || anchor === "right" ? "height: 100%;" : ""}
        ${anchor === "top" || anchor === "bottom" ? "width: 100%;" : ""}
    `;

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
        >
            <Content onClick={(e) => e.stopPropagation()}>{children}</Content>
        </Stack>
    );
};

export default CustomDrawer;
