import { Router } from 'express';
import authApi from './auth/auth.js';
import petsApi from './pets/_api.js';
import paymentsApi from './payments/_api.js';
import telemedicineApi from './telemedicine/_api.js';
import shopApi from './products/_api.js';
import groomerApi from './groomer/groomer.js';
import boardingApi from './boarding/_api.js';
import ethicalMatcherApi from './etical-matcher/ethical-matcher.js';
import usersApi from './users/users.js';
import socialApi from './social/social.js';
import transporterApi from './transport/transport.js';

const app = Router();

app.use('/auth', authApi);
app.use('/pets', petsApi);
app.use('/payments', paymentsApi);
app.use('/telemedicine', telemedicineApi);
app.use('/shop', shopApi);
app.use('/groomer', groomerApi);
app.use('/boarding', boardingApi);
app.use('/ethical-matcher', ethicalMatcherApi);
app.use('/users', usersApi);
app.use('/social', socialApi);
app.use('/transport', transporterApi);

export default app;
