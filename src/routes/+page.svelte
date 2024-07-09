<script lang="ts">
  import { goto } from '$app/navigation'
  import { projectId } from '../store';
  import db from "../zashy/db";

  let modal_open = false;

  const load_projects = async () => await db.project.getAll();

  async function createNewProject(
    e: SubmitEvent & { currentTarget: HTMLFormElement }
  ) {
    const { name, description } = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as { name: string; description: string };

    const id = await db.project.addOne({ name, description });

    projectId.set(id)

    goto(`/project`);
  }
</script>

<div class="size-full flex flex-col">
  <nav class="h-[50px] p-4">
    <button on:click={() => (modal_open = true)} class="p-1 bg-emerald-400"
      >New</button
    >
  </nav>
  {#await load_projects()}
    <div class="flex-1 w-full grid place-items-center">
      <h1>Loading....</h1>
    </div>
  {:then projects}
    <div class="w-full flex-1">
      {#each projects as project}
      {@const loadProj = () => { projectId.set(project.id); goto('/project') }}
        <button on:click={loadProj}>{project.name}</button>
      {/each}
    </div>
  {/await}
</div>

{#if modal_open}
  <section class="fixed top-0 left-0 size-full z-10 bg-white">
    <form on:submit|preventDefault={createNewProject}>
      <input type="text" name="name" required placeholder="Name" />
      <input type="text" name="description" placeholder="Description" />
      <button
        class="bg-gray-200 p-1"
        type="button"
        on:click={() => (modal_open = false)}>Cancel</button
      >
      <button class="bg-emerald-400 p-1">Create</button>
    </form>
  </section>
{/if}
