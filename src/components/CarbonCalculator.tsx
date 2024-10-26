import React from 'react';
import { Compass, BookText, Target, Lightbulb, BarChart2 } from 'lucide-react';

const CarbonCompass: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-12 max-w-4xl w-full">
        <div className="flex items-center mb-8">
          <Compass className="w-14 h-14 text-gray-800 mr-4" />
          <h1 className="text-5xl font-extrabold text-gray-900">Carbon Compass</h1>
        </div>

        {/* Aim Section */}
        <div className="mb-10">
          <div className="flex items-center">
            <BookText className="w-10 h-10 text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Aim</h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-600 mt-3">
          To develop "Carbon Compass," an interactive platform that empowers individuals and businesses to understand and reduce their carbon footprints. By providing a comprehensive carbon footprint calculator, personalized insights, and a competitive leaderboard, the platform encourages proactive environmental stewardship. Individuals will be motivated to reduce their emissions through friendly competition, while businesses can earn carbon credits and rewards for significant reductions, fostering a community dedicated to sustainability and climate action.
          </p>
        </div>

        {/* Carbon Form and Calculator Section */}
        <div className="mb-10">
          <div className="flex items-center">
            <BarChart2 className="w-10 h-10 text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Carbon Form and Calculator</h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-600 mt-3">
          The Carbon Footprint Calculator in "Carbon Compass" estimates emissions for individuals and organizations by analyzing data on distance traveled, transportation methods, energy consumption, and supply chain activities from the carbon form filled by the user. It also considers waste generation and lifestyle choices like dietary habits. By integrating these diverse inputs, the calculator provides accurate emissions estimates, empowering users to identify areas for improvement and track their progress toward reducing their carbon footprint and achieving sustainability goals.
          </p>
        </div>

        {/* Competitive Leaderboard Section */}
        <div className="mb-10">
          <div className="flex items-center">
            <Target className="w-10 h-10 text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Competitive Leaderboard</h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-600 mt-3">
          The Carbon Compass features a competitive leaderboard designed to foster friendly competition among individuals focused on reducing their carbon footprints. This dynamic leaderboard showcases each user's position based on their emissions reductions, highlighting their achievements and encouraging active participation in sustainability efforts. Users can easily track their rank relative to others, motivating them to improve their carbon footprint continuously. This feature is exclusively available for individuals, creating a supportive community that celebrates progress and promotes collective environmental responsibility.
          </p>
        </div>

        {/* Insights Section */}
        <div className="mb-10">
          <div className="flex items-center">
            <Lightbulb className="w-10 h-10 text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Insights</h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-600 mt-3">
          The insights page in "Carbon Compass" summarizes users' emissions, offering personalized recommendations and alternative suggestions for reducing their carbon footprints. This tailored approach empowers users with actionable information, enabling them to make informed decisions and effectively work towards their sustainability goals.
          </p>
        </div>

        {/* Goal Tracker Section */}
        <div className="mb-10">
          <div className="flex items-center">
            <Target className="w-10 h-10 text-gray-700 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Goal Tracker</h2>
          </div>
          <p className="text-lg leading-relaxed text-gray-600 mt-3">
          The goals tracker in "Carbon Compass" enables users to monitor their progress toward carbon reduction milestones, clearly showing how far they've come and how much further they need to go. This user-friendly tool simplifies the tracking process, offering visual metrics that highlight achievements and remaining goals. By easily accessing their progress, users stay motivated and engaged in their sustainability efforts, allowing them to adjust their strategies and celebrate their successes on the journey to a reduced carbon footprint.
          </p>
        </div>
        
        <p className="text-lg leading-relaxed text-gray-600 mt-8">
          Begin your journey today with Carbon Compass, guiding you toward a sustainable lifestyle and a reduced carbon footprint.
        </p>
      </div>
    </div>
  );
};

export default CarbonCompass;