import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase'; // Adjust the path as needed
import { Line, Bar } from 'react-chartjs-2'; // Import Line and Bar charts from Chart.js
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
          const sanitizedEmail = user.email.replace(/[.+]/g, '_'); // Email sanitization
          const userDocRef = doc(firestore, 'carbonData', sanitizedEmail);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setSubmissions(data.submissions || []); // Retrieve the 'submissions' array
          } else {
            setSubmissions([]); // No submissions found for this user
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
  const energyData = {
    labels,
    datasets: [
      {
        label: 'Energy Consumption',
        data: energyConsumptionData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const fuelData = {
    labels,
    datasets: [
      {
        label: 'Fuel Consumption',
        data: fuelConsumptionData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const emissionsData = {
    labels,
    datasets: [
      {
        label: 'Total Emissions',
        data: totalEmissionsData,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };

  const travelData = {
    labels,
    datasets: [
      {
        label: 'Distance Travelled',
        data: distanceTraveledData,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        fill: true,
      },
    ],
  };

  const wasteProducedData = {
    labels,
    datasets: [
      {
        label: 'Total Waste Produced',
        data: totalWasteProducedData,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
      },
    ],
  };

  const recycleData = {
    labels,
    datasets: [
      {
        label: 'Total Waste Recycled',
        data: wasteRecycledData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-5">
        Your Previous Submissions (Graphical Representation)
      </h2>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Energy Consumption</h3>
        <Line data={energyData} />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Fuel Consumption</h3>
        <Bar data={fuelData} />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Distance Travelled</h3>
        <Bar data={travelData} />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Waste Produced</h3>
        <Bar data={wasteProducedData} />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Waste Recycled</h3>
        <Bar data={recycleData} />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 mb-5 max-w-2xl mx-auto">
        <h3 className="text-blue-600 text-center text-lg font-medium mb-2">Total Emissions</h3>
        <Line data={emissionsData} />
      </div>
    </div>
  );
};

export default UserSubmissions;