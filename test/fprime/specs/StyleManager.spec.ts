import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import StyleManager from "fprime/StyleManagement/StyleManager";
import ConfigManager from "fprime/ConfigManagement/ConfigManager";
import { IStyle } from "fprime/DataImport/StyleConverter";

const __projectDefaultStyle = "./test/Ref1/mystyle.css";
const __project = "./test/Ref1";
const __projectDefaultStyleDir = "./test/Ref1/styles";
const __projectStyleDir = "./test/Ref1/mystyles";

const systemStyle: IStyle[] = [
  {
    selector: "edge",
    style: {
      "line-color": "#000000",
      "width": "2",
    },
  },
  {
    selector: ".fprime-instance",
    style: {
      "width": "150",
      "height": "200",
      "background-color": "rgb(252, 242, 199)",
    },
  },
  {
    selector: ".fprime-component",
    style: {
      "width": "100",
      "height": "140",
      "background-color": "rgb(216, 204, 186)",
    },
  },
];

const projectStyle: IStyle[] = [
  {
    selector: ".fprime-instance",
    style: {
      "width": "280",
      "height": "280",
      "text-opacity": "1",
    },
  },
  {
    selector: ".fprime-component",
    style: {
      "width": "280",
      "height": "280",
      "text-opacity": "1",
    },
  },
  {
    selector: ".fprime-port",
    style: {
      "width": "20",
      "height": "20",
      "text-opacity": "1",
      "z-index": "100",
    },
  },
];

const viewStyle: IStyle[] = [
  {
    selector: "#INS_1",
    style: {
      width: "200.0",
      height: "400.0",
    },
  },
  {
    selector: "#INS_2",
    style: {
      width: "280",
      height: "280",
    },
  },
];

describe("StyleManager", () => {
  // Remove the existing files
  if (fs.existsSync(__projectDefaultStyleDir)) {
    fs.readdirSync(__projectDefaultStyleDir).forEach((f) => {
      fs.unlinkSync(path.join(__projectDefaultStyleDir, f));
    });
    fs.rmdirSync(__projectDefaultStyleDir);
  }
  if (fs.existsSync(__projectStyleDir)) {
    fs.readdirSync(__projectStyleDir).forEach((f) => {
      fs.unlinkSync(path.join(__projectStyleDir, f));
    });
    fs.rmdirSync(__projectStyleDir);
  }

  let styleManager: StyleManager;
  before(() => {
    styleManager = new StyleManager();
  });

  describe("getDefaultStyles", () => {
    it("should return system style if the project style path is not set",
       () => {
      styleManager.loadDefaultStyles();
      expect(styleManager.DefaultStyle).to.deep.equal(systemStyle);
    });

    it("should return system style if the project style path doesn't exist",
       () => {
      styleManager.loadDefaultStyles("./invalid/path");
      expect(styleManager.DefaultStyle).to.deep.equal(systemStyle);
    });

    it("should return project style merged from system style", () => {
      styleManager.loadDefaultStyles(__projectDefaultStyle);
      expect(styleManager.DefaultStyle).to.deep.equal(
        systemStyle.concat(projectStyle));
    });
  });

  describe("save style", () => {
    it("should save in default ./styles path", () => {
      const mockConfig = {
        ProjectPath: __project,
        Config: { ViewStyleFileFolder: "" },
      } as ConfigManager;
      styleManager.saveStyleFor("test_view", viewStyle, mockConfig);
      expect(fs.existsSync(__projectDefaultStyleDir + "/test_view_style.css"))
        .to.equal(true);
    });

    it("should save in user specified ./mystyles path", () => {
      const mockConfig = {
        ProjectPath: __project,
        Config: { ViewStyleFileFolder: __projectStyleDir },
      } as ConfigManager;
      styleManager.saveStyleFor("test_view", viewStyle, mockConfig);
      expect(fs.existsSync(__projectStyleDir + "/test_view_style.css"))
        .to.equal(true);
    });
  });

  describe("load style", () => {
    it("should return [] when the file doesn't exist", () => {
      const mockConfig = {
        ProjectPath: __project,
        Config: { ViewStyleFileFolder: "" },
      } as ConfigManager;
      expect(styleManager.loadStyleFor("invalid_view", mockConfig))
        .to.deep.equal([]);
    });

    it("should return saved style", () => {
      const mockConfig = {
        ProjectPath: __project,
        Config: { ViewStyleFileFolder: __projectDefaultStyleDir },
      } as ConfigManager;
      expect(styleManager.loadStyleFor("test_view", mockConfig))
        .to.deep.equal(viewStyle);
    });
  });
});
