// Enhanced Local Storage for Life Replay
// Handles mood entries with notes, activities, energy levels, and pattern detection

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mood } from '../storyEngine/generateStory';

// Storage keys
const STORAGE_KEYS = {
    MOOD_ENTRIES: 'life_replay_mood_entries',
    STORIES: 'life_replay_stories',
    SETTINGS: 'life_replay_settings',
    CUSTOM_MOODS: 'life_replay_custom_moods',
};

// Activity types
export const ACTIVITIES = [
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'social', label: 'Social', emoji: '👥' },
    { id: 'exercise', label: 'Exercise', emoji: '🏃' },
    { id: 'creative', label: 'Creative', emoji: '🎨' },
    { id: 'rest', label: 'Rest', emoji: '🛋️' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'learning', label: 'Learning', emoji: '📚' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
] as const;

export type ActivityId = typeof ACTIVITIES[number]['id'];

// Types
export interface MoodEntry {
    id: string;
    date: string; // ISO date string
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    mood: Mood;
    emotionTag?: string;
    note?: string; // Optional journal note
    activities?: ActivityId[]; // What you did
    energyLevel?: number; // 1-5 scale
    timestamp: number;
}

export interface DayStory {
    date: string;
    morning: string;
    afternoon: string;
    evening: string;
    summary: string;
    moods: {
        morning?: Mood;
        afternoon?: Mood;
        evening?: Mood;
    };
    activities?: ActivityId[];
    averageEnergy?: number;
    notes?: string[];
}

export interface WeeklyInsight {
    week: string;
    dominantMood: Mood;
    moodCounts: Record<Mood, number>;
    insights: string[];
    patterns: PatternInsight[];
    streaks: StreakInfo[];
}

export interface PatternInsight {
    type: 'time' | 'activity' | 'energy' | 'streak' | 'trend';
    title: string;
    description: string;
    icon: string;
}

export interface StreakInfo {
    type: 'logging' | 'mood';
    count: number;
    description: string;
}

// Helper: Get today's date string
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Helper: Generate unique ID
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Get date X days ago
function getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

// MOOD ENTRIES

export async function saveMoodEntry(entry: Omit<MoodEntry, 'id' | 'timestamp'>): Promise<MoodEntry> {
    try {
        const entries = await getMoodEntries();
        const newEntry: MoodEntry = {
            ...entry,
            id: generateId(),
            timestamp: Date.now(),
        };

        // Remove any existing entry for same date and time
        const filteredEntries = entries.filter(
            e => !(e.date === entry.date && e.timeOfDay === entry.timeOfDay)
        );

        filteredEntries.push(newEntry);
        await AsyncStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(filteredEntries));

        return newEntry;
    } catch (error) {
        console.error('Error saving mood entry:', error);
        throw error;
    }
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting mood entries:', error);
        return [];
    }
}

export async function getTodayMoods(): Promise<MoodEntry[]> {
    const entries = await getMoodEntries();
    const today = getTodayDate();
    return entries.filter(e => e.date === today);
}

export async function getEntriesForDate(date: string): Promise<MoodEntry[]> {
    const entries = await getMoodEntries();
    return entries.filter(e => e.date === date);
}

export async function getWeekEntries(): Promise<MoodEntry[]> {
    const entries = await getMoodEntries();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entries.filter(e => e.timestamp >= weekAgo);
}

export async function getMonthEntries(): Promise<MoodEntry[]> {
    const entries = await getMoodEntries();
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return entries.filter(e => e.timestamp >= monthAgo);
}

// Get all unique dates that have entries
export async function getDatesWithEntries(): Promise<string[]> {
    const entries = await getMoodEntries();
    const dates = [...new Set(entries.map(e => e.date))];
    return dates.sort((a, b) => b.localeCompare(a)); // Most recent first
}

// STORIES

export async function saveStory(story: DayStory): Promise<void> {
    try {
        const stories = await getStories();
        const filteredStories = stories.filter(s => s.date !== story.date);
        filteredStories.push(story);
        await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filteredStories));
    } catch (error) {
        console.error('Error saving story:', error);
        throw error;
    }
}

export async function getStories(): Promise<DayStory[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.STORIES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting stories:', error);
        return [];
    }
}

export async function getTodayStory(): Promise<DayStory | null> {
    const stories = await getStories();
    const today = getTodayDate();
    return stories.find(s => s.date === today) || null;
}

export async function getStoryForDate(date: string): Promise<DayStory | null> {
    const stories = await getStories();
    return stories.find(s => s.date === date) || null;
}

