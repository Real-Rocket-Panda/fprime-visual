interface IConfig {
    FPPCompilerPath: string;
    FPPCompilerOutputPath: string;
    DefaultStyleFilePath: string;
    Analyzers: Array<
        {
            Name: string,
            Path: string,
            OutputFilePath: string,
            Yype: string,
        }
    >;
}
