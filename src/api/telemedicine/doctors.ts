import { Router } from 'express';
import {
	getDoctors,
	getSingleDoctor,
	createDoctor,
	updateDoctor,
	deleteDoctor,
} from '../../controllers/telemedicine/doctors-controller.js';
import { validateRequest } from '../../middleware.js';
import { doctorsValidator } from '../../validators/telemedicine/doctors-validator.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { idValidator } from '../../validators/common.js';

const app = Router();

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getDoctors
);
app.get(
	'/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getSingleDoctor
);
app.post(
	'/create',
	...doctorsValidator,
	validateRequest({ requiredAdmin: true }),
	createDoctor
);
app.put(
	'/update/:id',
	idValidator('id'),
	...doctorsValidator,
	validateRequest({ requiredAdmin: true }),
	updateDoctor
);
app.delete(
	'/delete/:id',
	idValidator('id'),
	validateRequest({ requiredAdmin: true }),
	deleteDoctor
);

export default app;
