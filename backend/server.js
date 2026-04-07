const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Use CORS middleware to allow requests from your frontend
app.use(cors());

// Middleware to parse JSON bodies in requests (e.g., for POST/PUT requests)
app.use(express.json());

// --- In-memory array to store tasks ---
// IMPORTANT: This data will NOT persist when the server restarts.
// We'll address actual persistence (e.g., to a file or database) in later steps.
let tasks = [
    { id: '1', text: 'Learn Node.js for backend', completed: false, priority: 'high' },
    { id: '2', text: 'Set up Express server', completed: true, priority: 'medium' },
    { id: '3', text: 'Build a tasks API', completed: false, priority: 'low' }
];

// --- API Endpoints ---

// GET all tasks
app.get('/tasks', (req, res) => {
    console.log('GET /tasks request received');
    res.json(tasks); // Send the in-memory tasks array as JSON
});

// POST a new task
app.post('/tasks', (req, res) => {
    console.log('POST /tasks request received with body:', req.body);
    const { text, completed, priority } = req.body; // Destructure properties from the request body

    // Basic validation
    if (!text) {
        return res.status(400).json({ error: 'Task text is required.' });
    }

    const newTask = {
        id: Date.now().toString(), // Simple unique ID for the new task
        text,
        completed: completed !== undefined ? completed : false, // Default to false if not provided
        priority: priority || 'medium' // Default to 'medium' if not provided
    };

    tasks.push(newTask); // Add the new task to our in-memory array
    console.log('New task added:', newTask);
    res.status(201).json(newTask); // Respond with 201 Created status and the new task object
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
