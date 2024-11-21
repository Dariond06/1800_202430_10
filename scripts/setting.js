var currentUser; // Points to the document of the user who is logged in

// Function to populate user info on the form
function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Access current user document in Firestore
            currentUser = db.collection("users").doc(user.uid);

            // Get the document for the current user
            currentUser.get()
                .then(userDoc => {
                    // Get and populate user data
                    let userName = userDoc.data().name;
                    if (userName != null) {
                        document.getElementById("nameInput").value = userName;
                    }
                })
                .catch(error => {
                    console.log("Error getting user document:", error);
                });

            // Load priority settings
            loadPrioritySettings(user.uid);
        } else {
            console.log("No user is signed in");
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

    currentUser.update({ name: userName })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch(error => {
            console.log("Error updating document:", error);
        });

    document.getElementById('personalInfoFields').disabled = true;
}

// Function to log out user
function logOutUser() {
    firebase.auth().signOut().then(() => {
        alert('You have logged out successfully!');
        window.location.href = 'login.html';
    }).catch(error => {
        console.error('Error logging out: ', error);
    });
}

// Firestore reference and default priority days
const defaultPriorities = { red: 3, orange: 4, yellow: 6, green: 7 };

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

            // Get priority values from the form
            const red = parseInt(document.getElementById("redDays").value) || defaultPriorities.red;
            const orange = parseInt(document.getElementById("orangeDays").value) || defaultPriorities.orange;
            const yellow = parseInt(document.getElementById("yellowDays").value) || defaultPriorities.yellow;

            // Validation: Ensure red < orange < yellow < green
            if (red >= orange || orange >= yellow) {
                alert("Priority values must follow the order: Red < Orange < Yellow. Please adjust your input.");
                return; // Stop the function if validation fails
            }

            const priorities = { red, orange, yellow };

            // Save valid priorities to Firestore
            priorityDocRef.set(priorities)
                .then(() => {
                    alert("Your priority settings have been saved!");
                })
                .catch(error => {
                    console.error("Error saving priority settings:", error);
                    alert("Failed to save priority settings. Please try again.");
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



function resetPrioritySettings() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const priorityDocRef = db.collection("users").doc(user.uid).collection("settings").doc("priorities");

            // Reset form fields to default priorities
            document.getElementById("redDays").value = defaultPriorities.red;
            document.getElementById("orangeDays").value = defaultPriorities.orange;
            document.getElementById("yellowDays").value = defaultPriorities.yellow;

            // Update Firestore with default priorities
            priorityDocRef.set(defaultPriorities)
                .then(() => {
                    alert("Priority settings have been reset to defaults.");
                    savePrioritySettings()
                })
                .catch(error => {
                    console.error("Error resetting priority settings:", error);
                    alert("Failed to reset priority settings. Please try again.");
                });
        }
    });
}


// Call the populate function on page load
document.addEventListener("DOMContentLoaded", () => {
    populateUserInfo();
});
