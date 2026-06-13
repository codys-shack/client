import { auth, getMembership } from "../global.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const PLAN_BY_PRODUCT = {};
const PLANS = {
    experience_monthly: {
        productId: '6c5e0381-35ed-4d4e-8c79-5dd2ce4cb9e1',
        name: 'Experience Pass',
        description: 'Premium experience without the premium price.',
        price: 299,
        currency: 'usd',
        period: '/month',
        benefits: ['4-hour session time', 'Little to no ads', 'Access to all games', 'Priority in game queues', 'Play select games on devices other than PC'],
    },
    experience_yearly: {
        productId: 'f892ff75-4afa-4383-b21a-41ffca5070ea',
        name: 'Experience Pass',
        description: 'Premium experience without the premium price.',
        price: 2599,
        currency: 'usd',
        period: '/year',
        benefits: ['4-hour session time', 'Little to no ads', 'Access to all games', 'Priority in game queues', 'Play select games on devices other than PC'],
    },
    premier_monthly: {
        productId: '7c590130-db9e-4bdd-86ac-0ee642116e0f',
        name: 'Premier Pass',
        description: 'Unlimited session time, no ads, access to all games, and more.',
        price: 599,
        currency: 'usd',
        period: '/month',
        benefits: ['Unlimited session time', 'No ads', 'Access to all games', 'Bypass game queues', 'Play any game, anywhere, on any device', 'Early access to high-res gaming prototypes'],
    },
    premier_yearly: {
        productId: '3cd04937-ff66-4de5-a3bf-ae1e54933744',
        name: 'Premier Pass',
        description: 'Unlimited session time, no ads, access to all games, and more.',
        price: 4599,
        currency: 'usd',
        period: '/year',
        benefits: ['Unlimited session time', 'No ads', 'Access to all games', 'Bypass game queues', 'Play any game, anywhere, on any device', 'Early access to high-res gaming prototypes'],
    },
};

for (const key of Object.keys(PLANS)) {
    PLAN_BY_PRODUCT[PLANS[key].productId] = PLANS[key].name + (PLANS[key].period === '/year' ? ' (Yearly)' : ' (Monthly)');
}

function formatPrice(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}

const REGIONS = {
    US: [
        ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
        ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
        ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
        ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
        ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
        ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
        ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
        ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
        ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
        ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
    ],
    CA: [
        ['AB','Alberta'],['BC','British Columbia'],['MB','Manitoba'],['NB','New Brunswick'],
        ['NL','Newfoundland and Labrador'],['NS','Nova Scotia'],['NT','Northwest Territories'],
        ['NU','Nunavut'],['ON','Ontario'],['PE','Prince Edward Island'],['QC','Quebec'],
        ['SK','Saskatchewan'],['YT','Yukon'],
    ],
};

function updateStateOptions() {
    const stateSelect = document.getElementById('state');
    const country = document.getElementById('country').value;
    const regions = REGIONS[country];
    stateSelect.innerHTML = '';
    if (regions) {
        stateSelect.innerHTML = '<option value="">Select</option>' + regions.map(r =>
            `<option value="${r[0]}">${r[1]}</option>`
        ).join('');
        stateSelect.classList.remove('hidden');
        stateSelect.required = true;
    } else {
        stateSelect.innerHTML = '<option value="">State / Province</option>';
        stateSelect.classList.add('hidden');
        stateSelect.required = false;
    }
}

