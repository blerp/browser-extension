import React, { useState } from "react";
import {
    Stack,
    Text,
    TikTokIcon,
    Input,
    InputAdornment,
    Button,
} from "@blerp/design";
import selectedProject from "../../projectConfig";
import styled from "styled-components";
import { useApollo } from "../../networking/apolloClient";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import InfoMessage from "./InfoMessage";
import gql from "graphql-tag";
import { setGlobalCacheJwt } from "../../globalCache";

const apiHost = selectedProject.apiHost;
const currentHost = selectedProject.host;

const OAuthLink = styled.a`
    margin: auto;
    width: 70%;
    height: 40px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    overflow: hidden;
    background: ${({ background }) => background};
    cursor: pointer;
    text-decoration: none;

    div {
        width: 48px;
        height: 48px;
        background: ${({ squareColor }) =>
            squareColor ? squareColor : "white"};
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 28px;
        border: 2px ${({ background }) => background} solid;
        border-radius: 8px;

        img {
            width: 50%;
        }
    }

    &:hover {
        opacity: 0.7;
    }
`;

const MessageLink = styled.a`
    color: inherit;
    font: inherit;
`;

const UseEmailDivider = ({ text }) => {
    return (
        <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{
                width: "80%",
                left: "50%",
                transform: "translate(-50%)",
                position: "relative",
                margin: "20px 0",
                border: "1px solid white",
            }}
        >
            <Text
                noWrap
                sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translate(-50%)",
                    padding: "5px 25px",
                    fontSize: "12px",
                    color: "white.real",
                    textTransform: "uppercase",
                    backgroundColor: "grey7.real",
                }}
            >
                {text}
            </Text>
        </Stack>
    );
};

const LOG_IN_QUERY = gql`
    query loginOnWebsite(
        $email: Email
        $password: Password!
        $usernameOrEmail: String
    ) {
        web {
            userSignInEmail(
                record: {
                    usernameOrEmail: $usernameOrEmail
                    email: $email
                    password: $password
                }
            ) {
                jwt
                refreshToken
                user {
                    _id
                    username
                }
            }
        }
    }
`;

