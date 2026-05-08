// Helper: set cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

// Helper: get cookie
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

    // Show banner only if cookie not set
    if (!getCookie("cookieConsent")) {
        setTimeout(function () {
            $("#cookieConsent")
                .fadeIn(200)
                .css("display", "flex");
        }, 500);
    }

    // Accept cookies (class selector)
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