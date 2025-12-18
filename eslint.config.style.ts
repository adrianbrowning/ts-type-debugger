import type { Linter } from "eslint";
import { config as defaultConfig } from '@gingacodemonkey/config/styled';

const config: Linter.Config[] = [...defaultConfig];

export default config;
