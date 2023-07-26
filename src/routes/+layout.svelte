<script lang="ts">
	import CivitaiLogo from './CivitaiLogo.svelte';
	import '../app.css';
	import Icon from '@iconify/svelte';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
	const { resetSearch, searchObject, reset } = data.search;
	let modal: HTMLDialogElement | null;
	let showToken = false;

	function handlehide(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) {
		if (e.detail === 1) showToken = !showToken;
	}
</script>

<div class="flex flex-col h-screen absolute top-0 bottom-0 left-0 right-0">
	<div
		class="sticky top-0 bg-base-100 border-b-2 border-base-200 flex p-4 justify-between z-40 items-center"
	>
		<a href="https://civitai.com/">
			<CivitaiLogo />
		</a>
		<div class="w-full max-w-2xl flex">
			<input
				type="text"
				placeholder="Search"
				bind:value={$searchObject.query}
				class="input input-bordered w-full"
			/>
			<button
				class="btn btn-ghost text-error tooltip tooltip-bottom normal-case"
				data-tip="Will reset all filters"
				on:click={resetSearch}
			>
				<span class="uppercase"> Reset </span>
			</button>
		</div>
		<button class="btn" on:click={() => modal?.showModal()}>Api Token</button>
		<dialog class="modal" bind:this={modal}>
			<form method="dialog" class="modal-box max-w-xl">
				<h3 class="font-bold text-lg">Add an API Token!</h3>
				<p class="py-4">
					This is generally not necessary but is needed for a couple of options.
					<br /> see
					<a href="https://github.com/civitai/civitai/wiki/REST-API-Reference">API-Reference</a>
					for the options that require an API token.
					<br /><br />One can be obtained from the civitai settings
					<a class="text-info hover:text-info/75" href="https://civitai.com/user/account">page</a>
				</p>
				<div class="relative">
					<input
						type={!showToken ? 'password' : 'text'}
						placeholder="Token"
						value={$searchObject.token}
						on:change={(e) => {
							$searchObject.token = e.currentTarget.value;
							reset.update((n) => !n);
						}}
						class="input input-bordered w-full"
					/>
					<button
						tabindex="-1"
						class="absolute right-4 h-full select-none"
						on:click|preventDefault|stopPropagation={handlehide}
					>
						<Icon icon="mdi-eye" class="h-full text-3xl" />
					</button>
				</div>
			</form>
			<form method="dialog" class="modal-backdrop">
				<button on:click={() => (showToken = false)}>close</button>
			</form>
		</dialog>
	</div>
	<main class="overflow-y-auto h-full relative">
		<slot />
	</main>
</div>
