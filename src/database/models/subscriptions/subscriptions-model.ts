import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

export type Subscriptions = Document &
	DocumentResult<any> & {
		details: any;
	};

const subscriptionsSchema = new mongoose.Schema<Subscriptions>(
	{
		details: { type: Object, required: true },
	},
	{ timestamps: true }
);

export const SubscriptionsModel = mongoose.model<Subscriptions>(
	'Subscriptions',
	subscriptionsSchema
);
