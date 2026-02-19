<script lang="ts">
  import CountryList from "./CountryList.svelte";
  import { onMount } from "svelte";

  export let lang = "en";
  
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("lang") || lang;
  }

  let showChips = true;

  // default behavior:
  // - desktop: show
  // - mobile: hide
  // - if there are selected tags: force show
  onMount(() => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    showChips = !isMobile;
  });

  $: if (selected.size > 0) showChips = true;

  function toggleChips() {
    showChips = !showChips;
  }

  const i18n = {
    en: {
      clear: "Clear",
      mode: "Mode",
      showing: (shown: number, total: number) => `Showing ${shown} / ${total}`,
      or: "OR",
      and: "AND",
      filters: "Filters",
      show: "Show",
      hide: "Hide",
    },
    es: {
      clear: "Limpiar",
      mode: "Modo",
      showing: (shown: number, total: number) => `Mostrando ${shown} / ${total}`,
      or: "O",
      and: "Y",
      filters: "Filtros",
      show: "Mostrar",
      hide: "Ocultar",
    },
    ru: {
      clear: "Сбросить",
      mode: "Режим",
      showing: (shown: number, total: number) => `Показано ${shown} / ${total}`,
      or: "ИЛИ",
      and: "И",
      filters: "Фильтры",
      show: "Показать",
      hide: "Скрыть",
    },
  } as const;

  $: t = i18n[lang] ?? i18n.en;
  $: modeLabel = mode === "OR" ? t.or : t.and;

  export let posts: any[] = [];
  export let allBadges: string[] = [];
  export let placeholder: string = "";

  let mode: "OR" | "AND" = "OR";
  let selected = new Set<string>();

  function parseFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("badge");
    selected = new Set(raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : []);
  }


  function writeToUrl() {
    const params = new URLSearchParams(window.location.search);
    const arr = Array.from(selected);

    if (arr.length) params.set("badge", arr.join(","));
    else params.delete("badge");

    const qs = params.toString();
    history.replaceState({}, "", qs ? `${location.pathname}?${qs}` : location.pathname);
  }

  function toggle(b: string) {
    if (selected.has(b)) selected.delete(b);
    else selected.add(b);
    selected = new Set(selected);
    writeToUrl();
  }

  function clear() {
    selected = new Set();
    writeToUrl();
  }

  if (typeof window !== "undefined") {
    parseFromUrl();
    window.addEventListener("popstate", parseFromUrl);
  }

  $: selectedArr = Array.from(selected);

  $: filtered = posts.filter((p) => {
    if (selected.size === 0) return true;

    const values = new Set<string>();

    const badges = (p.data?.badges ?? p.data?.badge ?? []) as string[];
    for (const x of badges) values.add(x);

    const region = p.data?.region as string | undefined;
    if (region) values.add(region);

    return mode === "AND"
      ? selectedArr.every((x) => values.has(x))
      : selectedArr.some((x) => values.has(x));
  });
</script>

<div class="filter">
  <div class="controls">
    <button type="button" class="btn" on:click={toggleChips}>
      {t.filters}: {showChips ? t.hide : t.show}
      {#if selected.size > 0}
        <span class="pill">{selected.size}</span>
      {/if}
    </button>

    <button type="button" class="btn" on:click={clear} disabled={selected.size === 0}>
      {t.clear}
    </button>

    <button type="button" class="btn" on:click={() => (mode = mode === "OR" ? "AND" : "OR")}>
      {t.mode}: {modeLabel}
    </button>

    <span class="meta">{t.showing(filtered.length, posts.length)}</span>
  </div>

  {#if showChips}
    <div class="chips" aria-label={t.filters}>
      {#each allBadges as b}
        <button type="button" class="chip" class:active={selected.has(b)} on:click={() => toggle(b)}>
          {b}
        </button>
      {/each}
    </div>
  {/if}
</div>


<CountryList posts={filtered} placeholder={placeholder} />

<style>
  .controls {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}

.btn {
  border: 1px solid #ddd;
  background: white;
  border-radius: 10px;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.meta {
  font-size: 0.85rem;
  opacity: 0.8;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  border: 1px solid #d8e6ff;
  background: #eef6ff;
  color: #2b5dab;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.chip.active {
  background: #2b5dab;
  color: white;
  border-color: #2b5dab;
}

.pill {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  border: 1px solid #ddd;
  font-size: 0.75rem;
  line-height: 1.2;
}

  .chips { display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.6rem; }
  button {
    border: 1px solid #d8e6ff;
    background: #eef6ff;
    color: #2b5dab;
    border-radius: 999px;
    padding: 0.25rem 0.6rem;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }
  button.active { background:#2b5dab; color:white; border-color:#2b5dab; }
  .controls { display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap; }
</style>
