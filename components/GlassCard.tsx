// GlassCard Component - Glassmorphism card wrapper
// Creates the signature "Soft Cyber Memory" blurred glass effect

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../theme/colors';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gradient?: string[];
    intensity?: 'light' | 'normal' | 'strong';
}

export default function GlassCard({
    children,
    style,
    gradient,
    intensity = 'normal'
}: GlassCardProps) {
    const opacityMap = {
        light: 0.5,
        normal: 0.7,
        strong: 0.85,
    };

    const backgroundOpacity = opacityMap[intensity];

    if (gradient) {
        return (
            <LinearGradient
                colors={gradient as [string, string, ...string[]]}
                style={[styles.card, style]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glassOverlay}>
                    {children}
                </View>
            </LinearGradient>
        );
    }

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: `rgba(26, 26, 31, ${backgroundOpacity})` },
                style
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    glassOverlay: {
        flex: 1,
    },
});
