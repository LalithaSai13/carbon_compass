import React, { useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, firestore } from '../firebase'; // Ensure this file exports both auth and firestore instances
import { doc, setDoc, arrayUnion } from 'firebase/firestore';

const CarbonForm: React.FC = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        industryType: '',
        energyConsumption: '',
        renewableEnergyUsage: '',
        distanceTraveled: '',
        fuelType: '',
        fuelConsumption: '',
        totalWasteProduced: '',
        wasteRecycled: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submissionStatus, setSubmissionStatus] = useState<string>('');
    const [totalEmissions, setTotalEmissions] = useState<number | null>(null);
    const [reductionStrategy, setReductionStrategy] = useState<string | null>(null);
    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        let tempErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.businessName) {
            tempErrors.businessName = 'Business Name is required.';
            isValid = false;
        }
        if (!formData.address) {
            tempErrors.address = 'Address is required.';
            isValid = false;
        }
        if (!formData.industryType) {
            tempErrors.industryType = 'Industry Type is required.';
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

        if (!formData.distanceTraveled || parseFloat(formData.distanceTraveled) <= 0) {
            tempErrors.distanceTraveled = 'Distance Traveled must be a positive number.';
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
        
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (validate()) {
            const emissionFactors = {
                energy: 0.233, // kg CO₂ per kWh
                travel: 0.12, // kg CO₂ per km
                fuel: {
                    petrol: 2.31, // kg CO₂ per liter
                    diesel: 2.68, // kg CO₂ per liter
                    electric: 0.0, // kg CO₂ per kWh
                    naturalGas: 2.75 // kg CO₂ per cubic meter
                },
                waste: 0.1 // kg CO₂ per kg of waste
            };
    
            let totalEmissions = 0;

            const nonRenewableEnergy = 100 - (formData.renewableEnergyUsage ? parseFloat(formData.renewableEnergyUsage) : 0);
            const energyEmissions = (parseFloat(formData.energyConsumption) || 0) * (nonRenewableEnergy / 100) * emissionFactors.energy;
            totalEmissions += energyEmissions;

            const travelEmissions = (parseFloat(formData.distanceTraveled) || 0) * emissionFactors.travel;
            totalEmissions += travelEmissions;

            const fuelEmissions = (parseFloat(formData.fuelConsumption) || 0) * (emissionFactors.fuel[formData.fuelType] || 0);
            totalEmissions += fuelEmissions;

            const nonRecycledWaste = (parseFloat(formData.totalWasteProduced) || 0) - (parseFloat(formData.wasteRecycled) || 0);
            const wasteEmissions = nonRecycledWaste * emissionFactors.waste;
            totalEmissions += wasteEmissions;

            setTotalEmissions(totalEmissions);
            const user = auth.currentUser; // Get the currently logged-in user
        if (user && user.email) {
            try {
                const sanitizedEmail = user.email.replace(/[.+]/g, '_');
                const userDocRef = doc(firestore, 'carbonData', sanitizedEmail);

                // Prepare data for Google Generative AI
                const payload = {
                    businessName: formData.businessName,
                    address: formData.address,
                    industryType: formData.industryType,
                    totalEmissions,
                };

                // Call Google Generative AI
                const genAI = new GoogleGenerativeAI("AIzaSyDHz726NJiY0CtS366nwLfZWhfyniPgxsY");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Given the following business data, suggest a carbon reduction strategy: ${JSON.stringify(payload)}`;
                const result = await model.generateContentStream(prompt);

                let strategy = '';
                for await (const chunk of result.stream) {
                    strategy += await chunk.text();
                }
                setReductionStrategy(strategy); // Set the strategy in state

                // Save submission data including the strategy to Firestore
                await setDoc(userDocRef, {
                    submissions: arrayUnion({
                        ...formData,
                        totalEmissions: totalEmissions.toFixed(2),
                        strategy, // Include the generated strategy
                        createdAt: new Date(),
                    })
                }, { merge: true });

                setSubmissionStatus('Form submitted successfully!'); // Success message
            } catch (error) {
                console.error('Error adding document to Firebase: ', error);
                setSubmissionStatus('Error submitting the form. Please try again.');
            }
        } else {
            console.error('No user is logged in. Cannot submit data.');
            setSubmissionStatus('You must be logged in to submit data.');
        }
    }
    setIsLoading(false); // Hide loading state after processing
};
return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
        <div className="flex flex-col bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mr-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Carbon Footprint Calculator</h1>
            <form onSubmit={handleSubmit}>
                <h2 className="text-lg font-semibold mb-4">Section 1: Business Information</h2>
                    <label htmlFor="businessName" className="block mb-1 font-medium">Business Name*</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.businessName && <p className="text-red-600 text-sm">{errors.businessName}</p>}
                    
                    <label htmlFor="address" className="block mb-1 font-medium">Address*</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
    
                    <label htmlFor="industryType" className="block mb-1 font-medium">Industry Type*</label>
                    <input type="text" name="industryType" value={formData.industryType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.industryType && <p className="text-red-600 text-sm">{errors.industryType}</p>}
    
                    <h2 className="text-lg font-semibold mb-4">Section 2: Energy Usage</h2>
                    <label htmlFor="energyConsumption" className="block mb-1 font-medium">Energy Consumption*</label>
                    <input type="number" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.energyConsumption && <p className="text-red-600 text-sm">{errors.energyConsumption}</p>}
                    
                    <label htmlFor="renewableEnergyUsage" className="block mb-1 font-medium">Renewable Energy Usage (%)</label>
                    <input type="number" name="renewableEnergyUsage" value={formData.renewableEnergyUsage} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />

                    <h2 className="text-lg font-semibold mb-4">Section 3: Transportation</h2>
                    <label htmlFor="distanceTraveled" className="block mb-1 font-medium">Distance Traveled*</label>
                    <input type="number" name="distanceTraveled" value={formData.distanceTraveled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.distanceTraveled && <p className="text-red-600 text-sm">{errors.distanceTraveled}</p>}
    
                    <label htmlFor="fuelType" className="block mb-1 font-medium">Type of Fuel Used*</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4">
                        <option value="">Select fuel type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="naturalGas">Natural Gas</option>
                    </select>
                    {errors.fuelType && <p className="text-red-600 text-sm">{errors.fuelType}</p>}
    
                    <label htmlFor="fuelConsumption" className="block mb-1 font-medium">Fuel Consumption*</label>
                    <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.fuelConsumption && <p className="text-red-600 text-sm">{errors.fuelConsumption}</p>}
    
                    <h2 className="text-lg font-semibold mb-4">Section 4: Waste Management</h2>
                    <label htmlFor="totalWasteProduced" className="block mb-1 font-medium">Total Waste Produced*</label>
                    <input type="number" name="totalWasteProduced" value={formData.totalWasteProduced} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.totalWasteProduced && <p className="text-red-600 text-sm">{errors.totalWasteProduced}</p>}
    
                    <label htmlFor="wasteRecycled" className="block mb-1 font-medium">Waste Recycled</label>
                    <input type="number" name="wasteRecycled" value={formData.wasteRecycled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
    
                <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg w-full hover:bg-green-600">
                    Submit
                </button>
            </form>
            {submissionStatus && <p className="mt-4 text-green-600">{submissionStatus}</p>}
            {isLoading && <p className="mt-2 text-yellow-600">Waiting for Gemini to send data...</p>}
        </div>

        {reductionStrategy && !isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
                <h3 className="font-semibold">Suggested Carbon Reduction Strategy:</h3>
                <MarkdownRenderer content={reductionStrategy} />
            </div>
        )}
    </div>
);/*
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl overflow-auto" style={{ maxHeight: '90vh' }}>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Carbon Footprint Calculator</h1>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-lg font-semibold mb-4">Section 1: Business Information</h2>
                    <label htmlFor="businessName" className="block mb-1 font-medium">Business Name*</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.businessName && <p className="text-red-600 text-sm">{errors.businessName}</p>}
                    
                    <label htmlFor="address" className="block mb-1 font-medium">Address*</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
    
                    <label htmlFor="industryType" className="block mb-1 font-medium">Industry Type*</label>
                    <input type="text" name="industryType" value={formData.industryType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.industryType && <p className="text-red-600 text-sm">{errors.industryType}</p>}
    
                    <h2 className="text-lg font-semibold mb-4">Section 2: Energy Usage</h2>
                    <label htmlFor="energyConsumption" className="block mb-1 font-medium">Energy Consumption*</label>
                    <input type="number" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.energyConsumption && <p className="text-red-600 text-sm">{errors.energyConsumption}</p>}
                    
                    <label htmlFor="renewableEnergyUsage" className="block mb-1 font-medium">Renewable Energy Usage (%)</label>
                    <input type="number" name="renewableEnergyUsage" value={formData.renewableEnergyUsage} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />

                    <h2 className="text-lg font-semibold mb-4">Section 3: Transportation</h2>
                    <label htmlFor="distanceTraveled" className="block mb-1 font-medium">Distance Traveled*</label>
                    <input type="number" name="distanceTraveled" value={formData.distanceTraveled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.distanceTraveled && <p className="text-red-600 text-sm">{errors.distanceTraveled}</p>}
    
                    <label htmlFor="fuelType" className="block mb-1 font-medium">Type of Fuel Used*</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4">
                        <option value="">Select fuel type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="naturalGas">Natural Gas</option>
                    </select>
                    {errors.fuelType && <p className="text-red-600 text-sm">{errors.fuelType}</p>}
    
                    <label htmlFor="fuelConsumption" className="block mb-1 font-medium">Fuel Consumption*</label>
                    <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.fuelConsumption && <p className="text-red-600 text-sm">{errors.fuelConsumption}</p>}
    
                    <h2 className="text-lg font-semibold mb-4">Section 4: Waste Management</h2>
                    <label htmlFor="totalWasteProduced" className="block mb-1 font-medium">Total Waste Produced*</label>
                    <input type="number" name="totalWasteProduced" value={formData.totalWasteProduced} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                    {errors.totalWasteProduced && <p className="text-red-600 text-sm">{errors.totalWasteProduced}</p>}
    
                    <label htmlFor="wasteRecycled" className="block mb-1 font-medium">Waste Recycled</label>
                    <input type="number" name="wasteRecycled" value={formData.wasteRecycled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
    
                    <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg w-full hover:bg-green-600">Submit</button>
                </form>
                {submissionStatus && <p className="mt-4 text-green-600">{submissionStatus}</p>}
                {totalEmissions !== null && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Total Carbon Emissions:</h3>
                        <p>{totalEmissions.toFixed(2)} kg CO₂</p>
                    </div>
                )}
                </div>
                {reductionStrategy && (
                    <div className="bg-white mt-6 p-6 rounded-lg shadow-lg w-full max-w-xl">
                        <h3 className="font-semibold">Suggested Carbon Reduction Strategy:</h3>
                        <MarkdownRenderer content={reductionStrategy} />
                    </div>
                )}
        </div>
    );*/
}

export default CarbonForm;
