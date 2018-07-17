import * as xml from "xml2js";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";

export default class CompilerConverter {
  /**
   * Convert the compiler output, the representation xml file into an xml
   * object.
   * @param config The project configuration
   * @returns A promise of the xml object parsed from the representation xml
   * file.
   */
  public async convert(config: IConfig): Promise<any> {
    const files = this.findFilesInDir(config.FPPCompilerOutputPath, ".xml");
    if (files === null || files.length === 0) {
      throw new Error("Can't find any models files.");
    }
    const res: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const obj = await this.parseXML(fs.readFileSync(f, "utf-8"));
      res.push(obj);
    }
    return res;
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
