/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { Configuration } from "webpack";
import { makeBaseConfig } from "./makeBaseConfig";
import EntryModel from "../utility/EntryModel";

/**
 * Create a config for building the polyfills file. This should be built entirely on its own.
 */
export async function makeTestConfig(entryModel: EntryModel) {
    const baseConfig: Configuration = await makeBaseConfig(entryModel, "unit-tests");
    baseConfig.mode = "development";
    baseConfig.devtool = "inline-source-map";
    baseConfig.optimization = {
        splitChunks: false,
        minimize: false,
    };

    return baseConfig;
}
