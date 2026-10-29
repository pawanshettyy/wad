CREATE DATABASE IF NOT EXISTS registration_db;
USE registration_db;
CREATE TABLE portfolio (
 id INT AUTO_INCREMENT PRIMARY KEY,
 symbol VARCHAR(10), shares DECIMAL(10,2), buy_price DECIMAL(10,2)
);
INSERT INTO portfolio (symbol, shares, buy_price)
VALUES ('AAPL', 2, 180), ('MSFT', 1, 400);
