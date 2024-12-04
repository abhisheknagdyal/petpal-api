import { Router } from 'express';
import { getUsers } from '../../controllers/users/users-controller.js';
import { validateRequest } from '../../middleware.js';

const app = Router();

app.get('/', validateRequest({ requiredAdmin: true }), getUsers);

export default app;
