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
    amount: string;
    exchange: string;
    deadline: string;
    plan: string;
    statement: string;
    createdAt: string;
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

export function saveAffirmation(data: AffirmationData): void {
    localStorage.setItem("rikedom_affirmation", JSON.stringify(data));
}

export function getAffirmation(): AffirmationData | null {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("rikedom_affirmation");
    return saved ? JSON.parse(saved) : null;
}

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
