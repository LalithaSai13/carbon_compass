import React, { useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, firestore } from '../firebase';
import { getDoc, doc, setDoc, arrayUnion } from 'firebase/firestore';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

type FuelType = 'petrol' | 'diesel' | 'electric' | 'naturalGas';
type DietType = 'omnivorous' | 'vegetarian' | 'vegan' | 'pescatarian';

interface FormData {
    name: string;
    location: string;
    energyConsumption: string;
    renewableEnergyUsage: string;
    distanceTraveledPerDay: string;
    fuelType: FuelType;
    fuelConsumption: string;
    totalWasteProduced: string;
    wasteRecycled: string;
    diet: DietType;
    travelFrequency: number;
}

const CarbonForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        location: '',
        energyConsumption: '',
        renewableEnergyUsage: '',
        distanceTraveledPerDay: '',
        fuelType: 'petrol',
        fuelConsumption: '',
        totalWasteProduced: '',
        wasteRecycled: '',
        diet: 'omnivorous',
        travelFrequency: 1
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submissionStatus, setSubmissionStatus] = useState<string>('');
    const [totalEmissions, setTotalEmissions] = useState<number | null>(null);
    const [reductionStrategy, setReductionStrategy] = useState<string | null>(null);
    const [rewardPoints, setRewardPoints] = useState<number>(0);
    const [previousEmissions, setPreviousEmissions] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [rewardMessage, setRewardMessage] = useState<string>('');

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let tempErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name) {
            tempErrors.name = 'Name is required.';
            isValid = false;
        }

        if (!formData.location) {
            tempErrors.location = 'Location is required.';
            isValid = false;
        }
        if (!formData.energyConsumption || parseFloat(formData.energyConsumption) <= 0) {
            tempErrors.energyConsumption = 'Energy Consumption must be a positive number.';
            isValid = false;
        }
        if (formData.renewableEnergyUsage && (parseFloat(formData.renewableEnergyUsage) < 0 || parseFloat(formData.renewableEnergyUsage) > 100)) {
            tempErrors.renewableEnergyUsage = 'Renewable Energy Usage must be between 0 and 100.';
            isValid = false;
        }
        if (!formData.distanceTraveledPerDay || parseFloat(formData.distanceTraveledPerDay) <= 0) {
            tempErrors.distanceTraveledPerDay = 'Distance Traveled Per Day must be a positive number.';
            isValid = false;
        }
        if (!formData.fuelType) {
            tempErrors.fuelType = 'Type of Fuel Used is required.';
            isValid = false;
        }
        if (!formData.fuelConsumption || parseFloat(formData.fuelConsumption) <= 0) {
            tempErrors.fuelConsumption = 'Fuel Consumption must be a positive number.';
            isValid = false;
        }
        if (!formData.totalWasteProduced || parseFloat(formData.totalWasteProduced) <= 0) {
            tempErrors.totalWasteProduced = 'Total Waste Produced must be a positive number.';
            isValid = false;
        }
        if (formData.wasteRecycled && (parseFloat(formData.wasteRecycled) < 0 || parseFloat(formData.wasteRecycled) > parseFloat(formData.totalWasteProduced))) {
            tempErrors.wasteRecycled = 'Waste Recycled must be between 0 and total waste.';
            isValid = false;
        }
        if (!formData.diet) {
            tempErrors.diet = 'Dietary preferences are required.';
            isValid = false;
        }
        if (!formData.travelFrequency || formData.travelFrequency < 1 || formData.travelFrequency > 7) {
            tempErrors.travelFrequency = 'Travel frequency must be between 1 and 7 days.';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (validate()) {
            const emissionFactors = {
                energy: 0.233,
                travel: 0.12,
                fuel: {
                    petrol: 2.31,
                    diesel: 2.68,
                    electric: 0.0,
                    naturalGas: 2.75
                },
                waste: 0.1,
                diet: {
                    omnivorous: 2.5,
                    vegetarian: 1.8,
                    vegan: 1.5,
                    pescatarian: 2.0
                }
            };

            let totalEmissions = 0;

            const nonRenewableEnergy = 100 - (formData.renewableEnergyUsage ? parseFloat(formData.renewableEnergyUsage) : 0);
            const energyEmissions = (parseFloat(formData.energyConsumption) || 0) * (nonRenewableEnergy / 100) * emissionFactors.energy;
            totalEmissions += energyEmissions;

            const travelEmissions = (parseFloat(formData.distanceTraveledPerDay) || 0) * emissionFactors.travel * formData.travelFrequency;
            totalEmissions += travelEmissions;

            const fuelEmissions = (parseFloat(formData.fuelConsumption) || 0) * (emissionFactors.fuel[formData.fuelType] || 0);
            totalEmissions += fuelEmissions;

            const nonRecycledWaste = (parseFloat(formData.totalWasteProduced) || 0) - (parseFloat(formData.wasteRecycled) || 0);
            const wasteEmissions = nonRecycledWaste * emissionFactors.waste;
            totalEmissions += wasteEmissions;

            const dietEmissions = emissionFactors.diet[formData.diet] * formData.travelFrequency;
            totalEmissions += dietEmissions;

            setTotalEmissions(totalEmissions);
            const user = auth.currentUser;
            if (user && user.email) {
                try {
                    const sanitizedEmail = user.email.replace(/[.+]/g, '_');
                    const userDocRef = doc(firestore, 'carbonData', sanitizedEmail);

                    const payload = {
                        ...formData,
                        totalEmissions,
                    };
                    const userDoc = await getDoc(userDocRef);
                    let cumulativeEmissions = totalEmissions;
                    let submissionCount = 1;

                    if (userDoc.exists()) {
                        cumulativeEmissions += userDoc.data().cumulativeEmissions || 0;
                        submissionCount = (userDoc.data().submissionCount || 0) + 1;

                        // Compare total emissions and calculate reward points
                        const lastEmissions = userDoc.data().submissions[userDoc.data().submissions.length - 1].totalEmissions;
                        if (lastEmissions > totalEmissions) {
                            const difference = lastEmissions - totalEmissions;
                            const pointsEarned = Math.round(difference * 0.05);
                            setRewardPoints(prev => prev + pointsEarned);
                            setShowConfetti(true);
                            setRewardMessage(`🎉 Great job! You've reduced your emissions by ${difference.toFixed(2)} kg CO₂ and earned ${pointsEarned} reward points! 🎉`);
                        } else {
                            setRewardMessage('Your emissions have not reduced this time. Keep trying!');
                        }
                        setPreviousEmissions(lastEmissions);
                    }

                    const genAI = new GoogleGenerativeAI("AIzaSyDEqYB2AWhIrBC1MpXs9uwWUtcAoWdZEyE");
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const prompt = `(give the result in 200 words)Given the following data, suggest a carbon reduction strategy: ${JSON.stringify(payload)};`;
                    const result = await model.generateContentStream(prompt);

                    let strategy = '';
                    for await (const chunk of result.stream) {
                        strategy += await chunk.text();
                    }
                    setReductionStrategy(strategy);

                    // Save submission data
                    await setDoc(userDocRef, {
                        cumulativeEmissions,
                        submissionCount,
                        submissions: arrayUnion({
                            ...formData,
                            totalEmissions: totalEmissions.toFixed(2),
                            createdAt: new Date(),
                        }),
                    }, { merge: true });

                    setSubmissionStatus('Form submitted successfully!');
                } catch (error) {
                    console.error('Error adding document to Firebase: ', error);
                    setSubmissionStatus('Error submitting the form. Please try again later.');
                }
            }
        }
        setIsLoading(false);
    };

    return (
<div className="p-5 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">            {showConfetti && <Confetti />}
            <div className="flex flex-col bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mr-4">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Carbon Footprint Calculator</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.name && <p className="text-red-600">{errors.name}</p>}
                    <input
                        type="text"
                        name="location"
                        placeholder="Your Location"
                        value={formData.location}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.location && <p className="text-red-600">{errors.location}</p>}
                    <input
                        type="number"
                        name="energyConsumption"
                        placeholder="Energy Consumption (kWh)"
                        value={formData.energyConsumption}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.energyConsumption && <p className="text-red-600">{errors.energyConsumption}</p>}
                    <input
                        type="number"
                        name="renewableEnergyUsage"
                        placeholder="Renewable Energy Usage (%)"
                        value={formData.renewableEnergyUsage}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.renewableEnergyUsage && <p className="text-red-600">{errors.renewableEnergyUsage}</p>}
                    <input
                        type="number"
                        name="distanceTraveledPerDay"
                        placeholder="Distance Traveled Per Day (km)"
                        value={formData.distanceTraveledPerDay}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.distanceTraveledPerDay && <p className="text-red-600">{errors.distanceTraveledPerDay}</p>}
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border p-2 mb-2 w-full">
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="naturalGas">Natural Gas</option>
                    </select>
                    {errors.fuelType && <p className="text-red-600">{errors.fuelType}</p>}
                    <input
                        type="number"
                        name="fuelConsumption"
                        placeholder="Fuel Consumption (L)"
                        value={formData.fuelConsumption}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.fuelConsumption && <p className="text-red-600">{errors.fuelConsumption}</p>}
                    <input
                        type="number"
                        name="totalWasteProduced"
                        placeholder="Total Waste Produced (kg)"
                        value={formData.totalWasteProduced}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.totalWasteProduced && <p className="text-red-600">{errors.totalWasteProduced}</p>}
                    <input
                        type="number"
                        name="wasteRecycled"
                        placeholder="Waste Recycled (kg)"
                        value={formData.wasteRecycled}
                        onChange={handleChange}
                        className="border p-2 mb-2 w-full"
                    />
                    {errors.wasteRecycled && <p className="text-red-600">{errors.wasteRecycled}</p>}
                    <select name="diet" value={formData.diet} onChange={handleChange} className="border p-2 mb-2 w-full">
                        <option value="omnivorous">Omnivorous</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="pescatarian">Pescatarian</option>
                    </select>
                    {errors.diet && <p className="text-red-600">{errors.diet}</p>}
                    <select name="travelFrequency" value={formData.travelFrequency} onChange={handleChange} className="border p-2 mb-2 w-full">
                        <option value={1}>1 day/week</option>
                        <option value={2}>2 days/week</option>
                        <option value={3}>3 days/week</option>
                        <option value={4}>4 days/week</option>
                        <option value={5}>5 days/week</option>
                        <option value={6}>6 days/week</option>
                        <option value={7}>7 days/week</option>
                    </select>
                    {errors.travelFrequency && <p className="text-red-600">{errors.travelFrequency}</p>}
                    <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg w-full hover:bg-green-600">
                        Submit
                    </button>
                </form>
                {submissionStatus && <p className="mt-4 text-green-600">{submissionStatus}</p>}
                {isLoading && <p className="mt-2 text-yellow-600">Waiting for Gemini to send data...</p>}
            </div>

            {rewardPoints > 0 && (
                <RewardCard points={rewardPoints} />
            )}

            {reductionStrategy && !isLoading && (
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                    <h3 className="font-semibold">Suggested Carbon Reduction Strategy:</h3>
                    <MarkdownRenderer content={reductionStrategy} />
                </div>
            )}
        </div>
    );
};

const RewardCard: React.FC<{ points: number }> = ({ points }) => {
    return (
        <motion.div
            className="fixed flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto mt-4 z-50"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-0 h-0 border-l-24 border-l-transparent border-r-24 border-r-transparent border-b-24 border-b-green-500 mb-2"
                animate={{

                    height: [0, 40, 0],
                    opacity: [0, 1, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <p className="text-lg font-bold">🎉 You've earned {points} reward points! 🎉</p>
        </motion.div>
    );
};


export default CarbonForm;

