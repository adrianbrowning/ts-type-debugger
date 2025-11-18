/**
 * Remotion Root component - entry point for video rendering
 */

import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {TypeEvalVideo} from './remotion';
import {LAYOUT} from './remotion/config';

import {generateVideoData} from "./generateVideo.ts"
import type {VideoData} from "./core/types.ts";
let VideoDataJSON: VideoData;
/**
 * Main root component
 */
const RemotionRoot: React.FC = () => {
    const videoData = VideoDataJSON as VideoData;

    return (
        <Composition
            id="TypeEvalVideo"
            durationInFrames={videoData.totalFrames}
            fps={videoData.fps}
            width={LAYOUT.width}
            height={LAYOUT.height}
            component={TypeEvalVideo}
            defaultProps={videoData}
        />
    );
};
generateVideoData().then(videoData => {
// Register root with Remotion
    VideoDataJSON = videoData;
registerRoot(() => <RemotionRoot/>);
});

