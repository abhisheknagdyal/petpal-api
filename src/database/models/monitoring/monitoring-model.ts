import mongoose, { type Connection } from 'mongoose';
import { SUBSCRIPTION_LEVELS } from '../../../constants/subscription-models.js';

type Monitoring = {};

const sessionSchema = new mongoose.Schema<Monitoring>(
	{
		requestId: { type: String, required: true },
		sessionURL: { type: String, required: true },
		userId: { type: String, required: true },
		userSubscriptionModel: {
			type: String,
			required: true,
			enum: SUBSCRIPTION_LEVELS,
		},
	},
	{ timestamps: true }
);

export const MonitoringModel = (sessionPool: Connection) =>
	sessionPool.model<Monitoring>('Monitoring Session', sessionSchema);
