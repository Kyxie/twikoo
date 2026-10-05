import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TkSelect from "../src/components/TkSelect.vue";

/** 测试用的来源选项。 */
const options = [
  { value: "", label: "请选择", disabled: true },
  { value: "valine", label: "Valine" },
  { value: "twikoo", label: "Twikoo" },
];

afterEach(() => {
  document.body.innerHTML = "";
});

describe("TkSelect", () => {
  it("显示当前值，选择选项时更新模型", async () => {
    const wrapper = mount(TkSelect, { props: { modelValue: "", options, label: "来源" } });
    expect(wrapper.find(".tk-select-value").text()).toBe("请选择");
    await wrapper.find(".tk-select-trigger").trigger("click");
    expect(wrapper.find('[role="listbox"]').attributes("hidden")).toBeUndefined();
    await wrapper.findAll('[role="option"]')[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["valine"]);
  });

  it("键盘导航跳过禁用项并支持 Escape 关闭", async () => {
    const wrapper = mount(TkSelect, { props: { modelValue: "", options, label: "来源" } });
    await wrapper.find(".tk-select-trigger").trigger("keydown", { key: "ArrowDown" });
    expect(wrapper.find(".tk-select-option-active").text()).toBe("Valine");
    await wrapper.find('[role="listbox"]').trigger("keydown", { key: "End" });
    expect(wrapper.find(".tk-select-option-active").text()).toBe("Twikoo");
    await wrapper.find('[role="listbox"]').trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["twikoo"]);
    await wrapper.find(".tk-select-trigger").trigger("click");
    await wrapper.find('[role="listbox"]').trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".tk-select-trigger").attributes("aria-expanded")).toBe("false");
  });
});
