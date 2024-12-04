import { Router } from 'express';
import {
	getConfig,
	register,
	updatePassword,
	login,
	updateUser,
	boardGroomer,
	boardBoarder,
	checkCredentials,
	boardTransporter,
} from '../../controllers/auth/auth-controller.js';
import {
	selfRegistrationValidator,
	userRegistrationValidator,
	activationValidator,
	loginValidator,
	checkValidator,
	userUpdateValidator,
	groomerBoarderValidator,
	transporterValidator,
} from '../../validators/auth/auth-validator.js';
import { validateRequest } from '../../middleware.js';

const app = Router();

app.get('/config', getConfig);
app.post(
	'/register',
	...selfRegistrationValidator,
	validateRequest({ skip: true }),
	register
);
app.post(
	'/register-user',
	...userRegistrationValidator,
	validateRequest({ requiredAdmin: true }),
	register
);
app.post(
	'/activation',
	...activationValidator,
	validateRequest({ skip: true }),
	updatePassword
);
app.post('/login', ...loginValidator, validateRequest({ skip: true }), login);
app.post(
	'/check',
	...checkValidator,
	validateRequest({ skip: true }),
	checkCredentials
);
app.post('/update', ...userUpdateValidator, validateRequest(), updateUser);
app.post(
	'/board-groomer',
	...groomerBoarderValidator,
	validateRequest(),
	boardGroomer
);
app.post(
	'/board-boarder',
	...groomerBoarderValidator,
	validateRequest(),
	boardBoarder
);
app.post(
	'/board-transporter',
	...transporterValidator,
	validateRequest(),
	boardTransporter
);

export default app;
