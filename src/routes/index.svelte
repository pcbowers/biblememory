<script context="module" type="ts">
	import { dev } from '$app/env';
	export async function load({ page, fetch }) {
		if (dev)
			return {
				props: {
					versions: [
						{
							shortVersion: 'ESV',
							version: 'English Standard Version'
						},
						{
							shortVersion: 'MSG',
							version: 'The Message'
						}
					]
				}
			};

		const url = `/api/versions`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					versions: (await res.json()).versions
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script type="ts">
	import Memorizer from '../components/Memorizer.svelte';
	import FAKE_DATA from './_fakeData';
	export let versions: { version: string; shortVersion: string }[];

	let search = 'Romans 1:1-12';
	let version = 'ESV';
	let error = 'Search for a Scripture and Select a Version.';
	let data: {
		searchTerm: string;
		searchVersion: string;
		reference: string;
		referenceShort: string;
		version: string;
		versionShort: string;
		content: string;
		verses: {
			book: string;
			chapter: number;
			verse: number;
			toVerse?: number;
			reference: string;
			referenceShort: string;
			text: string;
		}[];
	}[];

	let verseByVerse = false;
	let showPassage = false;
	let activeTab = 'read';
	let wordCount = 10;
	let passage = 0;
	let currentVerse = 0;
	let content;

	const timeout = (ms, promise): Promise<Response> => {
		return new Promise<Response>((resolve, reject) => {
			const timer = setTimeout(() => {
				reject({
					status: 500,
					body: { error: `Search failed to complete in ${ms / 1000} seconds.` }
				});
			}, ms);

			promise
				.then((value) => {
					clearTimeout(timer);
					resolve(value);
				})
				.catch((reason) => {
					clearTimeout(timer);
					reject(reason);
				});
		});
	};

	const submitSearch = async () => {
		error = '<button class="btn btn-lg btn-ghost btn-circle loading"></button>';
		if (dev) {
			data = FAKE_DATA;
		} else {
			try {
				const res = await timeout(5000, fetch(`/api/search?search=${search}&version=${version}`));
				if (!res.ok) {
					let body;
					try {
						body = await res.json();
					} catch (err) {
						body = { error: 'Search Failed due to TIMEOUT.' };
					}
					throw { status: res.status, body };
				}
				data = await res.json();
				error = null;
			} catch (res) {
				error = JSON.stringify(res, null, 2);
				data = null;
			}
		}
	};
</script>

<svelte:head>
	<title>Bible Memory</title>
</svelte:head>

<div class="hero min-h-screen">
	<div class="text-center hero-content">
		<div class="max-w-[65ch] min-w-[min(65ch,90vw)]">
			<div class="flex flex-row justify-center gap-4 flex-wrap">
				<input class="input input-md input-bordered flex-grow" type="text" bind:value={search} />
				<select class="select select-md select-bordered flex-none" bind:value={version}>
					{#each versions as vrsn}
						<option value={vrsn.shortVersion}>{vrsn.shortVersion}</option>
					{/each}
				</select>
				<input
					type="submit"
					class="btn btn-sm btn-primary flex-grow btn-block"
					on:click|preventDefault={submitSearch}
				/>
			</div>

			<div class="flex justify-center">
				<div class="mt-2 text-left w-full">
					{#if data}
						<Memorizer
							{data}
							{verseByVerse}
							{showPassage}
							{activeTab}
							{wordCount}
							{passage}
							{currentVerse}
							{content}
						/>
					{:else}
						<pre class="whitespace-pre-wrap text-center"><code>{@html error}</code></pre>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
