const { dbConnection } = require('../db_connection');
const { v4: uuidv4 } = require('uuid'); // for generating unique codes

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const connection = await dbConnection.createConnection();
        
        // Check if there are already 5 users
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM tbl_21_users');
        if (users[0].count >= 5) {
            await connection.end();
            return res.status(403).send('Cannot create more than 5 users');
        }
        
        // Check if the username already exists
        const [existingUser] = await connection.execute('SELECT * FROM tbl_21_users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            await connection.end();
            return res.status(409).send('Username already exists');
        }

        // Generate a unique code for the user
        const userCode = uuidv4();

        // Insert new user into the database with the userCode
        await connection.execute('INSERT INTO tbl_21_users (username, password, userCode) VALUES (?, ?, ?)', [username, password, userCode]);

        await connection.end();

        // Respond with the unique code
        return res.status(201).json({ message: 'User created successfully save the userCode for future use.', userCode });
    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).send('Internal Server Error');
    }
};
