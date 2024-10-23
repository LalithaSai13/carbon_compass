import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading
    try {
      if (isLogin) {
        await login(email, password);
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
    } catch (error: any) {
      console.error(error);
      setLoading(false); // Stop loading
      if (isLogin) {
        setError('Failed to log in. Please check your credentials or sign up.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <Leaf className="mx-auto h-12 w-auto text-green-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to Carbon Compass' : 'Sign up for Carbon Compass'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>
        {error && (
          <div style={{ color: 'red' }}>
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          </div>
        )}        
        <div className="text-center">
          <p className="text-center mt-2">
            Need an account?{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');navigate('/signup')}}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
