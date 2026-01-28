// Insights Screen - Enhanced Weekly Patterns
// Shows mood patterns, streaks, trends, and personalized insights

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    RefreshControl,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    FadeInDown,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../../theme/colors';
import InsightCard from '../../components/InsightCard';
import GlassCard from '../../components/GlassCard';
import storage, {
    WeeklyInsight,
    MoodEntry,
    PatternInsight,
    StreakInfo,
    ACTIVITIES
} from '../../storage/moodStorage';
import { Mood } from '../../storyEngine/generateStory';

// Mood dot component for the week visualization
function MoodDot({ mood, day, index }: { mood?: Mood; day: string; index: number }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        const delay = index * 100;
        scale.value = withDelay(delay, withTiming(1, { duration: 400 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    }, [mood]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const moodColor = mood ? colors.moods[mood] : colors.textMuted;

    return (
        <View style={styles.dotContainer}>
            <Animated.View
                style={[
                    styles.dot,
                    { backgroundColor: moodColor },
                    animatedStyle
                ]}
            />
            <Text style={styles.dayLabel}>{day}</Text>
        </View>
    );
}

// Pattern Card component
function PatternCard({ pattern, index }: { pattern: PatternInsight; index: number }) {
    return (
        <Animated.View
            entering={FadeInDown.delay(300 + index * 100).duration(400)}
            style={styles.patternCard}
        >
            <View style={styles.patternIcon}>
                <Text style={styles.patternEmoji}>{pattern.icon}</Text>
            </View>
            <View style={styles.patternContent}>
                <Text style={styles.patternTitle}>{pattern.title}</Text>
                <Text style={styles.patternDescription}>{pattern.description}</Text>
            </View>
        </Animated.View>
    );
}

// Streak Badge component
function StreakBadge({ streak }: { streak: StreakInfo }) {
    const getColor = () => {
        if (streak.type === 'logging') return colors.warning;
        return colors.success;
    };

    return (
        <View style={[styles.streakBadge, { borderColor: getColor() }]}>
            <Text style={[styles.streakCount, { color: getColor() }]}>
                {streak.count}
            </Text>
            <Text style={styles.streakDescription}>{streak.description}</Text>
        </View>
    );
}

// Activity Stats component
function ActivityStats({ entries }: { entries: MoodEntry[] }) {
    const activityCounts: Record<string, { count: number; positiveRatio: number }> = {};

    entries.forEach(entry => {
        entry.activities?.forEach(act => {
            if (!activityCounts[act]) {
                activityCounts[act] = { count: 0, positiveRatio: 0 };
            }
            activityCounts[act].count++;

            if (['happy', 'calm', 'excited', 'focused'].includes(entry.mood)) {
                activityCounts[act].positiveRatio += 1;
            }
        });
    });

    // Calculate positive ratio
    Object.keys(activityCounts).forEach(act => {
        activityCounts[act].positiveRatio = activityCounts[act].positiveRatio / activityCounts[act].count;
    });

    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    if (sortedActivities.length === 0) return null;

    return (
        <GlassCard style={styles.activityStatsCard}>
            <Text style={styles.statsTitle}>Activity Impact</Text>
            {sortedActivities.map(([actId, data]) => {
                const activity = ACTIVITIES.find(a => a.id === actId);
                if (!activity) return null;

                const positivePercent = Math.round(data.positiveRatio * 100);

                return (
                    <View key={actId} style={styles.activityRow}>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                            <Text style={styles.activityName}>{activity.label}</Text>
                            <Text style={styles.activityCount}>×{data.count}</Text>
                        </View>
                        <View style={styles.progressWrapper}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${positivePercent}%`,
                                            backgroundColor: positivePercent >= 60 ? colors.success : colors.warning,
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressLabel}>
                                {positivePercent}% positive
                            </Text>
                        </View>
                    </View>
                );
            })}
        </GlassCard>
    );
}

// Energy Trend component
function EnergyTrend({ entries }: { entries: MoodEntry[] }) {
    const entriesWithEnergy = entries.filter(e => e.energyLevel !== undefined);
    if (entriesWithEnergy.length < 3) return null;

    const avgEnergy = entriesWithEnergy.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / entriesWithEnergy.length;
    const roundedAvg = Math.round(avgEnergy * 10) / 10;

    // Group by time of day
    const morningEnergy = entriesWithEnergy
        .filter(e => e.timeOfDay === 'morning')
        .reduce((sum, e) => sum + (e.energyLevel || 0), 0) /
        (entriesWithEnergy.filter(e => e.timeOfDay === 'morning').length || 1);

    const eveningEnergy = entriesWithEnergy
        .filter(e => e.timeOfDay === 'evening')
        .reduce((sum, e) => sum + (e.energyLevel || 0), 0) /
        (entriesWithEnergy.filter(e => e.timeOfDay === 'evening').length || 1);

    const getEnergyLabel = (energy: number) => {
        if (energy >= 4) return 'High';
        if (energy >= 3) return 'Moderate';
        if (energy >= 2) return 'Low';
        return 'Very Low';
    };

    const getEnergyColor = (energy: number) => {
        if (energy >= 4) return colors.success;
        if (energy >= 3) return colors.warning;
        return colors.error;
    };

    return (
        <GlassCard style={styles.energyCard}>
            <Text style={styles.statsTitle}>Energy Levels</Text>

            <View style={styles.energyMain}>
                <Text style={styles.energyValue}>{roundedAvg}</Text>
                <Text style={[styles.energyLabel, { color: getEnergyColor(avgEnergy) }]}>
                    {getEnergyLabel(avgEnergy)} Average
                </Text>
            </View>

            <View style={styles.energyComparison}>
                <View style={styles.energyTimeBlock}>
                    <Text style={styles.energyTimeLabel}>Morning</Text>
                    <Text style={[styles.energyTimeValue, { color: getEnergyColor(morningEnergy) }]}>
                        {Math.round(morningEnergy * 10) / 10 || '—'}
                    </Text>
                </View>
                <View style={styles.energyDivider} />
                <View style={styles.energyTimeBlock}>
                    <Text style={styles.energyTimeLabel}>Evening</Text>
                    <Text style={[styles.energyTimeValue, { color: getEnergyColor(eveningEnergy) }]}>
                        {Math.round(eveningEnergy * 10) / 10 || '—'}
                    </Text>
                </View>
            </View>
        </GlassCard>
    );
}

export default function InsightsScreen() {
    const [insights, setInsights] = useState<WeeklyInsight | null>(null);
    const [weekMoods, setWeekMoods] = useState<{ day: string; mood?: Mood }[]>([]);
    const [weekEntries, setWeekEntries] = useState<MoodEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const headerOpacity = useSharedValue(0);

    useEffect(() => {
        loadInsights();
        headerOpacity.value = withTiming(1, { duration: 500 });
    }, []);

    const loadInsights = async () => {
        setIsLoading(true);

        // Get weekly insights
        const weeklyInsights = await storage.calculateWeeklyInsights();
        setInsights(weeklyInsights);

        // Get week's entries
        const entries = await storage.getWeekEntries();
        setWeekEntries(entries);

        // Get week's moods for visualization
        const weekData = generateWeekData(entries);
        setWeekMoods(weekData);

        setIsLoading(false);
    };

    const generateWeekData = (entries: MoodEntry[]): { day: string; mood?: Mood }[] => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const result: { day: string; mood?: Mood }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

            // Find mood for this day (use the last entry of the day)
            const dayEntries = entries.filter(e => e.date === dateStr);
            const lastMood = dayEntries.length > 0 ? dayEntries[dayEntries.length - 1].mood : undefined;

            result.push({ day: dayName, mood: lastMood });
        }

        return result;
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadInsights();
        setRefreshing(false);
    };

    const animatedHeaderStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    const getMoodEmoji = (mood: Mood): string => {
        const emojiMap: Record<Mood, string> = {
            happy: '😊',
            calm: '😌',
            tired: '😴',
            anxious: '😰',
            focused: '🎯',
            excited: '✨',
            neutral: '😐',
        };
        return emojiMap[mood];
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.background} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingEmoji}>📊</Text>
                    <Text style={styles.loadingText}>Analyzing your patterns...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                    />
                }
            >
                {/* Header */}
                <Animated.View style={[styles.header, animatedHeaderStyle]}>
                    <Text style={styles.title}>Insights</Text>
                    <Text style={styles.subtitle}>Your week at a glance</Text>
                </Animated.View>

                {/* Streaks */}
                {insights?.streaks && insights.streaks.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <View style={styles.streaksRow}>
                            {insights.streaks.map((streak, index) => (
                                <StreakBadge key={index} streak={streak} />
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Week Mood Visualization */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <GlassCard style={styles.weekCard}>
                        <Text style={styles.sectionTitle}>This Week</Text>
                        <View style={styles.weekGrid}>
                            {weekMoods.map((item, index) => (
                                <MoodDot
                                    key={item.day}
                                    mood={item.mood}
                                    day={item.day}
                                    index={index}
                                />
                            ))}
                        </View>

                        {/* Dominant mood */}
                        {insights?.dominantMood && (
                            <View style={styles.dominantMood}>
                                <Text style={styles.dominantLabel}>Dominant mood:</Text>
                                <View style={styles.dominantValue}>
                                    <Text style={styles.dominantEmoji}>
                                        {getMoodEmoji(insights.dominantMood)}
                                    </Text>
                                    <Text style={[
                                        styles.dominantText,
                                        { color: colors.moods[insights.dominantMood] }
                                    ]}>
                                        {insights.dominantMood.charAt(0).toUpperCase() + insights.dominantMood.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Patterns */}
                {insights?.patterns && insights.patterns.length > 0 && (
                    <>
                        <Text style={styles.sectionTitleOutside}>Patterns Detected</Text>
                        {insights.patterns.map((pattern, index) => (
                            <PatternCard key={index} pattern={pattern} index={index} />
                        ))}
                    </>
                )}

                {/* Energy Trend */}
                <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                    <EnergyTrend entries={weekEntries} />
                </Animated.View>

                {/* Activity Impact */}
                <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                    <ActivityStats entries={weekEntries} />
                </Animated.View>

                {/* Text Insights */}
                <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                    <View style={styles.insightsSection}>
                        <Text style={styles.sectionTitleOutside}>What We Noticed</Text>

                        {insights?.insights && insights.insights.length > 0 ? (
                            insights.insights.map((insight, index) => (
                                <InsightCard
                                    key={index}
                                    insight={insight}
                                    index={index}
                                    icon={index === 0 ? '🔮' : index === 1 ? '🌙' : '💫'}
                                />
                            ))
                        ) : (
                            <GlassCard>
                                <Text style={styles.emptyText}>
                                    Keep logging your moods to see personalized insights here.
                                </Text>
                            </GlassCard>
                        )}
                    </View>
                </Animated.View>

                {/* Privacy Note */}
                <View style={styles.privacyNote}>
                    <Text style={styles.privacyIcon}>🔒</Text>
                    <Text style={styles.privacyText}>
                        All your data stays on this device. Private and secure.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: 120,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes.display,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    streaksRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
        flexWrap: 'wrap',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        gap: spacing.sm,
    },
    streakCount: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
    },
    streakDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        maxWidth: 120,
    },
    sectionTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    sectionTitleOutside: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    weekCard: {
        marginBottom: spacing.md,
    },
    weekGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    dotContainer: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    dayLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        fontWeight: '500',
    },
    dominantMood: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.glass.border,
    },
    dominantLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    dominantValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dominantEmoji: {
        fontSize: 20,
    },
    dominantText: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
    },
    patternCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glass.border,
        gap: spacing.md,
    },
    patternIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    patternEmoji: {
        fontSize: 24,
    },
    patternContent: {
        flex: 1,
    },
    patternTitle: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    patternDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    },
    energyCard: {
        marginTop: spacing.lg,
    },
    energyMain: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    energyValue: {
        fontSize: 48,
        fontWeight: '700',
        color: colors.text,
    },
    energyLabel: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
    },
    energyComparison: {
        flexDirection: 'row',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.glass.border,
    },
    energyTimeBlock: {
        flex: 1,
        alignItems: 'center',
    },
    energyDivider: {
        width: 1,
        backgroundColor: colors.glass.border,
    },
    energyTimeLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    energyTimeValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
    },
    activityStatsCard: {
        marginTop: spacing.lg,
    },
    statsTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    activityRow: {
        marginBottom: spacing.md,
    },
    activityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    activityEmoji: {
        fontSize: 16,
    },
    activityName: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
    },
    activityCount: {
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
    },
    progressWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        width: 80,
        textAlign: 'right',
    },
    insightsSection: {
        marginTop: spacing.lg,
    },
    emptyText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    privacyNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        marginTop: spacing.lg,
    },
    privacyIcon: {
        fontSize: 16,
    },
    privacyText: {
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    loadingEmoji: {
        fontSize: 48,
    },
    loadingText: {
        fontSize: typography.sizes.lg,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});
