const dueButton = document.getElementById('dueButton');
const doneButton = document.getElementById('doneButton');
const dueContent = document.getElementById('dueContent');
const doneContent = document.getElementById('doneContent');

let currentUserSet = ''; // Store user's classSet globally for toggling

// Toggle between Due and Done content display
function toggleContent(activeButton, inactiveButton, activeContent, inactiveContent, loadFunction) {
    activeButton.classList.add('active');
    inactiveButton.classList.remove('active');
    activeContent.style.display = 'block';
    inactiveContent.style.display = 'none';
    loadFunction(currentUserSet); // Reload assignments based on the button pressed
}

dueButton.addEventListener('click', function () {
    toggleContent(dueButton, doneButton, dueContent, doneContent, loadDueAssignments);
});

doneButton.addEventListener('click', function () {
    toggleContent(doneButton, dueButton, doneContent, dueContent, loadDoneAssignments);
});

// Function to interpolate color between two colors based on a factor (0 to 1)
function redGreenGradient(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

const red = [255, 0, 0];    // RGB for red
const green = [0, 255, 0];  // RGB for green

function loadDueAssignments() {
    dueContent.innerHTML = '<p>Loading Due Assignments...</p>';

    const userId = firebase.auth().currentUser.uid;

    // Step 1: Get completed assignments from user's assignments
    db.collection('users').doc(userId).collection('assignments').get()
        .then(userSnapshot => {
            const completedIds = userSnapshot.docs.map(doc => doc.id); // Collect completed assignment IDs
            console.log('Completed Assignment IDs (user):', completedIds);

            // Step 2: Get all assignments from the class's assignments
            db.collection('classes').doc(currentUserSet).collection('assignments').get()
                .then(classSnapshot => {
                    const dueAssignments = classSnapshot.docs
                        .filter(doc => !completedIds.includes(doc.id)) // Exclude completed assignments
                        .map(doc => ({ id: doc.id, data: doc.data() }));

                    console.log('Due Assignments:', dueAssignments);
                    renderAssignments(dueAssignments, dueContent, 'Due');
                });
        })
        .catch(error => {
            console.error('Error loading due assignments:', error);
        });
}

function loadDoneAssignments() {
    doneContent.innerHTML = '<p>Loading Completed Assignments...</p>';

    const userId = firebase.auth().currentUser.uid;

    // Step 1: Get completed assignments from user's assignments
    db.collection('users').doc(userId).collection('assignments').get()
        .then(userSnapshot => {
            const completedIds = userSnapshot.docs.map(doc => doc.id); // Collect completed assignment IDs
            console.log('Completed Assignment IDs (user):', completedIds);

            // Step 2: Get all assignments from the class's assignments
            db.collection('classes').doc(currentUserSet).collection('assignments').get()
                .then(classSnapshot => {
                    const doneAssignments = classSnapshot.docs
                        .filter(doc => completedIds.includes(doc.id)) // Include only completed assignments
                        .map(doc => ({
                            id: doc.id,
                            data: doc.data(),
                            dueDate: doc.data().dueDate // Make sure the dueDate is being captured
                        }));

                    // Sort completed assignments by dueDate (ascending or descending)
                    doneAssignments.sort((a, b) => {
                        const dateA = a.dueDate.toDate();  // Convert Firestore Timestamp to JS Date
                        const dateB = b.dueDate.toDate();  // Convert Firestore Timestamp to JS Date
                        return dateA - dateB;  // Ascending order (for descending, use dateB - dateA)
                    });

                    console.log('Sorted Done Assignments:', doneAssignments);
                    renderAssignments(doneAssignments, doneContent, 'Done');
                })
                .catch(error => {
                    console.error('Error fetching class assignments:', error);
                });
        })
        .catch(error => {
            console.error('Error loading done assignments:', error);
        });
}


// Helper function to render assignments in a container
function renderAssignments(assignments, container, type) {
    container.innerHTML = ''; // Clear content
    if (assignments.length === 0) {
        container.innerHTML = `<p>No ${type.toLowerCase()} assignments available.</p>`;
        return;
    }

    assignments.forEach((assignment, index) => {
        const data = assignment.data;
        const formattedDate = new Date(data.dueDate.toDate()).toLocaleDateString();
        
        let backgroundColor;
        
        // If the section is "Done", set the background to grey
        if (type === 'Done') {
            backgroundColor = 'rgb(169, 169, 169)'; // Grey color
        } else {
            // If it's "Due", apply the gradient based on the index
            const factor = index / (assignments.length - 1);
            backgroundColor = redGreenGradient(red, green, factor);
        }

        const assignmentItem = `
            <div class="card mb-2 shadow-sm rounded-lg" style="background: ${backgroundColor}; border: none;">
                <a href="assignDetails.html?id=${encodeURIComponent(assignment.id)}" class="card-link" style="background-color: ${backgroundColor}; text-decoration: none;">
                    <div class="card-body d-flex justify-content-between align-items-center py-2">
                        <div>
                            <h5 class="card-title mb-0 text-primary font-weight-bold">${data.courseName}</h5>
                            <p class="card-text mb-0">${data.title}</p>
                        </div>
                        <span class="card-text">${formattedDate}</span>
                    </div>
                </a>
            </div>`;
        container.insertAdjacentHTML('beforeend', assignmentItem);
    });
}


// Function to mark an assignment as done
function markAsDone(assignmentId, classCode) {
    const userId = firebase.auth().currentUser.uid;

    // Reference to the assignment in the class collection
    const assignmentRef = db.collection('classes').doc(classCode).collection('assignments').doc(assignmentId);

    // Get the assignment data
    assignmentRef.get()
        .then(doc => {
            if (doc.exists) {
                const assignmentData = doc.data();

                // Reference to the user's 'done' subcollection
                const userDoneRef = db.collection('users').doc(userId).collection('assignments').doc(assignmentId);

                // Add the assignment to the user's 'done' subcollection
                userDoneRef.set(assignmentData)
                    .then(() => {
                        console.log(`Assignment ${assignmentId} marked as done for user ${userId}`);
                    })
                    .catch(error => {
                        console.error('Error adding assignment to user done collection:', error);
                    });
            } else {
                console.error('Assignment not found in class collection');
            }
        })
        .catch(error => {
            console.error('Error fetching assignment:', error);
        });
}

function getUserSetAndLoad(userId) {
    db.collection('users')
        .doc(userId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                currentUserSet = doc.data().classSet;
                loadDueAssignments(); // Load due assignments by default
            } else {
                console.error('No user data found!');
            }
        })
        .catch((error) => {
            console.error('Error fetching user set:', error);
        });
}

window.onload = function () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            console.log(`Loading assignments for user: ${userId}`);
            getUserSetAndLoad(userId);
        } else {
            console.error('No user is signed in.');
            window.location.href = '/login.html';
        }
    });
};
