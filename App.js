import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { height } = Dimensions.get('window');

// Catálogo ampliado estilo plataforma premium pero 100% gratis y sin anuncios
const KAIRO_PREMIUM_CATALOG = [
  {
    id: '1',
    title: 'Solo Leveling (Estreno)',
    genre: 'Acción / Fantasía • Lat/Sub',
    rating: '9.6',
    synopsis: 'En un mundo donde cazadores con poderes combaten monstruos mortales, un débil cazador obtiene una oportunidad única.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Kimetsu no Yaiba',
    genre: 'Shonen / Sobrenatural • Lat/Sub',
    rating: '9.5',
    synopsis: 'Tanjiro emprende un viaje para convertir cazadores de demonios y curar a su hermana convertida.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'Jujutsu Kaisen',
    genre: 'Acción / Oscuro • Lat/Sub',
    rating: '9.4',
    synopsis: 'Estudiantes de hechicería luchan contra maldiciones ancestrales en el Japón moderno.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'Chainsaw Man',
    genre: 'Acción / Gore • Lat/Sub',
    rating: '9.0',
    synopsis: 'Denji fusiona su vida con un demonio motosierra para sobrevivir en un mundo despiadado.',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export default function App() {
  const [selectedAnime, setSelectedAnime] = useState(KAIRO_PREMIUM_CATALOG[0]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {/* ENCABEZADO DE LA APP: MARCA LIBRE Y SIN ANUNCIOS */}
        <View style={styles.appHeader}>
          <Text style={styles.appName}>KAIRO <Text style={styles.appSubName}>TV</Text></Text>
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>GRATIS • SIN ANUNCIOS</Text>
          </View>
        </View>

        {/* SECCIÓN PRINCIPAL: REPRODUCTOR INTEGRADO Y DETALLES */}
        {selectedAnime && (
          <View style={styles.heroSection}>
            <View style={styles.heroInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {selectedAnime.title} <Text style={styles.rating}>{selectedAnime.rating}</Text>
              </Text>
              
              <View style={styles.genreBadge}>
                <Text style={styles.genreText}>{selectedAnime.genre}</Text>
              </View>

              <Text style={styles.synopsisLabel}>Sinopsis:</Text>
              <Text style={styles.synopsisText} numberOfLines={3}>
                {selectedAnime.synopsis}
              </Text>

              <View style={styles.tvButtonsRow}>
                <TouchableOpacity style={styles.tvButtonPrimary}>
                  <Text style={styles.tvButtonTextPrimary}>▶ Reproducir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tvButton}>
                  <Text style={styles.tvButtonText}>Audio Latino</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.heroPlayerContainer}>
              <WebView
                source={{ uri: selectedAnime.videoUrl }}
                style={styles.webViewPlayer}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          </View>
        )}

        {/* SECCIÓN DE ESTRENOS Y CATÁLOGO */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Estrenos al Instante (Latino)</Text>
          <FlatList
            data={KAIRO_PREMIUM_CATALOG}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.card, 
                  selectedAnime?.id === item.id && styles.cardSelected
                ]}
                onPress={() => setSelectedAnime(item)}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardFooter}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{item.rating}</Text>
                  </View>
                  <View style={styles.ccBadge}>
                    <Text style={styles.ccText}>LAT</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  mainScroll: {
    flex: 1,
    padding: 20,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  appSubName: {
    color: '#e50914',
  },
  freeBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroSection: {
    flexDirection: 'row',
    height: height * 0.42,
    marginBottom: 20,
  },
  heroInfo: {
    flex: 1.1,
    paddingRight: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rating: {
    color: '#f39c12',
    fontSize: 20,
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
    fontSize: 11,
  },
  synopsisLabel: {
    color: '#aaaaaa',
    fontSize: 11,
    marginTop: 4,
    fontWeight: 'bold',
  },
  synopsisText: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 16,
  },
  tvButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tvButtonPrimary: {
    backgroundColor: '#e50914',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  tvButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tvButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tvButtonText: {
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
    marginTop: 5,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  horizontalList: {
    paddingBottom: 10,
  },
  card: {
    width: 125,
    marginRight: 12,
    backgroundColor: '#151515',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#e50914',
  },
  cardImage: {
    width: '100%',
    height: 130,
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