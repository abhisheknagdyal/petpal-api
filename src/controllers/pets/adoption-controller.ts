import { type Request, type Response } from 'express';
import {
	getOne,
	createOne,
	deleteOne,
	getMany,
	updateOne,
} from '../../database/crud.js';
import { PetsModel } from '../../database/models/pets/my-pets-model.js';
import { AdoptionModel } from '../../database/models/pets/adoption-model.js';
import { IRequest } from '../../middleware.js';
import imageUploader from '../../utils/image-uploader.js';

const getAvailablePets = async (req: Request, res: Response): Promise<void> => {
	const [count, pets] = await getMany(
		AdoptionModel,
		{
			adoption_status: { $in: ['available', 'pending'] },
		},
		'',
		+req.query.skip!
	);
	res.status(200).json({ count, results: pets });
	return;
};

const getSingleAdoptablePet = async (
	req: Request,
	res: Response
): Promise<void> => {
	const response = await getOne(AdoptionModel, req.params.id);
	if (!response) {
		res.status(404).json({ error: `Pet not found: ${req.params.id}` });
		return;
	}
	res.status(200).json(response);
	return;
};

const createPetAdoption = async (
	req: Request,
	res: Response
): Promise<void> => {
	const imageUrl = await imageUploader(req.body.photo_url);
	const response = await createOne(AdoptionModel, {
		...req.body,
		photo_url: imageUrl,
		adoption_status: 'available',
	});
	res.status(200).json({ message: `Adoption created ${response._id}` });
	return;
};

const updatePetAdoptionDetails = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingPet = await getOne(AdoptionModel, req.params.id);
	if (!existingPet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	await updateOne(AdoptionModel, req.params.id, {
		...existingPet._doc,
		...req.body,
		...(imageUrl ? { photo_url: imageUrl } : {}),
	});
	res.status(200).json({ message: `Pet updated: ${existingPet._id}` });
	return;
};

const deletedAdoption = async (req: Request, res: Response): Promise<void> => {
	const adoption = await getOne(AdoptionModel, req.params.id);
	if (!adoption) {
		res.status(404).json({ error: 'Adoption not found' });
		return;
	}
	await deleteOne(AdoptionModel, req.params.id);
	res.status(200).json({ message: `Adoption deleted: ${adoption._id}` });
	return;
};

const adoptPet = async (req: Request, res: Response): Promise<void> => {
	const availablePet = await getOne(AdoptionModel, req.params.id);
	if (!availablePet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	const { _id, created_at, updated_at, owner_id, ...rest } = availablePet._doc;
	const newQuery = {
		...rest,
		owner_id: (req as IRequest).userToken.id,
	};
	const response = await createOne(PetsModel, newQuery);
	await deleteOne(AdoptionModel, req.params.id);
	res
		.status(200)
		.json({ message: `Pet successfully adopted ${response?._id}` });
	return;
};

const putPetForAdoption = async (
	req: Request,
	res: Response
): Promise<void> => {
	const pet = await getOne(PetsModel, req.params.id);
	if (!pet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	if ((req as IRequest).userToken.id !== pet.owner_id) {
		res.status(403).json({
			error:
				"You don't have permission to perform this action, invalid pet-owner combination",
		});
		return;
	}
	const { _id, created_at, updated_at, ...rest } = pet._doc;
	const newQuery = {
		...rest,
		adoption_status: 'available',
	};
	const response = await createOne(AdoptionModel, newQuery);
	await deleteOne(PetsModel, req.params.id);
	res.status(200).json({ message: `Adoption created ${response?._id}` });
	return;
};

const cancelAdoption = async (req: Request, res: Response): Promise<void> => {
	const pet = await getOne(AdoptionModel, req.params.id);
	if (!pet) {
		res.status(404).json({ error: 'Pet not found' });
		return;
	}
	if ((req as IRequest).userToken.id !== pet.owner_id) {
		res.status(403).json({
			error:
				"You don't have permission to perform this action, invalid pet-owner combination",
		});
		return;
	}
	const { _id, created_at, updated_at, adoption_status, ...rest } = pet._doc;
	const response = await createOne(PetsModel, rest);
	await deleteOne(AdoptionModel, req.params.id);
	res.status(200).json({ message: `Adoption cancelled: ${response._id}` });
	return;
};

export {
	getAvailablePets,
	getSingleAdoptablePet,
	createPetAdoption,
	adoptPet,
	deletedAdoption,
	putPetForAdoption,
	cancelAdoption,
	updatePetAdoptionDetails,
};
