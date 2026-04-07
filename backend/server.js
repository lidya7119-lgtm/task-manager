const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
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
                // IMPORTANT: This logic only runs if the table is truly empty.
                // If you already have data from a previous run, these won't be inserted again.
                db.get("SELECT COUNT(*) as count FROM tasks", (err, row) => {
                    if (err) {
                        console.error('Error checking task count:', err.message);
                    } else if (row.count === 0) {
                        console.log('Tasks table is empty, inserting initial data.');
                        const stmt = db.prepare("INSERT INTO tasks (id, text, completed, priority) VALUES (?, ?, ?, ?)");
                        stmt.run('1678886400000', 'Learn SQL for persistence', 0, 'high'); // Use string ID
                        stmt.run('1678886400001', 'Connect Express to SQLite', 1, 'medium');
                        stmt.run('1678886400002', 'Refactor backend endpoints', 0, 'low');
                        stmt.finalize();
                        console.log('Initial data inserted.');
                    }
                });
            }
        });
    }
});

// --- REMOVED: In-memory 'tasks' array is no longer needed ---
// let tasks = [...]

// --- API Endpoints (NOW USING THE DATABASE) ---

// GET all tasks
app.get('/tasks', (req, res) => {
    console.log('GET /tasks request received (from DB)');
    db.all("SELECT * FROM tasks", [], (err, rows) => { // db.all fetches all matching rows
        if (err) {
            console.error('Error fetching tasks:', err.message);
            res.status(500).json({ error: 'Failed to fetch tasks.' });
            return;
        }
        // SQLite stores BOOLEAN as 0/1. Convert to true/false for consistency with frontend.
        const tasksWithBooleans = rows.map(task => ({
            ...task,
            completed: task.completed === 1 // Convert 1 to true, 0 to false
        }));
        res.json(tasksWithBooleans);
    });
});

// POST a new task
app.post('/tasks', (req, res) => {
    console.log('POST /tasks request received with body (to DB):', req.body);
    const { text, completed, priority } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Task text is required.' });
    }

    const newId = Date.now().toString(); // Generate unique ID for the new task
    const isCompleted = completed ? 1 : 0; // Convert boolean to 0 or 1 for SQLite
    const taskPriority = priority || 'medium';

    const sql = `INSERT INTO tasks (id, text, completed, priority) VALUES (?, ?, ?, ?)`;
    db.run(sql, [newId, text, isCompleted, taskPriority], function (err) { // db.run executes a query, 'this' refers to statement info
        if (err) {
            console.error('Error inserting new task:', err.message);
            res.status(500).json({ error: 'Failed to create task.' });
            return;
        }
        console.log(`A row has been inserted with ID: ${newId}`);
        // Respond with the newly created task object (including its ID)
        res.status(201).json({
            id: newId,
            text,
            completed: completed !== undefined ? completed : false, // Send back original boolean
            priority: taskPriority
        });
    });
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
