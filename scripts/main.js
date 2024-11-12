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

            // Sort assignments by due date
            const assignments = querySnapshot.docs.map(doc => doc.data()).sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate());

            assignments.forEach((data, index) => {
                const factor = index / (assignments.length - 1);
                const backgroundColor = redGreenGradient(red, green, factor);


                const formattedDate = new Date(data.dueDate.toDate()).toLocaleDateString();
                const assignmentItem = `
                    <div class="card mb-2 shadow-sm rounded-lg" style="background: ${backgroundColor}; border: none;">
                        <a href="#" class="card-link" style="background-color: ${backgroundColor}; text-decoration: none;">
                        <div class="card-body d-flex justify-content-between align-items-center py-2">
                            <div>
                                <h5 class="card-title mb-0 text-primary font-weight-bold">${data.courseName}</h5>
                                    <p class="card-text  mb-0">${data.title}</p>
                                </div>
                                <span class="card-text ">${formattedDate}</span>
                            </div>
                        </a>
                    </div>`;

                assignList.insertAdjacentHTML('beforeend', assignmentItem);
            });
        })
        .catch((error) => {
            console.error('Error fetching assignments:', error);
            assignList.innerHTML = '<p>Error loading assignments. Please try again later.</p>';
        });
}

function getUserSetAndLoad(userId) {
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
