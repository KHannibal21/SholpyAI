// app/(tabs)/index.tsx
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

// Типы для карточек разделов
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  route: string;
  color: string;
}

const featureCards: FeatureCard[] = [
  {
    id: 'poet',
    title: 'Ақын',
    description: 'Мағжан Жұмабаевтың өмірі мен рухы',
    icon: 'person.fill',
    route: '/poet',
    color: '#1E3A8A',
  },
  {
    id: 'sholpy',
    title: 'Шолпы',
    description: 'Ұлттық әшекейдің мәні мен символы',
    icon: 'sparkles',
    route: '/sholpy',
    color: '#B68B40',
  },
  {
    id: 'moral',
    title: 'Тәрбие',
    description: 'Өлеңнің тәрбиелік маңызы',
    icon: 'heart.fill',
    route: '/moral',
    color: '#D4AF37',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createStyles(theme);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Запускаем анимацию при монтировании
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleQuickChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/chat');
  };

  const handleQuickQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/quiz');
  };

  // Приветствие в зависимости от времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Қайырлы түн';
    if (hour < 12) return 'Қайырлы таң';
    if (hour < 18) return 'Қайырлы күн';
    return 'Қайырлы кеш';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Header с приветствием */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>Оқушы 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.aiBadge}
            onPress={handleQuickChat}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[theme.primary, '#3B5BA5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiBadgeGradient}>
              <IconSymbol name="message.fill" size={20} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Цитата из "Шолпы" */}
        <Animated.View
          style={[
            styles.quoteCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <LinearGradient
            colors={[theme.surface, theme.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}>
            <IconSymbol name="sparkles" size={24} color={theme.accent} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "Сылдырлап аққан бұлақтай,{'\n'}
              Сыңғырлап соққан шолпыдай..."
            </Text>
            <Text style={styles.quoteAuthor}>— Мағжан Жұмабаев, «Шолпы»</Text>
          </LinearGradient>
        </Animated.View>

        {/* Быстрые действия */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.primary }]}
            onPress={handleQuickChat}
            activeOpacity={0.8}>
            <IconSymbol name="message.fill" size={24} color="#FFFFFF" />
            <Text style={styles.quickButtonText}>AI-көмекші</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.accent }]}
            onPress={handleQuickQuiz}
            activeOpacity={0.8}>
            <IconSymbol name="questionmark.circle.fill" size={24} color="#1A1F36" />
            <Text style={[styles.quickButtonText, { color: '#1A1F36' }]}>Тест тапсыру</Text>
          </TouchableOpacity>
        </View>

        {/* Заголовок разделов */}
        <Text style={styles.sectionTitle}>Мазмұны</Text>

        {/* Карточки разделов */}
        <View style={styles.cardsContainer}>
          {featureCards.map((card, index) => (
            <Animated.View
              key={card.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30 - index * 10],
                    }),
                  },
                ],
              }}>
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: card.color }]}
                onPress={() => handlePress(card.route)}
                activeOpacity={0.7}>
                <View style={[styles.cardIconContainer, { backgroundColor: card.color + '20' }]}>
                  <IconSymbol name={card.icon} size={28} color={card.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={theme.icon} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Информационный блок о приложении */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.infoHeader}>
            <IconSymbol name="sparkles" size={20} color={theme.accent} />
            <Text style={styles.infoTitle}>SholpyAI туралы</Text>
          </View>
          <Text style={styles.infoText}>
            Бұл қосымша Мағжан Жұмабаевтың «Шолпы» өлеңінің тәрбиелік мәнін
            терең түсінуге көмектеседі. Жасанды интеллект көмегімен сіз
            кез келген сұраққа жауап ала аласыз.
          </Text>
        </Animated.View>

        {/* Отступ снизу для комфортного скролла */}
        <View style={{ height: 20 }} />
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
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    greeting: {
      fontSize: 16,
      fontFamily: Fonts.ios?.sans,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    userName: {
      fontSize: 28,
      fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
    },
    aiBadge: {
      borderRadius: 30,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    aiBadgeGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    aiBadgeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    quoteCard: {
      borderRadius: 24,
      marginBottom: 28,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    quoteGradient: {
      padding: 24,
      alignItems: 'center',
    },
    quoteIcon: {
      marginBottom: 12,
      opacity: 0.8,
    },
    quoteText: {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: Fonts.ios?.serif,
      color: theme.text,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: 12,
    },
    quoteAuthor: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
      textAlign: 'center',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 32,
    },
    quickButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      gap: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    quickButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
      marginBottom: 16,
    },
    cardsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 16,
      borderLeftWidth: 5,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    cardIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
    infoCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginTop: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: Fonts.ios?.rounded,
      color: theme.text,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
  });