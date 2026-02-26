<script lang="ts">
  import { onMount } from "svelte";

  export let lang = "en";
  export let posts: any[] = [];
  export let allBadges: string[] = [];
  export let gridId = "country-grid";

  if (typeof window !== "undefined") {
    lang = localStorage.getItem("lang") || lang;
  }

  let showChips = true;

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
      sort: "Sort",
      az: "A–Z",
      za: "Z–A",
      recommended: "Recommended",
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
      sort: "Orden",
      az: "A–Z",
      za: "Z–A",
      recommended: "Recomendado",
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
      sort: "Сортировка",
      az: "А–Я",
      za: "Я–А",
      recommended: "Рекомендуемое",
    },
  } as const;

  $: t = i18n[lang] ?? i18n.en;
  $: modeLabel = mode === "OR" ? t.or : t.and;

  let mode: "OR" | "AND" = "OR";
  let selected = new Set<string>();

  let sortKey: "az" | "za" | "recommended" = "az";

  let shownCount = 0;

  function getRoot(): HTMLElement | null {
    if (typeof window === "undefined") return null;
    return document.getElementById(gridId);
  }

  function getTitleForLi(li: HTMLLIElement) {
    // Prefer an explicit value if you add it later
    const ds = (li.dataset as any);
    const raw =
      ds.sortTitle ||
      ds.title ||
      li.querySelector("h3")?.textContent ||
      li.textContent ||
      "";
    return raw.trim();
  }

  function getScoreForLi(li: HTMLLIElement) {
    const raw = (li.dataset as any).score;
    const n = raw == null ? 0 : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  function applyDomSort(root: HTMLElement) {
    const locale = lang; // ok for en/es/ru

    const sections = root.querySelectorAll<HTMLElement>(".country-section");
    sections.forEach((sec) => {
      const ul = sec.querySelector<HTMLUListElement>("ul.country-grid");
      if (!ul) return;

      const items = Array.from(ul.querySelectorAll<HTMLLIElement>("li[data-tags]"));

      const cmp = (a: HTMLLIElement, b: HTMLLIElement) => {
        // 0) pinned always first
        const ap = (a.dataset.pinned ?? "0") === "1" ? 1 : 0;
        const bp = (b.dataset.pinned ?? "0") === "1" ? 1 : 0;
        if (ap !== bp) return bp - ap; // pinned (1) first

        // 1) then normal sorting
        if (sortKey === "recommended") {
          const sd = getScoreForLi(b) - getScoreForLi(a); // desc
          if (sd !== 0) return sd;
          return getTitleForLi(a).localeCompare(getTitleForLi(b), locale, { sensitivity: "base" });
        }

        if (sortKey === "za") {
          return getTitleForLi(b).localeCompare(getTitleForLi(a), locale, { sensitivity: "base" });
        }

        return getTitleForLi(a).localeCompare(getTitleForLi(b), locale, { sensitivity: "base" });
      };

      items.sort(cmp);

      // re-attach in sorted order
      for (const li of items) ul.appendChild(li);
    });
  }

  function applyDomFilter(root: HTMLElement) {
    const items = root.querySelectorAll<HTMLLIElement>("li[data-tags]");
    const selectedArr = Array.from(selected);

    let visible = 0;

    items.forEach((li) => {
      const raw = li.dataset.tags ?? "";
      const tags = raw.split(",").map((s) => s.trim()).filter(Boolean);
      const set = new Set(tags);

      const ok =
        selectedArr.length === 0
          ? true
          : mode === "AND"
            ? selectedArr.every((x) => set.has(x))
            : selectedArr.some((x) => set.has(x));

      li.style.display = ok ? "" : "none";
      if (ok) visible += 1;
    });

    // Hide empty sections (nice UX)
    const sections = root.querySelectorAll<HTMLElement>(".country-section");
    sections.forEach((sec) => {
      const anyVisible = Array.from(sec.querySelectorAll<HTMLLIElement>("li[data-tags]"))
        .some((li) => li.style.display !== "none");
      sec.style.display = anyVisible ? "" : "none";
    });

    shownCount = visible;
  }

  function applyDomUpdates() {
    const root = getRoot();
    if (!root) return;

    // 1) sort first (order stable), 2) filter + counts + hide empty sections
    applyDomSort(root);
    applyDomFilter(root);
  }

  function parseFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const rawBadges = params.get("badge");
    selected = new Set(rawBadges ? rawBadges.split(",").map((s) => s.trim()).filter(Boolean) : []);

    const rawSort = params.get("sort");
    if (rawSort === "za" || rawSort === "recommended" || rawSort === "az") {
      sortKey = rawSort;
    } else {
      sortKey = "az";
    }
  }

  function writeToUrl() {
    const params = new URLSearchParams(window.location.search);

    const arr = Array.from(selected);
    if (arr.length) params.set("badge", arr.join(","));
    else params.delete("badge");

    if (sortKey !== "az") params.set("sort", sortKey);
    else params.delete("sort");

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

  function setSort(v: "az" | "za" | "recommended") {
    sortKey = v;
    writeToUrl();
  }

  function toggleChips() {
    showChips = !showChips;
  }

  onMount(() => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    showChips = !isMobile;

    parseFromUrl();
    applyDomUpdates();

    const onPop = () => {
      parseFromUrl();
      applyDomUpdates();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  $: if (selected.size > 0) showChips = true;

  // re-apply whenever controls change
  $: if (typeof window !== "undefined") {
    selected, mode, sortKey, gridId;
    applyDomUpdates();
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

    <!-- NEW: sort dropdown -->
    <label class="sort">
      {t.sort}:
      <select class="select" bind:value={sortKey} on:change={() => setSort(sortKey)}>
        <option value="az">{t.az}</option>
        <option value="za">{t.za}</option>
        <option value="recommended">{t.recommended}</option>
      </select>
    </label>

    <span class="meta">{t.showing(shownCount, posts.length)}</span>
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
    margin-bottom: 0.6rem;
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

  .sort {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    font-size: 0.85rem;
    opacity: 0.95;
  }

  .select {
    border: 1px solid #ddd;
    background: white;
    border-radius: 10px;
    padding: 0.2rem 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
  }
</style>