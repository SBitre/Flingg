const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');

const router = express.Router();

const getMatchId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// GET /api/matches — get all matches with last message
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).populate('matches', 'name photos age location lastActive');

    const matchesWithMessages = await Promise.all(
      currentUser.matches.map(async (matchedUser) => {
        const matchId = getMatchId(req.user._id, matchedUser._id);

        const lastMessage = await Message.findOne({ matchId })
          .sort({ createdAt: -1 })
          .populate('sender', 'name')
          .lean();

        const unreadCount = await Message.countDocuments({
          matchId,
          sender: matchedUser._id,
          read: false,
        });

        return {
          matchId,
          user: matchedUser,
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    // Sort by last message date (most recent first)
    matchesWithMessages.sort((a, b) => {
      const aDate = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
      const bDate = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
      return bDate - aDate;
    });

    res.json({ matches: matchesWithMessages });
  } catch (err) {
    console.error('Matches error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
