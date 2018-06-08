export enum PanelName {
  Output = "Output",
  Analysis = "Analysis",
}

export default {
  state: {
    /**
     * The state of the panel.
     */
    show: false,
    /**
     * The name of the current panel. Should be either "Output" or "Analysis"
     */
    curPanel: "",
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
   * Show the Output panel.
   */
  OutputPanel() {
    this.showPanel(PanelName.Output);
  },

  /**
   * Show the Analysis panel.
   */
  AnalysisPanel() {
    this.showPanel(PanelName.Analysis);
  },
};
