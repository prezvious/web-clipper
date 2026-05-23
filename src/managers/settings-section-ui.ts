import { updateUrl } from '../utils/routing';

export type SettingsSection = 'general' | 'highlighter' | 'reader';

export function showSettingsSection(section: SettingsSection): void {
	const sections = document.querySelectorAll('.settings-section');
	const sidebarItems = document.querySelectorAll('#sidebar li[data-section]');

	sections.forEach(s => s.classList.remove('active'));
	sidebarItems.forEach(item => item.classList.remove('active'));

	document.getElementById(`${section}-section`)?.classList.add('active');
	document.querySelector(`#sidebar li[data-section="${section}"]`)?.classList.add('active');

	updateUrl(section);
}

export function initializeSidebar(): void {
	const sidebar = document.getElementById('sidebar');
	const settingsContainer = document.getElementById('settings');
	const hamburgerMenu = document.getElementById('hamburger-menu');
	const sidebarTitle = document.getElementById('settings-sidebar-title');

	if (sidebarTitle) {
		sidebarTitle.addEventListener('click', () => {
			showSettingsSection('general');
		});
	}

	if (sidebar) {
		sidebar.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const li = target.closest('li[data-section]') as HTMLElement | null;
			const section = li?.dataset.section;
			if (section === 'general' || section === 'highlighter' || section === 'reader') {
				showSettingsSection(section);
			}
			settingsContainer?.classList.remove('sidebar-open');
			hamburgerMenu?.classList.remove('is-active');
		});
	}

	if (hamburgerMenu && settingsContainer) {
		hamburgerMenu.addEventListener('click', () => {
			settingsContainer.classList.toggle('sidebar-open');
			hamburgerMenu.classList.toggle('is-active');
		});
	}
}
