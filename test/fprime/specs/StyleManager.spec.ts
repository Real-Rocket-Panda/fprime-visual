import { expect } from "chai";
import StyleManager from "fprime/StyleManagement/StyleManager";

describe("StyleManager", () => {
    let styleManager: StyleManager;
    before(() => {
        styleManager = new StyleManager();
    });

    describe("check the format of the style file", ( ) => {
        it("should load the defualt style file", () => {
            const style = styleManager.getDefaultStyles();
            expect(style.length).to.equal(5);
        });
    });
});
