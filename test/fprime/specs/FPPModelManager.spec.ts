import * as path from "path";
import { expect } from "chai";
import FPPModelManager from "fprime/FPPModelManagement/FPPModelManager";
import IConfig from "fprime/Common/Config";
import { fail } from "assert";

declare var __static: string;

const __project = "./test/Ref2";
const viewName1 = "Ref.REFLogger";
const viewName2 = "Ref.SG5";
const viewName3 = "Ref.SignalGen";

describe("FppModelManager Parsing", () => {
  let modelManager: FPPModelManager;
  beforeEach(() => {
    modelManager = new FPPModelManager();
  });
/*
  it(
    "should print error message when there are multiple system in the model"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model_mult_system.xml",
        } as IConfig,
      ).catch((err) => {
        expect(err.message).to.equal(
          "fail to parse model data, t" +
          "he number of system section is invalid",
        );
      });
  });
*/
  it(
    "should load the model when the path contains blank"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath:
            path.resolve(__project, "path with blank/fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "path with blank/"),
        } as IConfig,
      );
      const view = modelManager.query(viewName1, "Function View");
      expect(view.instances.length).to.be.equal(22);
      expect(view.connections.length).to.be.equal(11);
  });

  it(
    "should print error message when the component is illegal"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "illegal_model_instance1/"),
        } as IConfig,
      ).catch((err) => {
        expect(err.message).to.equal(
          "Invalid type format for [RefSignalGen]",
        );
      });
  });

  it(
    "should print error message when the component is illegal"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "illegal_model_instance2/"),
        } as IConfig,
      ).catch((err) => {
        expect(err.message).to.equal(
          "Cannot read property 'split' of undefined",
        );
      });
  });
  it(
    "should query the model without system and instance sections"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "model_without_system_section/"),
        } as IConfig,
      ).catch((err) => {
        fail(err);
      });
  });
});

describe("FppModelManager Query", () => {
  let modelManager: FPPModelManager;
  beforeEach(() => {
    modelManager = new FPPModelManager();
  });

  it(
    "should query the instances and connections in given topology"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "valid_model/"),
        } as IConfig,
      );
      const view = modelManager.query(viewName1, "Function View");
      expect(view.instances.length).to.be.equal(22);
      expect(view.connections.length).to.be.equal(11);
  });

  it(
    "should query the related instances and connections in given instance"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "valid_model/"),
        } as IConfig,
      );
      const view = modelManager.query(viewName2, "InstanceCentric View");
      expect(view.instances.length).to.be.equal(8);
      expect(view.connections.length).to.be.equal(7);
  });

  it(
    "should query the related component and ports in given instance"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "valid_model/"),
        } as IConfig,
      );
      const view = modelManager.query(viewName3, "Component View");
      expect(view.components.length).to.be.equal(1);
  });

  it(
    "should query out all the models in the given folder"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: path.resolve(__static, "./fppcompiler"),
          FPPCompilerOutputPath: path.resolve(__project,
            "multi_model_files/"),
        } as IConfig,
      );
      const view = modelManager.query(viewName3, "Component View");
      expect(view.components.length).to.be.equal(2);
      const view1 = modelManager.query(viewName2, "InstanceCentric View");
      expect(view1.instances.length).to.be.equal(8);
      expect(view1.connections.length).to.be.equal(7);
      const view2 = modelManager.query(viewName1, "Function View");
      expect(view2.instances.length).to.be.equal(22);
      expect(view2.connections.length).to.be.equal(11);
  });

});
