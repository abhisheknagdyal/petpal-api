import {
	CLIENT_WORKFLOW_URL,
	MONITORING_MD_URL,
} from '../constants/secrets.js';

const workflowLink = (userID: string, key: string) =>
	`${CLIENT_WORKFLOW_URL}?key=${key}&user=${userID}`;

const htmlGenerator = (userID: string, key: string, showMD: boolean) =>
	`
  <div style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h2 style="text-align: center; color: #007bff;">PetPal Account Activation Request</h2>
      <p>Hello,</p>
      <p>We received a request to activate your PetPal account. You can set your password by clicking the button below:</p>
      <div style="text-align: center; margin: 20px 0;">
      <a href="${workflowLink(userID, key)}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Activate</a>
      </div>
      ${showMD ? `<p>Download the monitoring platform from <a href="${MONITORING_MD_URL}">here</a></p>` : `<br/>`}
      <p>If you didn’t request an account activation, you can safely ignore this email.</p>
      <p>Best regards,<br>PetPal family</p>
      <hr style="border-top: 1px solid #ccc; margin-top: 20px;">
      <footer style="text-align: center; font-size: 12px; color: #888;">
        <p>PetPal, Inc.</p>
        <p>Somewhere, someplace, 42069</p>
      </footer>
    </div>
  </div>
  `;

export default htmlGenerator;
