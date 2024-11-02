// Assuming you have an array of assignments
const assignments = [
    { class: '1427', title: 'namehere', dueDate: '12-12-24' },
    { class: '1522', title: 'namehere', dueDate: '14-12-24' },
    { class: '1212', title: 'namehere', dueDate: '17-12-24' },
    { class: '1427', title: 'namehere', dueDate: '12-12-24' },
    { class: '1522', title: 'namehere', dueDate: '14-12-24' },
    { class: '1212', title: 'namehere', dueDate: '17-12-24' },
    { class: '1427', title: 'namehere', dueDate: '12-12-24' },
    { class: '1522', title: 'namehere', dueDate: '14-12-24' },
    { class: '1212', title: 'namehere', dueDate: '17-12-24' },
    // Add more assignments as needed
];

const assignList = document.getElementById('assignList');

assignments.forEach(assign => {
    const card = document.createElement('div');
    card.className = 'card mb-2';
    card.style.backgroundColor = '#7a7a7a'; 
    card.style.height = '70px'; 
    card.innerHTML = `
      <div class="card-body d-flex justify-content-between">
        <span>Class: ${assign.class}</span>
        <span class="font-weight-bold">${assign.title}</span>
        <span>Due Date: ${assign.dueDate}</span>
    </div>
    `;
    assignList.appendChild(card);
});
