import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { deleteOne, getOne, updateOne } from '../../database/crud.js';
import { User } from '../../database/models/auth/auth-model.js';
import { BoarderRequestModel } from '../../database/models/requests/boarder-requests-model.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';
import { MONITORING_CONNECTION_STRING } from '../../constants/secrets.js';
import { MonitoringModel } from '../../database/models/monitoring/monitoring-model.js';

const monitoringPool = () =>
	mongoose.createConnection(MONITORING_CONNECTION_STRING);

const createLiveSession = async (
	req: Request,
	res: Response
): Promise<void> => {
	const request = await getOne(BoarderRequestModel, req.body.requestId);
	if (!request) {
		res.status(400).send({ error: `Request not found: ${req.body.requestId}` });
		return;
	}
	const requester = await getOne(User, req.body.userId);
	if (!requester) {
		res
			.status(400)
			.send({ error: `Requester not found ${req.body.requestId}` });
		return;
	}
	if (requester.subscriptionModel !== SUBSCRIPTION_LEVELS.GOLD) {
		res.status(400).json({
			error: `Requester doesnt have required subscription plan to access this feature`,
		});
		return;
	}
	const MonitoringSessionDB = MonitoringModel(monitoringPool());
	const sessionResponse = await MonitoringSessionDB.create(req.body);
	if (sessionResponse) {
		await updateOne(BoarderRequestModel, req.body.requestId, {
			status: 'started',
			sessionId: sessionResponse._id,
		});
	}
	await monitoringPool().close();
	res.status(200).json({ message: `Live session created: ${req.params.id}` });
	return;
};

const closeLiveSession = async (req: Request, res: Response): Promise<void> => {
	const request = await getOne(BoarderRequestModel, req.body.requestId);
	if (!request) {
		res.status(400).send({ error: `Request not found: ${req.body.requestId}` });
		return;
	}
	const MonitoringSessionDB = MonitoringModel(monitoringPool());
	const sessionResponse = await MonitoringSessionDB.findByIdAndDelete(
		request.sessionId
	);
	if (sessionResponse) {
		await deleteOne(BoarderRequestModel, req.body.requestId);
	}
	await monitoringPool().close();
	res
		.status(200)
		.json({ message: `Live session closed: ${req.body.requestId}` });
	return;
};

const watchLiveSession = async (req: Request, res: Response): Promise<void> => {
	const request = await getOne(BoarderRequestModel, req.params.id);
	if (!request) {
		res.status(400).send({ error: `Request not found: ${req.params.id}` });
		return;
	}
	const MonitoringSessionDB = MonitoringModel(monitoringPool());
	const sessionResponse = await MonitoringSessionDB.findById(request.sessionId);
	await monitoringPool().close();
	res.status(200).json(sessionResponse);
	return;
};

export { createLiveSession, closeLiveSession, watchLiveSession };
