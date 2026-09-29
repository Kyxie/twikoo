<template>
  <dialog ref="dialogRef" class="tk-confirm-dialog" :aria-labelledby="messageId" @close="onClose">
    <p :id="messageId" class="tk-confirm-dialog__message">{{ message }}</p>
    <div class="tk-confirm-dialog__actions">
      <TkButton @click="close('cancel')">{{ t("SUBMIT_CANCEL") }}</TkButton>
      <TkButton type="primary" @click="close('confirm')">{{ t("ADMIN_COMMENT_DELETE") }}</TkButton>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { onUnmounted, ref, useId } from "vue";
import TkButton from "./TkButton.vue";
import { t } from "../i18n";

defineProps<{ message: string }>();

const dialogRef = ref<HTMLDialogElement>();
const messageId = useId();
let resolvePending: ((confirmed: boolean) => void) | undefined;
let previousFocus: HTMLElement | null = null;

function open(): Promise<boolean> {
  const dialog = dialogRef.value;
  if (!dialog) return Promise.resolve(false);
  if (resolvePending) return Promise.resolve(false);
  previousFocus = dialog.ownerDocument.activeElement as HTMLElement | null;
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) => {
    resolvePending = resolve;
  });
}

function close(result: string): void {
  dialogRef.value?.close(result);
}

function onClose(): void {
  resolvePending?.(dialogRef.value?.returnValue === "confirm");
  resolvePending = undefined;
  previousFocus?.focus();
  previousFocus = null;
}

onUnmounted(() => {
  resolvePending?.(false);
  resolvePending = undefined;
});

defineExpose({ open });
</script>

<style>
.twikoo .tk-confirm-dialog {
  width: min(90vw, 24rem);
  margin: auto;
  padding: 1.5rem;
  border: 1px solid var(--border, #d1d5db);
  border-radius: 12px;
  background: var(--background, #fff);
  color: var(--foreground, #111);
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.18);
}
.twikoo .tk-confirm-dialog::backdrop {
  background: rgb(0 0 0 / 0.45);
}
.twikoo .tk-confirm-dialog__message {
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.twikoo .tk-confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
@media (prefers-reduced-motion: reduce) {
  .twikoo .tk-confirm-dialog {
    animation: none;
  }
}
</style>
