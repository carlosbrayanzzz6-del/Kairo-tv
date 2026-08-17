


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
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const API_PRIMARY = 'https://consumet-api-clone.vercel.app/anime/animeflv';
const API_SECONDARY = 'https://api.jikan.moe/v4';

const GENRES = ['Todos', 'Acción', 'Aventura', 'Comedia', 'Romance', 'Fantasía', 'Shonen', 'Isekai', 'Sobrenatural'];

// Caché en memoria RAM (reproducción al instante sin usar espacio del almacenamiento interno)
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
      }

      const res = await fetch(url);
      const data = await res.json();

      let results = data && data.results ? data.results : [];

      if (results.length === 0) {
        const fallbackRes = await fetch(`${API_SECONDARY}/top/anime`);
        const fallbackData = await fallbackRes.json();
        results = (fallbackData.data || []).map(item => ({
          id: item.mal_id.toString(),
          title: item.title,
          image: item.images.jpg.image_url
        }));
      }

      memoryCache[cacheKey] = results;
      setAnimeList(results);
    } catch (e) {
      console.error('Error cargando catálogo:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      fetchCatalog();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_PRIMARY}/${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data && data.results) {
        setAnimeList(data.results);
      }
    } catch (e) {
      console.error('Error al buscar:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnime = async (item) => {
    setSelectedAnime(item);
    setLoadingVideo(true);
    setEpisodes([]);
    setSelectedEpisode(null);
    setStreamUrl(null);
    setAnimeDetails(null);

    const cacheKey = `info_${item.id}`;
    if (memoryCache[cacheKey]) {
      const data = memoryCache[cacheKey];
      setAnimeDetails(data);
      if (data.episodes && data.episodes.length > 0) {
        setEpisodes(data.episodes);
        playEpisode(data.episodes[0], item, data.episodes);
      }
      setLoadingVideo(false);
      return;
    }

    try {
      const res = await fetch(`${API_PRIMARY}/info?id=${item.id}`);
      const data = await res.json();

      if (data) {
        memoryCache[cacheKey] = data;
        setAnimeDetails(data);
        if (data.episodes && data.episodes.length > 0) {
          setEpisodes(data.episodes);
          playEpisode(data.episodes[0], item, data.episodes);
        }
      }
    } catch (e) {
      console.error('Error al obtener ficha:', e);
    } finally {
      setLoadingVideo(false);
    }
  };

  const playEpisode = async (ep, animeObj = selectedAnime, epList = episodes) => {
    setSelectedEpisode(ep);
    setLoadingVideo(true);

    if (animeObj) {
      const historyItem = {
        id: animeObj.id,
        title: animeObj.title,
        image: animeObj.image,
        lastEpisode: ep.number,
        episodeId: ep.id
      };
      setHistory(prev => [historyItem, ...prev.filter(i => i.id !== animeObj.id)]);
    }

    try {
      const res = await fetch(`${API_PRIMARY}/watch?episodeId=${ep.id}`);
      const data = await res.json();

      const directSource = data.headers?.Referer || data.sources?.[0]?.url || ep.url;
      setStreamUrl(directSource);
    } catch (e) {
      console.error('Error al reproducir:', e);
    } finally {
      setLoadingVideo(false);
    }
  };

  const toggleFavorite = (anime) => {
    if (!anime) return;
    const exists = favorites.some(fav => fav.id === anime.id);
    if (exists) {
      setFavorites(favorites.filter(fav => fav.id !== anime.id));
    } else {
      setFavorites([...favorites, { id: anime.id, title: anime.title, image: anime.image }]);
    }
  };

  const playNextEpisode = () => {
    if (!selectedEpisode || episodes.length === 0) return;
    const currentIndex = episodes.findIndex(e => e.id === selectedEpisode.id);
    if (currentIndex !== -1 && currentIndex + 1 < episodes.length) {
      playEpisode(episodes[currentIndex + 1]);
    }
  };

  const isFav = selectedAnime && favorites.some(fav => fav.id === selectedAnime.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <View style={styles.sidebar}>
        <Text style={styles.brandTitle}>KAIRO TV</Text>
        <TouchableOpacity
          style={[styles.menuBtn, selectedCategory === 'latino' && styles.activeBtn]}
          onPress={() => setSelectedCategory('latino')}>
          <Text style={styles.btnText}>🇲🇽 Latino</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuBtn, selectedCategory === 'popular' && styles.activeBtn]}
          onPress={() => setSelectedCategory('popular')}>
          <Text style={styles.btnText}>🔥 Populares</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuBtn, selectedCategory === 'recent' && styles.activeBtn]}
          onPress={() => setSelectedCategory('recent')}>
          <Text style={styles.btnText}>📺 Recientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuBtn, selectedCategory === 'favorites' && styles.activeBtn]}
          onPress={() => setSelectedCategory('favorites')}>
          <Text style={styles.btnText}>⭐ Mi Lista ({favorites.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuBtn, selectedCategory === 'history' && styles.activeBtn]}
          onPress={() => setSelectedCategory('history')}>
          <Text style={styles.btnText}>🕒 Historial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {selectedAnime ? (
          <ScrollView style={styles.playerContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedAnime(null)}>
                <Text style={styles.backText}>← Volver al catálogo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(selectedAnime)}>
                <Text style={styles.favText}>{isFav ? '❤️ En Mi Lista' : '🤍 Añadir a Mi Lista'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.animeTitle}>
              {selectedAnime.title} {selectedEpisode ? `- Episodio ${selectedEpisode.number}` : ''}
            </Text>

            <View style={styles.videoBox}>
              {loadingVideo ? (
                <ActivityIndicator size="large" color="#00d2ff" />
              ) : streamUrl ? (
                <WebView
                  source={{ uri: streamUrl }}
                  style={styles.webview}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  domStorageEnabled={false}
                  cacheEnabled={false}
                />
              ) : (
                <Text style={styles.errorText}>No se pudo cargar la transmisión.</Text>
              )}
            </View>

            <TouchableOpacity style={styles.nextEpBtn} onPress={playNextEpisode}>
              <Text style={styles.nextEpText}>⏭️ Siguiente Episodio</Text>
            </TouchableOpacity>

            {animeDetails && (
              <View style={styles.infoCard}>
                <Text style={styles.synopsisTitle}>Sinopsis:</Text>
                <Text style={styles.synopsisText}>
                  {animeDetails.description || 'Sin descripción disponible.'}
                </Text>
                {animeDetails.status && (
                  <Text style={styles.metaText}>Estado: {animeDetails.status}</Text>
                )}
              </View>
            )}

            <Text style={styles.epHeader}>Episodios Disponibles:</Text>
            <FlatList
              horizontal
              data={episodes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.epCard, selectedEpisode?.id === item.id && styles.activeEpCard]}
                  onPress={() => playEpisode(item)}>
                  <Text style={styles.epText}>EP {item.number}</Text>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        ) : (
          <View style={styles.catalogBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar anime..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            <View style={{ height: 40, marginBottom: 10 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {GENRES.map(genre => (
                  <TouchableOpacity
                    key={genre}
                    style={[styles.genreChip, selectedGenre === genre && styles.activeGenreChip]}
                    onPress={() => setSelectedGenre(genre)}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>
              {selectedCategory === 'favorites' ? 'Mi Lista de Favoritos' :
               selectedCategory === 'history' ? 'Historial de Reproducción' :
               selectedCategory === 'latino' ? 'Catálogo Latino' : 'Catálogo Principal'}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#00d2ff" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={
                  selectedCategory === 'favorites' ? favorites :
                  selectedCategory === 'history' ? history : animeList
                }
                numColumns={4}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.card} onPress={() => handleSelectAnime(item)}>
                    <Image source={{ uri: item.image }} style={styles.poster} />
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    {item.lastEpisode && (
                      <Text style={styles.historySub}>Visto: EP {item.lastEpisode}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#050811' },
  sidebar: { width: 150, backgroundColor: '#0a0f1d', padding: 15 },
  brandTitle: { color: '#00d2ff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  menuBtn: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
  activeBtn: { backgroundColor: '#1e293b' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  mainContent: { flex: 1, padding: 15 },
  catalogBox: { flex: 1 },
  searchInput: { backgroundColor: '#0f172a', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13 },
  genreChip: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, height: 30 },
  activeGenreChip: { backgroundColor: '#00d2ff' },
  genreText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { flex: 1 / 4, margin: 6, backgroundColor: '#0f172a', borderRadius: 8, overflow: 'hidden' },
  poster: { width: '100%', height: 150 },
  cardTitle: { color: '#e2e8f0', fontSize: 11, padding: 6, textAlign: 'center' },
  historySub: { color: '#00d2ff', fontSize: 10, textAlign: 'center', paddingBottom: 4 },
  playerContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: {},
  backText: { color: '#00d2ff', fontSize: 13 },
  favBtn: { backgroundColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  favText: { color: '#fff', fontSize: 12 },
  animeTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  videoBox: { width: '100%', height: height * 0.5, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' },
  webview: { flex: 1 },
  errorText: { color: '#64748b', textAlign: 'center', marginTop: 50 },
  nextEpBtn: { backgroundColor: '#00d2ff', padding: 10, borderRadius: 6, alignItems: 'center', marginVertical: 10 },
  nextEpText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  infoCard: { backgroundColor: '#0f172a', padding: 12, borderRadius: 8, marginBottom: 10 },
  synopsisTitle: { color: '#00d2ff', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  synopsisText: { color: '#94a3b8', fontSize: 11, lineHeight: 16 },
  metaText: { color: '#64748b', fontSize: 10, marginTop: 6 },
  epHeader: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  epCard: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8, marginBottom: 20 },
  activeEpCard: { backgroundColor: '#00d2ff' },
  epText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
