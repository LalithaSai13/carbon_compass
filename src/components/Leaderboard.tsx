import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Adjust the path as necessary
import { collection, getDocs } from 'firebase/firestore';

interface UserEmissions {
  userId: string; // Assuming you want to display user IDs or usernames
  averageEmissions: number;
  cumulativeEmissions: number;
  submissionCount: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserEmissions[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const carbonDataRef = collection(firestore, 'carbonData'); // Adjust collection name if necessary
        const snapshot = await getDocs(carbonDataRef);

        const userEmissions: { [key: string]: { cumulativeEmissions: number; submissionCount: number } } = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          const userId = doc.id; // Get user ID from the document
          const cumulativeEmissions = parseFloat(data.cumulativeEmissions) || 0;
          const submissionCount = data.submissionCount || 1; // Avoid division by zero

          // Initialize if the user ID is not already in the object
          if (!userEmissions[userId]) {
            userEmissions[userId] = { cumulativeEmissions: 0, submissionCount: 0 };
          }

          // Accumulate emissions and count submissions
          userEmissions[userId].cumulativeEmissions += cumulativeEmissions;
          userEmissions[userId].submissionCount += submissionCount;
        });

        // Calculate averages and create leaderboard data
        const leaderboard: UserEmissions[] = Object.entries(userEmissions).map(([userId, { cumulativeEmissions, submissionCount }]) => {
          const average = cumulativeEmissions / submissionCount; // Calculate average emissions
          return { userId, averageEmissions: average, cumulativeEmissions, submissionCount };
        });

        // Sort by average emissions
        leaderboard.sort((a, b) => a.averageEmissions - b.averageEmissions);
        setLeaderboardData(leaderboard);

      } catch (error) {
        console.error("Error fetching leaderboard data: ", error);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Leaderboard</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-500 text-white">
            <th className="py-2">User ID</th>
            <th className="py-2">Average Emissions</th>
            <th className="py-2">Cumulative Emissions</th>
            <th className="py-2">Submission Count</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4">No data available</td>
            </tr>
          ) : (
            leaderboardData.map((user) => (
              <tr key={user.userId} className="border-b">
                <td className="py-2 text-center">{user.userId}</td>
                <td className="py-2 text-center">{user.averageEmissions.toFixed(2)} kg</td>
                <td className="py-2 text-center">{user.cumulativeEmissions.toFixed(2)} kg</td>
                <td className="py-2 text-center">{user.submissionCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
