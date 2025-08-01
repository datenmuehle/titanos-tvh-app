export interface Channel {
  uuid: string;
  name: string;
  number: number;
  icon?: string;
  icon_public_url?: string;
  services?: Service[];
}

export interface Service {
  uuid: string;
  name: string;
  type: string;
}

export interface TVHConfig {
  host: string;
  port: number;
}

export interface ChannelListResponse {
  entries: Channel[];
}