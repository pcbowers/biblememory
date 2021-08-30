<script context="module" type="ts">
	export async function load({ page, fetch }) {
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
	import marked from 'marked';
	export let versions: { version: string; shortVersion: string }[];

	let search = 'Romans 1:1-12';
	let version = 'ESV';
	let error = 'Search for a Scripture and Select a Version.';
	let data: {
		reference: string;
		referenceShort: string;
		version: string;
		versionShort: string;
		content: string;
		verses: {
			book: string;
			chapter: string;
			verse: string;
			text: string;
		}[];
	}[];

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
		error = 'Loading...';
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

		console.log(data);
	};
</script>

<svelte:head>
	<title>Bible Memory</title>
</svelte:head>

<div class="hero min-h-screen">
	<div class="text-center hero-content">
		<div class="max-w-[65ch]">
			<div class="flex flex-row justify-center gap-4 flex-wrap">
				<input class="input input-bordered flex-grow" type="text" bind:value={search} />
				<select class="select select-bordered flex-none" bind:value={version}>
					{#each versions as vrsn}
						<option value={vrsn.shortVersion}>{vrsn.shortVersion}</option>
					{/each}
				</select>
				<input
					type="submit"
					class="btn btn-primary flex-grow btn-block"
					on:click|preventDefault={submitSearch}
				/>
			</div>

			<div class="flex justify-center">
				<div class="mt-2 text-left">
					{#if data}
						<Memorizer {data} />
					{:else}
						<pre class="whitespace-pre-wrap"><code>{error}</code></pre>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
