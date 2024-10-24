interface MinecraftServerStatusResponse {
  online: boolean;
  host: string;
  port: number;
  ip_address: string;
  eula_blocked: boolean;
  retrieved_at: string;
  expires_at: string;
  version: {
    name_raw: string;
    name_clean: string;
    name_html: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    list: {
      uuid: string;
      name_raw: string;
      name_clean: string;
      name_html: string;
    }[];
  };
  motd: {
    raw: string;
    clean: string;
    html: string;
  };
  icon: string;
}

export { MinecraftServerStatusResponse };
