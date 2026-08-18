import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

// 📡 Catálogo Dinámico con Portadas CDN de Alta Calidad y Streams Fluidos
const DEMO_CATALOG = [
  {
    id: 'dandadan',
    title: 'Dandadan',
    japaneseTitle: 'ダンダダン',
    year: '2024',
    rating: '9.9',
    age: '16+',
    genres: 'Acción • Sobrenatural • Comedia',
    synopsis: 'Momo Ayase y Okarun investigan fenómenos paranormales y alienígenas en una aventura frenética con doblaje latino oficial.',
    cover: 'https://cdn.myanimelist.net/images/anime/1763/145417l.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    episodes: [
      { id: '1', title: 'Episodio 1: ¿Así empieza el amor?', duration: '24 min' },
      { id: '2', title: 'Episodio 2: La Turbo Abuela ataca', duration: '23 min' },
      { id: '3', title: 'Episodio 3: Duelo entre fantasmas', duration: '24 min' },
    ]
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling: Arise',
    japaneseTitle: '俺だけレベルアップな件',
    year: '2024',
    rating: '9.8',
    age: '16+',
    genres: 'Acción • Fantasía Oscura',
    synopsis: 'Sung Jinwoo pasa de ser el cazador más débil de la humanidad al monarca supremo de las sombras tras despertar en una mazmorra doble.',
    cover: 'https://cdn.myanimelist.net/images/anime/1170/124302l.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    episodes: [
      { id: '1', title: 'Episodio 1: Estoy acostumbrado', duration: '24 min' },
      { id: '2', title: 'Episodio 2: Si tuviera otra oportunidad', duration: '23 min' },
    ]
  },
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey',
    japaneseTitle: '葬送のフリーレン',
    year: '2024',
    rating: '9.9',
    age: '13+',
    genres: 'Fantasía • Aventura • Drama',
    synopsis: 'Tras derrotar al Rey Demonio, la elfa maga Frieren emprende un viaje para comprender el valor de los recuerdos humanos.',
    cover: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    episodes: [
      { id: '1', title: 'Episodio 1: El final de la aventura', duration: '25 min' },
      { id: '2', title: 'Episodio 2: Magia para ver el cielo', duration: '24 min' },
    ]
  },
  {
    id: 'dragon-ball-daima',
    title: 'Dragon Ball Daima',
    japaneseTitle: 'ドラゴンボールDAIMA',
    year: '2024',
    rating: '9.7',
    age: '10+',
    genres: 'Acción • Aventura • Artes Marciales',
    synopsis: 'Goku y sus amigos son convertidos en niños debido a una conspiración en el Reino Demoníaco. Doblaje latino oficial.',
    cover: 'https://cdn.myanimelist.net/images/anime/1498/145462l.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    episodes: [
      { id: '1', title: 'Episodio 1: Conspiración y misterio', duration: '24 min' },
    ]
  }
];

