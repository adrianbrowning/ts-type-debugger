/**
 * Remotion Root component - entry point for video rendering
 */

import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { MyVideoComposition } from './remotion';
import { VideoData } from './videoGenerator';
import { LAYOUT } from './remotion/config';

// Import pre-generated video data
import videoDataJson from '../video-data.json';

/**
 * Main root component
 */
const RemotionRoot: React.FC = () => {
  const videoData = videoDataJson as VideoData;

  return (
    <Composition
      id="TypeEvalVideo"
      component={MyVideoComposition}
      durationInFrames={videoData.totalFrames}
      fps={videoData.fps}
      width={LAYOUT.width}
      height={LAYOUT.height}
      defaultProps={{ videoData }}
    />
  );
};

// Register root with Remotion
registerRoot(() => <RemotionRoot />);
