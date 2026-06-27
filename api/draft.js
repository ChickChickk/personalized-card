const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const angles = [
    "Start from a specific moment or image — ground the feeling in something concrete before opening it up.",
    "Lead with what has changed or been realized — write from a moment of clarity.",
    "Write it like a quiet confession — something the sender has always felt but is only now saying out loud.",
    "Start in the middle of a feeling, not at the beginning. Drop the reader right into the emotion.",
    "Anchor it in something small and specific — a habit, a detail, a memory — then let it carry the bigger meaning.",
    "Write it as if time is passing and this is the moment to say it — a sense of now or never.",
    "Let it feel like a letter written after a long pause — unhurried, honest, a little vulnerable.",
  ];
  const angle = angles[Math.floor(Math.random() * angles.length)];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1.1,
      messages: [
        {
          role: "system",
          content: `You write personal card messages. Think like a songwriter — take what someone describes and turn it into something that feels true, not just says the right words.

The user gives you a description of who the message is for and what they want to say. Read the emotion and relationship behind it, then write a message that captures that feeling. Never copy, echo, or reference their description in the output.

Write as the sender, in first person. Decide the length yourself — a short prompt might only need 2–3 sentences, a richer one can fill 2 short paragraphs. Never exceed 2 paragraphs. Sound like a real person — warm, a little specific, naturally imperfect. Not a speech, not a formal letter. The kind of thing you'd actually send.

Approach for this message: ${angle}

Avoid these phrases entirely: "words can't express", "you mean the world to me", "I just wanted to say", "truly grateful", "so special", "from the bottom of my heart", "I am blessed".

No greeting line. No sign-off. No quotes around the output. Just the message itself.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 350,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: "AI did not return a response" });

    return res.status(200).json({ message: text });
  } catch (err) {
    console.error("Draft generation failed:", err);
    return res.status(500).json({ error: "Could not generate a message right now. Please try again." });
  }
};
