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
    document.getElementById("pageTitle").innerHTML = "Upcoming Deadlines!"
});

doneButton.addEventListener('click', function () {
    toggleContent(doneButton, dueButton, doneContent, dueContent, loadDoneAssignments);
    document.getElementById("pageTitle").innerHTML = "Completed Assignments"
});


function loadDueAssignments() {
    dueContent.innerHTML = '<p>Loading Due Assignments...</p>';

    const userId = firebase.auth().currentUser.uid;

    // Get all completed assignment IDs from the user's completedAssignments subcollection
    db.collection('users').doc(userId).collection('completedAssignments').get()
        .then(completedSnapshot => {
            const completedIds = new Set(completedSnapshot.docs.map(doc => doc.id)); // Use a Set for fast lookup

            // Get all assignments from the class's assignments collection
            return db.collection('classes').doc(currentUserSet).collection('assignments').get()
                .then(classSnapshot => {
                    // Filter out assignments that are in the completedIds Set
                    const dueAssignments = classSnapshot.docs
                        .filter(doc => !completedIds.has(doc.id)) // Exclude completed assignments
                        .map(doc => ({ id: doc.id, data: doc.data() }));

                    dueAssignments.sort((a, b) => a.data.dueDate.toDate() - b.data.dueDate.toDate());

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

    // Get completed assignments from user's assignments
    db.collection('users').doc(userId).collection('completedAssignments').get()
        .then(userSnapshot => {
            const completedIds = userSnapshot.docs.map(doc => doc.id); // Collect completed assignment IDs
            console.log('Completed Assignment IDs (user):', completedIds);

            // Get all assignments from the class's assignments
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
                    doneAssignments.sort((a, b) => a.data.dueDate.toDate() - b.data.dueDate.toDate());

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

// Render assignments in a container
function renderAssignments(assignments, container, type) {
    container.innerHTML = ''; // Clear content
    if (assignments.length === 0) {
        container.innerHTML = `<p>No ${type.toLowerCase()} assignments available.</p>`;
        return;
    }

    assignments.forEach((assignment, index) => {
        const data = assignment.data;
        const dueDate = data.dueDate.toDate(); // Firestore Timestamp to JS Date
        const formattedDate = dueDate.toLocaleDateString();

        const now = new Date();
        const timeDiff = dueDate - now;
        const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Full days left
        

        let daysLeftText;
        let daysLeftColor = ''; // Default background color for the due date indicator

        if (type === 'Done') {
            daysLeftColor = 'rgb(169, 169, 169)'; // Grey for completed assignments
            daysLeftText = ''; // No "Days Left" text for completed assignments
        } else {
            if (daysLeft == 0) {
                daysLeftText = 'Due Today!'
                daysLeftColor = 'rgba(255, 0, 0, .7)';
            } else if (timeDiff > 0) {
                const { daysLeftText: daysText, daysLeftColor: color } = getColorByDaysLeft(daysLeft);
                daysLeftText = daysText;
                daysLeftColor = color;
                
            } else {
                daysLeftText = 'Overdue!';
                daysLeftColor = 'rgb(0, 0, 0)'; // black for overdue assignments
            }
        }

        const assignmentItem = `
            <div class="card mb-2 shadow-sm rounded-lg assignment-card" style="border: none;">
                <a href="assignDetails.html?id=${encodeURIComponent(assignment.id)}" class="card-link" style="text-decoration: none;">
                    <div class="card-body d-flex justify-content-between align-items-center py-2">
                        <div class="assignment-details">
                            <h5 class="card-title mb-0 font-weight-bold assignment-title">${data.title}</h5> <!-- Title -->
                            <p class="card-text mb-0 assignment-class">${data.courseName}</p> <!-- Course name -->
                        </div>
                        <div class="due-date-container d-flex align-items-center">
                            <!-- Only show the "Days Left" box if the assignment is not done and there's valid text -->
                            ${assignment.status !== 'done' && daysLeftText && daysLeftText.trim() !== ''
                        ? `<span class="card-text mb-0 day" style="background-color: ${daysLeftColor}; padding: 5px 15px;">${daysLeftText}</span>`
                        : ''
                    }
                            <div class="card-text mb-0 mr-2 date">${formattedDate}</div> <!-- Due date -->
                        </div>
                    </div>
                </a>
            </div>`;


        container.insertAdjacentHTML('beforeend', assignmentItem);
    });
}


let priorityNumbers = { redNum: 0, orangeNum: 0, yellowNum: 0 }; // Default values

// Fetch priority numbers from Firestore
function fetchPriorityNumbers(userId) {
    return db.collection('users').doc(userId).collection('settings').doc('priorities')
        .get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                priorityNumbers.redNum = data.red; 
                priorityNumbers.orangeNum = data.orange; 
                priorityNumbers.yellowNum = data.yellow; 
                console.log('Fetched Priority Numbers:', priorityNumbers);
            } else {
                priorityNumbers.redNum = 3; 
                priorityNumbers.orangeNum = 4; 
                priorityNumbers.yellowNum = 6;
                console.error('No priority data found!');
            }
        })
        .catch(error => {
            console.error('Error fetching priority numbers:', error);
        });
}

// Use the priority numbers in the color system
function getColorByDaysLeft(daysLeft) {
    let daysLeftText;
    let daysLeftColor = ''; // Default background color for the due date indicator

    if (daysLeft <= priorityNumbers.redNum) {
        daysLeftColor = 'rgba(255, 0, 0, .7)';  // Red for days <= redNum
        daysLeftText = `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left`;
    } else if (daysLeft <= priorityNumbers.orangeNum) {
        daysLeftColor = 'rgba(255, 165, 0, .7)'; // Orange for days <= orangeNum
        daysLeftText = `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left`;
    } else if (daysLeft <= priorityNumbers.yellowNum) {
        daysLeftColor = 'rgba(255, 255, 0, .5)'; // Yellow for days <= yellowNum
        daysLeftText = `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left`;
    } else {
        daysLeftColor = 'rgba(0, 255, 0, .5)';  // Green for more than yellowNum days
        daysLeftText = `${daysLeft} Day${daysLeft > 1 ? 's' : ''} Left`;
    }

    return { daysLeftText, daysLeftColor };
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

// Modify the onAuthStateChanged function to fetch priority numbers
window.onload = function () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            console.log(`Loading assignments for user: ${userId}`);
            fetchPriorityNumbers(userId); // Fetch the priority numbers
            getUserSetAndLoad(userId); // Continue loading the class assignments
        } else {
            console.error('No user is signed in.');
            window.location.href = '/login.html';
        }
    });
};

// Apply the saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme'); // Retrieve the saved theme from localStorage
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme); // Apply the theme
    } else {
        document.documentElement.setAttribute('data-theme', 'light'); // Default theme
    }
});

