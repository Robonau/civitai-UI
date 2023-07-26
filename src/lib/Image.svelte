<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string;

	let failed = false;
	let loading = false;

	$: resetimg(src);

	function resetimg(_: undefined | any = undefined) {
		failed = false;
		loading = true;
	}

	onMount(() => {
		resetimg();
	});
</script>

<div class="{$$props.class} relative">
	<img
		class="overflow-hidden object-cover w-full
		{loading || failed ? 'opacity-0 h-0' : 'h-full'}"
		style="border-radius: inherit;"
		on:load={() => (loading = false)}
		on:error={() => (failed = true)}
		{src}
		loading="lazy"
		alt="cover"
	/>
	<slot />
	{#if failed}
		<div class="flex justify-center items-center h-full">Failed.</div>
	{:else if loading}
		<div class="flex justify-center items-center h-full">
			<span class=" loading loading-infinity loading-lg text-primary" />
		</div>
	{/if}
</div>
