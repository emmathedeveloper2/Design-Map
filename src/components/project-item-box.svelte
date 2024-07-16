<script lang="ts">
  import { goto } from "$app/navigation";
  import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-svelte";
  import { projectId } from "../store";
  import { fade } from "svelte/transition";
  import DeleteProjectModal from "./delete-project-modal.svelte";
  import EditProjectModal from "./edit-project-modal.svelte";
  import type { Project } from "../db";

  type Modals = "edit" | "delete" | undefined;

  export let project: Project;

  let active_modal: Modals = undefined;

  const loadProj = () => {
    projectId.set(project._id);
    goto("/project");
  };

  const handleKeyPress = async (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "escape" && active_modal !== undefined)
      return active_modal = undefined
  };
</script>

<svelte:body on:keyup={handleKeyPress}></svelte:body>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="text-[var(--app-on-base-color)] shadow-lg rounded-lg flex flex-col gap-4 bg-[var(--app-base-color)] backdrop-blur-sm p-4 h-max transition-all border border-[var(--app-secondary-color)] hover:border-[var(--app-primary-color)] relative"
>
  <div class="w-full flex justify-end gap-1">
    <button
      class="p-1 rounded transition-all hover:bg-[var(--app-secondary-color)] relative group"
    >
      <EllipsisIcon />

      <div
        class="absolute opacity-0 pointer-events-none p-2 rounded-lg shadow-lg bottom-0 right-0 translate-y-full border border-[var(--app-secondary-color)] bg-[var(--app-base-color)] w-[200px] group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
      >
        <button
          on:click={() => active_modal = 'edit'}
          class="p-2 hover:bg-[var(--app-secondary-color)] transition-colors cursor-pointer rounded flex items-center gap-4 w-full"
        >
          <PencilIcon />
          <p class="first-letter:uppercase">Edit</p>
        </button>

        <button
          on:click={() => active_modal = 'delete'}
          class="p-2 text-red-500 hover:bg-[var(--app-secondary-color)] transition-colors cursor-pointer rounded flex items-center gap-4 w-full"
        >
          <Trash2Icon />
          <p class="first-letter:uppercase">Delete</p>
        </button>
      </div>
    </button>
  </div>

  <h1 on:click={loadProj} class="text-3xl font-geist-black cursor-pointer hover:underline decoration-[var(--app-primary-color)]">{project.name}</h1>
  {#if project.description}
    <p>{project.description}</p>
  {/if}
  {#if project.createdAt}
    <small>{new Date(project.createdAt).toLocaleString()}</small>
  {/if}
</div>

{#if active_modal !== undefined}
  <section
    transition:fade={{ duration: 100 }}
    class="fixed top-0 left-0 size-full z-10 bg-[var(--app-secondary-color)] backdrop-blur flex items-center justify-center"
  >
    {#if active_modal === "delete"}
      <DeleteProjectModal on:cancel={() => active_modal = undefined} {project}/>
    {/if}
    {#if active_modal === "edit"}
      <EditProjectModal on:cancel={() => active_modal = undefined} {project}/>
    {/if}
  </section>
{/if}
