<script>
	import Highlight from 'svelte-highlight';
	import json from 'svelte-highlight/src/languages/json';
	import javascript from 'svelte-highlight/src/languages/javascript';
	import atomOneDark from 'svelte-highlight/src/styles/atom-one-dark';
	import { onMount } from 'svelte';

	export let passage;
	export let verseByVerse;
	export let currentVerse;

	let blinkShow = true;
	let displayedPassage;

	onMount(() => {
		const interval = setInterval(() => {
			blinkShow = !blinkShow;
		}, 530);
	});

	$: {
		if (verseByVerse) {
			const { verses, ...copiedPassage } = JSON.parse(JSON.stringify(passage));
			const verse = verses[currentVerse];
			copiedPassage.searchTerm = verse.reference;
			copiedPassage.content = verse.text;
			copiedPassage.reference = verse.reference;
			copiedPassage.referenceShort = verse.referenceShort;

			displayedPassage = { ...copiedPassage, verses: [verse] };
		} else {
			displayedPassage = passage;
		}
	}
</script>

<svelte:head>
	{@html atomOneDark}
</svelte:head>

<div class="mockup-code max-w-[min(65ch,90vw)]">
	<Highlight language={javascript} data-prefix="$" code={'console.log(passage);'} />
	{#each JSON.stringify(displayedPassage, null, 2).split('\n') as line, i}
		<Highlight language={json} data-prefix={!i ? '$' : ''} code={line} />
	{/each}

	<pre data-prefix="$">
    <code>{@html blinkShow ? "█" : "&nbsp;"}</code>
  </pre>
</div>

<style global lang="postcss">
	.hljs {
		@apply bg-transparent !important;
	}
</style>
