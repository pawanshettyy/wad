const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');

const app = express();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'registration_db',
});

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'todo-secret', resave: false, saveUninitialized: false }));

const auth = (req, res, next) => req.session.user
  ? next() : res.status(401).json({ error: 'Login required' });

app.get('/', (req, res) =>
  res.render('index', { login: !req.session.user, error: '' }));

app.post('/login', (req, res) => {
  db.query('SELECT id, username FROM users WHERE username = ? AND password = ?',
    [req.body.username, req.body.password], (error, users) => {
      if (error) return res.send(error.message);
      if (!users[0]) return res.render('index', { login: true, error: 'Invalid login' });
      req.session.user = users[0];
      res.redirect('/');
    });
});

app.get('/logout', (req, res) =>
  req.session.destroy(() => res.redirect('/')));

app.get('/api/todos', auth, (req, res) => {
  db.query('SELECT * FROM todos WHERE user_id = ?', [req.session.user.id],
    (error, todos) => error ? res.status(500).send(error.message) : res.json(todos));
});

app.post('/api/todos', auth, (req, res) => {
  db.query('INSERT INTO todos (user_id, task, completed) VALUES (?, ?, ?)',
    [req.session.user.id, req.body.task, false], (error, result) => {
      if (error) return res.status(500).send(error.message);
      res.status(201).json({ id: result.insertId, task: req.body.task, completed: false });
    });
});

app.put('/api/todos/:id', auth, (req, res) => {
  db.query('UPDATE todos SET task = ?, completed = ? WHERE id = ? AND user_id = ?',
    [req.body.task, req.body.completed, req.params.id, req.session.user.id],
    (error, result) => {
      if (error) return res.status(500).send(error.message);
      if (!result.affectedRows) return res.status(404).json({ error: 'Todo not found' });
      res.json({ message: 'Todo updated' });
    });
});

app.delete('/api/todos/:id', auth, (req, res) => {
  db.query('DELETE FROM todos WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id], (error, result) => {
      if (error) return res.status(500).send(error.message);
      if (!result.affectedRows) return res.status(404).json({ error: 'Todo not found' });
      res.json({ message: 'Todo deleted' });
    });
});

db.connect(() => app.listen(3000, () => console.log('http://localhost:3000')));
