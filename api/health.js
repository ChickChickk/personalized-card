module.exports = (req, res) => {
  res.json({
    groq: !!process.env.GROQ_API_KEY,
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY,
  });
};
