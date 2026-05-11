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

// Memberships

const monthly_membership_button = document.getElementById('membership-type-monthly');
const yearly_membership_button = document.getElementById('membership-type-yearly');

const monthly_memberships = document.getElementById('membership-viewer-monthly');
const yearly_memberships = document.getElementById('membership-viewer-yearly');

monthly_membership_button.addEventListener('click', function() {
    monthly_membership_button.classList.add('active');
    yearly_membership_button.classList.remove('active');

    monthly_memberships.style.display = 'flex';
    yearly_memberships.style.display = 'none';
});

yearly_membership_button.addEventListener('click', function() {
    yearly_membership_button.classList.add('active');
    monthly_membership_button.classList.remove('active');

    yearly_memberships.style.display = 'flex';
    monthly_memberships.style.display = 'none';
});