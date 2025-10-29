const dotenv = require('dotenv');
const express = require('express');
const app = express();
const { connect } = require('./db');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

app.use(express.json());
app.use(cors({origin: '*'}));

// Routes
app.use('/api/', require('./routes/app.routes'));
app.use('/api/bounty', require('./routes/bounty'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/project', require('./routes/project'));
app.use('/api/github', require('./routes/github'));
app.use('/api/bounty-issues', require('./routes/bountyIssues'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/work-submissions', require('./routes/workSubmissions'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/stellar', require('./routes/stellar'));

app.get('/api/', (request, response) => {
    response.send('OpenStellar Alive Check');
});

app.listen(process.env.PORT, async function () {
    console.log(`Ready to go. listening on port:[${process.env.PORT}] on pid:[${process.pid}]`);
    console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET - using localhost fallback'}`);
    await connect();
});
