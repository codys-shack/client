import { auth } from "../global.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

$(document).ready(function() {
    const authForm = $('#auth-form');
    const errorMsg = $('#error-message');
    const authCard = $('#auth-card');
    const userProfile = $('#user-profile');
    const userEmailDisplay = $('#user-email-display');
    const logoutBtn = $('#logout-btn');

    const isSignIn = !window.location.pathname.includes('join.html');

    authForm.on('submit', async function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();
        errorMsg.hide();

        try {
            if (isSignIn) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error("Auth Error:", error);
            errorMsg.text(error.message).show();
        }
    });

    logoutBtn.on('click', async function() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authCard.hide();
            userProfile.show();
            userEmailDisplay.text(user.email);

            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect) {
                window.location.href = redirect;
            }
        } else {
            userProfile.hide();
            authCard.show();
        }
    });
});
