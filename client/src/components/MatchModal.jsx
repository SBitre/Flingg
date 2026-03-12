import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MatchModal({ matchData, onClose }) {
  const { user } = useAuth();
  if (!matchData) return null;

  const { matchId, matchedUser } = matchData;

  const myPhoto = user?.photos?.[0];
  const theirPhoto = matchedUser?.photos?.[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.92)' }}
        onClick={onClose}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="orb orb-red"
            style={{ width: 400, height: 400, top: '20%', left: '20%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative text-center max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Match text */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/60 text-lg tracking-widest uppercase font-light mb-1">It's a</p>
            <h1 className="font-display text-7xl font-bold text-gradient mb-2">Match!</h1>
            <p className="text-white/50 text-sm mb-8">
              You and <span className="text-white font-medium">{matchedUser?.name}</span> liked each other
            </p>
          </motion.div>

          {/* Photos */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/30">
                {myPhoto ? (
                  <img src={myPhoto} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-dark-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl"
            >
              ❤️
            </motion.div>

            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/30">
                {theirPhoto ? (
                  <img src={theirPhoto} alt={matchedUser?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-dark-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{matchedUser?.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to={`/chat/${matchId}`}
              className="btn-primary text-center"
              onClick={onClose}
            >
              Send a Message
            </Link>
            <button onClick={onClose} className="btn-ghost text-white/50">
              Keep Swiping
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
