// Energy Slider Component
// Beautiful 1-5 energy level selector with animated orbs

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface EnergySliderProps {
    value: number | undefined;
    onChange: (value: number) => void;
}

const ENERGY_LEVELS = [
    { level: 1, emoji: '😴', label: 'Drained' },
    { level: 2, emoji: '😔', label: 'Low' },
    { level: 3, emoji: '😐', label: 'Okay' },
    { level: 4, emoji: '😊', label: 'Good' },
    { level: 5, emoji: '⚡', label: 'Energized' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function EnergyOrb({
    level,
    emoji,
    label,
    isSelected,
    onPress,
}: {
    level: number;
    emoji: string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.85);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Color based on energy level
    const getColor = () => {
        const colorMap: Record<number, string> = {
            1: '#FF6B6B',  // Red
            2: '#FFB347',  // Orange
            3: '#FFE066',  // Yellow
            4: '#6BCB77',  // Green
            5: '#4ECDC4',  // Teal
        };
        return colorMap[level];
    };

    return (
        <View style={styles.orbWrapper}>
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.orb,
                    isSelected && {
                        backgroundColor: getColor() + '30',
                        borderColor: getColor(),
                    },
                    animatedStyle,
                ]}
            >
                <Text style={styles.orbEmoji}>{emoji}</Text>
            </AnimatedPressable>
            <Text style={[
                styles.orbLabel,
                isSelected && { color: getColor() }
            ]}>
                {label}
            </Text>
        </View>
    );
}

export default function EnergySlider({ value, onChange }: EnergySliderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Energy Level</Text>
                {value && (
                    <Text style={styles.selectedValue}>
                        {ENERGY_LEVELS.find(e => e.level === value)?.label}
                    </Text>
                )}
            </View>

            <View style={styles.orbRow}>
                {ENERGY_LEVELS.map((item) => (
                    <EnergyOrb
                        key={item.level}
                        level={item.level}
                        emoji={item.emoji}
                        label={item.label}
                        isSelected={value === item.level}
                        onPress={() => onChange(item.level)}
                    />
                ))}
            </View>

            {/* Progress bar visualization */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: value ? `${(value / 5) * 100}%` : '0%',
                                backgroundColor: value ?
                                    ['#FF6B6B', '#FFB347', '#FFE066', '#6BCB77', '#4ECDC4'][value - 1]
                                    : colors.textMuted,
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    selectedValue: {
        fontSize: typography.sizes.sm,
        color: colors.accent,
        fontWeight: '600',
    },
    orbRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    orbWrapper: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    orb: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surfaceLight,
        borderWidth: 2,
        borderColor: colors.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbEmoji: {
        fontSize: 20,
    },
    orbLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        fontWeight: '500',
    },
    progressContainer: {
        paddingTop: spacing.sm,
    },
    progressTrack: {
        height: 4,
        backgroundColor: colors.surfaceLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
