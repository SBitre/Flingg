import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDiscoverProfiles, swipeLike, swipePass } from '../services/mockStore';
import MatchModal from '../components/MatchModal';

const GOA_AREAS = ['All', 'Calangute', 'Baga', 'Anjuna', 'Panjim', 'Vagator', 'Morjim'];

function SwipeCard({ profile, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-30, 30]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -30], [1, 0]);
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);
  const [imgIndex, setImgIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('like', profile._id);
    else if (info.offset.x < -100) onSwipe('pass', profile._id);
  };

  const photos = profile.photos?.length ? profile.photos : [];
  const currentPhoto = photos[imgIndex] || null;

  const nextPhoto = (e) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % Math.max(photos.length, 1));
  };
  const prevPhoto = (e) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + Math.max(photos.length, 1)) % Math.max(photos.length, 1));
  };

  return (
    <motion.div
      style={{ x, rotate, opacity: isTop ? cardOpacity : 1 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-dark-3">
        {/* Photo */}
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-3 to-dark-4 flex items-center justify-center">
            <span className="text-8xl font-display font-bold text-primary opacity-30">
              {profile.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Photo tap areas */}
        {photos.length > 1 && (
          <>
            <button className="absolute left-0 top-0 w-1/2 h-full z-10 opacity-0" onClick={prevPhoto} />
            <button className="absolute right-0 top-0 w-1/2 h-full z-10 opacity-0" onClick={nextPhoto} />
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-20">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    i === imgIndex ? 'bg-white w-5' : 'bg-white/40 w-3'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Like / Nope stamps */}
        {isTop && (
          <>
            <motion.div style={{ opacity: likeOpacity }} className="swipe-like z-30">Like</motion.div>
            <motion.div style={{ opacity: nopeOpacity }} className="swipe-nope z-30">Nope</motion.div>
          </>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="font-display text-3xl font-bold text-white">{profile.name}</h2>
                <span className="text-white/70 text-xl font-light">{profile.age}</span>
              </div>
              {profile.location && (
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <span>📍</span> {profile.location}
                </p>
              )}
              {profile.bio && !expanded && (
                <p className="text-white/70 text-sm mt-2 line-clamp-2">{profile.bio}</p>
              )}
            </div>
            {profile.bio && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0 ml-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          <AnimatePresence>
            {expanded && profile.bio && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-white/70 text-sm mt-2 leading-relaxed">{profile.bio}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeDeck() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [locationFilter, setLocationFilter] = useState('All');
  const [matchData, setMatchData] = useState(null);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (user) {
      setProfiles(getDiscoverProfiles(user._id, locationFilter));
    }
  }, [user, locationFilter]);

  const handleSwipe = useCallback((direction, profileId) => {
    if (swiping) return;
    setSwiping(true);

    // Remove from deck immediately
    setProfiles((prev) => prev.filter((p) => p._id !== profileId));

    if (direction === 'like') {
      const result = swipeLike(user._id, profileId);
      if (result.match) {
        setMatchData({ matchId: result.matchId, matchedUser: result.matchedUser });
      }
    } else {
      swipePass(profileId);
    }

    setSwiping(false);
  }, [swiping, user]);

  const currentProfile = profiles[profiles.length - 1];
  const nextProfile = profiles[profiles.length - 2];
  const thirdProfile = profiles[profiles.length - 3];

  if (!user?.profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 md:pt-16 pb-24">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="font-display text-3xl text-white mb-3">Complete your profile</h2>
          <p className="text-white/40 mb-6">Add photos and info to start swiping</p>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:pt-16 pb-24 md:pb-8">
      {/* Location filter */}
      <div className="sticky top-0 md:top-16 z-30 bg-dark/90 backdrop-blur-sm px-4 py-3 border-b border-white/5">
        <div className="max-w-lg mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {GOA_AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setLocationFilter(area)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
                locationFilter === area
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {area === 'All' ? '🌊 All Goa' : `📍 ${area}`}
            </button>
          ))}
        </div>
      </div>

      {/* Deck */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-sm">
          {profiles.length === 0 ? (
            <div className="aspect-[3/4] flex items-center justify-center glass rounded-3xl">
              <div className="text-center p-8">
                <div className="text-6xl mb-4 animate-float inline-block">🌊</div>
                <h3 className="font-display text-2xl text-white mb-2">That's everyone!</h3>
                <p className="text-white/40 text-sm mb-6">
                  You've seen all profiles in {locationFilter === 'All' ? 'Goa' : locationFilter}
                </p>
                <button
                  onClick={() => setProfiles(getDiscoverProfiles(user._id, locationFilter))}
                  className="btn-primary text-sm py-2 px-6"
                >
                  See them again
                </button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/4]">
              {thirdProfile && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: 'scale(0.92) translateY(8px)', zIndex: 1 }}>
                  <div className="w-full h-full bg-dark-4 rounded-3xl" />
                </div>
              )}
              {nextProfile && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: 'scale(0.96) translateY(4px)', zIndex: 2 }}>
                  <SwipeCard key={nextProfile._id} profile={nextProfile} onSwipe={handleSwipe} isTop={false} />
                </div>
              )}
              {currentProfile && (
                <div className="absolute inset-0" style={{ zIndex: 3 }}>
                  <AnimatePresence>
                    <SwipeCard key={currentProfile._id} profile={currentProfile} onSwipe={handleSwipe} isTop />
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          {profiles.length > 0 && currentProfile && (
            <div className="flex items-center justify-center gap-5 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('pass', currentProfile._id)}
                disabled={swiping}
                className="w-14 h-14 rounded-full bg-dark-3 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all shadow-lg disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('like', currentProfile._id)}
                disabled={swiping}
                className="w-10 h-10 rounded-full bg-dark-3 border border-primary/30 flex items-center justify-center text-primary/60 hover:text-primary hover:border-primary transition-all shadow-md disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('like', currentProfile._id)}
                disabled={swiping}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-light transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.button>
            </div>
          )}

          {profiles.length > 0 && (
            <p className="text-center text-white/20 text-xs mt-4">
              {profiles.length} {profiles.length === 1 ? 'person' : 'people'} to discover
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {matchData && (
          <MatchModal matchData={matchData} onClose={() => setMatchData(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
