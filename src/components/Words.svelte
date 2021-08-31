<script type="ts">
	import marked from 'marked';

	export let passage;
	export let verseByVerse;
	export let currentVerse;

	let correct = true;
	let currentContent;
	let currentWords = [];
	let selectedWords = [];
	let guess = [];
	let forceReload = false;

	const randomColors = ['badge-primary', 'badge-secondary', 'badge-accent', ''];

	const shuffleArray = (array, item = false) => {
		let arr = item ? [item] : [];

		return [
			...arr,
			...array
				.map((value) => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value)
		];
	};

	const cleanseArray = (array) => {
		return array.map((value) => ({
			punctuated: value,
			unpunctuated: value.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/gi, '')
		}));
	};

	const selectRandomColor = (currentWords) => {
		if (currentWords.length) return randomColors[Math.floor(Math.random() * 4)];
	};

	$: {
		if (verseByVerse) {
			currentContent = passage.verses[currentVerse].text;
		} else {
			currentContent = passage.content;
		}

		currentWords = [];
		selectedWords = [];
		guess = [];
		generateWords();
	}

	const generateWords = () => {
		let words = currentContent.split(/\s+/);
		currentWords = cleanseArray(words);
		selectWords(10);
	};

	const selectWords = (max) => {
		selectedWords = shuffleArray(
			shuffleArray(currentWords.slice(1), currentWords[0]).slice(
				0,
				Math.min(max, currentWords.length)
			)
		).map((word) => {
			if (word.unpunctuated.toLowerCase() === currentWords[0].unpunctuated.toLowerCase()) {
				word.punctuated = currentWords[0].punctuated;
				word.unpunctuated = currentWords[0].unpunctuated;
			}
			return word;
		});
	};

	const addGuess = (word) => {
		if (currentWords.length && currentWords[0].punctuated === word.punctuated) {
			currentWords = currentWords.slice(1);
		}

		guess = [...guess, word];
		selectWords(10);
	};
</script>

<p>{guess.map((word) => word.unpunctuated).join(' ')}</p>
<div class="flex justify-center">
	<div class="text-center w-1/2">
		{#each selectedWords as word}
			<div
				class={`badge badge-lg cursor-pointer m-1 capitalize ${selectRandomColor(currentWords)}`}
				on:click={() => {
					addGuess(word);
				}}
			>
				{word.unpunctuated}
			</div>
		{/each}
	</div>
</div>

<p class="opacity-50">In Progress (No Check, No Save, No Undo, No editing # of words shown)...</p>
