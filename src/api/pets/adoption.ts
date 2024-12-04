import { Router } from 'express';
import {
	getAvailablePets,
	getSingleAdoptablePet,
	createPetAdoption,
	deletedAdoption,
	adoptPet,
	putPetForAdoption,
	cancelAdoption,
	updatePetAdoptionDetails,
} from '../../controllers/pets/adoption-controller.js';
import { validateRequest } from '../../middleware.js';
import { idValidator } from '../../validators/common.js';
import { petsValidator } from '../../validators/pets/my-pets-validator.js';

const app = Router();

app.get('/', getAvailablePets);
app.get('/:id', idValidator('id'), getSingleAdoptablePet);
app.post(
	'/create',
	...petsValidator,
	validateRequest({ requiredAdmin: true }),
	createPetAdoption
);
app.put(
	'/update/:id',
	...petsValidator,
	validateRequest({ requiredAdmin: true }),
	updatePetAdoptionDetails
);
app.put('/adopt/:id', idValidator('id'), adoptPet);
app.delete(
	'/delete/:id',
	idValidator('id'),
	validateRequest({ requiredAdmin: true }),
	deletedAdoption
);
app.put(
	'/abandon/:id',
	idValidator('id'),
	validateRequest(),
	putPetForAdoption
);
app.put('/cancel/:id', idValidator('id'), validateRequest(), cancelAdoption);

export default app;
