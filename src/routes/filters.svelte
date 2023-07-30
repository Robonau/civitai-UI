<script lang="ts">
	import type { PersistentStore } from '@macfja/svelte-persistent-store';
	import type { Writable } from 'svelte/store';

	import {
		types,
		type ISearchdata,
		type IsearchObject,
		baseModel,
		period,
		periodMode,
		allowCommercialUse
	} from '$lib/SearchTypes';
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import BunchOButtons from './bunchOButtons.svelte';

	export let search: {
		responce: Writable<ISearchdata>;
		reset: Writable<boolean | undefined>;
		searchObject: PersistentStore<IsearchObject>;
		page: Writable<number | undefined>;
		doSearch: () => Promise<void>;
	};
	const { responce, doSearch, reset, page, searchObject } = search;
	let modal: HTMLDialogElement | null;
	let filterChange = false;

	const dispatch = createEventDispatcher<{
		resetData: undefined;
		resetSelected: undefined;
		loading: boolean;
	}>();

	function handelfilter<K extends keyof IsearchObject>(key: K, value: IsearchObject[K]) {
		filterChange = true;
		searchObject.update((n) => {
			n[key] = value;
			return n;
		});
		dispatch('resetSelected');
		dispatch('resetData');
		page.set(1);
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
	function isperiod(value: string): value is period {
		return Object.values(period).includes(value as period);
	}

	function isperiodmode(value: string): value is periodMode {
		return Object.values(periodMode).includes(value as periodMode);
	}

	function isallowCommercialUse(value: string): value is allowCommercialUse {
		return Object.values(allowCommercialUse).includes(value as allowCommercialUse);
	}
</script>

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
				<BunchOButtons
					selected={$searchObject.types?.includes(typ[1])}
					on:selected={({ detail }) => {
						if (detail) {
							handelfilter('types', [...($searchObject.types ?? []), typ[1]]);
						} else {
							handelfilter(
								'types',
								($searchObject.types ?? []).filter((ele) => ele !== typ[1])
							);
						}
					}}
				>
					{typ[0]}
				</BunchOButtons>
			{/each}
		</div>
		<span class="label-text"> Base Model: </span>
		<div class="flex flex-wrap mb-1 w-full">
			{#each Object.entries(baseModel) as bsem}
				<BunchOButtons
					on:selected={({ detail }) => {
						if (detail) {
							handelfilter('baseModels', [...($searchObject.baseModels ?? []), bsem[1]]);
						} else {
							handelfilter(
								'baseModels',
								($searchObject.baseModels ?? []).filter((ele) => ele !== bsem[1])
							);
						}
					}}
				>
					{bsem[1]}
				</BunchOButtons>
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
					checked={$searchObject.rating === undefined}
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
					on:change={() =>
						handelfilter('nsfw', $searchObject.nsfw === undefined ? false : !$searchObject.nsfw)}
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
					dispatch('loading', true);
				}
			}}>close</button
		>
	</form>
</dialog>
