const { dbConnection } = require('../db_connection');
const destinations = require('../data/destinations.json');
const vacationTypes = require('../data/vacation_types.json');

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
        const [user] = await connection.execute('SELECT id FROM users WHERE userCode = ?', [userCode]);
        if (user.length === 0) {
            await connection.end();
            return res.status(404).send('User not found');
        }

        const userId = user[0].id;

        // Check if the user already has preferences
        const [existingPreferences] = await connection.execute('SELECT * FROM Preferences WHERE user_id = ?', [userId]);
        if (existingPreferences.length > 0) {
            await connection.end();
            return res.status(409).send('User already has preference you can only edit it.');
        }

        // Insert the preferences into the database
        const [result] = await connection.execute(
            'INSERT INTO Preferences (starting_date, end_date, desired_destination, vacation_type, user_id) VALUES (?, ?, ?, ?, ?)',
            [starting_date, end_date, desired_destination, vacation_type, userId]
        );

        await connection.end();

        // Respond with a success message
        return res.status(201).json({ message: 'Preferences created successfully' });
    } catch (error) {
        console.error('Error creating preferences:', error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.updatePreferences = async (req, res) => {
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
        const [user] = await connection.execute('SELECT id FROM users WHERE userCode = ?', [userCode]);
        if (user.length === 0) {
            await connection.end();
            return res.status(404).send('User not found');
        }

        const userId = user[0].id;

        // Check if the user has existing preferences
        const [existingPreferences] = await connection.execute('SELECT * FROM Preferences WHERE user_id = ?', [userId]);
        if (existingPreferences.length === 0) {
            await connection.end();
            return res.status(404).send('Preferences not found');
        }

        // Update the preferences in the database
        const [result] = await connection.execute(
            'UPDATE Preferences SET starting_date = ?, end_date = ?, desired_destination = ?, vacation_type = ? WHERE user_id = ?',
            [starting_date, end_date, desired_destination, vacation_type, userId]
        );

        await connection.end();

        // Respond with a success message
        return res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
        console.error('Error updating preferences:', error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.getAllPreferences = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();

        // Retrieve all preferences along with the associated username
        const [preferences] = await connection.execute(`
            SELECT p.*, u.username 
            FROM Preferences p
            JOIN users u ON p.user_id = u.id
        `);

        await connection.end();

        // Respond with the preferences
        return res.status(200).json(preferences);
    } catch (error) {
        console.error('Error retrieving preferences:', error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.calculateVacationResults = async (req, res) => {
    try {
        const connection = await dbConnection.createConnection();

        // Get all preferences
        const [preferences] = await connection.execute(`
            SELECT p.*, u.username 
            FROM Preferences p
            JOIN users u ON p.user_id = u.id
        `);

        await connection.end();

        if (preferences.length < 5) {
            return res.status(400).send('All 5 members need to submit their preferences');
        }

        // Initialize with the first preference
        let startDate = new Date(preferences[0].starting_date);
        let endDate = new Date(preferences[0].end_date);

        const destinationCounts = {};
        const vacationTypeCounts = {};

        preferences.forEach(pref => {
            destinationCounts[pref.desired_destination] = (destinationCounts[pref.desired_destination] || 0) + 1;
            vacationTypeCounts[pref.vacation_type] = (vacationTypeCounts[pref.vacation_type] || 0) + 1;

            const prefStartDate = new Date(pref.starting_date);
            const prefEndDate = new Date(pref.end_date);
            if (prefStartDate > startDate) {
                startDate = prefStartDate;
            }
            if (prefEndDate < endDate) {
                endDate = prefEndDate;
            }
        });

        // Get majority or fallback to first
        const destination = Object.keys(destinationCounts).reduce((a, b) => destinationCounts[a] > destinationCounts[b] ? a : b, preferences[0].desired_destination);
        const vacationType = Object.keys(vacationTypeCounts).reduce((a, b) => vacationTypeCounts[a] > vacationTypeCounts[b] ? a : b, preferences[0].vacation_type);

        // Check if valid dates
        if (startDate > endDate) {
            return res.status(400).send('No overlapping dates found for all preferences');
        }

        // Respond with the vacation results
        return res.status(200).json({
            destination,
            vacationType,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Error calculating vacation results:', error);
        return res.status(500).send('Internal Server Error');
    }
};