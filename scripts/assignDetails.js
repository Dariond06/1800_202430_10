window.onload = function () {
    // Get the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Retrieve the data passed via the URL
    const courseName = urlParams.get('courseName');
    const title = urlParams.get('title');
    const dueDate = urlParams.get('dueDate');
    const details = urlParams.get('details'); // Default if description is missing

    // Set the data to the appropriate HTML elements
    document.getElementById('courseName').innerHTML = `Course Number:<br>${courseName}`;
    document.getElementById('assignmentTitle').innerHTML = `Assignment Title: <br>${title}`;
    document.getElementById('dueDate').innerHTML = `Due Date: ${dueDate}`;
    document.getElementById('assignmentDetails').innerHTML =`${details}`;
};

// Go back to the previous page when the back button is clicked
function goBack() {
    window.history.back();
}

// Get the assignment ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const assignmentId = urlParams.get('id');

// Reference Firestore and fetch assignment details
const db = firebase.firestore();
db.collection('assignments')
  .doc(assignmentId)
  .get()
  .then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      
      // Populate the details section
      document.querySelector('.detailsTitle').textContent = `Assignment Details: ${data.title}`;
      document.querySelector('.detailsBody span').textContent = data.details;

      // Populate other assignment info
      document.querySelector('.card-1 .card-body span:nth-child(1)').textContent = `Class Information:\n${data.courseName}`;
      document.querySelector('.card-1 .card-body span:nth-child(2)').textContent = `Assignment Info:\n${data.title}`;
      document.querySelector('.card-1 .card-body span:nth-child(3)').textContent = `Due Date: ${new Date(data.dueDate).toLocaleDateString()}`;
    } else {
      console.error('No such document!');
    }
  })
  .catch((error) => {
    console.error('Error fetching assignment details:', error);
  });
