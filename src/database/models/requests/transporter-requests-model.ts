import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type TRequest = Document &
	DocumentResult<any> & {
		requesterId: any;
		requestedId: any;
		pickUpDate: any;
		locationFrom: string;
		locationTo: string;
		petId: any;
		status: 'pending' | 'rejected' | 'accepted' | 'started';
	};

const transporterRequestSchema = new mongoose.Schema<TRequest>(
	{
		requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		requestedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter' },
		petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pets' },
		pickUpDate: { type: Date, required: true },
		locationFrom: { type: String, required: true },
		locationTo: { type: String, required: true },
		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'started'],
		},
	},
	{ timestamps: true }
);

export const TransporterRequestModel = mongoose.model<TRequest>(
	'Transporter Requests',
	transporterRequestSchema
);
