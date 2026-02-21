<script lang="ts">
  import { onMount } from "svelte";

  export let lang = "en";
  export let allBadges: string[] = [];
  export let totalCount = 0;
  export let gridId = "itinerary-grid";

  // keep the same URL param name for consistency
  const PARAM = "badge";

  let mode: "OR" | "AND" = "OR";
  let selected = new Set<string>();
  let shownCount = totalCount;

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

  $: t = i18n[lang as keyof typeof i18n] ?? i18n.en;
  $: modeLabel = mode === "OR" ? t.or : t.and;

  let showChips = true;

  function parseFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(PARAM);
    selected = new Set(raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : []);
  }

  function writeToUrl() {
    const params = new URLSearchParams(window.location.search);
    const arr = Array.from(selected);
    if (arr.length) params.set(PARAM, arr.join(","));
    else params.delete(PARAM);
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

  function applyDomFilter() {
    const items = document.querySelectorAll<HTMLLIElement>(`#${gridId} li`);
    const selectedArr = Array.from(selected);

    let visible = 0;
    items.forEach((li) => {
      const tags = (li.dataset.tags ?? "").split(",").map(s => s.trim()).filter(Boolean);
      const set = new Set(tags);

      const ok =
        selectedArr.length === 0
          ? true
          : mode === "AND"
            ? selectedArr.every(x => set.has(x))
            : selectedArr.some(x => set.has(x));

      li.style.display = ok ? "" : "none";
      if (ok) visible += 1;
    });

    shownCount = visible;
  }

  function toggleChips() {
    showChips = !showChips;
  }

  onMount(() => {
    // adopt stored lang
    lang = localStorage.getItem("lang") || lang;

    // mobile default collapsed
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    showChips = !isMobile;

    parseFromUrl();
    applyDomFilter();

    window.addEventListener("popstate", () => {
      parseFromUrl();
      applyDomFilter();
    });
  });

  $: if (typeof window !== "undefined") {
    // react to changes
    selected, mode;
    applyDomFilter();
    if (selected.size > 0) showChips = true;
  }
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

    <span class="meta">{t.showing(shownCount, totalCount)}</span>
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