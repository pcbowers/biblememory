import * as cheerio from 'cheerio';

const EXCLUDED_VERSIONS = ["MOUNCE", "EXB"]

export async function get({ query }) {
	const searchVersion = query.get('version');

	if (searchVersion) {
		const query = {
			query:
				'query version($translation: String!){bible(translation: $translation){name, versionInfo}}',
			variables: { translation: searchVersion }
		};

		const res = await fetch(`https://www.biblegateway.com/graphql/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(query)
		});

		if (!res.ok) {
			return {
				status: res.status,
				body: {
					error: `Could not fetch ${searchVersion}.`,
					data: { searchVersion }
				}
			};
		}

		return {
			status: 200,
			body: await res.json()
		};
	}

	const res = await fetch(`https://www.biblegateway.com/versions/`);

	if (!res.ok) {
		return {
			status: res.status,
			body: {
				error: 'Fetch failed. Bad internet?'
			}
		};
	}

	const $ = cheerio.load(await res.text());
	const versionSelector = $("tr[data-language='en'] > td.translation-name");

	const versions = versionSelector
		.map((id, el) => {
			const [, version, shortVersion] = $(el)
				.text()
				.match(/^(.*)\s\((.*)\).*$/);
			return { shortVersion, version };
		})
		.toArray().filter(version => !EXCLUDED_VERSIONS.includes(version.shortVersion));

	return {
		status: 200,
		body: {
			versions
		}
	};
}
