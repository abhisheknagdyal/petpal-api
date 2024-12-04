import type { Request, Response } from 'express';
import { PetsModel } from '../../database/models/pets/my-pets-model.js';
import { IRequest } from '../../middleware.js';

const getPets = async (req: Request, res: Response): Promise<void> => {
	const filter = req.query.filters;
	const query = {
		owner_id: { $ne: (req as IRequest).userToken.id },
		vaccinated: true,
		...(filter ? { species: { $in: filter } } : {}),
	};
	const [count, documents] = await Promise.all([
		PetsModel.countDocuments(query),
		PetsModel.find(query)
			.select('-location -owner_id')
			.skip(Number(req.query.skip) || 0)
			.limit(10),
	]);
	res.status(200).json({ count, results: documents });
	return;
};

const getSinglePet = async (req: Request, res: Response): Promise<void> => {
	const pet = await PetsModel.findById(req.params.id).select('-location');
	if (!pet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	res.status(200).json(pet);
	return;
};

const getFilters = async (req: Request, res: Response): Promise<void> => {
	const filters = await PetsModel.distinct('species');
	res.status(200).json({ filters: filters });
	return;
};

export { getPets, getSinglePet, getFilters };
