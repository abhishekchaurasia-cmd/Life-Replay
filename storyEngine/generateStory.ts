// Enhanced Story Generation Engine for Life Replay
// Dynamic story generation using mood, activities, energy, and notes

export type Mood = 'happy' | 'calm' | 'tired' | 'anxious' | 'focused' | 'neutral' | 'excited';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type ActivityId = 'work' | 'social' | 'exercise' | 'creative' | 'rest' | 'nature' | 'learning' | 'family';

interface StoryContext {
    mood: Mood;
    timeOfDay: TimeOfDay;
    activities?: ActivityId[];
    energyLevel?: number;
    note?: string;
}

interface DayStoryInput {
    morning?: StoryContext;
    afternoon?: StoryContext;
    evening?: StoryContext;
}

interface DayStory {
    morning: string;
    afternoon: string;
    evening: string;
    summary: string;
}

// Activity descriptions for story integration
const activityPhrases: Record<ActivityId, { doing: string; past: string; effect: string }> = {
    work: {
        doing: 'navigating work demands',
        past: 'after hours of focus',
        effect: 'productivity shaped the hours',
    },
    social: {
        doing: 'connecting with others',
        past: 'after moments of connection',
        effect: 'human warmth filled the spaces',
    },
    exercise: {
        doing: 'moving your body',
        past: 'after physical movement',
        effect: 'your body thanked you',
    },
    creative: {
        doing: 'creating something new',
        past: 'after letting creativity flow',
        effect: 'imagination colored your thoughts',
    },
    rest: {
        doing: 'allowing yourself to slow down',
        past: 'after giving yourself rest',
        effect: 'stillness became a gift',
    },
    nature: {
        doing: 'breathing in the outdoors',
        past: 'after time with nature',
        effect: 'the world felt a little bigger',
    },
    learning: {
        doing: 'expanding your mind',
        past: 'after absorbing something new',
        effect: 'curiosity led the way',
    },
    family: {
        doing: 'being with loved ones',
        past: 'after moments with family',
        effect: 'love anchored the day',
    },
};

// Energy level descriptions
const energyDescriptions: Record<number, { state: string; verb: string }> = {
    1: { state: 'running on empty', verb: 'dragged through' },
    2: { state: 'low on fuel', verb: 'pushed through' },
    3: { state: 'steadily moving', verb: 'navigated' },
    4: { state: 'feeling capable', verb: 'embraced' },
    5: { state: 'fully charged', verb: 'powered through' },
};

