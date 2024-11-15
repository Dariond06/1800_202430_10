// Get the current page filename
const currentPage = window.location.pathname.split('/').pop();

// Map page names to their corresponding footer link IDs
const pageLinks = {
    'classes.html': 'classesLink',
    'main.html': 'homeLink',
    'setting.html': 'settingLink'
};

// Add 'active' class to the corresponding footer card if it matches the current page
if (pageLinks[currentPage]) {
    document.getElementById(pageLinks[currentPage]).querySelector('.footer-card').classList.add('active');
}
