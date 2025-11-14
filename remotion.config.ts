/**
 * Remotion configuration
 */

import { Config } from '@remotion/cli/config';

/**
 * Video codec and format settings
 */
Config.setVideoImageFormat('png');
Config.setX264Preset('slow'); // H.264 encoding preset (slow=high quality)
Config.setNumberOfGifLoops(null);

/**
 * Concurrency settings for faster rendering
 */
Config.setConcurrency(4);

/**
 * Pixel format for better quality
 */
Config.setPixelFormat('yuv420p');

export {};