const LoginScreen = ({
    signUp = false,
    returnTo = `/soundboard-browser-extension-return`,
    sx,
    refetchAll,
}) => {
    const apolloClient = useApollo();

    const [loadingLogin, setLoadingLogin] = useState(false);
    const [usernameOrEmail, onEmailOrUserNameChange] = useState("");
    const [password, onPasswordChange] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [notMatchError, setNotMatchError] = useState(false);
    const [error, setError] = useState(false);
    const size = { width: 320, height: 320 };

    const handleLogin = async ({ usernameOrEmail, password }) => {
        try {
            const loginQuery = await apolloClient.query({
                errorPolicy: "all",
                fetchPolicy: "no-cache",
                query: LOG_IN_QUERY,
                variables: {
                    usernameOrEmail,
                    password,
                },
            });

            if (
                loginQuery.data &&
                loginQuery.data.web &&
                loginQuery.data.web.userSignInEmail &&
                loginQuery.data.web.userSignInEmail.jwt
            ) {
                const JWT = loginQuery.data.web.userSignInEmail.jwt;
                const refreshToken =
                    loginQuery.data.web.userSignInEmail.refreshToken;
                const username =
                    loginQuery.data.web.userSignInEmail.user.username;

                setGlobalCacheJwt(JWT, refreshToken);

                // await getUser();
            } else {
                setNotMatchError(true);
                setError(loginQuery.errors[0].details);
            }
        } catch (exception) {
            console.log("ERRR", exception);
            setNotMatchError(true);
        }
    };

    return (
        <Stack
            sx={{
                paddingTop: "14px",
                gap: "8px",
                ...sx,
            }}
        >
            <OAuthLink
                href={`${apiHost}/auth/discord?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=discord&fail=${currentHost}/auth-fail`}
                target='_blank'
                background='#758AD4'
                squareColor='#758AD4'
            >
                <div>
                    <img
                        src='https://cdn.blerp.com/design/web/discord-mark-white.png'
                        alt=''
                    />
                </div>
                <Text
                    sx={{
                        fontSize: "14px",
                        color: "white.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} With Discord`}</Text>
            </OAuthLink>
            <OAuthLink
                href={`${apiHost}/auth/twitch?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=twitch&fail=${currentHost}/auth-fail`}
                target='_blank'
                background='#9146FF'
                squareColor='#9146FF'
            >
                <div>
                    <img
                        src='https://cdn.blerp.com/design/web/TwitchGlitchWhite.svg'
                        alt=''
                    />
                </div>
                <Text
                    sx={{
                        fontSize: "14px",
                        color: "white.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} With Twitch`}</Text>
            </OAuthLink>

            <OAuthLink
                href={`${apiHost}/auth/youtube?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=youtube&fail=${currentHost}/auth-fail`}
                target='_blank'
                background='#FF0000'
                squareColor='#FF0000'
            >
                <div>
                    <img
                        // src='https://cdn.blerp.com/design/web/yt_icon_rgb.png'
                        src='https://cdn.blerp.com/design/web/yt_icon_mono_dark.png'
                        alt=''
                        style={{ width: "58%" }}
                    />
                </div>
                <Text
                    sx={{
                        fontSize: "14px",
                        color: "white.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} With YouTube`}</Text>
            </OAuthLink>

            <OAuthLink
                href={`${apiHost}/auth/google?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=google&fail=${currentHost}/auth-fail`}
                target='_blank'
                background='#4285F4'
                squareColor='#fff'
            >
                <div>
                    <img
                        src='https://cdn.blerp.com/blerp-web-images/sign-in/btn_google_light_normal.svg'
                        alt=''
                    />
                </div>
                <Text
                    sx={{
                        fontSize: "14px",
                        color: "white.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} With Google`}</Text>
            </OAuthLink>

            {/* <OAuthLink
                href={`${apiHost}/auth/tiktok?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=tiktok&fail=${currentHost}/auth-fail`}
                // target='_blank'
                background='#fff'
            >
                <div>
                    <img
                        src='https://cdn.blerp.com/blerp_products/Web/Landing%20Pages/NFT/TikTok.svg'
                        alt=''
                    />
                </div>
                <Text
                    sx={{
                        fontSize: "14px",
                        color: "notBlack.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} With TikTok`}</Text>
            </OAuthLink> */}

            {!notMatchError && <UseEmailDivider text='or use email/username' />}

            {/* <OAuthLink
                href={`${apiHost}/auth/youtube?pass=${currentHost}/soundboard-browser-extension-return?returnTo=${
                    returnTo ?? "/"
                }&loggedWith=youtube&fail=${currentHost}/auth-fail`}
                // target='_blank'
                background='#FFF'
            >
                <div>
                    <EmailRoundedIcon sx={{ color: "#000" }} />
                </div>

                <Text
                    sx={{
                        fontSize: "14px",
                        color: "white.override",
                    }}
                >{`${signUp ? "Signup" : "Login"} with Email`}</Text>
            </OAuthLink> */}

            {notMatchError && (
                <Stack
                    sx={{
                        mt: "8px",
                        mb: "4px",
                    }}
                >
                    <InfoMessage type='error'>
                        <Text
                            sx={{
                                color: "white.override",
                                fontSize: "10px",
                            }}
                        >
                            No account matches that email/password. Please try
                            again or{" "}
                            <MessageLink
                                href={`${selectedProject.host}/reset-email`}
                                target='_blank'
                            >
                                reset your password
                            </MessageLink>
                            , or{" "}
                            <MessageLink
                                href={`${selectedProject.host}/soundboard-browser-extension`}
                                target='_blank'
                            >
                                Sign up
                            </MessageLink>
                            .
                        </Text>
                    </InfoMessage>
                </Stack>
            )}

            <Input
                variant='outlined'
                sx={{
                    maxWidth: size.width > 420 ? "408px" : "80%",
                    width: "80%",
                    alignSelf: "center",
                }}
                value={usernameOrEmail}
                onChange={(e) => {
                    onEmailOrUserNameChange(e.target.value);
                }}
                InputProps={{
                    sx: {
                        backgroundColor: "white.override",
                        height: "40px",
                    },
                }}
                placeholder='Email/Username'
            />

            <Input
                variant='outlined'
                sx={{
                    mt: "6px",
                    maxWidth: size.width > 420 ? "408px" : "80%",
                    width: "80%",
                    alignSelf: "center",
                }}
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => {
                    onPasswordChange(e.target.value);
                }}
                InputProps={{
                    sx: {
                        backgroundColor: "white.override",
                        height: "40px",
                    },
                    endAdornment: (
                        <InputAdornment position='end'>
                            <VisibilityIcon
                                sx={{
                                    cursor: "pointer",
                                    color: "grey4.real",
                                }}
                                onClick={() => {
                                    setPasswordVisible(!passwordVisible);
                                }}
                            />
                        </InputAdornment>
                    ),
                }}
                placeholder='Password'
            />

            {/* <Text
                sx={{
                    width: "100%",
                    mt: "5px",
                    textTransform: "uppercase",
                    fontSize: "14px",
                    color: "white.override",
                    textAlign: "end",
                }}
            >
                <MessageLink
                    style={{
                        textDecoration: "none",
                    }}
                    href={`${selectedProject.host}/reset-email`}
                >
                    Forgot password
                </MessageLink>
            </Text> */}

            <Button
                sx={{
                    mt: "8px",
                    padding: "5px 20px",
                    "&:disabled": {
                        backgroundColor: "white.override",
                    },
                    width: "131px",
                    alignSelf: "center",
                    mb: "32px",
                }}
                variant='contained'
                disabled={
                    usernameOrEmail.length < 5 || password.length < 6
                    // || !captchaValue sometimes broken
                }
                onClick={async () => {
                    if (loadingLogin) {
                        return;
                    }

                    setLoadingLogin(true);

                    try {
                        await handleLogin({
                            usernameOrEmail,
                            password,
                        });

                        if (refetchAll) {
                            await refetchAll();
                        }

                        setLoadingLogin(false);
                    } catch (err) {
                        console.log("Logginging Error", err);
                        setLoadingLogin(false);
                    } finally {
                        setLoadingLogin(false);
                    }
                }}
            >
                {loadingLogin ? "Logging in" : "Log in"}
            </Button>
        </Stack>
    );
};

export default LoginScreen;
