<script lang="ts">
	import type { Writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import Image from '$lib/Image.svelte';
	import { fade } from 'svelte/transition';
	import type { ISearchResponce } from '$lib/SearchTypes';
	import { goto } from '$app/navigation';
	import IntersectionObserver from '$lib/IntersectionObserver.svelte';

	export let item: ISearchResponce['items'][0];
	export let selectMode: boolean;
	export let isNtSelected: Writable<boolean>;
	let isSelected = false;
	const dispatch = createEventDispatcher<{
		selected: boolean;
	}>();
	$: {
		if (selectMode === false) {
			isSelected = false;
		}
	}

	isNtSelected.subscribe(() => {
		isSelected = false;
	});

	function formatNumber(num: number, precision = 3): string {
		const map = [
			{ suffix: 'Q', threshold: 1e18 },
			{ suffix: 'q', threshold: 1e15 },
			{ suffix: 'T', threshold: 1e12 },
			{ suffix: 'B', threshold: 1e9 },
			{ suffix: 'M', threshold: 1e6 },
			{ suffix: 'K', threshold: 1e3 },
			{ suffix: '', threshold: 1 }
		];
		if (num === 0) return '0';

		const found = map.find((x) => Math.abs(num) >= x.threshold);
		if (found) {
			let curr = 0;
			for (let index = 1; index <= precision; index++) {
				const element = parseInt((num / found.threshold).toPrecision(index));
				if (curr !== element) curr = element;
			}
			const formatted = curr.toString() + found.suffix;
			return formatted;
		}

		return 'N/A';
	}
</script>

<IntersectionObserver
	let:intersecting
	top={400}
	bottom={400}
	class="aspect-cover w-full bg-base-200 rounded-lg"
>
	{#if intersecting || !!window.__TAURI_METADATA__}
		<a
			in:fade|global
			href="https://civitai.com/models/{item.id}"
			on:click|stopPropagation|preventDefault={() => {
				if (selectMode) {
					isSelected = !isSelected;
					dispatch('selected', isSelected);
				} else {
					goto(`https://civitai.com/models/${item.id}`);
				}
			}}
		>
			<Image
				src={item.modelVersions[0]?.images[0]?.url ?? ''}
				class="{isSelected
					? 'opacity-50'
					: ''} aspect-cover w-full bg-base-200 rounded-xl hover:opacity-50 transition-opacity duration-300"
			>
				<div class="absolute top-2 left-2">
					<div class="badge badge-primary text-2xs rounded-md opacity-70 font-bold">
						{item.type}
					</div>
				</div>
				<div class="absolute bottom-0 bg-base-100/75 left-0 backdrop-blur-sm right-0 rounded-b-lg">
					<div class="px-2 h-10 text-sm z-10 flex items-center" title={item.name}>
						<span class="line-clamp-2">{item.name}</span>
					</div>
					<div class="flex flex-nowrap justify-between mx-1 mb-1">
						<div
							class="flex bg-base-100/75 rounded-lg p-1 items-center text-base"
							title={item.stats.rating.toString()}
						>
							{#each new Array(5) as _, value}
								<svg
									class="text-md z-10 text-base-100 brightness-200 iconify iconify--mdi"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
								>
									<path
										class="text-xl z-10
                {value + 1 <= Math.ceil(item.stats.rating)
											? 'text-yellow-500'
											: 'text-base-100 brightness-200'}"
										fill="currentcolor"
										style={value + 1 === Math.ceil(item.stats.rating)
											? `clip-path: polygon(0 0,
                    ${(item.stats.rating - value) * 100}% 0,
                    ${(item.stats.rating - value) * 100}% 100%,
                      0% 100%);`
											: ''}
										d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27Z"
									/>
									{#if value + 1 === Math.ceil(item.stats.rating)}
										<path
											class="text-base-100 brightness-200"
											fill="currentcolor"
											style={value + 1 === Math.ceil(item.stats.rating)
												? `clip-path: polygon(
                        ${(item.stats.rating - value) * 100}% 0,
                        100% 0,
                        100% 100%,
                        ${(item.stats.rating - value) * 100}% 100%);`
												: ''}
											d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27Z"
										/>
									{/if}
								</svg>
							{/each}
							<div class="text-xs flex items-center">
								<span>{formatNumber(item.stats.ratingCount)}</span>
							</div>
						</div>
						<div class="flex">
							<div class="bg-base-100/25 rounded-lg p-1 ml-1 flex items-center">
								<Icon icon="mdi:cards-heart-outline" class="inline" />
								<span class="text-xs">
									{formatNumber(item.stats.favoriteCount)}
								</span>
							</div>
							<div class="bg-base-100/25 rounded-lg p-1 ml-1 flex items-center">
								<Icon icon="mdi:chat-outline" class="inline" />
								<span class="text-xs">
									{formatNumber(item.stats.commentCount)}
								</span>
							</div>
							<div class="bg-base-100/25 rounded-lg p-1 ml-1 flex items-center">
								<Icon icon="mdi:download-outline" class="inline" />
								<span class="text-xs">
									{formatNumber(item.stats.downloadCount)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</Image>
		</a>
	{/if}
</IntersectionObserver>
