<script type="ts">
	import Read from './Read.svelte';
	import Blur from './Blur.svelte';
	import Words from './Words.svelte';
	import JSON from './JSON.svelte';

	export let data: {
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
			text: string;
		}[];
	}[];

	let verseByVerse = false;
	let activeTab = 'read';
	let passage = 0;
	let currentVerse = 0;

	const changeVerse = (action: 'inc' | 'dec') => {
		switch (action) {
			case 'dec':
				if (currentVerse !== 0) currentVerse -= 1;
				return;
			case 'inc':
			default:
				if (currentVerse !== data[passage].verses.length - 1) currentVerse += 1;
				return;
		}
	};

	const createReference = (psg, vrs) => {
		let curVerse = data[psg].verses[vrs];
		return `${curVerse.book} ${curVerse.chapter}:${curVerse.verse}${curVerse.toVerse ? '-' : ''}${
			curVerse.toVerse || ''
		}`;
	};
</script>

<div class="form-control my-2">
	<label class="cursor-pointer label">
		<b class="label-text text-lg">Verse By Verse</b>
		<input type="checkbox" bind:checked={verseByVerse} class="toggle toggle-secondary toggle-lg" />
	</label>
</div>

<div class="tabs mb-4">
	<button
		class="tab tab-lifted tab-md"
		class:tab-active={activeTab === 'blur'}
		on:click={() => (activeTab = 'blur')}
	>
		Blur
	</button>
	<button
		class="tab tab-lifted tab-md"
		class:tab-active={activeTab === 'words'}
		on:click={() => (activeTab = 'words')}
	>
		Words
	</button>
	<button
		class="tab tab-lifted tab-md"
		class:tab-active={activeTab === 'read'}
		on:click={() => (activeTab = 'read')}
	>
		Read
	</button>
	<button
		class="tab tab-lifted tab-md"
		class:tab-active={activeTab === 'json'}
		on:click={() => (activeTab = 'json')}
	>
		JSON
	</button>
</div>

<header class="my-4">
	<h3 class="text-2xl font-medium">
		<select class="select select-md select-bordered w-full" bind:value={passage}>
			{#each data as psg, i}
				<option value={i}>{psg.reference}</option>
			{/each}
		</select>
	</h3>
	<p class="text-content opacity-20">
		{#if !verseByVerse || ['read', 'json'].includes(activeTab)}
			{data[passage].referenceShort} - {data[passage].version} ({data[passage].versionShort})
		{:else}
			{createReference(passage, currentVerse)} - {data[passage].version} ({data[passage]
				.versionShort})
		{/if}
	</p>
	{#if verseByVerse}
		<div class="flex flex-row gap-2 my-2">
			<button
				class="btn btn-sm btn-secondary"
				disabled={currentVerse === 0}
				on:click={() => changeVerse('dec')}>Previous Verse</button
			>
			<button
				class="btn btn-sm btn-primary flex-grow"
				disabled={currentVerse === data[passage].verses.length - 1}
				on:click={() => changeVerse('inc')}>Next Verse</button
			>
		</div>
	{/if}
</header>
<main>
	{#if activeTab === 'read'}
		<Read passage={data[passage]} {verseByVerse} />
	{:else if activeTab === 'blur'}
		<Blur passage={data[passage]} {verseByVerse} />
	{:else if activeTab === 'words'}
		<Words passage={data[passage]} {verseByVerse} {currentVerse} />
	{:else if activeTab === 'json'}
		<JSON passage={data[passage]} {verseByVerse} />
	{/if}
</main>
