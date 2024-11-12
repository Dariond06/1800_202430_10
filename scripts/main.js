// Assuming you have an array of assignments
const assignments = [
];


// Function to interpolate color between two colors based on the factor (0 to 1)
function redGreenGradient(color1, color2, factor) {
    const result = color1.slice(); // Copy the first color
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// Function to lighten a color by a given factor for hovering (0 to 1)
function lightenColor(rgbString, factor) {
    const match = rgbString.match(/\d+/g); // Extract RGB values
    if (!match) return rgbString; // Fallback in case of bad input
    const [r, g, b] = match.map(Number);
    const result = [r, g, b].map(val => Math.min(Math.round(val + (255 - val) * factor), 255));
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// Defines red and green colors as RGB arrays
const red = [255, 0, 0];   // RGB for red
const green = [0, 255, 0]; // RGB for green

// Sort assignments by due date
assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

// Get the assignment list container
const assignList = document.getElementById('assignList');

// Create cards with gradient color based on due date
assignments.forEach((assign, index) => {
    const card = document.createElement('div');
    card.className = 'card mb-2';

    // Calculate the gradient factor based on the index
    const factor = index / (assignments.length - 1); // Between 0 (first) and 1 (last)
    const backgroundColor = redGreenGradient(red, green, factor);
    const hoverColor = lightenColor(backgroundColor, 0.2); // Lighten the background color by 20%

    // Set the background color of the card
    card.style.backgroundColor = backgroundColor;
    card.style.color = '#000'; // Ensure text color is readable (black)

    // Format the due date to show only the calendar date
    const formattedDate = new Date(assign.dueDate).toLocaleDateString();

    // Set hover color using inline CSS
    card.innerHTML = `
    <a href="#" class="card-link" style="background: ${backgroundColor}; color: inherit; text-decoration: none;" 
       onmouseover="this.style.background='${hoverColor}'"
       onmouseout="this.style.background='${backgroundColor}'">
        <div class="card-body d-flex justify-content-between">
            <span>Class: ${assign.class}</span>
            <span class="font-weight-bold">${assign.title}</span>
            <span>${formattedDate}</span>
        </div>
    </a>
    `;
    assignList.appendChild(card);
});

function loadAssignments(userSet) {
    const assignList = document.getElementById('assignList');
    assignList.innerHTML = ''; // Clear any existing content

    db.collection('classes').doc(userSet).collection('assignments')
        .get()
        .then((querySnapshot) => {
            console.log(`Loaded ${querySnapshot.size} assignments`);  // Log the number of assignments
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const formattedDate = new Date(data.dueDate.toDate()).toLocaleDateString();
                
                const assignmentItem = `
                <div class="card mb-2">
                    <a href="#" class="card-link" style="background-color: #f5f5f5; text-decoration: none;">
                        <div class="card-body d-flex justify-content-between">
                            <span>${data.courseName}</span>
                            <span class="font-weight-bold">${data.title}</span>
                            <span>${formattedDate}</span>
                        </div>
                    </a>
                </div>`;
                assignList.insertAdjacentHTML('beforeend', assignmentItem);
            });
        })
        .catch((error) => {
            console.error('Error fetching assignments:', error);
        });
}

// Example: Call loadAssignments with user-specific set
function getUserSetAndLoad(userId) {
    // Assuming user set is fetched dynamically
    db.collection('users')
        .doc(userId) // Replace with the actual user ID
        .get()
        .then((doc) => {
            if (doc.exists) {
                const userSet = doc.data().classSet; // e.g., 'cstSetC'
                console.log('User set:', userSet);
                loadAssignments(userSet); // Load assignments for the specific set
            } else {
                console.error('No user data found!');
            }
        })
        .catch((error) => {
            console.error('Error fetching user set:', error);
        });
}

// Call this function when the page loads
window.onload = function () {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid; // Get the authenticated user's UID
            console.log(`Loading assignments for user: ${userId}`);
            getUserSetAndLoad(userId);
        } else {
            console.error('No user is signed in.');
            // Optionally, redirect to login page or show a message
            window.location.href = '/login.html'; // Replace with your login page
        }
    });
};


