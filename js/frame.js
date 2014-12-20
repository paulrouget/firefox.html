define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const DOM  = React.DOM

  const buildDefaults = () => ({
    zoom: 1,
    loading: false,
    input: null,
    url: "",
    favicon: null,
    securityState: "unsecure",
    securityExtendedValidation: false,
    canGoBack: false,
    canGoForward: false
  })

  const Frame = React.createClass({
    getDefaults() {
      return
    },
    getDefaultProps() {
      return buildDefaults()
    },
    componentDidMount() {
      const container = this.getDOMNode();
      var frame = document.createElement("iframe")
      frame.className = "flex-1"
      frame.setAttribute("remote", true)
      frame.setAttribute("mozbrowser", true);
      frame.setAttribute("mozallowfullscreen", "true");


      frame.addEventListener("mozbrowserasyncscroll", this.onScroll);
      frame.addEventListener("mozbrowserclose", this.onClose);
      frame.addEventListener("mozbrowseropenwindow", this.onOpen);
      frame.addEventListener("mozbrowsercontextmenu", this.onConextMenu);
      frame.addEventListener("mozbrowsererror", this.onError);
      frame.addEventListener("mozbrowsericonchange", this.onIconChange);
      frame.addEventListener("mozbrowserloadend", this.onLoadEnd);
      frame.addEventListener("mozbrowserloadstart", this.onLoadStart);
      frame.addEventListener("mozbrowserlocationchange", this.onLocationChange);

      frame.addEventListener("mozbrowsersecuritychange", this.onSecurityChange);
      frame.addEventListener("mozbrowsershowmodalprompt", this.onPrompt);
      frame.addEventListener("mozbrowsertitlechange", this.onTitleChange);
      frame.addEventListener("mozbrowserusernameandpasswordrequired", this.onAuthentificate);

      container.appendChild(frame);
    },
    patch(diff) {
      const state = Object.assign({}, this.props, diff)
      this.props.reset(state)
    },

    onScroll() {
    },
    onAuthentificate() {
    },
    onOpen({detail}) {
      if (this.props.open) {
        this.props.open({url: detail})
      }
    },
    onClose() {
      if (this.props.close) {
        this.props.close(this.props)
      }
    },
    onConextMenu() {
    },
    onError() {
      this.patch({loading: false});
    },
    onSecurityChange() {
    },
    onPrompt() {
    },
    onLoadStart() {
      const delta = Object.assign(buildDefaults(),
                                  {loading: true,
                                   url: this.props.url})
      this.patch(delta)
    },
    onLoadEnd() {
      this.patch({loading: false})
    },
    onTitleChange({detail}) {
      this.patch({title: detail})
    },
    onLocationChange({detail}) {
      this.patch({url: detail, input: null})
    },
    onIconChange({detail}) {
      this.patch({favicon: detail.href})
    },

    onCanGoBack({target: {result}}) {
      this.patch({canGoBack: result})
    },
    onCanGoForward({target: {result}}) {
      this.patch({canGoForward: result})
    },

    componentDidUpdate(past) {
      const state = this.props
      const node = this.getDOMNode().firstElementChild

      if (state.url != past.url) {
        node.src = state.isPrivileged ? state.url :
                   `data:,${state.url}`;
      }

      if (state.selected !== past.selected) {
        if (state.selected) {
          node.removeAttribute("hidden")
          node.focus()
        } else {
          node.setAttribute("hidden", "true")
        }
      }

      if (state.zoom !== past.zoom) {
        node.zoom(state.zoom)
      }

      if (state.loading !== past.loading) {
        node.getCanGoBack().onsuccess = this.onCanGoBack
        node.getCanGoForward().onsuccess = this.onCanGoForward
      }

      if (state.action) {
        if (state.action === "reload") {
          node.reload()
        }
        if (state.action === "goBack") {
          node.goBack()
        }
        if (state.action === "goForward") {
          node.goForward()
        }
        if (state.action === "stop") {
          node.stop()
        }

        this.patch({action: null})
      }
    },

    render() {
      return DOM.div({className: "frame box flex-1",
                      hidden: !this.props.selected})
    }
  })

  // Frame transformations.

  Frame.reload = frame =>
    Object.assign({}, frame, {action: "reload"})

  Frame.stop = frame =>
    Object.assign({}, frame, {action: "stop"})

  Frame.goBack = frame =>
    Object.assign({}, frame, {action: "goBack"})

  Frame.goForward = frame =>
    Object.assign({}, frame, {action: "goForward"})


  Frame.MIN_ZOOM = 0.5
  Frame.MAX_ZOOM = 2

  Frame.zoomIn = frame =>
    Object.assign({}, frame, {zoom: Math.min(Frame.MAX_ZOOM, frame.zoom + 0.1)})

  Frame.zoomOut = frame =>
    Object.assign({}, frame, {zoom: Math.max(Frame.MIN_ZOOM, frame.zoom - 0.1)})

  Frame.resetZoom = frame =>
    Object.assign({}, frame, {zoom:1})


  exports.Frame = Frame;
})
