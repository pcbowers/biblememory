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
	import marked from 'marked';
	export let versions: { version: string; shortVersion: string }[];
	let search = 'John 3:16';
	let version = 'ESV';
	let returnValue:
		| string
		| {
				reference: string;
				referenceShort: string;
				version: string;
				versionShort: string;
				content: string;
		  }[]
		| { status: number; error: string } = 'Search for a Scripture and Select a Version.';

	const submitSearch = async () => {
		returnValue = 'loading...';
		try {
			const res = await fetch(`/api/search?search=${search}&version=${version}`);
			if (!res.ok) throw res.status;
			returnValue = await res.json();
		} catch (status) {
			returnValue = {
				status,
				error: 'search failed.'
			};
		}
		console.log(returnValue);
	};
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="text-center hero-content">
		<div class="max-w-lg">
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
				<div class="prose mt-2 text-left">
					{#if Array.isArray(returnValue)}
						{#each returnValue as searchItem}
							{@html marked(`### ${searchItem.reference} (${searchItem.referenceShort})`)}
							{@html marked(`> ${searchItem.version} (${searchItem.versionShort})`)}
							{@html marked(searchItem.content)}
						{/each}
					{:else}
						<pre
							class="whitespace-pre-wrap"><code>{JSON.stringify(returnValue, null, 2)}</code></pre>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
