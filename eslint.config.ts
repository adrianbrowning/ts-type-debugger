import type {Linter} from "eslint";
import {config as defaultConfig} from '@gingacodemonkey/config/eslint';

export const additionalRules: Array<Linter.Config> = [
    {
        rules: {
            "sonarjs/no-nested-template-literals": "off",
            "sonarjs/slow-regex": "off"
        }
    }
];

const config: Array<Linter.Config> = [...defaultConfig, ...additionalRules];

export default config;
