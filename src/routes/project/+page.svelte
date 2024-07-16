<script lang="ts">
  import { onDestroy } from 'svelte'
  import { current_project , projectId } from "../../store";
  import StageList from "../../components/stage-list.svelte";
  import ProjectMenuBar from '../../components/ui/project-menu-bar.svelte';
  import { projectStore, type Project } from '../../db';

  const load_project = async () => {

    if($projectId == undefined) throw new Error('')

    const data = await projectStore.getOne($projectId as number) as Project

    current_project.set(data);
  };

  onDestroy(() => {
    current_project.set(null)
    projectId.set(undefined)
  })
</script>

{#await load_project()}
  <div class="size-full grid place-items-center">
    <h1 class="text-5xl">Loading....</h1>
  </div>
  {:then res}
  {#if $current_project && $current_project._id}
    <div class="size-full p-4">
      <ProjectMenuBar />

      <div class="w-full h-full overflow-y-scroll pt-[70px]">
        <StageList />
      </div>
    </div>
  {/if}
  {:catch}
  <div class="size-full flex flex-col items-center justify-center gap-8">
    <h1 class="text-5xl">Project Not Found</h1>
    <a href="/" class="bg-[var(--app-primary-color)] p-4 rounded text-[var(--app-on-primary-color)] w-[300px] text-center">Go Home</a>
  </div>  
{/await}
