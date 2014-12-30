define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html} = require("js/virtual-dom");

  const Theme = Component({
    render({name}) {
      return html.link({rel: "stylesheet",
                        // TODO: Organize themes better that this.
                        href: `css/${name}/${name}.css`});
    }
  });

  exports.Theme = Theme;
});
