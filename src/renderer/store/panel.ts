export default {
  state: {
    show: false,
    curPanel: "",
  },
  showPanel(name: string) {
    if (this.state.show === false) {
      this.state.show = true;
    } else if (this.state.curPanel === name) {
      this.state.show = false;
    }
  },
  OutputPanel() {
    this.showPanel("Output");
  },
  AnalysisPanel() {
    this.showPanel("Analysis");
  },
};
