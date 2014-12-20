define((require, exports, module) => {
  "use strict";

  const modifiers = ["meta", "@meta", "ctrl", "shift", "alt"]
  exports.modifiers = modifiers

  const readModifier = key =>
    key != "@meta" ? key :
    window.OS == "osx" ? "meta" :
    "ctrl"
  exports.readModifier = readModifier

  const readKeyBinding = event => {
    const keys = modifiers.includes(event.key.toLowerCase()) ? [] : [event.key]
    const chord = []
    modifiers.forEach(key => {
       if (event[`${key}Key`]) {
         chord.push(key)
       }
    })

    return [...chord, ...keys].join(" ")
  }
  exports.readKeyBinding = readKeyBinding

  const writeKeyBinding = binding => {
    const chord = []
    const keys = new Set(binding.trim().toLowerCase().split(" "))
    modifiers.forEach(key => {
      if (keys.has(key)) {
        keys.delete(key)
        const modifier = readModifier(key)
        // Avoid duplicates.
        if (!chord.includes(modifier)) {
          chord.push(modifier)
        }
      }
    })

    return [...chord, ...[...keys].sort()].join(" ")
  }

  const KeyBindings = keyMap => {
    const bindings = Object.create(null)
    Object.keys(keyMap).forEach(binding => {
      bindings[writeKeyBinding(binding)] = keyMap[binding]
    })

    return function(binding) {
      const handler = bindings[binding]
      if (handler) {
        this[handler]()
      }
    }
  }
  exports.KeyBindings = KeyBindings
})
