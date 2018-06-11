import * as fs from "fs";
import * as path from "path";

export default class ConfigManager {
    private config: IConfig;
    constructor() {
        const obj = fs.readFileSync(
            path.resolve(__dirname, "../../../static/config.json"),
            "utf-8",
        );
        this.config = JSON.parse(obj);
    }

    public getConfig(): IConfig {
        return this.config;
    }

}
