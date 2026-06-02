/**
 * Assistant Tone Module: Sincere Apology
 */
const HelperApology = {
  label: "Sincere Apology 🙏",
  generate: function (to, detail) {
    const drafts = [
      `Dear ${to},\n\nI am writing this because words sometimes get tangled up when spoken live, and I wanted to make sure I got this exactly right. I am so incredibly sorry for my actions. ${detail ? `Reflecting heavily on what happened regarding ${detail} made me realize how unfair and thoughtless I was.` : "I let my stress get the better of me, and it resulted in a mistake that I deeply regret."}\n\nYour presence in my life is something I cherish, and the last thing I ever want to do is cause you hurt or frustration. I hope you can accept this sincere apology, and when you are ready, I would love to talk and make things right.`,

      `To ${to},\n'nI wanted to reach out across the distance and offer a genuine, heartfelt apology. Our relationship means far too much to me to leave things unsettled or tense. ${detail ? `I know that my handling of ${detail} caused a rift, and looking back, I see exactly where I lost my footing.` : "I hate knowing that there is any discomfort between us, especially knowing I was the source of it."}\n\nI want to listen, understand your perspective better, and do whatever it takes to rebuild the trust we shared. Thank you for giving me the space to say this.`,

      `Dearest ${to},\n\nIt takes a lot of care to build a beautiful bond, and only a moment of carelessness to dent it. I am truly sorry for my part in our recent misunderstanding. ${detail ? `Ever since the situation surrounding ${detail}, I’ve been wishing I could hit rewind and approach things with a softer, wiser perspective.` : "You deserve to be treated with constant respect and kindness, and I fell short of that standard."}\n\nI value you more than I can express, and I hope we can move past this cloud together, stronger than before.`,
    ];

    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
