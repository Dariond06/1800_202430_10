
function test() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let userId = user.uid
            console.log(userId)
        } else {
            console.log("no user");
        }
    })
}
test();

document.getElementById("submitAssignment").addEventListener("click", () => {
    const title = document.getElementById("titleInput").value;
    const classSelected = document.getElementById("classSelect").value;
    const details = document.getElementById("detailsInput").value;
    const dueDate = document.getElementById("dateInput").value

    if (!title || !details || !dueDate) {
        alert("Please fill in all fields.");
        return;
    }

    // Gets the current user ID
    console.log(userId)

    // Retrieves the user's classSet field from Firestore
    db.collection("users").doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                // Uses the classSet field to find the specific class document
                const classSet = doc.data().classSet;
                console.log(classSet);

                // References the assignments collection within the specific class
                const assignmentsRef = db.collection("classes").doc(classSet).collection("assignments");

                // Adds the assignment to the specified class's assignments collection
                assignmentsRef.add({
                    title: title,
                    courseName: classSelected,
                    dueDate: firebase.firestore.Timestamp.fromDate(new Date(dueDate)),
                    details: details,
                    usersCompleted: [] //Initializes empty array for users who have completed the assignment
                })
                    .then(() => {
                        alert("Assignment successfully added!");
                        window.location.href = 'main.html';
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
