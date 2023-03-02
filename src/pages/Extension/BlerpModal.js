import React, { useState, useRef, useContext } from "react";

import {
    Stack,
    Button,
    Text,
    BlerpyIcon,
    Modal,
    Box,
    SnackbarContext,
} from "@blerp/design";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircle from "@mui/icons-material/CheckCircle";

import { useApollo } from "../../networking/apolloClient";
import styled from "styled-components";
import EllipsisLoader from "./EllipsisLoader";
import selectedProject from "../../projectConfig";

// Create our number formatter.
const USDFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

const percentFormat = new Intl.NumberFormat("en-US", {
    style: "percent",
});

const BrainTreeDropIn = require("braintree-web-drop-in");
const BrainTreeClient = require("braintree-web/client");
const DataCollector = require("braintree-web/data-collector");

const GET_RANDOM_BITE = gql`
    query getRandomBite {
        web {
            biteRandomOne {
                _id
                title
                saved
            }
            userSignedIn {
                _id
                username
            }
        }
    }
`;

const ModalContainer = styled.div`
    box-sizing: border-box;
    * {
        box-sizing: border-box;
    }
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    max-width: fit-content;
    padding: 30px 40px;
    margin: auto;
    border-radius: 12px;

    @media (max-width: 800px) {
        justify-content: start;
        max-height: 90%;
        padding: 12px;
        margin: 0 auto;
        overflow: scroll;
        width: 80%;

        .plansContainer {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 600px) {
        width: 90%;

        .subscriptionProsContainer {
            flex-direction: column;
            width: 100%;
        }

        .subscriptionProsItem {
            width: 100%;
        }
    }
`;

const PurchaseCompleteScreen = ({ setIsOpen }) => {
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            setIsOpen(null);
        }, 5000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [setIsOpen]);

    return (
        <Box display='flex' flexDirection='column' alignItems='center'>
            <CheckCircle color='primary' style={{ fontSize: 80 }} />
            <Text variant='h5' align='center' gutterBottom>
                Purchase Complete!
            </Text>
            <Text variant='body1' align='center'>
                Thank you for your purchase. You can now use your beets to
                support your favorite streamers.
            </Text>
        </Box>
    );
};

const BEETS_CATALOG = gql`
    query websiteBeetsCatalogTradePage {
        web {
            beetsCatalog(catalogType: "BEETS") {
                catalog {
                    description
                    type
                    tierImg
                    amount
                    purchaseAmountDollars
                    percentOff
                    excellentChoice
                    value
                }
            }
        }
    }
`;

const ProductSelectionScreen = ({ onSelectProduct }) => {
    const { loading, error, data } = useQuery(BEETS_CATALOG);

    const handleProductSelection = (product) => {
        if (product) {
            onSelectProduct({
                value: product?.value,
                name: `${product?.value} Beets`,
                ...product,
            });
        } else {
        }
    };

    return (
        <Box display='flex' flexDirection='column' alignItems='center'>
            <Text
                sx={{ color: "white", paddingBottom: "4px", fontSize: "24px" }}
            >
                Choose a product:
            </Text>

            <Stack
                direction='row'
                sx={{
                    flexWrap: "wrap",
                }}
            >
                {data &&
                    data.web &&
                    data.web.beetsCatalog &&
                    data.web.beetsCatalog.catalog &&
                    data.web.beetsCatalog.catalog.map((item, index) => {
                        return (
                            <Button
                                variant='contained'
                                onClick={() => handleProductSelection(item)}
                                sx={{
                                    backgroundColor: "primary.main",
                                    margin: "4px 4px",
                                }}
                            >
                                {item?.amount} Beets for $
                                {item?.purchaseAmountDollars}
                            </Button>
                        );
                    })}
            </Stack>
        </Box>
    );
};

const BEETS_BRAIN_TREE_TOKEN = gql`
    query websiteBeetsBrainTreeCatalog($customerID: String) {
        web {
            beetsBraintreeClientToken(
                customerID: $customerID
                transactionType: "BEETS"
            ) {
                userWallet {
                    _id
                }
                clientToken
            }
        }
    }
`;

const USER_QUERY = gql`
    query webGetUserForWeb {
        web {
            userSignedIn {
                _id
                roles
            }
        }
    }
`;

