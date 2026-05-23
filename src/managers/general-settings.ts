import { getCommands } from '../utils/hotkeys';
import { initializeToggles, initializeSettingToggle } from '../utils/ui-utils';
import { generalSettings, loadSettings, saveSettings, setLocalStorage, getLocalStorage, getClipHistory } from '../utils/storage-utils';
import { detectBrowser } from '../utils/browser-detection';
import { createElementWithClass } from '../utils/dom-utils';
import { exportAllSettings, importAllSettings } from '../utils/import-export';
import { exportHighlights } from './highlights-manager';
import { getMessage, setupLanguageAndDirection } from '../utils/i18n';
import { debounce } from '../utils/debounce';
import browser from '../utils/browser-polyfill';
import { createUsageChart, aggregateUsageData } from '../utils/charts';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { showModal, hideModal } from '../utils/modal-utils';

dayjs.extend(weekOfYear);

const STORE_URLS = {
	chrome: 'https://chromewebstore.google.com/detail/obsidian-web-clipper/cnjifjpddelmedmihgijeibhnjfabmlf',
	firefox: 'https://addons.mozilla.org/en-US/firefox/addon/web-clipper-obsidian/',
	safari: 'https://apps.apple.com/us/app/obsidian-web-clipper/id6720708363',
	edge: 'https://microsoftedge.microsoft.com/addons/detail/obsidian-web-clipper/eigdjhmgnaaeaonimdklocfekkaanfme'
};

export async function setShortcutInstructions() {
	const shortcutInstructionsElement = document.querySelector('.shortcut-instructions');
	if (!shortcutInstructionsElement) return;

	const browser = await detectBrowser();
	shortcutInstructionsElement.textContent = '';
	shortcutInstructionsElement.appendChild(document.createTextNode(getMessage('shortcutInstructionsIntro') + ' '));

	let instructionsText = '';
	let url = '';

	switch (browser) {
		case 'chrome':
			instructionsText = getMessage('shortcutInstructionsChrome', ['$URL']);
			url = 'chrome://extensions/shortcuts';
			break;
		case 'brave':
			instructionsText = getMessage('shortcutInstructionsBrave', ['$URL']);
			url = 'brave://extensions/shortcuts';
			break;
		case 'firefox':
			instructionsText = getMessage('shortcutInstructionsFirefox', ['$URL']);
			url = 'about:addons';
			break;
		case 'edge':
			instructionsText = getMessage('shortcutInstructionsEdge', ['$URL']);
			url = 'edge://extensions/shortcuts';
			break;
		case 'safari':
		case 'mobile-safari':
			instructionsText = getMessage('shortcutInstructionsSafari');
			break;
		default:
			instructionsText = getMessage('shortcutInstructionsDefault');
	}

	if (!url) {
		shortcutInstructionsElement.appendChild(document.createTextNode(instructionsText));
		return;
	}

	const parts = instructionsText.split('$URL');
	if (parts.length !== 2) {
		shortcutInstructionsElement.appendChild(document.createTextNode(instructionsText));
		return;
	}

	shortcutInstructionsElement.appendChild(document.createTextNode(parts[0]));
	const strongElement = document.createElement('strong');
	strongElement.textContent = url;
	shortcutInstructionsElement.appendChild(strongElement);
	shortcutInstructionsElement.appendChild(document.createTextNode(parts[1]));
}

async function initializeVersionDisplay(): Promise<void> {
	const manifest = browser.runtime.getManifest();
	const versionNumber = document.getElementById('version-number');
	const updateAvailable = document.getElementById('update-available');
	const usingLatestVersion = document.getElementById('using-latest-version');

	if (versionNumber) {
		versionNumber.textContent = manifest.version;
	}

	const currentBrowser = await detectBrowser();
	if (currentBrowser !== 'safari' && currentBrowser !== 'mobile-safari' && browser.runtime.onUpdateAvailable) {
		browser.runtime.onUpdateAvailable.addListener(() => {
			if (updateAvailable && usingLatestVersion) {
				updateAvailable.style.display = 'block';
				usingLatestVersion.style.display = 'none';
			}
		});
		return;
	}

	if (updateAvailable) updateAvailable.style.display = 'none';
	if (usingLatestVersion) usingLatestVersion.style.display = 'none';
}

