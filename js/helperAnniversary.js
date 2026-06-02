/**
 * Assistant Tone Module: Anniversary
 */
const HelperAnniversary = {
  label: "Anniversary 🥂",
  generate: function (to, detail) {
    const drafts = [
      `Happy Anniversary, ${to},\n\nIt feels almost surreal to look back and realize how far we’ve traveled together. Every single day spent by your side is a masterclass in love, patience, and true partnership. ${detail ? `From the unforgettable days of ${detail} all the way to this exact moment, my admiration for you has only grown deeper.` : "We’ve built a catalog of quiet mornings, shared dreams, and unbreakable inside jokes that I wouldn’t trade for anything."}\n\nThank you for choosing me time and time again. Here’s to our past, our present, and the beautiful, unwritten future ahead of us. Cheers, my love.`,

      `To my favorite person, ${to},\n\nHappy anniversary! They say time flies when you're having fun, but with you, time flies because I am completely at peace. You are my safe harbor, my biggest cheerleader, and my best friend all wrapped into one incredible human being. ${detail ? `I was walking down memory lane today thinking about ${detail}, marveling at how beautifully our bond has matured since then.` : "Looking back at where we started versus where we are now fills me with an incredible sense of pride."}\n\nThank you for making this beautiful life choice alongside me. I love you endlessly.`,

      `Dearest ${to},\n\nAnother milestone reached, and my heart is fuller than ever. Happy anniversary. Loving you is the easiest, most natural thing I have ever done, and being loved by you is an honor I never take for granted. ${detail ? `Every foundation we poured during ${detail} has grown into a life more beautiful than I could have imagined.` : "Through every changing season, your steady hand and warm heart have been my absolute favorite constants."}\n\nThank you for the laughter, the growth, and the beautiful devotion. Here is to many more chapters together.`,
    ];

    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
