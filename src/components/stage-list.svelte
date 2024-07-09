<script lang="ts">
  import { onMount } from "svelte";
  import { addNewTask, current_project, deleteStage, deleteTask, renameStage, stages, tasks } from "../store";
  import TaskBox, { active_task } from "./task-box.svelte";
  import db from "../zashy/db";
  import { ask } from "@tauri-apps/api/dialog";

  //Write concisely on employability and economic development

  const load_stages = async () => {

    if(!$current_project) return

    $stages = await db.stage.getAllWhere({ projectId: $current_project.id } as any)

    $tasks = await db.task.getAllWhere({ projectId: $current_project.id } as any)
  }

  const handleRename = ({ currentTarget } : { currentTarget: HTMLInputElement } , id?: number) => {

    const value = currentTarget.value

    if(!value || !id) return

    renameStage(id , value)
  }

  const handleAddTask = (stageId?: number) => {
    
    if(!$current_project?.id || !stageId) return

    addNewTask($current_project.id , stageId)
  }

  const handleDelete = async (stageId?: number) => {

    const found = $stages.find(s => s.id == stageId)

    const totalTasks = $tasks.filter(t => t.stageId === stageId)

    let deletionConfirmed = true

    if(found && totalTasks.length > 0) deletionConfirmed = await ask(`Do you really want to delete ${found.name} stage with ${totalTasks.length} subtask${totalTasks.length !== 1 ? 's' : ''}`)


    if(stageId && deletionConfirmed) await deleteStage(stageId)
  }

  const handleKeyPress = async (e: KeyboardEvent) => {

    if(e.key.toLowerCase() === 'escape' && $active_task) return active_task.set(undefined)

    if(e.key.toLowerCase() === 'delete' && $active_task){
      await deleteTask($active_task)

      active_task.set(undefined)
    } 
  }

  onMount(load_stages)
</script>

<svelte:body on:keyup={handleKeyPress}></svelte:body>

{#if $current_project}
  {#each $stages as stage , idx (stage.id)}
    <div
      class="w-full min-w-max h-[300px] relative border border-black p-4 flex items-center gap-4 mt-4"
    >
      <div class="h-full w-[200px] bg-gray-100 flex flex-col items-center justify-between p-4 relative">
        <div></div>
        <small class="absolute top-4 left-4">Stage {$stages.length - idx}</small>
        <input
          type="text"
          on:change={e => handleRename(e , stage.id)}
          on:blur={e => handleRename(e , stage.id)}
          value={stage.name}
          class="font-geist-black w-full p-2 bg-transparent text-center"
        />
        <button on:click={e => handleDelete(stage.id)} class="w-full p-2 rounded bg-black text-white">Delete Stage</button>
        <button on:click={e => handleAddTask(stage.id)} class="w-full p-2 rounded bg-black text-white">New Task</button>
      </div>

      {#each $tasks.filter(t => t.stageId === stage.id) as task (task.id)}
        <TaskBox {task}/>
      {/each}
    </div>
  {/each}
{/if}
