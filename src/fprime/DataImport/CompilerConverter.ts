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
        const files = this.findFilesInDir(
          path.resolve(__static, config.FPPCompilerOutputPath),
          ".xml",
        );

        if (files === null || files.length === 0) {
          throw new Error("Can't find any models files.");
        }

        const res: any[] = [];
        let xmlFile = fs.readFileSync(files[0], "utf-8");
        return this.parseXML(xmlFile).then((obj) => {
          res.push(obj);
          for (let i = 1; i < files.length - 1; i++) {
            xmlFile = fs.readFileSync(files[i], "utf-8");
            this.parseXML(files[i]).then((obj1) => {
              res.push(obj1);
            }).catch((err) => {
              reject(err);
            });
          }
          if (files.length === 1) {
            resolve(res);
          } else {
            xmlFile = fs.readFileSync(files[files.length - 1], "utf-8");
            this.parseXML(xmlFile).then((obj2) => {
              res.push(obj2);
              resolve(res);
            }).catch((err) => {
              reject(err);
            });
          }
        }).catch((err) => {
          reject(err);
        });

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
        const p = path.resolve(startPath, file);
        const stat = fs.lstatSync(p);
        if (stat.isDirectory()) {
            results = results.concat(
              this.findFilesInDir(p, filter));
        } else if (file.indexOf(filter) >= 0) {
            results.push(p);
        }
    });
    return results;
  }

  private parseXML(content: string): Promise<any> {
    return new Promise<any> ((resolve, reject) => {
        const parser = new xml.Parser();
        parser.parseString(content, (err: any, result: any) => {
          if (err) {
            reject(new Error("invalid xml file,\n" + err));
          } else {
            resolve(result);
          }
        });
    });
  }
}
