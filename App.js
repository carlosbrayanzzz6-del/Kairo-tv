import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput,
  Dimensions 
} from 'react-native';
import { Video } from 'expo-av';

// Base de datos de anime optimizada en Castellano Latino
const ANIME_DATA = [
  {
    category: "Estrenos al Instante (Latino)",
    animes: [
      {
        id: "1",
        title: "Solo Leveling (Estreno)",
        rating: "9.6",
        image: "https://justwatch.com",
        banner: "https://justwatch.com",
        synopsis: "En un mundo donde cazadores con poderes combaten monstruos mortales, un débil cazador obtiene una oportunidad única en un sistema secreto.",
        seasons: [
          {
            name: "Temporada 1",
            episodes: [
              { id: "e1", title: "Episodio 1: El despertar", url: "https://googleapis.com" },
              { id: "e2", title: "Episodio 2: Un intento más", url: "https://googleapis.com" }
            ]
          }
        ]
      },
      {
        id: "2",
        title: "Kimetsu no Yaiba",
        rating: "9.5",
        image: "https://justwatch.com",
        banner: "https://justwatch.com",
        synopsis: "Tanjiro emprende un viaje peligroso para salvar a su hermana Nezuko convertida en demonio y vengar la muerte de toda su familia.",
        seasons: [
          {
            name: "Temporada 1",
            episodes: [
              { id: "e3", title: "Episodio 1: Crueldad", url: "https://googleapis.com" }
            ]
          }
        ]
      }
    ]
  },
  {
    category: "Acción y Shonen Popular",
    animes: [
      {
        id: "3",
        title: "Jujutsu Kaisen",
        rating: "9.4",
        image: "https://justwatch.com",
        banner: "https://justwatch.com",
        synopsis: "Un estudiante de secundaria con fuerza sobrehumana se traga un dedo maldito y se une a una academia secreta de hechicería.",
        seasons: [
          {
            name: "Temporada 1",
            episodes: [
              { id: "e4", title: "Episodio 1: Sukuna", url: "https://googleapis.com" }
            ]
          }
        ]
      },
      {
        id: "4",
        title: "Chainsaw Man",
        rating: "9.0",
        image: "https://justwatch.com",
        banner: "https://justwatch.com",
        synopsis: "Denji es un joven atrapado en la miseria extrema que resucita gracias a su perro demonio Pochita como el temible Hombre Motosierra.",
        seasons: [
          {
            name: "Temporada 1",
            episodes: [
              { id: "e5", title: "Episodio 1: Perro y Motosierra", url: "https://googleapis.com" }
            ]
          }
        ]
      }
    ]
  }
];

// Anime Destacado Inicial fijado de forma segura
const FEATURED_ANIME = ANIME_DATA[0].animes[0];

export default function App() {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [activeEpisodeUrl, setActiveEpisodeUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myList, setMyList] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('Latino');

  const openDetails = (anime) => {
    setSelectedAnime(anime);
  };

  const closeDetails = () => {
    setSelectedAnime(null);
    setActiveEpisodeUrl(null);
  };

  const toggleMyList = (anime) => {
    if (myList.some(item => item.id === anime.id)) {
      setMyList(myList.filter(item => item.id !== anime.id));
    } else {
      setMyList([...myList, anime]);
    }
  };

  const selectEpisode = (ep, anime) => {
    setActiveEpisodeUrl(ep.url);
    const filtered = continueWatching.filter(item => item.id !== anime.id);
    setContinueWatching([{ ...anime, lastEpisodeTitle: ep.title }, ...filtered]);
  };

  const handleNextEpisode = () => {
    if (!selectedAnime) return;
    const allEpisodes = selectedAnime.seasons.flatMap(s => s.episodes);
    const currentIndex = allEpisodes.findIndex(ep => ep.url === activeEpisodeUrl);
    if (currentIndex !== -1 && currentIndex < allEpisodes.length - 1) {
      const nextEp = allEpisodes[currentIndex + 1];
      selectEpisode(nextEp, selectedAnime);
    }
  };

  const hasNextEpisode = () => {
    if (!selectedAnime || !activeEpisodeUrl) return false;
    const allEpisodes = selectedAnime.seasons.flatMap(s => s.episodes);
    const currentIndex = allEpisodes.findIndex(ep => ep.url === activeEpisodeUrl);
    return currentIndex !== -1 && currentIndex < allEpisodes.length - 1;
  };

  const allAnimes = ANIME_DATA.flatMap(section => section.animes);
  const filteredAnimes = allAnimes.filter(anime => 
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Encabezado Principal */}
      <View style={styles.header}>
        <Text style={styles.logo}>KAIRO <Text style={styles.logoSub}>ULTRA</Text></Text>
        <Text style={styles.tag}>FAMILIA • EN CASA</Text>
      </View>

      {/* Buscador Inteligente */}
      <View style={styles.searchSection}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar anime en latino..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.catalog} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {/* Banner Destacado Superior */}
            <View style={styles.bannerContainer}>
              <Image source={{ uri: FEATURED_ANIME.banner }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerBadge}>🔥 LO MÁS VISTO HOY</Text>
                <Text style={styles.bannerTitle}>{FEATURED_ANIME.title}</Text>
                <Text numberOfLines={2} style={styles.bannerSynopsis}>{FEATURED_ANIME.synopsis}</Text>
                <TouchableOpacity style={styles.bannerButton} onPress={() => openDetails(FEATURED_ANIME)}>
                  <Text style={styles.bannerButtonText}>▶ Ver Ahora</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Fila: Continuar Viendo */}
            {continueWatching.length > 0 && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>⏳ Continuar Viendo</Text>
                <FlatList
                  horizontal
                  data={continueWatching}
                  keyExtractor={(item) => 'continue-' + item.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.animeCard} onPress={() => openDetails(item)}>
                      <Image source={{ uri: item.image }} style={styles.animeImage} />
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar} />
                      </View>
                      <Text numberOfLines={1} style={styles.animeTitle}>{item.title}</Text>
                      <Text numberOfLines={1} style={styles.lastEpText}>{item.lastEpisodeTitle}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Fila: Mi Lista */}
            {myList.length > 0 && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>❤️ Mi Lista Favorita</Text>
                <FlatList
                  horizontal
                  data={myList}
                  keyExtractor={(item) => 'mylist-' + item.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.animeCard} onPress={() => openDetails(item)}>
                      <Image source={{ uri: item.image }} style={styles.animeImage} />
                      <Text numberOfLines={1} style={styles.animeTitle}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Filas del Catálogo Tradicional */}
            {ANIME_DATA.map((section, index) => (
              <View key={index} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{section.category}</Text>
                <FlatList
                  horizontal
                  data={section.animes}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.animeCard} onPress={() => openDetails(item)}>
                      <Image source={{ uri: item.image }} style={styles.animeImage} />
                      <View style={styles.badgeContainer}>
                        <Text style={styles.ratingBadge}>{item.rating}</Text>
