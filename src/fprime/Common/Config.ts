export default interface IConfig {
  FPPCompilerPath: string;
  FPPCompilerParameters: string;
  FPPCompilerOutputPath: string;
  DefaultStyleFilePath: string;
  ViewStyleFileFolder: string;
  Analyzers: Array<{
    Name: string,
    Path: string,
    OutputFilePath: string,
    Type: string,
  }>;
}
