import { createClient } from './supabase';

// Step configuration with Napoleon Hill's instructions
export const STEPS = [
    {
        number: 1,
        title: "Det exakta beloppet",
        instruction: "Fastställ i ditt sinne det exakta beloppet pengar du önskar. Det räcker inte att bara säga: \"Jag vill ha massor av pengar\". Var specifik gällande beloppet.",
        quote: "Det finns en psykologisk anledning till denna konkretisering.",
        field: "amount",
        inputType: "number" as const,
        placeholder: "500000",
        suffix: "SEK"
    },
    {
        number: 2,
        title: "Vad du ger i utbyte",
        instruction: "Bestäm exakt vad du avser att ge i utbyte mot pengarna du önskar. Det finns ingen verklighet där man får \"någonting för ingenting\".",
        quote: "Universums lagar kräver ett utbyte av värde.",
        field: "exchange",
        inputType: "textarea" as const,
        placeholder: "Beskriv det värde, den tjänst eller den produkt du kommer leverera..."
    },
    {
        number: 3,
        title: "Din deadline",
        instruction: "Fastställ ett bestämt datum då du avser att inneha pengarna du önskar.",
        quote: "Ett mål utan deadline är bara en dröm.",
        field: "deadline",
        inputType: "date" as const,
        placeholder: ""
    },
    {
        number: 4,
        title: "Din plan",
        instruction: "Skapa en konkret plan för hur du ska genomföra din önskan, och börja omedelbart, oavsett om du är redo eller inte, att sätta denna plan i verket.",
        quote: "Handling är den verkliga måttstocken på intelligens.",
        field: "plan",
        inputType: "textarea" as const,
        placeholder: "Beskriv de konkreta steg du kommer ta för att nå ditt mål..."
    },
    {
        number: 5,
        title: "Ditt uttalande",
        instruction: "Skriv ner ett tydligt, kortfattat uttalande om mängden pengar du avser att förvärva, ange tidsgränsen för förvärvet, beskriv vad du tänker ge i utbyte för pengarna och beskriv tydligt planen genom vilken du ämnar ackumulera dem.",
        quote: "Det skrivna ordet har en kraft som tanken saknar.",
        field: "statement",
        inputType: "preview" as const,
        placeholder: ""
    }
];

export interface AffirmationData {
    id?: string;
    amount: string;
    exchange: string;
    deadline: string;
    plan: string;
    statement: string;
    createdAt: string;
}

// Get or create a unique device ID for anonymous users
export function getDeviceId(): string {
    if (typeof window === "undefined") return "";

    let deviceId = localStorage.getItem("rikedom_device_id");
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("rikedom_device_id", deviceId);
    }
    return deviceId;
}

// Get user ID - prefers authenticated user, falls back to device_id
export async function getUserId(): Promise<string> {
    if (typeof window === "undefined") return "";

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        return session.user.id;
    }

    return getDeviceId();
}

export function generateStatement(data: Partial<AffirmationData>): string {
    const amount = data.amount ? parseInt(data.amount).toLocaleString("sv-SE") : "[belopp]";
    const deadline = data.deadline
        ? new Date(data.deadline).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "[datum]";
    const exchange = data.exchange || "[vad du ger]";
    const plan = data.plan || "[din plan]";

    return `Jag är fast besluten att samla ${amount} kronor senast den ${deadline}.

I utbyte mot dessa pengar kommer jag att ge:
${exchange}

Min plan för att uppnå detta är:
${plan}

Jag tror helhjärtat på att jag kommer att uppnå detta mål. Jag ser pengarna framför mig. Jag känner dem i mina händer. De väntar på mig, och jag kommer att ta emot dem.`;
}

