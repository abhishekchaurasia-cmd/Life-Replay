// StoryCard Component - Story section display
// Shows emotional narrative for each time of day with fade-in animation

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface StoryCardProps {
    timeOfDay: TimeOfDay;
    story: string;
    index: number; // For staggered animation
}

const TIME_CONFIG: Record<TimeOfDay, {
    icon: string;
    label: string;
    gradient: string[];
    accentColor: string;
}> = {
    morning: {
        icon: '🌅',
        label: 'Morning',
        gradient: ['#1a1a2e', '#2d2d44', '#16213e'],
        accentColor: '#FFB347',
    },
    afternoon: {
        icon: '☀️',
        label: 'Afternoon',
        gradient: ['#1a1a2e', '#1f1f3a', '#252540'],
        accentColor: '#87CEEB',
    },
    evening: {
        icon: '🌙',
        label: 'Evening',
        gradient: ['#0d0d0f', '#151520', '#1a1a2e'],
        accentColor: '#B794F4',
    },
};

export default function StoryCard({ timeOfDay, story, index }: StoryCardProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);

    const config = TIME_CONFIG[timeOfDay];

    useEffect(() => {
        const delay = index * 200; // Stagger each card
        opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
        translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <LinearGradient
                colors={config.gradient as [string, string, ...string[]]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Time indicator */}
                <View style={styles.header}>
                    <Text style={styles.icon}>{config.icon}</Text>
                    <Text style={[styles.label, { color: config.accentColor }]}>
                        {config.label}
                    </Text>
                </View>

                {/* Story text */}
                <Text style={styles.story}>{story}</Text>

                {/* Decorative line */}
                <View style={[styles.accentLine, { backgroundColor: config.accentColor }]} />
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    gradient: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    icon: {
        fontSize: 20,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    story: {
        fontSize: typography.sizes.lg,
        color: colors.text,
        lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
        fontStyle: 'italic',
    },
    accentLine: {
        height: 2,
        width: 40,
        borderRadius: 1,
        marginTop: spacing.lg,
        opacity: 0.6,
    },
});
