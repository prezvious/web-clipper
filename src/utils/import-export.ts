import { loadSettings } from '../utils/storage-utils';
import { showImportModal } from './import-modal';
import browser from '../utils/browser-polyfill';
import { saveFile } from './file-utils';
import { getMessage } from './i18n';

interface StorageData {
	[key: string]: any;
}

function removeTemplateStorageKeys(data: StorageData): StorageData {
	const cleaned: StorageData = { ...data };

	for (const key of Object.keys(cleaned)) {
		if (key === 'template_list' || key.startsWith('template_')) {
			delete cleaned[key];
		}
	}

	return cleaned;
}

export async function exportAllSettings(): Promise<void> {
	try {
		const allData = await browser.storage.sync.get(null) as StorageData;
		const exportData = removeTemplateStorageKeys(allData);
		const content = JSON.stringify(exportData, null, 2);

		await saveFile({
			content,
			fileName: 'hexel-capture-settings.json',
			mimeType: 'application/json',
			onError: (error) => console.error('Failed to export settings:', error)
		});
	} catch (error) {
		console.error('Error in exportAllSettings:', error);
		alert(getMessage('failedToExportSettings'));
	}
}

export function importAllSettings(): void {
	showImportModal(
		'import-modal',
		importAllSettingsFromJson,
		'.json',
		'importAllSettings'
	);
}

async function importAllSettingsFromJson(jsonContent: string): Promise<void> {
	try {
		const settings = JSON.parse(jsonContent) as StorageData;

		if (confirm(getMessage('confirmReplaceSettings'))) {
			const importData = removeTemplateStorageKeys(settings);

			await browser.storage.sync.clear();
			await browser.storage.sync.set(importData);
			await loadSettings();
			alert(getMessage('settingsImportSuccess'));
		}
	} catch (error) {
		console.error('Error importing all settings:', error);
		throw new Error('Error importing settings. Please check the file and try again.');
	}
}
