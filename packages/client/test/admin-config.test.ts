import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TkAdminConfig from "../src/components/TkAdminConfig.vue";
import { setAppState } from "../src/utils/api";

describe("TkAdminConfig 邮件测试", () => {
  it("邮箱输入和发送按钮是独立控件，没有输入框追加尾部", () => {
    setAppState(
      { app: { callFunction: async () => ({ result: { code: 0, data: {} } }) } } as never,
      {},
    );
    const wrapper = mount(TkAdminConfig);
    const row = wrapper.find(".tk-admin-config-email-test-controls");
    expect(row.find(".tk-input").exists()).toBe(true);
    expect(row.find(".tk-button").exists()).toBe(true);
    expect(row.find(".tk-input-group__append").exists()).toBe(false);
    wrapper.unmount();
    setAppState(null, {});
  });
});
