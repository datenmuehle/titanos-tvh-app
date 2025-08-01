import axios, { AxiosInstance } from 'axios';
import { Channel, TVHConfig, ChannelListResponse } from '../types';

export class TVHeadendClient {
  private api: AxiosInstance;
  private config: TVHConfig;

  constructor(config: TVHConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: `https://${config.host}:${config.port}`,
      timeout: 10000
    });
  }

  async getChannels(): Promise<Channel[]> {
    try {
      const response = await this.api.get<ChannelListResponse>('/api/channel/grid', {
        params: {
          limit: 999999,
          sort: 'number',
          dir: 'ASC'
        }
      });
      
      return response.data.entries || [];
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      throw new Error('Failed to connect to TVHeadend server');
    }
  }

  getStreamUrl(channelUuid: string): string {
    const baseUrl = `https://${this.config.host}:${this.config.port}`;
    return `${baseUrl}/stream/channel/${channelUuid}?profile=webtv-vp8-vorbis-webm`;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/api/status/connections');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
