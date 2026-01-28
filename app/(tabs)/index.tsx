// Home Screen - "Today" with Full Dynamic Features
// Mood selection, activities, energy level, journal notes, and calendar access

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../theme/colors';
import MoodOrb from '../../components/MoodOrb';
import GlassCard from '../../components/GlassCard';
import ActivitySelector from '../../components/ActivitySelector';
import EnergySlider from '../../components/EnergySlider';
import JournalNote from '../../components/JournalNote';
import CalendarHistory from '../../components/CalendarHistory';
import { Mood, getQuickSummary } from '../../storyEngine/generateStory';
import storage, { getTodayDate, saveMoodEntry, ActivityId } from '../../storage/moodStorage';

export default function HomeScreen() {
  const router = useRouter();

  // Core state
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [summary, setSummary] = useState<string>("How are you feeling today?");
  const [currentDate, setCurrentDate] = useState<string>('');

  // New dynamic features state
  const [selectedActivities, setSelectedActivities] = useState<ActivityId[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number | undefined>(undefined);
  const [journalNote, setJournalNote] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [streak, setStreak] = useState<number>(0);

  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Format today's date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    setCurrentDate(today.toLocaleDateString('en-US', options));

    // Load today's data if exists
    loadTodayData();
    loadStreak();
  }, []);

  const loadTodayData = async () => {
    const moods = await storage.getTodayMoods();
    if (moods.length > 0) {
      const lastMood = moods[moods.length - 1];
      setSelectedMood(lastMood.mood);
      setSelectedActivities(lastMood.activities || []);
      setEnergyLevel(lastMood.energyLevel);
      setJournalNote(lastMood.note || '');
      setSummary(getQuickSummary(lastMood.mood, lastMood.activities));
    }
  };

  const loadStreak = async () => {
    const insights = await storage.calculateWeeklyInsights();
    const loggingStreak = insights.streaks.find(s => s.type === 'logging');
    if (loggingStreak) {
      setStreak(loggingStreak.count);
    }
  };

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setSummary(getQuickSummary(mood, selectedActivities));
  };

  const handleActivityToggle = (activity: ActivityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activity)) {
        return prev.filter(a => a !== activity);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleSaveEntry = async () => {
    if (!selectedMood) return;

    setIsSaving(true);

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17) timeOfDay = 'evening';

    // Save mood entry with all new fields
    await saveMoodEntry({
      date: getTodayDate(),
      timeOfDay,
      mood: selectedMood,
      activities: selectedActivities.length > 0 ? selectedActivities : undefined,
      energyLevel,
      note: journalNote.trim() || undefined,
    });

    setIsSaving(false);

    // Update summary with activities
    setSummary(getQuickSummary(selectedMood, selectedActivities));

    // Reload streak
    loadStreak();
  };

  const handleReplayPress = async () => {
    // Save current entry before navigating
    if (selectedMood) {
      await handleSaveEntry();
    }

    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.push('/replay');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <CalendarHistory
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with calendar button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>

          <View style={styles.headerRight}>
            {streak > 1 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}</Text>
              </View>
            )}
            <Pressable
              style={styles.calendarButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.calendarIcon}>📅</Text>
            </Pressable>
          </View>
        </View>

        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlassCard style={styles.summaryCard}>
            <Text style={styles.summaryText}>{summary}</Text>
          </GlassCard>
        </Animated.View>

        {/* Mood Selection */}
        <Animated.View
          style={styles.moodSection}
          entering={FadeInDown.delay(200).duration(400)}
        >
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <MoodOrb
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
          />
        </Animated.View>

        {/* Activities - only show if mood is selected */}
        {selectedMood && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <ActivitySelector
              selectedActivities={selectedActivities}
              onToggleActivity={handleActivityToggle}
            />
          </Animated.View>
        )}

        {/* Energy Level - only show if mood is selected */}
        {selectedMood && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <EnergySlider
              value={energyLevel}
              onChange={setEnergyLevel}
            />
          </Animated.View>
        )}

        {/* Journal Note - only show if mood is selected */}
        {selectedMood && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <JournalNote
              value={journalNote}
              onChange={setJournalNote}
            />
          </Animated.View>
        )}

        {/* Save Button - only show if there are changes */}
        {selectedMood && (
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEntry}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : '💾 Save Entry'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Replay CTA Button */}
        <Animated.View
          style={animatedButtonStyle}
          entering={FadeInDown.delay(700).duration(400)}
        >
          <TouchableOpacity
            style={[
              styles.replayButton,
              !selectedMood && styles.replayButtonDisabled
            ]}
            onPress={handleReplayPress}
            activeOpacity={0.9}
            disabled={!selectedMood}
          >
            <Text style={styles.replayButtonEmoji}>✨</Text>
            <Text style={styles.replayButtonText}>Replay My Day</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick tip */}
        <Animated.View
          style={styles.tipContainer}
          entering={FadeInDown.delay(800).duration(400)}
        >
          <Text style={styles.tipText}>
            💡 Log throughout the day for richer stories
          </Text>
        </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    fontSize: typography.sizes.display,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  streakBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  streakText: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: '600',
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  calendarIcon: {
    fontSize: 20,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summaryText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: typography.sizes.lg * typography.lineHeights.relaxed,
    textAlign: 'center',
  },
  moodSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginTop: spacing.lg,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  replayButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  replayButtonEmoji: {
    fontSize: 20,
  },
  replayButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.background,
  },
  tipContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
