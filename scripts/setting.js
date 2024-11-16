var currentUser; // Points to the document of the user who is logged in

function populateUserInfo() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if user is signed in
        if (user) {
            // Go to the correct user document by referencing the user UID
            currentUser = db.collection("users").doc(user.uid);

            // Get the document for the current user
            currentUser.get()
                .then(userDoc => {
                    // Get the data fields of the user
                    let userName = userDoc.data().name;

                    // If the data fields are not empty, then write them into the form
                    if (userName != null) {
                        document.getElementById("nameInput").value = userName;
                    }
                })
                .catch(error => {
                    console.log("Error getting user document:", error);
                });
        } else {
            // No user is signed in
            console.log("No user is signed in");
        }
    });
}

// Call the function to run it
populateUserInfo();

function editUserInfo() {
    // Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

function saveUserInfo() {
    // Get user-entered values
    const userName = document.getElementById('nameInput').value;

    // Update the user's document in Firestore
    currentUser.update({
        name: userName,
    })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch(error => {
            console.log("Error updating document:", error);
        });

    // Disable edit after saving
    document.getElementById('personalInfoFields').disabled = true;
}



function logOutUser() {
    firebase.auth().signOut().then(() => {
        // Redirect to the login page or show a message
        alert('You have logged out successfully!');
        window.location.href = 'login.html';  // Adjust this to your login page URL
    }).catch((error) => {
        console.error('Error logging out: ', error);
    });
}
