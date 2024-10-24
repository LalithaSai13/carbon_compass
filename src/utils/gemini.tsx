import { GoogleGenerativeAI } from "@google/generative-ai";
import { CarbonFormData } from "../types/types";
// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI("AIzaSyDHz726NJiY0CtS366nwLfZWhfyniPgxsY");

// Get the generative model without systemInstruction
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  //systemInstruction: "For every prompt, separately mention equivalent carbon credits, for the emissions that can be reduced after following reduction strategies", // Remove this line
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 500,
  responseMimeType: "text/plain",
};

// Function to get the Gemini response
export const getGeminiResponse = async (formData: CarbonFormData) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Construct the input prompt using formData
    const inputPrompt = `Calculate carbon credits for ${formData.businessName} with energy consumption of ${formData.energyConsumption} kWh. Please mention equivalent carbon credits and reduction strategies.`;

    const result = await chatSession.sendMessage(inputPrompt);
    return result.response.text(); // Return the response text
  } catch (error) {
    console.error("Error fetching response from Gemini:", error);
    throw new Error('Failed to get response from Gemini AI');
  }
};