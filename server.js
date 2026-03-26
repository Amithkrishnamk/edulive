const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = 'users.json';

// Safely load users
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const users = loadUsers();
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hashed });
  saveUsers(users);

  res.json({ message: 'Signup successful' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid password' });

  res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));