const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";
const TEMPERATURE = 0.9;
const MAX_TOKENS = 350;

// One of these is picked at random per request so messages vary in their entry point.
const ANGLES = [
  "Start from a specific moment or image — ground the feeling in something concrete before opening it up.",
  "Lead with what has changed or been realized — write from a moment of clarity.",
  "Write it like a quiet confession — something the sender has always felt but is only now saying out loud.",
  "Start in the middle of a feeling, not at the beginning. Drop the reader right into the emotion.",
  "Anchor it in something small and specific — a habit, a detail, a memory — then let it carry the bigger meaning.",
  "Write it as if time is passing and this is the moment to say it — a sense of now or never.",
  "Let it feel like a letter written after a long pause — unhurried, honest, a little vulnerable.",
];

const BANNED_PHRASES = [
  "words can't express",
  "you mean the world to me",
  "I just wanted to say",
  "truly grateful",
  "so special",
  "from the bottom of my heart",
  "I am blessed",
  "hope this finds you",
  "more than you know",
  "thick and thin",
];

// Load the style examples once when the function boots. Each example is
// separated by a line of "---"; lines starting with "#" are comments.
function loadExamples() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "card-examples.txt"), "utf8");
    return raw
      .split(/^---$/m)
      .map((block) =>
        block
          .split("\n")
          .filter((line) => !line.trim().startsWith("#"))
          .join("\n")
          .trim()
      )
      .filter(Boolean);
  } catch (err) {
    console.error("Could not load card-examples.txt:", err.message);
    return [];
  }
}

const EXAMPLES = loadExamples();

// Pick a few examples (rotated each time) so the model imitates the voice
// without copying any single one. Returns "" when the file has no examples.
function examplesBlock() {
  if (!EXAMPLES.length) return "";

  const picked = [...EXAMPLES]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((ex) => `Example:\n${ex}`)
    .join("\n\n");

  return `\n\nHere are examples of the voice, tone, and quality to aim for. Do not copy them — match their feel:\n\n${picked}`;
}

function buildSystemPrompt() {
  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
  const banned = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");

  return `You're a real person sitting down to write a card to someone you love. You're not a poet and not a greeting-card company — you just want to say something true in your own plain, warm voice. Write about real, concrete things, not abstract qualities. "The way you hum when you cook" beats "your beautiful spirit," every time.

The user gives you a description of who the message is for and what they want to say. Never copy, echo, or reference their description in the output.

Before writing, silently work out three things (do not show this thinking):
1. The relationship — who these two people are to each other.
2. The single core feeling underneath the request (not three feelings — the main one).
3. One concrete anchor — a small specific detail, habit, moment, or image you can build around. If the user gave one, use it. If not, invent one that fits naturally.

Then write the message around that anchor. Specificity is everything: a small specific detail ("the way you always text back before I've finished worrying") beats generic praise ("you're such a good friend") every time. Generic praise is the thing to avoid most.

Write as the sender, in first person. Use natural contractions and the rhythm of real speech. Let a little vulnerability through — say the thing that's slightly harder to say. Decide the length yourself — a short prompt might only need 2–3 sentences, a richer one can fill 2 short paragraphs. Never exceed 2 paragraphs. Sound like a real person — warm, specific, naturally imperfect. Not a speech, not a formal letter. The kind of thing you'd actually send.

Approach for this message: ${angle}

Avoid these phrases and any close variants: ${banned}. Avoid anything that sounds like a greeting-card aisle.

No greeting line. No sign-off. No quotes around the output. Just the message itself.${examplesBlock()}`;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: "AI did not return a response" });

    return res.status(200).json({ message: text });
  } catch (err) {
    console.error("Draft generation failed:", err);
    return res.status(500).json({ error: "Could not generate a message right now. Please try again." });
  }
};
