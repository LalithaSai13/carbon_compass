import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Trophy, Lightbulb, LogOut, BookText, Flame, CheckCircle } from 'lucide-react';
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"; 

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const db = getFirestore();

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        try {
          const userDoc = doc(db, "users", currentUser.uid);
          const docSnapshot = await getDoc(userDoc);

          if (docSnapshot.exists()) {
            // Set existing data if available
            const data = docSnapshot.data();
            setTotalEmissions(data.totalEmissions || 0);
            setRewardPoints(data.rewardPoints || 0);
          } else {
            // Initialize data to zero if it’s the user’s first login
            await setDoc(userDoc, { totalEmissions: 0, rewardPoints: 0 });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [currentUser, db]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f0f0] to-[#e8e8e8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#333] mb-8">
            Welcome to Carbon Compass
          </h1>
          <p className="text-lg text-[#555] mb-10 max-w-2xl mx-auto">
            Track, reduce, and compete to lower your carbon footprint
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/carboncompass" className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Compass size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333] mb-2">Carbon Blog</h2>
            <p className="text-gray-600 text-center">Navigate Your Carbon Footprint: Discover, Reduce, and Sustain</p>
          </Link>

          <Link to="/carbonform" className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <BookText size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333] mb-2">Carbon Form</h2>
            <p className="text-gray-600 text-center">Submit/log your carbon footprint</p>
          </Link>

          <Link to="/leaderboard" className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Trophy size={48} className="text-[#4AA79C] mb-4" />
            <h2 className="text-2xl font-semibold text-[#333] mb-2">Leaderboard</h2>
            <p className="text-gray-600 text-center">See how you rank among other eco-warriors</p>
          </Link>

          <Link to="/insights" className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center transition duration-300 ease-in-out transform hover:scale-105">
            <Lightbulb size={48} className="text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Insights</h2>
            <p className="text-gray-600 text-center">View and track your personalized eco-friendly insights</p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="flex justify-center space-x-8 mb-4">
            <div className="flex flex-col items-center">
              <Flame size={48} className="text-[#FF4500] mb-2" />
              <p className="text-xl font-semibold text-[#333]">{totalEmissions} kg CO₂</p>
              <p className="text-gray-600">Total Emissions</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle size={48} className="text-[#4AA79C] mb-2" />
              <p className="text-xl font-semibold text-[#333]">{rewardPoints} pts</p>
              <p className="text-gray-600">Reward Points</p>
            </div>
          </div>

          {currentUser ? (
            <>
              <p className="text-[#333] mb-4">Logged in as: {currentUser.email}</p>
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#4AA79C] hover:bg-[#4AA79C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4AA79C]">
                <LogOut size={20} className="mr-2" />
                Log Out
              </button>
            </>
          ) : (
            <p className="text-[#333] mb-4">You are not logged in.</p>
          )}
        </div>
      </div>
    </div>
  );
}