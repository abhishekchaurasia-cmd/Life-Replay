// Calendar History Component
// Beautiful calendar view to browse past mood entries and stories

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Modal,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeIn,
    FadeOut,
    SlideInDown,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { Mood } from '../storyEngine/generateStory';
import storage, { MoodEntry, DayStory } from '../storage/moodStorage';
import GlassCard from './GlassCard';
import StoryCard from './StoryCard';

interface CalendarHistoryProps {
    visible: boolean;
    onClose: () => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface DayData {
    date: string;
    day: number;
    moods: MoodEntry[];
    story?: DayStory;
    isToday: boolean;
    isCurrentMonth: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DayCell({
    data,
    onPress,
}: {
    data: DayData;
    onPress: () => void;
}) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Get dominant mood color for the day
    const getDominantMoodColor = () => {
        if (data.moods.length === 0) return null;
        const moodCounts: Record<string, number> = {};
        data.moods.forEach(m => {
            moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
        });
        const dominant = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0] as Mood;
        return colors.moods[dominant];
    };

    const moodColor = getDominantMoodColor();
    const hasMoods = data.moods.length > 0;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!data.isCurrentMonth}
            style={[
                styles.dayCell,
                !data.isCurrentMonth && styles.dayCellOutside,
                data.isToday && styles.dayCellToday,
                animatedStyle,
            ]}
        >
            <Text style={[
                styles.dayNumber,
                !data.isCurrentMonth && styles.dayNumberOutside,
                data.isToday && styles.dayNumberToday,
            ]}>
                {data.day}
            </Text>

            {/* Mood indicator dot */}
            {hasMoods && moodColor && (
                <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
            )}
        </AnimatedPressable>
    );
}

