import * as xml from "xml2js";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";

declare var __static: string;

export default class CompilerConverter {
  /**
   * Convert the compiler output, the representation xml file into an xml
   * object.
   * @param config The project configuration
   * @returns A promise of the xml object parsed from the representation xml
   * file.
   */
  public convert(config: IConfig): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        const xmlFile = fs.readFileSync(
          path.resolve(__static, config.FPPCompilerOutputPath),
          "utf-8",
        );
        xml.parseString(xmlFile, (err: any, result: any) => {
          if (err) {
            reject(new Error("invalid xml file,\n" + err));
          } else {
            resolve(result);
          }
        });
      } catch (e) {
        throw new Error("fail to read representation files,\n" + e);
      }
    });
  }
}