const PurchaseConfirmationScreen = ({
    selectedProduct,
    onClose,
    onCompletePurchase,
    dropinInstanceReady,
    loadingCheckout,
}) => {
    const formattedPrice = (selectedProduct?.purchaseAmountDollars).toFixed(2);

    return (
        <Box display='flex' flexDirection='column' alignItems='center'>
            <Text
                sx={{ color: "white", paddingBottom: "4px", fontSize: "24px" }}
            >
                Purchase Summary
            </Text>

            <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ paddingY: "12px" }}
            >
                <Text sx={{ color: "grey5.real", fontSize: "16px" }}>
                    Product:
                </Text>
                <Text sx={{ color: "white", fontSize: "16px" }}>
                    {selectedProduct?.amount} Beets
                </Text>
            </Stack>

            <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ paddingY: "12px" }}
            >
                <Text sx={{ color: "grey5.real", fontSize: "16px" }}>
                    Price:
                </Text>
                <Text sx={{ color: "white", fontSize: "16px" }}>
                    ${formattedPrice}
                </Text>
            </Stack>

            {loadingCheckout && <EllipsisLoader />}

            <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ paddingY: "12px" }}
            >
                <form
                    id='payment-form'
                    noValidate
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "20px",
                        padding: "12px 4px",
                    }}
                >
                    <div id='dropin-container'></div>
                    <input
                        type='hidden'
                        id='nonce'
                        name='payment_method_nonce'
                    />
                    <input
                        type='hidden'
                        id='deviceData'
                        name='payment_method_deviceData'
                    />
                    {/* {dropinInstanceReady ? (
                    <Button
                        buttonType='custom'
                        color='red'
                        borderColor='invisible'
                        textColor='white'
                        style={{ padding: "4px 18px", margin: "8px" }}
                        onClick={async (event) => {}}
                    >
                        Purchase Beets
                    </Button>
                ) : (
                    <div>Loading Beet Cart</div>
                )} */}

                    <Stack sx={{ paddingY: "24px" }}>
                        <Button
                            variant='contained'
                            fullWidth
                            onClick={onClose}
                            sx={{ marginY: "12px", color: "#fff" }}
                        >
                            Cancel
                        </Button>

                        {!dropinInstanceReady ? (
                            <Button
                                variant='contained'
                                color='grey4'
                                fullWidth
                                sx={{ marginY: "12px", color: "#000" }}
                            >
                                Loading...
                            </Button>
                        ) : (
                            <Button
                                variant='contained'
                                color='seafoam'
                                fullWidth
                                sx={{ marginY: "12px", color: "#000" }}
                                onClick={onCompletePurchase}
                            >
                                Complete Purchase
                            </Button>
                        )}
                    </Stack>
                </form>
            </Stack>
        </Box>
    );
};

