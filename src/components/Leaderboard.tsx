import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboardQuery = query(
        collection(firestore, 'userInsights'),
        orderBy('points', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(leaderboardQuery);

      const leaderboardData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setLeaderboard(leaderboardData);
    };

    fetchLeaderboard();
  }, []);

  // Rest of the component remains the same
  // ...
}