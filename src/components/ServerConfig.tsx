import React, { useState } from 'react';
import { TVHConfig } from '../types';

interface ServerConfigProps {
  onConnect: (config: TVHConfig) => void;
  connecting: boolean;
  error: string | null;
  initialConfig?: TVHConfig;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({
  onConnect,
  connecting,
  error,
  initialConfig
}) => {
  const [config, setConfig] = useState<TVHConfig>({
    host: initialConfig?.host || 'localhost',
    port: initialConfig?.port || 9981
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  const handleChange = (field: keyof TVHConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'port' ? parseInt(e.target.value) || 9981 : e.target.value;
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="config-form" onSubmit={handleSubmit}>
      <h2>Connect to TVHeadend Server</h2>
      
      {initialConfig && (
        <div className="saved-config-notice">
          <span>📋 Using saved configuration</span>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="host">Server Host:</label>
        <input
          id="host"
          type="text"
          value={config.host}
          onChange={handleChange('host')}
          placeholder="localhost or IP address"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="port">Port:</label>
        <input
          id="port"
          type="number"
          value={config.port}
          onChange={handleChange('port')}
          placeholder="9981"
          min="1"
          max="65535"
          required
        />
      </div>
      
      <button
        type="submit"
        className="connect-button"
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    </form>
  );
};