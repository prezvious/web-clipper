import { initializeGeneralSettings } from '../managers/general-settings';
import { showSettingsSection, initializeSidebar } from '../managers/settings-section-ui';
import { initializeReaderSettings } from '../managers/reader-settings';
import { createIcons } from 'lucide';
import { icons } from '../icons/icons';
import { getUrlParameters } from '../utils/routing';
import { addBrowserClassToHtml } from '../utils/browser-detection';
import { translatePage, getCurrentLanguage, setLanguage, getAvailableLanguages, getMessage, setupLanguageAndDirection } from '../utils/i18n';

type VisibleSettingsSection = 'general' | 'highlighter' | 'reader';

function getVisibleSection(section: string | null): VisibleSettingsSection {
	return section === 'highlighter' || section === 'reader' ? section : 'general';
}

document.addEventListener('DOMContentLoaded', async () => {
	const { section: initialSection } = getUrlParameters();
	const targetSection = getVisibleSection(initialSection);
	document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
	document.querySelectorAll('#sidebar li[data-section]').forEach(i => i.classList.remove('active'));
	document.getElementById(`${targetSection}-section`)?.classList.add('active');
	document.querySelector(`#sidebar li[data-section="${targetSection}"]`)?.classList.add('active');

	async function initializeSettings(): Promise<void> {
		try {
			await translatePage();

			await initializeGeneralSettings();
			await initializeReaderSettings();
			handleUrlParameters();
			initializeSidebar();

			createIcons({ icons });

			const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
			if (languageSelect) {
				await initializeLanguageSelector(languageSelect);
			}
		} catch (error) {
			console.error('Error during settings initialization:', error);
			const errorContainer = document.querySelector('#content');
			if (errorContainer) {
				errorContainer.textContent = '';

				const errorDiv = document.createElement('div');
				errorDiv.style.padding = '20px';
				errorDiv.style.textAlign = 'center';

				const heading = document.createElement('h2');
				heading.textContent = 'Settings error';
				errorDiv.appendChild(heading);

				const message = document.createElement('p');
				message.textContent = 'There was an error loading your settings. This may be due to corrupted data.';
				errorDiv.appendChild(message);

				errorContainer.appendChild(errorDiv);
			}

			try {
				initializeSidebar();
			} catch (sidebarError) {
				console.error('Failed to initialize sidebar:', sidebarError);
			}
		}
	}

	async function initializeLanguageSelector(languageSelect: HTMLSelectElement): Promise<void> {
		try {
			await setupLanguageAndDirection();
			await translatePage();

			const languages = getAvailableLanguages();
			const currentLanguage = await getCurrentLanguage();
			languageSelect.textContent = '';

			languages.forEach((lang: { code: string; name: string }) => {
				const option = document.createElement('option');
				option.value = lang.code;
				option.textContent = lang.code === '' ? getMessage('systemDefault') : lang.name;
				if (lang.code === currentLanguage) {
					option.selected = true;
				}
				languageSelect.appendChild(option);
			});

			languageSelect.addEventListener('change', async () => {
				try {
					await setLanguage(languageSelect.value);
					window.location.reload();
				} catch (error) {
					console.error('Failed to change language:', error);
				}
			});
		} catch (error) {
			console.error('Failed to initialize language selector:', error);
		}
	}

	function handleUrlParameters(): void {
		const { section } = getUrlParameters();
		showSettingsSection(getVisibleSection(section));
	}

	await addBrowserClassToHtml();
	await initializeSettings();
});
