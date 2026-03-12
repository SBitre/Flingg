import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../services/mockStore';

function timeAgo(date) {
  if (!date) return '';
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ user, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const textClass = size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 bg-dark-4 border border-white/10 flex items-center justify-center`}>
      {user?.photos?.[0] ? (
        <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span className={`${textClass} font-bold text-primary`}>{user?.name?.[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default function Matches() {
  const { user } = useAuth();
  const location = useLocation(); // re-run on every visit
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (user) {
      const m = getMatches(user._id);
      // Sort: most recent message first, then no-message matches last
      m.sort((a, b) => {
        const aDate = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
        const bDate = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
        return bDate - aDate;
      });
      setMatches(m);
    }
  }, [user, location.key]); // location.key changes on every navigation

  return (
    <div className="min-h-screen md:pt-16 pb-24 md:pb-8">
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-4xl font-bold text-white">Matches</h1>
          <p className="text-white/40 text-sm mt-1">
            {matches.length} {matches.length === 1 ? 'connection' : 'connections'}
          </p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center mt-8"
          >
            <div className="text-5xl mb-4 animate-float inline-block">💫</div>
            <h3 className="font-display text-2xl text-white mb-2">No matches yet</h3>
            <p className="text-white/40 text-sm mb-6">Start swiping to find your connections</p>
            <Link to="/swipe" className="btn-primary text-sm py-2 px-6">
              Discover People
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-1">
              {matches.map((match, i) => (
                <motion.div
                  key={match.matchId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/chat/${encodeURIComponent(match.matchId)}`}
                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <Avatar user={match.user} />
                      {match.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">
                            {match.unreadCount > 9 ? '9+' : match.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`font-semibold text-sm truncate ${match.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                          {match.user?.name}
                        </p>
                        {match.lastMessage && (
                          <span className="text-white/30 text-xs flex-shrink-0">
                            {timeAgo(match.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${
                        match.unreadCount > 0 ? 'text-white/60 font-medium' : 'text-white/30'
                      }`}>
                        {match.lastMessage
                          ? match.lastMessage.content
                          : `📍 ${match.user?.location || 'Goa'} · Say hi!`}
                      </p>
                    </div>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-4 h-4 text-white/20 group-hover:text-white/40 flex-shrink-0 transition-colors"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
