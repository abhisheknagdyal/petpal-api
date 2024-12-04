import { Router } from 'express';
import { idValidator } from '../../validators/common.js';
import { validateRequest } from '../../middleware.js';
import {
	createLiveSession,
	closeLiveSession,
	watchLiveSession,
} from '../../controllers/boarding/monitoring-controller.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import {
	monitoringValidator,
	monitoringCloseValidator,
} from '../../validators/boarding/monitoring-validator.js';

const app = Router();

app.get(
	'/live/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	watchLiveSession
);
app.put(
	'/start',
	...monitoringValidator,
	validateRequest({ requiredPersonnelBoarder: true }),
	createLiveSession
);
app.put(
	'/complete',
	...monitoringCloseValidator,
	validateRequest({ requiredPersonnelBoarder: true }),
	closeLiveSession
);

export default app;
