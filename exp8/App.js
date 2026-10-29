import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

const API = 'http://192.168.1.100:3000';

export default function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [stock, setStock] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  return (
    <View style={{ padding: 40, paddingTop: 70 }}>
      <Text style={{ fontSize: 26 }}>Stock App</Text>
      <TextInput value={symbol} onChangeText={setSymbol} placeholder="Symbol"
        style={{ borderWidth: 1, padding: 10 }} />
      <Button title="Stock Price" onPress={async () =>
        setStock(await fetch(`${API}/api/stock/${symbol}`).then((r) => r.json()))} />
      {stock && <Text>{stock.symbol}: {stock.price} {stock.currency}</Text>}
      <Button title="Portfolio" onPress={async () =>
        setPortfolio(await fetch(`${API}/api/portfolio`).then((r) => r.json()))} />
      {portfolio && <Text>Total invested: {portfolio.totalInvested}</Text>}
    </View>
  );
}