function DayDetail({
    data,
    onClose,
}: {
    data: DayData;
    onClose: () => void;
}) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const getMoodEmoji = (mood: Mood) => {
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

    return (
        <Animated.View
            entering={SlideInDown.duration(300)}
            style={styles.dayDetailContainer}
        >
            <View style={styles.detailHeader}>
                <Text style={styles.detailDate}>{formatDate(data.date)}</Text>
                <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.detailScroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Mood entries for the day */}
                {data.moods.length > 0 ? (
                    <>
                        <Text style={styles.sectionTitle}>Your Moods</Text>
                        <View style={styles.moodList}>
                            {data.moods.map((entry, index) => (
                                <GlassCard key={entry.id} style={styles.moodCard}>
                                    <View style={styles.moodRow}>
                                        <View style={styles.moodInfo}>
                                            <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                                            <View>
                                                <Text style={styles.moodName}>
                                                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                                                </Text>
                                                <Text style={styles.moodTime}>
                                                    {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                        {entry.energyLevel && (
                                            <View style={styles.energyBadge}>
                                                <Text style={styles.energyText}>⚡{entry.energyLevel}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {entry.note && (
                                        <Text style={styles.noteText}>"{entry.note}"</Text>
                                    )}

                                    {entry.activities && entry.activities.length > 0 && (
                                        <View style={styles.activitiesRow}>
                                            {entry.activities.map(act => (
                                                <View key={act} style={styles.activityBadge}>
                                                    <Text style={styles.activityText}>{act}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </GlassCard>
                            ))}
                        </View>

                        {/* Story of the day */}
                        {data.story && (
                            <>
                                <Text style={styles.sectionTitle}>Your Story</Text>
                                <StoryCard timeOfDay="morning" story={data.story.morning} index={0} />
                                <StoryCard timeOfDay="afternoon" story={data.story.afternoon} index={1} />
                                <StoryCard timeOfDay="evening" story={data.story.evening} index={2} />
                            </>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📅</Text>
                        <Text style={styles.emptyText}>No entries for this day</Text>
                        <Text style={styles.emptySubtext}>
                            Start logging your moods to build your story
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Animated.View>
    );
}

export default function CalendarHistory({ visible, onClose }: CalendarHistoryProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState<DayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [allEntries, setAllEntries] = useState<MoodEntry[]>([]);
    const [allStories, setAllStories] = useState<DayStory[]>([]);

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    useEffect(() => {
        generateCalendarData();
    }, [currentMonth, allEntries, allStories]);

    const loadData = async () => {
        const entries = await storage.getMoodEntries();
        const stories = await storage.getStories();
        setAllEntries(entries);
        setAllStories(stories);
    };

    const generateCalendarData = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date().toISOString().split('T')[0];

        // Adjust for Monday start
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days: DayData[] = [];

        // Previous month days
        for (let i = startOffset; i > 0; i--) {
            const date = new Date(year, month, 1 - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                day: date.getDate(),
                moods: allEntries.filter(e => e.date === dateStr),
                story: allStories.find(s => s.date === dateStr),
                isToday: dateStr === today,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                day: i,
                moods: allEntries.filter(e => e.date === dateStr),
                story: allStories.find(s => s.date === dateStr),
                isToday: dateStr === today,
                isCurrentMonth: true,
            });
        }

        // Next month days to complete the grid
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                day: i,
                moods: allEntries.filter(e => e.date === dateStr),
                story: allStories.find(s => s.date === dateStr),
                isToday: dateStr === today,
                isCurrentMonth: false,
            });
        }

        setCalendarData(days);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayPress = (data: DayData) => {
        if (data.isCurrentMonth) {
            setSelectedDay(data);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>History</Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Done</Text>
                    </Pressable>
                </View>

                {selectedDay ? (
                    <DayDetail data={selectedDay} onClose={() => setSelectedDay(null)} />
                ) : (
                    <>
                        {/* Month navigation */}
                        <View style={styles.monthNav}>
                            <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
                                <Text style={styles.navButtonText}>‹</Text>
                            </Pressable>
                            <Text style={styles.monthLabel}>
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </Text>
                            <Pressable onPress={goToNextMonth} style={styles.navButton}>
                                <Text style={styles.navButtonText}>›</Text>
                            </Pressable>
                        </View>

                        {/* Weekday headers */}
                        <View style={styles.weekdayRow}>
                            {WEEKDAYS.map(day => (
                                <Text key={day} style={styles.weekdayLabel}>{day}</Text>
                            ))}
                        </View>

                        {/* Calendar grid */}
                        <View style={styles.calendarGrid}>
                            {calendarData.map((data, index) => (
                                <DayCell
                                    key={`${data.date}-${index}`}
                                    data={data}
                                    onPress={() => handleDayPress(data)}
                                />
                            ))}
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>
                            <Text style={styles.legendTitle}>Mood Colors</Text>
                            <View style={styles.legendRow}>
                                {(['happy', 'calm', 'tired', 'anxious', 'focused', 'excited'] as Mood[]).map(mood => (
                                    <View key={mood} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.moods[mood] }]} />
                                        <Text style={styles.legendLabel}>{mood}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: spacing.sm,
    },
    closeButtonText: {
        fontSize: typography.sizes.md,
        color: colors.accent,
        fontWeight: '600',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    navButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: colors.surface,
    },
    navButtonText: {
        fontSize: 24,
        color: colors.text,
    },
    monthLabel: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    weekdayRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    weekdayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.md,
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xs,
    },
    dayCellOutside: {
        opacity: 0.3,
    },
    dayCellToday: {
        backgroundColor: colors.accentSoft,
        borderRadius: borderRadius.full,
    },
    dayNumber: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    dayNumberOutside: {
        color: colors.textMuted,
    },
    dayNumberToday: {
        color: colors.accent,
        fontWeight: '700',
    },
    moodDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 2,
    },
    legend: {
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    legendTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        textTransform: 'capitalize',
    },
    dayDetailContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    detailDate: {
        fontSize: typography.sizes.xl,
        fontWeight: '600',
        color: colors.text,
    },
    detailScroll: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    moodList: {
        gap: spacing.sm,
    },
    moodCard: {
        padding: spacing.md,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    moodEmoji: {
        fontSize: 32,
    },
    moodName: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    moodTime: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    energyBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    energyText: {
        fontSize: typography.sizes.sm,
        color: colors.accent,
        fontWeight: '600',
    },
    noteText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: spacing.sm,
    },
    activitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    activityBadge: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    activityText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: typography.sizes.lg,
        color: colors.text,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
