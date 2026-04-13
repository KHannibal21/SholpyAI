// app/(tabs)/poet.tsx
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
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

const { width } = Dimensions.get('window');

// Типы для разделов
type TabType = 'bio' | 'works' | 'timeline';

interface TabItem {
  id: TabType;
  title: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
}

const tabs: TabItem[] = [
  { id: 'bio', title: 'Өмірбаяны', icon: 'person.fill' },
  { id: 'works', title: 'Шығармалары', icon: 'sparkles' },
  { id: 'timeline', title: 'Хронология', icon: 'chevron.right' },
];

// Данные для биографии с возможностью раскрытия
interface BioItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  color: string;
}

const bioItems: BioItem[] = [
  {
    id: '1',
    title: 'Туған жері',
    shortDescription: 'Сасықкөл жағасы, Солтүстік Қазақстан',
    fullDescription: 'Мағжан Жұмабаев 1893 жылы 25 маусымда Солтүстік Қазақстан облысы, қазіргі Мағжан Жұмабаев ауданы, Сасықкөл жағасында дүниеге келген. Әкесі Бекен — ауқатты, сауатты адам болған.',
    icon: 'house.fill',
    color: '#1E3A8A',
  },
  {
    id: '2',
    title: 'Білімі',
    shortDescription: '«Ғалия» медресесі, Мәскеу әдеби институты',
    fullDescription: '1905-1910 жылдары Қызылжардағы медреседе, 1911-1913 жылдары Уфадағы «Ғалия» медресесінде оқыды. 1923-1926 жылдары Мәскеудегі В.Я. Брюсов атындағы жоғары әдеби-көркем институтын бітірді.',
    icon: 'book.fill',
    color: '#2E7D32',
  },
  {
    id: '3',
    title: 'Ұлттық қызметі',
    shortDescription: '«Алаш» партиясының белсенді мүшесі',
    fullDescription: '1917 жылы «Алаш» партиясының құрылтайына қатысып, Алашорда үкіметінің мүшесі болды. Қазақтың тәуелсіздігі жолында белсенді күресті.',
    icon: 'flag.fill',
    color: '#B68B40',
  },
  {
    id: '4',
    title: 'Шығармашылық жолы',
    shortDescription: 'Алғашқы өлеңдері 14 жасында жарияланды',
    fullDescription: '1912 жылы «Шолпан» жинағы жарық көрді. Кейін «Толқын», «Шолпы», «Батыр Баян» сияқты әйгілі шығармаларын жазды. Қазақ поэзиясына символизм мен жаңашыл бағыттар әкелді.',
    icon: 'pencil.fill',
    color: '#D4AF37',
  },
  {
    id: '5',
    title: 'Қайғылы тағдыры',
    shortDescription: '1937 жылы тұтқындалып, 1938 жылы атылды',
    fullDescription: '1937 жылы 30 желтоқсанда «халық жауы» ретінде тұтқындалып, 1938 жылы 19 наурызда ату жазасына кесілді. 1960 жылы ақталды. Тек 1990 жылдары шығармалары толық жарияланды.',
    icon: 'heart.fill',
    color: '#DC2626',
  },
];

// Данные для временной шкалы
interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

const timelineEvents: TimelineEvent[] = [
  { year: '1893', title: 'Дүниеге келді', description: '25 маусымда Сасықкөл жағасында туылды' },
  { year: '1912', title: 'Алғашқы жинақ', description: '«Шолпан» өлеңдер жинағы жарық көрді' },
  { year: '1917', title: 'Алаш қозғалысы', description: 'Алаш партиясының құрылтайына қатысты' },
  { year: '1923', title: 'Мәскеу', description: 'Жоғары әдеби-көркем институтына оқуға түсті' },
  { year: '1927', title: 'Қуғындалу', description: 'Саяси қысым күшейіп, шығармаларына тыйым салынды' },
  { year: '1938', title: 'Қайтыс болды', description: '19 наурызда ату жазасына кесілді' },
  { year: '1960', title: 'Ақталды', description: 'КСРО Жоғарғы соты ақтады' },
];

// Данные о произведениях
interface Work {
  title: string;
  type: string;
  year: string;
  description: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
}

