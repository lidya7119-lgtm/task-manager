const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3 and enable verbose mode for logging
const app = express();
const PORT = 3000;
const DB_FILE = './tasks.db'; // Define the name of our SQLite database file

// Use CORS middleware
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// --- Database Connection and Initialization ---
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the 'tasks' table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            priority TEXT DEFAULT 'medium'
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating tasks table:', createErr.message);
            } else {
                console.log('Tasks table ensured.');
                // Optional: Insert some initial data if the table was just created and is empty
                // You might want to remove this for production, or have a more robust seeding mechanism
                db.get("SELECT COUNT(*) as count FROM tasks", (err, row) => {
                    if (err) {
                        console.error('Error checking task count:', err.message);
                    } else if (row.count === 0) {
                        console.log('Tasks table is empty, inserting initial data.');
                        const stmt = db.prepare("INSERT INTO tasks (id, text, completed, priority) VALUES (?, ?, ?, ?)");
                        stmt.run('1', 'Learn SQL for persistence', false, 'high');
                        stmt.run('2', 'Connect Express to SQLite', true, 'medium');
                        stmt.run('3', 'Refactor backend endpoints', false, 'low');
                        stmt.finalize();
                        console.log('Initial data inserted.');
                    }
                });
            }
        });
    }
});

// --- !!! IMPORTANT !!! ---
// For this atomic step, we are temporarily keeping the in-memory 'tasks' array
// and the existing endpoint logic as-is. We will refactor them to use the DB
// in the *next* step.
let tasks = [ // This will be removed or commented out in the next step
    { id: '1', text: 'Learn Node.js for backend', completed: false, priority: 'high' },
    { id: '2', text: 'Set up Express server', completed: true, priority: 'medium' },
    { id: '3', text: 'Build a tasks API', completed: false, priority: 'low' }
];

// --- API Endpoints (Still using in-memory 'tasks' for this step) ---

// GET all tasks (still using in-memory for this specific step)
app.get('/tasks', (req, res) => {
    console.log('GET /tasks request received (in-memory)');
    res.json(tasks); // Send the in-memory tasks array as JSON
});

// POST a new task (still using in-memory for this specific step)
app.post('/tasks', (req, res) => {
    console.log('POST /tasks request received with body (in-memory):', req.body);
    const { text, completed, priority } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Task text is required.' });
    }

    const newTask = {
        id: Date.now().toString(),
        text,
        completed: completed !== undefined ? completed : false,
        priority: priority || 'medium'
    };

    tasks.push(newTask);
    console.log('New task added (in-memory):', newTask);
    res.status(201).json(newTask);
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown of the database
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
