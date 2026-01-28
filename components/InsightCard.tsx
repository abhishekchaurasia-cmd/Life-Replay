// InsightCard Component - Weekly insight display
// Shows text-based insights with calm, minimal design

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface InsightCardProps {
    insight: string;
    index: number;
    icon?: string;
}

export default function InsightCard({ insight, index, icon = '💡' }: InsightCardProps) {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
        const delay = index * 150;
        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
        translateX.value = withDelay(delay, withTiming(0, { duration: 500 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={styles.text}>{insight}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glass.border,
        gap: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 18,
    },
    text: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.text,
        lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
});
