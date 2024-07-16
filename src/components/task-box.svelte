<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const active_task = writable<number|undefined>(undefined)
</script>
<script lang="ts">
  import { renameTask } from "../store";
  import type { Task } from "../db";

  export let task: Task;

  const handleRename = async ({ currentTarget } : { currentTarget: HTMLInputElement } , id?: number) => {

    const value = currentTarget.value.trim()

    if(!value || !task._id) return

    renameTask(task._id , value)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => $active_task = task._id} class="h-full w-[200px] p-2 flex items-center justify-center rounded-lg bg-[var(--app-base-color)] shadow-lg border {task._id == $active_task ? 'border-[var(--app-primary-color)]' : 'border-[var(--app-secondary-color)]'}">
  {#if task.subTasks}
    <small class="absolute bottom-4 right-4"></small>
  {/if}
  <input
    type="text"
    on:change={e => handleRename(e , task._id)}
    on:blur={e => handleRename(e , task._id)}
    value={task.label}
    placeholder="Untitled"
    class="font-geist-black w-full p-2 bg-transparent text-center"
  />
</div>
