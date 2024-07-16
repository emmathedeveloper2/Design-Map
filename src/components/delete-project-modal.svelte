<script lang="ts">
    import { createEventDispatcher } from "svelte";
  import { deleteProject } from "../store";
  import type { Project } from "../db";

    export let project: Project

    let inputValue = ""

    const dispatch = createEventDispatcher()
    
    async function handleDelete() {
        await deleteProject(project._id as number)

        dispatch('cancel')
    }
</script>

<form
class="bg-[var(--app-base-color)] flex flex-col items-center gap-4 w-[600px] rounded-lg shadow-lg p-4"
>

<h1 class="text-2xl font-geist-black">Are you sure you want to delete this project?</h1>

<p>To confirm, type "<b class="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] px-4 select-all">{project.name}</b>" to delete this project</p>

<input
  autofocus
  spellcheck="false"
  autocomplete="off"
  class="bg-transparent w-full"
  type="text"
  name="name"
  required
  bind:value={inputValue}
  placeholder="Text goes here..."
/>

<button
  disabled={inputValue !== project.name}
  on:click={handleDelete}
  class="bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] p-1 rounded shadow-inner disabled:opacity-70 w-full"
  >Delete</button
>
<button
  class="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] shadow-inner rounded p-1 w-full"
  type="button"
  on:click={() => dispatch('cancel')}>Cancel</button
>
</form>