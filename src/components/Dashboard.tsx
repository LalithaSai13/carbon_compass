import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Trophy, Lightbulb, LogOut, BookText } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4AA79C] to-[#FD6158] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          
          <h1 className="text-5xl font-bold text-white mb-8">
            Welcome to Carbon Compass
          </h1>
          <p className="text-lg text-white mb-10 max-w-2xl mx-auto">
            Track, reduce, and compete to lower your carbon footprint
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/carboncompass" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Compass size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333333] mb-2">Carbon Blog</h2>
            <p className="text-gray-600 text-center">Navigate Your Carbon Footprint: Discover, Reduce, and Sustain</p>
          </Link>
          
          <Link to="/carbonform" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <BookText size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333333] mb-2">Carbon Form</h2>
            <p className="text-gray-600 text-center">Submit/log your carbon footprint</p>
          </Link>
          
          <Link to="/leaderboard" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Trophy size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333333] mb-2">Leaderboard</h2>
            <p className="text-gray-600 text-center">See how you rank among other eco-warriors</p>
          </Link>
          
          <Link to="/insights" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Lightbulb size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333333] mb-2">Insights</h2>
            <p className="text-gray-600 text-center">View your personalized eco-friendly recommendations</p>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          {currentUser ? (
            <>
              <p className="text-white mb-4">Logged in as: {currentUser.email}</p>
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#FD6158] hover:bg-[#FD767E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FD6158]">
                <LogOut size={20} className="mr-2" />
                Log Out
              </button>
            </>
          ) : (
            <p className="text-white mb-4">You are not logged in.</p>
          )}
        </div>
      </div>
    </div>
  );
}
