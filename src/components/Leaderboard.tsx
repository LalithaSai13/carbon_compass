import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface UserEmissions {
  userId: string; // This will be the user email
  userName: string; // This will also be the user email
  averageEmissions: number;
  cumulativeEmissions: number;
  submissionCount: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<UserEmissions[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const carbonDataRef = collection(firestore, 'carbonData');
        const snapshot = await getDocs(carbonDataRef);

        const userEmissions: { [key: string]: { cumulativeEmissions: number; submissionCount: number } } = {};

        // Fetch emissions data
        snapshot.forEach((doc) => {
          const data = doc.data();
          const userId = doc.id; // Use document ID (email) as user ID
          const cumulativeEmissions = parseFloat(data.totalEmissions) || 0; // Adjusted to match your structure
          const submissionCount = data.submissionCount || 1;

          if (!userEmissions[userId]) {
            userEmissions[userId] = { cumulativeEmissions: 0, submissionCount: 0 };
          }

          userEmissions[userId].cumulativeEmissions += cumulativeEmissions;
          userEmissions[userId].submissionCount += submissionCount;
        });

        // Construct leaderboard data
        const leaderboard: UserEmissions[] = Object.entries(userEmissions).map(([userId, { cumulativeEmissions, submissionCount }]) => {
          const average = cumulativeEmissions / submissionCount; // Calculate average emissions
          return { userId, userName: userId, averageEmissions: average, cumulativeEmissions, submissionCount }; // Use userId as userName
        });

        leaderboard.sort((a, b) => a.averageEmissions - b.averageEmissions);
        setLeaderboardData(leaderboard);

      } catch (error) {
        console.error("Error fetching leaderboard data: ", error);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h2 className="text-4xl font-semibold text-center text-gray-700 mb-6">Carbon Emissions Leaderboard</h2>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">User Name (Email)</th>
              <th className="py-3 px-4 text-left">Average Emissions (kg)</th>
              <th className="py-3 px-4 text-left">Cumulative Emissions (kg)</th>
              <th className="py-3 px-4 text-left">Submission Count</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No data available</td>
              </tr>
            ) : (
              leaderboardData.map((user, index) => (
                <tr key={user.userId} className="border-b hover:bg-gray-100 transition duration-300">
                  <td className="py-3 px-4 text-center text-gray-700 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-700">{user.userName}</td>
                  <td className="py-3 px-4 text-gray-700">{user.averageEmissions.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-700">{user.cumulativeEmissions.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-700">{user.submissionCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
