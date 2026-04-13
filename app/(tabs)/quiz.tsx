// app/(tabs)/quiz.tsx
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
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
import { generateQuizQuestions, QuizQuestion } from '@/services/gemini';

export default function QuizScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = createStyles(theme);

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quotaError, setQuotaError] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const quotaAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadQuestions();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [isLoading, currentIndex]);

    useEffect(() => {
        const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
        Animated.timing(progressAnim, { toValue: progress, duration: 300, useNativeDriver: false }).start();
    }, [currentIndex, questions.length]);

    useEffect(() => {
        if (quotaError) {
            Animated.timing(quotaAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            const timer = setTimeout(() => {
                Animated.timing(quotaAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setQuotaError(false));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [quotaError]);

    const loadQuestions = async (generateNew = false) => {
        try {
            setIsLoading(true);
            setError(null);
            setQuotaError(false);
            const generated = await generateQuizQuestions(10); // 10 вопросов
            if (generated.length > 0) {
                setQuestions(generated);
            } else {
                setError('Сұрақтарды жүктеу мүмкін болмады.');
            }
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('QUOTA_EXCEEDED') || e.message?.includes('429')) {
                setQuotaError(true);
                setQuestions(getFallbackQuestions());
            } else {
                setError('Қате орын алды. Интернет байланысын тексеріңіз.');
            }
        } finally {
            setIsLoading(false);
            setIsGenerating(false);
        }
    };

    const handleGenerateNew = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsGenerating(true);
        setCurrentIndex(0);
        setSelectedIndex(null);
        setIsAnswered(false);
        setScore(0);
        setCompleted(false);
        await loadQuestions(true);
    };

    const handleOptionPress = (idx: number) => {
        if (isAnswered || questions.length === 0) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIndex(idx);
        setIsAnswered(true);
        const correct = idx === questions[currentIndex].correctOptionIndex;
        if (correct) {
            setScore(prev => prev + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedIndex(null);
            setIsAnswered(false);
        } else {
            setCompleted(true);
        }
    };

    const handleRestart = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCurrentIndex(0);
        setSelectedIndex(null);
        setIsAnswered(false);
        setScore(0);
        setCompleted(false);
    };

    const getResultInfo = () => {
        const total = questions.length;
        const percent = (score / total) * 100;
        let message = '', color = theme.primary, icon: any = 'sparkles';
        if (percent >= 90) { message = 'Керемет!'; color = '#16A34A'; icon = 'sparkles'; }
        else if (percent >= 70) { message = 'Жақсы!'; color = '#2563EB'; icon = 'heart.fill'; }
        else if (percent >= 50) { message = 'Орташа.'; color = '#D97706'; icon = 'questionmark.circle.fill'; }
        else { message = 'Әлі де үйрену керек.'; color = '#DC2626'; icon = 'person.fill'; }
        return { message, color, icon, percent };
    };

    const getFallbackQuestions = (): QuizQuestion[] => [
        { id: 1, question: '«Шолпы» кімнің өлеңі?', options: ['Абай', 'Мағжан', 'Мұқағали', 'Сәкен'], correctOptionIndex: 1, explanation: 'Мағжан Жұмабаев жазған.' },
        { id: 2, question: 'Шолпы нені білдіреді?', options: ['Байлық', 'Пәктік пен әдеп', 'Күш', 'Билік'], correctOptionIndex: 1, explanation: 'Қыз баланың әдептілігі мен тазалығы.' },
        { id: 3, question: 'Мағжан қай жылы туған?', options: ['1889', '1893', '1900', '1905'], correctOptionIndex: 1, explanation: '1893 жылы дүниеге келген.' },
        { id: 4, question: 'Өлеңде шолпы несімен ерекшеленеді?', options: ['Салмағы', 'Сыңғыры', 'Түсі', 'Пішіні'], correctOptionIndex: 1, explanation: 'Сыңғырлаған дыбысы.' },
        { id: 5, question: 'Мағжан қай партияның мүшесі?', options: ['Алаш', 'Большевик', 'Кадет', 'Эсер'], correctOptionIndex: 0, explanation: 'Алаш партиясының белсенді мүшесі.' },
        { id: 6, question: '«Шолпы» өлеңі қай жылы жазылған?', options: ['1912', '1922', '1930', '1940'], correctOptionIndex: 1, explanation: '1922 жылы жазылған.' },
        { id: 7, question: 'Шолпы қандай материалдан жасалады?', options: ['Алтын', 'Күміс', 'Қола', 'Темір'], correctOptionIndex: 1, explanation: 'Негізінен күмістен жасалады.' },
        { id: 8, question: 'Мағжанның «Шолпы» өлеңі қандай лирикаға жатады?', options: ['Махаббат', 'Табиғат', 'Сыршыл', 'Философиялық'], correctOptionIndex: 2, explanation: 'Сыршыл лирика.' },
        { id: 9, question: 'Шолпы дыбысы нені еске салады?', options: ['Жел', 'Бұлақ', 'Құс', 'Жаңбыр'], correctOptionIndex: 1, explanation: 'Сылдырлап аққан бұлақты.' },
        { id: 10, question: 'Мағжан Жұмабаев қайда оқыған?', options: ['Уфа', 'Орынбор', 'Семей', 'Ташкент'], correctOptionIndex: 0, explanation: 'Уфадағы «Ғалия» медресесінде оқыған.' },
    ];

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.loadingText}>
                        {isGenerating ? 'Жасанды интеллект сұрақтарды дайындауда...' : 'Жүктелуде...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && questions.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={48} color={theme.error || '#DC2626'} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={() => loadQuestions()}>
                        <Text style={styles.retryButtonText}>Қайталау</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (completed) {
        const info = getResultInfo();
        return (
            <SafeAreaView style={styles.safeArea}>
                {quotaError && (
                    <Animated.View style={[styles.quotaBanner, { opacity: quotaAnim, transform: [{ translateY: quotaAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#D97706" />
                        <Text style={styles.quotaBannerText}>Квота шектен асты. 1 минут күтіңіз.</Text>
                    </Animated.View>
                )}
                <ScrollView contentContainerStyle={styles.resultContainer}>
                    <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
                        <IconSymbol name={info.icon} size={64} color={info.color} />
                        <Text style={styles.resultScore}>{score} / {questions.length}</Text>
                        <Text style={[styles.resultMessage, { color: info.color }]}>{info.message}</Text>
                        <View style={styles.resultStats}>
                            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                                <Text style={styles.statValue}>{info.percent.toFixed(0)}%</Text>
                                <Text style={styles.statLabel}>Дұрыс</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                                <Text style={styles.statValue}>{questions.length - score}</Text>
                                <Text style={styles.statLabel}>Қате</Text>
                            </View>
                        </View>
                        <View style={styles.resultActions}>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={handleRestart}>
                                <IconSymbol name="arrow.counterclockwise" size={20} color="#FFF" />
                                <Text style={styles.actionButtonText}>Қайта тапсыру</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.secondary }]} onPress={handleGenerateNew}>
                                <IconSymbol name="sparkles" size={20} color="#FFF" />
                                <Text style={styles.actionButtonText}>Жаңа сұрақтар</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const q = questions[currentIndex];

    return (
        <SafeAreaView style={styles.safeArea}>
            {quotaError && (
                <Animated.View style={[styles.quotaBanner, { opacity: quotaAnim, transform: [{ translateY: quotaAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#D97706" />
                    <Text style={styles.quotaBannerText}>Квота шектен асты. 1 минут күтіңіз.</Text>
                </Animated.View>
            )}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressText}>{currentIndex + 1} / {questions.length}</Text>
                        <Text style={styles.scoreText}>Ұпай: {score}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                        <Animated.View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                    </View>
                </View>

                <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.questionText}>{q.question}</Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctOptionIndex;
                        const isSelected = idx === selectedIndex;
                        let styleArr: any[] = [styles.optionBase];
                        let textStyle: any[] = [styles.optionText];
                        let showIcon = false;
                        let iconName: any = 'chevron.right';
                        let iconColor = theme.icon;

                        if (isAnswered) {
                            if (isCorrect) {
                                styleArr.push({ backgroundColor: '#16A34A20', borderColor: '#16A34A' });
                                textStyle.push({ color: '#16A34A' });
                                showIcon = true;
                                iconName = 'checkmark.circle.fill';
                                iconColor = '#16A34A';
                            } else if (isSelected && !isCorrect) {
                                styleArr.push({ backgroundColor: '#DC262620', borderColor: '#DC2626' });
                                textStyle.push({ color: '#DC2626' });
                                showIcon = true;
                                iconName = 'xmark.circle.fill';
                                iconColor = '#DC2626';
                            }
                        } else if (isSelected) {
                            styleArr.push({ borderColor: theme.primary, borderWidth: 2 });
                        }

                        return (
                            <TouchableOpacity key={idx} style={styleArr} onPress={() => handleOptionPress(idx)} disabled={isAnswered} activeOpacity={0.7}>
                                <Text style={textStyle}>{opt}</Text>
                                {showIcon && <IconSymbol name={iconName} size={20} color={iconColor} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {isAnswered && q.explanation && (
                    <Animated.View style={[styles.explanationCard, { opacity: fadeAnim, backgroundColor: selectedIndex === q.correctOptionIndex ? '#16A34A10' : '#DC262610', borderLeftColor: selectedIndex === q.correctOptionIndex ? '#16A34A' : '#DC2626' }]}>
                        <IconSymbol name="lightbulb.fill" size={20} color={selectedIndex === q.correctOptionIndex ? '#16A34A' : '#DC2626'} style={styles.explanationIcon} />
                        <Text style={styles.explanationText}>{q.explanation}</Text>
                    </Animated.View>
                )}

                {isAnswered && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.primary }]} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>{currentIndex < questions.length - 1 ? 'Келесі' : 'Нәтиже'}</Text>
                            <IconSymbol name="chevron.right" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.background },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
        loadingText: { fontSize: 18, fontWeight: '600', color: theme.text, marginTop: 20, textAlign: 'center' },
        errorText: { fontSize: 16, color: theme.text, textAlign: 'center', marginVertical: 20 },
        retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 },
        retryButtonText: { color: '#FFF', fontWeight: '600' },
        contentContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 },
        progressContainer: { marginBottom: 24 },
        progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
        progressText: { fontSize: 16, fontWeight: '600', color: theme.textSecondary },
        scoreText: { fontSize: 16, fontWeight: '600', color: theme.primary },
        progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
        progressBarFill: { height: '100%' },
        questionCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 24, marginBottom: 24, elevation: 2 },
        questionText: { fontSize: 20, fontWeight: '600', fontFamily: Fonts.ios?.rounded, color: theme.text, lineHeight: 30 },
        optionsContainer: { gap: 12, marginBottom: 20 },
        optionBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 18, borderWidth: 1.5, borderColor: theme.border, backgroundColor: theme.surface },
        optionText: { fontSize: 16, lineHeight: 24, color: theme.text, flex: 1 },
        explanationCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderLeftWidth: 4, marginBottom: 24 },
        explanationIcon: { marginRight: 10, marginTop: 2 },
        explanationText: { flex: 1, fontSize: 14, lineHeight: 22, color: theme.textSecondary },
        nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 40, gap: 8 },
        nextButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
        resultContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
        resultScore: { fontSize: 56, fontWeight: 'bold', color: theme.text, marginTop: 20, marginBottom: 12 },
        resultMessage: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 32 },
        resultStats: { flexDirection: 'row', gap: 16, marginBottom: 40 },
        statCard: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20, alignItems: 'center', minWidth: 120 },
        statValue: { fontSize: 28, fontWeight: 'bold', color: theme.text },
        statLabel: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
        resultActions: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' },
        actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 40, gap: 8, flex: 1 },
        actionButtonText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
        quotaBanner: {
            position: 'absolute',
            top: 0,
            left: 20,
            right: 20,
            backgroundColor: '#FEF3C7',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 30,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            zIndex: 100,
            marginTop: 8,
            borderWidth: 1,
            borderColor: '#FDE68A',
        },
        quotaBannerText: { fontSize: 14, fontWeight: '500', color: '#92400E', textAlign: 'center' },
    });