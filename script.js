// Get DOM elements
const newTaskForm = document.getElementById('new-task-form');
const taskTextInput = document.getElementById('task-text');
const tasksContainer = document.getElementById('tasks-container');
const currentYearSpan = document.getElementById('current-year');

// Set current year in footer
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

/**
 * Creates an HTML list item element for a given task.
 * @param {object} task - The task object { id, text, completed: boolean }.
 * @returns {HTMLLIElement} The created li element.
 */
function createTaskElement(task) {
    const listItem = document.createElement('li');
    listItem.classList.add('task-item');
    listItem.dataset.id = task.id; // Store ID on the element
    listItem.dataset.priority = task.priority || 'medium'; // Default priority

    if (task.completed) {
        listItem.classList.add('completed');
    }

    listItem.innerHTML = `
        <div class="task-content">
            <input type="checkbox" id="task-${task.id}-checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}-checkbox" class="task-label">
                <span class="sr-only">Mark task as complete:</span>
                ${task.text}
            </label>
            <span class="task-priority-display" aria-label="Priority: ${task.priority || 'Medium'}">${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}</span>
        </div>
        <div class="task-actions">
            <button class="edit-btn" aria-label="Edit task: ${task.text}">Edit</button>
            <button class="delete-btn" aria-label="Delete task: ${task.text}">Delete</button>
        </div>
    `;

    return listItem;
}

/**
 * Adds a new task to the display.
 * @param {string} taskText - The description of the new task.
 */
function addTask(taskText) {
    if (taskText.trim() === '') {
        alert('Task description cannot be empty!');
        return;
    }

    const newTask = {
        id: Date.now().toString(), // Simple unique ID for now
        text: taskText,
        completed: false,
        priority: 'medium' // Default priority for now
    };

    const taskElement = createTaskElement(newTask);
    tasksContainer.prepend(taskElement); // Add new task to the top of the list
    taskTextInput.value = ''; // Clear the input field
}

// Event listener for form submission
newTaskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission and page reload
    addTask(taskTextInput.value);
});

// --- Initial render for demonstration (optional, can be removed once persistence is added) ---
// You can remove these two tasks once you implement saving/loading
addTask('Learn more about JavaScript modules');
addTask('Refactor code for better readability');
