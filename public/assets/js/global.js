// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrhw8aGQZ0nQLYfw7vICaIGXelpluaJ_U",
  authDomain: "codys-shack-main.firebaseapp.com",
  projectId: "codys-shack-main",
  storageBucket: "codys-shack-main.firebasestorage.app",
  messagingSenderId: "303523012032",
  appId: "1:303523012032:web:ea83a3e4c59edfced73c25",
  measurementId: "G-DBCQ2CX7Y1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Cookies Pop-up
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

$(document).ready(function () {

    if (!getCookie("cookieConsent")) {
        setTimeout(function () {
            $("#cookieConsent")
                .fadeIn(200)
                .css("display", "flex");
        }, 500);
    }

    $(".cookieConsentOK").on("click", function () {
        setCookie("cookieConsent", "true", 365);
        $("#cookieConsent").fadeOut(200);
    });

});

// Navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 75) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});