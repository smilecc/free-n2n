import { IServer } from "@/components";
import { os, app, invoke, fs, path } from "@tauri-apps/api";
import { BaseDirectory, readTextFile } from "@tauri-apps/api/fs";
import { resourceDir } from "@tauri-apps/api/path";
import { makeAutoObservable, runInAction } from "mobx";

export type EdgeState = "INIT" | "STOP" | "STOPPING" | "STARTING" | "RUNNING";

export class CommonStore {
  constructor() {
    makeAutoObservable(this);

    this.loadServer();
    os.type().then((os) => {
      runInAction(() => {
        this.os = os as any;
      });
    });

    app.getVersion().then((version) => {
      runInAction(() => {
        this.version = version;
      });
    });

    setInterval(() => {
      (async () => {
        const logContent = await fs.readTextFile(
          await path.resolve(await resourceDir(), "logs", "n2n.log")
        );

        runInAction(() => {
          this.logContent = logContent;
        });
      })();

      invoke<string>("get_edge_info")
        .then((serverJson) => {
          if (serverJson) {
            const server = JSON.parse(serverJson);
            // console.log(server);
            runInAction(() => {
              this.currentIp = server?.ip_addr || "";
              this.currentMac = server?.device_mac || "";
              this.currentDevice = server?.device_name || "";
              this.currentMTU = server?.mtu || "";
              this.currentMetric = server?.metric || "";

              if (this.state == "INIT") {
                this.state = server?.ip_addr ? "RUNNING" : "STOP";
              } else if (server?.ip_addr && this.state == "STARTING") {
                this.state = "RUNNING";
              } else if (!server?.ip_addr && this.state == "STOPPING") {
                this.state = "STOP";
              }
            });
          }
        })
        .catch((reason) => {
          console.log("err", reason);
        });
    }, 1000);
  }

  version: string = "";
  os: "Linux" | "Darwin" | "Windows_NT" = "Windows_NT";
  serverAddModal: boolean = false;
  servers: IServer[] = [];
  state: EdgeState = "INIT";
  currentServer: IServer | undefined = undefined;
  currentServerForm: any = {};
  currentIp: string = "";
  currentMac: string = "";
  currentDevice: string = "";
  currentMTU: string = "";
  currentMetric: string = "";
  logContent: string = "";

  saveServer() {
    fs.writeFile(
      {
        path: "server.json",
        contents: JSON.stringify(this.servers),
      },
      {
        dir: BaseDirectory.App,
      }
    );
  }

  loadServer() {
    fs.readTextFile("server.json", {
      dir: BaseDirectory.App,
    }).then((value) => {
      this.servers = JSON.parse(value);
    });
  }
}
