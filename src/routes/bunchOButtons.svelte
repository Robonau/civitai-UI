<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selected = false;
	const dispatch = createEventDispatcher<{
		selected: boolean;
	}>();
	$: {
		selected = selected;
	}
</script>

<button
	on:click={() => {
		selected = !selected;
		dispatch('selected', selected);
	}}
	class="btn mr-1 mt-1 {selected && 'btn-primary'}"
>
	<slot />
</button>
