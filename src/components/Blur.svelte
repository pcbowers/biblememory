<script>
	import marked from 'marked';

	export let content;
	export let wordCount;
	export let showPassage;
	export let inputText;

	let words = [];
	let displayedContent = '';
	let correct = 'bg-base-200';

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

	var curIndex = 0;
	function replacer(match, p1, offset, string) {
		const str = `<span id='${curIndex}' class='font-bold ${
			words[curIndex].blurred ? 'blur-sm' : ''
		}'>${p1}</span>`;

		curIndex++;
		return str;
	}

	const generateBlurs = (text, percent) => {
		correct = 'bg-base-200';
		const allWords = text.match(/(\w+\'\w+|\w+)/g);
		const blurredIndicies = shuffleArray(Array.from(Array(allWords.length).keys())).slice(
			0,
			Math.min(allWords.length, Math.ceil((allWords.length * percent) / 100))
		);
		words = allWords.map((word, index) => ({
			index: index,
			text: word,
			blurred: blurredIndicies.includes(index)
		}));
		curIndex = 0;
		displayedContent = text.replace(/(\w+\'\w+|\w+)/g, replacer);
	};

	$: generateBlurs(content, wordCount);

	const checkCorrect = (val) => {
		const blurredWords = words.filter((word) => word.blurred);
		if (
			blurredWords.length &&
			blurredWords[0].text &&
			blurredWords[0].text.split('')[0].toLowerCase() === val.data.toLowerCase()
		) {
			words[blurredWords[0].index].blurred = false;
			words = words;
			document.getElementById(blurredWords[0].index).classList.remove('blur-sm');
			if (blurredWords.length === 1) {
				correct = 'bg-success bg-opacity-50';
			}
		} else if (blurredWords.length && blurredWords[0].text) {
			correct = 'bg-error bg-opacity-50';
		}

		if (words.some((word) => word.blurred)) {
			setTimeout(() => {
				correct = 'bg-base-200';
			}, 500);
		}

		inputText = '';
	};
</script>

{#if !showPassage}
	<textarea
		id="input"
		bind:value={inputText}
		on:input={checkCorrect}
		class="sticky w-0 h-0 top-0"
		autofocus
	/>
	<section
		class={`w-full -mt-4 relative p-2 mb-4 font-mono rounded-box prose ${correct}`}
		on:click={() => document.getElementById('input').focus()}
	>
		{@html marked(displayedContent)}
		<div class="ml-4 text-right">
			<button class="btn btn-circle btn-sm" on:click={() => generateBlurs(content, wordCount)}>
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
{/if}
