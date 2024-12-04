import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';
import { SUBSCRIPTION_LEVELS } from '../../../constants/subscription-models.js';

type BRequest = Document &
	DocumentResult<any> & {
		requesterId: any;
		requestedId: any;
		petType: string;
		petId: any;
		timeSlot: [number, number];
		userSubscriptionModel: string;
		status: 'pending' | 'rejected' | 'accepted' | 'started';
		sessionId?: string;
	};

const boarderRequestSchema = new mongoose.Schema<BRequest>(
	{
		requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		requestedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boarder' },
		petType: { type: String, required: true },
		petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pets' },
		timeSlot: { type: [Number, Number], required: true },
		userSubscriptionModel: {
			type: String,
			required: true,
			enum: SUBSCRIPTION_LEVELS,
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'started'],
		},
		sessionId: { type: String },
	},
	{ timestamps: true }
);

export const BoarderRequestModel = mongoose.model<BRequest>(
	'Boarder Requests',
	boarderRequestSchema
);
