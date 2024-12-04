import { type Response, type Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 } from 'uuid';
import {
	createOne,
	deleteOne,
	getOne,
	getOneByField,
	updateOne,
} from '../../database/crud.js';
import { User } from '../../database/models/auth/auth-model.js';
import {
	JWT_SECRET_KEY,
	JWT_EXPIRY_DELTA,
	AUTH_METHOD,
} from '../../constants/secrets.js';
import SUBSCRIPTION_MODELS from '../../constants/subscription-models.js';
import { IRequest } from '../../middleware.js';
import transporter, {
	generateMailOptions,
} from '../../utils/mail-transporter.js';
import {
	BoarderModel,
	GroomerModel,
	TransporterModel,
} from '../../database/models/auth/personnel-model.js';
import imageUploader from '../../utils/image-uploader.js';

type Payload = {
	email: string;
	username: string;
	_id: unknown;
	subscriptionModel: string;
	isAdmin: boolean;
	isPersonnelBoarder: boolean;
	isPersonnelGroomer: boolean;
	isPersonnelTransporter: boolean;
} | null;

const createPayload = (user: Payload) => {
	return {
		email: user?.email,
		username: user?.username,
		id: user?._id,
		subscription_model: user?.subscriptionModel,
		isAdmin: user?.isAdmin,
		isPersonnelBoarder: user?.isPersonnelBoarder,
		isPersonnelGroomer: user?.isPersonnelGroomer,
		isPersonnelTransporter: user?.isPersonnelTransporter,
	};
};

const getConfig = async (req: Request, res: Response): Promise<void> => {
	const user = await getOne(User, (req as IRequest).userToken.id);
	if (
		user!.subscriptionModel !== (req as IRequest).userToken.subscription_model
	) {
		const payload = createPayload(user);
		const token = jwt.sign(payload, JWT_SECRET_KEY, {
			expiresIn: JWT_EXPIRY_DELTA,
		});
		res.status(200).json(token);
		return;
	}
	res.status(200).json();
	return;
};

const register = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOneByField(User, 'email', req.body.email);
	if (existingUser) {
		res.status(403).json({ error: 'Email already exist' });
		return;
	}
	const canCreateAdmins = (req as IRequest).userToken?.isAdmin || false;
	const activationKey = v4();
	const password = await bcrypt.hash(
		Buffer.from(req.body.password || '', 'base64').toString('binary'),
		10
	);
	const response = await createOne(User, {
		username: req.body.username,
		email: req.body.email,
		password: !canCreateAdmins ? password : `${activationKey}`,
		isActive: false,
		subscriptionModel: SUBSCRIPTION_MODELS.get(1)!.fieldId,
		isAdmin: canCreateAdmins && req.body.isAdmin,
		isPersonnelBoarder: canCreateAdmins && req.body.isPersonnelBoarder,
		isPersonnelGroomer: canCreateAdmins && req.body.isPersonnelGroomer,
		isPersonnelTransporter: canCreateAdmins && req.body.isPersonnelTransporter,
	});
	if (canCreateAdmins) {
		transporter.sendMail(
			generateMailOptions(
				req.body.email,
				response._id as string,
				activationKey,
				canCreateAdmins && req.body.isPersonnelBoarder
			),
			async (err) => {
				if (err) {
					await deleteOne(User, response._id as string);
					res.status(400).json({
						error: 'Error sending activation email, try again',
						details: err,
					});
					return;
				}
			}
		);
	}
	res.status(201).json({ message: `User created: ${response?._id}` });
	return;
};

const updatePassword = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, req.body.id);
	if (!existingUser) {
		res.status(404).json({ error: `User not found: ${req.body.id}` });
		return;
	}
	if (existingUser.password !== req.body.key) {
		res.status(403).json({ error: 'Key mismatch' });
		return;
	}
	const password = await bcrypt.hash(
		Buffer.from(req.body.password, 'base64').toString('binary'),
		10
	);
	await updateOne(User, existingUser._id as string, {
		password,
		isActive: existingUser.isAdmin,
	});
	res
		.status(200)
		.json({ message: `User password updated: ${existingUser._id}` });
	return;
};

