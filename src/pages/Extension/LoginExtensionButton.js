import React, { useState, useRef, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    SnackbarContext,
} from "@blerp/design";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { getGlobalCacheJwt } from "../../globalCache";

const COMPLETE_SIGN_UP = gql`
    mutation completeLogin {
        web {
            completeLogin {
                accessToken
                refreshToken
            }
        }
    }
`;

const LoginExtensionButton = ({}) => {
    const [completeLogin] = useMutation(COMPLETE_SIGN_UP);
    const [completedLoginClicked, setShowCompleteLogin] = useState(false);
    const snackbarContext = useContext(SnackbarContext);

    return (
        <Stack
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                padding: "0 4px 4px",
            }}
        >
            {completedLoginClicked ? (
                <Button
                    color='seafoam'
                    sx={{
                        fontSize: "24px",
                        margin: "12px",
                    }}
                    onClick={async () => {
                        snackbarContext.triggerSnackbar({
                            message: `Login completed go back to extension`,
                            severity: "success",
                            position: {
                                vertical: "bottom",
                                horizontal: "right",
                            },
                        });
                    }}
                    startIcon={
                        <FaceRoundedIcon
                            sx={{
                                color: "ibisRed.main",
                            }}
                        />
                    }
                >
                    Completed!
                </Button>
            ) : (
                <Button
                    color='ibisRed'
                    sx={{
                        fontSize: "24px",
                        margin: "12px",
                    }}
                    onClick={async () => {
                        // await refreshToken({
                        //     variables: {
                        //         increment: true,
                        //     },
                        // });

                        try {
                            const { data } = await completeLogin({
                                variables: {},
                            });

                            setShowCompleteLogin();

                            setGlobalCacheJwt(
                                data?.web?.completeLogin?.accessToken,
                                data?.web?.completeLogin?.refreshToken,
                            );

                            setShowCompleteLogin(true);

                            snackbarContext.triggerSnackbar({
                                message: `Successfully completed login`,
                                severity: "success",
                                position: {
                                    vertical: "bottom",
                                    horizontal: "right",
                                },
                            });
                        } catch (err) {
                            console.log("ERR", err);
                            setShowCompleteLogin(true);

                            snackbarContext.triggerSnackbar({
                                message: `${err}`,
                                severity: "error",
                                position: {
                                    vertical: "bottom",
                                    horizontal: "right",
                                },
                            });
                        }

                        console.log("LOGIN_COMPLETED");
                    }}
                    startIcon={
                        <FaceRoundedIcon
                            sx={{
                                color: "ibisRed.main",
                            }}
                        />
                    }
                >
                    Login Browser Extension
                </Button>
            )}
        </Stack>
    );
};

export default LoginExtensionButton;
