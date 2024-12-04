import { v2 as cloudinary } from 'cloudinary';
import {
	FILE_SERVICE_API_KEY,
	FILE_SERVICE_API_SECRET,
	FILE_SERVICE_CLOUD_NAME,
} from '../constants/secrets.js';

cloudinary.config({
	cloud_name: FILE_SERVICE_CLOUD_NAME,
	api_key: FILE_SERVICE_API_KEY,
	api_secret: FILE_SERVICE_API_SECRET,
});

const imageUploader = async (base64Image: string) => {
	if (!base64Image) return '';
	let secure_url;
	const res = await cloudinary.uploader.upload(
		base64Image,
		(err, callResult) => {
			secure_url = callResult?.secure_url;
		}
	);
	return secure_url;
};

export default imageUploader;
