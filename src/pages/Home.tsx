import { IServer } from "@/components";
import { Box, Button, TextInput, Select, Switch, InputWrapper, Paper, Group, Text, SimpleGrid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Observer, useObserver } from "mobx-react-lite";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCommonStore } from "../stores";
import { invoke } from "@tauri-apps/api/tauri";
import * as fs from "@tauri-apps/api/fs";
import { useClipboard } from "@mantine/hooks";

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
  console.log(form.values.autoIP);
  // 当form变化时存入store
  useEffect(() => {
    if (form.values.server) {
      commonStore.currentServerForm = form.values;
    }
  }, [form.values]);

  // 窗口初始化时从store读取之前的数据
  useEffect(() => {
    if (commonStore.currentServerForm && commonStore.currentServerForm.server) {
      form.setValues({
        ...commonStore.currentServerForm,
      });
    }
  }, []);

  const startEdge = useCallback(() => {
    if (form.values.server) {
      const server = commonStore.servers.find((it) => it.id == form.values.server);
      if (server) {
        invoke("start_edge", { server: JSON.stringify(server) });
        commonStore.state = "RUNNING";
        console.log("Server Start", server);
      }
    }
  }, [form.values]);

  const stopEdge = useCallback(() => {
    invoke("stop_edge", { server: form.values.server });
    commonStore.state = "STOPPING";
  }, []);

  const pickServer = useCallback((serverId: string) => {
    commonStore.currentServer = commonStore.servers.find((it) => it.id == serverId);

    form.setValues({
      ...form.values,
      server: serverId!,
      community: commonStore.currentServer?.community || "",
      autoIP: true,
    });
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
                    value: it.id,
                  }))}
                  {...form.getInputProps("server")}
                  onChange={(v) => {
                    pickServer(v!);
                  }}
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

        <InputWrapper
          label="IP地址"
          className="mt-4"
        >
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
                    <Button
                      loading
                      color="red"
                    >
                      停止中
                    </Button>
                  );
                case "STARTING":
                  return <Button loading>服务启动中</Button>;
                case "RUNNING":
                  return (
                    <Button
                      color="red"
                      onClick={stopEdge}
                    >
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
        <Observer>
          {() => (
            <>
              <StatusCard
                name="IP地址"
                value={commonStore.currentIp}
              />
              <StatusCard
                name="MAC地址"
                value={commonStore.currentMac}
              />
              <StatusCard
                name="MTU"
                value={commonStore.currentMTU}
              />
              <StatusCard
                name="跃点"
                value={commonStore.currentMetric}
              />
              <StatusCard
                name="网卡"
                value={commonStore.currentDevice}
              />
            </>
          )}
        </Observer>
      </SimpleGrid>
    </div>
  );
};

const StatusCard: React.FC<{
  name: string;
  value: string | number;
}> = (props) => {
  const clipboard = useClipboard({ timeout: 1000 });

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
    >
      <Group position="apart">
        <Text
          size="xs"
          color="dimmed"
          className="w-full font-bold"
        >
          <div className="flex items-center justify-between">
            <span>{props.name}</span>
            <Button
              variant="subtle"
              compact
              className="ml-2"
              size="xs"
              color={clipboard.copied ? "teal" : "blue"}
              onClick={() => clipboard.copy(props.value)}
            >
              {clipboard.copied ? "已复制" : "复制"}
            </Button>
          </div>
        </Text>
      </Group>

      <Group
        align="flex-end"
        spacing="xs"
        mt={12}
      >
        <Text className="select-text text-lg font-bold">{props.value || "-"}</Text>
      </Group>
    </Paper>
  );
};
