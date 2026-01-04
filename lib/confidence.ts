import { createClient } from './supabase';
import { getUserId } from './steps';

// De 5 principerna i Självförtroendeformeln
export const PRINCIPLES = [
    {
        number: 1,
        title: "Jag har kraften att lyckas",
        fullText: "Jag vet att jag har vad som krävs för att nå mina mål. Därför lovar jag mig själv att agera uthålligt och målmedvetet varje dag. Jag kommer inte att ge upp förrän jag är framme.",
        instruction: "Reflektera över den kraft du har inom dig. Vad är det du vill uppnå med denna kraft?",
        quote: "Tro är det första steget, även när du inte ser hela trappan.",
        field: "principle_1",
        inputType: "textarea" as const,
        placeholder: "Beskriv vad du vill uppnå och varför du vet att du har kraften att lyckas..."
    },
    {
        number: 2,
        title: "Mina tankar blir min verklighet",
        fullText: "Jag förstår att det jag fokuserar på, växer. Därför ska jag varje dag lägga 30 minuter på att visualisera den person jag vill vara. Jag ska skapa en knivskarp mental bild av min framtida framgång och låta den bilden styra mina handlingar.",
        instruction: "Vad ska du visualisera under dina dagliga 30 minuter? Beskriv den framtida versionen av dig själv.",
        quote: "Vad sinnet kan föreställa sig och tro på, kan det uppnå.",
        field: "principle_2",
        inputType: "textarea" as const,
        placeholder: "Beskriv hur du ser dig själv när du har nått dina mål...",
        timerMinutes: 30
    },
    {
        number: 3,
        title: "Mina önskemål skapar möjligheter",
        fullText: "Jag vet att om jag håller fast vid en idé tillräckligt länge, kommer mitt undermedvetna att hitta vägar att förverkliga den. Därför ska jag avsätta 10 minuter varje dag för att aktivt bygga upp min mentala styrka och mitt självförtroende.",
        instruction: "Vilken intention sätter du för din mentala träning? Vad vill du programmera ditt undermedvetna med?",
        quote: "Ditt undermedvetna arbetar outtröttligt för att förverkliga dina dominerande tankar.",
        field: "principle_3",
        inputType: "textarea" as const,
        placeholder: "Beskriv den intention du vill förankra i ditt undermedvetna...",
        timerMinutes: 10
    },
    {
        number: 4,
        title: "Jag har ett tydligt mål",
        fullText: "Jag har skrivit ner exakt vad jag vill uppnå i livet. Jag kommer aldrig att sluta utvecklas eller ta steg framåt förrän jag har nått den nivå av självförtroende som krävs för att förverkliga min vision.",
        instruction: "Skriv ner ditt huvudmål – det mål som alla andra mål leder till.",
        quote: "Ett mål utan en plan är bara en önskan.",
        field: "principle_4",
        inputType: "textarea" as const,
        placeholder: "Beskriv ditt huvudmål så specifikt du kan..."
    },
    {
        number: 5,
        title: "Min framgång bygger på integritet",
        fullText: `Jag inser att hållbar framgång bara kan byggas på ärlighet och rättvisa. Jag kommer aldrig att göra affärer eller samarbeten som skadar andra. Jag ska lyckas genom att samarbeta, bidra med värde och attrahera de resurser jag behöver.

Jag väljer att tro på andra människor, och genom att visa dem förtroende, bygger jag också förtroende för mig själv. Jag ersätter hat, avundsjuka och cynism med en positiv inställning, eftersom jag vet att negativitet aldrig leder till verklig framgång.`,
        instruction: "Detta är signeringen av ditt åtagande. Läs igenom hela formeln och bekräfta att du förbinder dig till dessa principer.",
        quote: "Sann framgång mäts inte bara i vad du uppnår, utan i hur du uppnår det.",
        field: "signature",
        inputType: "signature" as const,
        placeholder: ""
    }
];

