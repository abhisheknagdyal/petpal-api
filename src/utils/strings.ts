export const formatRawResponseIntoJson = (rawResponse: string) => {
	// Step 1: Strip any potential Markdown (```) that could be wrapping the response.
	let cleanString = rawResponse.replace(/^```json\n/, '').replace(/\n```$/, '');

	// Step 2: Check if there are any unusual characters or extra formatting.
	// This is a safeguard to remove anything potentially problematic.
	cleanString = cleanString.trim();

	// Step 3: Replace any literal `\n` with actual newlines to handle escape sequences.
	// cleanString = cleanString.replace(/\\n/g, '\n');

	// Step 4: Attempt to parse the cleaned string into JSON.
	try {
		return cleanString; // Successfully parsed JSON
	} catch (e) {
		// If an error occurs (e.g., invalid JSON format), log the error and return a fallback response
		console.error('Error parsing JSON:', e);
		console.error('Raw response:', rawResponse);
		return { error: 'Invalid JSON format', rawResponse: rawResponse };
	}
};
