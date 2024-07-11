

<div class="app-background size-full">
    <slot />
</div>

<style>
.app-background{
    background: linear-gradient(-90deg, var(--line) 1px, transparent 0), linear-gradient(var(--line) 1px, transparent 0), linear-gradient(-90deg, var(--line) 1px, transparent 0), linear-gradient(var(--line) 1px, transparent 0), linear-gradient(transparent 6px, transparent 0, transparent 156px, transparent 0), linear-gradient(-90deg, var(--line) 1px, transparent 0), linear-gradient(-90deg, transparent 6px, transparent 0, transparent 156px, transparent 0), linear-gradient(var(--line) 1px, transparent 0), 0 0;
    background-size: 32px 32px, 32px 32px, 256px 256px, 256px 256px, 256px 256px, 256px 256px, 256px 256px, 256px 256px;
}
</style>