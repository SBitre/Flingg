const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

// PUT /api/users/profile — update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, age, gender, interestedIn, bio, location } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (age) updates.age = Number(age);
    if (gender) updates.gender = gender;
    if (interestedIn) updates.interestedIn = Array.isArray(interestedIn) ? interestedIn : [interestedIn];
    if (bio !== undefined) updates.bio = bio;
    if (location) updates.location = location;

    // Mark profile as complete if all required fields are filled
    const user = req.user;
    const merged = { ...user.toObject(), ...updates };
    if (merged.name && merged.age && merged.gender && merged.photos && merged.photos.length > 0) {
      updates.profileComplete = true;
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/photo — upload a photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (user.photos.length >= 6) {
      return res.status(400).json({ message: 'Maximum 6 photos allowed' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    user.photos.push(photoUrl);

    // Check if profile is now complete
    if (user.name && user.age && user.gender && user.photos.length > 0) {
      user.profileComplete = true;
    }

    await user.save();
    res.json({ photoUrl, user });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/photo — remove a photo
router.delete('/photo', auth, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const user = await User.findById(req.user._id);

    user.photos = user.photos.filter((p) => p !== photoUrl);

    // Try to delete file from disk
    if (photoUrl && photoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../../', photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/discover — get users to swipe on
router.get('/discover', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    const { location } = req.query;

    // Build query: exclude self, already liked, already passed
    const excludeIds = [
      currentUser._id,
      ...currentUser.likes,
      ...currentUser.passes,
      ...currentUser.matches,
    ];

    const query = {
      _id: { $nin: excludeIds },
      profileComplete: true,
      age: { $exists: true, $gte: 18 },
    };

    if (location && location !== 'All') {
      query.location = location;
    }

    const users = await User.find(query)
      .select('name age gender bio photos location')
      .limit(30)
      .lean();

    res.json({ users });
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id — get a user's public profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name age gender bio photos location')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
