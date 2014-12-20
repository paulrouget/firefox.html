define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const DOM  = React.DOM
  const {Frame} = require("js/frame")
  const {KeyBindings} = require("js/key-bindings")

  const FrameDeck = React.createClass({
    onKeyBinding: KeyBindings({
      "alt left": "goBack",
      "alt right": "goForward",
      "esc": "stop",
      "@meta r": "reload",

      "@meta t": "open",
      "@meta w": "close",
      "ctrl tab": "selectNext",
      "ctrl shift tab": "selectPrevious",

      "@meta shift +": "zoomIn",
      "@meta =": "zoomIn",
      "@meta -": "zoomOut",
      "@meta 0": "resetZoom"
    }),
    componentWillReceiveProps({keyBinding}) {
      const current = this.props
      if (keyBinding.timeStamp != current.keyBinding.timeStamp) {
        this.onKeyBinding(keyBinding.binding)
      }
    },


    zoomIn() {
      this.props.resetFrame(Frame.zoomIn(this.props.selected))
    },
    zoomOut() {
      this.props.resetFrame(Frame.zoomOut(this.props.selected))
    },
    resetZoom() {
      this.props.resetFrame(Frame.resetZoom(this.props.selected))
    },

    selectNext() {
      const { selectFrame, frames, selected } = this.props
      const index = frames.indexOf(selected)
      const frame = frames[index + 1] || frames[0]
      selectFrame(frame)
    },
    selectPrevious() {
      const { selectFrame, frames, selected } = this.props
      const index = frames.indexOf(selected)
      const frame = frames[index - 1] || frames[frames.length - 1]
      selectFrame(frame)
    },
    reload() {
      this.props.resetFrame(Frame.reload(this.props.selected))
    },
    stop() {
      this.props.resetFrame(Frame.stop(this.props.selected))
    },
    goBack() {
      this.props.resetFrame(Frame.goBack(this.props.selected))
    },
    goForward() {
      this.props.resetFrame(Frame.goForward(this.props.selected))
    },

    open(options={selected: true}) {
      this.props.addFrame(options)
    },
    close(frame=this.props.selected) {
      this.props.removeFrame(frame)
    },
    reset(frame) {
      this.props.resetFrame(frame)
    },

    renderFrame(frame) {
      const {open, close, reset} = this
      const {isPrivileged} = this.props
      const options = Object.assign({}, frame, {
        open, close, reset, isPrivileged
      })
      return React.createElement(Frame, options)
    },
    render() {
      return DOM.div({className: "frame-deck iframes box flex-1 align stretch"},
                     this.props.frames.map(this.renderFrame))
    }
  })

  exports.FrameDeck = FrameDeck
})