// Expanded story templates with placeholders
const storyTemplates: Record<Mood, Record<TimeOfDay, string[]>> = {
    happy: {
        morning: [
            "The sun greeted you gently, and something felt lighter today.",
            "You woke with a quiet smile, {{ACTIVITY_EFFECT}}.",
            "Morning light filtered through, carrying promises of good things.",
            "{{ENERGY_STATE}}, you welcomed the day with open arms.",
            "Joy found you early, settling into your morning like an old friend.",
        ],
        afternoon: [
            "The day unfolded with warmth, {{ACTIVITY_DOING}}.",
            "Afternoon passed in a pleasant rhythm, contentment in the small things.",
            "Hours slipped by easily, touched by a sense of gratitude.",
            "You {{ENERGY_VERB}} the afternoon, finding happiness in the flow.",
            "Lightness carried you through the midday hours.",
        ],
        evening: [
            "The day ended softly, leaving behind traces of joy to remember.",
            "Night came with a peaceful heart, {{ACTIVITY_PAST}}.",
            "You carried warmth into the evening, a gentle glow within.",
            "{{NOTE_REFLECTION}}",
            "The day closed on a high note, happiness lingering like a melody.",
        ],
    },
    calm: {
        morning: [
            "The morning arrived in stillness, a quiet beginning.",
            "You rose with a steady breath, {{ACTIVITY_EFFECT}}.",
            "Dawn brought a sense of peace, like the world had paused for you.",
            "{{ENERGY_STATE}}, you found tranquility in the ordinary.",
            "Serenity wrapped around the morning like a soft blanket.",
        ],
        afternoon: [
            "The afternoon moved like a slow river, calm and clear.",
            "Time stretched gently, {{ACTIVITY_DOING}}.",
            "You found tranquility in the ordinary moments.",
            "Peace was your companion as you {{ENERGY_VERB}} the hours.",
            "The afternoon hummed with quiet contentment.",
        ],
        evening: [
            "The day gently slowed down, leaving space to breathe.",
            "Evening settled in like a familiar embrace, {{ACTIVITY_PAST}}.",
            "Night arrived softly, wrapping everything in quiet calm.",
            "{{NOTE_REFLECTION}}",
            "You drifted into evening with a serene heart.",
        ],
    },
    tired: {
        morning: [
            "Morning felt heavier than usual, your energy still gathering.",
            "You began the day carrying weight, {{ENERGY_STATE}}.",
            "The morning asked for patience as you slowly found your footing.",
            "Dawn arrived, but energy lagged behind, {{ACTIVITY_EFFECT}}.",
            "You rose despite the weight, honoring your commitment to show up.",
        ],
        afternoon: [
            "The afternoon challenged you, but you kept moving forward.",
            "Energy ebbed and flowed as you {{ENERGY_VERB}} the hours.",
            "You pushed through the fog, {{ACTIVITY_DOING}}.",
            "Weariness sat with you, but you didn't let it stop you.",
            "The afternoon demanded more than you had, yet you persisted.",
        ],
        evening: [
            "Rest finally called, and you answered with relief.",
            "The evening welcomed you with the promise of restoration.",
            "Night arrived as a sanctuary, {{ACTIVITY_PAST}}.",
            "{{NOTE_REFLECTION}}",
            "You earned this rest. Tomorrow is a new beginning.",
        ],
    },
    anxious: {
        morning: [
            "The morning carried an edge, thoughts racing before your feet hit the ground.",
            "You woke with a flutter in your chest, {{ENERGY_STATE}}.",
            "Dawn arrived with restless energy, but you faced it anyway.",
            "Uncertainty colored the morning, yet you showed up, {{ACTIVITY_DOING}}.",
            "The mind raced ahead while the body tried to catch up.",
        ],
        afternoon: [
            "The afternoon tested your calm, but you held on.",
            "Waves of worry came and went, yet you stayed afloat.",
            "You breathed through the tension, {{ACTIVITY_DOING}}.",
            "Anxiety whispered, but you chose to keep moving, {{ENERGY_VERB}}.",
            "The hours felt longer, but you navigated each one.",
        ],
        evening: [
            "As night approached, the anxiety began to loosen its grip.",
            "The evening offered relief, {{ACTIVITY_PAST}}.",
            "You made it through, and that itself was enough.",
            "{{NOTE_REFLECTION}}",
            "Night came as a gentle reminder: you survived another day.",
        ],
    },
    focused: {
        morning: [
            "You woke with clarity, ready to channel your energy.",
            "The morning brought purpose, {{ACTIVITY_EFFECT}}.",
            "Dawn arrived with intention, each task waiting to be claimed.",
            "{{ENERGY_STATE}}, your mind was sharp and ready.",
            "Focus found you early, guiding your first hours.",
        ],
        afternoon: [
            "The afternoon became your canvas, {{ACTIVITY_DOING}}.",
            "You moved with direction, accomplishing what mattered.",
            "Time passed productively, your attention unwavering.",
            "You {{ENERGY_VERB}} the afternoon with precision and purpose.",
            "Goals fell like dominoes under your focused effort.",
        ],
        evening: [
            "The evening arrived with satisfaction of a day well spent.",
            "You closed the day having created something meaningful.",
            "Night came to reward your dedication, {{ACTIVITY_PAST}}.",
            "{{NOTE_REFLECTION}}",
            "Rest now. You've earned every moment of it.",
        ],
    },
    neutral: {
        morning: [
            "The morning began without fanfare, steady and unremarkable.",
            "You rose into an ordinary day, {{ACTIVITY_EFFECT}}.",
            "Dawn arrived quietly, bringing an average kind of peace.",
            "{{ENERGY_STATE}}, the day started on an even keel.",
            "Neither heavy nor light, the morning simply was.",
        ],
        afternoon: [
            "The afternoon passed in familiar rhythms.",
            "Hours moved along their usual path, {{ACTIVITY_DOING}}.",
            "You navigated the day on autopilot, and that was okay.",
            "The middle of the day held no surprises, just steady progress.",
            "You {{ENERGY_VERB}} the afternoon with quiet consistency.",
        ],
        evening: [
            "The day ended as it began – quietly, simply.",
            "Evening brought closure to an unremarkable but honest day.",
            "Night arrived to bookmark another page in your story.",
            "{{NOTE_REFLECTION}}",
            "Not every day needs to be extraordinary to matter.",
        ],
    },
    excited: {
        morning: [
            "Energy sparked the moment you opened your eyes.",
            "The morning hummed with anticipation, {{ACTIVITY_EFFECT}}.",
            "You woke ready to chase whatever the day would offer.",
            "{{ENERGY_STATE}}, excitement bubbled up naturally.",
            "The air felt electric with possibility.",
        ],
        afternoon: [
            "The afternoon crackled with momentum, {{ACTIVITY_DOING}}.",
            "Hours raced by, filled with energy and engagement.",
            "You rode the wave of excitement, alive in each moment.",
            "You {{ENERGY_VERB}} the afternoon with infectious enthusiasm.",
            "Every moment felt charged with potential.",
        ],
        evening: [
            "The evening buzzed with the afterglow of a vibrant day.",
            "Night arrived but couldn't dim your inner spark.",
            "You carried the day's excitement into your dreams, {{ACTIVITY_PAST}}.",
            "{{NOTE_REFLECTION}}",
            "What a day to remember. The energy lives on.",
        ],
    },
};

