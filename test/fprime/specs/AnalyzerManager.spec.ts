// import * as path from "path";
import { expect } from "chai";
import AnalyzerManager from "fprime/StyleManagement/AnalyzerManager";
import IConfig from "fprime/Common/Config";
// import { fail } from "assert";

// declare var __static: string;

// const __project = "./test/Ref";
// const viewName1 = "Ref.REFLogger";
// const viewName2 = "Ref.SG5";
// onst viewName3 = "Ref.SignalGen";

class Output {
  public out: string = "";
  public appendOutput(v: string): void {
    this.out += v;
  }
  public appendAnalysisOutput(v: string): void {
    this.out += v;
  }
}

describe("Analyzer invoking", () => {
  let analyzerManager: AnalyzerManager;
  let out: Output;
  beforeEach(() => {
    analyzerManager = new AnalyzerManager();
    out = new Output();
  });
  it(
    "should invoke the external analyzer and return given analysis info"
    , async () => {
      const analyzer: Array<{
        Name: string,
        Path: string,
        OutputFilePath: string,
        Type: string,
      }> = [];

      analyzer.push({
        Name: "acme",
        Path: "./test//Simple_analyzer_UT/mockChecker",
        OutputFilePath: "./test/Simple_analyzer_UT/acme_output/acme_result.css",
        Type: "",
      });

      const config: IConfig = {
        Analyzers: analyzer,
      } as IConfig;

      await analyzerManager.loadAnalysisInfo(
        "acme",
        config,
        out,
      );
      expect(
        out.out,
        "#Simple_c1_pout-Simple_c2_pout { width: 4; line-color: red; }",
      );

      expect(
        analyzerManager.getAnalysisResultFor("acme", config),
        "",
      );
  });
});
