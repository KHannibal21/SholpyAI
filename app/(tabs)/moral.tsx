// app/(tabs)/moral.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Типы для вкладок
type TabType = 'aspects' | 'recommendations' | 'conclusion';

interface TabItem {
  id: TabType;
  title: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
}

const tabs: TabItem[] = [
  { id: 'aspects', title: 'Негізгі аспектілер', icon: 'heart.fill' },
  { id: 'recommendations', title: 'Ұсыныстар', icon: 'checklist' },
  { id: 'conclusion', title: 'Қорытынды', icon: 'star.fill' },
];

// Аспекты воспитательного значения
interface MoralAspect {
  id: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  title: string;
  shortDesc: string;
  fullDesc: string;
  color: string;
}

const moralAspects: MoralAspect[] = [
  {
    id: '1',
    icon: 'heart.fill',
    title: 'Қыз бала тәрбиесі',
    shortDesc: 'Қазақ қоғамында қыз бала тәрбиесіне ерекше мән беріледі.',
    fullDesc: 'Қазақ халқы үшін қыз бала — отбасының ғана емес, бүкіл қоғамның айнасы. Шолпы — қыздың әдептілігі мен ар-намысының белгісі. Өлең арқылы ақын қыз баланы құрметтеуге, оның ішкі жан дүниесін бағалауға шақырады.',
    color: '#E11D48',
  },
  {
    id: '2',
    icon: 'sparkles',
    title: 'Әдептілік пен ар-намыс',
    shortDesc: 'Шолпының сыңғыры нәзіктік пен тазалықты бейнелейді.',
    fullDesc: 'Мағжан шолпының дыбысы арқылы қазақ қызының әсемдігі мен ішкі дүниесінің тазалығын сипаттайды. Өлең жастарды әдептілікке, ар-намысқа, мінездің сұлулығына тәрбиелейді. Бұл қасиеттер ұлттық болмыстың ажырамас бөлігі.',
    color: '#D4AF37',
  },
  {
    id: '3',
    icon: 'flag.fill',
    title: 'Ұлттық салт-дәстүр',
    shortDesc: 'Мағжан ұлттық құндылықтар мен салт-дәстүрлерді сақтауға шақырады.',
    fullDesc: '«Шолпы» өлеңі қазақтың бай мәдени мұрасын дәріптейді. Ақын қыз баланың тәрбиесіне байланысты салт-дәстүрлерді жоғары бағалап, оларды ұрпақтан-ұрпаққа жеткізудің маңыздылығын көрсетеді. Бұл — ұлттық кодты сақтаудың бір жолы.',
    color: '#1E3A8A',
  },
  {
    id: '4',
    icon: 'person.3.fill',
    title: 'Қыз баланың қоғамдық рөлі',
    shortDesc: 'Қазақ қызы — бүкіл қоғамның рухани тірегі.',
    fullDesc: 'Өлеңде қазақ қызының нәзіктігі мен әсемдігі оның тек отбасы мүшесі ғана емес, бүкіл қоғамның рухани тірегі екенін білдіреді. Мағжан әйелдердің қоғамдағы мәртебесін жоғары қоя отырып, олардың жауапкершілігін айқындайды.',
    color: '#2E7D32',
  },
  {
    id: '5',
    icon: 'lightbulb.fill',
    title: 'Жастарға үлгі',
    shortDesc: 'Өлең жастарды сұлулық пен әдептілікке үндейді.',
    fullDesc: 'Мағжан жастарды, әсіресе қыздарды, сұлулық пен әдептілікке, ар-намысқа, ұлттық құндылықтарды сақтауға, өз болмысын жоғары бағалауға шақырады. Бұл өлең бүгінгі ұрпақ үшін де өзекті үлгі болып қала береді.',
    color: '#B68B40',
  },
];

// Рекомендации с возможностью отметить выполнение
interface Recommendation {
  id: string;
  text: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  completed: boolean;
}

const defaultRecommendations: Recommendation[] = [
  {
    id: '1',
    text: 'Мағжанның өлеңінің мәнін ашатын шығармашылық шаралар ұйымдастыру (поэзиялық кештер, дөңгелек үстелдер).',
    icon: 'calendar',
    completed: false,
  },
  {
    id: '2',
    text: '«Шолпы» өлеңін мектептер мен жоғары оқу орындарында оқыту арқылы жастарды ұлттық тәрбиеге баулу.',
    icon: 'book.fill',
    completed: false,
  },
  {
    id: '3',
    text: 'Ұлттық құндылықтарды дәріптейтін мобильді қосымшалар мен интерактивті құралдар әзірлеу.',
    icon: 'apps',
    completed: false,
  },
  {
    id: '4',
    text: 'Отбасында қыз балаға ұлттық тәрбие беру, шолпы тағу дәстүрін жаңғырту.',
    icon: 'house.fill',
    completed: false,
  },
  {
    id: '5',
    text: 'Әлеуметтік желілерде «Шолпы» челленджін ұйымдастырып, жастардың назарын аудару.',
    icon: 'network',
    completed: false,
  },
];

