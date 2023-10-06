<script lang="ts">
	import { writable } from 'svelte/store';
	import ImageCard from './imageCard.svelte';
	import IntersectionObserver from '$lib/IntersectionObserver.svelte';
	import { type ISearchResponce, sort } from '$lib/SearchTypes';
	import Icon from '@iconify/svelte';
	import { onlyNsfw } from '$lib/Search';
	import type { LayoutData } from './$types';
	import Filters from './filters.svelte';
	export let data: LayoutData;
	const { responce, doSearch, reset, page, searchObject } = data.search;

	let selectMode = false;
	let dataa: ISearchResponce[] = [];
	let loading = true;
	let error: Error | null = null;
	let selected: ISearchResponce['items'] = [];
	let isNtSelected = writable(false);

	responce.subscribe((e) => {
		if (e.error !== null) {
			error = e.error;
			loading = false;
		}
		if (e.data !== null) {
			loading = false;
			dataa.push(e.data);
			dataa = dataa;
		}
	});
	reset.subscribe((e) => {
		if (e !== undefined) {
			selected = [];
			dataa = [];
			doSearch();
		}
	});
	doSearch();
	function hendleintersect(e: CustomEvent<boolean>) {
		if (
			!loading &&
			e.detail &&
			(dataa.at(-1)?.metadata?.currentPage ?? 0) < (dataa.at(-1)?.metadata?.totalPages ?? 0)
		) {
			loading = true;
			page.update((n) => (n ?? 1) + 1);
			doSearch();
		}
	}
	function hendleSort(e: sort) {
		searchObject.update((n) => {
			n.sort = e;
			return n;
		});
		reset.update((n) => !n);
	}
	function copy() {
		navigator.clipboard.writeText(
			selected
				.map((ele) => {
					if (ele.modelVersions[0]) return ele.modelVersions[0].downloadUrl;
					return '';
				})
				.join('\n')
		);
	}
</script>

<div
	class="sticky top-0 z-10 bg-base-100 border-b-2 border-base-200 flex justify-between p-1 items-center flex-col sm:flex-row"
>
	<div class="dropdown">
		<button class="btn">
			{sort[$searchObject.sort ?? 'Highest Rated']}<Icon icon="mdi:chevron-down" />
		</button>
		<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
			{#each Object.values(sort) as srt}
				<li>
					<button
						class={srt === $searchObject.sort
							? 'bg-base-300'
							: $searchObject.sort === undefined && srt === sort['Highest Rated']
							? 'bg-base-300'
							: ''}
						on:click={() => {
							if (
								srt === $searchObject.sort ||
								($searchObject.sort === undefined && srt === sort['Highest Rated'])
							)
								return;
							hendleSort(srt);
						}}>{srt}</button
					>
				</li>
			{/each}
		</ul>
	</div>
	<div class="flex items-center flex-col md:flex-row">
		<label class="flex items-center">
			<span class="label-text select-none">Select Mode</span>
			<input type="checkbox" bind:checked={selectMode} class="checkbox mx-1" />
		</label>
		<div class="flex flex-col md:flex-row">
			{#if selectMode}
				<button
					class="btn mx-1"
					on:click={() => {
						selected = [];
						isNtSelected.set(!$isNtSelected);
					}}
				>
					reset selected</button
				>
				<button
					class="btn tooltip tooltip-bottom normal-case mx-1"
					data-tip="I mainly use this for JDownloader"
					on:click={copy}
				>
					<span class="uppercase">Copy selected download links</span>
				</button>
			{/if}
		</div>
	</div>
	<Filters
		search={data.search}
		on:resetData={() => (dataa = [])}
		on:resetSelected={() => {
			selected = [];
			isNtSelected.set(!$isNtSelected);
		}}
		on:loading={({ detail }) => (loading = detail)}
	/>
</div>
{#if dataa.length > 0}
	<div class="flex flex-wrap">
		{#each dataa as dat}
			{#each dat.items as item}
				{#if !$onlyNsfw || item.nsfw}
					<div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-1">
						<ImageCard
							{isNtSelected}
							{selectMode}
							{item}
							on:selected={({ detail }) => {
								if (detail) {
									selected.push(item);
									selected = selected;
								} else {
									selected = selected.filter((ele) => ele.id !== item.id);
								}
							}}
						/>
					</div>
				{/if}
			{/each}
			<IntersectionObserver on:intersect={hendleintersect} top={400} class="h-1" />
		{/each}
	</div>
{:else if loading}
	<div class="h-96 w-full flex justify-center items-center">
		<span class="loading loading-spinner loading-lg" />
	</div>
{:else if error}
	<div class="h-96 w-full flex justify-center items-center text-error">
		<span>{error.message}</span>
	</div>
{/if}
