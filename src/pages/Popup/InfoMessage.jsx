import React from "react";
import styled from "styled-components";

const InfoMessageWrapper = styled.div`
    width: 80%;
    padding: 12px;
    border: 2px solid ${({ borderColor }) => borderColor};
    border-radius: 8px;
    position: relative;
    align-self: center;
`;

const ErrorLabel = styled.p`
    margin: 0;
    padding: 0 10px;
    background: black;
    color: #fd295c;
    position: absolute;
    top: -13px;
    left: 7%;
`;

const getBorderColor = (type) => {
    switch (type) {
        case "success": {
            return "#0FEBC5";
        }
        case "error": {
            return "#FD295C";
        }
        default: {
            return "#0FEBC5";
        }
    }
};

const InfoMessage = ({ type = "success", children }) => {
    const borderColor = getBorderColor(type);

    return (
        <InfoMessageWrapper borderColor={borderColor}>
            {type === "error" && <ErrorLabel>Error</ErrorLabel>}
            {children}
        </InfoMessageWrapper>
    );
};

export default InfoMessage;
