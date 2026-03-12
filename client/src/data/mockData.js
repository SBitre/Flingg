// ─── Mock profiles shown in the swipe deck ──────────────────────────────────
export const MOCK_PROFILES = [
  {
    _id: 'profile_1',
    name: 'Priya Sharma',
    age: 24,
    gender: 'female',
    bio: 'Sun-kissed and free-spirited 🌊 Yoga at Vagator at sunrise, moonlit beaches at night. Here for good vibes and better conversations.',
    location: 'Baga',
    photos: ['https://i.pravatar.cc/400?img=1'],
  },
  {
    _id: 'profile_2',
    name: 'Sofia Mendes',
    age: 27,
    gender: 'female',
    bio: 'Portuguese soul, Goa heart 🍹 Travel photographer | Amateur surfer | Professional sunset watcher.',
    location: 'Anjuna',
    photos: ['https://i.pravatar.cc/400?img=5'],
  },
  {
    _id: 'profile_3',
    name: 'Rahul Verma',
    age: 29,
    gender: 'male',
    bio: 'DJ by night, beach bum by day 🎧 Spinning tracks at Hill Top and Curlies. Ask me about the best secret spots in North Goa.',
    location: 'Vagator',
    photos: ['https://i.pravatar.cc/400?img=52'],
  },
  {
    _id: 'profile_4',
    name: 'Leila Hassan',
    age: 25,
    gender: 'female',
    bio: 'Egyptian mermaid washed up on Morjim beach 🐠 Freediving instructor. I speak fluent sunset.',
    location: 'Morjim',
    photos: ['https://i.pravatar.cc/400?img=9'],
  },
  {
    _id: 'profile_5',
    name: 'Aditya Rao',
    age: 31,
    gender: 'male',
    bio: "Chef at a beach shack. Will cook for you if you're worth it 🍜 Goan food evangelist. Yes, I know the best prawn curry spot.",
    location: 'Calangute',
    photos: ['https://i.pravatar.cc/400?img=56'],
  },
  {
    _id: 'profile_6',
    name: 'Nadia Kozlov',
    age: 26,
    gender: 'female',
    bio: 'Russian-born, world-raised, Goa-obsessed 🌺 Kitesurfing instructor at Morjim. Currently: probably on a beach.',
    location: 'Morjim',
    photos: ['https://i.pravatar.cc/400?img=11'],
  },
  {
    _id: 'profile_7',
    name: 'Karan Mehta',
    age: 28,
    gender: 'male',
    bio: 'Startup founder on sabbatical in paradise 🌴 Meditating, swimming, occasionally working. FOMO-free zone.',
    location: 'Panjim',
    photos: ['https://i.pravatar.cc/400?img=59'],
  },
  {
    _id: 'profile_8',
    name: 'Isabelle Laurent',
    age: 30,
    gender: 'female',
    bio: "French artist painting Goa's chaos ✨ Find me at the Wednesday night market or lost in Old Goa's churches.",
    location: 'Anjuna',
    photos: ['https://i.pravatar.cc/400?img=17'],
  },
  {
    _id: 'profile_9',
    name: 'Vikram Singh',
    age: 33,
    gender: 'male',
    bio: 'Former army, now a scuba diving instructor 🤿 Living proof that second acts are better. Best dive sites on request.',
    location: 'Baga',
    photos: ['https://i.pravatar.cc/400?img=62'],
  },
  {
    _id: 'profile_10',
    name: 'Zoe Patel',
    age: 23,
    gender: 'female',
    bio: 'Half-British, half-Goan and 100% here for the chaos 🎪 Bartending at LPK on weekends. Come say hi.',
    location: 'Calangute',
    photos: ['https://i.pravatar.cc/400?img=20'],
  },
  {
    _id: 'profile_11',
    name: 'Marco Russo',
    age: 32,
    gender: 'male',
    bio: "Italian wanderer on his third Goa 'last visit' 🍕 Yoga teacher, pasta enthusiast, sunset chaser. Let's get lost together.",
    location: 'Vagator',
    photos: ['https://i.pravatar.cc/400?img=65'],
  },
  {
    _id: 'profile_12',
    name: 'Divya Nair',
    age: 26,
    gender: 'female',
    bio: 'Goan-born and proud 💃 Kathak dancer, feni connoisseur, and the only person who actually knows what susegad means.',
    location: 'Panjim',
    photos: ['https://i.pravatar.cc/400?img=23'],
  },
];