export default function App() {
  const [selectedAnime, setSelectedAnime] = useState(DEMO_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [focusedId, setFocusedId] = useState('play-hero-btn');
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef(null);

  // 📺 MODO REPRODUCTOR NATIVO A PANTALLA COMPLETA
  if (isPlaying) {
    return (
      <View style={styles.playerContainer}>
        <StatusBar hidden />
        <Video
          ref={videoRef}
          source={{ uri: selectedAnime.videoUrl }}
          style={styles.fullVideo}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            setIsBuffering(status.isBuffering);
          }}
        />

        {isBuffering && (
          <View style={styles.bufferOverlay}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.bufferText}>Cargando búfer ultrarrápido...</Text>
          </View>
        )}

        {/* Botón Volver al Menú de TV */}
        <TouchableOpacity
          style={styles.exitPlayerButton}
          onPress={() => setIsPlaying(false)}
        >
          <Text style={styles.exitPlayerText}>← Volver a KAIRO TV</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🏠 MENÚ PRINCIPAL PARA ANDROID TV (16:9)
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* 1. Barra Superior con Logo KAIRO */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>KAIRO</Text>
          <Text style={styles.logoSub}>TV STREAM</Text>
        </View>
        <View style={styles.navRow}>
          <Text style={[styles.navItem, styles.navItemActive]}>Inicio</Text>
          <Text style={styles.navItem}>Latino VIP</Text>
          <Text style={styles.navItem}>Simulcasts</Text>
          <Text style={styles.navItem}>Mi Lista</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea}>
        {/* 2. Hero Banner Principal */}
        <View style={styles.heroCard}>
          <Image source={{ uri: selectedAnime.cover }} style={styles.heroBackdrop} />
          <View style={styles.heroGradient} />

          <View style={styles.heroContent}>
            <View style={styles.audioTag}>
              <Text style={styles.audioTagText}>AUDIO LATINO OFICIAL</Text>
            </View>
            <Text style={styles.heroTitle}>{selectedAnime.title}</Text>
            <Text style={styles.heroMeta}>
              ★ {selectedAnime.rating} • {selectedAnime.year} • {selectedAnime.age} • {selectedAnime.genres}
            </Text>
            <Text style={styles.heroSynopsis} numberOfLines={3}>
              {selectedAnime.synopsis}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.btnPlay,
                  focusedId === 'play-hero-btn' && styles.btnFocused
                ]}
                onPress={() => setIsPlaying(true)}
              >
                <Text style={styles.btnPlayText}>▶ Reproducir Ep. {activeEpisode}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSecondary,
                  focusedId === 'info-btn' && styles.btnFocused
                ]}
              >
                <Text style={styles.btnSecondaryText}>+ Mi Lista</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Carrusel Horizontal de Animes */}
        <Text style={styles.sectionHeader}>🔥 Tendencias en Latinoamérica</Text>
        <FlatList
          horizontal
          data={DEMO_CATALOG}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowList}
          renderItem={({ item }) => {
            const isSelected = selectedAnime.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.animeCard, isSelected && styles.animeCardSelected]}
                onPress={() => {
                  setSelectedAnime(item);
                  setActiveEpisode(1);
                }}
              >
                <Image source={{ uri: item.cover }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardSub}>★ {item.rating}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* 4. Lista de Episodios del Anime Seleccionado */}
        <Text style={styles.sectionHeader}>
          📺 Episodios Disponibles ({selectedAnime.title})
        </Text>
        <View style={styles.episodesGrid}>
          {selectedAnime.episodes.map((ep) => (
            <TouchableOpacity
              key={ep.id}
              style={[
                styles.epCard,
                activeEpisode === Number(ep.id) && styles.epCardActive
              ]}
              onPress={() => {
                setActiveEpisode(Number(ep.id));
                setIsPlaying(true);
              }}
            >
              <Text style={styles.epNum}>EP {ep.id}</Text>
              <View style={styles.epTextCol}>
                <Text style={styles.epTitle}>{ep.title}</Text>
                <Text style={styles.epDuration}>{ep.duration} • 1080p HD</Text>
              </View>
              <Text style={styles.epPlayIcon}>▶</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// 🎨 ESTILOS ANDROID TV / 10-FOOT INTERFACE
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#020617',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  logoText: {
    color: '#E50914',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoSub: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  navRow: {
    flexDirection: 'row',
    gap: 20,
  },
  navItem: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  navItemActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#E50914',
  },
  scrollArea: {
    flex: 1,
  },
  heroCard: {
    height: 280,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroBackdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.45,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
  },
  heroContent: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
    maxWidth: '75%',
  },
  audioTag: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  audioTagText: {
    color: '#020617',
    fontSize: 10,
    fontWeight: '900',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroMeta: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSynopsis: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPlay: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPlayText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnFocused: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  rowList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  animeCard: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  animeCardSelected: {
    borderColor: '#E50914',
    borderWidth: 2,
    transform: [{ scale: 1.04 }],
  },
  cardImage: {
    width: '100%',
    height: 190,
  },
  cardInfo: {
    padding: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  episodesGrid: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 10,
  },
  epCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  epCardActive: {
    borderColor: '#E50914',
    backgroundColor: '#1E1B4B',
  },
  epNum: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '900',
    width: 45,
  },
  epTextCol: {
    flex: 1,
  },
  epTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  epDuration: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  epPlayIcon: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    width: width,
    height: height,
  },
  bufferOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  bufferText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  exitPlayerButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  exitPlayerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});