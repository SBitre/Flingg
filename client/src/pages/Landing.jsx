import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GOA_AREAS = ['Calangute', 'Baga', 'Anjuna', 'Panjim', 'Vagator', 'Morjim'];

const features = [
  {
    icon: '🔥',
    title: 'Swipe with Intent',
    desc: 'Tinder-style matching designed for Goa\'s free-spirited crowd',
  },
  {
    icon: '📍',
    title: 'Hyperlocal',
    desc: 'Filter by beach and neighbourhood — find who\'s near you right now',
  },
  {
    icon: '💬',
    title: 'Real-time Chat',
    desc: 'Instant messaging the moment you match — no waiting, no delays',
  },
  {
    icon: '✨',
    title: 'No Judgement',
    desc: 'A safe, open space for every vibe, every preference',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dark">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-red" style={{ width: 600, height: 600, top: '-10%', right: '-10%' }} />
        <div className="orb orb-dark-red" style={{ width: 500, height: 500, bottom: '10%', left: '-15%' }} />
        <div className="orb orb-red" style={{ width: 300, height: 300, top: '40%', left: '40%', opacity: 0.5 }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-3xl font-bold text-primary tracking-widest"
        >
          Flingg
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/login" className="btn-ghost text-white/70">Sign in</Link>
          <Link to="/signup" className="btn-primary py-2 px-6 text-sm">Join Free</Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-medium tracking-wide">Now live in Goa</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 variants={item} className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-none mb-6">
            <span className="text-white">What happens</span>
            <br />
            <span className="text-white">in Goa,</span>
            <br />
            <em className="text-gradient not-italic">starts on Flingg.</em>
          </motion.h1>

          <motion.p variants={item} className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The dating app built for Goa's energy — sun-drenched beaches, late-night parties,
            and connections that feel electric. Find your vibe.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup" className="btn-primary text-lg py-4 px-10 shadow-lg shadow-primary/20">
              Start Swiping
            </Link>
            <Link to="/login" className="btn-outline text-lg py-4 px-10">
              Sign In
            </Link>
          </motion.div>

          {/* Location Chips */}
          <motion.div variants={item} className="flex flex-wrap gap-2 justify-center">
            <span className="text-white/30 text-sm mr-2 self-center">Active in</span>
            {GOA_AREAS.map((area) => (
              <span
                key={area}
                className="bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                📍 {area}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
              Made for <em className="text-primary not-italic">Goa</em>
            </h2>
            <p className="text-white/40 text-lg">Everything you need, nothing you don't.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 md:p-16"
        >
          <div className="text-5xl mb-6 animate-float inline-block">🌊</div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
            The beach is waiting
          </h2>
          <p className="text-white/40 text-lg mb-8">
            Sign up free. Start swiping in minutes.
          </p>
          <Link to="/signup" className="btn-primary text-lg py-4 px-12 shadow-xl shadow-primary/20 inline-block">
            Join Flingg
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/20 text-sm font-display italic text-lg">
          "What happens in Goa, starts on Flingg"
        </p>
        <p className="text-white/10 text-xs mt-2">© 2025 Flingg. For adults 18+ only.</p>
      </footer>
    </div>
  );
}
