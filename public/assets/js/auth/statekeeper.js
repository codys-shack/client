import { auth } from "../global.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

$(document).ready(function() {;

    // Check if user is signed in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            $('#navbar .nav-links').prepend(`<li><a href="/home/">Play Now</a></li>`);
            $('#navbar .nav-links').append(`<li><a href="#" id="logout">Logout</a></li>`);
            $('#sign-in-link').remove()
            $('#play-now-link').remove();

            $('#play-now-splash-link').attr("href", "/home/");

            // Membership changes go here
        }
    });

    // Sign out the user
    $(document).on('click', '#logout', async function(e) {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
});
