import { Router } from 'express';
import myPetsApi from './my-pets.js';
import adoptionApi from './adoption.js';
import { validateRequest } from '../../middleware.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import {
	getFilters,
	getPets,
	getSinglePet,
} from '../../controllers/pets/all-pets-controller.js';
import { idValidator } from '../../validators/common.js';

const app = Router();

app.use('/adoption', adoptionApi);
app.use('/my-pets', myPetsApi);

app.get(
	'/',
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getPets
);
app.get('/filters', getFilters);
app.get(
	'/:id',
	idValidator('id'),
	validateRequest({ requiredSubscription: SUBSCRIPTION_LEVELS.GOLD }),
	getSinglePet
);

export default app;
