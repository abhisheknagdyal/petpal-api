import { Router } from 'express';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { likeValidator } from '../../validators/social/social-validator.js';
import {
	getAllUsersWithPetData,
	likeUser,
	unlikeUser,
	unMatchUser,
	getStatus,
	getMessagesById,
	getMyMatches,
	createBreedingMatch,
	getMyBreedingMatches,
} from '../../controllers/social/social-controller.js';

const app = Router();

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getAllUsersWithPetData
);
app.get(
	'/matches',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getMyMatches
);
app.get(
	'/matches-breeding',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getMyBreedingMatches
);
app.get(
	'/status/:id',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getStatus
);
app.get(
	'/messages/:id',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getMessagesById
);
app.post(
	'/like',
	...likeValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	likeUser
);
app.post(
	'/unlike',
	...likeValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	unlikeUser
);
app.post(
	'/un-match',
	...likeValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	unMatchUser
);
app.post(
	'/create-breed',
	...likeValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	createBreedingMatch
);

export default app;
