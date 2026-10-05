<template>
  <div ref="root" class="tk-select">
    <button
      ref="trigger"
      type="button"
      class="tk-select-trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="`${label}: ${selectedLabel}`"
      :aria-expanded="open"
      :aria-controls="listId"
      :disabled="disabled"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <span class="tk-select-value">{{ selectedLabel }}</span>
      <span class="tk-select-chevron" aria-hidden="true"></span>
    </button>
    <div
      :id="listId"
      ref="list"
      class="tk-select-list"
      role="listbox"
      :aria-label="label"
      :aria-activedescendant="open && active >= 0 ? `${listId}-option-${active}` : undefined"
      :hidden="!open"
      tabindex="-1"
      @keydown="onListKeydown"
    >
      <div
        v-for="(option, index) in options"
        :id="`${listId}-option-${index}`"
        :key="`${option.value}-${index}`"
        class="tk-select-option"
        :class="{ 'tk-select-option-active': index === active && open }"
        role="option"
        :aria-selected="option.value === modelValue"
        :aria-disabled="option.disabled || undefined"
        @click="choose(index)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

/** 下拉选项。 */
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** 当前组件实例的列表编号，供 ARIA 关联使用。 */
let nextSelectId = 0;

/** 当前值、候选项与无障碍标签。 */
const props = defineProps<{
  modelValue: string;
  options: SelectOption[];
  label: string;
  disabled?: boolean;
}>();
/** 选择后同步父组件模型。 */
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const listId = `tk-select-${++nextSelectId}-list`;
const root = ref<HTMLElement>();
const trigger = ref<HTMLButtonElement>();
const list = ref<HTMLElement>();
const open = ref(false);
const active = ref(-1);
const selectedLabel = computed(
  () => props.options.find((item) => item.value === props.modelValue)?.label ?? "",
);

/** 返回所有可选择选项的原始索引。 */
function enabledIndices(): number[] {
  return props.options.flatMap((option, index) => (option.disabled ? [] : [index]));
}

/** 将活动项滚入可见区域。 */
function focusActive(): void {
  if (active.value < 0) return;
  list.value
    ?.querySelectorAll<HTMLElement>('[role="option"]')
    [active.value]?.scrollIntoView?.({ block: "nearest" });
}

/** 展开列表并将当前项或其相邻项设为活动项。 */
async function show(direction = 0): Promise<void> {
  if (props.disabled) return;
  const enabled = enabledIndices();
  if (!enabled.length) return;
  const selected = enabled.findIndex((index) => props.options[index].value === props.modelValue);
  active.value = enabled[Math.max(0, Math.min(enabled.length - 1, selected + direction))];
  open.value = true;
  await nextTick();
  list.value?.focus();
  focusActive();
}

/** 收起列表，可选地恢复触发按钮焦点。 */
function close(restoreFocus = false): void {
  open.value = false;
  if (restoreFocus) trigger.value?.focus();
}

/** 切换列表显隐。 */
function toggle(): void {
  if (open.value) close();
  else void show();
}

/** 选择活动选项，并回到触发按钮。 */
function choose(index: number): void {
  const option = props.options[index];
  if (!option || option.disabled) return;
  emit("update:modelValue", option.value);
  close(true);
}

/** 处理触发按钮上的键盘操作。 */
function onTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    void show(event.key === "ArrowDown" ? 1 : -1);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggle();
  }
}

/** 处理选项导航、确认和退出。 */
function onListKeydown(event: KeyboardEvent): void {
  const enabled = enabledIndices();
  const current = enabled.indexOf(active.value);
  let next = current;
  if (event.key === "ArrowDown") next = Math.min(enabled.length - 1, current + 1);
  else if (event.key === "ArrowUp") next = Math.max(0, current - 1);
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = enabled.length - 1;
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    choose(active.value);
    return;
  } else if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") event.preventDefault();
    close(event.key === "Escape");
    return;
  } else return;
  event.preventDefault();
  if (enabled[next] !== undefined) active.value = enabled[next];
  void nextTick(focusActive);
}

/** 点击组件外时收起列表。 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!root.value?.contains(event.target as Node)) close();
}

/** 焦点离开组件时收起列表。 */
function onDocumentFocusIn(event: FocusEvent): void {
  if (!root.value?.contains(event.target as Node)) close();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("focusin", onDocumentFocusIn);
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("focusin", onDocumentFocusIn);
});
</script>

<style>
.twikoo .tk-select {
  position: relative;
  width: 100%;
  min-width: 0;
}
.twikoo .tk-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
  width: 100%;
  min-height: 32px;
  padding: 0.4em 0.6em;
  border: 1px solid rgba(144, 147, 153, 0.31);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.twikoo .tk-select-trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.twikoo .tk-select-chevron {
  flex: none;
  width: 0.5em;
  height: 0.5em;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
}
.twikoo .tk-select-list {
  position: absolute;
  z-index: 10;
  top: calc(100% + 0.25em);
  left: 0;
  width: 100%;
  max-height: 16em;
  overflow-y: auto;
  padding: 0.25em;
  border: 1px solid rgba(144, 147, 153, 0.31);
  border-radius: 4px;
  background: #333;
  color: inherit;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.twikoo .tk-select-list[hidden] {
  display: none;
}
.twikoo .tk-select-list:focus {
  outline: none;
}
.twikoo .tk-select-option {
  padding: 0.4em 0.5em;
  border-radius: 3px;
  cursor: pointer;
}
.twikoo .tk-select-option:is(:hover, .tk-select-option-active) {
  background: rgba(255, 255, 255, 0.15);
}
.twikoo .tk-select-option[aria-selected="true"] {
  font-weight: 600;
}
.twikoo .tk-select-option[aria-disabled="true"] {
  opacity: 0.5;
  cursor: default;
}
</style>
