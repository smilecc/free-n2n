import { IServer } from "@/components";
import {
  Box,
  Button,
  TextInput,
  Select,
  Switch,
  InputWrapper,
  Paper,
  Group,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Observer } from "mobx-react-lite";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCommonStore } from "../stores";
import { invoke } from "@tauri-apps/api/tauri";
import * as fs from "@tauri-apps/api/fs";

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
      form.setValues({
        ...form.values,
        community: server.community,
        autoIP: true,
      });

      console.log(server);
    }
  }, [form.values.server]);

  const startEdge = useCallback(() => {
    if (form.values.server) {
      const server: IServer = JSON.parse(form.values.server);
      invoke("start_edge", { server: form.values.server });
      commonStore.state = "RUNNING";
      console.log("Server Start", server);
    }
  }, [form.values]);

  const stopEdge = useCallback(() => {
    invoke("stop_edge", { server: form.values.server });
    commonStore.state = "STOPPING";
  }, []);

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
            {...form.getInputProps("autoIP", { type: "checkbox" })}
          />
          {form.values.autoIP || (
            <TextInput
              className="mt-3"
              placeholder="自定义IP地址"
              {...form.getInputProps("ipAddress")}
            />
          )}
        </InputWrapper>

        <div className="mt-10">
          <Observer>
            {() => {
              switch (commonStore.state) {
                case "INIT":
                  return <Button loading>初始化中</Button>;
                case "STOP":
                  return <Button onClick={startEdge}>启动服务</Button>;
                case "STOPPING":
                  return (
                    <Button loading color="red">
                      停止中
                    </Button>
                  );
                case "STARTING":
                  return <Button loading>服务启动中</Button>;
                case "RUNNING":
                  return (
                    <Button color="red" onClick={stopEdge}>
                      停止服务
                    </Button>
                  );
                default:
                  return null;
              }
            }}
          </Observer>
        </div>
      </form>

      <SimpleGrid
        className="mt-8"
        cols={2}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className="font-bold">
              IP地址
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={12}>
            <Observer>
              {() => (
                <Text className="text-lg font-bold">
                  {commonStore.currentIp || "-"}
                </Text>
              )}
            </Observer>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
};
