import type { Linter } from "eslint";
import { config as defaultConfig } from '@gingacodemonkey/config/eslint';

const config: Linter.Config[] = [...defaultConfig];

export default config;
