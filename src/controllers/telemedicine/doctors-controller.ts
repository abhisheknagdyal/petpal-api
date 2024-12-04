import { type Request, type Response } from 'express';
import {
	createOne,
	deleteOne,
	getMany,
	getOne,
	getOneByField,
	updateOne,
} from '../../database/crud.js';
import { DoctorModel } from '../../database/models/telemedicine/doctors-model.js';
import imageUploader from '../../utils/image-uploader.js';

const getDoctors = async (req: Request, res: Response): Promise<void> => {
	const [count, documents] = await getMany(
		DoctorModel,
		{},
		'',
		+req.query.skip! || 0
	);
	res.status(200).json({ count, results: documents });
	return;
};

const getSingleDoctor = async (req: Request, res: Response): Promise<void> => {
	const response = await getOne(DoctorModel, req.params.id);
	if (!response) {
		res.status(404).json({ error: 'Doctor not found' });
		return;
	}
	res.status(200).json(response);
	return;
};

const createDoctor = async (req: Request, res: Response): Promise<void> => {
	const existing_doctor = await getOneByField(
		DoctorModel,
		'licenseNumber',
		req.body.licenseNumber
	);
	if (existing_doctor) {
		res
			.status(403)
			.json({ error: 'Doctor with this license number already exists' });
		return;
	}
	const response = await createOne(DoctorModel, req.body);
	res.status(201).json({ message: `Doctor created: ${response._id}` });
	return;
};

const updateDoctor = async (req: Request, res: Response): Promise<void> => {
	const existing_doctor = await getOne(DoctorModel, req.params.id);
	if (!existing_doctor) {
		res.status(404).json({ error: 'Doctor not found' });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	await updateOne(DoctorModel, req.params.id, {
		...existing_doctor,
		...req.body,
		...(imageUrl ? { profilePicture: imageUrl } : {}),
	});
	res.status(200).json({ message: `Doctor updated: ${existing_doctor._id}` });
	return;
};

const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
	const existing_doctor = await getOne(DoctorModel, req.params.id);
	if (!existing_doctor) {
		res.status(404).json({ error: 'Doctor not found' });
		return;
	}
	await deleteOne(DoctorModel, req.params.id);
	res.status(200).json({ message: 'Doctor deleted' });
	return;
};

export {
	getDoctors,
	getSingleDoctor,
	createDoctor,
	updateDoctor,
	deleteDoctor,
};
