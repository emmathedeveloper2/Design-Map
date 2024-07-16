<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const active_task = writable<number | undefined>(undefined);
</script>

<script lang="ts">
  import {
    addNewTask,
    deleteTask,
    markTaskAsCompleted,
    renameTask,
    tasks as taskList,
  } from "../store";
  import type { Task } from "../db";
  import { CheckIcon, ListTodoIcon, PlusIcon, TrashIcon } from "lucide-svelte";
  import { fade, slide } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let task: Task;

  let inputEl: HTMLInputElement;

  let subtask_modal_open = false;

  $: subTasks = $taskList.filter((t) => task.subTasks.includes(t._id));

  $: completedTasks = subTasks.filter(t => t.completed)

  $: taskCompletetionPercentage = Math.floor((completedTasks.length / subTasks.length) * 100)

  const handleRename = async (
    { currentTarget }: { currentTarget: HTMLInputElement },
    id?: number
  ) => {
    const value = currentTarget.value.trim();

    if (!value || !task._id) return;

    renameTask(task._id, value);
  };

  const handleAddNewSubTask = async (
    e: SubmitEvent & { currentTarget: HTMLFormElement }
  ) => {
    const { label } = Object.fromEntries(new FormData(e.currentTarget)) as {
      label: string;
    };

    await addNewTask(task.projectId, task.stageId, {
      isSubTask: true,
      label,
      parentTaskId: task._id,
    });

    inputEl.value = ''
  };

  const handleKeyPress = async (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "escape") return (subtask_modal_open = false);
  };
</script>

<svelte:body on:keyup={handleKeyPress} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:click={() => ($active_task = task._id)}
  class="relative h-full w-[200px] p-2 flex items-center justify-center rounded-lg bg-[var(--app-base-color)] shadow-lg border {task._id ==
  $active_task
    ? 'border-[var(--app-primary-color)]'
    : 'border-[var(--app-secondary-color)]'}"
>

  <div class="absolute top-2 right-2">
    {#if subTasks.length}
      <small class="{taskCompletetionPercentage == 100 ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-[var(--app-secondary-color)]'} px-2 p-1 rounded-full">{taskCompletetionPercentage}% complete</small>
      {:else}
      <div on:click={() => markTaskAsCompleted(task._id)} class="{task.completed ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-[var(--app-secondary-color)]'} rounded-full cursor-pointer px-2">
        {#if task.completed}
          <small class="block" in:slide|local>completed</small>
          {:else}
          <small class="block" in:slide|local>pending</small>
        {/if}
      </div>
    {/if}
  </div>

  <div
    class="rounded-full p-1 absolute bottom-2 right-2"
    on:click={() => (subtask_modal_open = true)}
  >
    {#if subTasks.length}
    <div class="flex flex-col gap-2 items-end group">
      <small class="opacity-0 group-hover:opacity-100 px-1 rounded-full bg-[var(--app-secondary-color)] transition-opacity delay-200"
        >{subTasks.length} tasks</small
      >
      <small class="opacity-0 group-hover:opacity-100 px-1 rounded-full bg-[var(--app-secondary-color)] transition-opacity delay-100"
        >{completedTasks.length} completed</small
      >
      <small class="opacity-0 group-hover:opacity-100 px-1 rounded-full bg-[var(--app-secondary-color)] transition-opacity delay-0"
        >{subTasks.length - completedTasks.length} pending</small
      >
      <button
      title="Edit Subtasks"
      class="size-[20] rounded-full bg-[var(--app-secondary-color)] p-2 transition-colors hover:bg-[var(--app-primary-color)] hover:text-[var(--app-on-primary-color)]"
      ><ListTodoIcon size={15} /></button
      >
    </div>
    {:else}
      <button
        title="Add Subtask"
        class="size-[20] rounded-full bg-[var(--app-secondary-color)] p-2 transition-colors hover:bg-[var(--app-primary-color)] hover:text-[var(--app-on-primary-color)]"
        ><PlusIcon size={15} /></button
      >
    {/if}
  </div>

  <input
    type="text"
    on:change={(e) => handleRename(e, task._id)}
    on:blur={(e) => handleRename(e, task._id)}
    value={task.label}
    placeholder="Untitled"
    class="font-geist-black w-full p-2 bg-transparent text-center"
  />
</div>

{#if subtask_modal_open}
  <section
    transition:fade={{ duration: 100 }}
    class="fixed top-0 left-0 size-full z-10 bg-[var(--app-secondary-color)] backdrop-blur flex items-center justify-center"
  >
    <div class="bg-[var(--app-base-color)] p-2 w-[300px] shadow-lg rounded-md">
      <form on:submit|preventDefault={handleAddNewSubTask} class="w-full">
        <input
          autocomplete="off"
          required
          name="label"
          placeholder="Label"
          type="text"
          bind:this={inputEl}
          class="p-2 rounded mb-4 bg-[var(--app-secondary-color)] w-full"
        />
        <button
          class="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)]"
        >
          <PlusIcon />
          <p>Add</p>
        </button>
      </form>
      <ul class="block mt-2 p-2 h-[400px] overflow-scroll">
        {#each subTasks as task (task._id)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li
            on:click={() => markTaskAsCompleted(task._id)}
            transition:fade={{ duration: 200 }}
            animate:flip={{ duration: 200 }}
            class="p-2 rounded border {task.completed
              ? 'border-emerald-400'
              : 'border-[var(--app-secondary-color)]'} flex items-center justify-between relative mb-4"
          >
            <p>{task.label}</p>

            <div class="flex items-center gap-2">
              {#if task.completed}
                <span transition:slide={{ axis: 'x' }}>
                  <CheckIcon size={15} class="text-emerald-400" />
                </span>
              {/if}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div on:click={() => deleteTask(task._id)}>
                <TrashIcon size={15}/>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}