const works: Work[] = [
  {
    title: 'Шолпан',
    type: 'Өлеңдер жинағы',
    year: '1912',
    description: 'Тұңғыш жинағы, ұлттық рух пен махаббат лирикасы',
    icon: 'sparkles',
  },
  {
    title: 'Шолпы',
    type: 'Өлең',
    year: '1922',
    description: 'Қазақ қызының сұлулығы мен әдептілігін жырлайтын әйгілі туынды',
    icon: 'sparkles',
  },
  {
    title: 'Батыр Баян',
    type: 'Поэма',
    year: '1923',
    description: 'Қазақ батыры Баянның ерлігі туралы тарихи поэма',
    icon: 'shield.fill',
  },
  {
    title: 'Қарлығаш',
    type: 'Әңгіме',
    year: '1927',
    description: 'Нәзік махаббат хикаясы, адамның ішкі дүниесін суреттейді',
    icon: 'heart.fill',
  },
  {
    title: 'Мен жастарға сенемін',
    type: 'Өлең',
    year: '1920',
    description: 'Жастарға арналған оптимистік үндеу, ұлт болашағына сенім',
    icon: 'person.fill',
  },
  {
    title: 'Толқын',
    type: 'Өлеңдер жинағы',
    year: '1912',
    description: 'Алғашқы жинақтардың бірі, романтикалық сарын басым',
    icon: 'water.fill',
  },
];

export default function PoetScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createStyles(theme);

  // Состояния
  const [activeTab, setActiveTab] = useState<TabType>('bio');
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

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

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Анимация затухания контента
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

  const toggleBioExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedBioId(expandedBioId === id ? null : id);
  };

  const handleWorkPress = (work: Work) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWork(selectedWork?.title === work.title ? null : work);
  };

  // Знаменитая цитата
  const quote = `"Арыстандай айбатты,
Жолбарыстай қайратты,
Қырандай күшті қанатты —
Мен жастарға сенемін!"`;

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
          <Text style={styles.headerTitle}>Мағжан Жұмабаев</Text>
          <Text style={styles.headerSubtitle}>1893–1938</Text>
        </Animated.View>

        {/* Портретная карточка */}
        <Animated.View
          style={[
            styles.portraitCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: Animated.add(0.95, Animated.multiply(fadeAnim, 0.05)) }],
            },
          ]}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.portraitGradient}>
            <View style={styles.portraitPlaceholder}>
              <IconSymbol name="person.fill" size={60} color="#FFFFFF" />
            </View>
            <View style={styles.portraitTextContainer}>
              <Text style={styles.portraitName}>Рухы биік тұлға</Text>
              <Text style={styles.portraitDescription}>
                Қазақтың ұлы ақыны, ұлт жанашыры, рухани күрескер
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Цитата */}
        <Animated.View
          style={[
            styles.quoteCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.quoteContent}>
            <IconSymbol name="sparkles" size={20} color={theme.accent} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>{quote}</Text>
            <Text style={styles.quoteAuthor}>— «Мен жастарға сенемін»</Text>
          </View>
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

        {/* Контент в зависимости от активной вкладки */}
        <Animated.View style={{ opacity: contentFadeAnim }}>
          {activeTab === 'bio' && (
            <BiographySection 
              theme={theme} 
              bioItems={bioItems}
              expandedId={expandedBioId}
              onToggle={toggleBioExpand}
            />
          )}
          {activeTab === 'works' && (
            <WorksSection 
              theme={theme} 
              works={works}
              selectedWork={selectedWork}
              onWorkPress={handleWorkPress}
            />
          )}
          {activeTab === 'timeline' && (
            <TimelineSection 
              theme={theme} 
              events={timelineEvents}
            />
          )}
        </Animated.View>

        {/* Отступ снизу */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Компонент секции "Өмірбаяны"
function BiographySection({ 
  theme, 
  bioItems, 
  expandedId, 
  onToggle 
}: { 
  theme: typeof Colors.light; 
  bioItems: BioItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const styles = createBioStyles(theme);
  
  return (
    <View style={styles.container}>
      {bioItems.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, isExpanded && styles.cardExpanded]}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: item.color + '15' }]}>
                <IconSymbol name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardShortDesc}>{item.shortDescription}</Text>
              </View>
              <IconSymbol 
                name={isExpanded ? 'chevron.up' : 'chevron.down'} 
                size={20} 
                color={theme.icon} 
              />
            </View>
            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.cardFullDesc}>{item.fullDescription}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      
      <View style={styles.legacyBox}>
        <LinearGradient
          colors={[theme.surface, theme.background]}
          style={styles.legacyGradient}>
          <Text style={styles.legacyTitle}>Мұрасы</Text>
          <Text style={styles.legacyText}>
            Мағжан Жұмабаевтың есімі мен шығармалары тәуелсіздік алғаннан кейін
            қайта жаңғырды. Бүгінде оның өлеңдері ұлттың рухани қазынасына айналып,
            жас ұрпаққа тәлім-тәрбие берудің үлгісі болып отыр.
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

