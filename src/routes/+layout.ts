import { Search } from "$lib/Search";

export const ssr = false;
export const load = (() => {
  return {
    search: Search()
  };
})