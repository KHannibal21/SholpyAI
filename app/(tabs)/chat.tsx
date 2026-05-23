// app/(tabs)/chat.tsx
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatWithGemini } from '@/services/gemini';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    fullContent?: string;
    isThinking?: boolean; // явный флаг для индикатора "думает"
}

const WELCOME_MESSAGE = `Сәлеметсіз бе! Мен SholpyAI көмекшісімін. Мағжан Жұмабаевтың «Шолпы» өлеңі, оның тәрбиелік мәні, ұлттық болмысы туралы кез келген сұрағыңызға жауап беремін. Не туралы сұрағыңыз келеді?`;

export default function ChatScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = createStyles(theme);

    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE, timestamp: new Date() },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quotaError, setQuotaError] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const quotaAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentTypingIdRef = useRef<string | null>(null);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        const showSub = Keyboard.addListener('keyboardDidShow', () => scrollToBottom());
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {});
        return () => {
            showSub.remove();
            hideSub.remove();
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (quotaError) {
            Animated.timing(quotaAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            const timer = setTimeout(() => {
                Animated.timing(quotaAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setQuotaError(false));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [quotaError]);

    const scrollToBottom = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const clearTypingInterval = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        currentTypingIdRef.current = null;
    };

    const startTyping = (messageId: string, fullText: string) => {
        // Очищаем предыдущий интервал, если был
        clearTypingInterval();
        
        let currentIndex = 0;
        const charsPerStep = 2;
        const intervalMs = 25;
        currentTypingIdRef.current = messageId;

        typingIntervalRef.current = setInterval(() => {
            setMessages(prev =>
                prev.map(msg => {
                    if (msg.id !== messageId) return msg;
                    const nextIndex = Math.min(currentIndex + charsPerStep, fullText.length);
                    const newContent = fullText.slice(0, nextIndex);
                    currentIndex = nextIndex;
                    const finished = currentIndex >= fullText.length;
                    return {
                        ...msg,
                        content: newContent,
                        isTyping: !finished,
                        fullContent: finished ? undefined : fullText,
                    };
                })
            );

            if (currentIndex >= fullText.length) {
                clearTypingInterval();
            }

            scrollToBottom();
        }, intervalMs);
    };

    const addMessage = (role: 'user' | 'assistant', content: string) => {
        const newMsg: Message = {
            id: Date.now().toString() + Math.random().toString(),
            role,
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMsg]);
        return newMsg;
    };

    const handleSend = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || isLoading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setInputText('');
        Keyboard.dismiss();

        addMessage('user', trimmed);
        scrollToBottom();

        // Индикатор "думает"
        const thinkingId = Date.now().toString() + '-thinking';
        setMessages(prev => [...prev, {
            id: thinkingId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isThinking: true,
        }]);
        scrollToBottom();

        setIsLoading(true);
        setQuotaError(false);

        try {
            const reply = await chatWithGemini(trimmed);
            // Удаляем thinking, создаём сообщение для печати
            const newMsgId = Date.now().toString();
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== thinkingId);
                const newMsg: Message = {
                    id: newMsgId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                    isTyping: true,
                    fullContent: reply,
                };
                return [...filtered, newMsg];
            });
            // Запускаем печать
            startTyping(newMsgId, reply);
        } catch (error: any) {
            setMessages(prev => prev.filter(m => m.id !== thinkingId));
            if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429')) {
                setQuotaError(true);
                addMessage('assistant', 'Кешіріңіз, қазір сұраулар саны шектен асты. 1 минут күте тұрыңыз.');
            } else {
                addMessage('assistant', 'Кешіріңіз, қате орын алды. Интернет байланысын тексеріңіз.');
            }
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const handleClearHistory = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        clearTypingInterval();
        setMessages([{ id: 'welcome-new', role: 'assistant', content: WELCOME_MESSAGE, timestamp: new Date() }]);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        // Индикатор "думает"
        if (item.isThinking) {
            return (
                <Animated.View style={[styles.messageContainer, styles.assistantMessageContainer, { opacity: fadeAnim }]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <IconSymbol name="sparkles" size={16} color="#FFF" />
                        </View>
                    </View>
                    <View style={[styles.messageBubble, styles.assistantBubble, styles.thinkingBubble]}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <Text style={styles.thinkingText}>Ойлануда...</Text>
                    </View>
                </Animated.View>
            );
        }

        const isUser = item.role === 'user';
        const showCursor = item.isTyping && (item.fullContent?.length ?? 0) > item.content.length;

        return (
            <Animated.View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer, { opacity: fadeAnim }]}>
                {!isUser && (
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <IconSymbol name="sparkles" size={16} color="#FFF" />
                        </View>
                    </View>
                )}
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                        {item.content}
                        {showCursor && <Text style={styles.cursor}> ▌</Text>}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>AI Көмекші</Text>
                    <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
                        <IconSymbol name="trash" size={22} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                {quotaError && (
                    <Animated.View style={[styles.quotaBanner, { opacity: quotaAnim, transform: [{ translateY: quotaAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#D97706" />
                        <Text style={styles.quotaBannerText}>Квота шектен асты. 1 минут күтіңіз.</Text>
                    </Animated.View>
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToBottom}
                    onLayout={scrollToBottom}
                />

                <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
                    <TextInput
                        ref={inputRef}
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Сұрағыңызды жазыңыз..."
                        placeholderTextColor={theme.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        editable={!isLoading}
                        onFocus={scrollToBottom}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary }, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        activeOpacity={0.7}>
                        <IconSymbol name="paperplane.fill" size={20} color={!inputText.trim() || isLoading ? theme.icon : '#FFF'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.background },
        container: { flex: 1 },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
        headerTitle: { fontSize: 20, fontWeight: '600', fontFamily: Fonts.ios?.rounded, color: theme.text },
        clearButton: { padding: 8 },
        listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
        messageContainer: { flexDirection: 'row', marginBottom: 16, maxWidth: width * 0.85 },
        userMessageContainer: { alignSelf: 'flex-end' },
        assistantMessageContainer: { alignSelf: 'flex-start' },
        avatarContainer: { marginRight: 8, alignSelf: 'flex-end' },
        avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
        messageBubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '100%' },
        userBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
        assistantBubble: { backgroundColor: theme.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
        thinkingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        thinkingText: { fontSize: 15, color: theme.textSecondary },
        messageText: { fontSize: 15, lineHeight: 22, fontFamily: Fonts.ios?.sans, color: theme.text },
        userMessageText: { color: '#FFFFFF' },
        cursor: { color: theme.primary, fontWeight: 'bold' },
        inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: theme.border },
        input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, fontFamily: Fonts.ios?.sans, backgroundColor: theme.background, borderRadius: 24, borderWidth: 1, borderColor: theme.border, marginRight: 12 },
        sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
        sendButtonDisabled: { backgroundColor: theme.surface },
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