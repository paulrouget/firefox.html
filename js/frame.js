define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component")
  const {html} = require("js/virtual-dom")


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
    mounted(target, options) {
      //const frame = target.ownerDocument.createElement("iframe")
      const frame = target.firstElementChild;
      //frame.className = "flex-1"
      frame.setAttribute("remote", true)
      frame.setAttribute("mozbrowser", true);
      frame.setAttribute("mozallowfullscreen", true);
      frame.setAttribute("hidden", true);

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
      //frame.addEventListener("focus", this.onFocus);
      //frame.addEventListener("blur", this.onBlur);

      frame.parentNode.replaceChild(frame, frame)
      //target.appendChild(frame);
      this.patchAttributes(frame, options);
    },
    patch(diff) {
      this.props.reset(Object.assign({}, this.props, diff))
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

    patchAttributes(node, after, before={}) {
      if (after.selected !== before.selected) {
        if (after.selected) {
          node.removeAttribute("hidden")
        } else {
          node.setAttribute("hidden", "true")
        }
      }

      if (after.url && after.url != before.url) {
        node.src = after.isPrivileged ? after.url :
        `data:,${after.url}`;
      }

      if (after.zoom !== before.zoom) {
        node.zoom(after.zoom)
      }

      if (after.loading !== before.loading) {
        node.getCanGoBack().onsuccess = this.onCanGoBack
        node.getCanGoForward().onsuccess = this.onCanGoForward
      }

      if (after.action) {
        if (after.action === "reload") {
          node.reload()
        }
        if (after.action === "goBack") {
          node.goBack()
        }
        if (after.action === "goForward") {
          node.goForward()
        }
        if (after.action === "stop") {
          node.stop()
        }

        this.patch({action: null})
      }

      if (after.focused && !before.focused) {
        node.focus()
      }
    },
    write(target, after, before) {
      this.patchAttributes(target.firstElementChild, after, before)
    },

    render({selected, id}) {
      return html.div({className: "frame box flex-1",
                       key: id,
                       hidden: !selected}, [
        html.iframe({
          key: `frame-${id}`,
          hidden: !selected,
          className: "flex-1",
          onBlur: this.onBlur,
          onFocus: this.onFocus,
        })
      ])
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
