import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Insights() {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (currentUser) {
        const insightsQuery = query(
          collection(firestore, 'userInsights'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(insightsQuery);

        const insightsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setInsights(insightsData);
      }
    };

    fetchInsights();
  }, [currentUser]);

  // Rest of the component remains the same
  // ...
}