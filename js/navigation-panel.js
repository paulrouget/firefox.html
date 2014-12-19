define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const urlHelper = require("js/urlhelper")
  const DOM  = React.DOM

  const makeSearchURL = input =>
    `https://search.yahoo.com/search?p=${encodeURIComponent(input)}`
  exports.makeSearchURL = makeSearchURL

  const readInputURL = input =>
    urlHelper.isNotURL(input) ? makeSearchURL(input) :
    !urlHelper.hasScheme(input) ? `http://${input}` :
    input

  exports.readInputURL = readInputURL

  const NavigationPanel = React.createClass({
    componentWillMount() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "css/navbar.css";
      link.id = "navigator-panel-style";

      const defaultStyleSheet = document.querySelector('link[title=default]');
      document.head.insertBefore(link, defaultStyleSheet.nextSibling);

      link.addEventListener("load", this.onStyleReady)
    },
    patch({input, frame}) {
      if (input) {
        this.props.resetInput(Object.assign({},
                                            this.props.input,
                                            input))
      }

      if (frame) {
        this.props.resetFrame(Object.assign({},
                                            this.props.frame,
                                            frame))
      }
    },

    navigateBack() {
      this.patch({frame: {action: "goBack"}})
    },
    navigateForward() {
      this.patch({frame: {action: "goForward"}})
    },
    reload() {
      this.patch({frame: {action: "reload"}})
    },
    stop() {
      this.patch({frame: {action: "stop"}})
    },

    updateInput(input) {
      this.patch({frame: {input}})
    },
    updateURL(url) {
      this.patch({frame: {url}})
    },
    navigateTo(input) {
      this.patch({frame: {input: null,
                          url: readInputURL(input)}})
    },

    onInputChange(event) {
      this.patch({frame: {input: event.target.value}})
    },

    onInputKey(event) {
      if (event.keyCode === 13) {
        this.navigateTo(this.props.frame.input)
      }
    },
    onInputFocus() {
      this.patch({input: {focused: true}});
    },
    onInputBlur() {
      this.patch({input: {focused: false}});
    },

    onSearchKey(event) {
      if (event.keyCode === 13) {
        this.navigateTo(this.props.search.query)
      }
    },
    onSearchChange(event) {
      this.patch({search: {query: event.target.value}})
    },
    onInputFocus() {
      this.patch({search: {focused: true}});
    },
    onInputBlur() {
      this.patch({search: {focused: false}});
    },

    render() {
      const { frame, input, search } = this.props

      const classList = [
        "navbar", "toolbar", "hbox", "align", "center",
        frame && frame.loading ? "loading" : "loaded",
        frame && frame.securityState == "secure" ? "ssl" : "",
        frame && frame.securityExtendedValidation ? "sslev" : ""
      ]

      return DOM.div({
        className: classList.join(" ")
      }, [
        DOM.button({
          className: ["back-button",
                      frame && frame.canGoBack ? "" : "disabled"].join(" "),
          key: "back-button",
          onClick: this.navigateBack
        }),
        DOM.button({
          className: ["forward-button",
                      frame && frame.canGoForward ? "" : "disabled"].join(" "),
          key: "forward-button",
          onClick: this.navigateForward
        }),
        DOM.button({
          className: "reload-button",
          key: "reload-button",
          onClick: this.reload
        }),
        DOM.button({
          className: "stop-button",
          key: "stop-button",
          onClick: this.stop
        }),
        DOM.div({
          className: "urlbar hbox flex-1 align center" +
                     (input.focused ? " focus" : ""),
          key: "url-bar"
        }, [
          DOM.div({className: "identity"}),
          DOM.input({className: "urlinput flex-1",
                     value: frame && (frame.input || frame.url),
                     placeholder: "Search or enter address",

                     onChange: this.onInputChange,
                     onKeyDown: this.onInputKey,
                     onFocus: this.onInputFocus,
                     onBlur: this.onInputBlur})
        ]),
        DOM.div({
          className: "searchbar hbox flex-1 align center" +
                     (search.focused ? " focus" : ""),
          key: "search-bar"
        }, [
          DOM.div({className: "searchselector"}),
          DOM.input({className: "searchinput",
                     value: search.query,
                     placeholder: "Yahoo",

                     onChange: this.onSearchChange,
                     onKeyDown: this.onSearchKey,
                     onFocus: this.onSearchFocus,
                     onBlur: this.onSearchBlur})
        ]),
        DOM.button({className: "menu-button"})
      ])
    }
  })
  exports.NavigationPanel = NavigationPanel
})
