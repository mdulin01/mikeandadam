// Relationship questions for the weekly check-in — a rotating "question of
// the week" both partners answer. Mix of light, curious, and deep.
// The week's question is deterministic (hash of the week key) so Mike and
// Adam always see the same one; the 🎲 reroll writes an override to
// tripData/checkins {week, questionIndex} to keep both in sync.
export const RELATIONSHIP_QUESTIONS = [
  // Understanding each other
  "What's something you wish I understood better about you?",
  "When do you feel most loved by me?",
  "What's a small thing I do that makes your day better?",
  "What do you need more of from me when you're stressed?",
  "How do you prefer to be comforted after a hard day?",
  "What's something you've always wanted to ask me but haven't?",
  "What part of your day do you most look forward to sharing with me?",
  "What's one way we're different that you've come to appreciate?",
  "What's a habit of mine that makes you smile?",
  "When did you last feel really proud of us as a couple?",
  // Memories & story
  "What moment from our early days do you replay the most?",
  "What's your favorite trip we've taken together, and why that one?",
  "What's a small, ordinary memory of us that you treasure?",
  "When did you first know this was something real?",
  "What's the funniest thing that's ever happened to us?",
  "Which photo of us would you save first in a fire?",
  "What tradition of ours do you hope we never lose?",
  // Dreams & future
  "If we could live anywhere for one year, where would you pick?",
  "What's one adventure you want us to have before we're 70?",
  "What does a perfect ordinary Saturday look like for us in five years?",
  "What's something new you'd like us to learn or try together?",
  "What kind of old couple do you hope we become?",
  "If money were no object, what would we do next year?",
  "What's one thing you want us to be intentional about this year?",
  // Growth & the relationship itself
  "What's something hard we've been through that made us stronger?",
  "What do you think we do really well as a couple?",
  "Where do you think we could take better care of each other?",
  "What's a conversation you think we've been putting off?",
  "How have I changed since we met — for the better?",
  "What would you like more of in our relationship right now?",
  "What's something you admire about how I handle life?",
  "What boundary or ritual should we protect more fiercely?",
  // Playful
  "What song will always be 'us' to you?",
  "If we had a couples' trophy shelf, what would our biggest trophy be for?",
  "What's my most lovable quirk?",
  "If we opened a tiny business together, what would it be?",
  "What fictional couple are we most like?",
  "What would the title of our memoir be?",
  "What's the best meal we've ever shared, anywhere?",
  "If we got matching tattoos (hypothetically!), what would they be?",
];

// Deterministic index for a given week key ('YYYY-MM-DD' of the Sunday) —
// same question for both partners with zero coordination.
export const questionIndexForWeek = (weekKey) => {
  let h = 0;
  for (let i = 0; i < weekKey.length; i++) h = (h * 31 + weekKey.charCodeAt(i)) >>> 0;
  return h % RELATIONSHIP_QUESTIONS.length;
};
