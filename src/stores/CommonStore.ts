import { IServer } from "@/components";
import { os } from "@tauri-apps/api";
import { makeAutoObservable } from "mobx";

export class CommonStore {
  constructor() {
    makeAutoObservable(this);
    os.type().then((os) => {
      console.log(os);
      this.os = os as any;
    });
  }

  os: "Linux" | "Darwin" | "Windows_NT" = "Windows_NT";
  serverAddModal: boolean = false;
  servers: IServer[] = [];
}
