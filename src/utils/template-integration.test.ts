import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { parseHTML } from 'linkedom';
import { clip, DocumentParser } from '../api';
import { Template } from '../types/types';

// ---------------------------------------------------------------------------
// Freeze time so {{date}} is deterministic in expected output
// ---------------------------------------------------------------------------

const FROZEN_DATE = new Date('2025-01-15T12:00:00Z');
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
	process.env.TZ = 'America/Los_Angeles';
	vi.useFakeTimers({ now: FROZEN_DATE });
});

afterAll(() => {
	vi.useRealTimers();
	if (ORIGINAL_TZ === undefined) {
		delete process.env.TZ;
	} else {
		process.env.TZ = ORIGINAL_TZ;
	}
});

// ---------------------------------------------------------------------------
// Fixture types
// ---------------------------------------------------------------------------

interface FixtureTemplate {
	noteNameFormat: string;
	noteContentFormat: string;
	properties: { name: string; value: string; type: string }[];
}

const linkedomParser: DocumentParser = {
	parseFromString(html: string, _mimeType: string) {
		return parseHTML(html).document;
	},
};

async function runFixture(html: string, url: string, template: FixtureTemplate): Promise<string> {
	const result = await clip({
		html,
		url,
		template: {
			id: 'fixture',
			name: 'Fixture',
			behavior: 'create',
			path: '',
			...template,
		} as Template,
		documentParser: linkedomParser,
	});
	return result.fullContent;
}

// ---------------------------------------------------------------------------
// Fixture discovery
// ---------------------------------------------------------------------------

const FIXTURES_DIR = join(__dirname, 'fixtures', 'templates');
const EXPECTED_DIR = join(__dirname, 'fixtures', 'expected');

function getFixtures(): Array<{ name: string; jsonPath: string; htmlPath: string }> {
	const files = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
	return files.map(file => {
		const name = basename(file, extname(file));
		return {
			name,
			jsonPath: join(FIXTURES_DIR, file),
			htmlPath: join(FIXTURES_DIR, `${name}.html`),
		};
	});
}

function loadExpected(name: string): string | null {
	const expectedPath = join(EXPECTED_DIR, `${name}.md`);
	return existsSync(expectedPath) ? readFileSync(expectedPath, 'utf-8') : null;
}

function saveExpected(name: string, content: string): void {
	if (!existsSync(EXPECTED_DIR)) {
		mkdirSync(EXPECTED_DIR, { recursive: true });
	}
	writeFileSync(join(EXPECTED_DIR, `${name}.md`), content, 'utf-8');
}

function normalizeLineEndings(value: string): string {
	return value.replace(/\r\n/g, '\n').trim();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Template fixtures', () => {
	const fixtures = getFixtures();

	test('should have fixtures to test', () => {
		expect(fixtures.length).toBeGreaterThan(0);
	});

	test.each(fixtures)('$name', async ({ name, jsonPath, htmlPath }) => {
		const template: FixtureTemplate = JSON.parse(readFileSync(jsonPath, 'utf-8'));
		const html = readFileSync(htmlPath, 'utf-8');

		// Extract URL from HTML comment: <!-- {"url": "..."} -->
		const frontmatterMatch = html.match(/<!--\s*(\{"url":.*?\})\s*-->/);
		const frontmatter = frontmatterMatch ? JSON.parse(frontmatterMatch[1]) : {};
		const url = frontmatter.url || 'https://example.com';

		const result = await runFixture(html, url, template);
		const expected = loadExpected(name);

		if (!expected) {
			if (process.env.UPDATE_FIXTURES) {
				saveExpected(name, result);
				console.log(`Created baseline for ${name}`);
				return;
			}
			throw new Error(
				`No expected output for fixture "${name}". ` +
				`Run with UPDATE_FIXTURES=1 to create it.`
			);
		}

		expect(normalizeLineEndings(result)).toEqual(normalizeLineEndings(expected));
	});
});
