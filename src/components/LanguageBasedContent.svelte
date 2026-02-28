<script  lang="ts">
  import { onMount } from "svelte";
  export let lang = "en";
  export let meta: Record<string, { title: string; description: string }> = {};

  let userLang = lang; // fallback

  // Run in browser
  if (typeof window !== "undefined") {
    userLang = localStorage.getItem("lang") || lang;
  }

  function applyHead(l: string) {
    document.documentElement.lang = l;
    const m = meta?.[l];
    if (!m) return;
    document.title = m.title;
    let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    desc.content = m.description;
  }

  onMount(() => applyHead(userLang));

  // Whenever your component switches language, call applyHead(newLang).
  // If you already have a reactive `currentLang`, this is the easiest:
  $: if (typeof document !== "undefined") applyHead(userLang);

</script>

{#if userLang === 'en'}
  <slot name="en" />
{:else if userLang === 'es'}
  <slot name="es" />
{:else if userLang === 'ru'}
  <slot name="ru" />
{:else}
  <slot name="en" /> <!-- fallback -->
{/if}

<!---
><script lang="ts">

  export let lang: "en" | "es" | "ru" = "en";

  export let meta: Record<string, { title: string; description: string }> = {};

  // IMPORTANT: use whatever variable your component already uses internally
  // for the active language. Here I'll assume it's called `currentLang`.
  let currentLang = lang;

  function applyHead(l: string) {
    const m = meta?.[l];
    if (!m) return;

    // <html lang="">
    

    // <title>
    document.title = m.title;

    // <meta name="description">
    let desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    desc.content = m.description;
  }

  onMount(() => applyHead(currentLang));

  // Whenever your component switches language, call applyHead(newLang).
  // If you already have a reactive `currentLang`, this is the easiest:
  $: if (typeof document !== "undefined") applyHead(currentLang);
</script>
*/-->