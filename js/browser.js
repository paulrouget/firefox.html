define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const {DOM} = React
  const {FrameDeck} = require("js/frame-deck")
  const {TabNavigator} = require("js/tab-navigator")
  const {NavigationPanel} = require("js/navigation-panel")

  const SelectFrame = frame =>
    Object.assign({}, frame, {selected: true})

  const DeselectFrame = frame =>
    Object.assign({}, frame, {selected: false})

  const selectFrame = (frames, id) =>
    frames.map(frame =>
               frame.selected && frame.id != id ? SelectFrame(frame) :
               !frame.selected && frame.id == id ? DeselectFrame(frame) :
               frame)

  const makeFrame = (id, state) =>
    Object.assign({}, state, {id})

  const Browser = React.createClass({
    getInitialState() {
      return {
        isPrivileged: true,
        frameID: 0,
        frames: [{id: 0, selected: true}],
        input: {focused: false},
        search: {focused: false, query: ""}
      }
    },
    selectFrame({id}) {
      const {frames} = this.state
      this.setState({frames: selectFrame(frames, id)})
    },
    addFrame(state) {
      const {frameId, frames} = this.state
      this.setState({frameID: frameID + 1,
                     frames: [...frames,
                              makeFrame(frameId, state)]})
    },
    removeFrame({id}) {
      const {frames} = this.state
      this.setState({frames: frames.filter(frame => frame.id !== id)})
    },
    resetFrame(state) {
      const {frames} = this.state
      const swapFrame = frame =>
        frame.id === state.id ? state : frame

      this.setState({frames: frames.map(swapFrame)})
    },

    resetInput(state) {
      this.setState({input: state})
    },
    resetSearch(state) {
      this.setState({search: state})
    },
    render() {
       const {frames, input, search} = this.state
       console.log(this.state)
       const {isPrivileged} = this.props
       const frame = frames.find(frame => frame.selected);

        return DOM.div({className: "vbox flex-1",
                              id: "outervbox"}, [
          React.createElement(TabNavigator, {
            frames,
            addTab: this.addFrame,
            closeTab: this.removeFrame,
            selectTab: this.selectFrame
          }),

          React.createElement(NavigationPanel, {
            frame, input, search,
            resetFrame: this.resetFrame,
            resetInput: this.resetInput,
            resetSearch: this.resetSearch
          }),

          DOM.div({className: "hbox flex-1",
                   id: "outerhbox"}, [

            React.createElement(FrameDeck, {
              frames,
              isPrivileged,
              addFrame: this.addFrame,
              removeFrame: this.removeFrame,
              resetFrame: this.resetFrame
            })
          ]),
          DOM.div({hidden: "true",
                   className: "dummy-tab-curve"})
        ])
    }
  })

  module.exports = Browser
})
