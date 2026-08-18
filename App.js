import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const API_PRIMARY = 'https://consumet-api-clone.vercel.app/anime/animeflv';
const API_SECONDARY = 'https://api.jikan.moe/v4';

const GENRES = ['Todos', 'Acción', 'Aventura', 'Comedia', 'Romance', 'Fantasía', 'Shonen', 'Isekai', 'Sobrenatural'];

const memoryCache = {};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('latino');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    if (selectedCategory !== 'favorites' && selectedCategory !== 'history') {
      fetchCatalog();
    }
  }, [selectedCategory, selectedGenre]);

  const fetchCatalog = async () => {
    const cacheKey = `${selectedCategory}_${selectedGenre}`;
    if (memoryCache[cacheKey]) {
      setAnimeList(memoryCache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAnimeList([]);
    try {
      let url = `${API_PRIMARY}/recent-episodes`;
      if (selectedCategory === 'latino') {
        url = `${API_PRIMARY}/latino`;
      } else if (selectedCategory === 'popular') {
        url = `${API_PRIMARY}/top-airing`;
      } else if (selectedCategory === 'movie') {
        url = `${API_PRIMARY}/movies`;
      }

      const res = await fetch(url);
      const data = await res.json();
      let results = data && data.results ? data.results : [];

      if (results.length === 0) {
        const fallbackRes = await fetch(`${API_SECONDARY}/top/anime`);
        const fallbackData = await fallbackRes.json();
        results = (fallbackData.data || []).map(item => ({
          id: String(item.mal_id),
          title: item.title,
          image: item.images?.jpg?.image_url,
          episodeId: null,
          episodeNumber: null,
        }));
      }

      memoryCache[cacheKey] = results;
      setAnimeList(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnime = async (item) => {
    setSelectedAnime(item);
    setLoadingVideo(true);
    setEpisodes([]);
    setStreamUrl(null);
    setSelectedEpisode(null);

    try {
      const detailRes = await fetch(`${API_PRIMARY}/info/${item.id}`);
      const detailData = await detailRes.json();
      setAnimeDetails(detailData);

      const eps = detailData.episodes || [];
      setEpisodes(eps);

      if (eps.length > 0) {
        handleSelectEpisode(eps[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleSelectEpisode = async (ep) => {
    setSelectedEpisode(ep);
    setLoadingVideo(true);
    try {
      const watchRes = await fetch(`${API_PRIMARY}/watch/${ep.id}`);
      const watchData = await watchRes.json();
      const source = watchData.sources?.[0]?.url || watchData.iframe;
      setStreamUrl(source);

      setHistory(prev => {
        const filtered = prev.filter(h => h.id !== selectedAnime.id);
        return [selectedAnime, ...filtered];
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVideo(false);
    }
  };

  const toggleFavorite = (item) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id);
      if (exists) return prev.filter(f => f.id !== item.id);
      return [...prev, item];
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      
      {selectedAnime ? (
        <View style={styles.playerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => setSelectedAnime(null)} style={styles.backBtn}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(selectedAnime)}>
              <Text style={styles.favStar}>
                {favorites.some(f => f.id === selectedAnime.id) ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.animeTitleDetail} numberOfLines={1}>{selectedAnime.title}</Text>

          <View style={styles.videoWrapper}>
            {loadingVideo ? (
              <ActivityIndicator size="large" color="#e50914" style={{ marginTop: 80 }} />
            ) : streamUrl ? (
              <WebView
                source={{ uri: streamUrl }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
              />
            ) : (
              <Text style={styles.errorText}>No se pudo cargar el reproductor.</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Episodios ({episodes.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.epList}>
            {episodes.map(ep => (
              <TouchableOpacity
                key={ep.id}
                style={[styles.epButton, selectedEpisode?.id === ep.id && styles.epButtonActive]}
                onPress={() => handleSelectEpisode(ep)}
              >
                <Text style={[styles.epText, selectedEpisode?.id === ep.id && styles.epTextActive]}>
                  {ep.number}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.catalogContainer}>
          <Text style={styles.headerTitle}>Kairo TV</Text>

          <View style={styles.categoryRow}>
            {['latino', 'popular', 'movie', 'favorites', 'history'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                  {cat === 'latino' ? 'Latino' : cat === 'popular' ? 'Popular' : cat === 'movie' ? 'Películas' : cat === 'favorites' ? 'Favoritos' : 'Historial'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#e50914" style={{ marginTop: 100 }} />
          ) : (
            <FlatList
              data={selectedCategory === 'favorites' ? favorites : selectedCategory === 'history' ? history : animeList}
              keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
              numColumns={3}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.card} onPress={() => handleSelectAnime(item)}>
                  <Image source={{ uri: item.image }} style={styles.poster} />
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  catalogContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#e50914', marginBottom: 10 },
  categoryRow: { flexDirection: 'row', marginBottom: 12 },
  catTab: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#1a2236', borderRadius: 8, marginRight: 6 },
  catTabActive: { backgroundColor: '#e50914' },
  catText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  gridContainer: { paddingBottom: 20 },
  card: { flex: 1/3, margin: 4, backgroundColor: '#161e31', borderRadius: 6, overflow: 'hidden' },
  poster: { width: '100%', height: 130 },
  cardTitle: { color: '#fff', fontSize: 10, padding: 6, textAlign: 'center' },
  playerContainer: { flex: 1, padding: 12 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backBtn: { paddingVertical: 4 },
  backText: { color: '#3b82f6', fontSize: 14, fontWeight: 'bold' },
  favStar: { fontSize: 24, color: '#f59e0b' },
  animeTitleDetail: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  videoWrapper: { width: '100%', height: 210, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 15 },
  webview: { flex: 1 },
  errorText: { color: '#9ca3af', textAlign: 'center', marginTop: 80 },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  epList: { maxHeight: 50, marginBottom: 10 },
  epButton: { width: 44, height: 40, backgroundColor: '#161e31', justifyContent: 'center', alignItems: 'center', borderRadius: 6, marginRight: 6 },
  epButtonActive: { backgroundColor: '#e50914' },
  epText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold' },
  epTextActive: { color: '#fff' },
});