import { expect } from "chai";
import FPPModelManager from "fprime/FPPModelManagement/FPPModelManager";
import IConfig from "fprime/Common/Config";

const viewName1 = "REFLogger";
const viewName2 = "SG5";
const viewName3 = "SignalGen";

describe("FppModelManager Parsing", () => {
  let modelManager: FPPModelManager;
  beforeEach(() => {
    modelManager = new FPPModelManager();
  });

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

  it(
    "should print error message when the component is illegal"
    , async () => {
      await modelManager.loadModel(
        {
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model_illegal_instance1.xml",
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
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model_illegal_instance2.xml",
        } as IConfig,
      ).catch((err) => {
        expect(err.message).to.equal(
          "Cannot read property 'split' of undefined",
        );
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
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model.xml",
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
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model.xml",
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
          FPPCompilerPath: "./fppcompiler",
          FPPCompilerOutputPath: "./model.xml",
        } as IConfig,
      );
      const view = modelManager.query(viewName3, "Component View");
      expect(view.components.length).to.be.equal(1);
  });
});
