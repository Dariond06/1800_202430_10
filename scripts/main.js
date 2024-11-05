// Assuming you have an array of assignments
const assignments = [
    { class: '1427', title: 'namehere', dueDate: '2024-12-12' },
    { class: '1522', title: 'namehere', dueDate: '2024-12-14' }, 
    { class: '1212', title: 'namehere', dueDate: '2024-12-17' }, 
    { class: '1427', title: 'namehere', dueDate: '2024-12-12' }, 
    { class: '1522', title: 'namehere', dueDate: '2024-12-14' }, 
    { class: '1212', title: 'namehere', dueDate: '2024-12-17' }, 
    { class: '1427', title: 'namehere', dueDate: '2024-12-12' }, 
    { class: '1522', title: 'namehere', dueDate: '2024-12-14' }, 
    { class: '1212', title: 'namehere', dueDate: '2024-12-17' },
    
    
    

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
function lightenColor(color, factor) {
    const result = color.slice(); // Copy the original color
    for (let i = 0; i < 3; i++) {
        result[i] = Math.min(Math.round(result[i] + (255 - result[i]) * factor), 255);
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

// Defines red and green colors as RGB arrays
const red = [255, 0, 0];   // RGB for red
const green = [0, 255, 0]; // RGB for green

// Sort assignments by due date
assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

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

    // Set hover color using inline CSS
    card.innerHTML = `
    <a href="#" class="card-link" style="background: ${backgroundColor}; color: inherit; text-decoration: none;" 
       onmouseover="this.style.background='${hoverColor}'"
       onmouseout="this.style.background='${backgroundColor}'">
        <div class="card-body d-flex justify-content-between">
            <span>Class: ${assign.class}</span>
            <span class="font-weight-bold">${assign.title}</span>
            <span>Due Date: ${assign.dueDate}</span>
        </div>
    </a>
    `;
    assignList.appendChild(card);
});
