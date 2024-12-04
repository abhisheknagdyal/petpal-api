import { Router } from 'express';
import {
	getGroomers,
	getMyRequests,
	getGroomerRequests,
	cancelGroomerRequest,
	createGroomerRequest,
	acceptGroomerRequest,
	declineGroomerRequest,
	startGroomerRequest,
	completeGroomerRequest,
} from '../../controllers/groomer/groomer-controller.js';
import { idValidator } from '../../validators/common.js';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { groomerValidator } from '../../validators/groomer/groomer-validator.js';

const app = Router();

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	getGroomers
);
app.get(
	'/my-requests',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	getMyRequests
);
app.get(
	'/requests',
	validateRequest({ requiredPersonnelGroomer: true }),
	getGroomerRequests
);
app.post(
	'/book/:id',
	idValidator('id'),
	...groomerValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	createGroomerRequest
);
app.put(
	'/cancel/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.PLUS }),
	cancelGroomerRequest
);
app.put(
	'/accept/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelGroomer: true }),
	acceptGroomerRequest
);
app.put(
	'/decline/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelGroomer: true }),
	declineGroomerRequest
);
app.put(
	'/start/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelGroomer: true }),
	startGroomerRequest
);
app.put(
	'/complete/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelGroomer: true }),
	completeGroomerRequest
);

export default app;
