// class ConfigManager {
//     private config: Config;
//     public loadConfig() {
//         return;
//     }
// }

// class Config {
//     compilerPath: string;
//     compilerParameter: string[];
//     analyzerPaths: IHash; // name:string -> path: string
//     analyzerParameters: string[][];
//     layoutAlgorithms: string[];
//     defaultStylePath: string;
// }

// interface AnalyzerConverter {
//     config: Config;
//     (source: string): Element[];
// }

// class CompilerConverter {
//     public convert(model: string): IHash[]; //name->AbrastractFPPModel
// }

// class ViewManager {
//     private viewDescriptors: ViewDescriptor[];
//     private analyzerStyles: LayoutDescriptor[];
//     private layoutGen:LayoutGenerator;
//     private styleManager: StyleManger;
//     private modelManager: FPPModelManager;
//     private config: Config;

//     public viewList: IHash;

//     public build() {
//         //modelManager.loadModel(config);
//     }

//     public render(viewName: string): string {
//         //return viewDescriptors.toString() + styleManager.toString();
//     }
//     public onChange(eventName: string, eventKey: string, eventValue: string) {
//         return;
//     }
//     public getViewList() { // type: string - > element name/id: string[]
//         //viewList = modelManager.queryViewList();
//     }
//     public saveLayout(layout: object) {
        
//     }
// }

// class ViewDescriptor {
//     public layoutDescriptor: LayoutDescriptor[];
//     public graph: Graph;
// }

// class Graph {
//     public nodes: nodeMetaData[];
//     public edges: edgeMetaData[];
// }

// // class Element {
// //     public layoutDescriptor: LayoutDescriptor;
// // }

// class LayoutDescriptor {
//     public nodes: Element[];
//     public edges: Edge[];
// }

// class nodeMetaData {
//     public data: IHash;
// }
// class edgeMetaData {
//     public data: [string/*source*/, string/*target*/][];
// }

// //Node
// class Element {
//     public id: number;
//     public modelID: number;
//     public x: number;
//     public y: number;
//     public style: IHash;
// }

// class Edge {
//     public id: number;
//     public modelID: number;
//     public points: number[];
//     public style: IHash;
// }

// class LayoutGenerator {
//     algorithms: IHash // name: string -> LayoutAlgorithmAdaptor
    
//     public generator(params: any): string{
//         return "";
//     }


// }

// class StyleManager {
//     private dataImporter: DataImporter;

//     public readStyle(confg: Config, viewName: string): ViewDescriptor {

//     }

//     public saveStyle(viewDescriptor: ViewDescriptor) {

//     }

//     public readAnalaysisInfo(config: Config) : LayoutDescriptor {

//     }
// }



// class FPPModelManager {
//     private config: Config;
//     private dataImporter: DataImporter;
//     private models: IHash;//name:string -> AbstractFPPModel[]

//     public loadModel(config: Config) {
//         //models = dataImporter.invokeCompiler(config);
//     }
//     public query(modelNames: string[]) : AbstractFPPModel[] {
//         //return models[modelNames];
//     }

//     public queryView(viewType: string, viewName: string): IHash {

//     }

//     public queryViewList(): IHash {

//     }
// }

// class DataImporter {
//     private analyzerConverter: AnalyzerConverter;
//     private compilerConverter: CompilerConverter;

//     // @param config
//     public readCompiler(config: Config): IHash {
//         return "";
//     }
//     public readAnalyzer(config: Config): string {
//         return "";
//     }

//     public readStyle(config: Config, viewName: string): string {
//         return "";
//     } 

//     public saveStyle(config: Config, elements: Element[]) {
//     } 
// }