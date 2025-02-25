require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

const users = [];
const exercises = {};

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = uuidv4();
  const newUser = { username, _id };
  users.push(newUser);
  exercises[_id] = [];
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  const exercise = {
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };
  
  exercises[_id].push(exercise);
  res.json({ ...user, ...exercise });
});

// Get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  let log = exercises[_id] || [];
  
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(entry => new Date(entry.date) >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    log = log.filter(entry => new Date(entry.date) <= toDate);
  }
  
  if (limit) {
    log = log.slice(0, Number(limit));
  }
  
  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
