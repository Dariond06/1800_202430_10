function test() {
  firebase.auth().onAuthStateChanged(user => {
      if (user) {
          let userId = user.uid
          // console.log(userId)
      } else {
          console.log("no user");
      }
  })
}
test();


window.onload = function () {
  // Get the assignment ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('id');
  const userId = firebase.auth().currentUser.uid;
  console.log("User id:", userId);

  // Reference Firestore and fetch assignment details
  const db = firebase.firestore();
  db.collection('assignments')
    .doc(assignmentId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();

        console.log("Firestore data:", data); // Log the entire data to check its structure

        // Populate the data from Firestore into the HTML elements
        if (data.courseName && data.title && data.dueDate && data.details) {
          document.getElementById('courseName').innerHTML = `Course Number:<br>${data.courseName}`;
          document.getElementById('assignmentTitle').innerHTML = `Assignment Title: <br>${data.title}`;
          
          // Check if dueDate is a Firestore Timestamp and convert it properly
          if (data.dueDate && data.dueDate.seconds) {
            const formattedDate = new Date(data.dueDate.seconds * 1000).toLocaleDateString();
            document.getElementById('dueDate').innerHTML = `Due Date: ${formattedDate}`;
          } else {
            console.error('Invalid or missing dueDate.');
            document.getElementById('dueDate').innerHTML = 'Invalid due date';
          }

          document.getElementById('assignmentDetails').innerHTML = `${data.details}`;
        } else {
          console.error('Missing fields in Firestore document.');
          document.getElementById('courseName').innerHTML = 'Course information unavailable.';
          document.getElementById('assignmentTitle').innerHTML = 'Assignment title unavailable.';
          document.getElementById('dueDate').innerHTML = 'Due date unavailable.';
          document.getElementById('assignmentDetails').innerHTML = 'Details unavailable.';
        }
      } else {
        console.error('No such document!');
        document.getElementById('courseName').innerHTML = 'Assignment not found.';
        document.getElementById('assignmentTitle').innerHTML = '';
        document.getElementById('dueDate').innerHTML = '';
        document.getElementById('assignmentDetails').innerHTML = '';
      }
    })
    .catch((error) => {
      console.error('Error fetching assignment details:', error);
      document.getElementById('courseName').innerHTML = 'Error fetching data';
      document.getElementById('assignmentTitle').innerHTML = '';
      document.getElementById('dueDate').innerHTML = '';
      document.getElementById('assignmentDetails').innerHTML = '';
    });
};

// Go back to the previous page when the back button is clicked
function goBack() {
  window.history.back();
}