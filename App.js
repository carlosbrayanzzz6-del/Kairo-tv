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
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const API_PRIMARY = 'https://consumet-api-clone.vercel.app/anime/animeflv';

export default function App() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_PRIMARY}/recent-episodes`);
      const data = await response.json();
      const results = data.results || [];
      setAnimeList(results);
      if (results.length > 0) {
        setSelectedAnime(results[0]);
      }
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      ) : (
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* SECCIÓN PRINCIPAL: INFORMACIÓN Y REPRODUCTOR INTEGRADO */}
          {selectedAnime && (
            <View style={styles.heroSection}>
              <View style={styles.heroInfo}>
                <Text style={styles.title} numberOfLines={1}>
                  {selectedAnime.title} <Text style={styles.rating}>6.6</Text>
                </Text>
                <Text style={styles.subInfo}>Latino / Subtitulado | Kairo TV Engine</Text>
                
                <View style={styles.genreBadge}>
                  <Text style={styles.genreText}>Acción / Anime Series</Text>
                </View>

                <Text style={styles.synopsisLabel}>Sinopsis y Reproducción:</Text>
                <Text style={styles.synopsisText} numberOfLines={3}>
                  Disfruta de la mejor experiencia de streaming de anime directamente en alta velocidad con soporte integrado para pantallas y dispositivos.
                </Text>

                <View style={styles.tvButtonsRow}>
                  <TouchableOpacity style={styles.tvButton}>
                    <Text style={styles.tvButtonText}>Pantalla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tvButton}>
                    <Text style={styles.tvButtonText}>Idioma</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tvButton}>
                    <Text style={styles.tvButtonText}>Calidad</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tvButtonActive}>
                    <Text style={styles.tvButtonTextActive}>Favorito</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroPlayerContainer}>
                <WebView
                  source={{ uri: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }}
                  style={styles.webViewPlayer}
                  allowsFullscreenVideo={true}
                />
              </View>
            </View>
          )}

          {/* SECCIÓN DE RECOMENDACIONES HORIZONTALES */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Quizás te guste</Text>
            <FlatList
              data={animeList}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => setSelectedAnime(item)}
                >
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <View style={styles.cardFooter}>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>7.0</Text>
                    </View>
                    <View style={styles.ccBadge}>
                      <Text style={styles.ccText}>CC</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainScroll: {
    flex: 1,
    padding: 20,
  },
  heroSection: {
    flexDirection: 'row',
    height: height * 0.45,
    marginBottom: 20,
  },
  heroInfo: {
    flex: 1.1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  rating: {
    color: '#f39c12',
    fontSize: 22,
  },
  subInfo: {
    color: '#999999',
    fontSize: 12,
    marginVertical: 4,
  },
  genreBadge: {
    backgroundColor: '#222222',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginVertical: 6,
  },
  genreText: {
    color: '#cccccc',
    fontSize: 12,
  },
  synopsisLabel: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 6,
    fontWeight: 'bold',
  },
  synopsisText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 18,
  },
  tvButtonsRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  tvButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  tvButtonActive: {
    backgroundColor: '#444444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tvButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tvButtonTextActive: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroPlayerContainer: {
    flex: 1.3,
    backgroundColor: '#000000',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  webViewPlayer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  horizontalList: {
    paddingBottom: 10,
  },
  card: {
    width: 130,
    marginRight: 12,
    backgroundColor: '#151515',
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  scoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ccBadge: {
    backgroundColor: '#d97706',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  ccText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 11,
    padding: 6,
  },
});