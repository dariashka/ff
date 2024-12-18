import RebillyAPI from "rebilly-js-sdk";

const state = {
    customerId: 'cus_01J7CH07DZGYKT0PZTQ3RE8C9H',
    organizationId: 'phronesis-friendfinder',
    websiteId: 'www.ff.com',
    strategies: {
        USD: 'dep_str_01JAWTA9DRM97VQCP8APXEGF5Z',
        CAD: 'dep_str_01JAWTC64SJ7NSPHNXWA86PT5W',
    },
    loaderEl: document.querySelector('.loader'),
    currency: 'USD',
}

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

async function selectCurrency(button, currency) {
    // Remove active class from all buttons
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    button.classList.add('active');

    console.log('Selected currency:', currency);
    state.currency = currency;

    state.depositRequestId = await getDepositRequestId();

    RebillyInstruments.update({
        deposit: {
            depositRequestId: state.depositRequestId,
        },
    })
}

const currencyButtons = document.querySelectorAll('.currency-btn');
currencyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        await selectCurrency(button, button.textContent);
    })
})

async function getDepositRequestId() {
    const requestDepositData = {
        websiteId: state.websiteId,
        customerId: state.customerId,
        strategyId: state.strategies[state.currency],
        currency: state.currency
    };

    const {fields: depositFields} = await api.depositRequests.create({
        data: requestDepositData,
    });

    return depositFields.id;
}

async function initRequest() {
    const response = {};
    const data = {
        mode: "passwordless",
        customerId: state.customerId,
    };
    const {fields: login} = await api.customerAuthentication.login({
        data,
    });
    const {fields: exchangeToken} =
        await api.customerAuthentication.exchangeToken({
            token: login.token,
            data: {
                acl: [
                    {
                        scope: {
                            organizationId: state.organizationId,
                        },
                        permissions: [
                            "PostToken",
                            "PostDigitalWalletValidation",
                            "StorefrontGetAccount",
                            "StorefrontPatchAccount",
                            "StorefrontPostPayment",
                            "StorefrontGetTransactionCollection",
                            "StorefrontGetTransaction",
                            "StorefrontGetPaymentInstrumentCollection",
                            "StorefrontPostPaymentInstrument",
                            "StorefrontGetPaymentInstrument",
                            "StorefrontPatchPaymentInstrument",
                            "StorefrontPostPaymentInstrumentDeactivation",
                            "StorefrontGetWebsite",
                            "StorefrontGetInvoiceCollection",
                            "StorefrontGetInvoice",
                            "StorefrontGetProductCollection",
                            "StorefrontGetProduct",
                            "StorefrontPostReadyToPay",
                            "StorefrontGetPaymentInstrumentSetup",
                            "StorefrontPostPaymentInstrumentSetup",
                            "StorefrontGetDepositRequest",
                            "StorefrontGetDepositStrategy",
                            "StorefrontPostDeposit",
                        ],
                    },
                ],
                customClaims: {
                    websiteId: state.websiteId,
                },
            },
        });

    console.log(state);

    response.token = exchangeToken.token;
    response.depositRequestId = await getDepositRequestId();

    state.token = response.token;
    state.depositRequestId = response.depositRequestId;
}

async function initInstruments() {
    let options = {
        apiMode: 'sandbox',
        theme: {
            colorPrimary: '#F9740A', // Brand color
            colorText: '#333333', // Text color
            colorDanger: '#F9740A',
            buttonColorText: '#ffffff',
            fontFamily: 'Trebuchet MS, sans-serif' // Website font family
        },
        deposit: {
            depositRequestId: state.depositRequestId,
        },
        jwt: state.token,
    };

    RebillyInstruments.mount(options);
}

async function init() {
    await initRequest();
    await initInstruments();
    state.loaderEl.style.display = 'none';
}

init();



