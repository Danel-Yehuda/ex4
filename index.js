const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.use('/api/users', userRoutes);
app.use('/api/preferences', preferencesRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
