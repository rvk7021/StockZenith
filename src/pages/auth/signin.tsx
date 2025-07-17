import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  // Add a state to control message visibility for animation
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Automatically clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear error and fields on mode switch
  useEffect(() => {
    setError('');
    if (mode === 'signin') {
      setEmail('');
      setPassword('');
    }
  }, [mode]);

  // Show message when error changes
  useEffect(() => {
    if (error) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 2500);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [error]);

  if (status === 'authenticated') {
    return null; // or a spinner
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password. If you are not registered, please register.');
    } else if (res?.ok) {
      setError(''); // Clear any lingering messages
      router.replace('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { email, password });
      if (res.status === 201) {
        setLoading(false);
        setMode('signin');
        setError(''); // Clear message before showing sign-in
        setEmail(''); // Clear credentials
        setPassword('');
      }
    } catch (err: unknown) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('User already exists. Please sign in.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {mode === 'signin' ? 'Sign In' : 'Register'}
        </h1>
        <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister} className="space-y-4">
          <div>
            <label className="block text-blue-800 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-blue-800 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
            />
          </div>
          {/* Animated error/success message */}
          <div className={`transition-opacity duration-500 ease-in-out ${showMessage && error ? 'opacity-100' : 'opacity-0'} h-6`}> {/* h-6 to reserve space */}
            {error && <div className="text-red-600 text-center font-medium">{error}</div>}
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-indigo-600 transition-all" disabled={loading}>
            {loading ? (mode === 'signin' ? 'Signing In...' : 'Registering...') : (mode === 'signin' ? 'Sign In' : 'Register')}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === 'signin' ? (
            <span>
              Not registered?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => { setMode('register'); setError(''); }}>
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => { setMode('signin'); setError(''); }}>
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 