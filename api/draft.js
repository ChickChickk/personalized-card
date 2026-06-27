const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";
const TEMPERATURE = 0.9;

// Length presets: a writing instruction plus a matching token budget.
const LENGTHS = {
  short: { guide: "Keep it to about 2 to 3 sentences. One short paragraph at most.", maxTokens: 160 },
  medium: { guide: "Aim for one short paragraph.", maxTokens: 260 },
  long: { guide: "You may use up to two short paragraphs.", maxTokens: 360 },
};
const DEFAULT_LENGTH = "short";

// One of these is picked at random per request so messages vary in their entry point.
const ANGLES = [
  "Open with warmth and let the feeling lead, plainly and simply.",
  "Lead with a little gratitude for who they are.",
  "Keep it light and affectionate, the way you'd actually talk to them.",
  "Start gently, like you're just checking in with someone you love.",
  "Let it feel honest and unhurried, without trying too hard.",
  "Keep it simple and heartfelt, the kind of thing easy to read in one breath.",
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

  return `\n\nHere are examples of the voice, tone, and quality to aim for. Do not copy them, just match their feel:\n\n${picked}`;
}

function buildSystemPrompt({ tone, purpose, lengthGuide } = {}) {
  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
  const banned = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");

  const occasionLine = purpose
    ? `\n\nThis card is for: ${purpose}. Let that occasion shape what you say.`
    : "";
  const toneLine = tone
    ? `\n\nTone: ${tone}. Keep this mood, but stay plain and natural, never over the top.`
    : "";

  return `You're a real person writing a short, warm card to someone you love. You're not a poet and not a greeting-card company. You just want to say something kind and true in your own plain voice.

The user gives you a description of who the message is for and what they want to say. Never copy, echo, or reference their description in the output.

Keep it general and heartfelt, not a deep or heavy backstory. Only mention a specific memory or detail if the user actually gave you one. Do not invent fake memories, made-up moments, or details the user never mentioned. If they didn't give a specific detail, just speak warmly and a little generally about how much this person means to them. The goal is something touching and personal that could come straight from the heart, not a scene from a story.

${lengthGuide} Write as the sender, in first person, with natural contractions and the rhythm of real speech. Warm, simple, easy to read in one breath.${occasionLine}${toneLine}

Approach for this message: ${angle}

Punctuation rule: never use em dashes or en dashes. Use commas, periods, or start a new sentence instead.

Avoid these phrases and any close variants: ${banned}. Avoid anything that sounds like a greeting-card aisle.

No greeting line. No sign-off. No quotes around the output. Just the message itself.${examplesBlock()}`;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, tone, purpose, length } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const lengthPreset = LENGTHS[length] || LENGTHS[DEFAULT_LENGTH];
  // Keep tone/purpose to short, plain labels so they can't smuggle in instructions.
  const safeTone = typeof tone === "string" ? tone.slice(0, 40) : "";
  const safePurpose = typeof purpose === "string" ? purpose.slice(0, 40) : "";

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: lengthPreset.maxTokens,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt({
            tone: safeTone,
            purpose: safePurpose,
            lengthGuide: lengthPreset.guide,
          }),
        },
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
