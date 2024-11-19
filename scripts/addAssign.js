document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("submitAssignment");

    // Attach a single event listener
    submitButton.addEventListener("click", async () => {
        submitButton.disabled = true; // Disable to prevent multiple clicks

        const title = document.getElementById("titleInput").value.trim();
        const classSelected = document.getElementById("classSelect").value.trim();
        const details = document.getElementById("detailsInput").value.trim();
        const dueDate = document.getElementById("dateInput").value;
        const links = document.getElementById("linkInput").value;

        // Validate input fields
        if (!title || !details || !dueDate || !links) {
            alert("Please fill in all fields.");
            submitButton.disabled = false; // Re-enable the button
            return;
        }

        // Check if the due date is still the preset value (current date/time)
        const presetDate = document.getElementById('dateInput').getAttribute('min');
        if (dueDate === presetDate) {
            alert("Please change the due date and time before submitting.");
            submitButton.disabled = false; // Re-enable the button
            return;
        }

        try {
            // Ensure user is authenticated
            const user = firebase.auth().currentUser;
            if (!user) {
                alert("User not logged in. Please log in to submit an assignment.");
                submitButton.disabled = false; // Re-enable the button
                return;
            }

            const userId = user.uid;

            // Retrieve the user's classSet field from Firestore
            const userDoc = await db.collection("users").doc(userId).get();
            if (!userDoc.exists) {
                alert("User's class set not found.");
                submitButton.disabled = false; // Re-enable the button
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

            alert("Assignment successfully added!");
            window.location.href = 'main.html';
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("An error occurred while submitting the assignment. Please try again.");
        } finally {
            submitButton.disabled = false; // Re-enable the button
        }
    });
});

// Get the current date and time
const now = new Date();
// Get the current local time in YYYY-MM-DDTHH:mm format
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

// Set the value of the input field to current date and time
document.getElementById('dateInput').value = formattedDateTime;

// Set the minimum date/time for the input field to prevent past dates
document.getElementById('dateInput').setAttribute('min', formattedDateTime);
