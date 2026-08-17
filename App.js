import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/top/anime')
      .then((res) => res.json())
      .then((data) => setAnimes(data.data || []))
      .catch((err) => console.error(err));
  }, []);

  const renderAnimeItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => alert(`Abriste: ${item.title}`)}
    >
      <Image source={{ uri: item.images.jpg.image_url }} style={styles.poster} />
      <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>KAIRO TV - Populares</Text>
      <FlatList
        data={animes}
        horizontal
        keyExtractor={(item) => item.mal_id.toString()}
        renderItem={renderAnimeItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080c14', padding: 40 },
  header: { color: '#00d2ff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  list: { paddingVertical: 10 },
  card: { width: 180, marginRight: 20, borderRadius: 10, overflow: 'hidden' },
  poster: { width: 180, height: 260, borderRadius: 10 },
  title: { color: '#fff', marginTop: 8, fontSize: 14, textAlign: 'center' }
});
