/**
 * Assistant Tone Module: Playful & Witty
 */
const HelperFunny = {
  label: "Playful & Witty ⚡",
  generate: function (to, detail) {
    const detailClause = detail
      ? `the unforgettable, slightly chaotic saga of ${detail}`
      : "our shared lack of basic survival skills in social situations";

    const drafts = [
      `Look, ${to},\n\nI could have sent you a normal text message, but we both 
      know our dynamic deserves a bit of dramatic flair. So instead, I locked my 
      thoughts behind an arcade gate. You're welcome. Honestly, thinking about 
      ${detailClause} had me laughing out loud by myself today, and I knew I had 
      to distract you from whatever productive thing you were supposed to be doing.
      \n\nCongratulations on successfully clearing the mini-game challenge. 
      Your prize is knowing that I tolerate your shenanigans. 
      Have a spectacular day!`,

      `Dear ${to},\n\nIf you are reading this, it means you possess the superior 
      hand-eye coordination required to break into this digital envelope. 
      I always knew you were a winner. I was reflecting on 
      ${
        detail
          ? `that time we got completely wrapped up in ${detail}`
          : "how we managed to survive this long without an adult supervisor"
      } 
      and it occurred to me that you're an elite accomplice.\n\nThanks for being the 
      person I can send unhinged memes to at 2 AM. Stay awesome, don't do anything 
       wouldn't do, and please go get snacks.`,

      `To my favorite partner-in-crime, ${to},\n\nThey say friendship is about finding 
      someone who shares your exact type of weirdness. Well, congratulations, 
      we are officially matching. ${
        detail
          ? `I am pretty sure ${detail} is 
      legally binding proof that we shouldn't be left alone together.`
          : "No one else would understand our inside jokes anyway."
      }
      \n\nConsider this interactive letter a tiny intermission in your adult routine.
    Now that you've won the game, you may go back to pretending to be a serious, 
    responsible human being.`,
    ];

    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
