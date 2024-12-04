import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type Contact = {
	phone: string;
	email: string;
};

type Address = {
	street?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
};

type Availability = {
	days: string[];
	timeSlots: [number, number];
};

export type Doctor = Document &
	DocumentResult<any> & {
		name: string;
		specialization: string;
		licenseNumber: string;
		contact: Contact;
		clinicAddress?: Address;
		experienceYears: number;
		availability: Availability;
		rating?: number;
		profilePicture?: string;
		bio?: string;
		createdAt?: Date;
		updatedAt?: Date;
	};

const doctorSchema = new mongoose.Schema<Doctor>(
	{
		name: {
			type: String,
			required: true,
		},
		specialization: {
			type: String,
			required: true, // e.g., general vet, surgery, dermatology, etc.
		},
		licenseNumber: {
			type: String,
			required: true,
			unique: true,
		},
		contact: {
			phone: {
				type: String,
				required: true,
			},
			email: {
				type: String,
				required: true,
				unique: true,
			},
		},
		clinicAddress: {
			street: String,
			city: String,
			state: String,
			postalCode: String,
			country: String,
		},
		experienceYears: {
			type: Number,
			required: true,
		},
		availability: {
			days: [String],
			timeSlots: [Number],
		},
		rating: {
			type: Number,
			default: 0,
		},
		profilePicture: String,
		bio: String,
	},
	{
		timestamps: true,
	}
);

export const DoctorModel = mongoose.model('Doctor', doctorSchema);
