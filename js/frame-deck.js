define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const DOM  = React.DOM
  const { Frame } = require("js/frame")

  const FrameDeck = React.createClass({
    open(options) {
      this.props.addFrame(options)
    },
    close(frame) {
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
