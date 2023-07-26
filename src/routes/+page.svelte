<script lang="ts">
	import IntersectionObserver from '$lib/IntersectionObserver.svelte';
	import Image from '$lib/Image.svelte';
	import { fade } from 'svelte/transition';
	import {
		type ISearchResponce,
		sort,
		type IsearchObject,
		types,
		baseModel,
		period,
		periodMode,
		allowCommercialUse
	} from '$lib/SearchTypes';
	import Icon from '@iconify/svelte';

	import type { LayoutData } from './$types';
	export let data: LayoutData;
	const { responce, doSearch, reset, page, searchObject } = data.search;

	let dataa: ISearchResponce[] = [];
	let loading = true;
	let modal: HTMLDialogElement | null;
	let filterChange = false;
	let error: Error | null = null;
	let selected: ISearchResponce['items'] = [];

	responce.subscribe((e) => {
		error = e.error;
		loading = false;
		if (e.data !== null) {
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
		selected = [];
		dataa = [];
		doSearch();
	}

	function handelfilter<K extends keyof IsearchObject>(key: K, value: IsearchObject[K]) {
		filterChange = true;
		searchObject.update((n) => {
			n[key] = value;
			return n;
		});
		selected = [];
		dataa = [];
	}

	interface tag {
		name: string;
		modelCount: number;
		link: string;
	}
	interface tagitems {
		items: tag[];
	}

	let fetchTags: Promise<tagitems> | undefined;
	async function dofetchtags() {
		fetchTags = (async () => {
			const resp = await fetch('https://civitai.com/api/v1/tags');
			const dataa: tagitems = await resp.json();
			return dataa;
		})();
	}

	function addOrRemove<K>(arr: K[], item: K) {
		return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
	}

	function isperiod(value: string): value is period {
		return Object.values(period).includes(value as period);
	}

	function isperiodmode(value: string): value is periodMode {
		return Object.values(periodMode).includes(value as periodMode);
	}

	function isallowCommercialUse(value: string): value is allowCommercialUse {
		return Object.values(allowCommercialUse).includes(value as allowCommercialUse);
	}
	function copy() {
		navigator.clipboard.writeText(
			selected.map((ele) => ele.modelVersions[0].downloadUrl).join('\n')
		);
	}
</script>

<div class="sticky top-0 z-50 bg-base-100 border-b-2 border-base-200 flex justify-between p-1">
	<div class="dropdown">
		<button class="btn"
			>{sort[$searchObject.sort ?? 'Highest Rated']}<Icon icon="mdi:chevron-down" /></button
		>
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
	<div>
		<button class="btn" on:click={() => (selected = [])}> reset selected</button>
		<button
			class="btn tooltip tooltip-bottom normal-case"
			data-tip="I mainly use this for JDownloader"
			on:click={copy}
		>
			<span class="uppercase">Copy selected download links</span>
		</button>
	</div>
	<button
		class="btn"
		on:click={() => {
			modal?.showModal();
			filterChange = false;
		}}
	>
		Filters
	</button>
	<dialog class="modal" bind:this={modal}>
		<div class="modal-box max-w-xl h-screen">
			<h3 class="font-bold text-lg">Filters!</h3>
			<div class="my-1">
				<label class="label pb-1" for="Queryinput">
					<span class="label-text">Search:</span>
				</label>
				<input
					id="Queryinput"
					type="text"
					placeholder="Search"
					value={$searchObject.query ?? ''}
					on:change={(e) => {
						handelfilter('query', e.currentTarget.value);
					}}
					class="input input-bordered w-full"
				/>
			</div>
			<div class="my-1">
				<label class="label pb-1" for="taginput">
					<span class="label-text">Tag:</span>
				</label>
				<div class="relative">
					<input
						id="taginput"
						type="text"
						placeholder="Tag"
						value={$searchObject.tag ?? ''}
						on:change={(e) => {
							handelfilter('tag', e.currentTarget.value);
						}}
						class="input input-bordered w-full"
					/>
					<div
						class="dropdown absolute right-4 top-0 dropdown-left h-full flex flex-col align-middle items-center justify-center"
					>
						<button on:focus={dofetchtags}>
							<Icon icon="mdi:chevron-down" class="text-3xl" />
						</button>
						<ul
							class="dropdown-content bg-base-200 z-[1] menu p-2 shadow
								rounded-box w-52 max-h-96 overflow-y-auto flex flex-col flex-nowrap"
						>
							{#if fetchTags}
								{#await fetchTags}
									<div class="w-full flex justify-center items-center">
										<span class="loading loading-spinner loading-lg" />
									</div>
								{:then tags}
									{#each tags.items as tag}
										<li class="w-full">
											<button on:click={() => handelfilter('tag', tag.name)}>
												{tag.name}
											</button>
										</li>
									{/each}
								{/await}
							{/if}
						</ul>
					</div>
				</div>
			</div>
			<div class="my-1">
				<label class="label pb-1" for="usrinput">
					<span class="label-text">Username:</span>
				</label>
				<input
					id="usrinput"
					type="text"
					placeholder="Username"
					value={$searchObject.username ?? ''}
					on:change={(e) => {
						handelfilter('username', e.currentTarget.value);
					}}
					class="input input-bordered w-full"
				/>
			</div>
			<span class="label-text"> Types: </span>
			<div class="flex flex-wrap mb-1">
				{#each Object.entries(types) as typ}
					<button
						on:click={() => {
							if ($searchObject.types !== undefined) {
								handelfilter('types', addOrRemove($searchObject.types, typ[1]));
							} else {
								handelfilter('types', [typ[1]]);
							}
						}}
						class="btn mr-1 mt-1 {$searchObject.types?.includes(typ[1]) && 'btn-primary'}"
					>
						{typ[0]}
					</button>
				{/each}
			</div>
			<span class="label-text"> Base Model: </span>
			<div class="flex flex-wrap mb-1 w-full">
				{#each Object.entries(baseModel) as bsem}
					<button
						on:click={() => {
							if ($searchObject.baseModel !== undefined) {
								handelfilter('baseModel', addOrRemove($searchObject.baseModel, bsem[1]));
							} else {
								handelfilter('baseModel', [bsem[1]]);
							}
						}}
						class="btn mr-1 mt-1
							{$searchObject.baseModel?.includes(bsem[1]) && 'btn-primary'}
							"
					>
						{bsem[1]}
					</button>
				{/each}
			</div>
			<span class="label-text">Period:</span>
			<select
				value={$searchObject.period ?? 'AllTime'}
				class="select w-full select-bordered mb-1"
				on:change={(e) => {
					if (isperiod(e.currentTarget.value)) {
						handelfilter('period', e.currentTarget.value);
					}
				}}
			>
				{#each Object.entries(period) as time}
					<option value={time[1]}>{time[0]}</option>
				{/each}
			</select>
			<span class="label-text">Period Mode:</span>
			<select
				value={$searchObject.periodMode ?? 'published'}
				class="select w-full select-bordered mb-1"
				on:change={(e) => {
					if (isperiodmode(e.currentTarget.value)) {
						handelfilter('periodMode', e.currentTarget.value);
					}
				}}
			>
				{#each Object.entries(periodMode) as time}
					<option value={time[1]}>{time[0]}</option>
				{/each}
			</select>
			<span class="label-text">Allow Commercial Use:</span>
			<select
				value={$searchObject.allowCommercialUse}
				class="select w-full select-bordered mb-1"
				on:change={(e) => {
					if (isallowCommercialUse(e.currentTarget.value)) {
						handelfilter('allowCommercialUse', e.currentTarget.value);
					}
				}}
			>
				<option value={undefined}>Any</option>
				{#each Object.entries(allowCommercialUse) as time}
					<option value={time[1]}>{time[0]}</option>
				{/each}
			</select>
			<span class="label-text">Rating:</span>
			<div class="mb-1">
				<div class="rating">
					<input
						type="radio"
						name="rating"
						on:change={() => {
							handelfilter('rating', undefined);
						}}
						class="rating-hidden"
					/>
					{#each new Array(5) as _, value}
						<input
							checked={$searchObject.rating === value + 1}
							on:change={() => {
								handelfilter('rating', value + 1);
							}}
							type="radio"
							name="rating"
							class="mask mask-star bg-yellow-400"
						/>
					{/each}
				</div>
			</div>
			<div class="tooltip tooltip-top w-full" data-tip="This requires an API token">
				<label class="label cursor-pointer">
					<span class="label-text">Favorites</span>
					<input
						type="checkbox"
						checked={$searchObject.favorites}
						on:change={() => handelfilter('favorites', !$searchObject.favorites)}
						class="checkbox"
					/>
				</label>
			</div>
			<div class="tooltip tooltip-top w-full" data-tip="This requires an API token">
				<label class="label cursor-pointer">
					<span class="label-text">Hidden</span>
					<input
						type="checkbox"
						checked={$searchObject.hidden}
						on:change={() => handelfilter('hidden', !$searchObject.hidden)}
						class="checkbox"
					/>
				</label>
			</div>
			<div
				class="tooltip tooltip-top w-full"
				data-tip="This will use your preferred format options if you use an API token"
			>
				<label class="label cursor-pointer">
					<span class="label-text">Primary File Only</span>
					<input
						type="checkbox"
						checked={$searchObject.primaryFileOnly}
						on:change={() => handelfilter('primaryFileOnly', !$searchObject.primaryFileOnly)}
						class="checkbox"
					/>
				</label>
			</div>
			<div>
				<label class="label cursor-pointer">
					<span class="label-text">Allow No Credit</span>
					<input
						type="checkbox"
						checked={$searchObject.allowNoCredit}
						on:change={() => handelfilter('allowNoCredit', !$searchObject.allowNoCredit)}
						class="checkbox"
					/>
				</label>
			</div>
			<div>
				<label class="label cursor-pointer">
					<span class="label-text">Allow Derivatives</span>
					<input
						type="checkbox"
						checked={$searchObject.allowDerivatives}
						on:change={() => handelfilter('allowDerivatives', !$searchObject.allowDerivatives)}
						class="checkbox"
					/>
				</label>
			</div>
			<div>
				<label class="label cursor-pointer">
					<span class="label-text">Allow Different Licenses</span>
					<input
						type="checkbox"
						checked={$searchObject.allowDifferentLicenses}
						on:change={() =>
							handelfilter('allowDifferentLicenses', !$searchObject.allowDifferentLicenses)}
						class="checkbox"
					/>
				</label>
			</div>
			<div>
				<label class="label cursor-pointer">
					<span class="label-text">NSFW</span>
					<input
						type="checkbox"
						checked={$searchObject.nsfw === undefined ? true : $searchObject.nsfw}
						on:change={() => handelfilter('nsfw', !$searchObject.nsfw)}
						class="checkbox"
					/>
				</label>
			</div>
			<div>
				<label class="label cursor-pointer">
					<span class="label-text">Early Access</span>
					<input
						type="checkbox"
						checked={$searchObject.earlyAccess}
						on:change={() => handelfilter('earlyAccess', !$searchObject.earlyAccess)}
						class="checkbox"
					/>
				</label>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button
				on:click={() => {
					if (filterChange) {
						doSearch();
						loading = true;
					}
				}}>close</button
			>
		</form>
	</dialog>
</div>
{#if dataa.length > 0}
	<div class="flex flex-wrap">
		{#each dataa as dat}
			{#each dat.items as item}
				<div class="w-1/6 p-1">
					<IntersectionObserver
						let:intersecting
						top={400}
						bottom={400}
						class="aspect-cover w-full bg-base-200 rounded-lg"
					>
						{#if intersecting}
							<a
								in:fade|global
								href="https://civitai.com/models/{item.id}"
								on:click|stopPropagation|preventDefault={() => {
									if (selected.find((ele) => ele.id === item.id)) {
										selected = selected.filter((ele) => ele.id !== item.id);
										return;
									}
									selected.push(item);
									selected = selected;
								}}
								class={selected.find((ele) => ele.id === item.id) && 'opacity-50'}
							>
								<Image
									src={item.modelVersions[0]?.images[0]?.url ?? ''}
									class="aspect-cover w-full bg-base-200 rounded-xl hover:opacity-50 transition-opacity duration-300"
								>
									<div class="absolute top-2 left-2">
										<div class="badge badge-primary text-2xs rounded-md opacity-70 font-bold">
											{item.type}
										</div>
									</div>
									<div class="absolute bottom-0 bg-base-200/80 left-0 right-0 rounded-b-oxl">
										<div class="line-clamp-2 px-2 h-12 text-center" title={item.name}>
											{item.name}
										</div>
									</div>
								</Image>
							</a>
						{/if}
					</IntersectionObserver>
				</div>
			{/each}
			<IntersectionObserver on:intersect={hendleintersect} />
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
