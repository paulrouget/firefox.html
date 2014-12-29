define((require, exports, module) => {
  "use strict";

  const {Element, Event} = require("js/element");

  // Define custom Link element that supports load event
  // listeners.
  const Link = Element("link", {
    onLoad: Event("load")
  });
  exports.Link = Link;

});
