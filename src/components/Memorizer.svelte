<script type="ts">
	import marked from 'marked';

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
			reference: string;
			referenceShort: string;
			text: string;
		}[];
	}[];

	export let wordPercentage = 20;
	export let verseByVerse = false;
	export let showPassage = false;
	export let activeTab = 'read';
	export let wordCount = 10;
	export let passage = 0;
	export let currentVerse = 0;
	export let content;

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

	$: {
		if (verseByVerse && !['read'].includes(activeTab)) {
			content = data[passage].verses[currentVerse].text;
		} else {
			content = data[passage].content;
		}
	}
</script>

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
	<h3 class="font-medium flex items-center gap-4">
		<select
			class="select select-md select-bordered flex-grow text-2xl"
			bind:value={passage}
			on:change={() => (currentVerse = 0)}
		>
			{#each data as psg, i}
				<option value={i}>{psg.reference}</option>
			{/each}
		</select>
		<div class="dropdown dropdown-end">
			<div tabindex="0" class="btn btn-circle btn-sm text-secondary rounded-full p-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
					/>
				</svg>
			</div>
			<div
				tabindex="0"
				class="shadow card dropdown-content bg-base-200 p-4 rounded-box max-w-[min(65ch,90vw)] min-w-[min(45ch,70vw)]"
			>
				<div class="form-control">
					<label class="cursor-pointer label gap-4">
						<b class="label-text">Verse By Verse</b>
						<input type="checkbox" bind:checked={verseByVerse} class="toggle toggle-secondary" />
					</label>
					{#if !['read', 'json'].includes(activeTab)}
						<label class="cursor-pointer label gap-4">
							<b class="label-text">Show Passage</b>
							<input type="checkbox" bind:checked={showPassage} class="toggle toggle-secondary" />
						</label>
					{/if}
					{#if ['words'].includes(activeTab)}
						<label class="label gap-4">
							<b class="label-text">Word Count ({wordCount})</b>
							<input
								type="range"
								max="100"
								min="1"
								bind:value={wordCount}
								class="range range-secondary"
							/>
						</label>
					{/if}
					{#if ['blur'].includes(activeTab)}
						<label class="label gap-4">
							<b class="label-text">Words Blurred ({wordPercentage}%)</b>
							<input
								type="range"
								max="100"
								min="0"
								bind:value={wordPercentage}
								class="range range-secondary"
							/>
						</label>
					{/if}
				</div>
			</div>
		</div>
	</h3>

	<p class="text-content opacity-20">
		{#if !verseByVerse || ['read'].includes(activeTab)}
			{data[passage].referenceShort} - {data[passage].version} ({data[passage].versionShort})
		{:else}
			{createReference(passage, currentVerse)} - {data[passage].version} ({data[passage]
				.versionShort})
		{/if}
	</p>

	{#if verseByVerse && !['read'].includes(activeTab)}
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
		<Read {content} verses={data[passage].verses} {verseByVerse} />
	{:else if activeTab === 'blur'}
		<Blur {content} {showPassage} {wordPercentage} />
	{:else if activeTab === 'words'}
		<Words {content} {wordCount} />
	{:else if activeTab === 'json'}
		<JSON passage={data[passage]} {verseByVerse} {currentVerse} />
	{/if}

	{#if showPassage && !['read', 'json'].includes(activeTab)}
		<div class="w-full p-2 mt-4 prose font-mono bg-info bg-opacity-50 rounded-box">
			{@html marked(content || '')}
		</div>
	{/if}
</main>

<style global type="postcss">
	.tab {
		@apply flex-grow;
	}
</style>
