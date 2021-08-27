<script type="ts">
	let versions = ['NIV', 'ESV', 'VOICE', 'NLT', 'MSG', 'ASV', 'KJV', 'NKJV'];
	let search = '';
	let selectedVersion = '';
	let returnValue = '';

	const submitSearch = async () => {
		returnValue = await (await fetch(`/api/${selectedVersion}?search=${search}`)).json();
	};
</script>

<code><pre>{JSON.stringify(returnValue, null, 2)}</pre></code>
<input type="text" bind:value={search} />
<select bind:value={selectedVersion}>
	{#each versions as version}
		<option value={version}>{version}</option>
	{/each}
</select>
<input type="submit" on:click|preventDefault={submitSearch} />
