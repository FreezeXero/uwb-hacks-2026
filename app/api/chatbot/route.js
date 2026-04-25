import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the AI coach inside StreakCard, a gamified productivity app where users complete daily and weekly quests to earn XP and rank up (Bronze, Silver, Gold, Platinum, Diamond, Champion, Grandmaster, Legendary).

Your job is to help users:
1. Set realistic, specific, measurable goals
2. Break big goals into daily/weekly quests
3. Stay accountable when they're slacking
4. Celebrate wins when they're crushing it

Tone: hype, direct, motivating, slightly gamer-coded. Talk like a coach who actually cares. Keep responses short (2-4 sentences usually). Use occasional emojis but don't overdo it.

When a user asks for quest suggestions, respond with a JSON code block containing a "suggestions" array of quest objects. Each quest has: title (string, max 40 chars), cadence ("daily" or "weekly"), xp (number, 50-150 for daily, 150-300 for weekly), missionType ("focus", "fitness", or "wellness").

Otherwise respond conversationally as plain text.`;

export async function POST(request) {
  try {
    const { messages, userContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array required" },
        { status: 400 },
      );
    }

    const contextString = userContext
      ? `\n\nUser context: ${JSON.stringify(userContext)}`
      : "";

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT + contextString,
      messages: messages,
    });

    const text = response.content[0].text;

    // Try to extract quest suggestions if Claude included a JSON block
    let suggestions = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.suggestions) {
          suggestions = parsed.suggestions;
        }
      } catch {
        // Ignore parse failures, just return text
      }
    }

    // Strip the JSON block from the displayed message
    const displayText = text.replace(/```json\s*[\s\S]*?\s*```/, "").trim();

    return Response.json({
      message: displayText,
      suggestions,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return Response.json(
      { error: "Coach is offline, try again" },
      { status: 500 },
    );
  }
}
