<script type="ts">
	let versions = ['NIV', 'ESV', 'VOICE', 'NLT', 'MSG', 'ASV', 'KJV', 'NKJV'];
	let search = 'John 3:16';
	let version = 'ESV';
	let returnValue = '';

	const submitSearch = async () => {
		returnValue = await (await fetch(`/api/bible?search=${search}&version=${version}`)).json();
	};
</script>

<code><pre>{JSON.stringify(returnValue, null, 2)}</pre></code>
<input type="text" bind:value={search} />
<select bind:value={version}>
	{#each versions as vrsn}
		<option value={vrsn}>{vrsn}</option>
	{/each}
</select>
<input type="submit" on:click|preventDefault={submitSearch} />
