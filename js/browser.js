define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const {DOM} = React
  const {FrameDeck} = require("js/frame-deck")
  const {TabNavigator} = require("js/tab-navigator")
  const {NavigationPanel} = require("js/navigation-panel")
  const {readKeyBinding} = require("js/key-bindings")


  const SelectFrame = frame =>
    Object.assign({}, frame, {selected: true})

  const DeselectFrame = frame =>
    Object.assign({}, frame, {selected: false})

  const selectFrame = (frames, id) =>
    frames.map(frame =>
               frame.selected && frame.id != id ? DeselectFrame(frame) :
               !frame.selected && frame.id == id ? SelectFrame(frame) :
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
        search: {focused: false, query: ""},
        keyBinding: {},
      }
    },
    selectFrame({id}) {
      const {frames} = this.state
      this.setState({frames: selectFrame(frames, id)})
    },
    addFrame(options) {
      const {state} = this
      const frameID = state.frameID + 1
      const frames = [...state.frames]
      const selected = frames.find(({selected}) => selected)
      const frame = makeFrame(frameID, options)
      frames.splice(frames.indexOf(selected), 1,
                    frame.selected ? DeselectFrame(selected) : selected,
                    frame)

      this.setState({frameID, frames})
    },
    removeFrame({id}) {
      const {state} = this
      const frames = [...state.frames]
      const index = frames.findIndex(frame => frame.id == id)
      frames.splice(index, 1)
      const selected = frames[index] || frames[frames.length - 1]
      this.setState({frames: selectFrame(frames, selected.id)})
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

    onKey(event) {
      this.setState({keyBinding: {
        timeStamp: event.timeStamp,
        binding: readKeyBinding(event)
      }});
    },
    render() {
       const {frames, input, search, keyBinding} = this.state
       console.log(this.state)
       const {isPrivileged} = this.props
       const frame = frames.find(frame => frame.selected);

        return DOM.div({className: "vbox flex-1",
                        id: "outervbox",
                        onKeyDown: this.onKey}, [
          React.createElement(TabNavigator, {
            frames,
            addTab: this.addFrame,
            closeTab: this.removeFrame,
            selectTab: this.selectFrame
          }),

          React.createElement(NavigationPanel, {
            frame, input, search, keyBinding,
            resetFrame: this.resetFrame,
            resetInput: this.resetInput,
            resetSearch: this.resetSearch
          }),

          DOM.div({className: "hbox flex-1",
                   id: "outerhbox"}, [

            React.createElement(FrameDeck, {
              selected: frame,
              frames, keyBinding,
              isPrivileged,
              addFrame: this.addFrame,
              removeFrame: this.removeFrame,
              resetFrame: this.resetFrame,
              selectFrame: this.selectFrame
            })
          ]),
          DOM.div({hidden: "true",
                   className: "dummy-tab-curve"})
        ])
    }
  })

  module.exports = Browser
})
