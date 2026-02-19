<script lang="ts">
  export let posts: any[] = [];
  export let placeholder = "";

  const MAX_BADGES_DESKTOP = 3;
  const MAX_BADGES_MOBILE = 2;

  function imgSrc(post: any): string {
    // Astro content image may be an object with `src`
    const src = post?.data?.mainImage?.src;
    return src ?? placeholder;
  }
</script>

<ul>
  <!--
  {#each posts as post}
    <p>{post.data.title} - {post.data.badge}</p>  
  {/each}-->
  {#each posts as post}
    {@const badges = (post.data?.badges ?? post.data?.badge ?? []) as string[]}
    {@const desktopBadges = badges.slice(0, MAX_BADGES_DESKTOP)}
    {@const mobileBadges = badges.slice(0, MAX_BADGES_MOBILE)}

    <li>
      <a href={`/country/${post.id}/`} class="country-card">
        <img
          width="720"
          height="360"
          src={imgSrc(post)}
          alt=""
          loading="lazy"
        />

        <div class="title-row">
          <h3 class="title">{post.data.title}</h3>

          {#if badges.length > 0}
            <div class="badges" aria-label="Badges">
              <!-- mobile set -->
              <div class="badges-set badges-mobile">
                {#each mobileBadges as b}
                  <span class="badge">{b}</span>
                {/each}
              </div>

              <!-- desktop set -->
              <div class="badges-set badges-desktop">
                {#each desktopBadges as b}
                  <span class="badge">{b}</span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </a>
    </li>
  {/each}
</ul>

<style>
  main {
    width: 100%;
  }
  ul {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  ul li {
    width: calc(32% - 1rem);
  }
  ul li * {
    text-decoration: none;
    transition: 0.2s ease;
  }
  ul li img {
    margin-bottom: 0.5rem;
    border-radius: 12px;
  }
  ul li a {
    display: block;
  }
  .title {
    margin: 0;
    color: rgb(var(--black));
    line-height: 1;
  }
  .date {
    margin: 0;
    color: rgb(var(--gray));
  }
  ul li a:hover h3,
  ul li a:hover .date {
    color: rgb(var(--accent));
  }
  ul a:hover img {
    box-shadow: var(--box-shadow);
  }

  .title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .title {
    margin: 0;
    font-size: 1.3rem;
  }

  @media (max-width: 720px) {
    ul {
      gap: 0.5em;
    }
    ul li {
      width: 100%;
      text-align: center;
    }
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .badges {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  /* set containers */
  .badges-set {
    display: flex;
    gap: 0.35rem;
    flex-wrap: nowrap;
  }

  /* show desktop by default */
  .badges-mobile {
    display: none;
  }
  .badges-desktop {
    display: flex;
  }

  @media (max-width: 640px) {
    .badges-mobile {
      display: flex;
    }
    .badges-desktop {
      display: none;
    }
  }

  .badge {
    font-size: 0.85rem;
    padding: 0.15em 0.55em;
    border-radius: 999px;
    background: #eef6ff;
    color: #2b5dab;
    white-space: nowrap;
  }
</style>
