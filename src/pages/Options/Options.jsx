import React from "react";
import "./Options.css";

import UserProfile from "../Extension/UserProfile";
import { Stack, Text } from "@blerp/design";
import { gql, useQuery } from "@apollo/client";
import { BLERP_USER_SELF } from "../../mainGraphQl";

// import gql from "graphql-tag";

const HOME_PAGE_POPUP = gql`
    ${BLERP_USER_SELF}
    query getRandomBite {
        browserExtension {
            biteRandomOne {
                _id
                title
                saved
            }
            userSignedIn {
                ...UserFragment
            }
        }
    }
`;

const Options = ({ title }) => {
    const { loading, data, error, refetch } = useQuery(HOME_PAGE_POPUP, {
        variables: {},
        errorPolicy: "all",
    });

    const signedInUser = data?.browserExtension?.userSignedIn;

    return (
        <Stack
            sx={{
                backgroundColor: "grey7.real",
                height: "100%",
                width: "100%",
            }}
        >
            <UserProfile userSignedIn={signedInUser} refetchAll={refetch} />
        </Stack>
    );
};

export default Options;
