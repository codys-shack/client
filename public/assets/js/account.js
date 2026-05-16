import { auth, getMembership } from "./global.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ALL_PLANS = [
    { plan: 'experience_monthly', productId: '6c5e0381-35ed-4d4e-8c79-5dd2ce4cb9e1', label: 'Experience Pass (Monthly)', price: 899, period: '/month' },
    { plan: 'experience_yearly', productId: 'f892ff75-4afa-4383-b21a-41ffca5070ea', label: 'Experience Pass (Yearly)', price: 7999, period: '/year' },
    { plan: 'premier_monthly', productId: '7c590130-db9e-4bdd-86ac-0ee642116e0f', label: 'Premier Pass (Monthly)', price: 1899, period: '/month' },
    { plan: 'premier_yearly', productId: '3cd04937-ff66-4de5-a3bf-ae1e54933744', label: 'Premier Pass (Yearly)', price: 14999, period: '/year' },
];

const PLAN_LABELS = Object.fromEntries(ALL_PLANS.map(p => [p.plan, p.label]));

const PLAN_BY_PRODUCT = Object.fromEntries(ALL_PLANS.map(p => [p.productId, { label: p.label, plan: p.plan }]));

const loadingView = document.getElementById('loadingView');
const accountView = document.getElementById('accountView');
const errorView = document.getElementById('errorView');
const errorMessage = document.getElementById('errorMessage');
const accountEmail = document.getElementById('accountEmail');
const noMembership = document.getElementById('noMembership');
const hasMembership = document.getElementById('hasMembership');
const planName = document.getElementById('planName');
const planStatus = document.getElementById('planStatus');
const renewalInfo = document.getElementById('renewalInfo');
const cancelStatus = document.getElementById('cancelStatus');
const cancelSection = document.getElementById('cancelSection');
const reactivateSection = document.getElementById('reactivateSection');
const upgradeSection = document.getElementById('upgradeSection');
const planOptions = document.getElementById('planOptions');
const cancelBtn = document.getElementById('cancelBtn');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const keepBtn = document.getElementById('keepBtn');
const reactivateBtn = document.getElementById('reactivateBtn');

function showError(msg) {
    errorMessage.textContent = msg;
    loadingView.classList.add('hidden');
    accountView.classList.add('hidden');
    errorView.classList.remove('hidden');
}

async function loadAccount(user) {
    try {
        accountEmail.textContent = user.email;

        const data = await getMembership(user);
        const membership = data.membership;
        const polarSubs = data.polarSubscriptions || [];

        const activeSub = polarSubs.find(s => s.status === 'active');
        const planKey = (membership && PLAN_LABELS[membership.membership]) ? membership.membership : null;
        const polarPlan = activeSub ? PLAN_BY_PRODUCT[activeSub.productId] : null;

        if (planKey || polarPlan) {
            noMembership.classList.add('hidden');
            hasMembership.classList.remove('hidden');
            planName.textContent = polarPlan ? polarPlan.label : PLAN_LABELS[planKey];

            if (activeSub) {
                if (activeSub.cancelAtPeriodEnd) {
                    planStatus.textContent = 'Active (cancel scheduled)';
                    planStatus.className = 'status-warning';
                    cancelSection.classList.add('hidden');
                    reactivateSection.classList.remove('hidden');
                    const endDate = new Date(activeSub.currentPeriodEnd).toLocaleDateString();
                    renewalInfo.textContent = `Access ends: ${endDate}`;
                } else {
                    planStatus.textContent = 'Active';
                    planStatus.className = 'status-active';
                    cancelSection.classList.remove('hidden');
                    reactivateSection.classList.add('hidden');
                    const nextDate = new Date(activeSub.currentPeriodEnd).toLocaleDateString();
                    renewalInfo.textContent = `Next billing date: ${nextDate}`;
                }
            } else {
                planStatus.textContent = 'No active subscription';
                planStatus.className = 'status-error';
                renewalInfo.textContent = 'Your plan is saved on your account, but no active subscription was found. You may need to re-subscribe.';
                cancelSection.classList.add('hidden');
                reactivateSection.classList.add('hidden');
            }
            upgradeSection.classList.remove('hidden');
            const currentProductId = activeSub?.productId;
            planOptions.innerHTML = ALL_PLANS.map(p => {
                const active = p.productId === currentProductId;
                const price = '$' + (p.price / 100).toFixed(0);
                return `
                    <div class="plan-option ${active ? 'current' : ''}">
                        <div>
                            <strong>${p.label}</strong>
                            <span class="plan-price">${price}${p.period}</span>
                        </div>
                        ${active ? '<span class="current-badge">Current</span>' : `<a href="/checkout?plan=${p.plan}" class="change-btn">Switch</a>`}
                    </div>
                `;
            }).join('');
        } else {
            noMembership.classList.remove('hidden');
            hasMembership.classList.add('hidden');
            upgradeSection.classList.add('hidden');
        }

        loadingView.classList.add('hidden');
        accountView.classList.remove('hidden');

    } catch (err) {
        console.error('Account load error:', err);
        showError(err.message || 'Failed to load account.');
    }
}

cancelBtn.addEventListener('click', () => {
    cancelConfirm.classList.remove('hidden');
    cancelBtn.classList.add('hidden');
});

keepBtn.addEventListener('click', () => {
    cancelConfirm.classList.add('hidden');
    cancelBtn.classList.remove('hidden');
});

confirmCancelBtn.addEventListener('click', async () => {
    try {
        confirmCancelBtn.disabled = true;
        confirmCancelBtn.textContent = 'Canceling...';

        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/membership/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
        });

        if (!res.ok) {
            const data = await res.json();
            showError(data.error || 'Failed to cancel.');
            return;
        }

        location.reload();
    } catch (err) {
        showError(err.message);
    }
});

reactivateBtn.addEventListener('click', async () => {
    try {
        reactivateBtn.disabled = true;
        reactivateBtn.textContent = 'Reactivating...';

        const token = await auth.currentUser.getIdToken();
        const data = await getMembership();
        const activeSub = (data.polarSubscriptions || []).find(s => s.status === 'active' && s.cancelAtPeriodEnd);

        if (activeSub) {
            const unsubRes = await fetch('/api/membership/reactivate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token, subscriptionId: activeSub.id }),
            });

            if (!unsubRes.ok) {
                const errData = await unsubRes.json();
                showError(errData.error || 'Failed to reactivate.');
                return;
            }
        }

        location.reload();
    } catch (err) {
        showError(err.message);
    }
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/auth/?redirect=/account';
        return;
    }
    loadAccount(user);
});
