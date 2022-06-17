import { nanoid } from "nanoid";

export interface IServer {
  id: string;
  host: string;
  community: string;
  enablePMTU: boolean;
  supernodeForward: "NONE" | "S1" | "S2";
  regInterval: number;
  compress: "NONE" | "z1";
}

export const DEFAULT_SERVER_CONFIG: Partial<IServer> = {
  host: "",
  community: "",
  enablePMTU: false,
  supernodeForward: "NONE",
  regInterval: 20,
  compress: "NONE",
};

export function newServer(): IServer {
  return {
    ...DEFAULT_SERVER_CONFIG,
    id: nanoid(),
  } as any;
}
