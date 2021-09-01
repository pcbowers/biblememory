<script type="ts">
	export let content;
	export let wordCount;

	let correct = 'bg-base-200';
	let currentWords = [];
	let currentPosition = 0;
	let selectedWords = [];
	let guess = [];

	const randomColors = [
		'btn-primary',
		'btn-secondary',
		'btn-accent',
		'btn-warning',
		'btn-success',
		'btn-info',
		'btn-error',
		''
	];

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

	const selectRandomColor = () => {
		return randomColors[Math.floor(Math.random() * randomColors.length)];
	};

	const generateWords = (str) => {
		guess = [];
		correct = 'bg-base-200';
		currentPosition = 0;
		let words = str.split(/\s+/);
		currentWords = cleanseArray(words);
		selectWords(wordCount);
	};

	const selectWords = (max) => {
		const list = currentWords.slice(currentPosition + 1);
		const next = currentWords[currentPosition];
		selectedWords = shuffleArray(
			shuffleArray(list, next).slice(0, Math.min(max, list.length + 1))
		).map((word) => {
			if (word.unpunctuated.toLowerCase() === next.unpunctuated.toLowerCase()) {
				word.punctuated = next.punctuated;
				word.unpunctuated = next.unpunctuated;
			}
			word.randomColor = selectRandomColor();
			return word;
		});
	};

	const checkCorrect = () => {
		if (guess.every((word, id) => word.punctuated === currentWords[id].punctuated)) {
			correct = 'bg-success bg-opacity-50';
		} else {
			correct = 'bg-error bg-opacity-50';
		}

		setTimeout(() => {
			correct = 'bg-base-200';
		}, 500);
	};

	const removeWord = () => {
		const word = guess.pop();
		if (
			currentWords.length &&
			word &&
			currentWords[currentPosition - 1].punctuated === word.punctuated
		) {
			currentPosition -= 1;
		}
		guess = guess;
		selectWords(wordCount);
	};

	const addGuess = (word) => {
		if (currentWords.length && currentWords[currentPosition].punctuated === word.punctuated) {
			currentPosition += 1;
		}

		guess = [...guess, word];
		selectWords(wordCount);
	};

	$: selectWords(wordCount);

	$: generateWords(content);

	$: {
		if (guess.length && !selectedWords.length) checkCorrect();
	}
</script>

<section class={`w-full p-2 mb-4 font-mono rounded-box ${correct}`}>
	<p>
		{guess.map((word) => word.unpunctuated).join(' ')}
	</p>
	<div class="ml-4 text-right">
		<button class="btn btn-circle btn-sm" on:click={removeWord}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 inline-block"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
				/>
			</svg>
		</button>
		<button class="btn btn-circle btn-sm" on:click={checkCorrect}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 inline-block"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
				/>
			</svg>
		</button>
		<button class="btn btn-circle btn-sm" on:click={() => generateWords(content)}>
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
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
		</button>
	</div>
</section>

<div class="flex justify-center">
	<div class="text-center w-[min(30ch,90vw)]">
		{#each selectedWords as word}
			<button
				class={`btn rounded-full btn-sm m-1 capitalize ${word.randomColor}`}
				on:click={() => {
					addGuess(word);
				}}
			>
				{word.unpunctuated}
			</button>
		{/each}
	</div>
</div>
