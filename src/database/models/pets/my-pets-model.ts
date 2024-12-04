import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

export type Pet = Document &
	DocumentResult<any> & {
		name: string;
		species: string;
		breed: string;
		age: number;
		gender?: string;
		size?: 'small' | 'medium' | 'large';
		color?: string;
		weight: number;
		spayed_neutered?: boolean;
		vaccinated?: boolean;
		description?: string;
		medical_conditions?: string;
		last_checkup_date?: Date;
		location?: string;
		owner_id?: string;
		good_with_children?: boolean;
		good_with_pets?: boolean;
		activity_level?: 'low' | 'mid' | 'high';
		special_needs?: string;
		photo_url?: string;
		createdAt?: Date;
		updatedAt?: Date;
	};

const petSchema = new mongoose.Schema<Pet>(
	{
		name: { type: String, required: true },
		species: { type: String, required: true },
		breed: { type: String, required: true },
		age: { type: Number, required: true },
		gender: String,
		size: { type: String, enum: ['small', 'medium', 'large'] }, // small, medium, large
		color: String,
		weight: { type: Number, required: true },
		spayed_neutered: Boolean,
		vaccinated: Boolean,
		description: String,
		medical_conditions: String,
		last_checkup_date: Date,
		location: String,
		owner_id: String,
		good_with_children: Boolean,
		good_with_pets: Boolean,
		activity_level: { type: String, enum: ['low', 'mid', 'high'] }, // low, mid, high
		special_needs: String,
		photo_url: String,
	},
	{ timestamps: true }
);

export const PetsModel = mongoose.model<Pet>('Pets', petSchema);
