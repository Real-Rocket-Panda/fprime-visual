import * as xml from "xml2js";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";
import {Promise} from "es6-promise";


export default class CompilerConverter {
    public convert(
        compiler: Promise<{
            stdout: string, stderr: string;
        }>,
        config: IConfig): Promise<any> {
            return compiler.catch((err) => {
                console.log(err);
            }).then((): Promise<string> => {
                const obj = fs.readFileSync(
                    path.resolve(__dirname, config.FPPCompilerOutputPath),
                    "utf-8",
                );

                return new Promise((resolve, reject) => {
                    xml.parseString(obj, (err: any, result: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            // console.dir(result);
                            resolve(result);
                        }
                    });
                });
            });
    }
}
