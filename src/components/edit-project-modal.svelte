<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { updateProject } from "../store";
  import type { Project } from "../db";

  export let project: Project;

  const dispatch = createEventDispatcher();

  const handleSubmit = async (
    e: SubmitEvent & { currentTarget: HTMLFormElement }
  ) => {
    const { name, description } = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as { name: string; description: string };
    
    await updateProject(project._id as any , name , description)

    dispatch('cancel')
  };
</script>

<form
  on:submit|preventDefault={handleSubmit}
  class="bg-[var(--app-base-color)] flex flex-col gap-4 w-[600px] rounded-lg shadow-lg p-4"
>
  <input
    autofocus
    autocomplete="off"
    class="bg-transparent"
    type="text"
    name="name"
    required
    value={project.name}
    placeholder="Name"
  />
  <input
    autocomplete="off"
    class="bg-transparent"
    type="text"
    name="description"
    value={project.description}
    placeholder="Description"
  />
  <button
    class="bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] p-1 rounded shadow-inner"
    >Update</button
  >
  <button
    class="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] shadow-inner rounded p-1"
    type="button"
    on:click={() => dispatch("cancel")}>Cancel</button
  >
</form>
