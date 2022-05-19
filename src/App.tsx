import React, { useEffect, useState } from "react";
import {
  createStyles,
  Navbar,
  Group,
  Code,
  AppShell,
  Button,
  Modal,
} from "@mantine/core";
import {
  BellRinging,
  Fingerprint,
  Key,
  Settings,
  TwoFA,
  DatabaseImport,
  Receipt2,
  SwitchHorizontal,
  Logout,
  Dashboard,
} from "tabler-icons-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { emit, listen } from "@tauri-apps/api/event";
import { HomePage } from "@/pages";
import { appWindow } from "@tauri-apps/api/window";
import { Observer } from "mobx-react-lite";
import { ServerAddModal } from "@/components";
import { useCommonStore } from "./stores";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
            : theme.colors[theme.primaryColor][0],
        color:
          theme.colorScheme === "dark"
            ? theme.white
            : theme.colors[theme.primaryColor][7],
        [`& .${icon}`]: {
          color:
            theme.colors[theme.primaryColor][
              theme.colorScheme === "dark" ? 5 : 7
            ],
        },
      },
    },
  };
});

const data = [
  { link: "/", label: "首页", icon: Dashboard },
  { link: "/test", label: "Billing", icon: Receipt2 },
  { link: "", label: "Security", icon: Fingerprint },
  { link: "", label: "SSH Keys", icon: Key },
  { link: "", label: "Databases", icon: DatabaseImport },
  { link: "", label: "Authentication", icon: TwoFA },
  { link: "", label: "设置", icon: Settings },
];

export function App() {
  const navigate = useNavigate();
  const { classes, cx } = useStyles();
  const [active, setActive] = useState("首页");
  const [closeModal, setCloseModal] = useState(false);
  const commonStore = useCommonStore();

  useEffect(() => {
    appWindow.listen("tauri://close-requested", () => {
      console.log("close");
      appWindow.hide();
      // setCloseModal(true);
      // appWindow.close();
    });
  }, []);

  const links = data.map((item) => (
    <a
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(item.link);
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <AppShell
      navbar={
        <Navbar width={{ sm: 300 }} p="md">
          <Navbar.Section grow>
            <Group className={classes.header} position="apart">
              <div className="select-none font-bold">Free N2N</div>
              <Observer>
                {() => (
                  <Code sx={{ fontWeight: 700 }}>v{commonStore.version}</Code>
                )}
              </Observer>
            </Group>
            {links}
            <Observer>
              {() => (
                <>
                  <div className="break-all">{JSON.stringify(commonStore)}</div>
                  <ServerAddModal
                    opened={commonStore.serverAddModal}
                    onClose={() => (commonStore.serverAddModal = false)}
                  />
                </>
              )}
            </Observer>
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>
            <a
              href="#"
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <SwitchHorizontal className={classes.linkIcon} />
              <span>Change account</span>
            </a>

            <a
              href="#"
              className={classes.link}
              onClick={(event) => {
                appWindow.close();
              }}
            >
              <Logout className={classes.linkIcon} />
              <span>退出应用</span>
            </a>
          </Navbar.Section>
        </Navbar>
      }
    >
      <Modal
        centered
        opened={closeModal}
        onClose={() => setCloseModal(false)}
        title="确认"
      >
        <div className="flex">
          <div>1</div>
          <div>1</div>
        </div>
      </Modal>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<div>test</div>} />
      </Routes>
    </AppShell>
  );
}

export default App;
