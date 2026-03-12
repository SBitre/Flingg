import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../services/mockStore';

const GOA_AREAS = ['Calangute', 'Baga', 'Anjuna', 'Panjim', 'Vagator', 'Morjim', 'Other'];
const GENDERS = ['male', 'female', 'non-binary', 'other'];
const INTERESTS = ['male', 'female', 'non-binary', 'other', 'everyone'];

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    interestedIn: user?.interestedIn || ['everyone'],
    bio: user?.bio || '',
    location: user?.location || 'Other',
  });
  const [photos, setPhotos] = useState(user?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleInterest = (val) => {
    setForm((f) => {
      const current = f.interestedIn;
      if (val === 'everyone') return { ...f, interestedIn: ['everyone'] };
      const without = current.filter((v) => v !== 'everyone');
      if (without.includes(val)) {
        const next = without.filter((v) => v !== val);
        return { ...f, interestedIn: next.length ? next : ['everyone'] };
      }
      return { ...f, interestedIn: [...without, val] };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 6) return setError('Maximum 6 photos allowed');

    setUploading(true);
    setError('');
    try {
      const dataUrl = await compressImage(file);
      const newPhotos = [...photos, dataUrl];
      setPhotos(newPhotos);
      // Persist immediately
      const updated = { ...user, photos: newPhotos };
      updateUser(updated);
    } catch {
      setError('Failed to process image. Try another file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (idx) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    updateUser({ ...user, photos: newPhotos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) return setError('Name is required');
    if (!form.age || Number(form.age) < 18) return setError('You must be 18 or older');
    if (!form.gender) return setError('Please select your gender');
    if (photos.length === 0) return setError('Please add at least one photo');

    setSaving(true);
    try {
      const profileComplete = !!(form.name && form.age && form.gender && photos.length > 0);
      const updated = {
        ...user,
        ...form,
        age: Number(form.age),
        photos,
        profileComplete,
      };
      updateUser(updated);
      setSuccess('Profile saved!');
      setTimeout(() => navigate('/swipe'), 700);
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pt-20 px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-red" style={{ width: 400, height: 400, top: '10%', right: '-5%' }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-4xl font-bold text-white mb-1">Your Profile</h1>
          <p className="text-white/40 mb-8">Let's show them who you are</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photos */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-4">
              Photos <span className="text-white/30 font-normal text-sm">(up to 6)</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Main
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-primary/50 flex flex-col items-center justify-center text-white/30 hover:text-primary transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-2xl">+</span>
                      <span className="text-xs mt-1">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-white/20 text-xs mt-3">
              Photos are stored locally in your browser — no server needed.
            </p>
          </motion.section>

          {/* Basic Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-white font-semibold">About You</h2>

            <div>
              <label className="block text-white/60 text-sm mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="input-field"
                placeholder="18"
                min="18"
                max="80"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gender: g }))}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                      form.gender === g
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Interested In</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-2 px-4 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                      form.interestedIn.includes(interest)
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Bio & Location */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-white font-semibold">Bio & Location</h2>

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Bio <span className="text-white/20">({form.bio.length}/300)</span>
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="input-field resize-none"
                rows={3}
                placeholder="Tell people what makes you interesting..."
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Where in Goa?</label>
              <div className="grid grid-cols-2 gap-2">
                {GOA_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, location: area }))}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      form.location === area
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    📍 {area}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3"
            >
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-base disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Profile & Start Swiping →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