export function initializeGeneralSettings(): void {
	loadSettings().then(async () => {
		await setupLanguageAndDirection();
		await initializeVersionDisplay();

		const history = await getClipHistory();
		const totalClips = history.length;
		const existingRatings = await getLocalStorage('ratings') || [];

		const rateExtensionSection = document.getElementById('rate-extension');
		if (rateExtensionSection && totalClips >= 20 && existingRatings.length === 0) {
			rateExtensionSection.classList.remove('is-hidden');
		}

		if (totalClips >= 20 && existingRatings.length === 0) {
			const starRating = document.querySelector('.star-rating');
			if (starRating) {
				const stars = starRating.querySelectorAll('.star');
				stars.forEach(star => {
					star.addEventListener('click', async () => {
						const rating = parseInt(star.getAttribute('data-rating') || '0');
						stars.forEach(s => {
							s.classList.toggle('is-active', parseInt(s.getAttribute('data-rating') || '0') <= rating);
						});
						await handleRating(rating);
						if (rateExtensionSection) {
							rateExtensionSection.style.display = 'none';
						}
					});
				});
			}
		}

		initializeSavedPageIndicatorToggle();
		initializeSavedPageFaviconToggle();
		initializeKeyboardShortcuts();
		initializeToggles();
		setShortcutInstructions();
		initializeAutoSave();
		initializeExportImportAllSettingsButtons();
		initializeHighlighterSettings();
		initializeExportHighlightsButton();
		await initializeUsageChart();

		const feedbackModal = document.getElementById('feedback-modal');
		const feedbackCloseBtn = feedbackModal?.querySelector('.feedback-close-btn');
		if (feedbackCloseBtn) {
			feedbackCloseBtn.addEventListener('click', () => hideModal(feedbackModal));
		}
	});
}

function initializeAutoSave(): void {
	const generalSettingsForm = document.getElementById('general-settings-form');
	if (!generalSettingsForm) return;

	generalSettingsForm.addEventListener('input', debounce(saveSettingsFromForm, 500));
	generalSettingsForm.addEventListener('change', debounce(saveSettingsFromForm, 500));
}

function saveSettingsFromForm(): void {
	const savedPageIndicatorToggle = document.getElementById('saved-page-indicator-toggle') as HTMLInputElement;
	const savedPageFaviconToggle = document.getElementById('saved-page-favicon-toggle') as HTMLInputElement;
	const highlighterToggle = document.getElementById('highlighter-toggle') as HTMLInputElement;
	const alwaysShowHighlightsToggle = document.getElementById('highlighter-visibility') as HTMLInputElement;
	const highlightBehaviorSelect = document.getElementById('highlighter-behavior') as HTMLSelectElement;

	saveSettings({
		showSavedPageIndicator: savedPageIndicatorToggle?.checked ?? generalSettings.showSavedPageIndicator,
		changeSavedPageFavicon: savedPageFaviconToggle?.checked ?? generalSettings.changeSavedPageFavicon,
		highlighterEnabled: highlighterToggle?.checked ?? generalSettings.highlighterEnabled,
		alwaysShowHighlights: alwaysShowHighlightsToggle?.checked ?? generalSettings.alwaysShowHighlights,
		highlightBehavior: highlightBehaviorSelect?.value ?? generalSettings.highlightBehavior,
	});
}

async function initializeKeyboardShortcuts(): Promise<void> {
	const shortcutsList = document.getElementById('keyboard-shortcuts-list');
	if (!shortcutsList) return;

	const browser = await detectBrowser();
	if (browser === 'mobile-safari') {
		const messageItem = document.createElement('div');
		messageItem.className = 'shortcut-item';
		messageItem.textContent = getMessage('shortcutInstructionsSafari');
		shortcutsList.appendChild(messageItem);
		return;
	}

	getCommands().then(commands => {
		commands.forEach(command => {
			const shortcutItem = createElementWithClass('div', 'shortcut-item');

			const descriptionSpan = document.createElement('span');
			descriptionSpan.textContent = command.description;
			shortcutItem.appendChild(descriptionSpan);

			const hotkeySpan = createElementWithClass('span', 'setting-hotkey');
			hotkeySpan.textContent = command.shortcut || getMessage('shortcutNotSet');
			shortcutItem.appendChild(hotkeySpan);

			shortcutsList.appendChild(shortcutItem);
		});
	});
}

