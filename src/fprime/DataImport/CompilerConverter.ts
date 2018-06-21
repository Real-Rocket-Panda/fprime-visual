import * as xml from "xml2js";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";
import { Promise } from "es6-promise";

declare var __static: string;

export default class CompilerConverter {
  /**
   * Convert the compiler output, the representation xml file into an xml
   * object.
   * @param compiler 
   * @param config 
   * @returns A promise of the xml object parsed from the representation xml
   * file.
   */
  public convert(config: IConfig): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const xmlFile = fs.readFileSync(
        path.resolve(__static, config.FPPCompilerOutputPath),
        "utf-8",
      );

      xml.parseString(xmlFile, (err: any, result: any) => {
        if (err) {
          reject(new Error("invalid xml file: " + err));
        } else {
          resolve(result);
        }
      });
    }).catch((err) => {
      throw new Error("fail to read the representation file\nCause: " + err);
    });
  }
}
