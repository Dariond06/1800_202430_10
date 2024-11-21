window.onload = function () {
  // Reference Firestore
  const db = firebase.firestore();

  // Get the assignment ID from the URL
  const assignmentId = new URLSearchParams(window.location.search).get('id');
  if (!assignmentId) {
    return displayError('Invalid assignment. Please check the URL.');
  }

  // Wait for the user to be authenticated
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      await handleUserAuth(db, user, assignmentId);
    } else {
      displayError('Please log in to view assignments.');
    }
  });
};

// Handle authenticated user, fetch user class set and assignment data
async function handleUserAuth(db, user, assignmentId) {
  try {
    const userId = user.uid;

    // Step 1: Fetch the user's class set
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return displayError("User not found.");

    const classSet = userDoc.data().classSet;
    if (!classSet) return displayError("Class set not assigned to user.");

    // Step 2: Fetch assignment data from the class set
    await fetchAssignmentData(db, classSet, assignmentId);
  } catch (error) {
    displayError('Error fetching data. Please try again later.');
    console.error('Error:', error);
  }
}

// Fetch assignment data based on the class set
async function fetchAssignmentData(db, classSet, assignmentId) {
  try {
    const assignmentDoc = await db
      .collection("classes")
      .doc(classSet)
      .collection("assignments")
      .doc(assignmentId)
      .get();

    if (!assignmentDoc.exists) {
      return displayError('Assignment not found.');
    }

    const data = assignmentDoc.data();
    populateAssignmentData(data);
  } catch (error) {
    displayError('Error fetching assignment data.');
    console.error('Error:', error);
  }
}

// Populate the HTML elements with assignment data
function populateAssignmentData(data) {
  if (data.courseName && data.title && data.dueDate && data.details && data.links) {
    document.getElementById('courseName').innerHTML = `${data.courseName}`;
    document.getElementById('assignmentTitle').innerHTML = `${data.title}`;

    const formattedDate = data.dueDate.toDate().toLocaleString();
    document.getElementById('dueDate').innerHTML = `${formattedDate}`;

    document.getElementById('assignmentDetails').innerHTML = `${data.details}`;
    document.getElementById('links').innerHTML = `${data.links}`; // puts the link text from firestore 
    document.getElementById('links').href = `${data.links}`; //adds the link to the href

  } else {
    displayError('Incomplete assignment data.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      isItComplete(user); // Pass the authenticated user to the function
    } else {
      console.error("User not authenticated.");
    }
  });
});

function isItComplete(user) {
  const assignmentId = new URLSearchParams(window.location.search).get('id');

  if (!assignmentId) {
    console.error("Assignment ID not found in URL.");
    return;
  }

  const userId = user.uid;

  firebase.firestore()
    .collection('users')
    .doc(userId)
    .collection('completedAssignments')
    .doc(assignmentId)
    .get()
    .then((doc) => {
      const complete = document.getElementById('completeAssignment');
      if (doc.exists) {
        complete.textContent = "Mark As Not Complete";
        complete.classList.add("not-complete"); // Add class for dark gray styling
      } else {
        complete.textContent = "Mark As Complete";
        complete.classList.remove("not-complete"); // Remove class for default styling
      }
    })
    .catch((error) => {
      console.error('Error checking assignment status:', error);
    });
}

function markAsDone() {
  const user = firebase.auth().currentUser;
  const assignmentId = new URLSearchParams(window.location.search).get('id');

  if (user && assignmentId) {
    const userId = user.uid;

    firebase.firestore()
      .collection('users')
      .doc(userId)
      .collection('completedAssignments')
      .doc(assignmentId)
      .set({ assignmentId })
  } else {
    console.error('User not authenticated or assignment ID not found.');
  }
}

function markAsNotDone() {
  const user = firebase.auth().currentUser;
  const assignmentId = new URLSearchParams(window.location.search).get('id');

  if (user && assignmentId) {
    const userId = user.uid;

    firebase.firestore()
      .collection('users')
      .doc(userId)
      .collection('completedAssignments')
      .doc(assignmentId)
      .delete()
  } else {
    console.error('User not authenticated or assignment ID not found.');
  }
}

