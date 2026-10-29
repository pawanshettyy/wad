import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [db, setDb] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function refresh(database = db) {
    setBlogs(await database.getAllAsync('SELECT * FROM blogs ORDER BY id DESC'));
  }

  useEffect(() => {
    (async () => {
      const database = await SQLite.openDatabaseAsync('blogs.db');
      await database.execAsync('CREATE TABLE IF NOT EXISTS blogs (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, date TEXT)');
      setDb(database);
      refresh(database);
    })();
  }, []);

  async function addBlog() {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Enter a title and content');
      return;
    }
    await db.runAsync('INSERT INTO blogs (title, content, date) VALUES (?, ?, ?)',
      title.trim(), content.trim(), new Date().toLocaleString());
    setTitle('');
    setContent('');
    refresh();
  }

  async function deleteBlog(id) {
    await db.runAsync('DELETE FROM blogs WHERE id = ?', id);
    refresh();
  }

  return (
    <View style={{ flex: 1, padding: 30, paddingTop: 60 }}>
      <Text style={{ fontSize: 28 }}>Blog App</Text>
      <TextInput style={{ borderWidth: 1, padding: 10 }} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={{ borderWidth: 1, padding: 10, height: 100 }} placeholder="Content" value={content} onChangeText={setContent} multiline />
      <Button title="Post Blog" onPress={addBlog} disabled={!db} />
      <FlatList
        data={blogs}
        keyExtractor={(blog) => String(blog.id)}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 10, marginTop: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text>{item.date}</Text>
            <Button title="Delete" onPress={() => deleteBlog(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
