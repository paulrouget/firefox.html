define((require, exports, module) => {
  "use strict";

  const KeysPressed = function(options) {
    return KeysPressed.make(options)
  }
  KeysPressed.equal = (before, after) =>
    before === after

  KeysPressed.make = ({metaKey, ctrlKey, altKey, shiftKey, keys}) =>
    ({metaKey, ctrlKey, altKey, shiftKey, keys})

  KeysPressed.empty = () =>
    KeysPressed.make({metaKey: false, ctrlKey: false,
                      altKey: false, shiftKey: false,
                      keys: []})
  KeysPressed.patch = (before, delta) => {
    if (("metaKey" in delta && delta.metaKey != before.metaKey) ||
        ("shiftKey" in delta && delta.shiftKey != before.shiftKey) ||
        ("altKey" in delta && delta.altKey != before.altKey) ||
        ("ctrlKey" in delta && delta.ctrlKey != before.ctrlKey) ||
        ("keys" in delta && delta.keys != before.keys))
    {
      return new KeysPressed({
        metaKey: "metaKey" in delta ? delta.metaKey : before.metaKey,
        shiftKey: "shiftKey" in delta ? delta.shiftKey : before.shiftKey,
        altKey: "altKey" in delta ? delta.altKey : before.altKey,
        ctrlKey: "ctrlKey" in delta ? delta.ctrlKey : before.ctrlKey,
        keys: "keys" in delta ? delta.keys : before.keys
      })
    }

    return before
  }
  KeysPressed.readModifiers = ({metaKey, shiftKey, altKey, ctrlKey}) => {
    const modifiers = []
    if (metaKey) {
      modifiers.push("Meta")
    }
    if (ctrlKey) {
      modifiers.push("Control")
    }
    if (altKey) {
      modifiers.push("Alt")
    }
    if (shiftKey) {
      modifiers.push("Shift")
    }
    return modifiers
  }
  exports.KeysPressed = KeysPressed


  const patch = "Keyboard/patch"
  const field = "keyboard/field"
  const bindings = "keyborad/bindings"

  const isMeta = key => key == "Meta"
  exports.isMeta = isMeta

  const unsupported = new Set(["CapsLock"])
  const isSupported = key => !unsupported.has(key)
  exports.isSupported = isSupported

  const modifiers = new Set(["Shift", "Alt", "Control", "Meta"])
  const isModifier = key => modifiers.has(key)
  exports.isModifier = isModifier

  const Keyboard = {
    [field]: "keysPressed",
    [patch](delta) {
      this.setProps({[this[field]]:
                     KeysPressed.patch(this.props[this[field]], delta)})
    },
    keyboardDefaults() {
      return {[Keyboard[field]]: KeysPressed.empty()}
    },
    overlay(element) {
      element.onBlur = this.onBlur
      element.onKeyDown = this.onKeyDown
      element.onKeyUp = this.onKeyUp
    },
    onKeyDown({key, metaKey, shiftKey, altKey, ctrlKey}) {
      const {keys} = this.props[this[field]]
      if (isSupported(key)) {
        if (metaKey) {
          this[patch]({
            metaKey, shiftKey, altKey, ctrlKey,
            keys: isModifier(key) ? [] : [key]
          })
        }
        else if (isModifier(key) || keys.includes(key)) {
          this[patch]({metaKey, shiftKey, altKey, ctrlKey})
        } else {
          this[patch]({
            metaKey, shiftKey, altKey, ctrlKey,
            keys: [...keys, key]
          })
        }
      }
    },
    onKeyUp({key, metaKey, shiftKey, altKey, ctrlKey}) {
      const {keys} = this.props[this[field]]
      if (isMeta(key)) {
        this[patch]({
          metaKey, shiftKey, altKey, ctrlKey,
          keys: []
        })
      }
      else if (isModifier(key) || !keys.includes(key)) {
        this[patch]({metaKey, shiftKey, altKey, ctrlKey})
      } else {
        this[patch]({
          metaKey, shiftKey, altKey, ctrlKey,
          keys: keys.filter($ => $ != key)
        })
      }
    },
    onBlur() {
      this[patch](KeysPressed.empty())
    }
  };
  exports.Keyboard = Keyboard



  const readKey = key => readKey.table[key] || key
  readKey.table = Object.assign(Object.create(null), {
    "ctrl": "control",
    "@meta": window.OS == "osx" ? "meta" : "control"
  })
  exports.readKey = readKey

  const readChord = input =>
    input.trim().
          toLowerCase().
          split(/\s+/).
          map(readKey).
          sort().
          join(" ")
  exports.readChord = readChord

  const writeChord = keysPressed =>
    [...KeysPressed.readModifiers(keysPressed), ...keysPressed.keys].
      join(" ").
      toLowerCase().
      split(" ").
      sort().
      join(" ")



  const KeyBindings = {
    make: (fieldName, keyMap) => {
      const table = Object.create(null)
      Object.keys(keyMap).forEach(cord => {
        table[readChord(cord)] = keyMap[cord]
      })

      return Object.assign({},
                           KeyBindings,
                           {[field]: fieldName,
                            [bindings]: table})
    },
    componentWillReceiveProps(props) {
      const after = props[this[field]]
      const before = this.props[this[field]]
      if (!KeysPressed.equal(before, after)) {
        this.onKeyBinding(after)
      }
    },
    onKeyBinding(keysPressed) {
      const chord = writeChord(keysPressed)
      const handler = this[bindings][chord]
      if (handler) {
        this[handler]()
      }
    }
  }
  exports.KeyBindings = KeyBindings
})
