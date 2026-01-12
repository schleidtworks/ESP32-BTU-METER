/**
 * Playback Controls Component
 * Timeline scrubber for replay mode
 */

import { useHvac } from '../../context/HvacContext';

export function PlaybackControls() {
  const {
    playbackRange,
    setPlaybackRange,
    playbackPosition,
    setPlaybackPosition,
    playbackOffsetMs,
  } = useHvac();
  const minutesAgo = Math.round(playbackOffsetMs / (60 * 1000));
  const label = playbackPosition === 0
    ? 'NOW'
    : playbackRange === '7d'
      ? `${Math.max(1, Math.round(minutesAgo / (60 * 24)))} DAYS AGO`
      : `${Math.max(1, Math.round(minutesAgo / 60))} HOURS AGO`;

  return (
    <div className="playback-controls">
      <div className="playback-header">
        <div className="card-title">REPLAY TIMELINE</div>
        <div className="playback-label">{label}</div>
      </div>
      <div className="range-toggle">
        {(['24h', '7d'] as const).map(value => (
          <button
            key={value}
            type="button"
            className={`range-button ${playbackRange === value ? 'active' : ''}`}
            onClick={() => setPlaybackRange(value)}
          >
            {value.toUpperCase()}
          </button>
        ))}
        <button type="button" className="range-button" onClick={() => setPlaybackPosition(0)}>
          LIVE
        </button>
      </div>
      <input
        className="playback-slider"
        type="range"
        min={0}
        max={100}
        value={Math.round(playbackPosition * 100)}
        onChange={(event) => setPlaybackPosition(Number(event.target.value) / 100)}
      />
      <div className="playback-scale">
        <span>{playbackRange === '7d' ? '7d' : '24h'} AGO</span>
        <span>NOW</span>
      </div>
    </div>
  );
}
