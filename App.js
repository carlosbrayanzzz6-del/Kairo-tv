import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const API_BASE = 'https://api.jikan.moe/v4';

// Datos de fallback por si la API tarda en responder
const FALLBACK_POPULARES = [
  { id: 1, title: 'Solo Leveling', ep: 'Episodio 12', genre: 'Acción, Aventura', image: 'https://cdn.myanimelist.net/images/anime/1733/141165.jpg', rank: 1 },
  { id: 2, title: 'Demon Slayer', ep: 'Episodio 45', genre: 'Acción, Fantasía', image: 'https://cdn.myanimelist.net/images/anime/1208/135831.jpg', rank: 2 },
  { id: 3, title: 'Jujutsu Kaisen', ep: 'Episodio 15', genre: 'Acción, Sobrenatural', image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', rank: 3 },
  { id: 4, title: 'Attack on Titan', ep: 'Episodio 87', genre: 'Acción, Drama', image: 'https://cdn.myanimelist.net/images/anime/1000/110531.jpg', rank: 4 },
  { id: 5, title: 'One Piece', ep: 'Episodio 1123', genre: 'Aventura, Comedia', image: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg', rank: 5 },
  { id: 6, title: 'Bleach', ep: 'Episodio 366', genre: 'Acción, Sobrenatural', image: 'https://cdn.myanimelist.net/images/anime/1908/135431.jpg', rank: 6 }
];

const FALLBACK_CONTINUAR = [
  { id: 101, title: 'One Piece', ep: 'Episodio 1123', progress: 0.7, image: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg' },
  { id: 102, title: 'Demon Slayer', ep: 'Episodio 45', progress: 0.4, image: 'https://cdn.myanimelist.net/images/anime/1208/135831.jpg' },
  { id: 103, title: 'Naruto Shippuden', ep: 'Episodio 500', progress: 0.9, image: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg' },
  { id: 104, title: 'Jujutsu Kaisen', ep: 'Episodio 15', progress: 0.3, image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' },
  { id: 105, title: 'Shingeki no Kyojin', ep: 'Episodio 87', progress: 0.85, image: 'https://cdn.myanimelist.net/images/anime/1000/110531.jpg' }
];

const FALLBACK_NUEVOS = [
  { id: 201, title: 'My Hero Academia', ep: 'Episodio 158', image: 'https://cdn.myanimelist.net/images/anime/1911/140608.jpg' },
  { id: 202, title: 'Black Clover', ep: 'Episodio 171', image: 'https://cdn.myanimelist.net/images/anime/1079/138100.jpg' },
  { id: 203, title: 'Vinland Saga', ep: 'Episodio 24', image: 'https://cdn.myanimelist.net/images/anime/1500/103023.jpg' },
  { id: 204, title: 'Chainsaw Man', ep: 'Episodio 12', image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg' },
  { id: 205, title: 'Blue Lock', ep: 'Episodio 38', image: 'https://cdn.myanimelist.net/images/anime/1258/126929.jpg' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('INICIO');
  const [populares, setPopulares] = useState(FALLBACK_POPULARES);
  const [continuar, setContinuar] = useState(FALLBACK_CONTINUAR);
  const [nuevos, setNuevos] = useState(FALLBACK_NUEVOS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [playingEpisode, setPlayingEpisode] = useState(null);

  // Cargar Animes desde API de MyAnimeList (Jikan)
  useEffect(() => {
    fetchTopAnime();
  }, []);

  const fetchTopAnime = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/top/anime?limit=12`);
      const data = await res.json();
      if (data && data.data) {
        const formatted = data.data.map((item, index) => ({
          id: item.mal_id,
          title: item.title,
          ep: `Episodios: ${item.episodes || 'En emisión'}`,
          genre: item.genres.map(g => g.name).slice(0, 2).join(', '),
          image: item.images.jpg.large_image_url || item.images.jpg.image_url,
          synopsis: item.synopsis,
          score: item.score,
          rank: index + 1
        }));
        setPopulares(formatted);
      }
    } catch (e) {
      console.log('Error fetching anime, usando fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const res = await fetch(`${API_BASE}/anime?q=${encodeURIComponent(text)}&limit=10`);
        const data = await res.json();
        if (data && data.data) {
          setSearchResults(data.data);
        }
      } catch (e) {
        console.log('Error searching:', e);
      }
    } else {
      setSearchResults([]);
    }
  };

  const openAnimeDetail = (anime) => {
    setSelectedAnime(anime);
  };

  const startPlaying = (epNum) => {
    setPlayingEpisode(epNum || 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* SIDEBAR NAVEGACIÓN */}
      <View style={styles.sidebar}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Ionicons name="dragon" size={28} color="#00d2ff" style={{ marginRight: 6 }} />
          <View>
            <Text style={styles.logoText}>KAIRO</Text>
            <Text style={styles.logoSubText}>ANIME SIN LÍMITES</Text>
          </View>
        </View>

        {/* MENU ITEMS */}
        <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
          <NavItem icon="home" label="INICIO" active={activeTab === 'INICIO'} onPress={() => setActiveTab('INICIO')} />
          <NavItem icon="flame" label="POPULARES" active={activeTab === 'POPULARES'} onPress={() => setActiveTab('POPULARES')} />
          <NavItem icon="sparkles" label="NUEVOS" active={activeTab === 'NUEVOS'} onPress={() => setActiveTab('NUEVOS')} />
          <NavItem icon="grid" label="GÉNEROS" active={activeTab === 'GÉNEROS'} onPress={() => setActiveTab('GÉNEROS')} />
          <NavItem icon="tv" label="MI LISTA" active={activeTab === 'MI LISTA'} onPress={() => setActiveTab('MI LISTA')} />
          <NavItem icon="time" label="CONTINUAR VIENDO" active={activeTab === 'CONTINUAR'} onPress={() => setActiveTab('CONTINUAR')} />
          <NavItem icon="search" label="BUSCAR" active={activeTab === 'BUSCAR'} onPress={() => setActiveTab('BUSCAR')} />
          <NavItem icon="person" label="MI PERFIL" active={activeTab === 'PERFIL'} onPress={() => setActiveTab('PERFIL')} />
        </ScrollView>

        {/* CARD PREMIUM */}
        <View style={styles.premiumCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="crown" size={16} color="#ffd700" />
            <Text style={styles.premiumTitle}> KAIRO PREMIUM</Text>
          </View>
          <Text style={styles.premiumDesc}>Sin anuncios, acceso anticipado y mucho más.</Text>
          <TouchableOpacity style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>OBTENER PREMIUM</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <View style={styles.mainContent}>
        
        {/* TOP BAR SEARCH / HEADER */}
        {activeTab === 'BUSCAR' ? (
          <View style={styles.searchHeader}>
            <Ionicons name="search" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar miles de animes, películas..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>
        ) : (
          <View style={styles.topBar}>
            <View />
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity style={styles.iconCircle} onPress={() => setActiveTab('BUSCAR')}>
                <Ionicons name="search" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="settings-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* SI SE ESTÁ BUSCANDO */}
          {activeTab === 'BUSCAR' ? (
            <View style={{ padding: 20 }}>
              <Text style={styles.sectionTitle}>Resultados de búsqueda</Text>
              <View style={styles.gridContainer}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.mal_id}
                    style={styles.cardItem}
                    onPress={() => openAnimeDetail({
                      id: item.mal_id,
                      title: item.title,
                      ep: `Episodios: ${item.episodes || '?'}`,
                      genre: item.genres?.map(g => g.name).join(', ') || 'Anime',
                      image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
                      synopsis: item.synopsis
                    })}
                  >
                    <Image source={{ uri: item.images?.jpg?.image_url }} style={styles.cardImg} />
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {/* HERO FEATURED BANNER */}
              <View style={styles.heroContainer}>
                <ImageBackground
                  source={{ uri: 'https://cdn.myanimelist.net/images/anime/1733/141165.jpg' }}
                  style={styles.heroImage}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.heroOverlay}>
                    <View style={styles.badgeFeatured}>
                      <Text style={styles.badgeFeaturedText}>DESTACADO</Text>
                    </View>
                    <Text style={styles.heroTitle}>SOLO LEVELING</Text>
                    <Text style={styles.heroDesc} numberOfLines={2}>
                      El cazador más débil de todos cambia su destino y se convierte en el más fuerte tras adentrarse en mazmorras oscuras.
                    </Text>
                    <View style={styles.heroActions}>
                      <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => startPlaying(1)}
                      >
                        <Ionicons name="play" size={18} color="#000" style={{ marginRight: 6 }} />
                        <Text style={styles.btnPrimaryText}>VER AHORA</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnSecondary}>
                        <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.btnSecondaryText}>+ MI LISTA</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ImageBackground>
              </View>

              {/* SECCIÓN: CONTINUAR VIENDO */}
              <View style={styles.sectionContainer}>
                <TouchableOpacity style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>CONTINUAR VIENDO</Text>
                  <Ionicons name="chevron-forward" size={18} color="#00d2ff" />
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {continuar.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.continuarCard}
                      onPress={() => openAnimeDetail(item)}
                    >
                      <Image source={{ uri: item.image }} style={styles.continuarImg} />
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardSubTitle}>{item.ep}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SECCIÓN: POPULARES */}
              <View style={styles.sectionContainer}>
                <TouchableOpacity style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>POPULARES</Text>
                  <Ionicons name="chevron-forward" size={18} color="#00d2ff" />
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {populares.map((item, index) => (
                    <TouchableOpacity
                      key={item.id || index}
                      style={styles.popularesCard}
                      onPress={() => openAnimeDetail(item)}
                    >
                      <Image source={{ uri: item.image }} style={styles.popularesImg} />
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{item.rank || index + 1}</Text>
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardSubTitle} numberOfLines={1}>{item.genre || item.ep}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SECCIÓN: NUEVOS EPISODIOS */}
              <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
                <TouchableOpacity style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>NUEVOS EPISODIOS</Text>
                  <Ionicons name="chevron-forward" size={18} color="#00d2ff" />
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {nuevos.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.nuevosCard}
                      onPress={() => openAnimeDetail(item)}
                    >
                      <Image source={{ uri: item.image }} style={styles.nuevosImg} />
                      <View style={styles.nuevoBadge}>
                        <Text style={styles.nuevoBadgeText}>NUEVO</Text>
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardSubTitle}>{item.ep}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* MODAL DE DETALLE DE ANIME */}
      <Modal visible={selectedAnime !== null} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selectedAnime && (
              <>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedAnime(null)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 20 }}>
                  <Image source={{ uri: selectedAnime.image }} style={styles.modalImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedAnime.title}</Text>
                    <Text style={styles.modalMeta}>{selectedAnime.genre || 'Acción, Fantasía'}</Text>
                    <Text style={styles.modalDesc} numberOfLines={5}>
                      {selectedAnime.synopsis || 'Sinopsis no disponible. Disfruta los mejores episodios de ' + selectedAnime.title + ' totalmente gratis en Kairo TV.'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.btnPrimary, { marginTop: 15, alignSelf: 'flex-start' }]}
                      onPress={() => {
                        const animeToPlay = selectedAnime;
                        setSelectedAnime(null);
                        startPlaying(1);
                      }}
                    >
                      <Ionicons name="play" size={18} color="#000" style={{ marginRight: 6 }} />
                      <Text style={styles.btnPrimaryText}>REPRODUCIR EPISODIO 1</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: 10 }]}>Episodios disponibles</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ep) => (
                    <TouchableOpacity
                      key={ep}
                      style={styles.epBox}
                      onPress={() => {
                        setSelectedAnime(null);
                        startPlaying(ep);
                      }}
                    >
                      <Ionicons name="play-circle" size={22} color="#00d2ff" />
                      <Text style={styles.epBoxText}>Episodio {ep}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL DE REPRODUCTOR DE VIDEO */}
      <Modal visible={playingEpisode !== null} transparent animationType="slide">
        <View style={styles.playerContainer}>
          <TouchableOpacity style={styles.closePlayerBtn} onPress={() => setPlayingEpisode(null)}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
            <Text style={styles.closePlayerText}> Volver al menú</Text>
          </TouchableOpacity>
          
          <View style={styles.videoScreen}>
            <ActivityIndicator size="large" color="#00d2ff" />
            <Text style={styles.videoText}>Cargando Episodio {playingEpisode}...</Text>
            <Text style={styles.videoSubText}>Conectando a los servidores de streaming de Kairo TV</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// COMPONENTE ITEM DE BARRA LATERAL
function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? '#00d2ff' : '#94a3b8'}
        style={{ marginRight: 12 }}
      />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    backgroundColor: '#0a0f1d',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    padding: 16,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoSubText: {
    color: '#00d2ff',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  menuList: {
   