function initializeSavedPageIndicatorToggle(): void {
	initializeSettingToggle('saved-page-indicator-toggle', generalSettings.showSavedPageIndicator, (checked) => {
		saveSettings({ showSavedPageIndicator: checked });
	});
}

function initializeSavedPageFaviconToggle(): void {
	initializeSettingToggle('saved-page-favicon-toggle', generalSettings.changeSavedPageFavicon, (checked) => {
		saveSettings({ changeSavedPageFavicon: checked });
	});
}

function initializeExportImportAllSettingsButtons(): void {
	const exportAllSettingsBtn = document.getElementById('export-all-settings-btn');
	if (exportAllSettingsBtn) {
		exportAllSettingsBtn.addEventListener('click', exportAllSettings);
	}

	const importAllSettingsBtn = document.getElementById('import-all-settings-btn');
	if (importAllSettingsBtn) {
		importAllSettingsBtn.addEventListener('click', importAllSettings);
	}
}

function initializeExportHighlightsButton(): void {
	const exportHighlightsBtn = document.getElementById('export-highlights');
	if (exportHighlightsBtn) {
		exportHighlightsBtn.addEventListener('click', exportHighlights);
	}
}

function initializeHighlighterSettings(): void {
	initializeSettingToggle('highlighter-toggle', generalSettings.highlighterEnabled, (checked) => {
		saveSettings({ highlighterEnabled: checked });
	});

	initializeSettingToggle('highlighter-visibility', generalSettings.alwaysShowHighlights, (checked) => {
		saveSettings({ alwaysShowHighlights: checked });
	});

	const highlightBehaviorSelect = document.getElementById('highlighter-behavior') as HTMLSelectElement;
	if (highlightBehaviorSelect) {
		highlightBehaviorSelect.value = generalSettings.highlightBehavior;
		highlightBehaviorSelect.addEventListener('change', () => {
			saveSettings({ highlightBehavior: highlightBehaviorSelect.value });
		});
	}
}

async function initializeUsageChart(): Promise<void> {
	const chartContainer = document.getElementById('usage-chart');
	const periodSelect = document.getElementById('usage-period-select') as HTMLSelectElement;
	const aggregationSelect = document.getElementById('usage-aggregation-select') as HTMLSelectElement;
	if (!chartContainer || !periodSelect || !aggregationSelect) return;

	const history = await getClipHistory();

	const updateChart = async () => {
		const options = {
			timeRange: periodSelect.value as '30d' | 'all',
			aggregation: aggregationSelect.value as 'day' | 'week' | 'month'
		};

		const chartData = aggregateUsageData(history, options);
		await createUsageChart(chartContainer, chartData);
	};

	await updateChart();
	periodSelect.addEventListener('change', updateChart);
	aggregationSelect.addEventListener('change', updateChart);
}

async function handleRating(rating: number) {
	const existingRatings = await getLocalStorage('ratings') || [];
	const newRating = {
		rating,
		date: new Date().toISOString()
	};

	const updatedRatings = [...existingRatings, newRating];
	generalSettings.ratings = updatedRatings;

	await setLocalStorage('ratings', updatedRatings);
	await saveSettings();

	if (rating >= 4) {
		const browser = await detectBrowser();
		let storeUrl = STORE_URLS.chrome;

		switch (browser) {
			case 'firefox':
			case 'firefox-mobile':
				storeUrl = STORE_URLS.firefox;
				break;
			case 'safari':
			case 'mobile-safari':
			case 'ipad-os':
				storeUrl = STORE_URLS.safari;
				break;
			case 'edge':
				storeUrl = STORE_URLS.edge;
				break;
		}

		window.open(storeUrl, '_blank');
		return;
	}

	showModal(document.getElementById('feedback-modal'));
}
