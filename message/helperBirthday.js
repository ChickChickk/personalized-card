/**
 * Assistant Tone Module: Happy Birthday
 */
const HelperBirthday = {
  label: "Happy Birthday 🎉",
  generate: function (to, detail) {
    const drafts = [
      `Happy Birthday, ${to}! 🎂\n\nToday belongs entirely to you, and I hope it is filled with an abundance of laughter, relaxation, and your absolute favorite things. Watching you navigate life with such grace, ambition, and humor is an absolute joy. ${detail ? `I was just thinking about how epic it was when we did ${detail}, and I hope this brand new year brings adventures that completely top that!` : "May this trip around the sun open up beautiful new chapters, deep insights, and exciting opportunities."}\n\nThank you for making the world so much brighter just by being born. Celebrate hard today!`,

      `To the birthday star, ${to}!\n\nSending you the biggest, warmest embrace on your special day! Another year wiser, stronger, and more fabulous. I wanted to build this custom little interactive card space because a standard post-it note just wouldn't suffice for someone as extraordinary as you. ${detail ? `No matter how many years go by, I’ll never forget how much fun we had during ${detail}.` : "You have an amazing knack for lifting up everyone around you, and today it’s our turn to lift you up."}\n\nMay your plate be full of cake and your heart be completely full of love!`,

      `Dearest ${to},\n\nHappy, happy birthday! On this milestone day, I want to take a moment to express how grateful I am that our paths crossed. You are a rare soul—unwaveringly kind, brilliantly unique, and completely irreplaceable. ${detail ? `As you blow out your candles, I'm sending a wish that your new year matches the pure happiness of ${detail}.` : "I hope this upcoming year rewards you with the manifestation of all those secret dreams you’ve been working toward."}\n\nEnjoy every single second of your celebration!`,
    ];

    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
