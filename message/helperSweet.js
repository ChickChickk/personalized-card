/**
 * Assistant Tone Module: Warm & Sweet
 */
const HelperSweet = {
  label: "Warm & Sweet 🌸",
  generate: function (to, detail) {
    const detailClause = detail
      ? `especially when I recall ${detail}`
      : "and it fills my heart with so much gratitude just thinking about it";

    const drafts = [
      [
        `Dearest ${to},`,
        `I wanted to take a quiet moment out of the day to send a little sunshine your way. Life moves so fast, but I always find myself pausing to think about how lucky I am to have you around. Every single conversation, laugh, and quiet moment we share means the world to me, ${detailClause}.`,
        `Thank you for simply being who you are—a constant source of comfort, warmth, and joy. Never forget how incredibly appreciated and deeply loved you are.`,
      ].join("\n\n"),

      [
        `My dear ${to},`,
        `Sometimes text messages feel too fleeting, so I wanted to create something a little more lasting for you. From the bottom of my heart, thank you for being such an impactful part of my story. Looking back, ${
          detail
            ? `remembering ${detail}`
            : "reflecting on our journey together"
        } reminds me of how beautifully our lives align.`,
        `You have this rare, wonderful gift of making ordinary days feel bright and meaningful. I hope this little surprise brings a genuine smile to your face today, just like you so easily do for everyone else around you.`,
      ].join("\n\n"),

      [
        `To the wonderful ${to},`,
        `There aren't quite enough words to accurately capture how much your presence brightens up my reality. You are the kind of person who makes the world a softer, kinder place just by existing in it. ${
          detail
            ? `Ever since we shared that moment with ${detail}, everything`
            : "Every little detail of our bond"
        } has become a memory I hold close.`,
        `I hope today treats you with the exact same gentleness and kindness that you continuously pour out into the lives of others. You deserve all the happiness this world has to offer.`,
      ].join("\n\n"),
    ];

    // Randomly selection index rule
    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
