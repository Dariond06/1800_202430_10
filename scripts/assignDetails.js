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
    document.getElementById('courseName').innerHTML = `Course Number:<br>${data.courseName}`;
    document.getElementById('assignmentTitle').innerHTML = `Assignment Title: <br>${data.title}`;

    // Check if dueDate is a Firestore Timestamp
    if (data.dueDate && data.dueDate.seconds) {
      const formattedDate = new Date(data.dueDate.seconds * 1000).toLocaleDateString();
      document.getElementById('dueDate').innerHTML = `Due Date: ${formattedDate}`;
    } else {
      document.getElementById('dueDate').innerHTML = 'Invalid due date';
    }

    document.getElementById('assignmentDetails').innerHTML.href = `${data.details}`;
    document.getElementById('links').innerHTML = `${data.links}`; //This is breaking the assignDetails page
  } else {
    displayError('Incomplete assignment data.');
  }
}

// Function to display errors
function displayError(message) {
  document.getElementById('courseName').innerHTML = message;
  document.getElementById('assignmentTitle').innerHTML = '';
  document.getElementById('dueDate').innerHTML = '';
  document.getElementById('assignmentDetails').innerHTML = 'Details unavailable.';
}

// Go back to the previous page when the back button is clicked
function goBack() {
  window.history.back();
}
