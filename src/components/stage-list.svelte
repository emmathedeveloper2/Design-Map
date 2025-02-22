<script lang="ts">
  import { onMount } from "svelte";
  import {
    addNewTask,
    current_project,
    deleteStage,
    deleteTask,
    renameStage,
    stages,
    tasks,
  } from "../store";
  import TaskBox, { active_task } from "./task-box.svelte";
  import { ask } from "@tauri-apps/api/dialog";
  import { stageStore, taskStore } from "../db";

  const load_stages = async () => {
    if (!$current_project) return;

    $stages = (
      await stageStore.getAllWhere({ projectId: $current_project._id } as any)
    ).sort((a , b) => (a.createdAt as number) - (b.createdAt as number));

    $tasks = (
      await taskStore.getAllWhere({ projectId: $current_project._id } as any)
    ).sort((a, b) => (a.createdAt as number) - (b.createdAt as number));
  };

  const handleRename = (
    { currentTarget }: { currentTarget: HTMLElement },
    id?: number
  ) => {
    const value = currentTarget.textContent?.trim();

    if (!value || !id)
      return (currentTarget.textContent = $stages.find(
        (stage) => stage._id === id
      )?.name as string);

    renameStage(id, value);
  };

  const handleAddTask = (stageId?: number) => {
    if (!$current_project?._id || !stageId) return;

    addNewTask($current_project._id, stageId);
  };

  const handleDelete = async (stageId?: number) => {
    const found = $stages.find((s) => s._id == stageId);

    const totalTasks = $tasks.filter((t) => t.stageId === stageId && !t.isSubTask).length;

    const totalSubtasks = $tasks.filter((t) => t.stageId === stageId && t.isSubTask).length;

    let deletionConfirmed = true;

    if (found && totalTasks > 0)
      deletionConfirmed = await ask(
        `Do you really want to delete ${found.name} stage with ${totalTasks} task${totalTasks !== 1 ? "s" : ""} ${totalSubtasks > 0 ? `and ${totalSubtasks} subtask${totalSubtasks !== 1 ? "s" : ""}` : ''}`
      );

    if (stageId && deletionConfirmed) await deleteStage(stageId);
  };

  const handleKeyPress = async (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "escape" && $active_task)
      return active_task.set(undefined);

    if (e.key.toLowerCase() === "delete" && $active_task) {

      const foundTask = $tasks.find((t) => t._id === $active_task);

      const totalSubTasks = foundTask?.subTasks.length || 0

      let deletionConfirmed = true

      if(foundTask && totalSubTasks > 0){
        deletionConfirmed = await ask(
        `Do you really want to delete ${foundTask.label.trim() || 'this'} task with ${totalSubTasks} subtask${totalSubTasks !== 1 ? "s" : ""}`
        );
      }

      if(deletionConfirmed) await deleteTask($active_task);

      active_task.set(undefined);
    }
  };

  onMount(load_stages);
</script>

<svelte:body on:keyup={handleKeyPress} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if $current_project}
  {#each $stages as stage, idx (stage._id)}
    <section class="w-full mb-4">
      <div
        class="w-max flex items-center gap-4 rounded-full p-2 shadow-lg bg-[var(--app-base-color)]"
      >
        <small
          >Stage {idx + 1} •
          <b
            class="outline-none text-[var(--app-primary-color)]"
            on:blur={(e) => handleRename(e, stage._id)}
            on:change={(e) => handleRename(e, stage._id)}
            contenteditable="true">{stage.name}</b
          ></small
        >
        <small class="cursor-pointer rounded-full bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] px-2 flex items-center justify-center font-geist-medium" on:click={() => handleAddTask(stage._id)}>Add Task</small>
        <small class="cursor-pointer rounded-full bg-[var(--app-secondary-color)] text-[var(--app-on-secondary-color)] px-2 flex items-center justify-center font-geist-medium" on:click={() => handleDelete(stage._id)}>Delete Stage</small>
      </div>

      <div class="w-full overflow-x-scroll py-4">
        <div
          class="w-full min-w-max h-[300px] relative flex items-center gap-4"
        >
          {#each $tasks.filter((t) => t.stageId === stage._id && !t.isSubTask) as task (task._id)}
            <div class="h-full">
              <TaskBox {task} />
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/each}
{/if}