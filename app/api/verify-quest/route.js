import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { questTitle, userResponse } = await request.json();

    if (!questTitle || !userResponse) {
      return Response.json(
        { verified: false, reason: "Missing quest title or response" },
        { status: 400 },
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are an accountability coach verifying that a user actually completed a quest in a productivity app called StreakCard.

Quest: "${questTitle}"
User's description of what they did: "${userResponse}"

Evaluate if the user's description is specific, plausible, and shows they actually did the quest. Be reasonably strict but not paranoid:
- REJECT vague responses like "I did it", "yeah", "stuff", "the thing", single-word answers, or responses under 10 characters
- REJECT responses that don't actually match the quest
- ACCEPT specific responses with real details (topic studied, what they read, sets/reps performed, distance walked, etc)
- ACCEPT short answers if they contain genuine specifics (e.g. "ran 3 miles in 27 min" is fine)

Respond ONLY with valid JSON in this exact format, no other text, no markdown fences:
{
  "verified": true or false,
  "reason": "short one-sentence explanation directed at the user"
}`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return Response.json(result);
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json(
      { verified: false, reason: "Something went wrong, try again" },
      { status: 500 },
    );
  }
}
