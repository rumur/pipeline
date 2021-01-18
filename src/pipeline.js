module.exports = class Pipeline {
  /**
   * The Passable payload being passed through pipes.
   *
   * @protected
   * @type {any}
   */
  _payload;
  
  /**
   * The collection of pipes.
   *
   * @protected
   * @type {Function[]|Object[]}
   */
  _pipes = [];
  
  /**
   * The method that is gonna be called on every pipe if it's an instance of an object.
   *
   * @protected
   * @type {string}
   */
  _method = 'handle';
  
  get pipes() {
    return this._pipes;
  }
  
  set pipes(value) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    
    this._pipes = value;
  }
  
  get method() {
    return this._method;
  }
  
  get payload() {
    return this._payload;
  }
  
  /**
   * Sets the payload that needs to be passed via some pipes.
   *
   * @param {any} payload
   * @returns {Pipeline}
   */
  send(payload) {
    this._payload = payload;
    return this;
  }
  
  /**
   * The method that is gonna be called on pipes.
   *
   * @param {string} method
   * @returns {Pipeline}
   */
  via(method) {
    this._method = method;
    
    return this;
  }
  
  /**
   * Sets the pipes and passes the payload through them.
   *
   * @param {Function[]|Function|Object[]|Object} pipes
   * @returns {Promise<any>}
   */
  async through(pipes) {
    this.pipes = pipes;
    
    const pipeline = this.pipes.reduceRight((next, pipe) => {
      return (passable) => {
        if (this._isFunction(pipe)) {
          return pipe.call(pipe, passable, next);
        }
        
        if (pipe && typeof pipe !== 'object') {
          throw Error(`[Pipeline] the ${pipe} pipe should be either function or a class or an object with callable "${this.method}" method.`);
        }
        
        if (typeof pipe[this.method] !== "function") {
          throw Error(`[Pipeline] the "${pipe.constructor.name}" is missing callable "${this.method}" method.`);
        }
        
        return pipe[this.method](passable, next);
      };
    }, (passable) => passable);
    
    return pipeline(this.payload);
  }
  
  /**
   * Checks if the passed target is a callable function.
   *
   * @param {any} target
   * @returns {boolean}
   * @private
   */
  _isFunction(target) {
    return !!(target && target.constructor && target.call && target.apply);
  }
}