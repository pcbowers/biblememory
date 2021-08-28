import unidecode from 'unidecode';
import * as cheerio from 'cheerio';
import BOOKS from './_books';

const BASE_URL = `https://www.biblegateway.com/passage/?`;

const sanitize = (str) => {
	if (Array.isArray(str)) return str.map((st) => unidecode(st).replace(/\s+/g, ' ').trim());
	return unidecode(str).replace(/\s+/g, ' ').trim();
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

export async function get({ query }) {
	const searchTerm = encodeURIComponent(query.get('search'));
	const searchVersion = encodeURIComponent(query.get('version'));

	if (searchVersion && searchTerm) {
		const modifiedURL = `${BASE_URL}search=${searchTerm}&version=${searchVersion}`;
		const $ = cheerio.load(await (await fetch(modifiedURL)).text());

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
      a
    `).remove();

		const shortReferenceSelector = $('.passage-table');
		const referenceSelector = $('.bcv .dropdown-display-text');
		const shortVersionSelector = $('.passage-col');
		const versionSelector = $('.translation .dropdown-display-text');
		const versesSelector = $('span.text:not([class="text"])');
		const contentSelector = $('.passage-content');

		const shortReference = shortReferenceSelector.map((id, el) => $(el).data('osis')).toArray();
		const reference = referenceSelector.map((id, el) => $(el).text()).toArray();
		const shortVersion = shortVersionSelector.map((id, el) => $(el).data('translation')).toArray();
		const version = versionSelector.map((id, el) => $(el).text()).toArray();
		const content = contentSelector.map((id, el) => $(el).text()).toArray();

		versesSelector.removeClass('text');

		const mappedVerses = versesSelector.toArray().map((verseNode) => {
			const [shortBook, chapter, verse] = $(verseNode).attr('class').split('-');
			return {
				book: BOOKS[shortBook] || shortBook,
				chapter: Number(chapter),
				verse: Number(verse),
				text: sanitize($(verseNode).text())
			};
		});
		const verses = mappedVerses.reduce((prevVerses, curVerse, index) => {
			if (index === 0) return [curVerse];

			const prevVerse = prevVerses.pop();

			if (versesEqual(prevVerse, curVerse)) {
				curVerse.text = `${prevVerse.text} ${curVerse.text}`;
				return [...prevVerses, curVerse];
			}

			return [...prevVerses, prevVerse, curVerse];
		}, []);

		return {
			status: 200,
			body: {
				searchTerm: decodeURIComponent(searchTerm),
				searchVersion: decodeURIComponent(searchVersion),
				shortReferences: sanitize(shortReference),
				references: sanitize(reference),
				shortVersions: sanitize(shortVersion),
				versions: sanitize(version),
				contents: sanitize(content),
				verses
			}
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
