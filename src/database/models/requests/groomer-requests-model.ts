import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type GRequest = Document &
	DocumentResult<any> & {
		requesterId: any;
		requestedId: any;
		petType: string;
		petId: any;
		timeSlot: [number, number];
		status: 'pending' | 'rejected' | 'accepted' | 'started';
	};

const groomerRequestSchema = new mongoose.Schema<GRequest>(
	{
		requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		requestedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Groomer' },
		petType: { type: String, required: true },
		petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pets' },
		timeSlot: { type: [Number, Number], required: true },
		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'started'],
		},
	},
	{ timestamps: true }
);

export const GroomerRequestModel = mongoose.model<GRequest>(
	'Groomer Requests',
	groomerRequestSchema
);
