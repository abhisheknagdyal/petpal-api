import { Router } from 'express';
import {
	getBoarders,
	getBoardingRequests,
	getMyRequests,
	createBoardingRequest,
	cancelBoardingRequest,
	acceptBoardingRequest,
	declineBoardingRequest,
	startBoarderRequest,
	completeBoarderRequest,
} from '../../controllers/boarding/boarding-controller.js';
import { idValidator } from '../../validators/common.js';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { boardingValidator } from '../../validators/boarding/boarding-validator.js';

const app = Router();

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	getBoarders
);
app.get(
	'/requests',
	validateRequest({ requiredPersonnelBoarder: true }),
	getBoardingRequests
);
app.get(
	'/my-requests',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	getMyRequests
);
app.post(
	'/book/:id',
	idValidator('id'),
	...boardingValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	createBoardingRequest
);
app.put(
	'/cancel/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	cancelBoardingRequest
);
app.put(
	'/accept/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelBoarder: true }),
	acceptBoardingRequest
);
app.put(
	'/decline/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelBoarder: true }),
	declineBoardingRequest
);
app.put(
	'/start/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelBoarder: true }),
	startBoarderRequest
);
app.put(
	'/complete/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelBoarder: true }),
	completeBoarderRequest
);

export default app;