// ─── Auto-reply pool for the fake chat ───────────────────────────────────────
export const AUTO_REPLIES = [
  "Haha that's so true 😄",
  'You seem really interesting...',
  'Tell me more about that 👀',
  'Are you free this weekend? 🌊',
  "Goa really does something to people, doesn't it?",
  'Omg same!! 😱',
  "That's honestly the best thing I've heard all day",
  'Hmm, let me think about that 😏',
  "You're funny, I like that",
  'We should grab drinks at the beach sometime 🍹',
  "Where are you staying? Maybe we're close!",
  '✨✨✨',
  "Okay you're definitely interesting",
  "I was hoping you'd say that",
  'The sunsets here really do hit different 🌅',
  'No way!! That happened to me too',
  "You're not like the others on this app 👀",
  'Should we exchange numbers? 😈',
];

// ─── Pre-seeded matches shown on first launch ─────────────────────────────────
// matchId format: sorted [userId, profileId] joined with "|"
export const buildMatchId = (id1, id2) => [id1, id2].sort().join('|');

export const getInitialMatches = (userId) => [
  {
    matchId: buildMatchId(userId, 'profile_1'),
    user: MOCK_PROFILES[0], // Priya
    lastMessage: {
      _id: 'lm_1',
      content: 'Are you always this charming? 😏',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: { _id: 'profile_1', name: 'Priya Sharma' },
    },
    unreadCount: 1,
  },
  {
    matchId: buildMatchId(userId, 'profile_3'),
    user: MOCK_PROFILES[2], // Rahul
    lastMessage: {
      _id: 'lm_2',
      content: 'Come check out my set at Hilltop this Saturday 🎧',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      sender: { _id: 'profile_3', name: 'Rahul Verma' },
    },
    unreadCount: 2,
  },
  {
    matchId: buildMatchId(userId, 'profile_8'),
    user: MOCK_PROFILES[7], // Isabelle
    lastMessage: null,
    unreadCount: 0,
  },
];

export const getInitialMessages = (userId) => {
  const mid1 = buildMatchId(userId, 'profile_1');
  const mid2 = buildMatchId(userId, 'profile_3');
  const p1 = MOCK_PROFILES[0];
  const p3 = MOCK_PROFILES[2];

  const ago = (mins) => new Date(Date.now() - 1000 * 60 * mins).toISOString();

  return {
    [mid1]: [
      { _id: 'msg_1', matchId: mid1, sender: { _id: 'profile_1', name: p1.name, photos: p1.photos }, content: 'Hey! Saw you on Flingg 👋', createdAt: ago(60) },
      { _id: 'msg_2', matchId: mid1, sender: { _id: userId, name: 'You', photos: [] }, content: "Hey Priya! Your bio caught my eye. Yoga at sunrise sounds amazing 🌅", createdAt: ago(55) },
      { _id: 'msg_3', matchId: mid1, sender: { _id: 'profile_1', name: p1.name, photos: p1.photos }, content: 'It really is! I go to Vagator beach. The light at that hour is unreal', createdAt: ago(50) },
      { _id: 'msg_4', matchId: mid1, sender: { _id: userId, name: 'You', photos: [] }, content: 'I should try that sometime. So what brings you to Goa?', createdAt: ago(40) },
      { _id: 'msg_5', matchId: mid1, sender: { _id: 'profile_1', name: p1.name, photos: p1.photos }, content: 'Are you always this charming? 😏', createdAt: ago(30) },
    ],
    [mid2]: [
      { _id: 'msg_6', matchId: mid2, sender: { _id: 'profile_3', name: p3.name, photos: p3.photos }, content: "Ayo what's up! Match made in Goa heaven 🎉", createdAt: ago(60 * 4) },
      { _id: 'msg_7', matchId: mid2, sender: { _id: userId, name: 'You', photos: [] }, content: 'Haha hey! Love your bio — DJ life must be insane', createdAt: ago(60 * 4 - 5) },
      { _id: 'msg_8', matchId: mid2, sender: { _id: 'profile_3', name: p3.name, photos: p3.photos }, content: 'Come check out my set at Hilltop this Saturday 🎧', createdAt: ago(60 * 3) },
    ],
  };
};
