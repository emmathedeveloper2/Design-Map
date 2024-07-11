<script lang="ts">
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { projectId, theme } from "../../store";
  import db from "../../zashy/db";
  import { FilePlus } from "lucide-svelte";

  let modal_open = false;

  async function createNewProject(
    e: SubmitEvent & { currentTarget: HTMLFormElement }
  ) {
    const { name, description } = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as { name: string; description: string };

    const id = await db.project.addOne({ name, description });

    projectId.set(id);

    goto(`/project`);
  }

  const handleKeyPress = async (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "escape" && modal_open)
      return (modal_open = false);

    if (e.key.toLowerCase() === "n" && e.ctrlKey) modal_open = true;
  };
</script>

<svelte:body on:keyup={handleKeyPress} />

<nav
  class="h-full w-[250px] shadow-lg rounded-lg flex flex-col justify-between items-center gap-4 bg-[var(--app-base-color)] backdrop-blur-sm p-4"
>
  <button
    on:click={() => (modal_open = true)}
    class="w-full p-2 bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] rounded shadow-inner flex items-center justify-center gap-4"
  >
    <FilePlus />
    <p>New</p>
  </button>

  <div
    class="w-full p-2 bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] rounded flex items-center relative group"
  >
    <div
      class="absolute opacity-0 pointer-events-none p-2 rounded-lg shadow-lg top-0 left-0 -translate-y-full border border-[var(--app-secondary-color)] bg-[var(--app-base-color)] w-full group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
    >
      {#each ["light", "dark"] as thm}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <p
          on:click={() => theme.set(thm)}
          class="first-letter:uppercase p-2 hover:bg-[var(--app-secondary-color)] transition-colors cursor-pointer rounded"
        >
          {thm}
        </p>
      {/each}
    </div>
    <p class="first-letter:uppercase">{$theme}</p>
  </div>
</nav>

{#if modal_open}
  <section
    transition:fade={{ duration: 100 }}
    class="fixed top-0 left-0 size-full z-10 bg-[var(--app-secondary-color)] backdrop-blur flex items-center justify-center"
  >
    <form
      on:submit|preventDefault={createNewProject}
      class="bg-[var(--app-base-color)] flex flex-col gap-4 w-[600px] rounded-lg shadow-lg p-4"
    >
      <input
        autofocus
        autocomplete="off"
        class="bg-transparent"
        type="text"
        name="name"
        required
        placeholder="Name"
      />
      <input
        autocomplete="off"
        class="bg-transparent"
        type="text"
        name="description"
        placeholder="Description"
      />
      <button
        class="bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)] p-1 rounded shadow-inner"
        >Create</button
      >
      <button
        class="bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] shadow-inner rounded p-1"
        type="button"
        on:click={() => (modal_open = false)}>Cancel</button
      >
    </form>
  </section>
{/if}