export default function MoralScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createStyles(theme);

  // Состояния
  const [activeTab, setActiveTab] = useState<TabType>('aspects');
  const [expandedAspectId, setExpandedAspectId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(defaultRecommendations);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  // Загрузка состояния рекомендаций из AsyncStorage
  useEffect(() => {
    loadRecommendationsState();
  }, []);

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
    ]).start();
  }, []);

  const loadRecommendationsState = async () => {
    try {
      const saved = await AsyncStorage.getItem('moral_recommendations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecommendations(prev => 
          prev.map(rec => ({
            ...rec,
            completed: parsed[rec.id] || false,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load recommendations state', error);
    }
  };

  const saveRecommendationsState = async (newRecommendations: Recommendation[]) => {
    try {
      const state = newRecommendations.reduce((acc, rec) => {
        acc[rec.id] = rec.completed;
        return acc;
      }, {} as Record<string, boolean>);
      await AsyncStorage.setItem('moral_recommendations', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save recommendations state', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setActiveTab(tab);
  };

  const toggleAspectExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAspectId(expandedAspectId === id ? null : id);
  };

  const toggleRecommendation = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newRecommendations = recommendations.map(rec =>
      rec.id === id ? { ...rec, completed: !rec.completed } : rec
    );
    setRecommendations(newRecommendations);
    saveRecommendationsState(newRecommendations);
  };

  // Подсчёт выполненных рекомендаций
  const completedCount = recommendations.filter(r => r.completed).length;
  const progressPercent = (completedCount / recommendations.length) * 100;

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
          <Text style={styles.headerTitle}>Тәрбиелік мәні</Text>
          <Text style={styles.headerSubtitle}>
            «Шолпы» өлеңінің жастарға берер тәлімі
          </Text>
        </Animated.View>

        {/* Вводная цитата */}
        <Animated.View
          style={[
            styles.introCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <IconSymbol name="sparkles" size={28} color={theme.accent} style={styles.introIcon} />
          <Text style={styles.introText}>
            Мағжан Жұмабаевтың «Шолпы» өлеңі — тек көркем шығарма ғана емес,
            сонымен бірге ұлттық тәрбиенің, әдептілік пен рухани тазалықтың
            үлгісі. Бұл өлең жас ұрпақты ізгілікке, сұлулықты сезінуге,
            ұлттық құндылықтарды бағалауға баулиды.
          </Text>
        </Animated.View>

        {/* Селектор вкладок */}
        <Animated.View
          style={[
            styles.tabSelector,
            {
              opacity: fadeAnim,
            },
          ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
                { borderBottomColor: activeTab === tab.id ? theme.primary : 'transparent' },
              ]}
              onPress={() => handleTabChange(tab.id)}
              activeOpacity={0.7}>
              <IconSymbol 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? theme.primary : theme.textSecondary} 
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && { color: theme.primary, fontWeight: '600' },
                ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Контент вкладок */}
        <Animated.View style={{ opacity: contentFadeAnim }}>
          {activeTab === 'aspects' && (
            <AspectsSection
              theme={theme}
              aspects={moralAspects}
              expandedId={expandedAspectId}
              onToggle={toggleAspectExpand}
            />
          )}
          {activeTab === 'recommendations' && (
            <RecommendationsSection
              theme={theme}
              recommendations={recommendations}
              onToggle={toggleRecommendation}
              progressPercent={progressPercent}
              completedCount={completedCount}
              totalCount={recommendations.length}
            />
          )}
          {activeTab === 'conclusion' && (
            <ConclusionSection theme={theme} />
          )}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Компонент секции аспектов
function AspectsSection({ 
  theme, 
  aspects, 
  expandedId, 
  onToggle 
}: { 
  theme: typeof Colors.light; 
  aspects: MoralAspect[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const styles = createAspectsStyles(theme);
  
  return (
    <View style={styles.container}>
      {aspects.map((aspect) => {
        const isExpanded = expandedId === aspect.id;
        return (
          <TouchableOpacity
            key={aspect.id}
            style={[styles.card, isExpanded && styles.cardExpanded]}
            onPress={() => onToggle(aspect.id)}
            activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: aspect.color + '15' }]}>
                <IconSymbol name={aspect.icon} size={24} color={aspect.color} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{aspect.title}</Text>
                <Text style={styles.cardShortDesc}>{aspect.shortDesc}</Text>
              </View>
              <IconSymbol 
                name={isExpanded ? 'chevron.up' : 'chevron.down'} 
                size={20} 
                color={theme.icon} 
              />
            </View>
            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.cardFullDesc}>{aspect.fullDesc}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Компонент секции рекомендаций
function RecommendationsSection({ 
  theme, 
  recommendations, 
  onToggle,
  progressPercent,
  completedCount,
  totalCount,
}: { 
  theme: typeof Colors.light; 
  recommendations: Recommendation[];
  onToggle: (id: string) => void;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
}) {
  const styles = createRecommendationsStyles(theme);
  
  return (
    <View style={styles.container}>
      {/* Прогресс-бар */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Орындалу барысы</Text>
          <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
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
      </View>

      {/* Список рекомендаций */}
      <Text style={styles.sectionTitle}>Ұсыныстар тізімі</Text>
      <View style={styles.list}>
        {recommendations.map((rec) => (
          <TouchableOpacity
            key={rec.id}
            style={[styles.recItem, rec.completed && styles.recItemCompleted]}
            onPress={() => onToggle(rec.id)}
            activeOpacity={0.7}>
            <View style={styles.recLeft}>
              <View style={[styles.recCheckbox, rec.completed && styles.recCheckboxChecked]}>
                {rec.completed && <IconSymbol name="checkmark" size={16} color="#FFF" />}
              </View>
              <IconSymbol name={rec.icon} size={20} color={rec.completed ? theme.primary : theme.textSecondary} />
            </View>
            <Text style={[styles.recText, rec.completed && styles.recTextCompleted]}>
              {rec.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Компонент секции заключения
function ConclusionSection({ theme }: { theme: typeof Colors.light }) {
  const styles = createConclusionStyles(theme);
  
  return (
    <View style={styles.container}>
      <View style={styles.quoteCard}>
        <IconSymbol name="heart.fill" size={24} color={theme.accent} style={styles.quoteIcon} />
        <Text style={styles.quoteText}>
          «Шолпы — ұлттық болмыс пен эстетиканы жырлаған көркем шығарма ғана емес,
          сонымен қатар ұрпаққа тәлім-тәрбие беретін рухани мұра.»
        </Text>
        <Text style={styles.quoteAuthor}>— Ғылыми жоба қорытындысынан</Text>
      </View>

      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}>
        <Text style={styles.gradientTitle}>Қорытынды ой</Text>
        <Text style={styles.gradientText}>
          Мағжан Жұмабаевтың «Шолпы» өлеңі арқылы ұлттық құндылықтарды дәріптеу,
          ұрпақ санасына сұлулық пен әдептіліктің маңыздылығын жеткізу
          еліміздің болашақ ұрпағына зор үлес қосатыны сөзсіз.
        </Text>
        <View style={styles.gradientFooter}>
          <IconSymbol name="sparkles" size={20} color="#FFF" />
          <Text style={styles.gradientFooterText}>SholpyAI ұсынады</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// Стили для основного экрана
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
      fontSize: 32,
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
    introCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    introIcon: {
      marginBottom: 12,
    },
    introText: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.text,
      fontFamily: Fonts.ios?.sans,
      textAlign: 'center',
    },
    tabSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 6,
      borderBottomWidth: 3,
    },
    activeTab: {},
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
  });

// Стили для аспектов
const createAspectsStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    cardExpanded: {
      backgroundColor: theme.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    cardHeaderText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    cardShortDesc: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    expandedContent: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    cardFullDesc: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
    },
  });

// Стили для рекомендаций
const createRecommendationsStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {},
    progressSection: {
      marginBottom: 24,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    progressCount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
    },
    progressBarBg: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    list: {
      gap: 12,
    },
    recItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    recItemCompleted: {
      borderColor: theme.primary + '50',
      backgroundColor: theme.primary + '08',
    },
    recLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      gap: 8,
    },
    recCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    recCheckboxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    recText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: theme.text,
    },
    recTextCompleted: {
      textDecorationLine: 'line-through',
      color: theme.textSecondary,
    },
  });

// Стили для заключения
const createConclusionStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      gap: 24,
    },
    quoteCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    quoteIcon: {
      marginBottom: 12,
    },
    quoteText: {
      fontSize: 18,
      lineHeight: 28,
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
    gradientCard: {
      borderRadius: 24,
      padding: 24,
    },
    gradientTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFF',
      marginBottom: 12,
    },
    gradientText: {
      fontSize: 15,
      lineHeight: 24,
      color: '#FFF',
      opacity: 0.95,
      marginBottom: 20,
    },
    gradientFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    gradientFooterText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FFF',
    },
  });