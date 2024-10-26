import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For displaying errors
  const [loading, setLoading] = useState(false); // Loading state
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous error message
    setLoading(true); // Start loading
    try {
      await signup(email, password);
      alert('Signup successful!');
      navigate('/dashboard'); // Navigate to dashboard after successful signup
    } catch (error) {
      setLoading(false); // Stop loading
      
      if (error instanceof FirebaseError) {
        // Check for specific error codes (assuming you're using Firebase)
        if (error.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists. Please log in.');
        } else {
          setError('Sign-up failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
        <div>
          <Leaf className="mx-auto h-12 w-auto text-green-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            Sign up for Carbon Compass
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className="relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
            >
              {loading ? 'Loading...' : 'Sign up'}
            </button>
          </div>
        </form>
        {error && (
          <div>
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-center mt-2">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-green-600 hover:text-green-500 transition duration-200"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;