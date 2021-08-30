<script type="ts">
	import Read from './Read.svelte';
	import Blur from './Blur.svelte';
	import Words from './Words.svelte';

	export let data: {
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

	let verseByVerse = false;
	let activeTab = 'read';
	let passage = 0;
</script>

<div class="form-control">
	<label class="cursor-pointer label">
		<b class="label-text">Verse By Verse</b>
		<input type="checkbox" bind:checked={verseByVerse} class="toggle toggle-secondary" />
	</label>
</div>

<div class="tabs mb-4">
	<button
		class="tab tab-lifted tab-lg"
		class:tab-active={activeTab === 'blur'}
		on:click={() => (activeTab = 'blur')}
	>
		Blur
	</button>
	<button
		class="tab tab-lifted tab-lg"
		class:tab-active={activeTab === 'words'}
		on:click={() => (activeTab = 'words')}
	>
		Words
	</button>
	<button
		class="tab tab-lifted tab-lg"
		class:tab-active={activeTab === 'read'}
		on:click={() => (activeTab = 'read')}
	>
		Read
	</button>
</div>

<header class="my-4">
	<h3 class="text-2xl font-medium">
		<select class="select select-bordered select-lg w-full" bind:value={passage}>
			{#each data as psg, i}
				<option value={i}>{psg.reference} ({psg.referenceShort})</option>
			{/each}
		</select>
	</h3>
	<span class="text-content opacity-20">{data[passage].version} ({data[passage].versionShort})</span
	>
</header>
<main>
	{#if activeTab === 'read'}
		<Read passage={data[passage]} {verseByVerse} />
	{:else if activeTab === 'blur'}
		<Blur passage={data[passage]} {verseByVerse} />
	{:else if activeTab === 'words'}
		<Words passage={data[passage]} {verseByVerse} />
	{/if}
</main>
