import { IServer } from "@/components";
import { os, app } from "@tauri-apps/api";
import { makeAutoObservable } from "mobx";

export type EdgeState = "STOP" | "STARTING" | "RUNNING";

export class CommonStore {
  constructor() {
    makeAutoObservable(this);
    os.type().then((os) => {
      this.os = os as any;
    });

    app.getVersion().then((version) => {
      this.version = version;
    });
  }

  version: string = "";
  os: "Linux" | "Darwin" | "Windows_NT" = "Windows_NT";
  serverAddModal: boolean = false;
  servers: IServer[] = [];
  state: EdgeState = "STOP";
}
