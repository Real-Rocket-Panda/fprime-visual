import { expect } from "chai";
import StyleManager from "fprime/StyleManagement/StyleManager";

describe("StyleManager", () => {
    let styleManager: StyleManager;
    before(() => {
        styleManager = new StyleManager();
    });

    describe("check the format of the style file", ( ) => {
        it("should load the defualt style file", () => {
            const file = "/static/default.css";
            const style = styleManager.getDefaultStyles(file);
            expect(style.length).to.equal(3);
        });
    });
});
