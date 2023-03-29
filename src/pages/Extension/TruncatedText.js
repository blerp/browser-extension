import React, { useRef, useState, useEffect } from "react";
import { Text } from "@blerp/design";

const TruncatedText = ({ text, style }) => {
    const textRef = useRef();
    const [isOverflowing, setIsOverflowing] = useState(false);
    const maxHeight = 32; // Define your desired height in pixels

    useEffect(() => {
        if (textRef.current) {
            const isOverflown = textRef.current.scrollHeight > maxHeight;
            setIsOverflowing(isOverflown);
        }
    }, [text]);

    return (
        <Text
            ref={textRef}
            sx={{
                ...style,
                ...(isOverflowing && {
                    // lineHeight: "50%",
                    // maxHeight: style.height * 2,
                    fontSize: "14px",
                    height: "40px",
                    // padding: "8px 0",
                }),
            }}
        >
            {text}
        </Text>
    );
};

export default TruncatedText;