// ADVANCED INSIGHTS

export async function calculateWeeklyInsights(): Promise<WeeklyInsight> {
    const entries = await getWeekEntries();
    const allEntries = await getMoodEntries();

    const moodCounts: Record<Mood, number> = {
        happy: 0,
        calm: 0,
        tired: 0,
        anxious: 0,
        focused: 0,
        neutral: 0,
        excited: 0,
        sad: 0,
    };

    entries.forEach(entry => {
        moodCounts[entry.mood]++;
    });

    // Find dominant mood
    let dominantMood: Mood = 'neutral';
    let maxCount = 0;
    (Object.keys(moodCounts) as Mood[]).forEach(mood => {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            dominantMood = mood;
        }
    });

    // Generate insights and patterns
    const insights = generateBasicInsights(entries, moodCounts, dominantMood);
    const patterns = await generatePatternInsights(entries, allEntries);
    const streaks = await calculateStreaks(allEntries);

    return {
        week: getTodayDate(),
        dominantMood,
        moodCounts,
        insights,
        patterns,
        streaks,
    };
}

function generateBasicInsights(entries: MoodEntry[], moodCounts: Record<Mood, number>, dominantMood: Mood): string[] {
    const insights: string[] = [];

    const moodDescriptions: Record<Mood, string> = {
        happy: "joyful",
        calm: "peaceful",
        tired: "exhausted",
        anxious: "restless",
        focused: "driven",
        neutral: "balanced",
        excited: "energized",
        sad: "melancholic",
    };

    insights.push(`You've been feeling mostly ${moodDescriptions[dominantMood]} this week.`);

    // Time-based patterns
    const eveningEntries = entries.filter(e => e.timeOfDay === 'evening');
    const eveningCalm = eveningEntries.filter(e => e.mood === 'calm' || e.mood === 'happy' || e.mood === 'sad').length;
    if (eveningEntries.length > 0 && eveningCalm > eveningEntries.length / 2) {
        insights.push("Evenings bring you peace. You're often calmer as the day winds down.");
    }

    const morningEntries = entries.filter(e => e.timeOfDay === 'morning');
    const morningTired = morningEntries.filter(e => e.mood === 'tired').length;
    if (morningEntries.length > 0 && morningTired > morningEntries.length / 2) {
        insights.push("Mornings have been heavy. Consider adjusting your sleep routine.");
    }

    // Activity insights
    const entriesWithActivities = entries.filter(e => e.activities && e.activities.length > 0);
    if (entriesWithActivities.length > 0) {
        const activityMoodMap: Record<ActivityId, Mood[]> = {} as any;
        entriesWithActivities.forEach(e => {
            e.activities?.forEach(act => {
                if (!activityMoodMap[act]) activityMoodMap[act] = [];
                activityMoodMap[act].push(e.mood);
            });
        });

        // Find activity with best mood correlation
        Object.entries(activityMoodMap).forEach(([activity, moods]) => {
            const positiveCount = moods.filter(m => ['happy', 'calm', 'excited', 'focused'].includes(m)).length;
            if (positiveCount > moods.length / 2) {
                const activityName = ACTIVITIES.find(a => a.id === activity)?.label || activity;
                insights.push(`${activityName} seems to lift your spirits.`);
            }
        });
    }

    return insights.slice(0, 3);
}

