document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("submitAssignment");
    const dateInput = document.getElementById("dateInput");

    // Set the current date and time for the due date input
    const now = new Date();
    const formattedDateTime = formatDateTime(now);
    dateInput.value = formattedDateTime;
    dateInput.setAttribute("min", formattedDateTime);

    // Attach a single event listener
    submitButton.addEventListener("click", async () => {
        submitButton.disabled = true; // Disable to prevent multiple clicks

        const title = document.getElementById("titleInput").value.trim();
        const classSelected = document.getElementById("classSelect").value.trim();
        const details = document.getElementById("detailsInput").value.trim();
        const dueDate = dateInput.value;
        const links = document.getElementById("linkInput").value;

        // Validate input fields
        if (!title || !details || !dueDate || !links) {
            Swal.fire({
                title: 'Missing Fields!',
                text: 'Please fill in all fields.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            submitButton.disabled = false;
            return;
        }

        try {
            // Ensure user is authenticated
            const user = firebase.auth().currentUser;
            if (!user) {
                console.error("User not logged in.");
                submitButton.disabled = false;
                return;
            }

            const userId = user.uid;

            // Retrieve the user's classSet field from Firestore
            const userDoc = await db.collection("users").doc(userId).get();
            if (!userDoc.exists) {
                console.error("User's class set not found.");
                submitButton.disabled = false;
                return;
            }

            const classSet = userDoc.data().classSet;

            // Reference the assignments collection in the user's class
            const assignmentsRef = db.collection("classes").doc(classSet).collection("assignments");

            // Add the assignment to Firestore
            await assignmentsRef.add({
                title: title,
                courseName: classSelected,
                dueDate: firebase.firestore.Timestamp.fromDate(new Date(dueDate)),
                details: details,
                links: links,
                usersCompleted: [] // Initializes empty array for users who have completed the assignment
            });

            Swal.fire({
                title: 'Success!',
                text: 'Assignment successfully added!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'main.html';
            });
        } catch (error) {
            console.error("Error submitting assignment:", error);
        } finally {
            submitButton.disabled = false; // Re-enable the button
        }
    });
});

// Function to format date and time in YYYY-MM-DDTHH:mm format
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