// Компонент секции "Шығармалары"
function WorksSection({ 
  theme, 
  works, 
  selectedWork, 
  onWorkPress 
}: { 
  theme: typeof Colors.light; 
  works: Work[];
  selectedWork: Work | null;
  onWorkPress: (work: Work) => void;
}) {
  const styles = createWorksStyles(theme);
  
  const themes = [
    {
      title: 'Ұлттық тәуелсіздік пен еркіндік',
      description: '«Мен жастарға сенемін» өлеңі арқылы ұлттық сананы оятуға, азаттыққа шақырады.',
      color: '#1E3A8A',
      icon: 'flag.fill',
    },
    {
      title: 'Туған жерге деген махаббат',
      description: 'Қазақ даласының кеңдігі мен сұлулығын, туған жерге деген ыстық сезімін жырлайды.',
      color: '#2E7D32',
      icon: 'house.fill',
    },
    {
      title: 'Адамның рухани болмысы',
      description: 'Ізгілік, адамгершілік, әділдік сияқты құндылықтарды дәріптейді.',
      color: '#B68B40',
      icon: 'heart.fill',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Негізгі тақырыптары</Text>
      {themes.map((item, index) => (
        <View key={index} style={[styles.themeCard, { borderLeftColor: item.color }]}>
          <View style={styles.themeHeader}>
            <IconSymbol name={item.icon} size={20} color={item.color} />
            <Text style={styles.themeTitle}>{item.title}</Text>
          </View>
          <Text style={styles.themeDescription}>{item.description}</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Таңдамалы шығармалары</Text>
      <View style={styles.worksGrid}>
        {works.map((work, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.workItem,
              selectedWork?.title === work.title && styles.workItemSelected,
            ]}
            onPress={() => onWorkPress(work)}
            activeOpacity={0.7}>
            <View style={styles.workHeader}>
              <View style={styles.workTitleRow}>
                <IconSymbol name={work.icon} size={18} color={theme.primary} />
                <Text style={styles.workTitle}>{work.title}</Text>
              </View>
              <View style={[styles.workTypeBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.workTypeText, { color: theme.primary }]}>{work.type}</Text>
              </View>
            </View>
            <Text style={styles.workYear}>{work.year}</Text>
            {selectedWork?.title === work.title && (
              <Text style={styles.workDescription}>{work.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.innovationBox}>
        <Text style={styles.innovationTitle}>Әдебиеттегі жаңашылдығы</Text>
        <Text style={styles.innovationText}>
          Мағжан қазақ поэзиясына символизм мен модернизм ағымдарын енгізіп,
          ұлттық мәдениетті батыстық өркениетпен ұштастыра білді. Оның шығармалары —
          мәңгілік рухани мұра.
        </Text>
      </View>
    </View>
  );
}

// Компонент секции "Хронология"
function TimelineSection({ 
  theme, 
  events 
}: { 
  theme: typeof Colors.light; 
  events: TimelineEvent[];
}) {
  const styles = createTimelineStyles(theme);
  
  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timelineYear}>{event.year}</Text>
            {index < events.length - 1 && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{event.title}</Text>
            <Text style={styles.timelineDescription}>{event.description}</Text>
          </View>
        </View>
      ))}
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
      fontSize: 18,
      color: theme.textSecondary,
      fontFamily: Fonts.ios?.sans,
    },
    portraitCard: {
      borderRadius: 24,
      marginBottom: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    portraitGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    portraitPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    portraitTextContainer: {
      flex: 1,
    },
    portraitName: {
      fontSize: 22,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 6,
    },
    portraitDescription: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 20,
    },
    quoteCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    quoteContent: {
      alignItems: 'center',
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
    activeTab: {
      // borderBottomColor задаётся динамически
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
  });

// Стили для секции биографии
const createBioStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    cardExpanded: {
      backgroundColor: theme.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
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
    legacyBox: {
      marginTop: 20,
      borderRadius: 20,
      overflow: 'hidden',
    },
    legacyGradient: {
      padding: 20,
      borderRadius: 20,
    },
    legacyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    legacyText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
    },
  });

// Стили для секции произведений
const createWorksStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    themeCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      marginBottom: 8,
    },
    themeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    themeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    themeDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSecondary,
    },
    worksGrid: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
    },
    workItem: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 12,
    },
    workItemSelected: {
      backgroundColor: theme.primary + '08',
      marginHorizontal: -8,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    workHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    workTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    workTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    workTypeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    workTypeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    workYear: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 26,
    },
    workDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 8,
      marginLeft: 26,
      lineHeight: 18,
    },
    innovationBox: {
      marginTop: 20,
      backgroundColor: theme.primary + '08',
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.primary + '30',
    },
    innovationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 8,
    },
    innovationText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
    },
  });

// Стили для временной шкалы
const createTimelineStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    timelineLeft: {
      width: 70,
      alignItems: 'center',
      position: 'relative',
    },
    timelineYear: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      backgroundColor: theme.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      overflow: 'hidden',
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.border,
      marginTop: 8,
      minHeight: 30,
    },
    timelineContent: {
      flex: 1,
      marginLeft: 16,
      backgroundColor: theme.surface,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timelineTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    timelineDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });