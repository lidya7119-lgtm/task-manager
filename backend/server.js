const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const PORT = 3000; // Define the port for our backend server

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

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
