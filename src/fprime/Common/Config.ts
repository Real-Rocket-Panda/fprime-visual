export default interface IConfig {
    FPPCompilerPath: string;
    FPPCompilerParameters: string;
    FPPCompilerOutputPath: string;
    DefaultStyleFilePath: string;
    Analyzers: Array<
        {
            Name: string,
            Path: string,
            OutputFilePath: string,
            Type: string,
        }
    >;
}
