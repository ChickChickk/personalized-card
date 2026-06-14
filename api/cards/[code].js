const supabase = require("../_db");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.query;

  const { data, error } = await supabase
    .from("cards")
    .select("data")
    .eq("code", code)
    .single();

  if (error || !data) return res.status(404).json({ error: "Card not found" });

  return res.status(200).json(data.data);
};
