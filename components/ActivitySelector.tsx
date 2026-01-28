// Activity Selector Component
// Quick activity tag selection with beautiful animations

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { ACTIVITIES, ActivityId } from '../storage/moodStorage';

interface ActivitySelectorProps {
    selectedActivities: ActivityId[];
    onToggleActivity: (activity: ActivityId) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActivityTag({
    activity,
    isSelected,
    onPress,
}: {
    activity: typeof ACTIVITIES[number];
    isSelected: boolean;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.92);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.tag,
                isSelected && styles.tagSelected,
                animatedStyle,
            ]}
        >
            <Text style={styles.tagEmoji}>{activity.emoji}</Text>
            <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
                {activity.label}
            </Text>
        </AnimatedPressable>
    );
}

export default function ActivitySelector({
    selectedActivities,
    onToggleActivity,
}: ActivitySelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>What did you do?</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {ACTIVITIES.map((activity) => (
                    <ActivityTag
                        key={activity.id}
                        activity={activity}
                        isSelected={selectedActivities.includes(activity.id)}
                        onPress={() => onToggleActivity(activity.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    scrollContent: {
        paddingRight: spacing.lg,
        gap: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.glass.border,
        gap: spacing.xs,
    },
    tagSelected: {
        backgroundColor: colors.accentSoft,
        borderColor: colors.accent,
    },
    tagEmoji: {
        fontSize: 16,
    },
    tagLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    tagLabelSelected: {
        color: colors.accent,
    },
});
