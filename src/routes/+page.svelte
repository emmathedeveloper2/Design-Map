<script lang="ts">
  import { goto } from "$app/navigation";
  import { projectId } from "../store";
  import db from "../zashy/db";
  import HomeNav from "../components/ui/home-nav.svelte";

  const load_projects = async () => await db.project.getAll();
</script>

<div class="size-full flex p-2 gap-4">
  <HomeNav />
  {#await load_projects()}
    <div class="flex-1 w-full grid place-items-center">
      <h1>Loading....</h1>
    </div>
  {:then projects}
    <div class="w-full flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each projects as project}
        {@const loadProj = () => {
          projectId.set(project.id);
          goto("/project");
        }}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={loadProj}
          class="text-[var(--app-on-base-color)] cursor-pointer shadow-lg rounded-lg flex flex-col gap-4 bg-[var(--app-base-color)] backdrop-blur-sm p-4 h-max transition-all border border-[var(--app-secondary-color)] hover:border-[var(--app-primary-color)]"
        >
          <h1 class="text-3xl font-geist-black">{project.name}</h1>
          {#if project.description}
            <p>{project.description}</p>
          {/if}
          {#if project.createdAt}
            <small>{new Date(project.createdAt).toLocaleString()}</small>
          {/if}
        </div>
      {/each}
    </div>
  {/await}
</div>