(async () => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    const planData = PLANS[plan];

    // Auto sign-in from iOS token if present
    const iosToken = params.get('idToken');

    if (iosToken) {
        try {
            const { signInWithCustomToken, signInWithCredential, GoogleAuthProvider } = 
                await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
            
            // Exchange the ID token for a credential
            const { OAuthProvider, signInWithCredential: signIn } = 
                await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

            // Verify token on server and get a custom token back
            const res = await fetch('/api/auth/exchange-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: iosToken })
            });
            const data = await res.json();

            if (data.customToken) {
                const { signInWithCustomToken } = 
                    await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
                await signInWithCustomToken(auth, data.customToken);
            }
        } catch (err) {
            console.error('Auto sign-in failed:', err);
        }
    }

    if (!planData) {
        document.getElementById('loadingView').innerHTML = '<p class="error-text">Invalid plan selected. Please go back and choose a membership.</p><a href="/" class="retry-btn">Go Home</a>';
        return;
    }

    document.getElementById('productName').textContent = planData.name;
    document.getElementById('productDescription').textContent = planData.description;
    const formattedPlanPrice = formatPrice(planData.price, planData.currency);
    document.getElementById('priceAmount').textContent = formattedPlanPrice;
    document.getElementById('pricePeriod').textContent = planData.period;
    document.getElementById('submitPrice').textContent = formattedPlanPrice;
    document.getElementById('submitPeriod').textContent = planData.period;
    document.getElementById('benefitsList').innerHTML = planData.benefits.map(b => `<li>${b}</li>`).join('');
    document.getElementById('successMessage').textContent = `Welcome to ${planData.name}. Your membership is now active.`;

    const user = await new Promise((resolve) => {
        const u = auth.currentUser;
        if (u) { resolve(u); return; }
        const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });

    if (!user) {
        window.location.href = `/auth/?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
    }

    const loadingView = document.getElementById('loadingView');
    const form = document.getElementById('checkoutForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMessage');
    const successView = document.getElementById('successView');
    const successMessage = document.getElementById('successMessage');

    document.getElementById('email').value = user.email || '';
    document.getElementById('country').addEventListener('change', updateStateOptions);
    updateStateOptions();

    const membershipInfo = await getMembership(user);

    const activePolarSubs = (membershipInfo.polarSubscriptions || []).filter(s => s.status === 'active');
    const hasSamePlan = activePolarSubs.some(s => s.productId === planData.productId);
    const hasOtherPlan = activePolarSubs.some(s => s.productId !== planData.productId);

    if (hasSamePlan) {
        loadingView.innerHTML = `
            <p class="error-text">You already have an active ${planData.name} membership.</p>
            <a href="/account" class="retry-btn">Manage Account</a>
            <a href="/" class="retry-btn ml-2">Go Home</a>
        `;
        return;
    }

    if (hasOtherPlan) {
        const currentProductId = activePolarSubs.find(s => s.productId !== planData.productId)?.productId;
        const currentPlanName = PLAN_BY_PRODUCT[currentProductId] || 'a membership';
        document.getElementById('replaceWarning').textContent = `You already have ${currentPlanName}. Purchasing this plan will replace it immediately.`;
        document.getElementById('replaceWarning').classList.remove('hidden');
    }

    let checkoutData = null;
    let stripe = null;
    let elements = null;
    let paymentElement = null;

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.textContent = '';
        errorMsg.classList.add('hidden');
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        document.querySelector('.btn-text').classList.toggle('hidden', loading);
        document.querySelector('.btn-loading').classList.toggle('hidden', !loading);
    }

    async function initCheckout() {
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: planData.productId,
                    idToken: idToken,
                }),
            });

            if (res.status === 409) {
                const errData = await res.json();
                loadingView.innerHTML = `
                    <p class="error-text">${errData.error}</p>
                    <a href="/account" class="retry-btn">Manage Account</a>
                    <a href="/" class="retry-btn ml-2">Go Home</a>
                `;
                return;
            }

            checkoutData = await res.json();

            if (!res.ok) {
                throw new Error(checkoutData.error || 'Failed to initialize checkout');
            }

            if (!checkoutData.publishableKey) {
                throw new Error('Payment configuration error - no publishable key');
            }

            stripe = Stripe(checkoutData.publishableKey);

            elements = stripe.elements({
                mode: 'subscription',
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                fonts: [
                    {
                        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
                    },
                ],
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#3730a3',
                        colorBackground: '#1f2937',
                        colorText: '#ffffff',
                        colorDanger: '#fca5a5',
                        fontFamily: 'Inter, sans-serif',
                        fontSizeBase: '15px',
                        borderRadius: '8px',
                        spacingGridRow: '16px',
                        spacingGridColumn: '16px',
                    },
                    rules: {
                        '.Input': {
                            border: '1px solid #374151',
                            padding: '12px 14px',
                            boxShadow: 'none',
                        },
                        '.Input:focus': {
                            border: '1px solid #3730a3',
                            boxShadow: 'none',
                        },
                        '.Input::placeholder': {
                            color: '#6b7280',
                        },
                        '.Label': {
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            marginBottom: '6px',
                        },
                        '.Error': {
                            color: '#fca5a5',
                            fontSize: '13px',
                            marginTop: '4px',
                        },
                    },
                },
            });

            paymentElement = elements.create('payment', {
                terms: { card: 'never', cashapp: 'never' },
                fields: {
                    billingDetails: {
                        name: 'never',
                        email: 'never',
                        address: 'never',
                    },
                },
            });
            paymentElement.mount('#payment-element');

            paymentElement.on('change', (e) => {
                displayError('#payment-element-errors', e);
            });

            loadingView.classList.add('hidden');
            form.classList.remove('hidden');

        } catch (err) {
            console.error('Checkout init error:', err);
            loadingView.innerHTML = `
                <p class="error-text">${err.message}</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            `;
        }
    }

    function displayError(selector, event) {
        const el = document.querySelector(selector);
        if (event.error) {
            el.textContent = event.error.message;
        } else {
            el.textContent = '';
        }
    }

    async function saveMembership(polarCustomerId) {
        try {
            const token = await user.getIdToken();
            await fetch('/api/membership/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken: token,
                    plan: plan,
                    productId: planData.productId,
                    email: user.email,
                    polarCustomerId: polarCustomerId || null,
                }),
            });
        } catch (err) {
            console.error('Failed to save membership:', err);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = user.email;
        const name = document.getElementById('name').value.trim();
        const addressLine1 = document.getElementById('addressLine1').value.trim();
        const addressLine2 = document.getElementById('addressLine2').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        const country = document.getElementById('country').value;

        if (!email) { showError('Please enter your email address.'); return; }
        if (!name) { showError('Please enter your full name.'); return; }
        if (!addressLine1) { showError('Please enter your billing address.'); return; }
        if (!city) { showError('Please enter your city.'); return; }
        if (!state) { showError('Please enter your state.'); return; }
        if (!postalCode) { showError('Please enter your postal code.'); return; }

        const billingAddress = {
            line1: addressLine1,
            line2: addressLine2 || undefined,
            city: city,
            state: state,
            postal_code: postalCode,
            country: country,
        };

        setLoading(true);

        try {
            const { error: submitError } = await elements.submit();

            if (submitError) {
                setLoading(false);
                showError(submitError.message || 'Failed to validate card details.');
                return;
            }

            const { error: tokenError, confirmationToken } = await stripe.createConfirmationToken({
                elements,
                params: {
                    payment_method_data: {
                        billing_details: {
                            name: name || undefined,
                            email: email,
                            address: billingAddress,
                        },
                    },
                },
            });

            if (tokenError) {
                setLoading(false);
                if (tokenError.type === 'validation_error') {
                    showError(tokenError.message);
                } else {
                    showError(tokenError.message || 'Failed to process card details.');
                }
                return;
            }

            const res = await fetch('/api/checkout/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientSecret: checkoutData.clientSecret,
                    confirmationTokenId: confirmationToken.id,
                    customerEmail: email,
                    customerName: name || undefined,
                    customerBillingAddress: {
                        line1: addressLine1,
                        line2: addressLine2 || undefined,
                        city: city,
                        state: state,
                        postalCode: postalCode,
                        country: country,
                    },
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setLoading(false);
                if (res.status === 409) {
                    form.classList.add('hidden');
                    loadingView.innerHTML = `
                        <p class="error-text">${result.error}</p>
                        <a href="/account" class="retry-btn">Manage Account</a>
                        <a href="/" class="retry-btn ml-2">Go Home</a>
                    `;
                    loadingView.classList.remove('hidden');
                    return;
                }
                showError(result.error || 'Payment was declined. Please try a different card.');
                return;
            }

            if (result.intentStatus === 'requires_action' && result.intentClientSecret) {
                const { error: actionError } = await stripe.handleNextAction({
                    clientSecret: result.intentClientSecret,
                });

                if (actionError) {
                    setLoading(false);
                    showError(actionError.message || 'Authentication failed. Please try again.');
                    return;
                }
            }

            await saveMembership(result.customerId);

            successMessage.textContent = `Welcome to ${planData.name}. Your membership is now active.`;
            form.classList.add('hidden');
            successView.classList.remove('hidden');

        } catch (err) {
            setLoading(false);
            console.error('Payment error:', err);
            showError(err.message || 'An unexpected error occurred. Please try again.');
        }
    });

    initCheckout();
})();
