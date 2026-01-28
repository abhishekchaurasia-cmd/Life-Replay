// MoodOrb Component - Central mood selector
// Beautiful animated orb for mood selection with glow effects

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { Mood } from '../storyEngine/generateStory';

interface MoodOrbProps {
    selectedMood: Mood | null;
    onMoodSelect: (mood: Mood) => void;
}

const MOODS: { mood: Mood; emoji: string; label: string }[] = [
    { mood: 'happy', emoji: '😊', label: 'Happy' },
    { mood: 'calm', emoji: '😌', label: 'Calm' },
    { mood: 'tired', emoji: '😴', label: 'Tired' },
    { mood: 'anxious', emoji: '😰', label: 'Anxious' },
    { mood: 'focused', emoji: '🎯', label: 'Focused' },
    { mood: 'excited', emoji: '✨', label: 'Excited' },
    { mood: 'neutral', emoji: '😐', label: 'Neutral' },
    { mood: 'sad', emoji: '😔', label: 'Sad' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MoodOrb({ selectedMood, onMoodSelect }: MoodOrbProps) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (selectedMood) {
            glowOpacity.value = withSpring(0.5);
        } else {
            glowOpacity.value = withTiming(0.3);
        }
    }, [selectedMood]);

    const handleMoodPress = async (mood: Mood) => {
        // Haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onMoodSelect(mood);
    };

    const getOrbColor = () => {
        if (!selectedMood) return colors.accent;
        return colors.moods[selectedMood];
    };

    const animatedOrbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* Main Orb Display */}
            <View style={styles.orbContainer}>
                <Animated.View
                    style={[
                        styles.orbGlow,
                        { backgroundColor: getOrbColor() },
                        animatedGlowStyle
                    ]}
                />
                <Animated.View
                    style={[
                        styles.orb,
                        { borderColor: getOrbColor() },
                        animatedOrbStyle
                    ]}
                >
                    <Text style={styles.orbEmoji}>
                        {selectedMood ? MOODS.find(m => m.mood === selectedMood)?.emoji : '🌙'}
                    </Text>
                    <Text style={styles.orbLabel}>
                        {selectedMood ? MOODS.find(m => m.mood === selectedMood)?.label : 'Tap to select'}
                    </Text>
                </Animated.View>
            </View>

            {/* Mood Selection Grid */}
            <View style={styles.moodGrid}>
                {MOODS.map((item) => (
                    <MoodButton
                        key={item.mood}
                        {...item}
                        isSelected={selectedMood === item.mood}
                        onPress={() => handleMoodPress(item.mood)}
                    />
                ))}
            </View>
        </View>
    );
}

interface MoodButtonProps {
    mood: Mood;
    emoji: string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

function MoodButton({ mood, emoji, label, isSelected, onPress }: MoodButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.moodButton,
                isSelected && {
                    backgroundColor: colors.moods[mood] + '30',
                    borderColor: colors.moods[mood],
                },
                animatedStyle,
            ]}
        >
            <Text style={styles.moodEmoji}>{emoji}</Text>
            <Text style={[
                styles.moodLabel,
                isSelected && { color: colors.moods[mood] }
            ]}>
                {label}
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.xl,
    },
    orbContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 180,
        height: 180,
    },
    orbGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        // Blur effect for glow
    },
    orb: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.surface,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    orbEmoji: {
        fontSize: 48,
    },
    orbLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    moodButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.glass.border,
        minWidth: 80,
        gap: spacing.xs,
    },
    moodEmoji: {
        fontSize: 24,
    },
    moodLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
