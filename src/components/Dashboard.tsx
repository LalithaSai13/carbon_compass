import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calculator, Trophy, Lightbulb, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Welcome to Carbon Compass</h1>
          <p className="text-xl text-white mb-12">Track, reduce, and compete to lower your carbon footprint</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/calculator" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Calculator size={48} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Carbon Calculator</h2>
            <p className="text-gray-600 text-center">Estimate your carbon footprint and get personalized insights</p>
          </Link>
          
          <Link to="/leaderboard" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Trophy size={48} className="text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Leaderboard</h2>
            <p className="text-gray-600 text-center">See how you rank among other eco-warriors</p>
          </Link>
          
          <Link to="/insights" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Lightbulb size={48} className="text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Insights</h2>
            <p className="text-gray-600 text-center">View your personalized eco-friendly recommendations</p>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-white mb-4">Logged in as: {currentUser.email}</p>
          <button
            onClick={() => logout()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut size={20} className="mr-2" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}