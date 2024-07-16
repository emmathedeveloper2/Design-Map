<script lang="ts">
  import { projectList, theme } from "../store";
  import ProjectItemBox from '../components/project-item-box.svelte'
  import { projectStore } from "../db/index.js";
  import HomeNav from "../components/ui/home-nav.svelte";
  import { onMount } from "svelte";

  const load_projects = async () => {
    projectList.set((await projectStore.getAll()).sort((a , b) => (a.createdAt as number) - (b.createdAt as number)))
  };

  onMount(() => {
    document.body.setAttribute('data-theme' , $theme)
  })
</script>

<div class="size-full flex p-2 gap-4">
  <HomeNav />
  {#await load_projects()}
    <div class="flex-1 w-full grid place-items-center">
      <h1>Loading....</h1>
    </div>
  {:then res}
    <div class="w-full flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each $projectList as project}
        <ProjectItemBox {project}/>
      {/each}
    </div>
  {/await}
</div>