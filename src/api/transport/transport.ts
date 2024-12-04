import { Router } from 'express';
import {
	getTransporters,
	getMyRequests,
	getTransporterRequests,
	cancelTransporterRequest,
	createTransporterRequest,
	acceptTransporterRequest,
	declineTransporterRequest,
	startTransporterRequest,
	completeTransporterRequest,
} from '../../controllers/transport/transport-controller.js';
import { idValidator } from '../../validators/common.js';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { transporterValidator } from '../../validators/transporter/transporter-validator.js';

const app = Router();

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getTransporters
);
app.get(
	'/my-requests',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getMyRequests
);
app.get(
	'/requests',
	validateRequest({ requiredPersonnelTransporter: true }),
	getTransporterRequests
);
app.post(
	'/book/:id',
	idValidator('id'),
	...transporterValidator,
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	createTransporterRequest
);
app.put(
	'/cancel/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	cancelTransporterRequest
);
app.put(
	'/accept/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelTransporter: true }),
	acceptTransporterRequest
);
app.put(
	'/decline/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelTransporter: true }),
	declineTransporterRequest
);
app.put(
	'/start/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelTransporter: true }),
	startTransporterRequest
);
app.put(
	'/complete/:id',
	idValidator('id'),
	validateRequest({ requiredPersonnelTransporter: true }),
	completeTransporterRequest
);

export default app;
