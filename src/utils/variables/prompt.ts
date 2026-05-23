import { generalSettings } from '../storage-utils';

// Prompt variables are only evaluated when interpreter support is enabled.
export async function processPrompt(match: string, variables: { [key: string]: string }, currentUrl: string): Promise<string> {
	if (generalSettings.interpreterEnabled) {
		const promptRegex = /{{(?:prompt:)?"(.*?)"(\|.*?)?}}/;
		const matches = match.match(promptRegex);
		if (!matches) {
			console.error('Invalid prompt format:', match);
			return match;
		}
	
		const [, promptText, filters = ''] = matches;
	
		return match;
	} else {
		return '';
	}
}
