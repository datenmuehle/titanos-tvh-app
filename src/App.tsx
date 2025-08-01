import { useState, useCallback, useEffect } from 'react';
import { Channel, TVHConfig } from './types';
import { TVHeadendClient } from './services/tvheadend';
import { ServerConfig } from './components/ServerConfig';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { loadTVHConfig, saveTVHConfig, clearTVHConfig } from './utils/cookies';

type AppState = 'config' | 'channels' | 'player' | 'help';

function App() {
  const [state, setState] = useState<AppState>('config');
  const [tvhClient, setTvhClient] = useState<TVHeadendClient | null>(null);
  const [tvhConfig, setTvhConfig] = useState<TVHConfig | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Load saved configuration on app startup
  useEffect(() => {
    const initializeApp = async () => {
      const savedConfig = loadTVHConfig();
      if (savedConfig) {
        setTvhConfig(savedConfig);
        // Auto-connect to saved server
        await handleConnect(savedConfig);
      }
      setInitializing(false);
    };
    
    initializeApp();
  }, []); // Empty dependency array is intentional for initialization

  const handleConnect = useCallback(async (config: TVHConfig) => {
    setConnecting(true);
    setError(null);
    
    try {
      const client = new TVHeadendClient(config);
      
      const isConnected = await client.testConnection();
      if (!isConnected) {
        throw new Error('Could not connect to TVHeadend server');
      }
      
      setTvhClient(client);
      setTvhConfig(config);
      
      // Save configuration to cookie
      saveTVHConfig(config);
      
      setLoading(true);
      const channelList = await client.getChannels();
      setChannels(channelList);
      setState('channels');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
    } finally {
      setConnecting(false);
      setLoading(false);
    }
  }, []);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setState('player');
  }, []);

  const handleBackToChannels = useCallback(() => {
    setSelectedChannel(null);
    setState('channels');
  }, []);

  const handleBackToConfig = useCallback(() => {
    setState('config');
    setTvhClient(null);
    setTvhConfig(null);
    setChannels([]);
    setSelectedChannel(null);
    setError(null);
    setMenuOpen(false);
    
    // Clear saved configuration
    clearTVHConfig();
  }, []);

  const handleShowHelp = useCallback(() => {
    setState('help');
    setMenuOpen(false);
  }, []);

  const handleBackFromHelp = useCallback(() => {
    setState(tvhClient ? 'channels' : 'config');
  }, [tvhClient]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // Show loading screen during initialization
  if (initializing) {
    return (
      <div className="app-container">
        <div className="header">
          <div className="app-title">
            <div className="title-icon">📺</div>
            <div className="title-text">
              <span className="title-main">TitanOS</span>
              <span className="title-sub">TVH Client</span>
            </div>
            <div className="title-badge">LIVE</div>
          </div>
          <p className="app-subtitle">Premium TV Streaming Experience</p>
        </div>
        <div className="loading">Initializing application...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="app-title">
          <div className="title-icon">📺</div>
          <div className="title-text">
            <span className="title-main">TitanOS</span>
            <span className="title-sub">TVH Client</span>
          </div>
          <div className="title-badge">LIVE</div>
        </div>
        <p className="app-subtitle">Premium TV Streaming Experience</p>
        
        {state !== 'config' && (
          <div className="menu-container">
            <button 
              className={`burger-menu ${menuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            {menuOpen && (
              <div className="dropdown-menu">
                <button onClick={handleBackToConfig} className="menu-item">
                  🔧 Change Server
                </button>
                <button onClick={handleShowHelp} className="menu-item">
                  ❓ Help
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {state === 'config' && (
        <ServerConfig
          onConnect={handleConnect}
          connecting={connecting}
          error={error}
          initialConfig={tvhConfig || undefined}
        />
      )}

      {state === 'channels' && tvhConfig && (
        <ChannelList
          channels={channels}
          onChannelSelect={handleChannelSelect}
          loading={loading}
          error={error}
          tvhConfig={tvhConfig}
        />
      )}

      {state === 'player' && selectedChannel && tvhClient && (
        <VideoPlayer
          channel={selectedChannel}
          streamUrl={tvhClient.getStreamUrl(selectedChannel.uuid)}
          onBack={handleBackToChannels}
        />
      )}

      {state === 'help' && (
        <div className="help-page">
          <button className="back-button" onClick={handleBackFromHelp}>
            ← Back
          </button>
          <div className="help-content">
            <h2>Help & Information</h2>
            
            <div className="help-section">
              <h3>🚀 Getting Started</h3>
              <ul>
                <li>Enter your TVHeadend server host and port</li>
                <li>Click "Connect" to establish connection</li>
                <li>Browse and select channels from the grid</li>
                <li>Enjoy live TV streaming!</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🔧 Configuration</h3>
              <ul>
                <li><strong>Host:</strong> IP address or hostname of your TVHeadend server</li>
                <li><strong>Port:</strong> TVHeadend web interface port (default: 9981)</li>
                <li>No authentication required - server must be configured for public access</li>
                <li>Ensure <strong>CORS</strong> is enabled on the TVHeadend server. Maybe use a nginx reverse proxy to handle CORS headers.</li>
                <li><strong>Auto-Save:</strong> Server configuration is automatically saved and restored on next visit</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>📺 Channel Features</h3>
              <ul>
                <li>Alphabetically sorted channel list</li>
                <li>Search channels by name or number</li>
                <li>Channel logos automatically loaded from server</li>
                <li>Click any channel to start streaming</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🎬 Video Player</h3>
              <ul>
                <li>HTML5 video player with standard controls</li>
                <li>Supports WebM streams from TVHeadend</li>
                <li>Use browser's fullscreen option for better experience</li>
                <li>Click "Back to Channels" to return to channel list</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>⚠️ Troubleshooting</h3>
              <ul>
                <li><strong>Connection Failed:</strong> Check host/port and server status</li>
                <li><strong>No Channels:</strong> Verify TVHeadend has configured channels</li>
                <li><strong>Streaming Issues:</strong> Check network connection and server load</li>
                <li><strong>No Video:</strong> Browser may not support the stream format</li>
              </ul>
            </div>

            <div className="help-footer">
              <p>Titanos TVH App - Premium TV Streaming Experience</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;