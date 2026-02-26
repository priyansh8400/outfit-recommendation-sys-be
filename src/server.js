require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const personsRouter = require('./routes/persons');

// Health Check API
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/persons', personsRouter);

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
