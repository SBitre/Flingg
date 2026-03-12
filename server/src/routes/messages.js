const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

const getMatchId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// GET /api/messages/:matchId — get messages for a match
router.get('/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify current user is part of this match
    const userIds = matchId.split('_');
    if (!userIds.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await Message.find({ matchId })
      .populate('sender', 'name photos')
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages from other user as read
    const otherUserId = userIds.find((id) => id !== req.user._id.toString());
    await Message.updateMany(
      { matchId, sender: otherUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/messages/:matchId — send a message (REST fallback)
router.post('/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content required' });
    }

    // Verify current user is part of this match
    const userIds = matchId.split('_');
    if (!userIds.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = new Message({
      matchId,
      sender: req.user._id,
      content: content.trim(),
    });

    await message.save();
    await message.populate('sender', 'name photos');

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
