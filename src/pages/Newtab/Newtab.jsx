import React, { useState } from "react";

import BlerpModal from "../Extension/BlerpModal";

import logo from "../../assets/img/logo.svg";
import "./Newtab.css";
import "./Newtab.scss";
import { Button } from "@blerp/design";

const Newtab = () => {
    const [showPopup, setShowPopup] = useState();

    return (
        <div className='App'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt='logo' />
                <p>
                    Edit <code>src/pages/Newtab/Newtab.js</code> and save to
                    reload.
                </p>
                {/* <a
                    className='App-link'
                    href='https://reactjs.org'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Learn React!
                </a> */}
                <Button
                    target='_blank'
                    rel='noreferrer'
                    variant='contained'
                    sx={{ margin: "8px 12px 8px 16px" }}
                    onClick={() => {
                        setShowPopup(true);
                    }}
                >
                    Open Modal
                </Button>
                <BlerpModal setIsOpen={setShowPopup} isOpen={showPopup} />
                <h6>The color of this paragraph is defined using SASS!!!!</h6>
            </header>
        </div>
    );
};

export default Newtab;