// Summary templates with dynamic elements
const summaryTemplates: Record<Mood, string[]> = {
    happy: [
        "Today held moments of quiet joy.",
        "You found lightness in the ordinary.",
        "A day touched by happiness, {{ACTIVITY_SUMMARY}}.",
        "Joy was your companion today.",
    ],
    calm: [
        "Today was a gentle exhale.",
        "Peace found you in the stillness.",
        "A day of quiet presence, {{ACTIVITY_SUMMARY}}.",
        "Serenity colored your hours.",
    ],
    tired: [
        "You carried yourself through today.",
        "Rest was the day's true destination.",
        "A day of pushing through, {{ACTIVITY_SUMMARY}}.",
        "Tomorrow, you rise again.",
    ],
    anxious: [
        "You navigated stormy waters today.",
        "Despite the waves, you stayed afloat.",
        "A day of quiet courage, {{ACTIVITY_SUMMARY}}.",
        "You showed up. That's enough.",
    ],
    focused: [
        "Today was shaped by intention.",
        "You moved with purpose, {{ACTIVITY_SUMMARY}}.",
        "A day of meaningful progress.",
        "Focus was your superpower today.",
    ],
    neutral: [
        "Today was simply today.",
        "An ordinary day, honestly lived.",
        "A quiet chapter in your story, {{ACTIVITY_SUMMARY}}.",
        "Steady and balanced, just as it should be.",
    ],
    excited: [
        "Today buzzed with energy.",
        "You embraced the day's possibilities, {{ACTIVITY_SUMMARY}}.",
        "A day alive with spark and wonder.",
        "The excitement will echo in your dreams.",
    ],
};

