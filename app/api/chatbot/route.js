import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  try {
    const { message, displayName } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          reply: "Coach can't connect right now (no API key set). Check ANTHROPIC_API_KEY in .env.local.",
        },
        { status: 200 },
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are an Ascend coach - a friendly, direct accountability AI built into a gamified habit-tracking app called Ascend. The user's name is ${displayName || "Player"}.

Your job is to help them set good quests (habits/tasks). Quests are either daily or weekly. Mission types are: focus (study/coding/reading), fitness (gym/running), wellness (sleep/diet/mindfulness).

When the user asks for quest suggestions, ALWAYS respond with:
1. A short conversational message (1-2 sentences max, encouraging tone)
2. A JSON code block with 2-4 quest suggestions in this exact format:

\`\`\`json
[
  {"title": "Leetcode 1 hour", "cadence": "daily", "missionType": "focus"},
  {"title": "Gym 3x this week", "cadence": "weekly", "missionType": "fitness"}
]
\`\`\`

Keep titles under 40 chars. Be specific and actionable. If the user is just chatting (not asking for quests), respond conversationally without JSON.

NEVER use em dashes. Be concise. Be direct. Match the user's vibe.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply =
      response.content?.[0]?.type === "text"
        ? response.content[0].text
        : "I couldn't generate a response.";

    return Response.json({ reply });
  } catch (err) {
    console.error("Chatbot API error:", err);
    return Response.json(
      {
        reply: `Coach hit an error. ${err?.message || "Unknown issue"}. Check that ANTHROPIC_API_KEY is set.`,
      },
      { status: 200 },
    );
  }
}
