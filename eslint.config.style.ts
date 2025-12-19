import type { Linter } from "eslint";
import { config as defaultConfig } from '@gingacodemonkey/config/styled';
import {additionalRules} from "./eslint.config";

const config: Array<Linter.Config> = [...defaultConfig, ...additionalRules];

export default config;
