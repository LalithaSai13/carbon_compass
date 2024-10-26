import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const UserSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.email) {
          const sanitizedEmail = user.email.replace(/[.+]/g, '_');
          const userDocRef = doc(firestore, 'carbonData', sanitizedEmail);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubmissions(data.submissions || []);
          } else {
            setSubmissions([]);
          }
        } else {
          throw new Error('User not logged in.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center text-lg">Error: {error}</div>;
  }

  if (submissions.length === 0) {
    return <div className="text-center text-lg">No submissions found.</div>;
  }

  // Prepare data for charts
  const labels = submissions.map((_, index) => `Submission ${index + 1}`);
  const energyConsumptionData = submissions.map(sub => sub.energyConsumption);
  const fuelConsumptionData = submissions.map(sub => sub.fuelConsumption);
  const totalEmissionsData = submissions.map(sub => sub.totalEmissions);
  const distanceTraveledData = submissions.map(sub => sub.distanceTraveled);
  const totalWasteProducedData = submissions.map(sub => sub.totalWasteProduced);
  const wasteRecycledData = submissions.map(sub => sub.wasteRecycled);

  // Chart data
  const energyData = { labels, datasets: [{ label: 'Energy Consumption', data: energyConsumptionData, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: true }] };
  const fuelData = { labels, datasets: [{ label: 'Fuel Consumption', data: fuelConsumptionData, backgroundColor: 'rgba(255, 99, 132, 0.5)' }] };
  const emissionsData = { labels, datasets: [{ label: 'Total Emissions', data: totalEmissionsData, borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', fill: true }] };
  const travelData = { labels, datasets: [{ label: 'Distance Travelled', data: distanceTraveledData, borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 0.2)', fill: true }] };
  const wasteProducedData = { labels, datasets: [{ label: 'Total Waste Produced', data: totalWasteProducedData, borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 0.2)', fill: true }] };
  const recycleData = { labels, datasets: [{ label: 'Total Waste Recycled', data: wasteRecycledData, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: true }] };

  return (
    
    <div className="p-5 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <h2 className="text-center text-4xl font-extrabold text-white mb-8 drop-shadow-lg">Your Previous Submissions</h2>
      <p className="text-center text-lg text-white mb-10">Graphical Representation of Your Data</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: 'Energy Consumption', data: energyData, component: <Line data={energyData} /> },
          { title: 'Fuel Consumption', data: fuelData, component: <Bar data={fuelData} /> },
          { title: 'Distance Travelled', data: travelData, component: <Bar data={travelData} /> },
          { title: 'Total Waste Produced', data: wasteProducedData, component: <Bar data={wasteProducedData} /> },
          { title: 'Total Waste Recycled', data: recycleData, component: <Bar data={recycleData} /> },
          { title: 'Total Emissions', data: emissionsData, component: <Line data={emissionsData} /> },

        ].map((chart, index) => (
          <div key={index} className="bg-white border border-gray-300 rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-blue-600 text-center text-lg font-medium mb-3">{chart.title}</h3>
            {chart.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSubmissions;