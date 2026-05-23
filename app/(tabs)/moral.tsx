// app/(tabs)/moral.tsx
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
    { id: 'recommendations', title: 'Ұсыныстар', icon: 'lightbulb.fill' },
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

// Простые предложения (без чекбоксов)
const recommendationsList = [
    {
        id: '1',
        icon: 'calendar',
        text: 'Мағжанның өлеңінің мәнін ашатын шығармашылық шаралар ұйымдастыру (поэзиялық кештер, дөңгелек үстелдер).',
    },
    {
        id: '2',
        icon: 'book.fill',
        text: '«Шолпы» өлеңін мектептер мен жоғары оқу орындарында оқыту арқылы жастарды ұлттық тәрбиеге баулу.',
    },
    {
        id: '3',
        icon: 'apps',
        text: 'Ұлттық құндылықтарды дәріптейтін мобильді қосымшалар мен интерактивті құралдар әзірлеу.',
    },
    {
        id: '4',
        icon: 'house.fill',
        text: 'Отбасында қыз балаға ұлттық тәрбие беру, шолпы тағу дәстүрін жаңғырту.',
    },
    {
        id: '5',
        icon: 'network',
        text: 'Әлеуметтік желілерде «Шолпы» челленджін ұйымдастырып, жастардың назарын аудару.',
    },
];

export default function MoralScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = createStyles(theme);

    const [activeTab, setActiveTab] = useState<TabType>('aspects');
    const [expandedAspectId, setExpandedAspectId] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const contentFadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleTabChange = (tab: TabType) => {
        if (tab === activeTab) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(contentFadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(contentFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setActiveTab(tab);
    };

    const toggleAspectExpand = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedAspectId(expandedAspectId === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}>
                
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.headerTitle}>Тәрбиелік мәні</Text>
                    <Text style={styles.headerSubtitle}>«Шолпы» өлеңінің жастарға берер тәлімі</Text>
                </Animated.View>

                <Animated.View style={[styles.introCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <IconSymbol name="sparkles" size={28} color={theme.accent} style={styles.introIcon} />
                    <Text style={styles.introText}>
                        Мағжан Жұмабаевтың «Шолпы» өлеңі — тек көркем шығарма ғана емес,
                        сонымен бірге ұлттық тәрбиенің, әдептілік пен рухани тазалықтың
                        үлгісі. Бұл өлең жас ұрпақты ізгілікке, сұлулықты сезінуге,
                        ұлттық құндылықтарды бағалауға баулиды.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.tabSelector, { opacity: fadeAnim }]}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab, { borderBottomColor: activeTab === tab.id ? theme.primary : 'transparent' }]}
                            onPress={() => handleTabChange(tab.id)}
                            activeOpacity={0.7}>
                            <IconSymbol name={tab.icon} size={18} color={activeTab === tab.id ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.tabText, activeTab === tab.id && { color: theme.primary, fontWeight: '600' }]}>
                                {tab.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                <Animated.View style={{ opacity: contentFadeAnim }}>
                    {activeTab === 'aspects' && (
                        <AspectsSection theme={theme} aspects={moralAspects} expandedId={expandedAspectId} onToggle={toggleAspectExpand} />
                    )}
                    {activeTab === 'recommendations' && <SimpleRecommendationsSection theme={theme} recommendations={recommendationsList} />}
                    {activeTab === 'conclusion' && <ConclusionSection theme={theme} />}
                </Animated.View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function AspectsSection({ theme, aspects, expandedId, onToggle }: any) {
    const styles = createAspectsStyles(theme);
    return (
        <View style={styles.container}>
            {aspects.map((aspect: any) => {
                const isExpanded = expandedId === aspect.id;
                return (
                    <TouchableOpacity key={aspect.id} style={[styles.card, isExpanded && styles.cardExpanded]} onPress={() => onToggle(aspect.id)} activeOpacity={0.7}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIcon, { backgroundColor: aspect.color + '15' }]}>
                                <IconSymbol name={aspect.icon} size={24} color={aspect.color} />
                            </View>
                            <View style={styles.cardHeaderText}>
                                <Text style={styles.cardTitle}>{aspect.title}</Text>
                                <Text style={styles.cardShortDesc}>{aspect.shortDesc}</Text>
                            </View>
                            <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={20} color={theme.icon} />
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

function SimpleRecommendationsSection({ theme, recommendations }: any) {
    const styles = createSimpleRecStyles(theme);
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Ұсыныстар тізімі</Text>
            <View style={styles.list}>
                {recommendations.map((rec: any) => (
                    <View key={rec.id} style={styles.recItem}>
                        <View style={styles.recIconContainer}>
                            <IconSymbol name={rec.icon} size={20} color={theme.primary} />
                        </View>
                        <Text style={styles.recText}>{rec.text}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function ConclusionSection({ theme }: any) {
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

            <LinearGradient colors={[theme.primary, theme.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
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

const createStyles = (theme: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    container: { flex: 1 },
    contentContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: Platform.OS === 'ios' ? '700' : 'bold', fontFamily: Fonts.ios?.rounded, color: theme.text, marginBottom: 4 },
    headerSubtitle: { fontSize: 16, color: theme.textSecondary, fontFamily: Fonts.ios?.sans },
    introCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 20, marginBottom: 24, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    introIcon: { marginBottom: 12 },
    introText: { fontSize: 15, lineHeight: 24, color: theme.text, fontFamily: Fonts.ios?.sans, textAlign: 'center' },
    tabSelector: { flexDirection: 'row', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6, borderBottomWidth: 3 },
    activeTab: {},
    tabText: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
});

const createAspectsStyles = (theme: any) => StyleSheet.create({
    container: { gap: 12 },
    card: { backgroundColor: theme.surface, borderRadius: 18, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    cardExpanded: { backgroundColor: theme.surface },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    cardHeaderText: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 2 },
    cardShortDesc: { fontSize: 13, color: theme.textSecondary },
    expandedContent: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.border },
    cardFullDesc: { fontSize: 14, lineHeight: 22, color: theme.textSecondary },
});

const createSimpleRecStyles = (theme: any) => StyleSheet.create({
    container: {},
    sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 16 },
    list: { gap: 12 },
    recItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border },
    recIconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    recText: { flex: 1, fontSize: 14, lineHeight: 22, color: theme.text },
});

const createConclusionStyles = (theme: any) => StyleSheet.create({
    container: { gap: 24 },
    quoteCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 24, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
    quoteIcon: { marginBottom: 12 },
    quoteText: { fontSize: 18, lineHeight: 28, fontFamily: Fonts.ios?.serif, color: theme.text, textAlign: 'center', fontStyle: 'italic', marginBottom: 8 },
    quoteAuthor: { fontSize: 14, color: theme.textSecondary, fontFamily: Fonts.ios?.sans },
    gradientCard: { borderRadius: 24, padding: 24 },
    gradientTitle: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 12 },
    gradientText: { fontSize: 15, lineHeight: 24, color: '#FFF', opacity: 0.95, marginBottom: 20 },
    gradientFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
    gradientFooterText: { fontSize: 14, fontWeight: '500', color: '#FFF' },
});