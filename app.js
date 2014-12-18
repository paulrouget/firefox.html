/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * app.js
 *
 * Firefox.html entry point.
 *
 */

// Detect Operating System

if (navigator.appVersion.indexOf('Win') >= 0) {
  window.OS = 'windows';
  document.body.setAttribute('os', 'windows');
}
if (navigator.appVersion.indexOf('Mac') >= 0) {
  window.OS = 'osx';
  document.body.setAttribute('os', 'osx');
}
if (navigator.appVersion.indexOf('X11') >= 0) {
  window.OS = 'linux';
  document.body.setAttribute('os', 'linux');
}


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

require(['react', 'js/browser'], (React, Browser) => {
  // IS_PRIVILEGED is false if Firefox.html runs in a regular browser,
  // with no Browser API.
  React.render(React.createElement(Browser, {
    isPrivileged: !!HTMLIFrameElement.prototype.setVisible
  }), document.body);
});
