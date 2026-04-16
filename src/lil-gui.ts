import GUI, { Controller } from "lil-gui";

Controller.prototype.trigger = function () {
  this._onChange(this.getValue());
  return this;
};

Controller.prototype.stubDisplay = function (fn) {
  const originalUpdateDisplay = this.updateDisplay;
  this.updateDisplay = function () {
    originalUpdateDisplay.call(this);
    // @ts-ignore
    this.$input.value = fn.call(this, this.getValue());
    return this;
  };

  this.updateDisplay();

  return this;
};

GUI.prototype.labelWithValue = function (name, value, ...args) {
  if (typeof name !== "string") {
    throw new Error('First argument "name" must be a string');
  }

  // local state
  const state = { [name]: value, comment: `This object is an unbound property of name: ${name}` };

  return this.add(state, name, ...args).name(name);
};

export * from "lil-gui";
export { default } from "lil-gui";
