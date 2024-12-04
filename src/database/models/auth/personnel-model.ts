import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

export type GroomerBoarder = Document &
	DocumentResult<any> & {
		name: string;
		contact: string;
		address: string;
		petType: string[];
		timeAvailable: [number, number];
		city: string;
		photo_url: string;
		userRefId: string;
	};

const groomerBoarderSchema = new mongoose.Schema<GroomerBoarder>(
	{
		name: { type: String, required: true },
		contact: { type: String, unique: true, required: true },
		address: { type: String },
		petType: { type: [] },
		timeAvailable: { type: [Number, Number] },
		city: { type: String },
		photo_url: { type: String },
		userRefId: { type: String, required: true },
	},
	{ timestamps: true }
);

export const GroomerModel = mongoose.model<GroomerBoarder>(
	'Groomer',
	groomerBoarderSchema
);
export const BoarderModel = mongoose.model<GroomerBoarder>(
	'Boarder',
	groomerBoarderSchema
);
export const TransporterModel = mongoose.model<GroomerBoarder>(
	'Transporter',
	groomerBoarderSchema
);