const BlerpModal = ({ isOpen, setIsOpen }) => {
    const snackbarContext = useContext(SnackbarContext);

    const apolloClient = useApollo();
    const [currentContent, setCurrentContent] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [purchasingLoading, setIsPurchasingLoad] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [purchaseComplete, setIsPurcaseComplete] = useState(false);
    const [clientToken, setClientToken] = useState(null);

    const [dropinInstanceReady, setDropInstanceReady] = useState(false);
    const [dropinInstance, setDropInstance] = useState({});

    const handleCloseReset = () => {
        setIsOpen(false);
        setSelectedProduct(null);
        setIsPurchasingLoad(false);
        setIsPurcaseComplete(false);
    };

    const goToCheckout = async ({ catalogItem }) => {
        const loggedInQuery = await apolloClient.query({
            errorPolicy: "all",
            fetchPolicy: "no-cache",
            query: USER_QUERY,
        });

        if (
            loggedInQuery.data &&
            loggedInQuery.data.web &&
            loggedInQuery.data.web.userSignedIn &&
            loggedInQuery.data.web.userSignedIn._id
        ) {
        } else {
            setLoginBox(true);
            // window.location.href = `/login?returnTo=tradeBeets`;
            return;
        }

        setLoadingCheckout(true);

        try {
            const beetsClientTokenQuery = await apolloClient.query({
                errorPolicy: "all",
                fetchPolicy: "no-cache",
                query: BEETS_BRAIN_TREE_TOKEN,
            });

            const clientToken =
                beetsClientTokenQuery.data &&
                beetsClientTokenQuery.data.web &&
                beetsClientTokenQuery.data.web.beetsBraintreeClientToken &&
                beetsClientTokenQuery.data.web.beetsBraintreeClientToken
                    .clientToken;

            setClientToken(clientToken);

            const form = document.getElementById("payment-form");
            const dropper = await BrainTreeDropIn.create(
                {
                    authorization: clientToken
                        ? clientToken
                        : selectedProject.brainTreeTokenizationKey,
                    selector: "#dropin-container",
                    paypal: {
                        flow: "vault",
                        amount: USDFormat.format(
                            catalogItem.purchaseAmountDollars,
                        ),
                        currency: "USD",
                        buttonStyle: {
                            color: "blue",
                            shape: "rect",
                            size: "medium",
                        },
                    },
                    displayName: "Blerp Beets Cart",
                    paymentRequest: {
                        total: {
                            label: "Blerp Beets Cart",
                            amount: USDFormat.format(
                                catalogItem.purchaseAmountDollars,
                            ),
                        },
                        // We recommend collecting billing address information, at minimum
                        // billing postal code, and passing that billing postal code with all
                        // Apple Pay transactions as a best practice.
                        requiredBillingContactFields: ["postalAddress"],
                    },
                    googlePay: {
                        googlePayVersion: 2,
                        merchantId: selectedProject.googleMerchantId
                            ? selectedProject.googleMerchantId
                            : null,
                        environment: selectedProject.googleMerchantId
                            ? "PRODUCTION"
                            : "TEST",
                        transactionInfo: {
                            totalPriceStatus: "FINAL",
                            totalPrice:
                                catalogItem.purchaseAmountDollars.toString(),
                            totalPriceLabel: "Blerp Beets",
                            countryCode: "US",
                            currencyCode: "USD",
                        },
                        allowedPaymentMethods: [
                            {
                                type: "CARD",
                                parameters: {
                                    // We recommend collecting and passing billing address information with all Google Pay transactions as a best practice.
                                    billingAddressRequired: true,
                                    billingAddressParameters: {
                                        format: "FULL",
                                    },
                                },
                            },
                        ],
                    },
                    venmo: {
                        allowDesktop: true,
                        allowNewBrowserTab: true,
                    }, // The `venmo` object requires no properties to instantiate.
                },
                (err, dropinInstance) => {
                    if (err) {
                        snackbarContext.triggerSnackbar({
                            message: `Error loading checkout ${err}`,
                            severity: "errror",
                            transitionType: "fade",
                            position: {
                                vertical: "bottom",
                                horizontal: "right",
                            },
                        });
                        return;
                    }
                    setLoadingCheckout(false);
                    setDropInstance(dropinInstance);
                    setDropInstanceReady(true);
                },
            );
        } catch (err) {
            console.log(err);
            setDropInstanceReady(false);
            handleCloseReset();
            return;
        }
    };

    const handleProductSelection = async (product) => {
        setSelectedProduct(product);
        await goToCheckout({ catalogItem: product });
    };

    const handleCancelPurchase = () => {
        setSelectedProduct(null);
    };

    const handleCompletePurchase = async (event) => {
        event.preventDefault();

        if (!dropinInstanceReady) {
            snackbarContext.triggerSnackbar({
                message: `Checkout not ready!`,
                severity: "errror",
                transitionType: "fade",
                position: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
            return;
        }

        setIsPurchasingLoad(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const payload = await dropinInstance.requestPaymentMethod();

            console.log("cross client payload");

            const clientInstance = await BrainTreeClient.create({
                authorization: clientToken,
            });

            console.log("pass client instance");

            const dataCollectorInstance = await DataCollector.create({
                client: clientInstance,
                paypal: true,
            });

            const nonce = payload.nonce;
            const deviceData = dataCollectorInstance.deviceData;

            const catalogItem = {
                description: selectedProduct.description,
                type: selectedProduct.type,
                amount: selectedProduct.amount,
                value: selectedProduct.value,
                excellentChoice: selectedProduct.excellentChoice,
                purchaseAmountDollars: selectedProduct.purchaseAmountDollars,
                percentOff: selectedProduct.percentOff,
                tierImg: selectedProduct.tierImg,
            };

            const purchaseBeets = await apolloClient.mutate({
                mutation: BUY_BEETS_PURCHASE,
                // errorPolicy: "all",
                variables: {
                    record: {
                        frontendTransactionId: frontendTransactionId,
                        beetCatalogItem: catalogItem,
                        paymentMethodNonce: nonce,
                        deviceData: deviceData,
                    },
                },
            });

            if (
                !purchaseBeets?.data?.web?.beetsPurchase?.transactionSuccessful
            ) {
                throw new Error("Transaction not successful");
            }
        } catch (err) {
            console.log(err);
            snackbarContext.triggerSnackbar({
                message: `Something wrong happened, try again or use a different payment method`,

                severity: "error",
                transitionType: "fade",
                position: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
        }

        setIsPurchasingLoad(false);
        setIsPurcaseComplete(true);
        setIsPurchasingLoad(true);
    };

    const renderScreen = () => {
        return purchasingLoading ? (
            <EllipsisLoader />
        ) : purchaseComplete ? (
            <PurchaseCompleteScreen setIsOpen={handleCloseReset} />
        ) : selectedProduct === null ? (
            <ProductSelectionScreen
                onSelectProduct={handleProductSelection}
                goToCheckout={goToCheckout}
            />
        ) : (
            <PurchaseConfirmationScreen
                selectedProduct={selectedProduct}
                onClose={handleCancelPurchase}
                onCompletePurchase={handleCompletePurchase}
                dropinInstanceReady={dropinInstanceReady}
                loadingCheckout={loadingCheckout}
            />
        );
    };

    return (
        <Modal
            sx={{
                backdropFilter: "blur(8px)",
            }}
            open={isOpen}
            onClose={() => {
                handleCloseReset();
            }}
            aria-labelledby='subscription-gifting-modal'
            aria-describedby='subscription-gifting-modal'
        >
            <ModalContainer>
                <Stack
                    sx={{
                        backgroundColor: "grey7.real",
                        padding: "32px",
                        borderRadius: "12px",
                        position: "relative",
                    }}
                >
                    <CloseIcon
                        sx={{
                            position: "absolute",
                            top: "24px",
                            right: "24px",
                            cursor: "pointer",
                            color: "white",
                        }}
                        onClick={() => {
                            handleCloseReset();
                        }}
                    />

                    {renderScreen()}
                </Stack>
            </ModalContainer>
        </Modal>
    );
};

export default BlerpModal;
