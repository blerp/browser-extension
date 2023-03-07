import React from "react";
import { Theme } from "@blerp/design";
import { ApolloProvider } from "@apollo/client";
import { initializeApolloSync } from "./networking/apolloClient";

function WithBlerp({ Component, pageProps, initialState = {} }) {
    console.log("WITHBLER_PAGE_PROPS", pageProps);
    const client = initializeApolloSync(initialState);

    return (
        <ApolloProvider client={client}>
            <Theme mode={"dark"}>
                <Component {...pageProps}></Component>
            </Theme>
        </ApolloProvider>
    );
}

export default WithBlerp;