// Helper functions
function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, context: StoryContext): string {
    let result = template;

    // Activity placeholders
    if (context.activities && context.activities.length > 0) {
        const primaryActivity = context.activities[0];
        const phrases = activityPhrases[primaryActivity];
        result = result
            .replace('{{ACTIVITY_DOING}}', phrases.doing)
            .replace('{{ACTIVITY_PAST}}', phrases.past)
            .replace('{{ACTIVITY_EFFECT}}', phrases.effect)
            .replace('{{ACTIVITY_SUMMARY}}', `filled with ${phrases.doing}`);
    } else {
        result = result
            .replace(', {{ACTIVITY_DOING}}', '')
            .replace(', {{ACTIVITY_PAST}}', '')
            .replace(', {{ACTIVITY_EFFECT}}', '')
            .replace('{{ACTIVITY_DOING}}', 'moving through the hours')
            .replace('{{ACTIVITY_PAST}}', 'after the day unfolded')
            .replace('{{ACTIVITY_EFFECT}}', 'the day took shape')
            .replace(', {{ACTIVITY_SUMMARY}}', '');
    }

    // Energy placeholders
    if (context.energyLevel) {
        const energy = energyDescriptions[context.energyLevel] || energyDescriptions[3];
        result = result
            .replace('{{ENERGY_STATE}}', energy.state.charAt(0).toUpperCase() + energy.state.slice(1))
            .replace('{{ENERGY_VERB}}', energy.verb);
    } else {
        result = result
            .replace('{{ENERGY_STATE}}, ', '')
            .replace('{{ENERGY_STATE}}', 'Moving forward')
            .replace('{{ENERGY_VERB}}', 'moved through');
    }

    // Note reflection
    if (context.note && context.note.trim()) {
        // Create a poetic reflection from the note
        const noteReflection = `In your words: "${context.note.trim()}"`;
        result = result.replace('{{NOTE_REFLECTION}}', noteReflection);
    } else {
        // Pick a different template without note placeholder
        result = result.replace('{{NOTE_REFLECTION}}', 'A moment worth remembering.');
    }

    return result;
}

// Generate story for a specific time period
export function generateTimeStory(context: StoryContext): string {
    const templates = storyTemplates[context.mood][context.timeOfDay];
    const template = pickRandom(templates);
    return fillTemplate(template, context);
}

// Generate a full day story
export function generateDayStory(input: DayStoryInput): DayStory {
    const defaultContext: StoryContext = {
        mood: 'neutral',
        timeOfDay: 'morning',
    };

    const morningContext = input.morning || { ...defaultContext, timeOfDay: 'morning' };
    const afternoonContext = input.afternoon || {
        ...defaultContext,
        mood: input.morning?.mood || 'neutral',
        timeOfDay: 'afternoon'
    };
    const eveningContext = input.evening || {
        ...defaultContext,
        mood: input.afternoon?.mood || input.morning?.mood || 'neutral',
        timeOfDay: 'evening'
    };

    const morningStory = generateTimeStory({ ...morningContext, timeOfDay: 'morning' });
    const afternoonStory = generateTimeStory({ ...afternoonContext, timeOfDay: 'afternoon' });
    const eveningStory = generateTimeStory({ ...eveningContext, timeOfDay: 'evening' });

    // Use the last mood for summary
    const summaryMood = eveningContext.mood;
    const summaryTemplate = pickRandom(summaryTemplates[summaryMood]);

    // Collect all activities for summary
    const allActivities = [
        ...(morningContext.activities || []),
        ...(afternoonContext.activities || []),
        ...(eveningContext.activities || []),
    ];

    const summary = fillTemplate(summaryTemplate, {
        mood: summaryMood,
        timeOfDay: 'evening',
        activities: allActivities.length > 0 ? allActivities : undefined,
    });

    return {
        morning: morningStory,
        afternoon: afternoonStory,
        evening: eveningStory,
        summary,
    };
}

// Generate simple story from single mood
export function generateSimpleStory(mood: Mood, activities?: ActivityId[], energyLevel?: number, note?: string): DayStory {
    const context = { mood, activities, energyLevel, note };
    return generateDayStory({
        morning: { ...context, timeOfDay: 'morning' },
        afternoon: { ...context, timeOfDay: 'afternoon' },
        evening: { ...context, timeOfDay: 'evening' },
    });
}

// Quick summary for home screen
export function getQuickSummary(mood: Mood | null, activities?: ActivityId[]): string {
    if (!mood) {
        return "How are you feeling today?";
    }

    const template = pickRandom(summaryTemplates[mood]);
    return fillTemplate(template, {
        mood,
        timeOfDay: 'morning',
        activities
    });
}

export default {
    generateTimeStory,
    generateDayStory,
    generateSimpleStory,
    getQuickSummary,
};
