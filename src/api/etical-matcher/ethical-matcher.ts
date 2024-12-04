import { Router } from 'express';
import { getMatchScore } from '../../controllers/ethical-matcher/ethical-matcher.js';
import { ethicalMatcherValidator } from '../../validators/ethical-matcher/ethical-matcher-validator.js';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';

const app = Router();

app.post(
	'/get-match',
	...ethicalMatcherValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getMatchScore
);

export default app;
