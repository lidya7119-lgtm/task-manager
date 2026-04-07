// Get DOM elements
const newTaskForm = document.getElementById('new-task-form');
const taskTextInput = document.getElementById('task-text');
const tasksContainer = document.getElementById('tasks-container');
const currentYearSpan = document.getElementById('current-year');

// --- Global Array to store task objects (now kept in sync with backend) ---
let tasks = []; // This array will now be populated by the backend

// Backend API URL
const API_URL = 'http://localhost:3000/tasks'; // Point to your backend server

// Set current year in footer
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// NOTE: saveTasks() is now effectively replaced by direct API calls within addTask, etc.
// This function can be removed or repurposed if specific "save all" logic is needed later.
// For now, it's a placeholder.
function saveTasks() {
    console.warn("saveTasks() is a placeholder; direct API calls are used for persistence.");
}


/**
 * Loads tasks from the backend API and renders them.
 */
async function loadTasks() {
    try {
        const response = await fetch(API_URL); // Make a GET request to your backend
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const backendTasks = await response.json(); // Parse the JSON response
        tasks = backendTasks; // Update the local tasks array with data from the backend
        console.log('Tasks loaded from backend:', tasks); // For debugging
        renderTasks(); // Render all loaded tasks
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        tasksContainer.innerHTML = `<p style="color: #dc3545;">Failed to load tasks. Please check server connection.</p>`;
    }
}

/**
 * Renders all tasks from the `tasks` array to the DOM.
 * Clears existing tasks first.
 */
function renderTasks() {
    tasksContainer.innerHTML = ''; // Clear existing tasks in the DOM
    // Sort tasks to display new ones at the top, or by priority later
    tasks.sort((a, b) => new Date(b.id) - new Date(a.id)); // Simple sort by ID (timestamp) for new-on-top

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
 * Adds a new task by sending it to the backend API.
 * @param {string} taskText - The description of the new task.
 */
async function addTask(taskText) {
    if (taskText.trim() === '') {
        alert('Task description cannot be empty!');
        return;
    }

    const newTaskData = {
        text: taskText,
        completed: false,
        priority: 'medium' // Default priority for now, will be updated later
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST', // Specify the HTTP method
            headers: {
                'Content-Type': 'application/json' // Tell the server we're sending JSON
            },
            body: JSON.stringify(newTaskData) // Convert the JS object to a JSON string
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }

        const createdTask = await response.json(); // Get the newly created task object from the server
        console.log('Task added via backend:', createdTask);

        // Add the server-created task to our local array
        tasks.push(createdTask); // Or unshift if you want new tasks at the top, then re-sort if needed.
        // For simplicity, we'll just reload all tasks from the backend after adding.
        // A more optimized approach would be to just add `createdTask` to the `tasks` array
        // and then call `renderTasks()`. For now, let's keep it simple with a reload.
        loadTasks(); // Reload tasks to ensure consistent state and order

        taskTextInput.value = ''; // Clear the input field
    } catch (error) {
        console.error('Failed to add task:', error);
        alert(`Error adding task: ${error.message}`);
    }
}

/**
 * Deletes a task by sending a request to the backend API.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTask(taskId) {
    // This function will be updated to use backend API for deletion in a future step
    console.warn(`deleteTask(${taskId}) currently does not call backend. Implement DELETE endpoint.`);
    // For now, it will only remove from local array and re-render
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
}


// Event listener for form submission
newTaskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission and page reload
    addTask(taskTextInput.value);
});

// --- Event Delegation for Task Actions (Delete, Edit, Checkbox) ---
tasksContainer.addEventListener('click', (event) => {
    const target = event.target;
    const taskItem = target.closest('.task-item'); // Find the closest parent task-item

    if (!taskItem) return; // If clicked element is not inside a task item, do nothing

    const taskId = taskItem.dataset.id; // Get the ID from the task item's data-id attribute

    // Handle Delete button click
    if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId); // Calls the frontend deleteTask, will update to backend DELETE later
        }
    }

    // Other actions (edit, checkbox) will be added here later
});


// --- Initial setup when the script loads ---
document.addEventListener('DOMContentLoaded', loadTasks);
