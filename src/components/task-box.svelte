<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const active_task = writable<number|undefined>(undefined)
</script>
<script lang="ts">
  import { renameTask } from "../store";
  import type { Task } from "../zashy/db";

  export let task: Task;

  const handleRename = async ({ currentTarget } : { currentTarget: HTMLInputElement } , id?: number) => {

    const value = currentTarget.value.trim()

    if(!value || !task.id) return

    renameTask(task.id , value)
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => $active_task = task.id} class="h-full w-[200px] p-2 flex items-center justify-center {task.id == $active_task ? 'bg-black text-white' : 'bg-gray-100'}">
  {#if task.subTasks}
    <small class="absolute bottom-4 right-4"></small>
  {/if}
  <input
    type="text"
    on:change={e => handleRename(e , task.id)}
    on:blur={e => handleRename(e , task.id)}
    value={task.label}
    class="font-geist-black w-full p-2 bg-transparent text-center"
  />
</div>
