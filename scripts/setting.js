var currentUser; // Points to the document of the user who is logged in

// Function to populate user info on the form
function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in:", user.uid);
            currentUser = db.collection("users").doc(user.uid);

            currentUser.get()
                .then(userDoc => {
                    if (userDoc.exists) {
                        let userName = userDoc.data().name;
                        if (userName) {
                            document.getElementById("nameInput").value = userName;
                        }
                    } else {
                        console.error("User document does not exist");
                    }
                })
                .catch(error => {
                    console.error("Error getting user document:", error);
                });

            loadPrioritySettings(user.uid);
        } else {
            console.log("No user is signed in.");
        }
    });
}

// Function to enable editing user info
function editUserInfo() {
    document.getElementById('personalInfoFields').disabled = false;
}

// Function to save user info
function saveUserInfo() {
    const userName = document.getElementById('nameInput').value;

    if (!userName.trim()) {
        Swal.fire("Missing Field", "Please enter your name before saving.", "warning");
        return;
    }

    currentUser.update({ name: userName })
        .then(() => {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: "Your information has been updated."
            });
        })
        .catch(error => {
            console.error("Error updating document:", error);
            Swal.fire("Error", "Failed to save your information. Please try again.", "error");
        });

    document.getElementById('personalInfoFields').disabled = true;
}

// Function to log out user
function logOutUser() {
    Swal.fire({
        title: "Are you sure you want to log out?",
        showCancelButton: true,
        confirmButtonText: "Log Out",
        cancelButtonText: "Cancel"
    }).then((result) => {
        if (result.isConfirmed) {
            firebase.auth().signOut()
                .then(() => {
                    Swal.fire("Logged Out", "You have successfully logged out.", "success")
                        .then(() => {
                            window.location.href = 'index.html';
                        });
                })
                .catch(error => {
                    console.error("Error logging out: ", error);
                    Swal.fire("Error", "Failed to log out. Please try again.", "error");
                });
        }
    });
}

// Firestore reference and default priority days
const defaultPriorities = { red: 3, orange: 4, yellow: 6 };

// Function to load priority settings
function loadPrioritySettings(userId) {
    const priorityDocRef = db.collection("users").doc(userId).collection("settings").doc("priorities");

    priorityDocRef.get()
        .then((doc) => {
            if (doc.exists) {
                const priorities = doc.data();
                document.getElementById("redDays").value = priorities.red || defaultPriorities.red;
                document.getElementById("orangeDays").value = priorities.orange || defaultPriorities.orange;
                document.getElementById("yellowDays").value = priorities.yellow || defaultPriorities.yellow;
            } else {
                setDefaultPriorities();
            }
        })
        .catch(error => {
            console.error("Error loading priority settings:", error);
            setDefaultPriorities();
        });
}

// Function to save priority settings
function savePrioritySettings() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const priorityDocRef = db.collection("users").doc(user.uid).collection("settings").doc("priorities");

            const red = parseInt(document.getElementById("redDays").value) || defaultPriorities.red;
            const orange = parseInt(document.getElementById("orangeDays").value) || defaultPriorities.orange;
            const yellow = parseInt(document.getElementById("yellowDays").value) || defaultPriorities.yellow;

            if (red >= orange || orange >= yellow) {
                Swal.fire("Validation Error", "Priority values must follow the order: Red < Orange < Yellow.", "warning");
                return;
            }

            Swal.fire({
                title: "Do you want to save the priority changes?",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Save",
                denyButtonText: `Don't save`
            }).then((result) => {
                if (result.isConfirmed) {
                    const priorities = { red, orange, yellow };
                    priorityDocRef.set(priorities)
                        .then(() => {
                            const Toast = Swal.mixin({
                                toast: true,
                                position: "top-end",
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.onmouseenter = Swal.stopTimer;
                                    toast.onmouseleave = Swal.resumeTimer;
                                }
                            });
                            Toast.fire({
                                icon: "success",
                                title: "Your information has been updated."
                            });
                        })
                        .catch(error => {
                            console.error("Error saving priority settings:", error);
                            Swal.fire("Error", "Failed to save priority settings. Please try again.", "error");
                        });
                } else if (result.isDenied) {
                    Swal.fire("Changes Not Saved", "Your priority changes were not saved.", "info");
                }
            });
        }
    });
}

// Function to reset priority settings
function resetPrioritySettings() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            Swal.fire({
                title: "Are you sure you want to reset priorities to default?",
                showCancelButton: true,
                confirmButtonText: "Reset",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    const priorityDocRef = db.collection("users").doc(user.uid).collection("settings").doc("priorities");

                    document.getElementById("redDays").value = defaultPriorities.red;
                    document.getElementById("orangeDays").value = defaultPriorities.orange;
                    document.getElementById("yellowDays").value = defaultPriorities.yellow;

                    priorityDocRef.set(defaultPriorities)
                        .then(() => {
                            Swal.fire("Reset Complete", "Priority settings have been reset to defaults.", "success");
                        })
                        .catch(error => {
                            console.error("Error resetting priority settings:", error);
                            Swal.fire("Error", "Failed to reset priority settings. Please try again.", "error");
                        });
                }
            });
        }
    });
}

// Function to set default priorities
function setDefaultPriorities() {
    document.getElementById("redDays").value = defaultPriorities.red;
    document.getElementById("orangeDays").value = defaultPriorities.orange;
    document.getElementById("yellowDays").value = defaultPriorities.yellow;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    populateUserInfo();
});




// Function to change the theme using the 'data-theme' attribute on <html>
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Save the selected theme to localStorage
}

// Get all radio buttons
const themeRadios = document.querySelectorAll('input[name="themeRadio"]');

// Add event listeners to all radio buttons to handle theme changes
themeRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        const selectedTheme = event.target.getAttribute('data-theme');
        changeTheme(selectedTheme);
    });
});

// Apply the saved theme or default theme on page load
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        changeTheme(savedTheme);

        // Set the corresponding radio button as checked
        const radioToCheck = document.querySelector(`input[name="themeRadio"][data-theme="${savedTheme}"]`);
        if (radioToCheck) {
            radioToCheck.checked = true;
        }
    } else {
        // If no theme is saved, check the default radio button and apply its theme
        const defaultRadio = document.querySelector('input[name="themeRadio"]:checked');
        if (defaultRadio) {
            const defaultTheme = defaultRadio.getAttribute('data-theme');
            changeTheme(defaultTheme);
        }
    }
});

