<script>
  export let lang = "en";

  let userLang = lang; // fallback

  // Run in browser
  if (typeof window !== "undefined") {
    userLang = localStorage.getItem("lang") || lang;
  }
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

