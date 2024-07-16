<script lang="ts">
  import { addNewStage } from "../../store";
  import { current_project } from '../../store'
    
</script>

{#if $current_project && $current_project._id}
    <nav class="w-max flex gap-4 rounded-full p-2 shadow-lg bg-[var(--app-base-color)] top-4 fixed left-1/2 -translate-x-1/2 z-10 text-sm">
        <button on:click={() => addNewStage($current_project._id)} class="px-4 py-1 rounded-full bg-[var(--app-primary-color)] text-[var(--app-on-primary-color)]">New Stage</button>
    </nav>
{/if}