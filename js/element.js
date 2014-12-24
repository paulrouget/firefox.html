define((require, exports, module) => {
  "use strict";

  const React = require("react")

  const noPast = Object.create(null)

  const write = (target, writers, current, past) => {
    Object.keys(writers).forEach(name =>
      writers[name](target, current[name], past[name]))
  }

  const makeListeners = events => {
    const listeners = Object.create(null)
    Object.keys(events).forEach(name => {
      listeners[name] = events[name]()
    })
    return listeners
  }

  // Element can be used to define a custom HTML elements that can
  // be used from React's render. Function takes `name` of the element
  // which will translate to a `tagName`. `attributes` hash map that
  // maps recognized attribute names to functions that take (node,
  // currentValue, pastValue) and take care of updating node to reflect
  // that change (see Element.Attribute for common cases). `events` hash
  // map that is event handler names recognized mapped to constructors
  // that return function which takes (node, currentListener, pastListener)
  // and take care of adding / removing listeners (see Element.Event for
  // common cases). `options` hash map that is similar to `attributes` with
  // a difference that reflecting those attributes will force reinjection
  // of a node into a document (This is to handle some attributes who are
  // not affected by changes after node is in the tree).
  const Element = (name, settings={}) => {
    const {options, attributes, events} = settings
    // In react you can actually define custom HTML element it's
    // just set of attributes you'll be able to set will be limited
    // to React's white list. To workaround that we define React
    // custom HTML element factory & custom react component that
    // will render that HTML element via custom factory.
    const Node = React.createFactory(name)

    // React component is a wrapper around the our custom HTML Node
    // who's whole purpose is to update attributes of the node that
    // are not recognized by react.
    const Type = React.createClass({
      displayName: `html:${name}`,
      // Create listeners for this specific component as each listener
      // needs to be bound to an instance to maintain it's internal state.
      componentWillMount() {
        this.setState({listeners: events && makeListeners(events)})
      },
      // Reflect attributes not recognized by react.
      componentDidMount() {
        const node = this.getDOMNode()
        const present = this.props
        const listeners = this.state.listeners

        // If immutable attributes are defined set those and then reinject
        // node where it was to reflect proper configuration of node.
        if (options) {
          write(node, options, present, noPast)
          node.parentNode.replaceChild(node, node)
        }

        // Reflect other attributes once node is a tree.
        if (attributes) {
          write(node, attributes, present, noPast)
        }

        // Setup all the passed listeners.
        if (listeners) {
          write(node, listeners, present, noPast)
        }
      },
      // Reflect attribute changes not recognized by react.
      componentDidUpdate(past) {
        const node = this.getDOMNode()
        const present = this.props
        const listeners = this.state.listeners
        if (attributes) {
          write(node, attributes, present, past)
        }

        if (listeners) {
          write(node, listeners, present, past)
        }
      },
      // Render renders wrapped HTML node.
      render() {
        return Node(this.props, this.props.children)
      }
    })
    return React.createFactory(Type)
  }
  exports.Element = Element

  // Utility for defining attributes on custom elements.
  // Examples:
  // Element("vbox", {attributes: {flex: Attribute("flex")}})
  // Element("iframe", {attributes: {browser: Attribute("mozbrowser")}})
  const Attribute = name => (node, current, past) => {
    if (current != void(0)) {
      node.setAttribute(name, current)
    }
    else if (current != past) {
      node.removeAttribute(name)
    }
  }
  Element.Attribute = Attribute
  exports.Attribute = Attribute

  // Utility for defining attributes that are set to canstant
  // value regardless of options passed.
  // Example:
  // Element("iframe", {options: {browser: Attribute("mozbrowser", true),
  //                              remote: Attribute("remote", true)}})
  const Constant = (name, value) => (node, _1, _2) => {
    node.setAttribute(name, value)
  }
  Element.Constant = Constant
  exports.Constant = Constant

  const Listener = function(name, handler, capture) {
    this.name = name
    this.capture = capture
    this.handler = handler
  }
  Listener.prototype = {
    constructor: Listener,
    setListener(node, listener) {
      if (!this.listener && listener) {
        node.addEventListener(this.name, this, this.capture)
      }
      if (this.listener && !listener) {
        node.removeEventListener(this.name, this, this.capture)
      }
      this.listener = listener
    },
    handleEvent(event) {
      if (this.handler) {
        this.handler(event, this.listener)
      } else {
        this.listener(event)
      }
    }
  }

  const Event = (name, handler, catpure=false) => () => {
    const listener = new Listener(name, false, handler)
    return (node, after, before) => {
      listener.setListener(node, after)
    }
  }
  Element.Listener = Listener
  Element.Event = Event
  exports.Event = Event

  const CapturedEvent = (name, handler) => Event(name, handler, true)
  Element.CapturedEvent = CapturedEvent
  exports.CapturedEvent = CapturedEvent

})
