const dueButton = document.getElementById('dueButton');
const doneButton = document.getElementById('doneButton');
const dueContent = document.getElementById('dueContent');
const doneContent = document.getElementById('doneContent');

// Toggle between Due and Done content display
function toggleContent(activeButton, inactiveButton, activeContent, inactiveContent) {
    activeButton.classList.add('active');
    inactiveButton.classList.remove('active');
    activeContent.style.display = 'block';
    inactiveContent.style.display = 'none';
}

dueButton.addEventListener('click', function () {
    toggleContent(dueButton, doneButton, dueContent, doneContent);
});

doneButton.addEventListener('click', function () {
    toggleContent(doneButton, dueButton, doneContent, dueContent);
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

function loadAssignments(userSet) {
    const assignList = document.getElementById('assignList');
    assignList.innerHTML = ''; // Clear any existing content

    db.collection('classes').doc(userSet).collection('assignments')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                assignList.innerHTML = '<p>No assignments available.</p>';
                return;
            }

            console.log(`Loaded ${querySnapshot.size} assignments`);

            // Map through the docs and extract both document ID and data
            const assignments = querySnapshot.docs.map(doc => ({
                id: doc.id, // Document ID
                data: doc.data() // Assignment data
            }));

            // Sort assignments by due date
            assignments.sort((a, b) => a.data.dueDate.toDate() - b.data.dueDate.toDate());

            assignments.forEach((assignment) => {
                const data = assignment.data;
                const assignmentId = assignment.id; // Correctly use the document ID

                // Calculate the color for each assignment
                const factor = assignments.indexOf(assignment) / (assignments.length - 1);
                const backgroundColor = redGreenGradient(red, green, factor);

                // Format the due date
                const formattedDate = new Intl.DateTimeFormat('en-US').format(new Date(data.dueDate.toDate()));

                // Create the assignment item with the correct document ID in the URL
                const assignmentItem = `
                    <div class="card mb-2 shadow-sm rounded-lg" style="background: ${backgroundColor}; border: none;">
                        <a href="assignDetails.html?id=${encodeURIComponent(assignmentId)}" class="card-link" style="background-color: ${backgroundColor}; text-decoration: none;">
                            <div class="card-body d-flex justify-content-between align-items-center py-2">
                                <div>
                                    <h5 class="card-title mb-0 text-primary font-weight-bold">${data.courseName}</h5>
                                    <p class="card-text mb-0">${data.title}</p>
                                </div>
                                <span class="card-text">${formattedDate}</span>
                            </div>
                        </a>
                    </div>`;

                // Append the assignment item to the list
                assignList.insertAdjacentHTML('beforeend', assignmentItem);
            });
        })
        .catch((error) => {
            console.error('Error fetching assignments:', error);
            assignList.innerHTML = '<p>Error loading assignments. Please try again later.</p>';
        });
}


function getUserSetAndLoad(userId) {
    assignList.innerHTML = '<p>Loading Assignments</p>';
    db.collection('users')
        .doc(userId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const userSet = doc.data().classSet;
                console.log('User set:', userSet);
                loadAssignments(userSet);
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
