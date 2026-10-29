const express = require('express');
const mysql = require('mysql2');

const app = express();
const db = mysql.createConnection('mysql://root:@localhost/registration_db');

app.get('/api/stock/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const data = await (await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
  )).json();
  const result = data.chart.result?.[0];
  if (!result) return res.status(404).json({ error: 'Stock not found' });
  res.json({ symbol, price: result.meta.regularMarketPrice, currency: result.meta.currency });
});

app.get('/api/portfolio', (req, res) => {
  db.query('SELECT symbol, shares, buy_price FROM portfolio', (error, rows) => {
    if (error) return res.send(error.message);
    res.json({
      holdings: rows,
      totalInvested: rows.reduce((total, row) => total + row.shares * row.buy_price, 0),
    });
  });
});

db.connect(() => app.listen(3000, () => console.log('http://localhost:3000')));
