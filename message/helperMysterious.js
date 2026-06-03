/**
 * Assistant Tone Module: Cryptic Puzzle
 */
const HelperMysterious = {
  label: "Cryptic & Intrigued 🔍",
  generate: function (to, detail) {
    const drafts = [
      `To ${to},\n\nSome things in this world aren't meant to be handed over freely; they require a small token of focus, a minor trial of will. You have solved the riddle of the grid, and so the lock turns. ${detail ? `The echoes of ${detail} still linger in the air, a puzzle piece that hasn't quite settled yet.` : "There are quiet currents moving beneath the surface of our everyday conversations."}\n\nKeep looking closely at the spaces between words. Secrets have a way of revealing themselves only when the timing is exactly right. Until next time.`,

      `A message for ${to},\n\nIn a world loud with endless notifications, I prefer the quiet safety of an encrypted seal. You've navigated the layout, decoded the action, and earned the text inside. ${detail ? `I find myself returning to what happened with ${detail}—a moment that felt like a turning point in an unwritten chapter.` : "Few people possess the patience to look past the surface anymore, but I had a feeling you would."}\n\nConsider this an acknowledgment of a connection that defies the ordinary. Shadows hide keys, but you've found this one easily.`,

      `Listen closely, ${to},\n\nEvery great story begins with a door that demands to be opened. By finishing the trial, you've stepped through the threshold. ${detail ? `The threads connecting us back to ${detail} are stronger than you might realize, running deep beneath the noise.` : "Our interactions are like an underlying code, shifting quietly with every glance and word shared."}\n\nTake these sentences as a quiet reminder that there is always more to the picture than what meets the eye. Keep watching.`,
    ];

    return drafts[Math.floor(Math.random() * drafts.length)];
  },
};
