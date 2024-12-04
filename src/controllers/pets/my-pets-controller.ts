import { type Request, type Response } from 'express';
import {
	createOne,
	deleteOne,
	getMany,
	getOne,
	updateOne,
} from '../../database/crud.js';
import { PetsModel } from '../../database/models/pets/my-pets-model.js';
import { IRequest } from '../../middleware.js';
import { AdoptionModel } from '../../database/models/pets/adoption-model.js';
import imageUploader from '../../utils/image-uploader.js';

const getMyPets = async (req: Request, res: Response): Promise<void> => {
	const query = {
		owner_id: {
			$in: (req as IRequest).userToken.id,
		},
	};
	const [myCount, myDocuments] = await getMany(PetsModel, query);
	const [adoptionCount, adoptionDocuments] = await getMany(
		AdoptionModel,
		query
	);
	res.status(200).json({
		count: +myCount + +adoptionCount,
		results: [...(adoptionDocuments as []), ...(myDocuments as [])],
	});
	return;
};

const getMySinglePet = async (req: Request, res: Response): Promise<void> => {
	const response = await getOne(PetsModel, req.params.id);
	if (!response) {
		res.status(404).json({ error: `Pet not found: ${req.params.id}` });
		return;
	}
	res.status(200).json(response);
	return;
};

const createMyPets = async (req: Request, res: Response): Promise<void> => {
	const imageUrl = await imageUploader(req.body.photo_url);
	const response = await createOne(PetsModel, {
		...req.body,
		photo_url: imageUrl,
		owner_id: (req as IRequest).userToken.id,
	});
	res.status(201).json({ message: `Pet created: ${response._id}` });
	return;
};

const updateMyPet = async (req: Request, res: Response): Promise<void> => {
	const existingPet = await getOne(PetsModel, req.params.id);
	if (!existingPet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	await updateOne(PetsModel, req.params.id, {
		...existingPet._doc,
		...req.body,
		...(imageUrl ? { photo_url: imageUrl } : {}),
	});
	res.status(200).json({ message: `Pet updated: ${existingPet._id}` });
	return;
};

const deleteMyPet = async (req: Request, res: Response): Promise<void> => {
	const existingPet = await getOne(PetsModel, req.params.id);
	if (!existingPet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	await deleteOne(PetsModel, req.params.id);
	res.status(200).json({ message: `Pet Deleted: ${existingPet._id}` });
};

export { getMyPets, getMySinglePet, createMyPets, updateMyPet, deleteMyPet };
