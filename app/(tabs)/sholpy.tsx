// app/(tabs)/sholpy.tsx
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

// Путь к аудиофайлу (предполагается, что он лежит в assets/audio/sholpy.mp3)
const AUDIO_FILE = require('@/assets/audio/sholpy.mp3');

// Типы для информационных блоков
interface SymbolItem {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  title: string;
  description: string;
  color: string;
}

const symbolItems: SymbolItem[] = [
  {
    icon: 'sparkles',
    title: 'Сұлулық',
    description: 'Сыртқы көрініс пен ішкі жан дүниесінің үйлесімі',
    color: '#D4AF37',
  },
  {
    icon: 'heart.fill',
    title: 'Пәктік',
    description: 'Рухани тазалық, кіршіксіз сезім мен ой',
    color: '#E11D48',
  },
  {
    icon: 'shield.fill',
    title: 'Әдептілік',
    description: 'Ұлттық тәрбие, инабаттылық пен ар-намыс',
    color: '#1E3A8A',
  },
  {
    icon: 'music.note',
    title: 'Әуезділік',
    description: 'Табиғат үнімен үндескен шолпы сыңғыры',
    color: '#2E7D32',
  },
];

export default function SholpyScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createStyles(theme);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Состояния аудиоплеера
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Загрузка аудио при монтировании
    loadAudio();

    // Очистка при размонтировании
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Загрузка аудиофайла
  const loadAudio = async () => {
    try {
      setIsLoadingAudio(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        AUDIO_FILE,
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsAudioReady(true);
    } catch (error) {
      console.error('Audio loading error:', error);
      Alert.alert('Қате', 'Аудио жүктеу мүмкін болмады');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Обработчик обновления статуса воспроизведения
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setPlaybackPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis || 1);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      // Сбрасываем позицию в начало при завершении
      setPlaybackPosition(0);
    }
  };

  // Управление воспроизведением
  const togglePlayback = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!sound) {
      await loadAudio();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // Если трек закончился, перематываем в начало
        if (playbackPosition >= playbackDuration - 100) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      Alert.alert('Қате', 'Ойнату кезінде қате орын алды');
    }
  };

  // Перемотка на 10 секунд
  const seekForward = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!sound) return;
    try {
      const newPosition = Math.min(playbackPosition + 10000, playbackDuration);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      // игнорируем
    }
  };

  const seekBackward = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!sound) return;
    try {
      const newPosition = Math.max(playbackPosition - 10000, 0);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      // игнорируем
    }
  };

  // Форматирование времени
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Прогресс в процентах
  const progressPercent = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Заголовок */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.headerTitle}>Шолпы</Text>
          <Text style={styles.headerSubtitle}>Мағжан Жұмабаевтың өлеңі</Text>
        </Animated.View>

        {/* Иллюстрация шолпы */}
        <Animated.View
          style={[
            styles.imageCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <LinearGradient
            colors={[theme.secondary + '30', theme.accent + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imageGradient}>
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="sparkles" size={64} color={theme.accent} />
              <Text style={styles.imageCaption}>Шолпы — қазақ қызының әшекейі</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Аудиоплеер */}
        <Animated.View
          style={[
            styles.audioCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.audioHeader}>
            <IconSymbol name="music.note" size={20} color={theme.accent} />
            <Text style={styles.audioTitle}>«Шолпы» өлеңі</Text>
          </View>
          
          <Text style={styles.audioSubtitle}>Мағжан Жұмабаев</Text>
          
          {/* Прогресс-бар */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    backgroundColor: theme.primary,
                    width: `${progressPercent}%`,
                  }
                ]} 
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(playbackDuration)}</Text>
            </View>
          </View>

          {/* Кнопки управления */}
          <View style={styles.audioControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={seekBackward}
              disabled={!isAudioReady}>
              <IconSymbol name="gobackward" size={24} color={isAudioReady ? theme.text : theme.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: theme.primary }]}
              onPress={togglePlayback}
              disabled={isLoadingAudio}>
              {isLoadingAudio ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <IconSymbol 
                  name={isPlaying ? 'pause.fill' : 'play.fill'} 
                  size={28} 
                  color="#FFF" 
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={seekForward}
              disabled={!isAudioReady}>
              <IconSymbol name="goforward" size={24} color={isAudioReady ? theme.text : theme.icon} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Цитата из стихотворения */}
        <Animated.View
          style={[
            styles.quoteCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.quoteContent}>
            <IconSymbol name="sparkles" size={24} color={theme.accent} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "Сылдырлап аққан бұлақтай,{'\n'}
              Сыңғырлап соққан шолпыдай..."
            </Text>
            <Text style={styles.quoteAuthor}>— Мағжан Жұмабаев, «Шолпы»</Text>
          </View>
        </Animated.View>

        {/* Раздел "Шолпы дегеніміз не?" */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.sectionTitle}>Шолпы дегеніміз не?</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Шолпы — қазақ қыздарының шашына тағатын дәстүрлі әшекей бұйымы. 
              Ол күміс теңгелерден, моншақтардан және сылдырмақтардан тұрады. 
              Шолпының сыңғыры қыз баланың әдептілігі мен тазалығын білдіреді.
            </Text>
            <View style={styles.divider} />
            <View style={styles.factRow}>
              <IconSymbol name="lightbulb.fill" size={18} color={theme.accent} />
              <Text style={styles.factText}>
                Шолпы тек әсемдік үшін емес, тәрбиелік мәнге де ие. 
                Оның дыбысы қыз баланың жүріс-тұрысын бақылауға көмектескен.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Раздел "Ұлттық ерекшелігі" */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={styles.sectionTitle}>Ұлттық ерекшелігі</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Мағжан Жұмабаев «Шолпы» өлеңінде қазақ қызының нәзік бейнесін 
              ұлттық дәстүрлер аясында суреттейді. Шолпының сыңғыры табиғат 
              әуенімен үндесіп, қазақ даласының сұлулығын, пәктігі мен 
              әдептілігін символдайды.
            </Text>
          </View>
        </Animated.View>

        {/* Символика */}
        <Animated.View
          style={[
            styles.symbolsSection,
            {
              opacity: fadeAnim,
            },
          ]}>
          <Text style={styles.sectionTitle}>Символикасы</Text>
          <View style={styles.symbolsGrid}>
            {symbolItems.map((item, index) => (
              <View key={index} style={[styles.symbolCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.symbolIconContainer, { backgroundColor: item.color + '15' }]}>
                  <IconSymbol name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.symbolTitle}>{item.title}</Text>
                <Text style={styles.symbolDesc}>{item.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Связь с воспитательным значением */}
        <Animated.View
          style={[
            styles.linkCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: theme.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/moral');
            }}
            activeOpacity={0.7}>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Тәрбиелік мәні</Text>
              <Text style={styles.linkSubtitle}>Өлеңнің тәрбиелік маңыздылығын толық тану</Text>
            </View>
            <IconSymbol name="chevron.right" size={24} color={theme.primary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    header: {
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 34,
      fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
    imageCard: {
      borderRadius: 24,
      marginBottom: 24,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    imageGradient: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholder: {
      alignItems: 'center',
    },
    imageCaption: {
      marginTop: 12,
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
      textAlign: 'center',
    },
    audioCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    audioHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    audioTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    audioSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
      marginLeft: 28,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBarBackground: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    audioControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },
    controlButton: {
      padding: 8,
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    quoteCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      marginBottom: 28,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    quoteContent: {
      alignItems: 'center',
    },
    quoteIcon: {
      marginBottom: 12,
    },
    quoteText: {
      fontSize: 20,
      lineHeight: 32,
      fontFamily: Fonts.ios?.serif,
      color: theme.text,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 8,
    },
    quoteAuthor: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 18,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    cardText: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.text,
      fontFamily: Fonts.ios?.sans,
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 12,
    },
    factRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    factText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
    symbolsSection: {
      marginBottom: 24,
    },
    symbolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    symbolCard: {
      width: (width - 64) / 2,
      borderRadius: 18,
      padding: 16,
      alignItems: 'center',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    symbolIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    symbolTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    symbolDesc: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    linkCard: {
      marginTop: 8,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    linkContent: {
      flex: 1,
    },
    linkTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    linkSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });