// Journal Note Input Component
// Optional text input for adding personal notes to mood entries

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface JournalNoteProps {
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    maxLength?: number;
}

export default function JournalNote({
    value,
    onChange,
    placeholder = "What's on your mind? (optional)",
    maxLength = 200,
}: JournalNoteProps) {
    const [isFocused, setIsFocused] = useState(false);
    const borderOpacity = useSharedValue(0);
    const scale = useSharedValue(1);

    const handleFocus = () => {
        setIsFocused(true);
        borderOpacity.value = withTiming(1, { duration: 200 });
        scale.value = withSpring(1.01);
    };

    const handleBlur = () => {
        setIsFocused(false);
        borderOpacity.value = withTiming(0, { duration: 200 });
        scale.value = withSpring(1);
    };

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedBorderStyle = useAnimatedStyle(() => ({
        opacity: borderOpacity.value,
    }));

    const characterCount = value.length;
    const isNearLimit = characterCount > maxLength * 0.8;

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>📝 Add a note</Text>

            <Animated.View style={[styles.container, animatedContainerStyle]}>
                {/* Accent border overlay */}
                <Animated.View style={[styles.accentBorder, animatedBorderStyle]} />

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={maxLength}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    textAlignVertical="top"
                />

                {/* Character count */}
                <View style={styles.footer}>
                    <Text style={styles.hint}>
                        {value.length > 0 ? 'Your note will be woven into your story' : 'Press to start writing...'}
                    </Text>
                    <Text style={[
                        styles.charCount,
                        isNearLimit && styles.charCountWarning,
                    ]}>
                        {characterCount}/{maxLength}
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: spacing.md,
    },
    title: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
        overflow: 'hidden',
    },
    accentBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.accent,
    },
    input: {
        padding: spacing.lg,
        paddingBottom: spacing.md,
        fontSize: typography.sizes.md,
        color: colors.text,
        minHeight: 100,
        lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    hint: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    charCount: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
    charCountWarning: {
        color: colors.warning,
    },
});
