<script lang="ts">
  import "../global.css";
  import AppBackground from "../components/ui/app-background.svelte";
  import migrateToNex from "../db/migrate-to-nex";
  import { PencilIcon } from "lucide-svelte";
</script>

{#await migrateToNex()}
    <div class="size-full flex flex-col gap-4 items-center justify-center">
        <PencilIcon class='animate-bounce'/>
    </div>
{:then res}
    <AppBackground>
    <slot />
    </AppBackground>
{:catch err}
    <div class="size-full flex flex-col gap-4 items-center justify-center">
        <h1 class="text-2xl lg:text-4xl font-geist-black">Oop's, Something wrong happened while migrating your data</h1>
    </div>
{/await}