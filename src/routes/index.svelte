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
	export let versions: { version: string; shortVersion: string }[];
	let search = 'John 3:16';
	let version = 'ESV';
	let returnValue = '';

	const submitSearch = async () => {
		returnValue = await (await fetch(`/api/search?search=${search}&version=${version}`)).json();
	};
</script>

<code><pre>{JSON.stringify(returnValue, null, 2)}</pre></code>
<input type="text" bind:value={search} />
<select bind:value={version}>
	{#each versions as vrsn}
		<option value={vrsn.shortVersion}>{vrsn.version}</option>
	{/each}
</select>
<input type="submit" on:click|preventDefault={submitSearch} />
