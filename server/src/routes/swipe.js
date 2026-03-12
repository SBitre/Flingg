const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Helper to get consistent match ID from two user IDs
const getMatchId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// POST /api/swipe/like/:userId
router.post('/like/:userId', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const targetUserId = req.params.userId;

    if (currentUser._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot like yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to likes if not already liked
    if (!currentUser.likes.includes(targetUserId)) {
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { likes: targetUserId },
        $pull: { passes: targetUserId },
      });
    }

    // Check if it's a match (target user also liked current user)
    const isMatch = targetUser.likes.includes(currentUser._id);

    if (isMatch) {
      const matchId = getMatchId(currentUser._id, targetUserId);

      // Add to both users' matches
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { matches: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { matches: currentUser._id },
      });

      const updatedCurrentUser = await User.findById(currentUser._id);

      return res.json({
        match: true,
        matchId,
        matchedUser: {
          _id: targetUser._id,
          name: targetUser.name,
          photos: targetUser.photos,
          age: targetUser.age,
          location: targetUser.location,
        },
        user: updatedCurrentUser,
      });
    }

    const updatedCurrentUser = await User.findById(currentUser._id);
    res.json({ match: false, user: updatedCurrentUser });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/swipe/pass/:userId
router.post('/pass/:userId', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const targetUserId = req.params.userId;

    await User.findByIdAndUpdate(currentUser._id, {
      $addToSet: { passes: targetUserId },
      $pull: { likes: targetUserId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Pass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