function toggleCompletion(button) {
  if (button.textContent.trim() === "Mark As Complete") {
    button.textContent = "Mark As Still Due";
    button.classList.add("not-complete"); // Add class for dark gray styling
    markAsDone(); // Call function to mark the assignment as complete
  } else {
    button.textContent = "Mark As Done";
    button.classList.remove("not-complete"); // Remove class for default styling
    markAsNotDone(); // Call function to mark the assignment as not complete
  }
}






document.getElementById('editAssignment').addEventListener('click', async function() {
  const isEditing = this.textContent === "Save"; // Toggle check
  
  if (isEditing) {
    // Save edited data to Firestore
    await saveChanges();
    this.textContent = "Edit";  // Change button text back to "Edit"
    toggleEdit(false); // Revert to the display mode
  } else {
    this.textContent = "Save"; // Change button text to "Save"
    toggleEdit(true); // Show input fields for editing
  }
});

function toggleEdit(isEditing) {
  const detailsText = document.getElementById('assignmentDetails');
  const detailsInput = document.getElementById('assignmentDetailsInput');
  const linksText = document.getElementById('links');
  const linksInput = document.getElementById('linksInput');
  
  if (isEditing) {
    // Show input fields and hide text
    detailsInput.style.display = 'block';
    detailsText.style.display = 'none';
    linksInput.style.display = 'block';
    linksText.style.display = 'none';
    
    // Set input values to the current content
    detailsInput.value = detailsText.textContent;
    linksInput.value = linksText.href;
  } else {
    // Hide input fields and show text
    detailsInput.style.display = 'none';
    detailsText.style.display = 'block';
    linksInput.style.display = 'none';
    linksText.style.display = 'block';
  }
}

async function saveChanges() {
  const assignmentId = new URLSearchParams(window.location.search).get('id');
  const user = firebase.auth().currentUser;
  
  if (user && assignmentId) {
    const userId = user.uid;

    // Get the user's class set from their Firestore profile
    try {
      const userDoc = await firebase.firestore()
        .collection("users")
        .doc(userId)
        .get();
        
      const classSet = userDoc.data().classSet; // Assuming 'classSet' field contains the user's class set

      if (classSet) {
        // Get the new details and link from the input fields
        const newDetails = document.getElementById('assignmentDetailsInput').value;
        const newLink = document.getElementById('linksInput').value;

        // Navigate to the correct class set collection and update the assignment
        const assignmentDoc = await firebase.firestore()
          .collection("classes")
          .doc(classSet)  // Use the user's class set to find the correct class collection
          .collection("assignments")
          .doc(assignmentId);
        
        await assignmentDoc.update({
          details: newDetails,
          links: newLink,
        });
        
        // Update UI with new data
        document.getElementById('assignmentDetails').textContent = newDetails;
        document.getElementById('links').href = newLink;
        document.getElementById('links').textContent = newLink;
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  }
}


document.getElementById('deleteAssignment').addEventListener('click', async function() {
  // Confirm with the user
  const confirmation = confirm("Are you sure you want to delete this assignment? This action cannot be undone.");
  
  if (confirmation) {
    try {
      const assignmentId = new URLSearchParams(window.location.search).get('id');
      const user = firebase.auth().currentUser;

      if (user && assignmentId) {
        const userId = user.uid;

        // Get the user's class set from their Firestore profile
        const userDoc = await firebase.firestore()
          .collection("users")
          .doc(userId)
          .get();

        const classSet = userDoc.data().classSet; // Assuming 'classSet' field contains the user's class set

        if (classSet) {
          // Navigate to the correct class set collection and delete the assignment
          await firebase.firestore()
            .collection("classes")
            .doc(classSet)
            .collection("assignments")
            .doc(assignmentId)
            .delete();

          alert("Assignment successfully deleted.");
          // Optionally, redirect to another page after deletion
          window.location.href = "/main.html"; // Replace with the appropriate URL
        } else {
          console.error("Class set not found for the user.");
        }
      } else {
        console.error("User not authenticated or assignment ID not found.");
      }
    } catch (error) {
      console.error("Error deleting assignment from Firestore:", error);
      alert("Failed to delete assignment. Please try again.");
    }
  } else {
    // User cancelled the deletion
    console.log("Assignment deletion cancelled by user.");
  }
});
