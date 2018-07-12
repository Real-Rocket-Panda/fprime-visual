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
        fs.readdirSync(__static).forEach((file) => {
          console.log(file);
        });
        const files = this.findFilesInDir(
          path.resolve(__static, config.FPPCompilerOutputPath),
          ".xml",
        );

        let content: string = "";
        files.forEach((file) => {
          const xmlFile = fs.readFileSync(file, "utf-8");
          content += xmlFile;
        });
        xml.parseString(content, (err: any, result: any) => {
          if (err) {
            reject(new Error("invalid xml file,\n" + err));
          } else {
            resolve(result);
          }
        });

        /*
        const xmlFile = fs.readFileSync(
          path.resolve(__static, config.FPPCompilerOutputPath),
          "utf-8",
        );
        */
      } catch (e) {
        throw new Error("fail to read representation files,\n" + e);
      }
    });
  }

  private findFilesInDir(startPath: string, filter: string): string[] {

    let results: string[] = [];

    if (!fs.existsSync(startPath)) {
        throw new Error("The \"" + startPath + "\"path doesn't exist.");
    }

    const files = fs.readdirSync(startPath);
    files.forEach((file) => {
        const stat = fs.lstatSync(file);
        if (stat.isDirectory()) {
            results = results.concat(this.findFilesInDir(file, filter));
        } else if (file.indexOf(filter) >= 0) {
            results.push(file);
        }
    });
    return results;
  }
}
