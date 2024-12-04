import { type Request, type Response } from 'express';
import {
	createOne,
	deleteOne,
	getMany,
	getOne,
	getOneByField,
	updateOne,
	findCombination,
} from '../../database/crud.js';
import { TransporterModel } from '../../database/models/auth/personnel-model.js';
import { TransporterRequestModel } from '../../database/models/requests/transporter-requests-model.js';
import { IRequest } from '../../middleware.js';

const getTransporters = async (req: Request, res: Response): Promise<void> => {
	const [count, documents] = await getMany(TransporterModel);
	res.status(200).json({ count, results: documents });
	return;
};

const getTransporterRequests = async (
	req: Request,
	res: Response
): Promise<void> => {
	const transporterUser = await getOneByField(
		TransporterModel,
		'userRefId',
		(req as IRequest).userToken.id
	);
	const query = {
		requestedId: {
			$in: transporterUser?._id,
		},
		...(req.query?.status
			? { status: { $in: (req.query.status as string).split(',') } }
			: {}),
	};
	const [count, documents] = await Promise.all([
		TransporterRequestModel.countDocuments(query),
		TransporterRequestModel.find(query)
			.skip(+req.query.skip! || 0)
			.limit(10)
			.sort({ createdAt: -1 })
			.populate('petId')
			.populate({ path: 'requesterId', select: 'details' })
			.populate('requestedId'),
	]);
	res.status(200).json({ count, results: documents });
	return;
};

const getMyRequests = async (req: Request, res: Response): Promise<void> => {
	const query = {
		requesterId: {
			$in: (req as IRequest).userToken.id,
		},
	};
	const [count, documents] = await Promise.all([
		TransporterRequestModel.countDocuments(query),
		TransporterRequestModel.find(query)
			.skip(+req.query.skip! || 0)
			.sort({ createdAt: -1 })
			.populate('petId')
			.populate({ path: 'requesterId', select: 'details' })
			.populate('requestedId'),
	]);
	res.status(200).json({ count, results: documents });
	return;
};

const createTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingTransporter = await getOne(TransporterModel, req.params.id);
	if (!existingTransporter) {
		res.status(400).send({ error: `Transporter not found: ${req.params.id}` });
		return;
	}

	const existingRequest = await findCombination(TransporterRequestModel, {
		requesterId: (req as IRequest).userToken.id,
		requestedId: req.params.id,
		petId: req.body.petId,
	});
	if (existingRequest) {
		res.status(403).json({ error: 'Request already exists' });
		return;
	}

	const response = await createOne(TransporterRequestModel, {
		...req.body,
		requesterId: (req as IRequest).userToken.id,
		requestedId: req.params.id,
		status: 'pending',
	});
	res
		.status(201)
		.json({ message: `Transporter request created: ${response._id}` });
	return;
};

const cancelTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingRequest = await getOne(TransporterRequestModel, req.params.id);
	if (!existingRequest) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	await deleteOne(TransporterRequestModel, req.params.id);
	res.status(200).json({ message: `Request deleted: ${req.params.id}` });
	return;
};

const acceptTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingRequest = await getOne(TransporterRequestModel, req.params.id);
	if (!existingRequest) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	await updateOne(TransporterRequestModel, req.params.id, {
		status: 'accepted',
	});
	res.status(200).json({ message: `Request accepted: ${req.params.id}` });
	return;
};

const declineTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingRequest = await getOne(TransporterRequestModel, req.params.id);
	if (!existingRequest) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	await updateOne(TransporterRequestModel, req.params.id, {
		status: 'rejected',
	});
	res.status(200).json({ message: `Request rejected: ${req.params.id}` });
	return;
};

const startTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingRequest = await getOne(TransporterRequestModel, req.params.id);
	if (!existingRequest) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	await updateOne(TransporterRequestModel, req.params.id, {
		status: 'started',
	});
	res.status(200).json({ message: `Request started: ${req.params.id}` });
	return;
};

const completeTransporterRequest = async (
	req: Request,
	res: Response
): Promise<void> => {
	const existingRequest = await getOne(TransporterRequestModel, req.params.id);
	if (!existingRequest) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	await deleteOne(TransporterRequestModel, req.params.id);
	res.status(200).json({ message: `Request completed ${req.params.id}` });
	return;
};

export {
	getTransporters,
	getMyRequests,
	getTransporterRequests,
	createTransporterRequest,
	cancelTransporterRequest,
	acceptTransporterRequest,
	declineTransporterRequest,
	startTransporterRequest,
	completeTransporterRequest,
};
