import nodemailer from 'nodemailer';
import {
	MAIL_SERVICE,
	MAIL_SERVICE_PASSWORD,
	MAIL_SERVICE_USER,
} from '../constants/secrets.js';
import htmlGenerator from './html-generator.js';

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	name: 'smtp.gmail.com',
	secure: false,
	service: MAIL_SERVICE,
	auth: {
		user: MAIL_SERVICE_USER,
		pass: MAIL_SERVICE_PASSWORD,
	},
});

export const generateMailOptions = (
	recipient: string,
	userId: string,
	key: string,
	showMD: boolean
) => ({
	from: `PetPal <${MAIL_SERVICE_USER}>`,
	to: recipient,
	subject: 'Set your PetPal account password.',
	html: htmlGenerator(userId, key, showMD),
});

export default transporter;
