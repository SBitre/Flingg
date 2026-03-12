import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getMessages,
  addMessage,
  clearUnread,
  getProfileById,
  getRandomReply,
} from '../services/mockStore';

function Avatar({ user, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 bg-dark-4 border border-white/10 flex items-center justify-center`}>
      {user?.photos?.[0] ? (
        <img src={user.photos[0]} alt={user?.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

export default function Chat() {
  const { matchId: encodedMatchId } = useParams();
  const matchId = decodeURIComponent(encodedMatchId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [matchedUser, setMatchedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  // Derive the other user's profile ID from matchId
  const otherProfileId = matchId.split('|').find((id) => id !== user?._id);

  useEffect(() => {
    if (!user || !matchId) return;

    // Load messages
    const msgs = getMessages(user._id, matchId);
    setMessages(msgs);

    // Load matched user profile
    if (otherProfileId) {
      const profile = getProfileById(otherProfileId);
      setMatchedUser(profile);
    }

    // Clear unread count
    clearUnread(user._id, matchId);
  }, [user, matchId, otherProfileId]);

  // Scroll to bottom whenever messages or typing changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(() => {
    const content = input.trim();
    if (!content || !user) return;
    setInput('');

    const newMsg = {
      _id: `msg_${Date.now()}`,
      matchId,
      sender: { _id: user._id, name: user.name, photos: user.photos || [] },
      content,
      createdAt: new Date().toISOString(),
    };

    const updated = addMessage(matchId, newMsg);
    setMessages([...updated]);

    // Simulate the other person typing + auto-reply
    const replyDelay = 1500 + Math.random() * 2000;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => setIsTyping(true), 800);
    replyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        _id: `msg_${Date.now()}_reply`,
        matchId,
        sender: { _id: otherProfileId, name: matchedUser?.name, photos: matchedUser?.photos || [] },
        content: getRandomReply(),
        createdAt: new Date().toISOString(),
      };
      const withReply = addMessage(matchId, replyMsg);
      setMessages([...withReply]);
    }, replyDelay);
  }, [input, user, matchId, otherProfileId, matchedUser]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group consecutive messages from the same sender
  const groupMessages = (msgs) => {
    const groups = [];
    let current = null;
    msgs.forEach((msg) => {
      const sid = msg.sender?._id || msg.sender;
      if (!current || current.senderId !== sid) {
        current = { senderId: sid, isMe: sid === user?._id, messages: [msg] };
        groups.push(current);
      } else {
        current.messages.push(msg);
      }
    });
    return groups;
  };

  const groups = groupMessages(messages);

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-64px)] md:mt-16">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-2/90 backdrop-blur-sm border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate('/matches')}
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <Avatar user={matchedUser} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{matchedUser?.name || 'Match'}</p>
          {matchedUser?.location && (
            <p className="text-white/30 text-xs">📍 {matchedUser.location}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/30">
              {matchedUser?.photos?.[0] ? (
                <img src={matchedUser.photos[0]} alt={matchedUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-dark-4 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{matchedUser?.name?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
            <p className="text-white font-semibold mb-1">You matched with {matchedUser?.name}!</p>
            <p className="text-white/30 text-sm">Send the first message 👋</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {groups.map((group, gi) => (
            <motion.div
              key={`${group.senderId}-${gi}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${group.isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!group.isMe && (
                <div className="flex-shrink-0 mt-auto">
                  <Avatar user={matchedUser} size="sm" />
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[75%] ${group.isMe ? 'items-end' : 'items-start'}`}>
                {group.messages.map((msg, mi) => (
                  <div
                    key={msg._id || mi}
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      group.isMe
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-dark-3 text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                <span className="text-white/20 text-[10px] px-1">
                  {new Date(group.messages[group.messages.length - 1].createdAt)
                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex gap-2 items-center"
            >
              <Avatar user={matchedUser} size="sm" />
              <div className="bg-dark-3 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-white/40 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 bg-dark-2/90 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${matchedUser?.name || ''}...`}
              rows={1}
              className="input-field resize-none max-h-32 py-3 leading-snug"
              style={{ overflowY: 'auto' }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity mb-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
