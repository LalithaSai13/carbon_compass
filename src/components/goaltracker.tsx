import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ReactMarkdown from 'react-markdown';

const GoalTracker: React.FC = () => {
  const [reward, setRewards] = useState<number>(0);
  const [goal, setGoal] = useState<number>(100); // Default goal
  const [progress, setProgress] = useState<number>(0);
  const [lastStrategy, setLastStrategy] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<number>(100);

  useEffect(() => {
    const fetchRewardsAndStrategy = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.email) {
          const sanitizedEmail = user.email.replace(/[.+]/g, '_');
          const docRef = doc(firestore, 'carbonData', sanitizedEmail);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const rewardsValue = data.rewardPoints || 0; // Use 0 as fallback
            const submissions = data.submissions || [];

            setRewards(rewardsValue);
            setLastStrategy(submissions.length > 0 ? submissions[submissions.length - 1].strategy || null : null);
            
            if (goal > 0) {
              const calculatedProgress = (rewardsValue / goal) * 100;
              setProgress(calculatedProgress);
            } else {
              setProgress(0);
            }
          } else {
            console.error("No document found for the user.");
          }
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      }
    };

    fetchRewardsAndStrategy();
  }, [goal]);

  const handleGoalChange = () => {
    setGoal(newGoal);
  };

  return (
    <div className="flex flex-col items-center mt-12">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-6xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Credit Points Goal Tracker</h1>
        
        <div className="flex justify-center items-center mb-6">
          <div style={{ width: 180, height: 180 }}>
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              styles={buildStyles({
                textColor: '#3b82f6',
                pathColor: '#10b981',
                trailColor: '#d1d5db',
              })}
            />
          </div>
        </div>

        <p className="text-lg font-semibold mb-4 text-gray-600 text-center">
          Total Rewards: {reward.toFixed(2)} / Goal: {goal} points
        </p>

        {/* Goal input */}
        <div className="flex justify-center items-center mb-8">
          <input
            type="number"
            min="1"
            value={newGoal}
            onChange={(e) => setNewGoal(Number(e.target.value))}
            className="w-24 p-2 border border-gray-300 rounded-lg mr-2 text-center focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Set Goal"
          />
          <button
            onClick={handleGoalChange}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Set Goal
          </button>
        </div>

        {/* Last submitted strategy */}
        {lastStrategy && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg shadow-md p-6 max-w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Latest Strategy</h2>
            <ReactMarkdown className="text-gray-700">{lastStrategy}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
