document.querySelector('.addBtn').addEventListener('click', async function () {
    const title = document.getElementById('titleInput').value;
    const className = document.getElementById('classSelect').value;
    const notes = document.getElementById('notesInput').value;
    const dueDate = document.getElementById('dateInput').value;
    const classCode = document.getElementById('classCode').value; // Added class code input

    // Validation
    if (!title || !notes || !dueDate || !classCode) {
        alert("Please fill in all fields.");
        return;
    }
})