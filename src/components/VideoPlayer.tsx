import React, { useEffect, useRef } from 'react';
import { Channel } from '../types';

interface VideoPlayerProps {
  channel: Channel;
  streamUrl: string;
  onBack: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  streamUrl,
  onBack
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        xhrSetup: function (xhr, _url) {
          if (username && password) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(`${username}:${password}`));
            console.log('Setting Authorization header for stream request');
          }
        } 
      });
      
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS Error:', data);
        
        // Log specific HTTP errors for debugging
        if (data.details === 'manifestLoadError' && data.response?.code === 401) {
          console.error('Authentication error (401): Check TVHeadend username/password');
        }
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              if (data.response?.code === 401) {
                console.error('Authentication failed - stream requires valid credentials');
              }
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, destroying HLS instance');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) { */
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error);
       });
    /*} else {
      console.error('HLS is not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    }; */
  }, [streamUrl]);

  return (
    <div className="video-player-fullsize">
      <div className="video-controls-overlay">
        <button className="back-button-overlay" onClick={onBack}>
          ← Back to Channels
        </button>
        <div className="channel-info-overlay">
          <h3>{channel.name}</h3>
        </div>
      </div>
      <video
        ref={videoRef}
        controls
        className="video-fullsize"
        muted
        playsInline
      />
    </div>
  );
};