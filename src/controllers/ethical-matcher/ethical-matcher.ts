import { type Request, type Response } from 'express';
import { PetsModel } from '../../database/models/pets/my-pets-model.js';
import { ethicalMatchPrompt, generateContent } from '../../utils/gpt-config.js';
import { getOne } from '../../database/crud.js';

const getMatchScore = async (req: Request, res: Response): Promise<void> => {
	const myPet = await getOne(PetsModel, req.body.myPet);
	const potentialPet = await getOne(PetsModel, req.body.potentialPet);
	if (!potentialPet || !myPet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	const matchPrompt = ethicalMatchPrompt(myPet, potentialPet);
	const matchSummary = await generateContent(matchPrompt);
	if (matchSummary.error) {
		res.status(400).json(matchSummary);
		return;
	}
	res.status(200).json(matchSummary);
	return;
};

export { getMatchScore };
