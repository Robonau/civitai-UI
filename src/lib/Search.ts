
import { writable } from "svelte/store"
import type { ISearchResponce, ISearchdata, IsearchObject } from "./SearchTypes"
import { persistBrowserLocal } from "@macfja/svelte-persistent-store"

export function Search() {

  let controller = new AbortController();

  const searchdefault: IsearchObject = {
    limit: 100,
    nsfw: false,
    page: 1
  }
  const responce = writable<ISearchdata>({ data: null, error: null })
  const reset = writable<boolean | undefined>(undefined)
  const searchObject = persistBrowserLocal(writable<IsearchObject>(searchdefault), 'searchObject')
  const page = writable<number | undefined>(undefined);
  page.subscribe(e => {
    searchObject.update(n => {
      n.page = e
      return n
    })
  })
  const doSearch = async () => {
    controller.abort()
    controller = new AbortController();
    let data: ISearchResponce | null = null
    let error: Error | null = null
    try {
      const Search = await new Promise<URLSearchParams>((resolve) => {
        const Searchh = new URLSearchParams()
        const unsub = searchObject.subscribe(ee => {
          Object.entries(ee).forEach(e => {
            if (e[1] !== undefined) {
              if (Array.isArray(e[1])) {
                e[1].forEach(el => {
                  Searchh.append(e[0], el)
                })
                return
              }
              Searchh.append(e[0], e[1])
            }
          })
          resolve(Searchh)
        })
        unsub()
      })
      const url = new URL(`https://civitai.com/api/v1/models?${Search.toString()}`)
      const resp = await fetch(url, { signal: controller.signal })
      if (resp.status !== 200) {
        throw new Error(resp.status.toString());
      }
      data = await resp.json() as ISearchResponce
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return
      }
      error = e as Error
    }
    responce.set({ data, error })
  }
  async function resetSearch() {
    controller.abort()
    controller = new AbortController();
    const token = await new Promise<string | undefined>((resolve) => {
      const unsub = searchObject.subscribe((e) => {
        resolve(e.token)
      })
      unsub()
    })
    searchObject.set({ ...searchdefault, token, page: undefined })
    reset.update(n => !n)
  }
  return {
    responce,
    reset,
    searchObject,
    page,
    doSearch,
    resetSearch,
  }
}