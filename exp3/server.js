const express = require('express');
const mysql = require('mysql2');

const app = express();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'registration_db',
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  db.query('SELECT * FROM users', (_, users) => res.render('index', { users }));
});

app.post('/add', (req, res) => {
  const { name, email, password } = req.body;
  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password], () => res.redirect('/'));
});

app.get('/edit/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id],
    (_, users) => res.render('edit', { user: users[0] }));
});

app.post('/update/:id', (req, res) => {
  const { name, email, password } = req.body;
  db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
    [name, email, password, req.params.id], () => res.redirect('/'));
});

app.get('/delete/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], () => res.redirect('/'));
});

db.connect(() => app.listen(3000, () => console.log('http://localhost:3000')));