async function generatePatternInsights(weekEntries: MoodEntry[], allEntries: MoodEntry[]): Promise<PatternInsight[]> {
    const patterns: PatternInsight[] = [];

    // Energy pattern
    const entriesWithEnergy = weekEntries.filter(e => e.energyLevel !== undefined);
    if (entriesWithEnergy.length >= 3) {
        const avgEnergy = entriesWithEnergy.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / entriesWithEnergy.length;

        if (avgEnergy >= 4) {
            patterns.push({
                type: 'energy',
                title: 'High Energy Week',
                description: 'Your energy levels have been above average this week!',
                icon: '⚡',
            });
        } else if (avgEnergy <= 2) {
            patterns.push({
                type: 'energy',
                title: 'Low Energy Pattern',
                description: 'You might need more rest. Consider taking breaks.',
                icon: '🔋',
            });
        }
    }

    // Time of day pattern
    const morningMoods = weekEntries.filter(e => e.timeOfDay === 'morning').map(e => e.mood);
    const eveningMoods = weekEntries.filter(e => e.timeOfDay === 'evening').map(e => e.mood);

    const morningPositive = morningMoods.filter(m => ['happy', 'excited', 'focused'].includes(m)).length;
    const eveningPositive = eveningMoods.filter(m => ['happy', 'calm', 'excited'].includes(m)).length;

    if (morningMoods.length >= 3 && morningPositive > morningMoods.length * 0.7) {
        patterns.push({
            type: 'time',
            title: 'Morning Person',
            description: 'You tend to feel best in the mornings!',
            icon: '🌅',
        });
    } else if (eveningMoods.length >= 3 && eveningPositive > eveningMoods.length * 0.7) {
        patterns.push({
            type: 'time',
            title: 'Night Owl',
            description: 'Your mood improves as the day goes on.',
            icon: '🌙',
        });
    }

    // Trend pattern (comparing this week to last week)
    const lastWeekStart = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const lastWeekEnd = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const lastWeekEntries = allEntries.filter(e => e.timestamp >= lastWeekStart && e.timestamp < lastWeekEnd);

    if (weekEntries.length >= 3 && lastWeekEntries.length >= 3) {
        const thisWeekPositive = weekEntries.filter(e => ['happy', 'calm', 'excited', 'focused'].includes(e.mood)).length / weekEntries.length;
        const lastWeekPositive = lastWeekEntries.filter(e => ['happy', 'calm', 'excited', 'focused'].includes(e.mood)).length / lastWeekEntries.length;

        if (thisWeekPositive > lastWeekPositive + 0.2) {
            patterns.push({
                type: 'trend',
                title: 'Upward Trend',
                description: 'Your mood has been improving compared to last week!',
                icon: '📈',
            });
        } else if (thisWeekPositive < lastWeekPositive - 0.2) {
            patterns.push({
                type: 'trend',
                title: 'Challenging Week',
                description: 'This week has been tougher. Be gentle with yourself.',
                icon: '💙',
            });
        }
    }

    // Consecutive tired/anxious pattern
    const sortedEntries = [...weekEntries].sort((a, b) => a.timestamp - b.timestamp);
    let consecutiveTired = 0;
    let maxConsecutiveTired = 0;

    for (const entry of sortedEntries) {
        if (entry.mood === 'tired' || entry.mood === 'anxious') {
            consecutiveTired++;
            maxConsecutiveTired = Math.max(maxConsecutiveTired, consecutiveTired);
        } else {
            consecutiveTired = 0;
        }
    }

    if (maxConsecutiveTired >= 3) {
        patterns.push({
            type: 'streak',
            title: 'Rest Needed',
            description: `You've been ${maxConsecutiveTired >= 4 ? 'really ' : ''}tired or anxious for a while. Prioritize self-care.`,
            icon: '🫂',
        });
    }

    return patterns.slice(0, 4);
}

async function calculateStreaks(allEntries: MoodEntry[]): Promise<StreakInfo[]> {
    const streaks: StreakInfo[] = [];

    // Calculate logging streak
    const uniqueDates = [...new Set(allEntries.map(e => e.date))].sort((a, b) => b.localeCompare(a));
    let loggingStreak = 0;
    const today = getTodayDate();

    for (let i = 0; i < 30; i++) {
        const checkDate = getDateDaysAgo(i);
        if (uniqueDates.includes(checkDate)) {
            loggingStreak++;
        } else if (i > 0) {
            break;
        }
    }

    if (loggingStreak >= 2) {
        streaks.push({
            type: 'logging',
            count: loggingStreak,
            description: `${loggingStreak} day${loggingStreak > 1 ? 's' : ''} logging streak! 🔥`,
        });
    }

    // Calculate positive mood streak
    const sortedEntries = [...allEntries].sort((a, b) => b.timestamp - a.timestamp);
    let positiveStreak = 0;

    for (const entry of sortedEntries) {
        if (['happy', 'calm', 'excited', 'focused'].includes(entry.mood)) {
            positiveStreak++;
        } else {
            break;
        }
    }

    if (positiveStreak >= 3) {
        streaks.push({
            type: 'mood',
            count: positiveStreak,
            description: `${positiveStreak} positive entries in a row! ✨`,
        });
    }

    return streaks;
}

// CLEAR DATA (for testing)
export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

export default {
    saveMoodEntry,
    getMoodEntries,
    getTodayMoods,
    getEntriesForDate,
    getWeekEntries,
    getMonthEntries,
    getDatesWithEntries,
    saveStory,
    getStories,
    getTodayStory,
    getStoryForDate,
    calculateWeeklyInsights,
    clearAllData,
    getTodayDate,
    ACTIVITIES,
};