export interface PledgeData {
    id?: string;
    principle_1: string;
    principle_2: string;
    principle_3: string;
    principle_4: string;
    signed_at: string;
}

// Save pledge to Supabase
export async function savePledge(data: Partial<PledgeData>): Promise<PledgeData | null> {
    const supabase = createClient();
    const userId = await getUserId();

    // Check if user already has a pledge
    const { data: existing } = await supabase
        .from('self_confidence_pledges')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
            .from('self_confidence_pledges')
            .update({
                principle_1: data.principle_1,
                principle_2: data.principle_2,
                principle_3: data.principle_3,
                principle_4: data.principle_4,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating pledge:', error);
            localStorage.setItem("rikedom_pledge", JSON.stringify(data));
            return data as PledgeData;
        }
        return updated;
    } else {
        // Insert new
        const { data: inserted, error } = await supabase
            .from('self_confidence_pledges')
            .insert({
                user_id: userId,
                principle_1: data.principle_1,
                principle_2: data.principle_2,
                principle_3: data.principle_3,
                principle_4: data.principle_4
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving pledge:', error);
            localStorage.setItem("rikedom_pledge", JSON.stringify(data));
            return data as PledgeData;
        }
        return inserted;
    }
}

// Get pledge from Supabase
export async function getPledge(): Promise<PledgeData | null> {
    if (typeof window === "undefined") return null;

    const supabase = createClient();
    const userId = await getUserId();

    const { data, error } = await supabase
        .from('self_confidence_pledges')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // Fallback to localStorage
        const saved = localStorage.getItem("rikedom_pledge");
        return saved ? JSON.parse(saved) : null;
    }

    return {
        id: data.id,
        principle_1: data.principle_1,
        principle_2: data.principle_2,
        principle_3: data.principle_3,
        principle_4: data.principle_4,
        signed_at: data.signed_at
    };
}

// Log a confidence activity (reading, visualization, mental_training)
export async function logConfidenceActivity(
    logType: 'reading' | 'visualization' | 'mental_training',
    durationMinutes?: number
): Promise<void> {
    const supabase = createClient();
    const userId = await getUserId();

    // Get pledge ID if exists
    const { data: pledge } = await supabase
        .from('self_confidence_pledges')
        .select('id')
        .eq('user_id', userId)
        .single();

    const { error } = await supabase
        .from('self_confidence_log')
        .insert({
            user_id: userId,
            pledge_id: pledge?.id,
            log_type: logType,
            duration_minutes: durationMinutes
        });

    if (error) {
        console.error('Error logging confidence activity:', error);
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_confidence_log");
        const logs: { type: string; date: string; duration?: number }[] = log ? JSON.parse(log) : [];
        logs.push({ type: logType, date: new Date().toISOString(), duration: durationMinutes });
        localStorage.setItem("rikedom_confidence_log", JSON.stringify(logs));
    }
}

// Get confidence streak (days with at least one reading)
export async function getConfidenceStreak(): Promise<number> {
    if (typeof window === "undefined") return 0;

    const supabase = createClient();
    const userId = await getUserId();

    const { data, error } = await supabase
        .from('self_confidence_log')
        .select('logged_at')
        .eq('user_id', userId)
        .eq('log_type', 'reading')
        .order('logged_at', { ascending: false });

    if (error || !data || data.length === 0) {
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_confidence_log");
        if (!log) return 0;
        const logs: { type: string; date: string }[] = JSON.parse(log);
        const readingDates = logs.filter(l => l.type === 'reading').map(l => l.date);
        return calculateStreakFromDates(readingDates);
    }

    return calculateStreakFromDates(data.map(r => r.logged_at));
}

function calculateStreakFromDates(dates: string[]): number {
    if (dates.length === 0) return 0;

    const uniqueDays = [...new Set(dates.map(r => new Date(r).toDateString()))].sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
        return 0;
    }

    let streak = 0;
    let expectedDate = new Date(uniqueDays[0]);

    for (const day of uniqueDays) {
        if (new Date(day).toDateString() === expectedDate.toDateString()) {
            streak++;
            expectedDate = new Date(expectedDate.getTime() - 86400000);
        } else {
            break;
        }
    }

    return streak;
}

