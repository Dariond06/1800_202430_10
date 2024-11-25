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


// Select the element you want to hide or show
const newAssignBtn = document.querySelector('.newAssignBtn');

// Check if the current page is 'main.html'
if (currentPage !== 'main.html' && newAssignBtn) {
    newAssignBtn.style.display = 'none'; // Hide the button
} else if (newAssignBtn) {
    newAssignBtn.style.display = ''; // Ensure it's visible on 'main.html'
}