// Save affirmation to Supabase
export async function saveAffirmation(data: AffirmationData): Promise<AffirmationData | null> {
    const supabase = createClient();
    const userId = await getUserId();

    // Check if user already has an affirmation
    const { data: existing } = await supabase
        .from('affirmations')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existing) {
        // Update existing
        const { data: updated, error } = await supabase
            .from('affirmations')
            .update({
                amount: parseFloat(data.amount),
                exchange: data.exchange,
                deadline: data.deadline,
                plan: data.plan,
                statement: data.statement,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating affirmation:', error);
            // Fallback to localStorage
            localStorage.setItem("rikedom_affirmation", JSON.stringify(data));
            return data;
        }
        return updated;
    } else {
        // Insert new
        const { data: inserted, error } = await supabase
            .from('affirmations')
            .insert({
                user_id: userId,
                amount: parseFloat(data.amount),
                exchange: data.exchange,
                deadline: data.deadline,
                plan: data.plan,
                statement: data.statement
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving affirmation:', error);
            // Fallback to localStorage
            localStorage.setItem("rikedom_affirmation", JSON.stringify(data));
            return data;
        }
        return inserted;
    }
}

// Get affirmation from Supabase
export async function getAffirmation(): Promise<AffirmationData | null> {
    if (typeof window === "undefined") return null;

    const supabase = createClient();
    const userId = await getUserId();

    const { data, error } = await supabase
        .from('affirmations')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // Fallback to localStorage
        const saved = localStorage.getItem("rikedom_affirmation");
        return saved ? JSON.parse(saved) : null;
    }

    return {
        id: data.id,
        amount: data.amount.toString(),
        exchange: data.exchange,
        deadline: data.deadline,
        plan: data.plan,
        statement: data.statement,
        createdAt: data.created_at
    };
}

// Log a reading
export async function logReading(affirmationId?: string): Promise<void> {
    const supabase = createClient();
    const userId = await getUserId();
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : 'evening';

    const { error } = await supabase
        .from('reading_log')
        .insert({
            user_id: userId,
            affirmation_id: affirmationId,
            period
        });

    if (error) {
        console.error('Error logging reading:', error);
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_reading_log");
        const readings: string[] = log ? JSON.parse(log) : [];
        readings.push(new Date().toISOString());
        localStorage.setItem("rikedom_reading_log", JSON.stringify(readings));
    }
}

// Get streak count
export async function getStreak(): Promise<number> {
    if (typeof window === "undefined") return 0;

    const supabase = createClient();
    const userId = await getUserId();

    const { data, error } = await supabase
        .from('reading_log')
        .select('read_at')
        .eq('user_id', userId)
        .order('read_at', { ascending: false });

    if (error || !data || data.length === 0) {
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_reading_log");
        if (!log) return 0;
        const readings: string[] = JSON.parse(log);
        return calculateStreakFromDates(readings);
    }

    return calculateStreakFromDates(data.map(r => r.read_at));
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
export async function hasReadToday(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const supabase = createClient();
    const userId = await getUserId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('reading_log')
        .select('id')
        .eq('user_id', userId)
        .gte('read_at', today.toISOString())
        .limit(1);

    if (error) {
        // Fallback to localStorage
        const log = localStorage.getItem("rikedom_reading_log");
        if (!log) return false;
        const readings: string[] = JSON.parse(log);
        const todayStr = new Date().toDateString();
        return readings.some(r => new Date(r).toDateString() === todayStr);
    }

    return (data?.length ?? 0) > 0;
}

// Delete affirmation
export async function deleteAffirmation(): Promise<void> {
    const supabase = createClient();
    const userId = await getUserId();

    await supabase
        .from('affirmations')
        .delete()
        .eq('user_id', userId);

    await supabase
        .from('reading_log')
        .delete()
        .eq('user_id', userId);

    localStorage.removeItem("rikedom_affirmation");
    localStorage.removeItem("rikedom_reading_log");
}

// Step data helpers (still use localStorage for temp data during flow)
export function getStepData(): Partial<AffirmationData> {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("rikedom_step_data");
    return saved ? JSON.parse(saved) : {};
}

export function saveStepData(data: Partial<AffirmationData>): void {
    localStorage.setItem("rikedom_step_data", JSON.stringify(data));
}

export function clearStepData(): void {
    localStorage.removeItem("rikedom_step_data");
}
