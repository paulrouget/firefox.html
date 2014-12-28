define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component")
  const {html} = require("js/virtual-dom")
  const {Element, Attribute, Event} = require("js/element")

  const IFrame = Element("iframe", {
    options: {
      remote: Attribute("remote"),
      browser: Attribute("mozbrowser"),
      allowFullScreen: Attribute("mozallowfullscreen"),
      flex: Attribute("flex")
    },
    attributes: {
      hidden(node, current, past) {
        if (current) {
          node.setAttribute("hidden", true)
          node.setVisible(false)
        } else if (past) {
          node.removeAttribute("hidden")
          node.setVisible(true)
        }
      },
      zoom(node, current, past) {
        if (current != past) {
          node.zoom(current)
        }
      },
      focused: function(node, value) {
        if (value) {
         node.focus()
        } else {
         node.blur()
        }
      }
    },
    events: {
      mozbrowserasyncscroll: "onAsyncScroll",
      mozbrowserclose: "onClose",
      mozbrowseropenwindow: "onOpenWindow",
      mozbrowsercontextmenu: "onContextMenu",
      mozbrowsererror: "onError",
      mozbrowserloadstart: "onLoadStart",
      mozbrowserloadend: "onLoadEnd",
      mozbrowsericonchange: "onIconChange",
      mozbrowserlocationchange: "onLocationChange",
      mozbrowsersecuritychange: "onSecurityChange",
      mozbrowsertitlechange: "onTitleChange",

      mozbrowsershowmodalprompt: "onPrompt",
      mozbrowserusernameandpasswordrequired: "onAuthentificate"
    }
  })
  exports.IFrame = IFrame

  const Frame = Component({
    displayName: "Frame",
    defaults() {
      return {
        zoom: 1,
        loading: false,
        focused: false,
        input: null,
        url: null,
        title: null,
        favicon: null,
        securityState: "unsecure",
        securityExtendedValidation: false,
        canGoBack: false,
        canGoForward: false
      }
    },

    patch(diff) {
      this.props.reset(Object.assign({}, this.props, diff))
    },

    // Events
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
    onError(event) {
      console.error(event)
      this.patch({loading: false});
    },
    onSecurityChange() {
    },
    onPrompt() {
    },
    onLoadStart(event) {
      this.patch({loading: true,
                  favicon: null,
                  title: null,
                  securityState: "unsecure",
                  securityExtendedValidation: false,
                  canGoBack: false,
                  canGoForward: false})
    },
    onLoadEnd(event) {
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

    onFocus() {
      this.patch({focused: true})
    },
    onBlur() {
      this.patch({focused: false})
    },
    onAction({target, action}) {
      if (action === "reload") {
        target.reload()
      }
      if (action === "goBack") {
        target.goBack()
      }
      if (action === "goForward") {
        target.goForward()
      }
      if (action === "stop") {
        target.stop()
      }

      this.patch({action: null})
    },

    write(target, {loading, action}, past) {
      if (loading != past.loading) {
        target.getCanGoBack().onsuccess = this.onCanGoBack
        target.getCanGoForward().onsuccess = this.onCanGoForward
      }

      if (action && action != past.action) {
        this.onAction(target, action)
      }
    },
    render({id, url, selected, zoom, focused}) {
      if (!url) return null;
      return IFrame({className: "frame box flex-1",
                     key: `frame-${id}`,
                     hidden: !selected,
                     disabled: !url,
                     remote: true,
                     browser: true,
                     allowFullScreen: true,
                     flex: 1,
                     zoom, focused,
                     src: url,

                     onBlur: this.onBlur,
                     onFocus: this.onFocus,
                     onAsyncScroll: this.onScroll,
                     onClose: this.onClose,
                     onOpenWindow: this.onOpen,
                     onContextMenu: this.onConextMenu,
                     onError: this.onError,
                     onLoadStart: this.onLoadStart,
                     onLoadEnd: this.onLoadEnd,
                     onIconChange: this.onIconChange,
                     onLocationChange: this.onLocationChange,
                     onSecurityChange: this.onSecurityChange,
                     onTitleChange: this.onTitleChange,
                     onPrompt: this.onPrompt,
                     onAuthentificate: this.onAuthentificate})
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
