const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

const page = (res, name, data = {}) => res.render('index', { page: name, ...data });
const auth = (req, res, next) => req.session.user ? next() : res.redirect('/login');

app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => page(res, 'login', { error: '' }));
app.get('/register', (req, res) => page(res, 'register', { error: '' }));

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  db.query('INSERT INTO users SET ?', {
    name, email, password: await bcrypt.hash(password, 10),
  }, (error) => error
    ? page(res, 'register', { error: error.message })
    : res.redirect('/login'));
});

app.post('/login', (req, res) => {
  db.query('SELECT * FROM users WHERE email = ?', [req.body.email],
    async (_, users) => {
      const user = users[0];
      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return page(res, 'login', { error: 'Invalid login' });
      }
      req.session.user = user;
      res.redirect('/dashboard');
    });
});

app.get('/dashboard', auth, (req, res) => {
  db.query('SELECT * FROM users', (_, users) => page(res, 'dashboard', {
    user: req.session.user, users,
  }));
});

app.get('/edit/:id', auth, (req, res) => {
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id],
    (_, users) => page(res, 'edit', { user: users[0] }));
});

app.post('/update/:id', auth, async (req, res) => {
  const { name, email, password } = req.body;
  db.query('UPDATE users SET ? WHERE id = ?', [
    { name, email, password: await bcrypt.hash(password, 10) }, req.params.id,
  ], () => res.redirect('/dashboard'));
});

app.get('/delete/:id', auth, (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id],
    () => res.redirect('/dashboard'));
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));
db.connect(() => app.listen(3000, () => console.log('http://localhost:3000')));
