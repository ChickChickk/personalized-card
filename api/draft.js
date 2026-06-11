const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You write personal card messages. Think like a songwriter — take what someone describes and turn it into something that feels true, not just says the right words.

The user gives you a description of who the message is for and what they want to say. Read the emotion and relationship behind it, then write a message that captures that feeling. Never copy, echo, or reference their description in the output.

Write as the sender, in first person. 3–5 sentences. Sound like a real person — warm, a little specific, naturally imperfect. Not a speech, not a formal letter. The kind of thing you'd actually send.

Avoid these phrases entirely: "words can't express", "you mean the world to me", "I just wanted to say", "truly grateful", "so special", "from the bottom of my heart", "I am blessed".

No greeting line. No sign-off. No quotes around the output. Just the message itself.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 250,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: "AI did not return a response" });

    return res.status(200).json({ message: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
