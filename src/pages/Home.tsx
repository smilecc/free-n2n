import { IServer } from "@/components";
import {
  Box,
  Button,
  TextInput,
  Select,
  Switch,
  InputWrapper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCommonStore } from "../stores";
import { invoke } from "@tauri-apps/api/tauri";

setInterval(() => {
  invoke<string>("get_edge_info")
    .then((ip) => {
      console.log(ip);
    })
    .catch((reason) => {
      console.log("err", reason);
    });
}, 1000);

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const commonStore = useCommonStore();
  const form = useForm({
    initialValues: {
      server: "",
      community: "",
      autoIP: true,
      ipAddress: "",
    },
  });

  // 监听服务器选择
  useEffect(() => {
    if (form.values.server) {
      const server: IServer = JSON.parse(form.values.server);
      form.setFieldValue("community", server.community);
      invoke("start_edge", { server: JSON.stringify(server) });
      console.log(server);
    }
  }, [form.values.server]);

  return (
    <div>
      <form className="max-w-sm">
        <InputWrapper label="服务器">
          <div className="flex items-end">
            <Observer>
              {() => (
                <Select
                  className="flex-1"
                  data={commonStore.servers.map((it) => ({
                    label: it.host,
                    value: JSON.stringify(it),
                  }))}
                  {...form.getInputProps("server")}
                />
              )}
            </Observer>
            <Button
              className="ml-3"
              size="sm"
              onClick={() => (commonStore.serverAddModal = true)}
            >
              {t("append")}
            </Button>
          </div>
        </InputWrapper>

        <TextInput
          className="mt-4"
          label="小组名称"
          placeholder="同一小组的设备可以互联"
          {...form.getInputProps("community")}
        />

        <InputWrapper label="IP地址" className="mt-4">
          <Switch
            className="mt-2"
            label="自动获取地址"
            {...form.getInputProps("autoIP")}
          />
          {form.values.autoIP || (
            <TextInput
              className="mt-3"
              placeholder="自定义IP地址"
              {...form.getInputProps("ipAddress")}
            />
          )}
        </InputWrapper>
      </form>
    </div>
  );
};
