import { JSDOM } from 'jsdom';
import unidecode from 'unidecode';
import BOOKS from './_books';

const BASE_URL = `https://www.biblegateway.com/passage/?`;

const sanitize = (str) => {
	return unidecode(str).replace(/\s+/g, ' ').trim();
};

export async function get({ params, query }) {
	const searchVersion = encodeURIComponent(params.version);
	const search = encodeURIComponent(query.get('search'));

	if (searchVersion && search) {
		const modifiedURL = `${BASE_URL}search=${search}&version=${searchVersion}`;
		const { document } = (await JSDOM.fromURL(modifiedURL)).window;

		if (!document.querySelector('.bcv')) {
			return { status: 400, body: 'invalid reference' };
		}

		document.querySelectorAll('sup.crossreference').forEach((node) => node.remove());
		document.querySelectorAll('sup.footnote').forEach((node) => node.remove());
		document.querySelectorAll('div.crossrefs').forEach((node) => node.remove());
		document.querySelectorAll('div.footnotes').forEach((node) => node.remove());
		document.querySelectorAll('h3').forEach((node) => node.remove());
		document.querySelectorAll('sup.versenum').forEach((node) => node.remove());
		document.querySelectorAll('span.chapternum').forEach((node) => node.remove());

		const shortReferenceSelector = document.querySelector('.passage-table');
		const shortReference = shortReferenceSelector.dataset.osis
			.split('-')
			.map((passage) => passage.replace('.', ' ').replace('.', ':'))
			.join('-');

		const referenceSelector = document.querySelector('.bcv .dropdown-display-text');
		const reference = referenceSelector.textContent;

		const shortVersionSelector = document.querySelector('.passage-col');
		const shortVersion = shortVersionSelector.dataset.translation;

		const versionSelector = document.querySelector('.translation .dropdown-display-text');
		const version = versionSelector.textContent;

		const versesSelector = [...document.querySelectorAll('span.text')];
		const filteredVerses = versesSelector.filter((verse) => verse.classList.length !== 1);
		const mappedVerses = filteredVerses.map((verseNode) => {
			const [shortBook, chapter, verse] = verseNode.classList[1].split('-');
			return {
				book: BOOKS[shortBook] || shortBook,
				chapter: Number(chapter),
				verse: Number(verse),
				text: sanitize(verseNode.textContent)
			};
		});
		const reducedVerses = mappedVerses.reduce((prevVerses, curVerse, index, acc) => {
			if (index === 0) return [curVerse];

			const prevVerse = prevVerses.pop();

			if (
				prevVerse.book === curVerse.book &&
				prevVerse.chapter === curVerse.chapter &&
				prevVerse.verse === curVerse.verse
			)
				curVerse.text = `${prevVerse.text} ${curVerse.text}`;
			else prevVerses.push(prevVerse);

			return [...prevVerses, curVerse];
		}, []);
		const verses = reducedVerses;
		const content = document.querySelector('.passage-text').textContent;

		return {
			status: 200,
			body: {
				shortReference: sanitize(shortReference),
				reference: sanitize(reference),
				shortVersion: sanitize(shortVersion),
				version: sanitize(version),
				content: sanitize(content),
				verses
			}
		};
	}

	return {
		status: 400
	};
}
