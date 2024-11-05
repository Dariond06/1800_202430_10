// Initialize FirebaseUI Widget
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // Check if user is new
            if (authResult.additionalUserInfo.isNewUser) {
                // Hide FirebaseUI
                document.getElementById('firebaseui-auth-container').style.display = 'none';
                
                // Show Class Code input form
                document.getElementById('class-code-form').style.display = 'block';
            } else {
                // If not a new user, continue to the redirect URL
                return true;
            }
        },
        uiShown: function() {
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



function submitClassCode() {
  const classCode = document.getElementById('classCode').value;
  const userId = firebase.auth().currentUser.uid;
  const userName = firebase.auth().currentUser.displayName; // Get the user's display name from Firebase Auth

  // Query to check if the class code exists in the classes collection
  firebase.firestore().collection('classes').where('classCode', '==', classCode).get()
  .then((querySnapshot) => {
      if (!querySnapshot.empty) {
          // Class code exists, get the first matching document
          const classDoc = querySnapshot.docs[0]; // Get the first matching class document
          
          // Save the user's data to the users subcollection of the matched class
          firebase.firestore().collection('users').doc(userId).set({
              name: userName, // User's name
              classSet: classDoc.id, // Class set related to the collection
              assignments: [] // Initialize an empty array for assignments
          }).then(() => {
              // Redirect to the main page
              window.location.href = 'main.html';
          }).catch((error) => {
              console.error("Error adding user to class: ", error);
          });
      } else {
          // Class code does not exist
          alert("The entered class code does not exist. Please try again.");
      }
  }).catch((error) => {
      console.error("Error checking class code: ", error);
  });
}

