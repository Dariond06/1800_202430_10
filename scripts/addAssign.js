document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitAssignment").addEventListener("click", () => {
        const title = document.getElementById("titleInput").value;
        const classSelected = document.getElementById("classSelect").value;
        const details = document.getElementById("detailsInput").value;
        const dueDate = document.getElementById("dateInput").value;

        if (!title || !details || !dueDate) {
            alert("Please fill in all fields.");
            return;
        }

        // Get the current user ID
        const userId = firebase.auth().currentUser.uid;
        const set = db.collection("classes")

        // Retrieve the user's classSet field from Firestore
        db.collection("users").doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    // Use the classSet field to find the specific class document
                    const classSet = doc.data().classSet;
                    console.log(classSet);

                    // Reference to the assignments collection within the specific class
                    const assignmentsRef = db.collection("classes").doc(classSet).collection("assignments");

                    // Add the assignment to the specified class's assignments collection
                    assignmentsRef.add({
                        title: title,
                        courseName: classSelected,
                        dueDate: firebase.firestore.Timestamp.fromDate(new Date(dueDate)),
                        details: details
                    })
                        .then(() => {
                            alert("Assignment successfully added!");
                        })
                        .catch((error) => {
                            console.error("Error adding assignment: ", error);
                        });
                } else {
                    alert("User's class set not found.");
                }
            })
            .catch((error) => {
                console.error("Error retrieving user's class set: ", error);
            });
    });
});
