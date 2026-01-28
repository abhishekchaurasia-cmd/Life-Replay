// Replay Screen - Enhanced Daily Story View
// Shows dynamic story incorporating activities, energy, and notes

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
    FadeInDown,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';
import StoryCard from '../../components/StoryCard';
import GlassCard from '../../components/GlassCard';
import {
    generateSimpleStory,
    generateDayStory,
    Mood,
    ActivityId,
} from '../../storyEngine/generateStory';
import storage, {
    getTodayDate,
    saveStory,
    DayStory,
    MoodEntry,
    ACTIVITIES
} from '../../storage/moodStorage';

export default function ReplayScreen() {
    const [story, setStory] = useState<{
        morning: string;
        afternoon: string;
        evening: string;
        summary: string;
    } | null>(null);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);
    const [dayStats, setDayStats] = useState<{
        activitiesCount: number;
        avgEnergy: number;
        hasNotes: boolean;
    } | null>(null);

    const headerOpacity = useSharedValue(0);

    useEffect(() => {
        loadStory();

        // Format date
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        };
        setCurrentDate(today.toLocaleDateString('en-US', options));

        // Animate header
        headerOpacity.value = withTiming(1, { duration: 500 });
    }, []);

    const loadStory = async () => {
        setIsLoading(true);

        // Get today's mood entries
        const entries = await storage.getTodayMoods();
        setTodayEntries(entries);

        if (entries.length > 0) {
            // Calculate day stats
            const allActivities = entries.flatMap(e => e.activities || []);
            const uniqueActivities = [...new Set(allActivities)];
            const energyEntries = entries.filter(e => e.energyLevel !== undefined);
            const avgEnergy = energyEntries.length > 0
                ? energyEntries.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / energyEntries.length
                : 0;
            const hasNotes = entries.some(e => e.note && e.note.trim() !== '');

            setDayStats({
                activitiesCount: uniqueActivities.length,
                avgEnergy: Math.round(avgEnergy * 10) / 10,
                hasNotes,
            });

            // Group entries by time of day
            const morningEntry = entries.find(e => e.timeOfDay === 'morning');
            const afternoonEntry = entries.find(e => e.timeOfDay === 'afternoon');
            const eveningEntry = entries.find(e => e.timeOfDay === 'evening');

            // Use most recent as fallback
            const fallbackEntry = entries[entries.length - 1];

            // Generate story with full context
            const generatedStory = generateDayStory({
                morning: morningEntry ? {
                    mood: morningEntry.mood,
                    timeOfDay: 'morning',
                    activities: morningEntry.activities as ActivityId[],
                    energyLevel: morningEntry.energyLevel,
                    note: morningEntry.note,
                } : fallbackEntry ? {
                    mood: fallbackEntry.mood,
                    timeOfDay: 'morning',
                    activities: fallbackEntry.activities as ActivityId[],
                    energyLevel: fallbackEntry.energyLevel,
                } : undefined,

                afternoon: afternoonEntry ? {
                    mood: afternoonEntry.mood,
                    timeOfDay: 'afternoon',
                    activities: afternoonEntry.activities as ActivityId[],
                    energyLevel: afternoonEntry.energyLevel,
                    note: afternoonEntry.note,
                } : fallbackEntry ? {
                    mood: fallbackEntry.mood,
                    timeOfDay: 'afternoon',
                    activities: fallbackEntry.activities as ActivityId[],
                    energyLevel: fallbackEntry.energyLevel,
                } : undefined,

                evening: eveningEntry ? {
                    mood: eveningEntry.mood,
                    timeOfDay: 'evening',
                    activities: eveningEntry.activities as ActivityId[],
                    energyLevel: eveningEntry.energyLevel,
                    note: eveningEntry.note,
                } : fallbackEntry ? {
                    mood: fallbackEntry.mood,
                    timeOfDay: 'evening',
                    activities: fallbackEntry.activities as ActivityId[],
                    energyLevel: fallbackEntry.energyLevel,
                    note: fallbackEntry.note,
                } : undefined,
            });

            setStory(generatedStory);

            // Save the story
            await saveStory({
                date: getTodayDate(),
                ...generatedStory,
                moods: {
                    morning: morningEntry?.mood || fallbackEntry?.mood,
                    afternoon: afternoonEntry?.mood || fallbackEntry?.mood,
                    evening: eveningEntry?.mood || fallbackEntry?.mood,
                },
                activities: uniqueActivities as ActivityId[],
                averageEnergy: avgEnergy,
                notes: entries.filter(e => e.note).map(e => e.note!),
            });
        } else {
            // Generate default story
            const defaultStory = generateSimpleStory('neutral');
            setStory(defaultStory);
            setDayStats(null);
        }

        setIsLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStory();
        setRefreshing(false);
    };

    const animatedHeaderStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    const getEnergyEmoji = (energy: number) => {
        if (energy >= 4) return '⚡';
        if (energy >= 3) return '🔋';
        return '🪫';
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.background} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingEmoji}>✨</Text>
                    <Text style={styles.loadingText}>Weaving your story...</Text>
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
                    <Text style={styles.title}>Your Day</Text>
                    <Text style={styles.date}>{currentDate}</Text>
                </Animated.View>

                {/* Day Stats */}
                {dayStats && (
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statEmoji}>🎯</Text>
                                at <Text style={styles.statValue}>{todayEntries.length}</Text>
                                <Text style={styles.statLabel}>entries</Text>
                            </View>
                            {dayStats.activitiesCount > 0 && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statEmoji}>🏃</Text>
                                    <Text style={styles.statValue}>{dayStats.activitiesCount}</Text>
                                    <Text style={styles.statLabel}>activities</Text>
                                </View>
                            )}
                            {dayStats.avgEnergy > 0 && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statEmoji}>{getEnergyEmoji(dayStats.avgEnergy)}</Text>
                                    <Text style={styles.statValue}>{dayStats.avgEnergy}</Text>
                                    <Text style={styles.statLabel}>energy</Text>
                                </View>
                            )}
                            {dayStats.hasNotes && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statEmoji}>📝</Text>
                                    <Text style={styles.statValue}>✓</Text>
                                    <Text style={styles.statLabel}>notes</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}

                {/* Summary */}
                {story && (
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <GlassCard style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>✨ Today's Story</Text>
                            <Text style={styles.summaryText}>{story.summary}</Text>
                        </GlassCard>
                    </Animated.View>
                )}

                {/* Story Sections */}
                <View style={styles.storySection}>
                    {story && (
                        <>
                            <StoryCard
                                timeOfDay="morning"
                                story={story.morning}
                                index={0}
                            />
                            <StoryCard
                                timeOfDay="afternoon"
                                story={story.afternoon}
                                index={1}
                            />
                            <StoryCard
                                timeOfDay="evening"
                                story={story.evening}
                                index={2}
                            />
                        </>
                    )}
                </View>

                {/* User Notes Section */}
                {todayEntries.some(e => e.note) && (
                    <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                        <Text style={styles.sectionTitle}>Your Thoughts</Text>
                        {todayEntries.filter(e => e.note).map((entry, index) => (
                            <GlassCard key={entry.id} style={styles.noteCard}>
                                <Text style={styles.noteTime}>
                                    {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                                </Text>
                                <Text style={styles.noteText}>"{entry.note}"</Text>
                            </GlassCard>
                        ))}
                    </Animated.View>
                )}

                {/* Activities Summary */}
                {todayEntries.some(e => e.activities && e.activities.length > 0) && (
                    <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                        <Text style={styles.sectionTitle}>What You Did</Text>
                        <View style={styles.activitiesGrid}>
                            {[...new Set(todayEntries.flatMap(e => e.activities || []))].map(actId => {
                                const activity = ACTIVITIES.find(a => a.id === actId);
                                if (!activity) return null;
                                return (
                                    <View key={actId} style={styles.activityChip}>
                                        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                                        <Text style={styles.activityLabel}>{activity.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* Footer Message */}
                <Animated.View entering={FadeInDown.delay(800).duration(400)}>
                    <Text style={styles.footerText}>
                        This is your story. Own it. 🌙
                    </Text>
                </Animated.View>

                {/* Empty state message */}
                {todayEntries.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>🌱</Text>
                        <Text style={styles.emptyTitle}>Start Your Story</Text>
                        <Text style={styles.emptyText}>
                            Head to the Today tab to log your mood and watch your story unfold.
                        </Text>
                    </GlassCard>
                )}
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
    date: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    statItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    statEmoji: {
        fontSize: 20,
    },
    statValue: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
    summaryCard: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: typography.sizes.sm,
        color: colors.accent,
        marginBottom: spacing.sm,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryText: {
        fontSize: typography.sizes.xl,
        color: colors.text,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: typography.sizes.xl * typography.lineHeights.relaxed,
    },
    storySection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    noteCard: {
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    noteTime: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    noteText: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontStyle: 'italic',
        lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
    activitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    activityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.glass.border,
    },
    activityEmoji: {
        fontSize: 16,
    },
    activityLabel: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    footerText: {
        fontSize: typography.sizes.md,
        color: colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: spacing.lg,
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
    emptyCard: {
        alignItems: 'center',
        padding: spacing.xl,
        marginTop: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