const login = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOneByField(User, 'email', req.body.email);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	const match = await bcrypt.compare(
		Buffer.from(req.body.password, 'base64').toString('binary'),
		existingUser.password
	);
	if (!match) {
		res.status(403).json({ error: 'Invalid credentials' });
		return;
	}
	const payload = createPayload(existingUser);
	const token = jwt.sign(payload, JWT_SECRET_KEY, {
		expiresIn: JWT_EXPIRY_DELTA,
	});
	res.status(200).json({
		token,
		accessType: AUTH_METHOD,
		user: {
			...payload,
			isActive: existingUser.isActive,
			details: existingUser?.details,
		},
	});
	return;
};

const checkCredentials = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, req.body.id);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	console.log(
		Buffer.from(req.body.key, 'base64').toString('binary'),
		existingUser.password
	);
	const match =
		Buffer.from(req.body.key, 'base64').toString('binary') ===
		existingUser.password;
	if (!match) {
		res.status(403).json({ error: 'Invalid key' });
		return;
	}
	res.status(200).json({ message: `Authorized` });
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, (req as IRequest).userToken.id);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	await updateOne(User, existingUser._id as string, {
		isActive: true,
		details: {
			...existingUser.details,
			...req.body,
			...(imageUrl ? { photo_url: imageUrl } : {}),
		},
	});
	res.status(200).json({
		message: `User details updated: ${existingUser._id}`,
		new_url: imageUrl,
	});
	return;
};

const boardGroomer = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, (req as IRequest).userToken.id);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	const response = await createOne(GroomerModel, {
		...req.body,
		...(imageUrl ? { photo_url: imageUrl } : {}),
		userRefId: existingUser._id,
	});
	await updateOne(User, existingUser._id as string, {
		isActive: true,
		details: {
			...existingUser.details,
			...req.body,
			...(imageUrl ? { photo_url: imageUrl } : {}),
		},
	});
	res
		.status(200)
		.json({ message: `Groomer boarded: ${response._id}`, new_url: imageUrl });
	return;
};

const boardBoarder = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, (req as IRequest).userToken.id);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	const response = await createOne(BoarderModel, {
		...req.body,
		...(imageUrl ? { photo_url: imageUrl } : {}),
		userRefId: existingUser._id,
	});
	await updateOne(User, existingUser._id as string, {
		isActive: true,
		details: {
			...existingUser.details,
			...req.body,
			...(imageUrl ? { photo_url: imageUrl } : {}),
		},
	});
	res
		.status(200)
		.json({ message: `Boarder boarded: ${response._id}`, new_url: imageUrl });
	return;
};

const boardTransporter = async (req: Request, res: Response): Promise<void> => {
	const existingUser = await getOne(User, (req as IRequest).userToken.id);
	if (!existingUser) {
		res.status(404).json({ error: `User doesn't exist` });
		return;
	}
	const imageUrl = await imageUploader(req.body.photo_url);
	const response = await createOne(TransporterModel, {
		...req.body,
		...(imageUrl ? { photo_url: imageUrl } : {}),
		userRefId: existingUser._id,
	});
	await updateOne(User, existingUser._id as string, {
		isActive: true,
		details: {
			...existingUser.details,
			...req.body,
			...(imageUrl ? { photo_url: imageUrl } : {}),
		},
	});
	res.status(200).json({
		message: `Transporter boarded: ${response._id}`,
		new_url: imageUrl,
	});
	return;
};

export {
	getConfig,
	register,
	updatePassword,
	login,
	checkCredentials,
	updateUser,
	boardGroomer,
	boardBoarder,
	boardTransporter,
};
