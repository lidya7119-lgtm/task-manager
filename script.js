// Get DOM elements
const newTaskForm = document.getElementById('new-task-form');
const taskTextInput = document.getElementById('task-text');
const tasksContainer = document.getElementById('tasks-container');
const currentYearSpan = document.getElementById('current-year');

// --- Global Array to store task objects ---
let tasks = [];

// Set current year in footer
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

/**
 * Saves the current tasks array to localStorage.
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('Tasks saved:', tasks); // For debugging
}

/**
 * Loads tasks from localStorage and renders them.
 */
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        console.log('Tasks loaded:', tasks); // For debugging
        renderTasks(); // Render all loaded tasks
    }
}

/**
 * Renders all tasks from the `tasks` array to the DOM.
 * Clears existing tasks first.
 */
function renderTasks() {
    tasksContainer.innerHTML = ''; // Clear existing tasks in the DOM
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement); // Append to maintain order
    });
}

/**
 * Creates an HTML list item element for a given task.
 * @param {object} task - The task object { id, text, completed: boolean, priority: string }.
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
            <span class="task-priority-display" aria-label="Priority: ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}">${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}</span>
        </div>
        <div class="task-actions">
            <button class="edit-btn" aria-label="Edit task: ${task.text}">Edit</button>
            <button class="delete-btn" aria-label="Delete task: ${task.text}">Delete</button>
        </div>
    `;

    return listItem;
}

/**
 * Adds a new task. Updates the `tasks` array, saves to localStorage, and re-renders.
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
        priority: 'medium' // Default priority for now, will be updated later
    };

    tasks.unshift(newTask); // Add new task to the beginning of the array
    saveTasks(); // Save updated tasks array
    renderTasks(); // Re-render all tasks to display the new one

    taskTextInput.value = ''; // Clear the input field
}

// Event listener for form submission
newTaskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission and page reload
    addTask(taskTextInput.value);
});

// --- Initial setup when the script loads ---
document.addEventListener('DOMContentLoaded', loadTasks);
