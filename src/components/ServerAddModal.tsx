import { useCommonStore } from "@/stores";
import {
  Button,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useReactive } from "ahooks";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_SERVER_CONFIG, IServer } from "./ServerModel";

export interface IServerAddModalProps {
  opened: boolean;
  onClose: () => void;
}

export const ServerAddModal: React.FC<IServerAddModalProps> = (props) => {
  const commonStore = useCommonStore();
  const { t } = useTranslation();
  const state = useReactive({
    panel: "basic",
  });

  const form = useForm({
    initialValues: {
      host: "",
      community: "",
      enablePMTU: false,
      supernodeForward: "NONE",
      regInterval: 20,
      compress: "NONE",
    } as IServer,
  });

  useEffect(() => {
    if (props.opened) {
      state.panel = "basic";
      form.setValues({ ...DEFAULT_SERVER_CONFIG });
    }
  }, [props.opened]);

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={`${t("append")}${t("server")}`}
      centered
    >
      <div className="mb-4 flex justify-center">
        <SegmentedControl
          data={[
            { label: "基础设置", value: "basic" },
            { label: "高级设置", value: "advance" },
          ]}
          value={state.panel}
          onChange={(value) => (state.panel = value)}
        />
      </div>
      <form
        onSubmit={form.onSubmit((value: IServer) => {
          commonStore.servers.push(value);
          props.onClose();
        })}
      >
        <div className={`${state.panel == "basic" || "hidden"}`}>
          <TextInput
            label="服务器地址"
            placeholder="请输入服务器地址"
            required
            {...form.getInputProps("host")}
          />
          <TextInput
            className="mt-4"
            label="小组名称"
            description="预设小组名称，连接时可再次修改"
            placeholder="请输入小组名称"
            required
            {...form.getInputProps("community")}
          />
        </div>
        <div className={`${state.panel == "advance" || "hidden"}`}>
          <InputWrapper
            label="PMTU发现"
            description="自动发现链路MTU值，启用后有可能降低延迟或提高传输效率，但若运营商链路不支持可能会导致连接断连或丢包"
          >
            <Switch {...form.getInputProps("enablePMTU")} />
          </InputWrapper>
          <Select
            className="mt-4"
            label="服务器转发"
            description="不使用P2P连接，使用服务器转发全部数据（Windows不支持TCP转发）"
            data={[
              { label: "不使用", value: "NONE" },
              { label: "UDP转发（不推荐）", value: "S1" },
              {
                label: "TCP转发",
                value: "S2",
                disabled: commonStore.os == "Windows_NT",
              },
            ]}
            {...form.getInputProps("supernodeForward")}
          />
          <NumberInput
            className="mt-4"
            label="注册时间间隔（秒）"
            description="对于不对称的NAT，用于保持UDP NAT打孔"
            {...form.getInputProps("regInterval")}
          />
          <Select
            className="mt-4"
            label="压缩数据"
            description="压缩对外传输的数据包"
            data={[
              { label: "不使用", value: "NONE" },
              { label: "lzo1x", value: "z1" },
            ]}
            {...form.getInputProps("compress")}
          />
        </div>
        <Group position="right" mt="md">
          <Button type="submit">{t("append")}</Button>
        </Group>
      </form>
    </Modal>
  );
};
