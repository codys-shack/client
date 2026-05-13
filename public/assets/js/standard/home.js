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