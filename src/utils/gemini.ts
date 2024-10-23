import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { CarbonFormData } from "../types/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Function to call Gemini API and get response
export const getGeminiResponse = async (formData: CarbonFormData) => {
    // Define the API endpoint and any necessary headers
    const apiUrl = 'https://api.gemini.com/your-endpoint'; // Replace with the actual endpoint
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key if required

    // Prepare the request payload
    const payload = {
        businessName: formData.businessName,
        address: formData.address,
        industryType: formData.industryType,
        energyConsumption: formData.energyConsumption,
        renewableEnergyUsage: formData.renewableEnergyUsage,
        distanceTraveled: formData.distanceTraveled,
        fuelType: formData.fuelType,
        fuelConsumption: formData.fuelConsumption,
        totalWasteProduced: formData.totalWasteProduced,
        wasteRecycled: formData.wasteRecycled,
    };

    try {
        // Make the POST request to the API
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Include API key if required
            }
        });

        // Assuming the response contains the insights we need
        return response.data; // Adjust according to the actual response structure
    } catch (error) {
        console.error('Error fetching response from Gemini API:', error);
        throw new Error('Failed to fetch data from the Gemini API. Please try again later.');
    }
};
