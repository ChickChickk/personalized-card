const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, tone, detail } = req.body;

  if (!tone) return res.status(400).json({ error: "Missing tone" });

  const prompt = `Write a short heartfelt message (3-5 sentences) in a ${tone} tone, addressed to "${to || "someone special"}".${detail ? ` Include this detail: "${detail}".` : ""} Write only the message itself, no greeting line, no sign-off.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: "AI did not return a response" });

    return res.status(200).json({ message: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
