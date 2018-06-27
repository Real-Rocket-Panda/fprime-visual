import * as fs from "fs";
import IConfig from "../Common/Config";

export default class ConfigManager {
    private config: IConfig = {
        FPPCompilerPath: "",
        FPPCompilerParameters: "",
        FPPCompilerOutputPath: "",
        DefaultStyleFilePath: "",
        Analyzers: [],
    };

    public getConfig(): IConfig {
        return this.config;
    }

    /**
     * Load the project config from a given absolute path.
     * @param dir The absolute path of the project directory
     */
    public loadConfig(dir: string) {
        if (fs.existsSync(dir)) {
            const obj = fs.readFileSync(dir, "utf-8");
            this.config = JSON.parse(obj);
        }
    }

}
