/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * app.js
 *
 * Firefox.html entry point.
 *
 */

require.config({
  scriptType: 'text/javascript;version=1.8',
  paths: {
    "react": "/lib/react/react@0.12.1"
  },
  shim: {
    "react": {
      exports: "React"
    }
  }
});

//document.addEventListener("focus", (event) => document.querySelector("#outervbox").focus())
//document.addEventListener("blur", (event) => document.body.firstElementChild.blur())

window.OS = navigator.appVersion.contains('Win') ? "windows" :
            navigator.appVersion.contains("Mac") ? "osx" :
            navigator.appVersion.contains("X11") ? "linux" :
            "unknown";
require(['react', 'js/browser'], (React, Browser) => {
  // IS_PRIVILEGED is false if Firefox.html runs in a regular browser,
  // with no Browser API.
  React.render(Browser({
    isPrivileged: !!HTMLIFrameElement.prototype.setVisible,
    // Detect Operating System
    OS: window.OS
  }), document.body);
});
