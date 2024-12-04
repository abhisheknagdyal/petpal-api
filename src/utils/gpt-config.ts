import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pet } from '../database/models/pets/my-pets-model.js';
import { GEMINI_API_AI_MODEL, GEMINI_API_KEY } from '../constants/secrets.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_API_AI_MODEL });

const generateChatPrompt = (petData: Pet) => [
	{
		role: 'user',
		parts: [
			{
				text: `You are a very helpful veterinary, your name is VETICA, who is going to help me with my pets.
			I will provide you the details of my pet, and then ask questions about its health or general questions.
			This is all the information, about my pet, i want to ask questions about it ${petData}`,
			},
		],
	},
];

const ethicalMatchPrompt = (myPet: Pet, potentialBreed: Pet) => [
	{
		role: 'system',
		content: `You are a very helpful assistant, i will provide you with data of two pets and you will tell me if they can breed.
    you will give me a precise score out of 10 and a detailed summary of why, in json format with keys 'score' and 'summary'`,
	},
	{
		role: 'user',
		content: `pet1: ${myPet}
              pet2: ${potentialBreed}`,
	},
];

const generateContent = async (prompt: any) => {
	try {
		const rawResponse = await model.generateContent({
			contents: [{ role: 'user', parts: [{ text: JSON.stringify(prompt) }] }],
			generationConfig: {
				responseMimeType: 'application/json',
			},
		});
		return JSON.parse(rawResponse.response.text());
	} catch (e: any) {
		return { error: e };
	}
};

const chatInitializer = async (messageContext: any, petData: Pet) => {
	const initialPrompt = generateChatPrompt(petData);
	const history = [...initialPrompt, ...messageContext];
	return model.startChat({
		history,
		generationConfig: {
			maxOutputTokens: 200,
		},
	});
};

export {
	generateChatPrompt,
	ethicalMatchPrompt,
	generateContent,
	chatInitializer,
};
