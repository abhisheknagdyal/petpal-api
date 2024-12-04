import { Router } from 'express';
import {
	createMyPets,
	deleteMyPet,
	getMyPets,
	getMySinglePet,
	updateMyPet,
} from '../../controllers/pets/my-pets-controller.js';
import { validateRequest } from '../../middleware.js';
import { idValidator } from '../../validators/common.js';
import { petsValidator } from '../../validators/pets/my-pets-validator.js';

const app = Router();

app.get('/', getMyPets);
app.get('/:id', idValidator('id'), validateRequest(), getMySinglePet);
app.post('/', ...petsValidator, validateRequest(), createMyPets);
app.put(
	'/:id',
	idValidator('id'),
	...petsValidator,
	validateRequest(),
	updateMyPet
);
app.delete('/:id', idValidator('id'), deleteMyPet);

export default app;
