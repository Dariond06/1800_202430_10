document.addEventListener("DOMContentLoaded", function () {
    const submitButton = document.getElementById("submitAssignment");

    // Attach a single event listener
    submitButton.addEventListener("click", async () => {
        submitButton.disabled = true; // Disable to prevent multiple clicks

        const title = document.getElementById("titleInput").value.trim();
        const classSelected = document.getElementById("classSelect").value.trim();
        const details = document.getElementById("detailsInput").value.trim();
        const dueDate = document.getElementById("dateInput").value;

        // Validate input fields
        if (!title || !details || !dueDate) {
            alert("Please fill in all fields.");
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
