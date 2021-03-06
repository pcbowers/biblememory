import unidecode from 'unidecode';
import * as cheerio from 'cheerio';
import BOOKS from './_books';
import FAKE_PAGE from './_fakePage';
import { dev } from '$app/env';

const BASE_URL = `https://www.biblegateway.com/passage/?`;

const sanitize = (str) => {
	if (Array.isArray(str)) return str.map((st) => unidecode(st.replace(/¶/g, '')).trim());
	return unidecode(str.replace(/¶/g, '')).trim();
};

const versesEqual = (prevVerse, curVerse) => {
	if (
		prevVerse.verse !== curVerse.verse ||
		prevVerse.chapter !== curVerse.chapter ||
		prevVerse.book !== curVerse.book
	)
		return false;
	return true;
};

const replacer = (match, p1, p2) => {
	return p1 + p2.trim() + p1;
};

const calculateShortReference = (parsedVerses) => {
	const firstIndex = 0;
	const lastIndex = parsedVerses.length - 1;
	const firstRef = `${BOOKS[parsedVerses[firstIndex].book] || parsedVerses[firstIndex].book}.${
		parsedVerses[firstIndex].chapter
	}.${parsedVerses[firstIndex].verse}`;
	const lastRef = `-${BOOKS[parsedVerses[lastIndex].book] || parsedVerses[lastIndex].book}.${
		parsedVerses[lastIndex].chapter
	}.${parsedVerses[lastIndex].verse}`;
	if (firstIndex !== lastIndex) {
		return firstRef + lastRef;
	}

	return firstRef;
};

export async function get({ query }) {
	const searchTerm = encodeURIComponent(query.get('search'));
	const searchVersion = encodeURIComponent(query.get('version'));

	if (searchVersion && searchTerm) {
		const modifiedURL = `${BASE_URL}search=${searchTerm}&version=${searchVersion}`;
		let text;
		if (dev) {
			text = FAKE_PAGE.text;
		}

		if (!dev) {
			const res = await fetch(modifiedURL);

			if (!res.ok) {
				return {
					status: res.status,
					body: {
						error: 'fetch failed. Bad internet?',
						data: { searchTerm: query.get('search'), searchVersion: query.get('version') }
					}
				};
			}
			text = await res.text();
		}

		const $ = cheerio.load(text);

		if (!$('.bcv').length) {
			return {
				status: 400,
				body: {
					error: 'invalid reference.',
					data: { searchTerm: query.get('search'), searchVersion: query.get('version') }
				}
			};
		}

		$(`
      sup.crossreference,
      sup.footnote,
      div.crossrefs,
      div.footnotes,
      h3,
      sup.versenum,
      span.chapternum,
      a,
      div.long-aside,
      div.short-aside,
      div.copyright-table
    `).remove();

		const referenceSelector = $('.bcv .dropdown-display-text');
		const shortVersionSelector = $('.passage-col');
		const versionSelector = $('.translation .dropdown-display-text');
		const contentSelector = $('.passage-content');

		const contents = [];
		const verses = [];
		const shortReferences = [];

		contentSelector.each((id, el) => {
			// Sanitize Elements
			$('i', $(el)).each((i, el) => {
				$(el).text('<em>' + $(el).text() + '</em>');
			});

			$('b', $(el)).each((i, el) => {
				$(el).text('<strong>' + $(el).text() + '</strong>');
			});

			$('.speaker').closest('p').addClass('speakerP');

			const allParagraphs = $('p', $(el));

			allParagraphs.each((id, el) => {
				if (!$(el).hasClass('speakerP')) return;
				if (!allParagraphs.eq(id + 1).length) return;

				if (allParagraphs.eq(id + 1).hasClass('first-line-none'))
					allParagraphs.eq(id + 1).text('<br />' + allParagraphs.eq(id + 1).text());
				else allParagraphs.eq(id + 1).addClass('speakerP');
			});

			// Select Verses
			const versesSelector = $('span.text:not([class="text"])', $(el));
			versesSelector.removeClass('text');

			const mappedVerses = versesSelector.toArray().map((verseNode) => {
				const [shortBook, chapter, verse, , , secondVerse] = $(verseNode).attr('class').split('-');
				let toVerse;

				if (secondVerse) toVerse = Number(secondVerse);

				const book = BOOKS[shortBook] || shortBook;

				return {
					book,
					chapter: Number(chapter),
					verse: Number(verse),
					toVerse,
					reference: `${book} ${chapter}:${verse}${toVerse ? `-${toVerse}` : ''}`,
					referenceShort: `${shortBook}.${chapter}.${verse}${
						toVerse ? `-${shortBook}.${chapter}.${toVerse}` : ''
					}`,
					text: sanitize($(verseNode).text())
				};
			});

			const parsedVerses = mappedVerses.reduce((prevVerses, curVerse, index) => {
				if (index === 0) return [curVerse];

				const prevVerse = prevVerses.pop();

				if (versesEqual(prevVerse, curVerse)) {
					curVerse.text = `${prevVerse.text} ${curVerse.text}`;
					return [...prevVerses, curVerse];
				}

				return [...prevVerses, prevVerse, curVerse];
			}, []);

			verses.push(parsedVerses);
			shortReferences.push(calculateShortReference(parsedVerses));

			// Select Content
			$('p', $(el)).each((i, el) => {
				$(el).text($(el).text().trim() + '\n\n');
			});

			contents.push(
				sanitize($(el).text())
					.replace(/(?<=[.,])(?=[^\s\n)\]])/g, ' ')
					.replace(/(?<=[\n]{2})[\s]+/g, '')
					.replace(/[^\S\r\n]{2,}/g, ' ')
					.replace(/\B(")(.+?)"\B/g, replacer)
					.replace(/\B(')(.+?)'\B/g, replacer)
					// .replace(/\B(\*\*)(?=[^*]{1})(.+?)(?<=[^*]{1})\*\*\B/g, replacer)
					// .replace(/\*\*\*:/g, "* **:")
          // .replace(/\B(?<=[^*]{1})(\*)(?=[^*]{1})(.+?)(?<=[^*]{1})\*\B/g, replacer)
			);
		});

		const references = referenceSelector.map((id, el) => $(el).text()).toArray();
		const shortVersions = shortVersionSelector.map((id, el) => $(el).data('translation')).toArray();
		const versions = versionSelector.map((id, el) => $(el).text()).toArray();

		const sanitizedBody = {
			searchTerm: decodeURIComponent(searchTerm),
			searchVersion: decodeURIComponent(searchVersion),
			referencesShort: sanitize(shortReferences),
			references: sanitize(references),
			versionsShort: sanitize(shortVersions),
			versions: sanitize(versions),
			contents: contents,
			verses: verses
		};

		const body = sanitizedBody.contents.map((content: string, id: number) => ({
			searchTerm: sanitizedBody.searchTerm,
			searchVersion: sanitizedBody.searchVersion,
			referenceShort: sanitizedBody.referencesShort[id],
			reference: sanitizedBody.references[id],
			versionShort: sanitizedBody.versionsShort[id],
			version: sanitizedBody.versions[id],
			content: sanitizedBody.contents[id],
			verses: sanitizedBody.verses[id]
		}));

		return {
			status: 200,
			body
		};
	}

	return {
		status: 400,
		body: {
			error: `Make sure to set both a search and a version.`,
			data: { searchTerm: query.get('search'), searchVersion: query.get('version') }
		}
	};
}