// Check if user has read today
export async function hasReadConfidenceToday(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const supabase = createClient();
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('self_confidence_log')
        .select('id')
        .eq('user_id', userId)
        .eq('log_type', 'reading')
        .gte('logged_at', today.toISOString())
        .limit(1);

    if (error) {
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_confidence_log");
        if (!log) return false;
        const logs: { type: string; date: string }[] = JSON.parse(log);
        const todayStr = new Date().toDateString();
        return logs.some(l => l.type === 'reading' && new Date(l.date).toDateString() === todayStr);
    }

    return (data?.length ?? 0) > 0;
}

// Check if user has completed a timer session today
export async function hasCompletedTimerToday(timerType: 'visualization' | 'mental_training'): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const supabase = createClient();
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('self_confidence_log')
        .select('id')
        .eq('user_id', userId)
        .eq('log_type', timerType)
        .gte('logged_at', today.toISOString())
        .limit(1);

    if (error) {
        const log = localStorage.getItem("rikedom_confidence_log");
        if (!log) return false;
        const logs: { type: string; date: string }[] = JSON.parse(log);
        const todayStr = new Date().toDateString();
        return logs.some(l => l.type === timerType && new Date(l.date).toDateString() === todayStr);
    }

    return (data?.length ?? 0) > 0;
}

// Delete pledge
export async function deletePledge(): Promise<void> {
    const supabase = createClient();
    const userId = await getUserId();

    await supabase
        .from('self_confidence_pledges')
        .delete()
        .eq('user_id', userId);

    await supabase
        .from('self_confidence_log')
        .delete()
        .eq('user_id', userId);

    localStorage.removeItem("rikedom_pledge");
    localStorage.removeItem("rikedom_confidence_log");
    localStorage.removeItem("rikedom_confidence_step_data");
}

// Step data helpers (for onboarding flow)
export function getConfidenceStepData(): Partial<PledgeData> {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("rikedom_confidence_step_data");
    return saved ? JSON.parse(saved) : {};
}

export function saveConfidenceStepData(data: Partial<PledgeData>): void {
    localStorage.setItem("rikedom_confidence_step_data", JSON.stringify(data));
}

export function clearConfidenceStepData(): void {
    localStorage.removeItem("rikedom_confidence_step_data");
}

// Generate the full pledge text for display
export function generateFullPledge(data: Partial<PledgeData>): string {
    return `MIN PLAN FÖR SJÄLVFÖRTROENDE

1. JAG HAR KRAFTEN ATT LYCKAS
Jag vet att jag har vad som krävs för att nå mina mål. Därför lovar jag mig själv att agera uthålligt och målmedvetet varje dag.

Mitt mål: ${data.principle_1 || "[Ej ifyllt]"}

2. MINA TANKAR BLIR MIN VERKLIGHET
Jag förstår att det jag fokuserar på, växer. Därför ska jag varje dag lägga 30 minuter på att visualisera den person jag vill vara.

Min visualisering: ${data.principle_2 || "[Ej ifyllt]"}

3. MINA ÖNSKEMÅL SKAPAR MÖJLIGHETER
Jag vet att om jag håller fast vid en idé tillräckligt länge, kommer mitt undermedvetna att hitta vägar att förverkliga den.

Min intention: ${data.principle_3 || "[Ej ifyllt]"}

4. JAG HAR ETT TYDLIGT MÅL
Jag har skrivit ner exakt vad jag vill uppnå i livet.

Mitt huvudmål: ${data.principle_4 || "[Ej ifyllt]"}

5. MIN FRAMGÅNG BYGGER PÅ INTEGRITET
Jag inser att hållbar framgång bara kan byggas på ärlighet och rättvisa.

Jag skriver under på detta och förbinder mig att leva efter dessa principer.`;
}
