
class Scope {
  constructor(parent, data) {
    this.parent = parent;
    this.data = data || {};
  }

  set(name, value) {
    this.data[name] = value;
  }

  get(name) {
    return (this.data[name] || !this.parent) ?
      this.data[name] :
      this.parent.get(name);
  }

  makeChild() {
    return new Scope(this);
  }
}

module.exports = Scope;
