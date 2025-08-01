import React, { useState, useMemo } from 'react';
import { Channel, TVHConfig } from '../types';

interface ChannelListProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  loading: boolean;
  error: string | null;
  tvhConfig: TVHConfig;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  onChannelSelect,
  loading,
  error,
  tvhConfig
}) => {
  const [filterText, setFilterText] = useState('');

  if (loading) {
    return <div className="loading">Loading channels...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (channels.length === 0) {
    return <div className="loading">No channels found</div>;
  }

  // Filter and sort channels
  const filteredAndSortedChannels = useMemo(() => {
    const filtered = channels.filter(channel =>
      channel.name.toLowerCase().includes(filterText.toLowerCase()) ||
      channel.number.toString().includes(filterText)
    );
    
    return filtered.sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [channels, filterText]);

  // Helper function to get the logo URL
  const getLogoUrl = (channel: Channel): string | null => {
    if (channel.icon_public_url) {
      return `http://${tvhConfig.host}:${tvhConfig.port}/${channel.icon_public_url}`;
    }
    return null;
  };

  return (
    <div className="channels-container">
      <div className="channels-filter">
        <input
          type="text"
          placeholder="Search channels by name or number..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="clear-filter"
            title="Clear filter"
          >
            ✕
          </button>
        )}
      </div>
      
      {filteredAndSortedChannels.length === 0 ? (
        <div className="loading">No channels match your search</div>
      ) : (
        <div className="channels-grid">
          {filteredAndSortedChannels.map((channel) => (
            <div
              key={channel.uuid}
              className="channel-card"
              onClick={() => onChannelSelect(channel)}
            >
              <div className="channel-logo">
                {getLogoUrl(channel) ? (
                  <img 
                    src={getLogoUrl(channel)!} 
                    alt={`${channel.name} logo`}
                    className="channel-logo-img"
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="channel-logo-placeholder">
                    {channel.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="channel-info">
                <div className="channel-name">{channel.name}</div>
                <div className="channel-number">Channel {channel.number}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};