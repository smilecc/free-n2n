export interface IServer {
  host: string;
  community: string;
  enablePMTU: boolean;
  supernodeForward: "NONE" | "S1" | "S2";
  regInterval: number;
  compress: "NONE" | "z1";
}

export const DEFAULT_SERVER_CONFIG: IServer = {
  host: "",
  community: "",
  enablePMTU: false,
  supernodeForward: "NONE",
  regInterval: 20,
  compress: "NONE",
};
