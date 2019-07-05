import fprime from "fprime";

export enum PanelName {
  Output = "Output",
  Analysis = "Analysis",
  Editor = "Editor",
}

export default {
  state: {
    /**
     * The state of the panel.
     */
    show: false,
    /**
     * The name of the current panel. Should be either "Output" or "Analysis" or "TextEditor"
     */
    curPanel: PanelName.Output,
    /**
     * The output information of the compile process
     */
    outputMessage: fprime.viewManager.OutputMessage,
  },

  /**
   * Display the given name panel. If the panel is not displayed, show the
   * panel.
   * @param name The name of the panel to open.
   */
  showPanel(name: string) {
    if (this.state.show === false) {
      this.state.show = true;
    } else if (this.state.curPanel === name) {
      this.state.show = false;
    }
  },

  /**
   * Open the output panel
   */
  showOutput() {
    this.showPanel(PanelName.Output);
    document.getElementById("msg-output-tab")!.firstElementChild!
      .dispatchEvent(new Event("click"));
  },

  /**
   * Open the analysis panel
   */
  showAnalysis() {
    this.showPanel(PanelName.Analysis);
    document.getElementById("msg-analysis-tab")!.firstElementChild!
      .dispatchEvent(new Event("click"));
  },

  /**
   * Open the text editor panel
   */
  showEditor() {
    this.showPanel(PanelName.Editor);
    document.getElementById("msg-editor-tab")!.firstElementChild!
        .dispatchEvent(new Event("click"));
  },
};
