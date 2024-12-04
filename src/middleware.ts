import { type Request, type Response, type NextFunction } from 'express';
import { type Socket, type ExtendedError } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY, REQUEST_TYPE } from './constants/secrets.js';
import {
	SUBSCRIPTION_INDEX_MAP,
	SUBSCRIPTION_LEVELS,
	SubscriptionPlan,
} from './constants/subscription-models.js';
import { validationResult } from 'express-validator';

type UserToken = {
	email: string;
	id: string;
	subscription_model: SubscriptionPlan;
	username: string;
	isAdmin: boolean;
	isPersonnelBoarder: boolean;
	isPersonnelGroomer: boolean;
	isPersonnelTransporter: boolean;
};

type RequestValidation = {
	requiredSubscription?: SubscriptionPlan;
	requiredAdmin?: boolean;
	requiredPersonnelBoarder?: boolean;
	requiredPersonnelGroomer?: boolean;
	requiredPersonnelTransporter?: boolean;
	skip?: boolean;
};

export type IRequest = Request & { userToken: UserToken };

const excludeFromAuth = [
	'/auth/login',
	'/auth/register',
	'/auth/check',
	'/auth/activation',
	'/payments/webhook',
];

const isExcludedFromAuth = (url: string) => {
	return excludeFromAuth.includes(url);
};

const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (isExcludedFromAuth(req.url) || req.url.startsWith('/socket.io/'))
		return next();
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		res.status(401).json({ error: 'Token not provided' });
		return;
	}
	const [method, token] = authHeader && authHeader.split(' ');
	if (!method || method !== REQUEST_TYPE) {
		res.status(401).json({ error: 'Invalid method' });
		return;
	}
	jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
		if (err) return res.status(401).json({ error: 'Unauthorized' });
		(req as IRequest).userToken = decoded as UserToken;
		next();
	});
};

const socketMiddleware = (
	socket: Socket,
	next: (err?: ExtendedError) => void
) => {
	const token = socket.handshake.auth.token as string;
	if (token) {
		const [method, tokenString] = token.split(' ');
		if (!method || method !== REQUEST_TYPE) {
			return next(new Error('Invalid method'));
		}
		jwt.verify(tokenString, JWT_SECRET_KEY, (err, decoded) => {
			if (err) {
				return next(new Error('Unauthorized'));
			}
			socket.data.user = decoded;
			next();
		});
	} else {
		return next(new Error('Token not provided'));
	}
};

//Middleware to validate the request based on the user's subscription level and any request validation errors.
const validateRequest =
	({
		requiredSubscription = SUBSCRIPTION_LEVELS.BASIC,
		requiredAdmin = false,
		requiredPersonnelBoarder = false,
		requiredPersonnelGroomer = false,
		requiredPersonnelTransporter = false,
		skip = false,
	}: RequestValidation = {}) =>
	(req: Request, res: Response, next: NextFunction): void => {
		if (requiredAdmin && !(req as IRequest).userToken.isAdmin) {
			res.status(401).json({ error: 'Admin permission required' });
			return;
		}
		if (
			requiredPersonnelBoarder &&
			!(req as IRequest).userToken.isPersonnelBoarder &&
			!(req as IRequest).userToken.isAdmin
		) {
			res.status(401).json({ error: 'Personnel permission required' });
			return;
		}
		if (
			requiredPersonnelGroomer &&
			!(req as IRequest).userToken.isPersonnelGroomer &&
			!(req as IRequest).userToken.isAdmin
		) {
			res.status(401).json({ error: 'Personnel permission required' });
			return;
		}
		if (
			requiredPersonnelTransporter &&
			!(req as IRequest).userToken.isPersonnelTransporter &&
			!(req as IRequest).userToken.isAdmin
		) {
			res.status(401).json({ error: 'Personnel permission required' });
			return;
		}
		const userSubscription = skip
			? SUBSCRIPTION_LEVELS.BASIC
			: (req as IRequest).userToken.subscription_model;
		if (
			!(
				SUBSCRIPTION_INDEX_MAP.indexOf(userSubscription) >=
				SUBSCRIPTION_INDEX_MAP.indexOf(requiredSubscription)
			) &&
			!(req as IRequest).userToken.isAdmin
		) {
			res
				.status(401)
				.json({ error: 'Upgrade your plan to access these features.' });
			return;
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
			return;
		}
		next();
	};

export { authMiddleware, socketMiddleware, validateRequest };
