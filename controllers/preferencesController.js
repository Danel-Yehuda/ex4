const { dbConnection } = require('../db_connection');
const destinations = require('../destinations.json');
const vacationTypes = require('../vacation_types.json');

exports.createPreferences = async (req, res) => {
    const { userCode, starting_date, end_date, desired_destination, vacation_type } = req.body;

    if (!userCode || !starting_date || !end_date || !desired_destination || !vacation_type) {
        return res.status(400).send('All fields are required');
    }

    const startDate = new Date(starting_date);
    const endDate = new Date(end_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
        return res.status(400).send('The duration from starting date to end date cannot be longer than 1 week');
    }

    if (!destinations.includes(desired_destination)) {
        return res.status(400).send('Invalid destination');
    }

    if (!vacationTypes.includes(vacation_type)) {
        return res.status(400).send('Invalid vacation type');
    }

    try {
        const connection = await dbConnection.createConnection();

        // Verify if the userCode exists
        const [user] = await connection.execute('SELECT * FROM users WHERE userCode = ?', [userCode]);
        if (user.length === 0) {
            await connection.end();
            return res.status(404).send('User not found');
        }

        // Insert the preferences into the database
        const [result] = await connection.execute(
            'INSERT INTO Preferences (starting_date, end_date, desired_destination, vacation_type) VALUES (?, ?, ?, ?)',
            [starting_date, end_date, desired_destination, vacation_type]
        );

        await connection.end();

        // Respond with a success message
        return res.status(201).json({ message: 'Preferences created successfully' });
    } catch (error) {
        console.error('Error creating preferences:', error);
        return res.status(500).send('Internal Server Error');
    }
};
