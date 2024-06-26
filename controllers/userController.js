const { dbConnection } = require('../db_connection');
const { v4: uuidv4 } = require('uuid'); // for generating unique codes

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const connection = await dbConnection.createConnection();
        
        // Check if the username already exists
        const [existingUser] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            await connection.end();
            return res.status(409).send('Username already exists');
        }

        // Insert new user into the database
        const [result] = await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);

        // Generate a unique code for the user
        const userCode = uuidv4();

        await connection.end();

        // Respond with the unique code
        return res.status(201).json({ message: 'User created successfully, use this user code: ', userCode });
    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).send('Internal Server Error');
    }
};
