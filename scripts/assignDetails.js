// Include SweetAlert library (add this in your HTML <head>)
/*
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
*/

window.onload = function () {
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

// Check if the assignment is marked as complete or not
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

// Mark assignment as complete
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
          title: "Marked as done!"
      });
      })
      .catch((error) => {
        Swal.fire('Error!', 'There was an error marking the assignment as complete.', 'error');
      });
  } else {
    Swal.fire('Error!', 'User not authenticated or assignment ID not found.', 'error');
  }
}

// Mark assignment as not done
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
          title: "Marked as not done!"
      });
      })
      .catch((error) => {
        Swal.fire('Error!', 'There was an error marking the assignment as not complete.', 'error');
      });
  } else {
    Swal.fire('Error!', 'User not authenticated or assignment ID not found.', 'error');
  }
}

// Toggle completion status
function toggleCompletion(button) {
  const currentStatus = button.dataset.status;

  if (currentStatus === "not-done") {
    button.textContent = "Mark As Still Due";
    button.classList.add("not-complete"); 
    button.dataset.status = "done"; 
    markAsDone(); //
  } else if (currentStatus === "done") {
    button.textContent = "Mark As Done";
    button.classList.remove("not-complete");
    button.dataset.status = "not-done"; 
    markAsNotDone(); 
  }
}


document.getElementById('editAssignment').addEventListener('click', async function () {
  const isEditing = this.textContent === "Save"; // Toggle check

  if (isEditing) {
    // Save edited data to Firestore
    await saveChanges();
    this.textContent = "Edit";  // Change button text back to "Edit"
    toggleEdit(false); // Revert to the display mode
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
  } else {
    this.textContent = "Save"; // Change button text to "Save"
    toggleEdit(true); // Show input fields for editing
  }
});

// Toggle edit mode
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

// Save changes to Firestore
async function saveChanges() {
  const assignmentId = new URLSearchParams(window.location.search).get('id');
  const user = firebase.auth().currentUser;

  if (user && assignmentId) {
    const userId = user.uid;

    try {
      const userDoc = await firebase.firestore()
        .collection("users")
        .doc(userId)
        .get();
        
      const classSet = userDoc.data().classSet;

      if (classSet) {
        const newDetails = document.getElementById('assignmentDetailsInput').value;
        const newLink = document.getElementById('linksInput').value;

        const assignmentDoc = await firebase.firestore()
          .collection("classes")
          .doc(classSet)
          .collection("assignments")
          .doc(assignmentId);
        
        await assignmentDoc.update({
          details: newDetails,
          links: newLink,
        });

        document.getElementById('assignmentDetails').textContent = newDetails;
        document.getElementById('links').href = newLink;
        document.getElementById('links').textContent = newLink;
      }
    } catch (error) {
      Swal.fire('Error!', 'Failed to save changes. Please try again.', 'error');
    }
  }
}

// Confirm before deleting assignment
function confirmDelete(assignmentId) {
  // Make sure the assignmentId is being passed correctly
  console.log("Attempting to delete assignment with ID:", assignmentId);

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to undo this action!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteAssignment(assignmentId);
        window.location.href = "main.html";  // Redirect to assignments list after successful deletion
      } catch (error) {
        console.error("Error during delete:", error);
        Swal.fire('Error!', 'There was an issue deleting the assignment.', 'error');
      }
    } else {
      console.log("Deletion was canceled.");
    }
  });
}

// Delete assignment from Firestore
async function deleteAssignment(assignmentId) {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('User not authenticated.');
    return Swal.fire('Error!', 'You need to be logged in to delete the assignment.', 'error');
  }

  const userId = user.uid;
  try {
    // Fetch user data to get classSet
    const userDoc = await firebase.firestore()
      .collection("users")
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      throw new Error('User document not found.');
    }

    const classSet = userDoc.data().classSet;
    if (!classSet) {
      throw new Error('Class set not found.');
    }

    // Proceed with deletion of the assignment from Firestore
    await firebase.firestore()
      .collection("classes")
      .doc(classSet)
      .collection("assignments")
      .doc(assignmentId)
      .delete();

    console.log('Assignment deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error during assignment deletion:', error);
    throw error; // Re-throw to catch in the confirmDelete function
  }
}

// Add event listener to the delete button to trigger the confirmation
document.getElementById('deleteAssignment').addEventListener('click', function () {
  const assignmentId = new URLSearchParams(window.location.search).get('id');
  if (assignmentId) {
    confirmDelete(assignmentId);
  } else {
    console.error('No assignment ID found.');
  }
});


function displayError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
  });
}



// Apply the saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme'); // Retrieve the saved theme from localStorage
  if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme); // Apply the theme
  } else {
      document.documentElement.setAttribute('data-theme', 'light'); // Default theme
  }
});
