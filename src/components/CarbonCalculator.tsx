import React from 'react';
import { Compass } from 'lucide-react'; // Import the compass icon

const CarbonCompass: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-6">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-6xl w-full">
        <div className="flex items-center mb-6">
          <Compass className="w-12 h-12 text-green-500 mr-3" />
          <h1 className="text-5xl font-bold text-gray-800">Carbon Compass</h1>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          Carbon footprints measure the total greenhouse gases emitted directly and indirectly by our activities. These emissions, primarily in the form of carbon dioxide (CO₂), significantly contribute to climate change, impacting ecosystems and human health across the globe. Understanding our carbon footprint is crucial for mitigating these effects and fostering a sustainable future.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Every action we take—whether driving a car, using electricity in our homes, or consuming goods—leaves a carbon footprint. This impact can vary dramatically depending on our choices. For example, choosing public transportation over personal vehicles can significantly reduce individual emissions. However, many people are unaware of the cumulative effect of their daily habits. By raising awareness about carbon footprints, we can promote more environmentally-friendly choices.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Carbon Compass aims to be a guiding tool for individuals and businesses alike. Our platform helps you measure and calculate your carbon emissions through an easy-to-use interface. By assessing your daily habits and energy consumption, Carbon Compass empowers you to make informed decisions that benefit both the environment and your wallet.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          One of the key features of Carbon Compass is the provision of tailored reduction strategies. After calculating your emissions, the platform suggests actionable steps to reduce your footprint. Whether it’s adopting energy-efficient appliances, using renewable energy sources, or changing travel habits, Carbon Compass provides insights to help you make a positive impact.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Beyond individual actions, we recognize the importance of collective effort. Carbon emissions are a global issue that requires collaboration among communities, organizations, and governments. Carbon Compass also aims to connect users with local initiatives and programs dedicated to sustainability, making it easier to engage in community efforts.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          As we move forward, it’s essential to understand that every small action contributes to a larger change. Whether it's choosing to recycle, reducing water usage, or conserving energy, every effort counts. With Carbon Compass, you have a reliable partner to guide you through your sustainability journey. Together, we can work towards a healthier planet and a more sustainable future.
        </p>
        <p className="text-lg text-gray-700">
          Start your journey today, and let Carbon Compass help you navigate the path towards a lower carbon footprint. By making informed choices and adopting sustainable practices, we can all contribute to a better world for ourselves and future generations.
        </p>
      </div>
    </div>
  );
};

export default CarbonCompass;
