import React from "react";

const colors = {
    white: "#ffffff",
    waxing: "#F3F3F3",
    waxwing: "#F3F3F3",
    grey1: "#F0F2F2",
    grey1Dark: "#F0F2F2",
    grey2: "#E6E6E6",
    grey2Dark: "#1A1E1F",
    grey2LightReal: "#E2E6E7",
    darkerWhite: "#E2E6E7",
    grey2DarkReal: "#E2E6E7",
    grey3: "#C6CBCC",
    grey3Dark: "#C6CBCC",
    grey4: "#8A9193",
    grey4Dark: "#8A9193",
    grey5: "#676F70",
    grey5Dark: "#676F70",
    grey6: "#474D4F",
    grey6Dark: "#474D4F",
    grey7: "#2C3233",
    grey7Dark: "#2C3233",
    grey8: "#1A1E1F",
    grey8Dark: "#1A1E1F",
    grey9: "#000000",
    grey9Dark: "#050908",
    notBlack: "#121212",
    notBlackDark: "#1A1E1F",
    black: "#000000",
    discordGrey: "#2C3034",
    secondaryButtonDarkGrey: "#21000C",
    secondaryButtonGrey: "#8A8587",
    thirdButtonGrey: "#BEBEBC",
    ibisRed: "#FE295C",
    starling: "#3507B4",
    seafoam: "#0FEBC5",
    buntingBlue: "#27AAFF",
    popnYellow: "#FFD400",
};

function CustomDropdown(props) {
    const handleChange = (event) => {
        const value = event.target.value;
        const selectedOption = props.options.find(
            (option) => option.value === value,
        );

        props.onChange(selectedOption);
    };
    const style = {
        label: {
            fontFamily: "Odudo",
            fontWeight: "bold",
            color: colors.white,
            margin: "6px 0px",
        },
        select: {
            fontFamily: "Odudo",
            fontWeight: "bold",
            color: colors.grey8,
            backgroundColor: colors.white,
            border: `1px solid ${colors.grey3}`,
            borderRadius: "3px",
            padding: "8px",
            margin: "2px 0",
        },
        option: {
            fontFamily: "Odudo",
            fontWeight: "normal",
            color: colors.grey8,
            backgroundColor: colors.white,
            padding: "8px",
        },
    };

    return (
        <div>
            <label style={style.label}>{props.title}</label>
            <select
                value={props.value}
                onChange={handleChange}
                style={style.select}
            >
                {props.options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        style={style.option}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CustomDropdown;
