<script lang="ts">
  import { onDestroy } from 'svelte'
  import db from "../../zashy/db";
  import { current_project , projectId , addNewStage } from "../../store";
  import StageList from "../../components/stage-list.svelte";

  const load_project = async () => {

    if($projectId == undefined) throw new Error('')

    const data = await db.project.getOne($projectId as number);

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
  {#if $current_project}
    <div class="size-full p-4">
      <div class="w-full h-[200px] bg-black grid place-items-center">
        <button on:click={() => addNewStage($current_project?.id)} class="w-[300px] p-4 rounded-lg bg-white text-black font-geist-black text-2xl">New Stage</button>
      </div>

      <div class="w-full overflow-scroll">
        <StageList />
      </div>
    </div>
  {/if}
  {:catch}
  <div class="size-full flex flex-col items-center justify-center gap-8">
    <h1 class="text-5xl">Project Not Found</h1>
    <a href="/" class="bg-black p-4 rounded text-white w-[300px] text-center">Go Home</a>
  </div>  
{/await}
