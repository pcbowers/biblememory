<script>
	import marked from 'marked';

	export let content;
	export let verses;
	export let verseByVerse;
</script>

{#if verseByVerse}
	<table class="table table-zebra">
		<thead>
			<tr>
				<th>Reference</th>
				<th>Verse Text</th>
			</tr>
		</thead>
		<tbody>
			{#each verses as verse}
				<tr>
					<td
						>{verse.book}
						{verse.chapter}:{verse.verse}{verse.toVerse ? `-${verse.toVerse}` : ''}</td
					>
					<td>{@html marked.parseInline(verse.text)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<div class="prose">
		{@html marked(content)}
	</div>
{/if}

<style lang="postcss">
	.table td,
	.table th {
		@apply whitespace-normal;
	}
</style>
