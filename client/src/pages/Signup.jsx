import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email) return setError('Email is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.name.trim());
      navigate(user.profileComplete ? '/swipe' : '/profile-setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-red" style={{ width: 500, height: 500, top: '-5%', right: '-5%' }} />
        <div className="orb orb-dark-red" style={{ width: 400, height: 400, bottom: '0', left: '-10%' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-4xl font-bold text-primary tracking-widest">
            Flingg
          </Link>
          <p className="text-white/40 mt-2 font-light">Create your account</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="What should we call you?"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/30 text-primary text-sm rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/30 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-white/20 text-xs text-center mt-4">
            By signing up, you confirm you're 18 or older.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
