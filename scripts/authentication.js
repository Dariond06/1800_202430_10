// Initialize FirebaseUI Widget
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // Checks if the user is new
            if (authResult.additionalUserInfo.isNewUser) {

                document.getElementById('firebaseui-auth-container').style.display = 'none';

                // Shows Class Code input form
                document.getElementById('class-code-form').style.display = 'block';

                // Call function to populate the dropdown with class data
                populateClassDropdown();
            } else {
                // If it's not a new user, continue to the redirect URL
                return true;
            }
        },
        uiShown: function () {
            document.getElementById('loader').style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInSuccessUrl: 'main.html',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    tosUrl: '<your-tos-url>',
    privacyPolicyUrl: '<your-privacy-policy-url>'
};

// Start FirebaseUI
ui.start('#firebaseui-auth-container', uiConfig);

// Function to populate the dropdown with class data from Firestore
function populateClassDropdown() {
    const dropdown = document.getElementById('classCodeDropdown');
    
    // Fetch classes from Firestore
    firebase.firestore().collection('classes').get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Log the document ID to ensure we are fetching the correct data
            console.log("Class ID (Document ID): ", doc.id); 
            console.log("Class Data: ", doc.data()); 

            // Get the document ID 
            const classId = doc.id; 
            const className = doc.id; 

            // Create an option for each class document
            const option = document.createElement('option');
            option.value = classId; 
            option.textContent = className; 
            dropdown.appendChild(option);
        });
    }).catch((error) => {
        console.error("Error fetching classes: ", error);
    });
}



function submitClassCode() {
    const classCode = document.getElementById('classCodeDropdown').value;
    const userId = firebase.auth().currentUser.uid;
    const userName = firebase.auth().currentUser.displayName; // Gets the user's display name from FirebaseAuth

    if (!classCode) {
        alert("Please select a class.");
        return;
    }

    // Query to fetch the selected class from Firestore by its document ID
    firebase.firestore().collection('classes').doc(classCode).get()
    .then((classDoc) => {
        if (classDoc.exists) {
            // Saves the user's data to the users subcollection of the matched class
            firebase.firestore().collection('users').doc(userId).set({
                name: userName, // User's name
                classSet: classDoc.id, // Class set related to the collection
            }).then(() => {
                // Redirects to the main page
                window.location.href = 'main.html';
            }).catch((error) => {
                console.error("Error adding user to class: ", error);
            });
        } else {
            // Class code does not exist
            alert("The selected class does not exist. Please try again.");
        }
    }).catch((error) => {
        console.error("Error fetching class: ", error);
    });
}
