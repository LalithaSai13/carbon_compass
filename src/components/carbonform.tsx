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
    const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);

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
                    let pointsEarned=0;

                    if (userDoc.exists()) {
                        cumulativeEmissions += userDoc.data().cumulativeEmissions || 0;
                        submissionCount = (userDoc.data().submissionCount || 0) + 1;

                        const lastEmissions = userDoc.data().submissions[userDoc.data().submissions.length - 1].totalEmissions;
                        if (lastEmissions > totalEmissions) {
                            const difference = lastEmissions - totalEmissions;
                            pointsEarned = Math.round(difference * 0.05);
                            setRewardPoints(prev => prev + pointsEarned);
                            setShowConfetti(true);
                            setShowRewardPopup(true);
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

                    await setDoc(userDocRef, {
                        submissions: arrayUnion({ ...payload, totalEmissions }),
                        cumulativeEmissions,
                        submissionCount,
                        rewardPoints: pointsEarned,
                    }, { merge: true });
                } catch (error) {
                    console.error('Error submitting data: ', error);
                    setSubmissionStatus('Error submitting form. Please try again later.');
                }
            }
        }
        setIsLoading(false);
    };

    const closeRewardPopup = () => {
        setShowRewardPopup(false);
    };

    return (
        <div className="p-5 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {showConfetti && <Confetti />}
            <div className="flex w-full max-w-5xl">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mr-4">
                    <h2 className="text-2xl font-bold mb-4">Carbon Footprint Calculator</h2>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.name}</span>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Your Location" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.location}</span>
                    <input type="number" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} placeholder="Energy Consumption (kWh)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.energyConsumption}</span>
                    <input type="number" name="renewableEnergyUsage" value={formData.renewableEnergyUsage} onChange={handleChange} placeholder="Renewable Energy Usage (%)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.renewableEnergyUsage}</span>
                    <input type="number" name="distanceTraveledPerDay" value={formData.distanceTraveledPerDay} onChange={handleChange} placeholder="Distance Traveled Per Day (km)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.distanceTraveledPerDay}</span>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border p-2 mb-2 w-full">
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="naturalGas">Natural Gas</option>
                    </select>
                    <span className="text-red-500">{errors.fuelType}</span>
                    <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} placeholder="Fuel Consumption (L)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.fuelConsumption}</span>
                    <input type="number" name="totalWasteProduced" value={formData.totalWasteProduced} onChange={handleChange} placeholder="Total Waste Produced (kg)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.totalWasteProduced}</span>
                    <input type="number" name="wasteRecycled" value={formData.wasteRecycled} onChange={handleChange} placeholder="Waste Recycled (kg)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.wasteRecycled}</span>
                    <select name="diet" value={formData.diet} onChange={handleChange} className="border p-2 mb-2 w-full">
                        <option value="omnivorous">Omnivorous</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="pescatarian">Pescatarian</option>
                    </select>
                    <span className="text-red-500">{errors.diet}</span>
                    <input type="number" name="travelFrequency" value={formData.travelFrequency} onChange={handleChange} placeholder="Travel Frequency (days per week)" className="border p-2 mb-2 w-full" />
                    <span className="text-red-500">{errors.travelFrequency}</span>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        {isLoading ? 'Submitting...' : 'Calculate'}
                    </button>
                    <div className="mt-4 text-green-600">{submissionStatus}</div>
                </form>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md ml-4">
                    {totalEmissions !== null && <div className="mt-4">Total Emissions: {totalEmissions.toFixed(2)} kg CO₂</div>}
                    {reductionStrategy && <MarkdownRenderer content={reductionStrategy} />}
                </div>
            </div>
            {showRewardPopup && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <h3 className="text-xl font-bold mb-2">Reward Points!</h3>
                        <p>{rewardMessage}</p>
                        <button onClick={closeRewardPopup} className="mt-auto bg-red-500 text-white p-2 rounded self-center">
                            Close
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CarbonForm;
