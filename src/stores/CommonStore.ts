import { IServer } from "@/components";
import { os, app, invoke, fs } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";
import { makeAutoObservable } from "mobx";

export type EdgeState = "INIT" | "STOP" | "STOPPING" | "STARTING" | "RUNNING";

export class CommonStore {
  constructor() {
    makeAutoObservable(this);

    this.loadServer();
    os.type().then((os) => {
      this.os = os as any;
    });

    app.getVersion().then((version) => {
      this.version = version;
    });

    setInterval(() => {
      invoke<string>("get_edge_info")
        .then((serverJson) => {
          if (serverJson) {
            const server = JSON.parse(serverJson);
            console.log(server);
            this.currentIp = server?.ip_addr || "";

            if (this.state == "INIT") {
              this.state = server?.ip_addr ? "RUNNING" : "STOP";
            } else if (server?.ip_addr && this.state == "STARTING") {
              this.state = "RUNNING";
            } else if (!server?.ip_addr && this.state == "STOPPING") {
              this.state = "STOP";
            }
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
  currentIp: string = "";

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
