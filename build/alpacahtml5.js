
(function() {
var __main_module_name__ = "main";
var __resources__ = {};
function __imageResource(data) { var img = new Image(); img.src = data; return img; };
var FLIP_Y_AXIS = false;
var ENABLE_WEB_GL = false;
var SHOW_REDRAW_REGIONS = false;

__resources__["/__builtin__/event.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*global module exports require*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true*/


/**
 * @namespace
 * Support for listening for and triggering events
 */
var event = {};

/**
 * @private
 * @ignore
 * Returns the event listener property of an object, creating it if it doesn't
 * already exist.
 *
 * @returns {Object}
 */
function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

/**
 * @private
 * @ignore
 * Keep track of the next ID for each new EventListener
 */
var eventID = 0;

/**
 * @class
 * Represents an event being listened to. You should not create instances of
 * this directly, it is instead returned by event.addListener
 *
 * @extends Object
 * 
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 */
event.EventListener = function (source, eventName, handler) {
    /**
     * Object to listen to for an event
     * @type Object 
     */
    this.source = source;
    
    /**
     * Name of the event to listen for
     * @type String
     */
    this.eventName = eventName;

    /**
     * Callback to fire when the event triggers
     * @type Function
     */
    this.handler = handler;

    /**
     * Unique ID number for this instance
     * @type Integer 
     */
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event listener
 *
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 *
 * @returns {event.EventListener} The event listener. Pass to removeListener to destroy it.
 */
event.addListener = function (source, eventName, handler) {
    return new event.EventListener(source, eventName, handler);
};

/**
 * Trigger an event. All listeners will be notified.
 *
 * @param {Object} source Object to trigger the event on
 * @param {String} eventName Name of the event to trigger
 */
event.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event listener
 *
 * @param {event.EventListener} listener EventListener to remove, as returned by event.addListener
 */
event.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event listeners for a given event
 *
 * @param {Object} source Object to remove listeners from
 * @param {String} eventName Name of event to remove listeners from
 */
event.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                event.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event listeners on an object
 *
 * @param {Object} source Object to remove listeners from
 */
event.clearInstanceListeners = function (source, eventName) {
    var listeners = getListeners(source),
        eventID;

    for (eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        event.removeListener(l);
                    }
                }
            }
        }
    }
};

module.exports = event;

}};
__resources__["/__builtin__/global.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event');


/**
 * @ignore
 */
function getAccessors(obj) {
    if (!obj.js_accessors_) {
        obj.js_accessors_ = {};
    }
    return obj.js_accessors_;
}

/**
 * @ignore
 */
function getBindings(obj) {
    if (!obj.js_bindings_) {
        obj.js_bindings_ = {};
    }
    return obj.js_bindings_;
}

/**
 * @ignore
 */
function addAccessor(obj, key, target, targetKey, noNotify) {
    getAccessors(obj)[key] = {
        key: targetKey,
        target: target
    };

    if (!noNotify) {
        obj.triggerChanged(key);
    }
}


/**
 * @ignore
 */
var objectID = 0;

/**
 * @class
 * A bindable object. Allows observing and binding to its properties.
 */
var BObject = function () {};
BObject.prototype = util.extend(BObject.prototype, /** @lends BObject# */{
    /**
     * Unique ID
     * @type Integer
     */
    _id: 0,
    

    /**
     * The constructor for subclasses. Overwrite this for any initalisation you
     * need to do.
     * @ignore
     */
    init: function () {},

    /**
     * Get a property from the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @returns {*} Value of the property
     */
    get: function (key) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            return accessor.target.get(accessor.key);
        } else {
            // Call getting function
            if (this['get_' + key]) {
                return this['get_' + key]();
            }

            return this[key];
        }
    },


    /**
     * Set a property on the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @param {*} value New value for the property
     */
    set: function (key, value) {
        var accessor = getAccessors(this)[key],
            oldVal = this.get(key);
        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {
            if (this['set_' + key]) {
                this['set_' + key](value);
            } else {
                this[key] = value;
            }
        }
        this.triggerChanged(key, oldVal);
    },

    /**
     * Set multiple propertys in one go
     *
     * @param {Object} kvp An Object where the key is a property name and the value is the value to assign to the property
     *
     * @example
     * var props = {
     *   monkey: 'ook',
     *   cat: 'meow',
     *   dog: 'woof'
     * };
     * foo.setValues(props);
     * console.log(foo.get('cat')); // Logs 'meow'
     */
    setValues: function (kvp) {
        for (var x in kvp) {
            if (kvp.hasOwnProperty(x)) {
                this.set(x, kvp[x]);
            }
        }
    },

    changed: function (key) {
    },

    /**
     * @private
     */
    notify: function (key, oldVal) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key, oldVal);
        }
    },

    /**
     * @private
     */
    triggerChanged: function(key, oldVal) {
        evt.trigger(this, key.toLowerCase() + '_changed', oldVal);
    },

    /**
     * Bind the value of a property on this object to that of another object so
     * they always have the same value. Setting the value on either object will update
     * the other too.
     *
     * @param {String} key Name of the property on this object that should be bound
     * @param {BOject} target Object to bind to
     * @param {String} [targetKey=key] Key on the target object to bind to
     * @param {Boolean} [noNotify=false] Set to true to prevent this object's property triggering a 'changed' event when adding the binding
     */
    bindTo: function (key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        var oldVal = this.get(key);

        // When bound property changes, trigger a 'changed' event on this one too
        getBindings(this)[key] = evt.addListener(target, targetKey.toLowerCase() + '_changed', function (oldVal) {
            self.triggerChanged(key, oldVal);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },

    /**
     * Remove binding from a property which set setup using BObject#bindTo.
     *
     * @param {String} key Name of the property on this object to unbind
     */
    unbind: function (key) {
        var binding = getBindings(this)[key];
        if (!binding) {
            return;
        }

        delete getBindings(this)[key];
        evt.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete getAccessors(this)[key];
        // Set bound value
        this[key] = val;
    },

    /**
     * Remove all bindings on this object
     */
    unbindAll: function () {
        var keys = [],
            bindings = getBindings(this);
        for (var k in bindings) {
            if (bindings.hasOwnProperty(k)) {
                this.unbind(k);
            }
        }
    },

    /**
     * Unique ID for this object
     * @getter id
     * @type Integer
     */
    get_id: function() {
        if (!this._id) {
            this._id = ++objectID;
        }

        return this._id;
    }
});


/**
 * Create a new instance of this object
 * @returns {BObject} New instance of this object
 */
BObject.create = function() {
    var ret = new this();
    ret.init.apply(ret, arguments);
    return ret;
};

/**
 * Create a new subclass by extending this one
 * @returns {Object} A new subclass of this object
 */
BObject.extend = function() {
    var newObj = function() {},
        args = [],
        i,
        x;

    // Copy 'class' methods
    for (x in this) {
        if (this.hasOwnProperty(x)) {
            newObj[x] = this[x];
        }
    }


    // Add given properties to the prototype
    newObj.prototype = util.beget(this.prototype);
    args.push(newObj.prototype);
    for (i = 0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    util.extend.apply(null, args);

    newObj.superclass = this.prototype;
    // Create new instance
    return newObj;
};

/**
 * Get a property from the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @returns {*} Value of the property
 */
BObject.get = BObject.prototype.get;

/**
 * Set a property on the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @param {*} value New value for the property
 */
BObject.set = BObject.prototype.set;

var BArray = BObject.extend(/** @lends BArray# */{

    /**
     * @constructs 
     * A bindable array. Allows observing for changes made to its contents
     *
     * @extends BObject
     * @param {Array} [array=[]] A normal JS array to use for data
     */
    init: function (array) {
        this.array = array || [];
        this.set('length', this.array.length);
    },

    /**
     * Get an item
     *
     * @param {Integer} i Index to get item from
     * @returns {*} Value stored in the array at index 'i'
     */
    getAt: function (i) {
        return this.array[i];
    },

    /**
     * Set an item -- Overwrites any existing item at index
     *
     * @param {Integer} i Index to set item to
     * @param {*} value Value to assign to index
     */
    setAt: function (i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        evt.trigger(this, 'set_at', i, oldVal);
    },

    /**
     * Insert a new item into the array without overwriting anything
     *
     * @param {Integer} i Index to insert item at
     * @param {*} value Value to insert
     */
    insertAt: function (i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        evt.trigger(this, 'insert_at', i);
    },

    /**
     * Remove item from the array and return it
     *
     * @param {Integer} i Index to remove
     * @returns {*} Value that was removed
     */
    removeAt: function (i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        evt.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },

    /**
     * Get the internal Javascript Array instance
     *
     * @returns {Array} Internal Javascript Array
     */
    getArray: function () {
        return this.array;
    },

    /**
     * Append a value to the end of the array and return its new length
     *
     * @param {*} value Value to append to the array
     * @returns {Integer} New length of the array
     */
    push: function (value) {
        this.insertAt(this.array.length, value);
        return this.array.length;
    },

    /**
     * Remove value from the end of the array and return it
     *
     * @returns {*} Value that was removed
     */
    pop: function () {
        return this.removeAt(this.array.length - 1);
    }
});

exports.BObject = BObject;
exports.BArray = BArray;

}};
__resources__["/__builtin__/libs/base64.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's Base64 utils
 */

/** @ignore */
var JXG = require('JXGUtil');

/** @namespace */
var base64 = {
    /**
     * Decode a base64 encoded string into a binary string
     *
     * @param {String} input Base64 encoded data
     * @returns {String} Binary string
     */
    decode: function(input) {
        return JXG.Util.Base64.decode(input);
    },

    /**
     * Decode a base64 encoded string into a byte array
     *
     * @param {String} input Base64 encoded data
     * @returns {Integer[]} Array of bytes
     */
    decodeAsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = JXG.Util.Base64.decode(input),
            ar = [], i, j, len;

        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Encode a binary string into base64
     *
     * @param {String} input Binary string
     * @returns {String} Base64 encoded data
     */
    encode: function(input) {
        return JXG.Util.Base64.encode(input);
    }
};

module.exports = base64;

}};
__resources__["/__builtin__/libs/box2d.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
function extend(a, b) {
  for(var c in b) {
    a[c] = b[c]
  }
}
function isInstanceOf(obj, _constructor) {
  while(typeof obj === "object") {
    if(obj.constructor === _constructor) {
      return true
    }
    obj = obj._super
  }
  return false
}
;var b2BoundValues = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BoundValues.prototype.__constructor = function() {
  this.lowerValues = new Array;
  this.lowerValues[0] = 0;
  this.lowerValues[1] = 0;
  this.upperValues = new Array;
  this.upperValues[0] = 0;
  this.upperValues[1] = 0
};
b2BoundValues.prototype.__varz = function() {
};
b2BoundValues.prototype.lowerValues = null;
b2BoundValues.prototype.upperValues = null;var b2PairManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PairManager.prototype.__constructor = function() {
  this.m_pairs = new Array;
  this.m_pairBuffer = new Array;
  this.m_pairCount = 0;
  this.m_pairBufferCount = 0;
  this.m_freePair = null
};
b2PairManager.prototype.__varz = function() {
};
b2PairManager.prototype.AddPair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair != null) {
    return pair
  }
  if(this.m_freePair == null) {
    this.m_freePair = new b2Pair;
    this.m_pairs.push(this.m_freePair)
  }
  pair = this.m_freePair;
  this.m_freePair = pair.next;
  pair.proxy1 = proxy1;
  pair.proxy2 = proxy2;
  pair.status = 0;
  pair.userData = null;
  pair.next = null;
  proxy1.pairs[proxy2] = pair;
  proxy2.pairs[proxy1] = pair;
  ++this.m_pairCount;
  return pair
};
b2PairManager.prototype.RemovePair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair == null) {
    return null
  }
  var userData = pair.userData;
  delete proxy1.pairs[proxy2];
  delete proxy2.pairs[proxy1];
  pair.next = this.m_freePair;
  pair.proxy1 = null;
  pair.proxy2 = null;
  pair.userData = null;
  pair.status = 0;
  this.m_freePair = pair;
  --this.m_pairCount;
  return userData
};
b2PairManager.prototype.Find = function(proxy1, proxy2) {
  return proxy1.pairs[proxy2]
};
b2PairManager.prototype.ValidateBuffer = function() {
};
b2PairManager.prototype.ValidateTable = function() {
};
b2PairManager.prototype.Initialize = function(broadPhase) {
  this.m_broadPhase = broadPhase
};
b2PairManager.prototype.AddBufferedPair = function(proxy1, proxy2) {
  var pair = this.AddPair(proxy1, proxy2);
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.ClearRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.RemoveBufferedPair = function(proxy1, proxy2) {
  var pair = this.Find(proxy1, proxy2);
  if(pair == null) {
    return
  }
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.SetRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.Commit = function(callback) {
  var i = 0;
  var removeCount = 0;
  for(i = 0;i < this.m_pairBufferCount;++i) {
    var pair = this.m_pairBuffer[i];
    pair.ClearBuffered();
    var proxy1 = pair.proxy1;
    var proxy2 = pair.proxy2;
    if(pair.IsRemoved()) {
    }else {
      if(pair.IsFinal() == false) {
        callback(proxy1.userData, proxy2.userData)
      }
    }
  }
  this.m_pairBufferCount = 0;
  if(b2BroadPhase.s_validate) {
    this.ValidateTable()
  }
};
b2PairManager.prototype.m_broadPhase = null;
b2PairManager.prototype.m_pairs = null;
b2PairManager.prototype.m_freePair = null;
b2PairManager.prototype.m_pairCount = 0;
b2PairManager.prototype.m_pairBuffer = null;
b2PairManager.prototype.m_pairBufferCount = 0;var b2TimeStep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeStep.prototype.__constructor = function() {
};
b2TimeStep.prototype.__varz = function() {
};
b2TimeStep.prototype.Set = function(step) {
  this.dt = step.dt;
  this.inv_dt = step.inv_dt;
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  this.warmStarting = step.warmStarting
};
b2TimeStep.prototype.dt = null;
b2TimeStep.prototype.inv_dt = null;
b2TimeStep.prototype.dtRatio = null;
b2TimeStep.prototype.velocityIterations = 0;
b2TimeStep.prototype.positionIterations = 0;
b2TimeStep.prototype.warmStarting = null;var b2Controller = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Controller.prototype.__constructor = function() {
};
b2Controller.prototype.__varz = function() {
};
b2Controller.prototype.Step = function(step) {
};
b2Controller.prototype.Draw = function(debugDraw) {
};
b2Controller.prototype.AddBody = function(body) {
  var edge = new b2ControllerEdge;
  edge.controller = this;
  edge.body = body;
  edge.nextBody = m_bodyList;
  edge.prevBody = null;
  m_bodyList = edge;
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge
  }
  m_bodyCount++;
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  body.m_controllerList = edge;
  if(edge.nextController) {
    edge.nextController.prevController = edge
  }
  body.m_controllerCount++
};
b2Controller.prototype.RemoveBody = function(body) {
  var edge = body.m_controllerList;
  while(edge && edge.controller != this) {
    edge = edge.nextController
  }
  if(edge.prevBody) {
    edge.prevBody.nextBody = edge.nextBody
  }
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge.prevBody
  }
  if(edge.nextController) {
    edge.nextController.prevController = edge.prevController
  }
  if(edge.prevController) {
    edge.prevController.nextController = edge.nextController
  }
  if(m_bodyList == edge) {
    m_bodyList = edge.nextBody
  }
  if(body.m_controllerList == edge) {
    body.m_controllerList = edge.nextController
  }
  body.m_controllerCount--;
  m_bodyCount--
};
b2Controller.prototype.Clear = function() {
  while(m_bodyList) {
    this.RemoveBody(m_bodyList.body)
  }
};
b2Controller.prototype.GetNext = function() {
  return this.m_next
};
b2Controller.prototype.GetWorld = function() {
  return this.m_world
};
b2Controller.prototype.GetBodyList = function() {
  return m_bodyList
};
b2Controller.prototype.m_next = null;
b2Controller.prototype.m_prev = null;
b2Controller.prototype.m_world = null;var b2GravityController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GravityController.prototype, b2Controller.prototype);
b2GravityController.prototype._super = b2Controller.prototype;
b2GravityController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2GravityController.prototype.__varz = function() {
};
b2GravityController.prototype.Step = function(step) {
  var i = null;
  var body1 = null;
  var p1 = null;
  var mass1 = 0;
  var j = null;
  var body2 = null;
  var p2 = null;
  var dx = 0;
  var dy = 0;
  var r2 = 0;
  var f = null;
  if(this.invSqr) {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }else {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }
};
b2GravityController.prototype.G = 1;
b2GravityController.prototype.invSqr = true;var b2DestructionListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DestructionListener.prototype.__constructor = function() {
};
b2DestructionListener.prototype.__varz = function() {
};
b2DestructionListener.prototype.SayGoodbyeJoint = function(joint) {
};
b2DestructionListener.prototype.SayGoodbyeFixture = function(fixture) {
};var b2ContactEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactEdge.prototype.__constructor = function() {
};
b2ContactEdge.prototype.__varz = function() {
};
b2ContactEdge.prototype.other = null;
b2ContactEdge.prototype.contact = null;
b2ContactEdge.prototype.prev = null;
b2ContactEdge.prototype.next = null;var b2EdgeChainDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2EdgeChainDef.prototype.__constructor = function() {
  this.vertexCount = 0;
  this.isALoop = true;
  this.vertices = []
};
b2EdgeChainDef.prototype.__varz = function() {
};
b2EdgeChainDef.prototype.vertices = null;
b2EdgeChainDef.prototype.vertexCount = null;
b2EdgeChainDef.prototype.isALoop = null;var b2Vec2 = function(x_, y_) {
  if(arguments.length == 2) {
    this.x = x_;
    this.y = y_
  }
};
b2Vec2.Make = function(x_, y_) {
  return new b2Vec2(x_, y_)
};
b2Vec2.prototype.SetZero = function() {
  this.x = 0;
  this.y = 0
};
b2Vec2.prototype.Set = function(x_, y_) {
  this.x = x_;
  this.y = y_
};
b2Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y
};
b2Vec2.prototype.GetNegative = function() {
  return new b2Vec2(-this.x, -this.y)
};
b2Vec2.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y
};
b2Vec2.prototype.Copy = function() {
  return new b2Vec2(this.x, this.y)
};
b2Vec2.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y
};
b2Vec2.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y
};
b2Vec2.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a
};
b2Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y
};
b2Vec2.prototype.MulTM = function(A) {
  var tX = b2Math.Dot(this, A.col1);
  this.y = b2Math.Dot(this, A.col2);
  this.x = tX
};
b2Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX
};
b2Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX
};
b2Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y
};
b2Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y
};
b2Vec2.prototype.Abs = function() {
  if(this.x < 0) {
    this.x = -this.x
  }
  if(this.y < 0) {
    this.y = -this.y
  }
};
b2Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
};
b2Vec2.prototype.LengthSquared = function() {
  return this.x * this.x + this.y * this.y
};
b2Vec2.prototype.Normalize = function() {
  var length = Math.sqrt(this.x * this.x + this.y * this.y);
  if(length < Number.MIN_VALUE) {
    return 0
  }
  var invLength = 1 / length;
  this.x *= invLength;
  this.y *= invLength;
  return length
};
b2Vec2.prototype.IsValid = function() {
  return b2Math.IsValid(this.x) && b2Math.IsValid(this.y)
};
b2Vec2.prototype.x = 0;
b2Vec2.prototype.y = 0;var b2Vec3 = function(x, y, z) {
  if(arguments.length == 3) {
    this.x = x;
    this.y = y;
    this.z = z
  }
};
b2Vec3.prototype.SetZero = function() {
  this.x = this.y = this.z = 0
};
b2Vec3.prototype.Set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z
};
b2Vec3.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z
};
b2Vec3.prototype.GetNegative = function() {
  return new b2Vec3(-this.x, -this.y, -this.z)
};
b2Vec3.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z
};
b2Vec3.prototype.Copy = function() {
  return new b2Vec3(this.x, this.y, this.z)
};
b2Vec3.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z
};
b2Vec3.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z
};
b2Vec3.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a;
  this.z *= a
};
b2Vec3.prototype.x = 0;
b2Vec3.prototype.y = 0;
b2Vec3.prototype.z = 0;var b2DistanceProxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceProxy.prototype.__constructor = function() {
};
b2DistanceProxy.prototype.__varz = function() {
};
b2DistanceProxy.prototype.Set = function(shape) {
  switch(shape.GetType()) {
    case b2Shape.e_circleShape:
      var circle = shape;
      this.m_vertices = new Array(1);
      this.m_vertices[0] = circle.m_p;
      this.m_count = 1;
      this.m_radius = circle.m_radius;
      break;
    case b2Shape.e_polygonShape:
      var polygon = shape;
      this.m_vertices = polygon.m_vertices;
      this.m_count = polygon.m_vertexCount;
      this.m_radius = polygon.m_radius;
      break;
    default:
      b2Settings.b2Assert(false)
  }
};
b2DistanceProxy.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2DistanceProxy.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2DistanceProxy.prototype.GetVertexCount = function() {
  return this.m_count
};
b2DistanceProxy.prototype.GetVertex = function(index) {
  b2Settings.b2Assert(0 <= index && index < this.m_count);
  return this.m_vertices[index]
};
b2DistanceProxy.prototype.m_vertices = null;
b2DistanceProxy.prototype.m_count = 0;
b2DistanceProxy.prototype.m_radius = null;var b2ContactFactory = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFactory.prototype.__constructor = function() {
};
b2ContactFactory.prototype.__varz = function() {
  this.InitializeRegisters()
};
b2ContactFactory.prototype.AddType = function(createFcn, destroyFcn, type1, type2) {
  this.m_registers[type1][type2].createFcn = createFcn;
  this.m_registers[type1][type2].destroyFcn = destroyFcn;
  this.m_registers[type1][type2].primary = true;
  if(type1 != type2) {
    this.m_registers[type2][type1].createFcn = createFcn;
    this.m_registers[type2][type1].destroyFcn = destroyFcn;
    this.m_registers[type2][type1].primary = false
  }
};
b2ContactFactory.prototype.InitializeRegisters = function() {
  this.m_registers = new Array(b2Shape.e_shapeTypeCount);
  for(var i = 0;i < b2Shape.e_shapeTypeCount;i++) {
    this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
    for(var j = 0;j < b2Shape.e_shapeTypeCount;j++) {
      this.m_registers[i][j] = new b2ContactRegister
    }
  }
  this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
  this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
  this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape)
};
b2ContactFactory.prototype.Create = function(fixtureA, fixtureB) {
  var type1 = fixtureA.GetType();
  var type2 = fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  var c;
  if(reg.pool) {
    c = reg.pool;
    reg.pool = c.m_next;
    reg.poolCount--;
    c.Reset(fixtureA, fixtureB);
    return c
  }
  var createFcn = reg.createFcn;
  if(createFcn != null) {
    if(reg.primary) {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureA, fixtureB);
      return c
    }else {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureB, fixtureA);
      return c
    }
  }else {
    return null
  }
};
b2ContactFactory.prototype.Destroy = function(contact) {
  if(contact.m_manifold.m_pointCount > 0) {
    contact.m_fixtureA.m_body.SetAwake(true);
    contact.m_fixtureB.m_body.SetAwake(true)
  }
  var type1 = contact.m_fixtureA.GetType();
  var type2 = contact.m_fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  if(true) {
    reg.poolCount++;
    contact.m_next = reg.pool;
    reg.pool = contact
  }
  var destroyFcn = reg.destroyFcn;
  destroyFcn(contact, this.m_allocator)
};
b2ContactFactory.prototype.m_registers = null;
b2ContactFactory.prototype.m_allocator = null;var b2ConstantAccelController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantAccelController.prototype, b2Controller.prototype);
b2ConstantAccelController.prototype._super = b2Controller.prototype;
b2ConstantAccelController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantAccelController.prototype.__varz = function() {
  this.A = new b2Vec2(0, 0)
};
b2ConstantAccelController.prototype.Step = function(step) {
  var smallA = new b2Vec2(this.A.x * step.dt, this.A.y * step.dt);
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + smallA.y))
  }
};
b2ConstantAccelController.prototype.A = new b2Vec2(0, 0);var b2SeparationFunction = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SeparationFunction.prototype.__constructor = function() {
};
b2SeparationFunction.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_axis = new b2Vec2
};
b2SeparationFunction.e_points = 1;
b2SeparationFunction.e_faceA = 2;
b2SeparationFunction.e_faceB = 4;
b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  var count = cache.count;
  b2Settings.b2Assert(0 < count && count < 3);
  var localPointA;
  var localPointA1;
  var localPointA2;
  var localPointB;
  var localPointB1;
  var localPointB2;
  var pointAX;
  var pointAY;
  var pointBX;
  var pointBY;
  var normalX;
  var normalY;
  var tMat;
  var tVec;
  var s;
  var sgn;
  if(count == 1) {
    this.m_type = b2SeparationFunction.e_points;
    localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    tVec = localPointA;
    tMat = transformA.R;
    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = localPointB;
    tMat = transformB.R;
    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_axis.x = pointBX - pointAX;
    this.m_axis.y = pointBY - pointAY;
    this.m_axis.Normalize()
  }else {
    if(cache.indexB[0] == cache.indexB[1]) {
      this.m_type = b2SeparationFunction.e_faceA;
      localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
      localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
      localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
      this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
      this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
      this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
      this.m_axis.Normalize();
      tVec = this.m_axis;
      tMat = transformA.R;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tVec = this.m_localPoint;
      tMat = transformA.R;
      pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tVec = localPointB;
      tMat = transformB.R;
      pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
      if(s < 0) {
        this.m_axis.NegativeSelf()
      }
    }else {
      if(cache.indexA[0] == cache.indexA[0]) {
        this.m_type = b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if(s < 0) {
          this.m_axis.NegativeSelf()
        }
      }else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var pA = b2Math.MulX(transformA, localPointA);
        var dA = b2Math.MulMV(transformA.R, b2Math.SubtractVV(localPointA2, localPointA1));
        var pB = b2Math.MulX(transformB, localPointB);
        var dB = b2Math.MulMV(transformB.R, b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0;
        if(denom != 0) {
          s = b2Math.Clamp((b * f - c * e) / denom, 0, 1)
        }
        var t = (b * s + f) / e;
        if(t < 0) {
          t = 0;
          s = b2Math.Clamp((b - c) / a, 0, 1)
        }
        localPointA = new b2Vec2;
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = new b2Vec2;
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if(s == 0 || s == 1) {
          this.m_type = b2SeparationFunction.e_faceB;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
          this.m_axis.Normalize();
          this.m_localPoint = localPointB;
          tVec = this.m_axis;
          tMat = transformB.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointA;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }else {
          this.m_type = b2SeparationFunction.e_faceA;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
          this.m_localPoint = localPointA;
          tVec = this.m_axis;
          tMat = transformA.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointB;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }
      }
    }
  }
};
b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
  var axisA;
  var axisB;
  var localPointA;
  var localPointB;
  var pointA;
  var pointB;
  var seperation;
  var normal;
  switch(this.m_type) {
    case b2SeparationFunction.e_points:
      axisA = b2Math.MulTMV(transformA.R, this.m_axis);
      axisB = b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointA = b2Math.MulX(transformA, localPointA);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
      return seperation;
    case b2SeparationFunction.e_faceA:
      normal = b2Math.MulMV(transformA.R, this.m_axis);
      pointA = b2Math.MulX(transformA, this.m_localPoint);
      axisB = b2Math.MulTMV(transformB.R, normal.GetNegative());
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
      return seperation;
    case b2SeparationFunction.e_faceB:
      normal = b2Math.MulMV(transformB.R, this.m_axis);
      pointB = b2Math.MulX(transformB, this.m_localPoint);
      axisA = b2Math.MulTMV(transformA.R, normal.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      pointA = b2Math.MulX(transformA, localPointA);
      seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
      return seperation;
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2SeparationFunction.prototype.m_proxyA = null;
b2SeparationFunction.prototype.m_proxyB = null;
b2SeparationFunction.prototype.m_type = 0;
b2SeparationFunction.prototype.m_localPoint = new b2Vec2;
b2SeparationFunction.prototype.m_axis = new b2Vec2;var b2DynamicTreePair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreePair.prototype.__constructor = function() {
};
b2DynamicTreePair.prototype.__varz = function() {
};
b2DynamicTreePair.prototype.proxyA = null;
b2DynamicTreePair.prototype.proxyB = null;var b2ContactConstraintPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraintPoint.prototype.__constructor = function() {
};
b2ContactConstraintPoint.prototype.__varz = function() {
  this.localPoint = new b2Vec2;
  this.rA = new b2Vec2;
  this.rB = new b2Vec2
};
b2ContactConstraintPoint.prototype.localPoint = new b2Vec2;
b2ContactConstraintPoint.prototype.rA = new b2Vec2;
b2ContactConstraintPoint.prototype.rB = new b2Vec2;
b2ContactConstraintPoint.prototype.normalImpulse = null;
b2ContactConstraintPoint.prototype.tangentImpulse = null;
b2ContactConstraintPoint.prototype.normalMass = null;
b2ContactConstraintPoint.prototype.tangentMass = null;
b2ContactConstraintPoint.prototype.equalizedMass = null;
b2ContactConstraintPoint.prototype.velocityBias = null;var b2ControllerEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ControllerEdge.prototype.__constructor = function() {
};
b2ControllerEdge.prototype.__varz = function() {
};
b2ControllerEdge.prototype.controller = null;
b2ControllerEdge.prototype.body = null;
b2ControllerEdge.prototype.prevBody = null;
b2ControllerEdge.prototype.nextBody = null;
b2ControllerEdge.prototype.prevController = null;
b2ControllerEdge.prototype.nextController = null;var b2DistanceInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceInput.prototype.__constructor = function() {
};
b2DistanceInput.prototype.__varz = function() {
};
b2DistanceInput.prototype.proxyA = null;
b2DistanceInput.prototype.proxyB = null;
b2DistanceInput.prototype.transformA = null;
b2DistanceInput.prototype.transformB = null;
b2DistanceInput.prototype.useRadii = null;var b2Settings = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Settings.prototype.__constructor = function() {
};
b2Settings.prototype.__varz = function() {
};
b2Settings.b2MixFriction = function(friction1, friction2) {
  return Math.sqrt(friction1 * friction2)
};
b2Settings.b2MixRestitution = function(restitution1, restitution2) {
  return restitution1 > restitution2 ? restitution1 : restitution2
};
b2Settings.b2Assert = function(a) {
  if(!a) {
    throw"Assertion Failed";
  }
};
b2Settings.VERSION = "2.1alpha";
b2Settings.USHRT_MAX = 65535;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_aabbExtension = 0.1;
b2Settings.b2_aabbMultiplier = 2;
b2Settings.b2_polygonRadius = 2 * b2Settings.b2_linearSlop;
b2Settings.b2_linearSlop = 0.0050;
b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
b2Settings.b2_toiSlop = 8 * b2Settings.b2_linearSlop;
b2Settings.b2_maxTOIContactsPerIsland = 32;
b2Settings.b2_maxTOIJointsPerIsland = 32;
b2Settings.b2_velocityThreshold = 1;
b2Settings.b2_maxLinearCorrection = 0.2;
b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
b2Settings.b2_maxTranslation = 2;
b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
b2Settings.b2_maxRotation = 0.5 * b2Settings.b2_pi;
b2Settings.b2_maxRotationSquared = b2Settings.b2_maxRotation * b2Settings.b2_maxRotation;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5;
b2Settings.b2_linearSleepTolerance = 0.01;
b2Settings.b2_angularSleepTolerance = 2 / 180 * b2Settings.b2_pi;var b2Proxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Proxy.prototype.__constructor = function() {
};
b2Proxy.prototype.__varz = function() {
  this.lowerBounds = new Array(2);
  this.upperBounds = new Array(2);
  this.pairs = new Object
};
b2Proxy.prototype.IsValid = function() {
  return this.overlapCount != b2BroadPhase.b2_invalid
};
b2Proxy.prototype.lowerBounds = new Array(2);
b2Proxy.prototype.upperBounds = new Array(2);
b2Proxy.prototype.overlapCount = 0;
b2Proxy.prototype.timeStamp = 0;
b2Proxy.prototype.pairs = new Object;
b2Proxy.prototype.next = null;
b2Proxy.prototype.userData = null;var b2Point = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Point.prototype.__constructor = function() {
};
b2Point.prototype.__varz = function() {
  this.p = new b2Vec2
};
b2Point.prototype.Support = function(xf, vX, vY) {
  return this.p
};
b2Point.prototype.GetFirstVertex = function(xf) {
  return this.p
};
b2Point.prototype.p = new b2Vec2;var b2WorldManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2WorldManifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2WorldManifold.prototype.__varz = function() {
  this.m_normal = new b2Vec2
};
b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
  if(manifold.m_pointCount == 0) {
    return
  }
  var i = 0;
  var tVec;
  var tMat;
  var normalX;
  var normalY;
  var planePointX;
  var planePointY;
  var clipPointX;
  var clipPointY;
  switch(manifold.m_type) {
    case b2Manifold.e_circles:
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_points[0].m_localPoint;
      var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      var cAX = pointAX + radiusA * this.m_normal.x;
      var cAY = pointAY + radiusA * this.m_normal.y;
      var cBX = pointBX - radiusB * this.m_normal.x;
      var cBY = pointBY - radiusB * this.m_normal.y;
      this.m_points[0].x = 0.5 * (cAX + cBX);
      this.m_points[0].y = 0.5 * (cAY + cBY);
      break;
    case b2Manifold.e_faceA:
      tMat = xfA.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = normalX;
      this.m_normal.y = normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfB.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = xfB.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_localPoint;
      planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = -normalX;
      this.m_normal.y = -normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfA.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY
      }
      break
  }
};
b2WorldManifold.prototype.m_normal = new b2Vec2;
b2WorldManifold.prototype.m_points = null;var b2RayCastOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastOutput.prototype.__constructor = function() {
};
b2RayCastOutput.prototype.__varz = function() {
  this.normal = new b2Vec2
};
b2RayCastOutput.prototype.normal = new b2Vec2;
b2RayCastOutput.prototype.fraction = null;var b2ConstantForceController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantForceController.prototype, b2Controller.prototype);
b2ConstantForceController.prototype._super = b2Controller.prototype;
b2ConstantForceController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantForceController.prototype.__varz = function() {
  this.F = new b2Vec2(0, 0)
};
b2ConstantForceController.prototype.Step = function(step) {
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.ApplyForce(this.F, body.GetWorldCenter())
  }
};
b2ConstantForceController.prototype.F = new b2Vec2(0, 0);var b2MassData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2MassData.prototype.__constructor = function() {
};
b2MassData.prototype.__varz = function() {
  this.center = new b2Vec2(0, 0)
};
b2MassData.prototype.mass = 0;
b2MassData.prototype.center = new b2Vec2(0, 0);
b2MassData.prototype.I = 0;var b2DynamicTree = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTree.prototype.__constructor = function() {
  this.m_root = null;
  this.m_freeList = null;
  this.m_path = 0;
  this.m_insertionCount = 0
};
b2DynamicTree.prototype.__varz = function() {
};
b2DynamicTree.prototype.AllocateNode = function() {
  if(this.m_freeList) {
    var node = this.m_freeList;
    this.m_freeList = node.parent;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    return node
  }
  return new b2DynamicTreeNode
};
b2DynamicTree.prototype.FreeNode = function(node) {
  node.parent = this.m_freeList;
  this.m_freeList = node
};
b2DynamicTree.prototype.InsertLeaf = function(leaf) {
  ++this.m_insertionCount;
  if(this.m_root == null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return
  }
  var center = leaf.aabb.GetCenter();
  var sibling = this.m_root;
  if(sibling.IsLeaf() == false) {
    do {
      var child1 = sibling.child1;
      var child2 = sibling.child2;
      var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
      var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
      if(norm1 < norm2) {
        sibling = child1
      }else {
        sibling = child2
      }
    }while(sibling.IsLeaf() == false)
  }
  var node1 = sibling.parent;
  var node2 = this.AllocateNode();
  node2.parent = node1;
  node2.userData = null;
  node2.aabb.Combine(leaf.aabb, sibling.aabb);
  if(node1) {
    if(sibling.parent.child1 == sibling) {
      node1.child1 = node2
    }else {
      node1.child2 = node2
    }
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    do {
      if(node1.aabb.Contains(node2.aabb)) {
        break
      }
      node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
      node2 = node1;
      node1 = node1.parent
    }while(node1)
  }else {
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    this.m_root = node2
  }
};
b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
  if(leaf == this.m_root) {
    this.m_root = null;
    return
  }
  var node2 = leaf.parent;
  var node1 = node2.parent;
  var sibling;
  if(node2.child1 == leaf) {
    sibling = node2.child2
  }else {
    sibling = node2.child1
  }
  if(node1) {
    if(node1.child1 == node2) {
      node1.child1 = sibling
    }else {
      node1.child2 = sibling
    }
    sibling.parent = node1;
    this.FreeNode(node2);
    while(node1) {
      var oldAABB = node1.aabb;
      node1.aabb = b2AABB.Combine(node1.child1.aabb, node1.child2.aabb);
      if(oldAABB.Contains(node1.aabb)) {
        break
      }
      node1 = node1.parent
    }
  }else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(node2)
  }
};
b2DynamicTree.prototype.CreateProxy = function(aabb, userData) {
  var node = this.AllocateNode();
  var extendX = b2Settings.b2_aabbExtension;
  var extendY = b2Settings.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  node.aabb.upperBound.x = aabb.upperBound.x + extendX;
  node.aabb.upperBound.y = aabb.upperBound.y + extendY;
  node.userData = userData;
  this.InsertLeaf(node);
  return node
};
b2DynamicTree.prototype.DestroyProxy = function(proxy) {
  this.RemoveLeaf(proxy);
  this.FreeNode(proxy)
};
b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
  b2Settings.b2Assert(proxy.IsLeaf());
  if(proxy.aabb.Contains(aabb)) {
    return false
  }
  this.RemoveLeaf(proxy);
  var extendX = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : -displacement.x);
  var extendY = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : -displacement.y);
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
  proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
  this.InsertLeaf(proxy);
  return true
};
b2DynamicTree.prototype.Rebalance = function(iterations) {
  if(this.m_root == null) {
    return
  }
  for(var i = 0;i < iterations;i++) {
    var node = this.m_root;
    var bit = 0;
    while(node.IsLeaf() == false) {
      node = this.m_path >> bit & 1 ? node.child2 : node.child1;
      bit = bit + 1 & 31
    }
    ++this.m_path;
    this.RemoveLeaf(node);
    this.InsertLeaf(node)
  }
};
b2DynamicTree.prototype.GetFatAABB = function(proxy) {
  return proxy.aabb
};
b2DynamicTree.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2DynamicTree.prototype.Query = function(callback, aabb) {
  if(this.m_root == null) {
    return
  }
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(aabb)) {
      if(node.IsLeaf()) {
        var proceed = callback(node);
        if(!proceed) {
          return
        }
      }else {
        stack[count++] = node.child1;
        stack[count++] = node.child2
      }
    }
  }
};
b2DynamicTree.prototype.RayCast = function(callback, input) {
  if(this.m_root == null) {
    return
  }
  var p1 = input.p1;
  var p2 = input.p2;
  var r = b2Math.SubtractVV(p1, p2);
  r.Normalize();
  var v = b2Math.CrossFV(1, r);
  var abs_v = b2Math.AbsV(v);
  var maxFraction = input.maxFraction;
  var segmentAABB = new b2AABB;
  var tX;
  var tY;
  tX = p1.x + maxFraction * (p2.x - p1.x);
  tY = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = Math.min(p1.x, tX);
  segmentAABB.lowerBound.y = Math.min(p1.y, tY);
  segmentAABB.upperBound.x = Math.max(p1.x, tX);
  segmentAABB.upperBound.y = Math.max(p1.y, tY);
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(segmentAABB) == false) {
      continue
    }
    var c = node.aabb.GetCenter();
    var h = node.aabb.GetExtents();
    var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
    if(separation > 0) {
      continue
    }
    if(node.IsLeaf()) {
      var subInput = new b2RayCastInput;
      subInput.p1 = input.p1;
      subInput.p2 = input.p2;
      subInput.maxFraction = input.maxFraction;
      maxFraction = callback(subInput, node);
      if(maxFraction == 0) {
        return
      }
      tX = p1.x + maxFraction * (p2.x - p1.x);
      tY = p1.y + maxFraction * (p2.y - p1.y);
      segmentAABB.lowerBound.x = Math.min(p1.x, tX);
      segmentAABB.lowerBound.y = Math.min(p1.y, tY);
      segmentAABB.upperBound.x = Math.max(p1.x, tX);
      segmentAABB.upperBound.y = Math.max(p1.y, tY)
    }else {
      stack[count++] = node.child1;
      stack[count++] = node.child2
    }
  }
};
b2DynamicTree.prototype.m_root = null;
b2DynamicTree.prototype.m_freeList = null;
b2DynamicTree.prototype.m_path = 0;
b2DynamicTree.prototype.m_insertionCount = 0;var b2JointEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointEdge.prototype.__constructor = function() {
};
b2JointEdge.prototype.__varz = function() {
};
b2JointEdge.prototype.other = null;
b2JointEdge.prototype.joint = null;
b2JointEdge.prototype.prev = null;
b2JointEdge.prototype.next = null;var b2RayCastInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastInput.prototype.__constructor = function() {
};
b2RayCastInput.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2RayCastInput.prototype.p1 = new b2Vec2;
b2RayCastInput.prototype.p2 = new b2Vec2;
b2RayCastInput.prototype.maxFraction = null;var Features = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
Features.prototype.__constructor = function() {
};
Features.prototype.__varz = function() {
};
Features.prototype.__defineGetter__("referenceEdge", function() {
  return this._referenceEdge
});
Features.prototype.__defineSetter__("referenceEdge", function(value) {
  this._referenceEdge = value;
  this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255
});
Features.prototype.__defineGetter__("incidentEdge", function() {
  return this._incidentEdge
});
Features.prototype.__defineSetter__("incidentEdge", function(value) {
  this._incidentEdge = value;
  this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
});
Features.prototype.__defineGetter__("incidentVertex", function() {
  return this._incidentVertex
});
Features.prototype.__defineSetter__("incidentVertex", function(value) {
  this._incidentVertex = value;
  this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
});
Features.prototype.__defineGetter__("flip", function() {
  return this._flip
});
Features.prototype.__defineSetter__("flip", function(value) {
  this._flip = value;
  this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
});
Features.prototype._referenceEdge = 0;
Features.prototype._incidentEdge = 0;
Features.prototype._incidentVertex = 0;
Features.prototype._flip = 0;
Features.prototype._m_id = null;var b2FilterData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FilterData.prototype.__constructor = function() {
};
b2FilterData.prototype.__varz = function() {
  this.categoryBits = 1;
  this.maskBits = 65535
};
b2FilterData.prototype.Copy = function() {
  var copy = new b2FilterData;
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy
};
b2FilterData.prototype.categoryBits = 1;
b2FilterData.prototype.maskBits = 65535;
b2FilterData.prototype.groupIndex = 0;var b2AABB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2AABB.prototype.__constructor = function() {
};
b2AABB.prototype.__varz = function() {
  this.lowerBound = new b2Vec2;
  this.upperBound = new b2Vec2
};
b2AABB.Combine = function(aabb1, aabb2) {
  var aabb = new b2AABB;
  aabb.Combine(aabb1, aabb2);
  return aabb
};
b2AABB.prototype.IsValid = function() {
  var dX = this.upperBound.x - this.lowerBound.x;
  var dY = this.upperBound.y - this.lowerBound.y;
  var valid = dX >= 0 && dY >= 0;
  valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
  return valid
};
b2AABB.prototype.GetCenter = function() {
  return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
b2AABB.prototype.GetExtents = function() {
  return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
b2AABB.prototype.Contains = function(aabb) {
  var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
  return result
};
b2AABB.prototype.RayCast = function(output, input) {
  var tmin = -Number.MAX_VALUE;
  var tmax = Number.MAX_VALUE;
  var pX = input.p1.x;
  var pY = input.p1.y;
  var dX = input.p2.x - input.p1.x;
  var dY = input.p2.y - input.p1.y;
  var absDX = Math.abs(dX);
  var absDY = Math.abs(dY);
  var normal = output.normal;
  var inv_d;
  var t1;
  var t2;
  var t3;
  var s;
  if(absDX < Number.MIN_VALUE) {
    if(pX < this.lowerBound.x || this.upperBound.x < pX) {
      return false
    }
  }else {
    inv_d = 1 / dX;
    t1 = (this.lowerBound.x - pX) * inv_d;
    t2 = (this.upperBound.x - pX) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.x = s;
      normal.y = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  if(absDY < Number.MIN_VALUE) {
    if(pY < this.lowerBound.y || this.upperBound.y < pY) {
      return false
    }
  }else {
    inv_d = 1 / dY;
    t1 = (this.lowerBound.y - pY) * inv_d;
    t2 = (this.upperBound.y - pY) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.y = s;
      normal.x = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  output.fraction = tmin;
  return true
};
b2AABB.prototype.TestOverlap = function(other) {
  var d1X = other.lowerBound.x - this.upperBound.x;
  var d1Y = other.lowerBound.y - this.upperBound.y;
  var d2X = this.lowerBound.x - other.upperBound.x;
  var d2Y = this.lowerBound.y - other.upperBound.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2AABB.prototype.Combine = function(aabb1, aabb2) {
  this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
  this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
  this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
  this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y)
};
b2AABB.prototype.lowerBound = new b2Vec2;
b2AABB.prototype.upperBound = new b2Vec2;var b2Jacobian = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Jacobian.prototype.__constructor = function() {
};
b2Jacobian.prototype.__varz = function() {
  this.linearA = new b2Vec2;
  this.linearB = new b2Vec2
};
b2Jacobian.prototype.SetZero = function() {
  this.linearA.SetZero();
  this.angularA = 0;
  this.linearB.SetZero();
  this.angularB = 0
};
b2Jacobian.prototype.Set = function(x1, a1, x2, a2) {
  this.linearA.SetV(x1);
  this.angularA = a1;
  this.linearB.SetV(x2);
  this.angularB = a2
};
b2Jacobian.prototype.Compute = function(x1, a1, x2, a2) {
  return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2
};
b2Jacobian.prototype.linearA = new b2Vec2;
b2Jacobian.prototype.angularA = null;
b2Jacobian.prototype.linearB = new b2Vec2;
b2Jacobian.prototype.angularB = null;var b2Bound = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Bound.prototype.__constructor = function() {
};
b2Bound.prototype.__varz = function() {
};
b2Bound.prototype.IsLower = function() {
  return(this.value & 1) == 0
};
b2Bound.prototype.IsUpper = function() {
  return(this.value & 1) == 1
};
b2Bound.prototype.Swap = function(b) {
  var tempValue = this.value;
  var tempProxy = this.proxy;
  var tempStabbingCount = this.stabbingCount;
  this.value = b.value;
  this.proxy = b.proxy;
  this.stabbingCount = b.stabbingCount;
  b.value = tempValue;
  b.proxy = tempProxy;
  b.stabbingCount = tempStabbingCount
};
b2Bound.prototype.value = 0;
b2Bound.prototype.proxy = null;
b2Bound.prototype.stabbingCount = 0;var b2SimplexVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexVertex.prototype.__constructor = function() {
};
b2SimplexVertex.prototype.__varz = function() {
};
b2SimplexVertex.prototype.Set = function(other) {
  this.wA.SetV(other.wA);
  this.wB.SetV(other.wB);
  this.w.SetV(other.w);
  this.a = other.a;
  this.indexA = other.indexA;
  this.indexB = other.indexB
};
b2SimplexVertex.prototype.wA = null;
b2SimplexVertex.prototype.wB = null;
b2SimplexVertex.prototype.w = null;
b2SimplexVertex.prototype.a = null;
b2SimplexVertex.prototype.indexA = 0;
b2SimplexVertex.prototype.indexB = 0;var b2Mat22 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat22.prototype.__constructor = function() {
  this.col1.x = this.col2.y = 1
};
b2Mat22.prototype.__varz = function() {
  this.col1 = new b2Vec2;
  this.col2 = new b2Vec2
};
b2Mat22.FromAngle = function(angle) {
  var mat = new b2Mat22;
  mat.Set(angle);
  return mat
};
b2Mat22.FromVV = function(c1, c2) {
  var mat = new b2Mat22;
  mat.SetVV(c1, c2);
  return mat
};
b2Mat22.prototype.Set = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c
};
b2Mat22.prototype.SetVV = function(c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2)
};
b2Mat22.prototype.Copy = function() {
  var mat = new b2Mat22;
  mat.SetM(this);
  return mat
};
b2Mat22.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2)
};
b2Mat22.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y
};
b2Mat22.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 1
};
b2Mat22.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 0
};
b2Mat22.prototype.GetAngle = function() {
  return Math.atan2(this.col1.y, this.col1.x)
};
b2Mat22.prototype.GetInverse = function(out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  var det = a * d - b * c;
  if(det != 0) {
    det = 1 / det
  }
  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out
};
b2Mat22.prototype.Solve = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat22.prototype.Abs = function() {
  this.col1.Abs();
  this.col2.Abs()
};
b2Mat22.prototype.col1 = new b2Vec2;
b2Mat22.prototype.col2 = new b2Vec2;var b2SimplexCache = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexCache.prototype.__constructor = function() {
};
b2SimplexCache.prototype.__varz = function() {
  this.indexA = new Array(3);
  this.indexB = new Array(3)
};
b2SimplexCache.prototype.metric = null;
b2SimplexCache.prototype.count = 0;
b2SimplexCache.prototype.indexA = new Array(3);
b2SimplexCache.prototype.indexB = new Array(3);var b2Shape = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Shape.prototype.__constructor = function() {
  this.m_type = b2Shape.e_unknownShape;
  this.m_radius = b2Settings.b2_linearSlop
};
b2Shape.prototype.__varz = function() {
};
b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
  var input = new b2DistanceInput;
  input.proxyA = new b2DistanceProxy;
  input.proxyA.Set(shape1);
  input.proxyB = new b2DistanceProxy;
  input.proxyB.Set(shape2);
  input.transformA = transform1;
  input.transformB = transform2;
  input.useRadii = true;
  var simplexCache = new b2SimplexCache;
  simplexCache.count = 0;
  var output = new b2DistanceOutput;
  b2Distance.Distance(output, simplexCache, input);
  return output.distance < 10 * Number.MIN_VALUE
};
b2Shape.e_hitCollide = 1;
b2Shape.e_missCollide = 0;
b2Shape.e_startsInsideCollide = -1;
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_polygonShape = 1;
b2Shape.e_edgeShape = 2;
b2Shape.e_shapeTypeCount = 3;
b2Shape.prototype.Copy = function() {
  return null
};
b2Shape.prototype.Set = function(other) {
  this.m_radius = other.m_radius
};
b2Shape.prototype.GetType = function() {
  return this.m_type
};
b2Shape.prototype.TestPoint = function(xf, p) {
  return false
};
b2Shape.prototype.RayCast = function(output, input, transform) {
  return false
};
b2Shape.prototype.ComputeAABB = function(aabb, xf) {
};
b2Shape.prototype.ComputeMass = function(massData, density) {
};
b2Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  return 0
};
b2Shape.prototype.m_type = 0;
b2Shape.prototype.m_radius = null;var b2Segment = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Segment.prototype.__constructor = function() {
};
b2Segment.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
  var s = segment.p1;
  var rX = segment.p2.x - s.x;
  var rY = segment.p2.y - s.y;
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var nX = dY;
  var nY = -dX;
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = s.x - this.p1.x;
    var bY = s.y - this.p1.y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= maxLambda * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        nX /= nLen;
        nY /= nLen;
        lambda[0] = a;
        normal.Set(nX, nY);
        return true
      }
    }
  }
  return false
};
b2Segment.prototype.Extend = function(aabb) {
  this.ExtendForward(aabb);
  this.ExtendBackward(aabb)
};
b2Segment.prototype.ExtendForward = function(aabb) {
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
  this.p2.x = this.p1.x + dX * lambda;
  this.p2.y = this.p1.y + dY * lambda
};
b2Segment.prototype.ExtendBackward = function(aabb) {
  var dX = -this.p2.x + this.p1.x;
  var dY = -this.p2.y + this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
  this.p1.x = this.p2.x + dX * lambda;
  this.p1.y = this.p2.y + dY * lambda
};
b2Segment.prototype.p1 = new b2Vec2;
b2Segment.prototype.p2 = new b2Vec2;var b2ContactRegister = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactRegister.prototype.__constructor = function() {
};
b2ContactRegister.prototype.__varz = function() {
};
b2ContactRegister.prototype.createFcn = null;
b2ContactRegister.prototype.destroyFcn = null;
b2ContactRegister.prototype.primary = null;
b2ContactRegister.prototype.pool = null;
b2ContactRegister.prototype.poolCount = 0;var b2DebugDraw = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DebugDraw.prototype.__constructor = function() {
  this.m_drawFlags = 0
};
b2DebugDraw.prototype.__varz = function() {
};
b2DebugDraw.e_shapeBit = 1;
b2DebugDraw.e_jointBit = 2;
b2DebugDraw.e_aabbBit = 4;
b2DebugDraw.e_pairBit = 8;
b2DebugDraw.e_centerOfMassBit = 16;
b2DebugDraw.e_controllerBit = 32;
b2DebugDraw.prototype.SetFlags = function(flags) {
  this.m_drawFlags = flags
};
b2DebugDraw.prototype.GetFlags = function() {
  return this.m_drawFlags
};
b2DebugDraw.prototype.AppendFlags = function(flags) {
  this.m_drawFlags |= flags
};
b2DebugDraw.prototype.ClearFlags = function(flags) {
  this.m_drawFlags &= ~flags
};
b2DebugDraw.prototype.SetSprite = function(sprite) {
  this.m_sprite = sprite
};
b2DebugDraw.prototype.GetSprite = function() {
  return this.m_sprite
};
b2DebugDraw.prototype.SetDrawScale = function(drawScale) {
  this.m_drawScale = drawScale
};
b2DebugDraw.prototype.GetDrawScale = function() {
  return this.m_drawScale
};
b2DebugDraw.prototype.SetLineThickness = function(lineThickness) {
  this.m_lineThickness = lineThickness
};
b2DebugDraw.prototype.GetLineThickness = function() {
  return this.m_lineThickness
};
b2DebugDraw.prototype.SetAlpha = function(alpha) {
  this.m_alpha = alpha
};
b2DebugDraw.prototype.GetAlpha = function() {
  return this.m_alpha
};
b2DebugDraw.prototype.SetFillAlpha = function(alpha) {
  this.m_fillAlpha = alpha
};
b2DebugDraw.prototype.GetFillAlpha = function() {
  return this.m_fillAlpha
};
b2DebugDraw.prototype.SetXFormScale = function(xformScale) {
  this.m_xformScale = xformScale
};
b2DebugDraw.prototype.GetXFormScale = function() {
  return this.m_xformScale
};
b2DebugDraw.prototype.Clear = function() {
  this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height)
};
b2DebugDraw.prototype.Y = function(y) {
  return this.m_sprite.canvas.height - y
};
b2DebugDraw.prototype.ToWorldPoint = function(localPoint) {
  return new b2Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale)
};
b2DebugDraw.prototype.ColorStyle = function(color, alpha) {
  return"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")"
};
b2DebugDraw.prototype.DrawPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale)
  }
  this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale))
  }
  this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawCircle = function(center, radius, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidCircle = function(center, radius, axis, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, Math.PI * 2, true);
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawSegment = function(p1, p2, color) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
  this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawTransform = function(xf) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(255, 0, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(0, 255, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.m_drawFlags = 0;
b2DebugDraw.prototype.m_sprite = null;
b2DebugDraw.prototype.m_drawScale = 1;
b2DebugDraw.prototype.m_lineThickness = 1;
b2DebugDraw.prototype.m_alpha = 1;
b2DebugDraw.prototype.m_fillAlpha = 1;
b2DebugDraw.prototype.m_xformScale = 1;var b2Sweep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Sweep.prototype.__constructor = function() {
};
b2Sweep.prototype.__varz = function() {
  this.localCenter = new b2Vec2;
  this.c0 = new b2Vec2;
  this.c = new b2Vec2
};
b2Sweep.prototype.Set = function(other) {
  this.localCenter.SetV(other.localCenter);
  this.c0.SetV(other.c0);
  this.c.SetV(other.c);
  this.a0 = other.a0;
  this.a = other.a;
  this.t0 = other.t0
};
b2Sweep.prototype.Copy = function() {
  var copy = new b2Sweep;
  copy.localCenter.SetV(this.localCenter);
  copy.c0.SetV(this.c0);
  copy.c.SetV(this.c);
  copy.a0 = this.a0;
  copy.a = this.a;
  copy.t0 = this.t0;
  return copy
};
b2Sweep.prototype.GetTransform = function(xf, alpha) {
  xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
  xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
  var angle = (1 - alpha) * this.a0 + alpha * this.a;
  xf.R.Set(angle);
  var tMat = xf.R;
  xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
  xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y
};
b2Sweep.prototype.Advance = function(t) {
  if(this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
    var alpha = (t - this.t0) / (1 - this.t0);
    this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
    this.t0 = t
  }
};
b2Sweep.prototype.localCenter = new b2Vec2;
b2Sweep.prototype.c0 = new b2Vec2;
b2Sweep.prototype.c = new b2Vec2;
b2Sweep.prototype.a0 = null;
b2Sweep.prototype.a = null;
b2Sweep.prototype.t0 = null;var b2DistanceOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceOutput.prototype.__constructor = function() {
};
b2DistanceOutput.prototype.__varz = function() {
  this.pointA = new b2Vec2;
  this.pointB = new b2Vec2
};
b2DistanceOutput.prototype.pointA = new b2Vec2;
b2DistanceOutput.prototype.pointB = new b2Vec2;
b2DistanceOutput.prototype.distance = null;
b2DistanceOutput.prototype.iterations = 0;var b2Mat33 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat33.prototype.__constructor = function(c1, c2, c3) {
  if(!c1 && !c2 && !c3) {
    this.col1.SetZero();
    this.col2.SetZero();
    this.col3.SetZero()
  }else {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3)
  }
};
b2Mat33.prototype.__varz = function() {
  this.col1 = new b2Vec3;
  this.col2 = new b2Vec3;
  this.col3 = new b2Vec3
};
b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
  this.col3.SetV(c3)
};
b2Mat33.prototype.Copy = function() {
  return new b2Mat33(this.col1, this.col2, this.col3)
};
b2Mat33.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
  this.col3.SetV(m.col3)
};
b2Mat33.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col1.z += m.col1.z;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
  this.col2.z += m.col2.z;
  this.col3.x += m.col3.x;
  this.col3.y += m.col3.y;
  this.col3.z += m.col3.z
};
b2Mat33.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 1
};
b2Mat33.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 0
};
b2Mat33.prototype.Solve22 = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
  var a11 = this.col1.x;
  var a21 = this.col1.y;
  var a31 = this.col1.z;
  var a12 = this.col2.x;
  var a22 = this.col2.y;
  var a32 = this.col2.z;
  var a13 = this.col3.x;
  var a23 = this.col3.y;
  var a33 = this.col3.z;
  var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
  out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
  out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
  return out
};
b2Mat33.prototype.col1 = new b2Vec3;
b2Mat33.prototype.col2 = new b2Vec3;
b2Mat33.prototype.col3 = new b2Vec3;var b2PositionSolverManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PositionSolverManifold.prototype.__constructor = function() {
  this.m_normal = new b2Vec2;
  this.m_separations = new Array(b2Settings.b2_maxManifoldPoints);
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2PositionSolverManifold.prototype.__varz = function() {
};
b2PositionSolverManifold.circlePointA = new b2Vec2;
b2PositionSolverManifold.circlePointB = new b2Vec2;
b2PositionSolverManifold.prototype.Initialize = function(cc) {
  b2Settings.b2Assert(cc.pointCount > 0);
  var i = 0;
  var clipPointX;
  var clipPointY;
  var tMat;
  var tVec;
  var planePointX;
  var planePointY;
  switch(cc.type) {
    case b2Manifold.e_circles:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.points[0].localPoint;
      var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      this.m_points[0].x = 0.5 * (pointAX + pointBX);
      this.m_points[0].y = 0.5 * (pointAY + pointBY);
      this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
      break;
    case b2Manifold.e_faceA:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyA.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY)
      }
      this.m_normal.x *= -1;
      this.m_normal.y *= -1;
      break
  }
};
b2PositionSolverManifold.prototype.m_normal = null;
b2PositionSolverManifold.prototype.m_points = null;
b2PositionSolverManifold.prototype.m_separations = null;var b2OBB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2OBB.prototype.__constructor = function() {
};
b2OBB.prototype.__varz = function() {
  this.R = new b2Mat22;
  this.center = new b2Vec2;
  this.extents = new b2Vec2
};
b2OBB.prototype.R = new b2Mat22;
b2OBB.prototype.center = new b2Vec2;
b2OBB.prototype.extents = new b2Vec2;var b2Pair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Pair.prototype.__constructor = function() {
};
b2Pair.prototype.__varz = function() {
};
b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.e_pairBuffered = 1;
b2Pair.e_pairRemoved = 2;
b2Pair.e_pairFinal = 4;
b2Pair.prototype.SetBuffered = function() {
  this.status |= b2Pair.e_pairBuffered
};
b2Pair.prototype.ClearBuffered = function() {
  this.status &= ~b2Pair.e_pairBuffered
};
b2Pair.prototype.IsBuffered = function() {
  return(this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered
};
b2Pair.prototype.SetRemoved = function() {
  this.status |= b2Pair.e_pairRemoved
};
b2Pair.prototype.ClearRemoved = function() {
  this.status &= ~b2Pair.e_pairRemoved
};
b2Pair.prototype.IsRemoved = function() {
  return(this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved
};
b2Pair.prototype.SetFinal = function() {
  this.status |= b2Pair.e_pairFinal
};
b2Pair.prototype.IsFinal = function() {
  return(this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal
};
b2Pair.prototype.userData = null;
b2Pair.prototype.proxy1 = null;
b2Pair.prototype.proxy2 = null;
b2Pair.prototype.next = null;
b2Pair.prototype.status = 0;var b2FixtureDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FixtureDef.prototype.__constructor = function() {
  this.shape = null;
  this.userData = null;
  this.friction = 0.2;
  this.restitution = 0;
  this.density = 0;
  this.filter.categoryBits = 1;
  this.filter.maskBits = 65535;
  this.filter.groupIndex = 0;
  this.isSensor = false
};
b2FixtureDef.prototype.__varz = function() {
  this.filter = new b2FilterData
};
b2FixtureDef.prototype.shape = null;
b2FixtureDef.prototype.userData = null;
b2FixtureDef.prototype.friction = null;
b2FixtureDef.prototype.restitution = null;
b2FixtureDef.prototype.density = null;
b2FixtureDef.prototype.isSensor = null;
b2FixtureDef.prototype.filter = new b2FilterData;var b2ContactID = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactID.prototype.__constructor = function() {
  this.features._m_id = this
};
b2ContactID.prototype.__varz = function() {
  this.features = new Features
};
b2ContactID.prototype.Set = function(id) {
  key = id._key
};
b2ContactID.prototype.Copy = function() {
  var id = new b2ContactID;
  id.key = key;
  return id
};
b2ContactID.prototype.__defineSetter__("key", function() {
  return this._key
});
b2ContactID.prototype.__defineSetter__("key", function(value) {
  this._key = value;
  this.features._referenceEdge = this._key & 255;
  this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
  this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
  this.features._flip = (this._key & 4278190080) >> 24 & 255
});
b2ContactID.prototype._key = 0;
b2ContactID.prototype.features = new Features;var b2Transform = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Transform.prototype.__constructor = function(pos, r) {
  if(pos) {
    this.position.SetV(pos);
    this.R.SetM(r)
  }
};
b2Transform.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.R = new b2Mat22
};
b2Transform.prototype.Initialize = function(pos, r) {
  this.position.SetV(pos);
  this.R.SetM(r)
};
b2Transform.prototype.SetIdentity = function() {
  this.position.SetZero();
  this.R.SetIdentity()
};
b2Transform.prototype.Set = function(x) {
  this.position.SetV(x.position);
  this.R.SetM(x.R)
};
b2Transform.prototype.GetAngle = function() {
  return Math.atan2(this.R.col1.y, this.R.col1.x)
};
b2Transform.prototype.position = new b2Vec2;
b2Transform.prototype.R = new b2Mat22;var b2EdgeShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeShape.prototype, b2Shape.prototype);
b2EdgeShape.prototype._super = b2Shape.prototype;
b2EdgeShape.prototype.__constructor = function(v1, v2) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_edgeShape;
  this.m_prevEdge = null;
  this.m_nextEdge = null;
  this.m_v1 = v1;
  this.m_v2 = v2;
  this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
  this.m_length = this.m_direction.Normalize();
  this.m_normal.Set(this.m_direction.y, -this.m_direction.x);
  this.m_coreV1.Set(-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
  this.m_coreV2.Set(-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
  this.m_cornerDir1 = this.m_normal;
  this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y)
};
b2EdgeShape.prototype.__varz = function() {
  this.s_supportVec = new b2Vec2;
  this.m_v1 = new b2Vec2;
  this.m_v2 = new b2Vec2;
  this.m_coreV1 = new b2Vec2;
  this.m_coreV2 = new b2Vec2;
  this.m_normal = new b2Vec2;
  this.m_direction = new b2Vec2;
  this.m_cornerDir1 = new b2Vec2;
  this.m_cornerDir2 = new b2Vec2
};
b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
  this.m_prevEdge = edge;
  this.m_coreV1 = core;
  this.m_cornerDir1 = cornerDir;
  this.m_cornerConvex1 = convex
};
b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
  this.m_nextEdge = edge;
  this.m_coreV2 = core;
  this.m_cornerDir2 = cornerDir;
  this.m_cornerConvex2 = convex
};
b2EdgeShape.prototype.TestPoint = function(transform, p) {
  return false
};
b2EdgeShape.prototype.RayCast = function(output, input, transform) {
  var tMat;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
  var nY = -(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = input.p1.x - v1X;
    var bY = input.p1.y - v1Y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= input.maxFraction * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        output.fraction = a;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        output.normal.x = nX / nLen;
        output.normal.y = nY / nLen;
        return true
      }
    }
  }
  return false
};
b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
  var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
  if(v1X < v2X) {
    aabb.lowerBound.x = v1X;
    aabb.upperBound.x = v2X
  }else {
    aabb.lowerBound.x = v2X;
    aabb.upperBound.x = v1X
  }
  if(v1Y < v2Y) {
    aabb.lowerBound.y = v1Y;
    aabb.upperBound.y = v2Y
  }else {
    aabb.lowerBound.y = v2Y;
    aabb.upperBound.y = v1Y
  }
};
b2EdgeShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  massData.center.SetV(this.m_v1);
  massData.I = 0
};
b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var v0 = new b2Vec2(normal.x * offset, normal.y * offset);
  var v1 = b2Math.MulX(xf, this.m_v1);
  var v2 = b2Math.MulX(xf, this.m_v2);
  var d1 = b2Math.Dot(normal, v1) - offset;
  var d2 = b2Math.Dot(normal, v2) - offset;
  if(d1 > 0) {
    if(d2 > 0) {
      return 0
    }else {
      v1.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v1.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }
  }else {
    if(d2 > 0) {
      v2.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v2.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }else {
    }
  }
  c.x = (v0.x + v1.x + v2.x) / 3;
  c.y = (v0.y + v1.y + v2.y) / 3;
  return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x))
};
b2EdgeShape.prototype.GetLength = function() {
  return this.m_length
};
b2EdgeShape.prototype.GetVertex1 = function() {
  return this.m_v1
};
b2EdgeShape.prototype.GetVertex2 = function() {
  return this.m_v2
};
b2EdgeShape.prototype.GetCoreVertex1 = function() {
  return this.m_coreV1
};
b2EdgeShape.prototype.GetCoreVertex2 = function() {
  return this.m_coreV2
};
b2EdgeShape.prototype.GetNormalVector = function() {
  return this.m_normal
};
b2EdgeShape.prototype.GetDirectionVector = function() {
  return this.m_direction
};
b2EdgeShape.prototype.GetCorner1Vector = function() {
  return this.m_cornerDir1
};
b2EdgeShape.prototype.GetCorner2Vector = function() {
  return this.m_cornerDir2
};
b2EdgeShape.prototype.Corner1IsConvex = function() {
  return this.m_cornerConvex1
};
b2EdgeShape.prototype.Corner2IsConvex = function() {
  return this.m_cornerConvex2
};
b2EdgeShape.prototype.GetFirstVertex = function(xf) {
  var tMat = xf.R;
  return new b2Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y))
};
b2EdgeShape.prototype.GetNextEdge = function() {
  return this.m_nextEdge
};
b2EdgeShape.prototype.GetPrevEdge = function() {
  return this.m_prevEdge
};
b2EdgeShape.prototype.Support = function(xf, dX, dY) {
  var tMat = xf.R;
  var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
  var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
  var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
  var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
  if(v1X * dX + v1Y * dY > v2X * dX + v2Y * dY) {
    this.s_supportVec.x = v1X;
    this.s_supportVec.y = v1Y
  }else {
    this.s_supportVec.x = v2X;
    this.s_supportVec.y = v2Y
  }
  return this.s_supportVec
};
b2EdgeShape.prototype.s_supportVec = new b2Vec2;
b2EdgeShape.prototype.m_v1 = new b2Vec2;
b2EdgeShape.prototype.m_v2 = new b2Vec2;
b2EdgeShape.prototype.m_coreV1 = new b2Vec2;
b2EdgeShape.prototype.m_coreV2 = new b2Vec2;
b2EdgeShape.prototype.m_length = null;
b2EdgeShape.prototype.m_normal = new b2Vec2;
b2EdgeShape.prototype.m_direction = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir1 = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir2 = new b2Vec2;
b2EdgeShape.prototype.m_cornerConvex1 = null;
b2EdgeShape.prototype.m_cornerConvex2 = null;
b2EdgeShape.prototype.m_nextEdge = null;
b2EdgeShape.prototype.m_prevEdge = null;var b2BuoyancyController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2BuoyancyController.prototype, b2Controller.prototype);
b2BuoyancyController.prototype._super = b2Controller.prototype;
b2BuoyancyController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2BuoyancyController.prototype.__varz = function() {
  this.normal = new b2Vec2(0, -1);
  this.velocity = new b2Vec2(0, 0)
};
b2BuoyancyController.prototype.Step = function(step) {
  if(!m_bodyList) {
    return
  }
  if(this.useWorldGravity) {
    this.gravity = this.GetWorld().GetGravity().Copy()
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(body.IsAwake() == false) {
      continue
    }
    var areac = new b2Vec2;
    var massc = new b2Vec2;
    var area = 0;
    var mass = 0;
    for(var fixture = body.GetFixtureList();fixture;fixture = fixture.GetNext()) {
      var sc = new b2Vec2;
      var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
      area += sarea;
      areac.x += sarea * sc.x;
      areac.y += sarea * sc.y;
      var shapeDensity;
      if(this.useDensity) {
        shapeDensity = 1
      }else {
        shapeDensity = 1
      }
      mass += sarea * shapeDensity;
      massc.x += sarea * sc.x * shapeDensity;
      massc.y += sarea * sc.y * shapeDensity
    }
    areac.x /= area;
    areac.y /= area;
    massc.x /= mass;
    massc.y /= mass;
    if(area < Number.MIN_VALUE) {
      continue
    }
    var buoyancyForce = this.gravity.GetNegative();
    buoyancyForce.Multiply(this.density * area);
    body.ApplyForce(buoyancyForce, massc);
    var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
    dragForce.Subtract(this.velocity);
    dragForce.Multiply(-this.linearDrag * area);
    body.ApplyForce(dragForce, areac);
    body.ApplyTorque(-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag)
  }
};
b2BuoyancyController.prototype.Draw = function(debugDraw) {
  var r = 1E3;
  var p1 = new b2Vec2;
  var p2 = new b2Vec2;
  p1.x = this.normal.x * this.offset + this.normal.y * r;
  p1.y = this.normal.y * this.offset - this.normal.x * r;
  p2.x = this.normal.x * this.offset - this.normal.y * r;
  p2.y = this.normal.y * this.offset + this.normal.x * r;
  var color = new b2Color(0, 0, 1);
  debugDraw.DrawSegment(p1, p2, color)
};
b2BuoyancyController.prototype.normal = new b2Vec2(0, -1);
b2BuoyancyController.prototype.offset = 0;
b2BuoyancyController.prototype.density = 0;
b2BuoyancyController.prototype.velocity = new b2Vec2(0, 0);
b2BuoyancyController.prototype.linearDrag = 2;
b2BuoyancyController.prototype.angularDrag = 1;
b2BuoyancyController.prototype.useDensity = false;
b2BuoyancyController.prototype.useWorldGravity = true;
b2BuoyancyController.prototype.gravity = null;var b2Body = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Body.prototype.__constructor = function(bd, world) {
  this.m_flags = 0;
  if(bd.bullet) {
    this.m_flags |= b2Body.e_bulletFlag
  }
  if(bd.fixedRotation) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }
  if(bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }
  if(bd.awake) {
    this.m_flags |= b2Body.e_awakeFlag
  }
  if(bd.active) {
    this.m_flags |= b2Body.e_activeFlag
  }
  this.m_world = world;
  this.m_xf.position.SetV(bd.position);
  this.m_xf.R.Set(bd.angle);
  this.m_sweep.localCenter.SetZero();
  this.m_sweep.t0 = 1;
  this.m_sweep.a0 = this.m_sweep.a = bd.angle;
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_contactList = null;
  this.m_controllerCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_linearVelocity.SetV(bd.linearVelocity);
  this.m_angularVelocity = bd.angularVelocity;
  this.m_linearDamping = bd.linearDamping;
  this.m_angularDamping = bd.angularDamping;
  this.m_force.Set(0, 0);
  this.m_torque = 0;
  this.m_sleepTime = 0;
  this.m_type = bd.type;
  if(this.m_type == b2Body.b2_dynamicBody) {
    this.m_mass = 1;
    this.m_invMass = 1
  }else {
    this.m_mass = 0;
    this.m_invMass = 0
  }
  this.m_I = 0;
  this.m_invI = 0;
  this.m_inertiaScale = bd.inertiaScale;
  this.m_userData = bd.userData;
  this.m_fixtureList = null;
  this.m_fixtureCount = 0
};
b2Body.prototype.__varz = function() {
  this.m_xf = new b2Transform;
  this.m_sweep = new b2Sweep;
  this.m_linearVelocity = new b2Vec2;
  this.m_force = new b2Vec2
};
b2Body.b2_staticBody = 0;
b2Body.b2_kinematicBody = 1;
b2Body.b2_dynamicBody = 2;
b2Body.s_xf1 = new b2Transform;
b2Body.e_islandFlag = 1;
b2Body.e_awakeFlag = 2;
b2Body.e_allowSleepFlag = 4;
b2Body.e_bulletFlag = 8;
b2Body.e_fixedRotationFlag = 16;
b2Body.e_activeFlag = 32;
b2Body.prototype.connectEdges = function(s1, s2, angle1) {
  var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
  var coreOffset = Math.tan((angle2 - angle1) * 0.5);
  var core = b2Math.MulFV(coreOffset, s2.GetDirectionVector());
  core = b2Math.SubtractVV(core, s2.GetNormalVector());
  core = b2Math.MulFV(b2Settings.b2_toiSlop, core);
  core = b2Math.AddVV(core, s2.GetVertex1());
  var cornerDir = b2Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
  cornerDir.Normalize();
  var convex = b2Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
  s1.SetNextEdge(s2, core, cornerDir, convex);
  s2.SetPrevEdge(s1, core, cornerDir, convex);
  return angle2
};
b2Body.prototype.SynchronizeFixtures = function() {
  var xf1 = b2Body.s_xf1;
  xf1.R.Set(this.m_sweep.a0);
  var tMat = xf1.R;
  var tVec = this.m_sweep.localCenter;
  xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var f;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, xf1, this.m_xf)
  }
};
b2Body.prototype.SynchronizeTransform = function() {
  this.m_xf.R.Set(this.m_sweep.a);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y)
};
b2Body.prototype.ShouldCollide = function(other) {
  if(this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
    return false
  }
  for(var jn = this.m_jointList;jn;jn = jn.next) {
    if(jn.other == other) {
      if(jn.joint.m_collideConnected == false) {
        return false
      }
    }
  }
  return true
};
b2Body.prototype.Advance = function(t) {
  this.m_sweep.Advance(t);
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_sweep.a = this.m_sweep.a0;
  this.SynchronizeTransform()
};
b2Body.prototype.CreateFixture = function(def) {
  if(this.m_world.IsLocked() == true) {
    return null
  }
  var fixture = new b2Fixture;
  fixture.Create(this, this.m_xf, def);
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.CreateProxy(broadPhase, this.m_xf)
  }
  fixture.m_next = this.m_fixtureList;
  this.m_fixtureList = fixture;
  ++this.m_fixtureCount;
  fixture.m_body = this;
  if(fixture.m_density > 0) {
    this.ResetMassData()
  }
  this.m_world.m_flags |= b2World.e_newFixture;
  return fixture
};
b2Body.prototype.CreateFixture2 = function(shape, density) {
  var def = new b2FixtureDef;
  def.shape = shape;
  def.density = density;
  return this.CreateFixture(def)
};
b2Body.prototype.DestroyFixture = function(fixture) {
  if(this.m_world.IsLocked() == true) {
    return
  }
  var node = this.m_fixtureList;
  var ppF = null;
  var found = false;
  while(node != null) {
    if(node == fixture) {
      if(ppF) {
        ppF.m_next = fixture.m_next
      }else {
        this.m_fixtureList = fixture.m_next
      }
      found = true;
      break
    }
    ppF = node;
    node = node.m_next
  }
  var edge = this.m_contactList;
  while(edge) {
    var c = edge.contact;
    edge = edge.next;
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    if(fixture == fixtureA || fixture == fixtureB) {
      this.m_world.m_contactManager.Destroy(c)
    }
  }
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.DestroyProxy(broadPhase)
  }else {
  }
  fixture.Destroy();
  fixture.m_body = null;
  fixture.m_next = null;
  --this.m_fixtureCount;
  this.ResetMassData()
};
b2Body.prototype.SetPositionAndAngle = function(position, angle) {
  var f;
  if(this.m_world.IsLocked() == true) {
    return
  }
  this.m_xf.R.Set(angle);
  this.m_xf.position.SetV(position);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_sweep.a0 = this.m_sweep.a = angle;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, this.m_xf, this.m_xf)
  }
  this.m_world.m_contactManager.FindNewContacts()
};
b2Body.prototype.SetTransform = function(xf) {
  this.SetPositionAndAngle(xf.position, xf.GetAngle())
};
b2Body.prototype.GetTransform = function() {
  return this.m_xf
};
b2Body.prototype.GetPosition = function() {
  return this.m_xf.position
};
b2Body.prototype.SetPosition = function(position) {
  this.SetPositionAndAngle(position, this.GetAngle())
};
b2Body.prototype.GetAngle = function() {
  return this.m_sweep.a
};
b2Body.prototype.SetAngle = function(angle) {
  this.SetPositionAndAngle(this.GetPosition(), angle)
};
b2Body.prototype.GetWorldCenter = function() {
  return this.m_sweep.c
};
b2Body.prototype.GetLocalCenter = function() {
  return this.m_sweep.localCenter
};
b2Body.prototype.SetLinearVelocity = function(v) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_linearVelocity.SetV(v)
};
b2Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity
};
b2Body.prototype.SetAngularVelocity = function(omega) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_angularVelocity = omega
};
b2Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity
};
b2Body.prototype.GetDefinition = function() {
  var bd = new b2BodyDef;
  bd.type = this.GetType();
  bd.allowSleep = (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
  bd.angle = this.GetAngle();
  bd.angularDamping = this.m_angularDamping;
  bd.angularVelocity = this.m_angularVelocity;
  bd.fixedRotation = (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
  bd.bullet = (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
  bd.awake = (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
  bd.linearDamping = this.m_linearDamping;
  bd.linearVelocity.SetV(this.GetLinearVelocity());
  bd.position = this.GetPosition();
  bd.userData = this.GetUserData();
  return bd
};
b2Body.prototype.ApplyForce = function(force, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_force.x += force.x;
  this.m_force.y += force.y;
  this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x
};
b2Body.prototype.ApplyTorque = function(torque) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_torque += torque
};
b2Body.prototype.ApplyImpulse = function(impulse, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_linearVelocity.x += this.m_invMass * impulse.x;
  this.m_linearVelocity.y += this.m_invMass * impulse.y;
  this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x)
};
b2Body.prototype.Split = function(callback) {
  var linearVelocity = this.GetLinearVelocity().Copy();
  var angularVelocity = this.GetAngularVelocity();
  var center = this.GetWorldCenter();
  var body1 = this;
  var body2 = this.m_world.CreateBody(this.GetDefinition());
  var prev;
  for(var f = body1.m_fixtureList;f;) {
    if(callback(f)) {
      var next = f.m_next;
      if(prev) {
        prev.m_next = next
      }else {
        body1.m_fixtureList = next
      }
      body1.m_fixtureCount--;
      f.m_next = body2.m_fixtureList;
      body2.m_fixtureList = f;
      body2.m_fixtureCount++;
      f.m_body = body2;
      f = next
    }else {
      prev = f;
      f = f.m_next
    }
  }
  body1.ResetMassData();
  body2.ResetMassData();
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center1, center)));
  var velocity2 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center2, center)));
  body1.SetLinearVelocity(velocity1);
  body2.SetLinearVelocity(velocity2);
  body1.SetAngularVelocity(angularVelocity);
  body2.SetAngularVelocity(angularVelocity);
  body1.SynchronizeFixtures();
  body2.SynchronizeFixtures();
  return body2
};
b2Body.prototype.Merge = function(other) {
  var f;
  for(f = other.m_fixtureList;f;) {
    var next = f.m_next;
    other.m_fixtureCount--;
    f.m_next = this.m_fixtureList;
    this.m_fixtureList = f;
    this.m_fixtureCount++;
    f.m_body = body2;
    f = next
  }
  body1.m_fixtureCount = 0;
  var body1 = this;
  var body2 = other;
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = body1.GetLinearVelocity().Copy();
  var velocity2 = body2.GetLinearVelocity().Copy();
  var angular1 = body1.GetAngularVelocity();
  var angular = body2.GetAngularVelocity();
  body1.ResetMassData();
  this.SynchronizeFixtures()
};
b2Body.prototype.GetMass = function() {
  return this.m_mass
};
b2Body.prototype.GetInertia = function() {
  return this.m_I
};
b2Body.prototype.GetMassData = function(data) {
  data.mass = this.m_mass;
  data.I = this.m_I;
  data.center.SetV(this.m_sweep.localCenter)
};
b2Body.prototype.SetMassData = function(massData) {
  b2Settings.b2Assert(this.m_world.IsLocked() == false);
  if(this.m_world.IsLocked() == true) {
    return
  }
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_mass = massData.mass;
  if(this.m_mass <= 0) {
    this.m_mass = 1
  }
  this.m_invMass = 1 / this.m_mass;
  if(massData.I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
    this.m_invI = 1 / this.m_I
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(massData.center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.ResetMassData = function() {
  this.m_mass = 0;
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_sweep.localCenter.SetZero();
  if(this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
    return
  }
  var center = b2Vec2.Make(0, 0);
  for(var f = this.m_fixtureList;f;f = f.m_next) {
    if(f.m_density == 0) {
      continue
    }
    var massData = f.GetMassData();
    this.m_mass += massData.mass;
    center.x += massData.center.x * massData.mass;
    center.y += massData.center.y * massData.mass;
    this.m_I += massData.I
  }
  if(this.m_mass > 0) {
    this.m_invMass = 1 / this.m_mass;
    center.x *= this.m_invMass;
    center.y *= this.m_invMass
  }else {
    this.m_mass = 1;
    this.m_invMass = 1
  }
  if(this.m_I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
    this.m_I *= this.m_inertiaScale;
    b2Settings.b2Assert(this.m_I > 0);
    this.m_invI = 1 / this.m_I
  }else {
    this.m_I = 0;
    this.m_invI = 0
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.GetWorldPoint = function(localPoint) {
  var A = this.m_xf.R;
  var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  u.x += this.m_xf.position.x;
  u.y += this.m_xf.position.y;
  return u
};
b2Body.prototype.GetWorldVector = function(localVector) {
  return b2Math.MulMV(this.m_xf.R, localVector)
};
b2Body.prototype.GetLocalPoint = function(worldPoint) {
  return b2Math.MulXT(this.m_xf, worldPoint)
};
b2Body.prototype.GetLocalVector = function(worldVector) {
  return b2Math.MulTMV(this.m_xf.R, worldVector)
};
b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
  var A = this.m_xf.R;
  var worldPoint = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  worldPoint.x += this.m_xf.position.x;
  worldPoint.y += this.m_xf.position.y;
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearDamping = function() {
  return this.m_linearDamping
};
b2Body.prototype.SetLinearDamping = function(linearDamping) {
  this.m_linearDamping = linearDamping
};
b2Body.prototype.GetAngularDamping = function() {
  return this.m_angularDamping
};
b2Body.prototype.SetAngularDamping = function(angularDamping) {
  this.m_angularDamping = angularDamping
};
b2Body.prototype.SetType = function(type) {
  if(this.m_type == type) {
    return
  }
  this.m_type = type;
  this.ResetMassData();
  if(this.m_type == b2Body.b2_staticBody) {
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0
  }
  this.SetAwake(true);
  this.m_force.SetZero();
  this.m_torque = 0;
  for(var ce = this.m_contactList;ce;ce = ce.next) {
    ce.contact.FlagForFiltering()
  }
};
b2Body.prototype.GetType = function() {
  return this.m_type
};
b2Body.prototype.SetBullet = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_bulletFlag
  }else {
    this.m_flags &= ~b2Body.e_bulletFlag
  }
};
b2Body.prototype.IsBullet = function() {
  return(this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag
};
b2Body.prototype.SetSleepingAllowed = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.SetAwake(true)
  }
};
b2Body.prototype.SetAwake = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_awakeFlag;
    this.m_sleepTime = 0
  }else {
    this.m_flags &= ~b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
    this.m_force.SetZero();
    this.m_torque = 0
  }
};
b2Body.prototype.IsAwake = function() {
  return(this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag
};
b2Body.prototype.SetFixedRotation = function(fixed) {
  if(fixed) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }else {
    this.m_flags &= ~b2Body.e_fixedRotationFlag
  }
  this.ResetMassData()
};
b2Body.prototype.IsFixedRotation = function() {
  return(this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag
};
b2Body.prototype.SetActive = function(flag) {
  if(flag == this.IsActive()) {
    return
  }
  var broadPhase;
  var f;
  if(flag) {
    this.m_flags |= b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.CreateProxy(broadPhase, this.m_xf)
    }
  }else {
    this.m_flags &= ~b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.DestroyProxy(broadPhase)
    }
    var ce = this.m_contactList;
    while(ce) {
      var ce0 = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact)
    }
    this.m_contactList = null
  }
};
b2Body.prototype.IsActive = function() {
  return(this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag
};
b2Body.prototype.IsSleepingAllowed = function() {
  return(this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag
};
b2Body.prototype.GetFixtureList = function() {
  return this.m_fixtureList
};
b2Body.prototype.GetJointList = function() {
  return this.m_jointList
};
b2Body.prototype.GetControllerList = function() {
  return this.m_controllerList
};
b2Body.prototype.GetContactList = function() {
  return this.m_contactList
};
b2Body.prototype.GetNext = function() {
  return this.m_next
};
b2Body.prototype.GetUserData = function() {
  return this.m_userData
};
b2Body.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Body.prototype.GetWorld = function() {
  return this.m_world
};
b2Body.prototype.m_flags = 0;
b2Body.prototype.m_type = 0;
b2Body.prototype.m_islandIndex = 0;
b2Body.prototype.m_xf = new b2Transform;
b2Body.prototype.m_sweep = new b2Sweep;
b2Body.prototype.m_linearVelocity = new b2Vec2;
b2Body.prototype.m_angularVelocity = null;
b2Body.prototype.m_force = new b2Vec2;
b2Body.prototype.m_torque = null;
b2Body.prototype.m_world = null;
b2Body.prototype.m_prev = null;
b2Body.prototype.m_next = null;
b2Body.prototype.m_fixtureList = null;
b2Body.prototype.m_fixtureCount = 0;
b2Body.prototype.m_controllerList = null;
b2Body.prototype.m_controllerCount = 0;
b2Body.prototype.m_jointList = null;
b2Body.prototype.m_contactList = null;
b2Body.prototype.m_mass = null;
b2Body.prototype.m_invMass = null;
b2Body.prototype.m_I = null;
b2Body.prototype.m_invI = null;
b2Body.prototype.m_inertiaScale = null;
b2Body.prototype.m_linearDamping = null;
b2Body.prototype.m_angularDamping = null;
b2Body.prototype.m_sleepTime = null;
b2Body.prototype.m_userData = null;var b2ContactImpulse = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactImpulse.prototype.__constructor = function() {
};
b2ContactImpulse.prototype.__varz = function() {
  this.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
  this.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints)
};
b2ContactImpulse.prototype.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
b2ContactImpulse.prototype.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);var b2TensorDampingController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2TensorDampingController.prototype, b2Controller.prototype);
b2TensorDampingController.prototype._super = b2Controller.prototype;
b2TensorDampingController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2TensorDampingController.prototype.__varz = function() {
  this.T = new b2Mat22
};
b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
  this.T.col1.x = -xDamping;
  this.T.col1.y = 0;
  this.T.col2.x = 0;
  this.T.col2.y = -yDamping;
  if(xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / Math.max(xDamping, yDamping)
  }else {
    this.maxTimestep = 0
  }
};
b2TensorDampingController.prototype.Step = function(step) {
  var timestep = step.dt;
  if(timestep <= Number.MIN_VALUE) {
    return
  }
  if(timestep > this.maxTimestep && this.maxTimestep > 0) {
    timestep = this.maxTimestep
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    var damping = body.GetWorldVector(b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep))
  }
};
b2TensorDampingController.prototype.T = new b2Mat22;
b2TensorDampingController.prototype.maxTimestep = 0;var b2ManifoldPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ManifoldPoint.prototype.__constructor = function() {
  this.Reset()
};
b2ManifoldPoint.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_id = new b2ContactID
};
b2ManifoldPoint.prototype.Reset = function() {
  this.m_localPoint.SetZero();
  this.m_normalImpulse = 0;
  this.m_tangentImpulse = 0;
  this.m_id.key = 0
};
b2ManifoldPoint.prototype.Set = function(m) {
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_normalImpulse = m.m_normalImpulse;
  this.m_tangentImpulse = m.m_tangentImpulse;
  this.m_id.Set(m.m_id)
};
b2ManifoldPoint.prototype.m_localPoint = new b2Vec2;
b2ManifoldPoint.prototype.m_normalImpulse = null;
b2ManifoldPoint.prototype.m_tangentImpulse = null;
b2ManifoldPoint.prototype.m_id = new b2ContactID;var b2PolygonShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonShape.prototype, b2Shape.prototype);
b2PolygonShape.prototype._super = b2Shape.prototype;
b2PolygonShape.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.m_type = b2Shape.e_polygonShape;
  this.m_centroid = new b2Vec2;
  this.m_vertices = new Array;
  this.m_normals = new Array
};
b2PolygonShape.prototype.__varz = function() {
};
b2PolygonShape.AsArray = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsArray(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsVector = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsVector(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsBox = function(hx, hy) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsBox(hx, hy);
  return polygonShape
};
b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsOrientedBox(hx, hy, center, angle);
  return polygonShape
};
b2PolygonShape.AsEdge = function(v1, v2) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsEdge(v1, v2);
  return polygonShape
};
b2PolygonShape.ComputeCentroid = function(vs, count) {
  var c = new b2Vec2;
  var area = 0;
  var p1X = 0;
  var p1Y = 0;
  var inv3 = 1 / 3;
  for(var i = 0;i < count;++i) {
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[parseInt(i + 1)] : vs[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y)
  }
  c.x *= 1 / area;
  c.y *= 1 / area;
  return c
};
b2PolygonShape.ComputeOBB = function(obb, vs, count) {
  var i = 0;
  var p = new Array(count + 1);
  for(i = 0;i < count;++i) {
    p[i] = vs[i]
  }
  p[count] = p[0];
  var minArea = Number.MAX_VALUE;
  for(i = 1;i <= count;++i) {
    var root = p[parseInt(i - 1)];
    var uxX = p[i].x - root.x;
    var uxY = p[i].y - root.y;
    var length = Math.sqrt(uxX * uxX + uxY * uxY);
    uxX /= length;
    uxY /= length;
    var uyX = -uxY;
    var uyY = uxX;
    var lowerX = Number.MAX_VALUE;
    var lowerY = Number.MAX_VALUE;
    var upperX = -Number.MAX_VALUE;
    var upperY = -Number.MAX_VALUE;
    for(var j = 0;j < count;++j) {
      var dX = p[j].x - root.x;
      var dY = p[j].y - root.y;
      var rX = uxX * dX + uxY * dY;
      var rY = uyX * dX + uyY * dY;
      if(rX < lowerX) {
        lowerX = rX
      }
      if(rY < lowerY) {
        lowerY = rY
      }
      if(rX > upperX) {
        upperX = rX
      }
      if(rY > upperY) {
        upperY = rY
      }
    }
    var area = (upperX - lowerX) * (upperY - lowerY);
    if(area < 0.95 * minArea) {
      minArea = area;
      obb.R.col1.x = uxX;
      obb.R.col1.y = uxY;
      obb.R.col2.x = uyX;
      obb.R.col2.y = uyY;
      var centerX = 0.5 * (lowerX + upperX);
      var centerY = 0.5 * (lowerY + upperY);
      var tMat = obb.R;
      obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
      obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
      obb.extents.x = 0.5 * (upperX - lowerX);
      obb.extents.y = 0.5 * (upperY - lowerY)
    }
  }
};
b2PolygonShape.s_mat = new b2Mat22;
b2PolygonShape.prototype.Validate = function() {
  return false
};
b2PolygonShape.prototype.Reserve = function(count) {
  for(var i = this.m_vertices.length;i < count;i++) {
    this.m_vertices[i] = new b2Vec2;
    this.m_normals[i] = new b2Vec2
  }
};
b2PolygonShape.prototype.Copy = function() {
  var s = new b2PolygonShape;
  s.Set(this);
  return s
};
b2PolygonShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2PolygonShape)) {
    var other2 = other;
    this.m_centroid.SetV(other2.m_centroid);
    this.m_vertexCount = other2.m_vertexCount;
    this.Reserve(this.m_vertexCount);
    for(var i = 0;i < this.m_vertexCount;i++) {
      this.m_vertices[i].SetV(other2.m_vertices[i]);
      this.m_normals[i].SetV(other2.m_normals[i])
    }
  }
};
b2PolygonShape.prototype.SetAsArray = function(vertices, vertexCount) {
  var v = new Array;
  for(var i = 0, tVec = null;i < vertices.length, tVec = vertices[i];i++) {
    v.push(tVec)
  }
  this.SetAsVector(v, vertexCount)
};
b2PolygonShape.prototype.SetAsVector = function(vertices, vertexCount) {
  if(typeof vertexCount == "undefined") {
    vertexCount = vertices.length
  }
  b2Settings.b2Assert(2 <= vertexCount);
  this.m_vertexCount = vertexCount;
  this.Reserve(vertexCount);
  var i = 0;
  for(i = 0;i < this.m_vertexCount;i++) {
    this.m_vertices[i].SetV(vertices[i])
  }
  for(i = 0;i < this.m_vertexCount;++i) {
    var i1 = i;
    var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
    var edge = b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
    b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
    this.m_normals[i].SetV(b2Math.CrossVF(edge, 1));
    this.m_normals[i].Normalize()
  }
  this.m_centroid = b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid.SetZero()
};
b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid = center;
  var xf = new b2Transform;
  xf.position = center;
  xf.R.Set(angle);
  for(var i = 0;i < this.m_vertexCount;++i) {
    this.m_vertices[i] = b2Math.MulX(xf, this.m_vertices[i]);
    this.m_normals[i] = b2Math.MulMV(xf.R, this.m_normals[i])
  }
};
b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
  this.m_vertexCount = 2;
  this.Reserve(2);
  this.m_vertices[0].SetV(v1);
  this.m_vertices[1].SetV(v2);
  this.m_centroid.x = 0.5 * (v1.x + v2.x);
  this.m_centroid.y = 0.5 * (v1.y + v2.y);
  this.m_normals[0] = b2Math.CrossVF(b2Math.SubtractVV(v2, v1), 1);
  this.m_normals[0].Normalize();
  this.m_normals[1].x = -this.m_normals[0].x;
  this.m_normals[1].y = -this.m_normals[0].y
};
b2PolygonShape.prototype.TestPoint = function(xf, p) {
  var tVec;
  var tMat = xf.R;
  var tX = p.x - xf.position.x;
  var tY = p.y - xf.position.y;
  var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
  var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = pLocalX - tVec.x;
    tY = pLocalY - tVec.y;
    tVec = this.m_normals[i];
    var dot = tVec.x * tX + tVec.y * tY;
    if(dot > 0) {
      return false
    }
  }
  return true
};
b2PolygonShape.prototype.RayCast = function(output, input, transform) {
  var lower = 0;
  var upper = input.maxFraction;
  var tX;
  var tY;
  var tMat;
  var tVec;
  tX = input.p1.x - transform.position.x;
  tY = input.p1.y - transform.position.y;
  tMat = transform.R;
  var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
  tX = input.p2.x - transform.position.x;
  tY = input.p2.y - transform.position.y;
  tMat = transform.R;
  var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var index = -1;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = tVec.x - p1X;
    tY = tVec.y - p1Y;
    tVec = this.m_normals[i];
    var numerator = tVec.x * tX + tVec.y * tY;
    var denominator = tVec.x * dX + tVec.y * dY;
    if(denominator == 0) {
      if(numerator < 0) {
        return false
      }
    }else {
      if(denominator < 0 && numerator < lower * denominator) {
        lower = numerator / denominator;
        index = i
      }else {
        if(denominator > 0 && numerator < upper * denominator) {
          upper = numerator / denominator
        }
      }
    }
    if(upper < lower - Number.MIN_VALUE) {
      return false
    }
  }
  if(index >= 0) {
    output.fraction = lower;
    tMat = transform.R;
    tVec = this.m_normals[index];
    output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    return true
  }
  return false
};
b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
  var tMat = xf.R;
  var tVec = this.m_vertices[0];
  var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var upperX = lowerX;
  var upperY = lowerY;
  for(var i = 1;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    lowerX = lowerX < vX ? lowerX : vX;
    lowerY = lowerY < vY ? lowerY : vY;
    upperX = upperX > vX ? upperX : vX;
    upperY = upperY > vY ? upperY : vY
  }
  aabb.lowerBound.x = lowerX - this.m_radius;
  aabb.lowerBound.y = lowerY - this.m_radius;
  aabb.upperBound.x = upperX + this.m_radius;
  aabb.upperBound.y = upperY + this.m_radius
};
b2PolygonShape.prototype.ComputeMass = function(massData, density) {
  if(this.m_vertexCount == 2) {
    massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
    massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
    massData.mass = 0;
    massData.I = 0;
    return
  }
  var centerX = 0;
  var centerY = 0;
  var area = 0;
  var I = 0;
  var p1X = 0;
  var p1Y = 0;
  var k_inv3 = 1 / 3;
  for(var i = 0;i < this.m_vertexCount;++i) {
    var p2 = this.m_vertices[i];
    var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)] : this.m_vertices[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
    centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
    var px = p1X;
    var py = p1Y;
    var ex1 = e1X;
    var ey1 = e1Y;
    var ex2 = e2X;
    var ey2 = e2Y;
    var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
    I += D * (intx2 + inty2)
  }
  massData.mass = density * area;
  centerX *= 1 / area;
  centerY *= 1 / area;
  massData.center.Set(centerX, centerY);
  massData.I = density * I
};
b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var normalL = b2Math.MulTMV(xf.R, normal);
  var offsetL = offset - b2Math.Dot(normal, xf.position);
  var depths = new Array;
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;
  var lastSubmerged = false;
  var i = 0;
  for(i = 0;i < this.m_vertexCount;++i) {
    depths[i] = b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < -Number.MIN_VALUE;
    if(i > 0) {
      if(isSubmerged) {
        if(!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++
        }
      }else {
        if(lastSubmerged) {
          outoIndex = i - 1;
          diveCount++
        }
      }
    }
    lastSubmerged = isSubmerged
  }
  switch(diveCount) {
    case 0:
      if(lastSubmerged) {
        var md = new b2MassData;
        this.ComputeMass(md, 1);
        c.SetV(b2Math.MulX(xf, md.center));
        return md.mass
      }else {
        return 0
      }
      break;
    case 1:
      if(intoIndex == -1) {
        intoIndex = this.m_vertexCount - 1
      }else {
        outoIndex = this.m_vertexCount - 1
      }
      break
  }
  var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
  var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
  var intoVec = new b2Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = new b2Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
  var area = 0;
  var center = new b2Vec2;
  var p2 = this.m_vertices[intoIndex2];
  var p3;
  i = intoIndex2;
  while(i != outoIndex2) {
    i = (i + 1) % this.m_vertexCount;
    if(i == outoIndex2) {
      p3 = outoVec
    }else {
      p3 = this.m_vertices[i]
    }
    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
    p2 = p3
  }
  center.Multiply(1 / area);
  c.SetV(b2Math.MulX(xf, center));
  return area
};
b2PolygonShape.prototype.GetVertexCount = function() {
  return this.m_vertexCount
};
b2PolygonShape.prototype.GetVertices = function() {
  return this.m_vertices
};
b2PolygonShape.prototype.GetNormals = function() {
  return this.m_normals
};
b2PolygonShape.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2PolygonShape.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2PolygonShape.prototype.m_centroid = null;
b2PolygonShape.prototype.m_vertices = null;
b2PolygonShape.prototype.m_normals = null;
b2PolygonShape.prototype.m_vertexCount = 0;var b2Fixture = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Fixture.prototype.__constructor = function() {
  this.m_aabb = new b2AABB;
  this.m_userData = null;
  this.m_body = null;
  this.m_next = null;
  this.m_shape = null;
  this.m_density = 0;
  this.m_friction = 0;
  this.m_restitution = 0
};
b2Fixture.prototype.__varz = function() {
  this.m_filter = new b2FilterData
};
b2Fixture.prototype.Create = function(body, xf, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;
  this.m_next = null;
  this.m_filter = def.filter.Copy();
  this.m_isSensor = def.isSensor;
  this.m_shape = def.shape.Copy();
  this.m_density = def.density
};
b2Fixture.prototype.Destroy = function() {
  this.m_shape = null
};
b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
  this.m_shape.ComputeAABB(this.m_aabb, xf);
  this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this)
};
b2Fixture.prototype.DestroyProxy = function(broadPhase) {
  if(this.m_proxy == null) {
    return
  }
  broadPhase.DestroyProxy(this.m_proxy);
  this.m_proxy = null
};
b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
  if(!this.m_proxy) {
    return
  }
  var aabb1 = new b2AABB;
  var aabb2 = new b2AABB;
  this.m_shape.ComputeAABB(aabb1, transform1);
  this.m_shape.ComputeAABB(aabb2, transform2);
  this.m_aabb.Combine(aabb1, aabb2);
  var displacement = b2Math.SubtractVV(transform2.position, transform1.position);
  broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement)
};
b2Fixture.prototype.GetType = function() {
  return this.m_shape.GetType()
};
b2Fixture.prototype.GetShape = function() {
  return this.m_shape
};
b2Fixture.prototype.SetSensor = function(sensor) {
  if(this.m_isSensor == sensor) {
    return
  }
  this.m_isSensor = sensor;
  if(this.m_body == null) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor())
    }
    edge = edge.next
  }
};
b2Fixture.prototype.IsSensor = function() {
  return this.m_isSensor
};
b2Fixture.prototype.SetFilterData = function(filter) {
  this.m_filter = filter.Copy();
  if(this.m_body) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.FlagForFiltering()
    }
    edge = edge.next
  }
};
b2Fixture.prototype.GetFilterData = function() {
  return this.m_filter.Copy()
};
b2Fixture.prototype.GetBody = function() {
  return this.m_body
};
b2Fixture.prototype.GetNext = function() {
  return this.m_next
};
b2Fixture.prototype.GetUserData = function() {
  return this.m_userData
};
b2Fixture.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Fixture.prototype.TestPoint = function(p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p)
};
b2Fixture.prototype.RayCast = function(output, input) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform())
};
b2Fixture.prototype.GetMassData = function(massData) {
  if(massData == null) {
    massData = new b2MassData
  }
  this.m_shape.ComputeMass(massData, this.m_density);
  return massData
};
b2Fixture.prototype.SetDensity = function(density) {
  this.m_density = density
};
b2Fixture.prototype.GetDensity = function() {
  return this.m_density
};
b2Fixture.prototype.GetFriction = function() {
  return this.m_friction
};
b2Fixture.prototype.SetFriction = function(friction) {
  this.m_friction = friction
};
b2Fixture.prototype.GetRestitution = function() {
  return this.m_restitution
};
b2Fixture.prototype.SetRestitution = function(restitution) {
  this.m_restitution = restitution
};
b2Fixture.prototype.GetAABB = function() {
  return this.m_aabb
};
b2Fixture.prototype.m_massData = null;
b2Fixture.prototype.m_aabb = null;
b2Fixture.prototype.m_density = null;
b2Fixture.prototype.m_next = null;
b2Fixture.prototype.m_body = null;
b2Fixture.prototype.m_shape = null;
b2Fixture.prototype.m_friction = null;
b2Fixture.prototype.m_restitution = null;
b2Fixture.prototype.m_proxy = null;
b2Fixture.prototype.m_filter = new b2FilterData;
b2Fixture.prototype.m_isSensor = null;
b2Fixture.prototype.m_userData = null;var b2DynamicTreeNode = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeNode.prototype.__constructor = function() {
};
b2DynamicTreeNode.prototype.__varz = function() {
  this.aabb = new b2AABB
};
b2DynamicTreeNode.prototype.IsLeaf = function() {
  return this.child1 == null
};
b2DynamicTreeNode.prototype.userData = null;
b2DynamicTreeNode.prototype.aabb = new b2AABB;
b2DynamicTreeNode.prototype.parent = null;
b2DynamicTreeNode.prototype.child1 = null;
b2DynamicTreeNode.prototype.child2 = null;var b2BodyDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BodyDef.prototype.__constructor = function() {
  this.userData = null;
  this.position.Set(0, 0);
  this.angle = 0;
  this.linearVelocity.Set(0, 0);
  this.angularVelocity = 0;
  this.linearDamping = 0;
  this.angularDamping = 0;
  this.allowSleep = true;
  this.awake = true;
  this.fixedRotation = false;
  this.bullet = false;
  this.type = b2Body.b2_staticBody;
  this.active = true;
  this.inertiaScale = 1
};
b2BodyDef.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.linearVelocity = new b2Vec2
};
b2BodyDef.prototype.type = 0;
b2BodyDef.prototype.position = new b2Vec2;
b2BodyDef.prototype.angle = null;
b2BodyDef.prototype.linearVelocity = new b2Vec2;
b2BodyDef.prototype.angularVelocity = null;
b2BodyDef.prototype.linearDamping = null;
b2BodyDef.prototype.angularDamping = null;
b2BodyDef.prototype.allowSleep = null;
b2BodyDef.prototype.awake = null;
b2BodyDef.prototype.fixedRotation = null;
b2BodyDef.prototype.bullet = null;
b2BodyDef.prototype.active = null;
b2BodyDef.prototype.userData = null;
b2BodyDef.prototype.inertiaScale = null;var b2DynamicTreeBroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeBroadPhase.prototype.__constructor = function() {
};
b2DynamicTreeBroadPhase.prototype.__varz = function() {
  this.m_tree = new b2DynamicTree;
  this.m_moveBuffer = new Array;
  this.m_pairBuffer = new Array
};
b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
  this.m_moveBuffer[this.m_moveBuffer.length] = proxy
};
b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer.splice(i, 1)
};
b2DynamicTreeBroadPhase.prototype.ComparePairs = function(pair1, pair2) {
  return 0
};
b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy
};
b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy)
};
b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
  if(buffer) {
    this.BufferMove(proxy)
  }
};
b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return aabbA.TestOverlap(aabbB)
};
b2DynamicTreeBroadPhase.prototype.GetUserData = function(proxy) {
  return this.m_tree.GetUserData(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
  return this.m_tree.GetFatAABB(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairCount = 0;
  for(var i = 0, queryProxy = null;i < this.m_moveBuffer.length, queryProxy = this.m_moveBuffer[i];i++) {
    var that = this;
    function QueryCallback(proxy) {
      if(proxy == queryProxy) {
        return true
      }
      if(that.m_pairCount == that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new b2DynamicTreePair
      }
      var pair = that.m_pairBuffer[that.m_pairCount];
      pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      ++that.m_pairCount;
      return true
    }
    var fatAABB = this.m_tree.GetFatAABB(queryProxy);
    this.m_tree.Query(QueryCallback, fatAABB)
  }
  this.m_moveBuffer.length = 0;
  for(var i = 0;i < this.m_pairCount;) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
    callback(userDataA, userDataB);
    ++i;
    while(i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];
      if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
        break
      }
      ++i
    }
  }
};
b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
  this.m_tree.Query(callback, aabb)
};
b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
  this.m_tree.RayCast(callback, input)
};
b2DynamicTreeBroadPhase.prototype.Validate = function() {
};
b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
  this.m_tree.Rebalance(iterations)
};
b2DynamicTreeBroadPhase.prototype.m_tree = new b2DynamicTree;
b2DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
b2DynamicTreeBroadPhase.prototype.m_moveBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairCount = 0;var b2BroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BroadPhase.prototype.__constructor = function(worldAABB) {
  var i = 0;
  this.m_pairManager.Initialize(this);
  this.m_worldAABB = worldAABB;
  this.m_proxyCount = 0;
  this.m_bounds = new Array;
  for(i = 0;i < 2;i++) {
    this.m_bounds[i] = new Array
  }
  var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
  var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
  this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
  this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;
  this.m_timeStamp = 1;
  this.m_queryResultCount = 0
};
b2BroadPhase.prototype.__varz = function() {
  this.m_pairManager = new b2PairManager;
  this.m_proxyPool = new Array;
  this.m_querySortKeys = new Array;
  this.m_queryResults = new Array;
  this.m_quantizationFactor = new b2Vec2
};
b2BroadPhase.BinarySearch = function(bounds, count, value) {
  var low = 0;
  var high = count - 1;
  while(low <= high) {
    var mid = Math.round((low + high) / 2);
    var bound = bounds[mid];
    if(bound.value > value) {
      high = mid - 1
    }else {
      if(bound.value < value) {
        low = mid + 1
      }else {
        return parseInt(mid)
      }
    }
  }
  return parseInt(low)
};
b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
b2BroadPhase.prototype.ComputeBounds = function(lowerValues, upperValues, aabb) {
  var minVertexX = aabb.lowerBound.x;
  var minVertexY = aabb.lowerBound.y;
  minVertexX = b2Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
  minVertexY = b2Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
  minVertexX = b2Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
  minVertexY = b2Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
  var maxVertexX = aabb.upperBound.x;
  var maxVertexY = aabb.upperBound.y;
  maxVertexX = b2Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
  maxVertexY = b2Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
  maxVertexX = b2Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
  maxVertexY = b2Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
  lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x)) & b2Settings.USHRT_MAX - 1;
  upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x)) % 65535 | 1;
  lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y)) & b2Settings.USHRT_MAX - 1;
  upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y)) % 65535 | 1
};
b2BroadPhase.prototype.TestOverlapValidate = function(p1, p2) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound1 = bounds[p1.lowerBounds[axis]];
    var bound2 = bounds[p2.upperBounds[axis]];
    if(bound1.value > bound2.value) {
      return false
    }
    bound1 = bounds[p1.upperBounds[axis]];
    bound2 = bounds[p2.lowerBounds[axis]];
    if(bound1.value < bound2.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.QueryAxis = function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis) {
  var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
  var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);
  var bound;
  for(var j = lowerQuery;j < upperQuery;++j) {
    bound = bounds[j];
    if(bound.IsLower()) {
      this.IncrementOverlapCount(bound.proxy)
    }
  }
  if(lowerQuery > 0) {
    var i = lowerQuery - 1;
    bound = bounds[i];
    var s = bound.stabbingCount;
    while(s) {
      bound = bounds[i];
      if(bound.IsLower()) {
        var proxy = bound.proxy;
        if(lowerQuery <= proxy.upperBounds[axis]) {
          this.IncrementOverlapCount(bound.proxy);
          --s
        }
      }
      --i
    }
  }
  lowerQueryOut[0] = lowerQuery;
  upperQueryOut[0] = upperQuery
};
b2BroadPhase.prototype.IncrementOverlapCount = function(proxy) {
  if(proxy.timeStamp < this.m_timeStamp) {
    proxy.timeStamp = this.m_timeStamp;
    proxy.overlapCount = 1
  }else {
    proxy.overlapCount = 2;
    this.m_queryResults[this.m_queryResultCount] = proxy;
    ++this.m_queryResultCount
  }
};
b2BroadPhase.prototype.IncrementTimeStamp = function() {
  if(this.m_timeStamp == b2Settings.USHRT_MAX) {
    for(var i = 0;i < this.m_proxyPool.length;++i) {
      this.m_proxyPool[i].timeStamp = 0
    }
    this.m_timeStamp = 1
  }else {
    ++this.m_timeStamp
  }
};
b2BroadPhase.prototype.InRange = function(aabb) {
  var dX;
  var dY;
  var d2X;
  var d2Y;
  dX = aabb.lowerBound.x;
  dY = aabb.lowerBound.y;
  dX -= this.m_worldAABB.upperBound.x;
  dY -= this.m_worldAABB.upperBound.y;
  d2X = this.m_worldAABB.lowerBound.x;
  d2Y = this.m_worldAABB.lowerBound.y;
  d2X -= aabb.upperBound.x;
  d2Y -= aabb.upperBound.y;
  dX = b2Math.Max(dX, d2X);
  dY = b2Math.Max(dY, d2Y);
  return b2Math.Max(dX, dY) < 0
};
b2BroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var index = 0;
  var proxy;
  var i = 0;
  var j = 0;
  if(!this.m_freeProxy) {
    this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new b2Proxy;
    this.m_freeProxy.next = null;
    this.m_freeProxy.timeStamp = 0;
    this.m_freeProxy.overlapCount = b2BroadPhase.b2_invalid;
    this.m_freeProxy.userData = null;
    for(i = 0;i < 2;i++) {
      j = this.m_proxyCount * 2;
      this.m_bounds[i][j++] = new b2Bound;
      this.m_bounds[i][j] = new b2Bound
    }
  }
  proxy = this.m_freeProxy;
  this.m_freeProxy = proxy.next;
  proxy.overlapCount = 0;
  proxy.userData = userData;
  var boundCount = 2 * this.m_proxyCount;
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut = new Array;
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut = new Array;
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
    lowerIndex = lowerIndexOut[0];
    upperIndex = upperIndexOut[0];
    bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    ++upperIndex;
    var tBound1 = bounds[lowerIndex];
    var tBound2 = bounds[upperIndex];
    tBound1.value = lowerValues[axis];
    tBound1.proxy = proxy;
    tBound2.value = upperValues[axis];
    tBound2.proxy = proxy;
    var tBoundAS3 = bounds[parseInt(lowerIndex - 1)];
    tBound1.stabbingCount = lowerIndex == 0 ? 0 : tBoundAS3.stabbingCount;
    tBoundAS3 = bounds[parseInt(upperIndex - 1)];
    tBound2.stabbingCount = tBoundAS3.stabbingCount;
    for(index = lowerIndex;index < upperIndex;++index) {
      tBoundAS3 = bounds[index];
      tBoundAS3.stabbingCount++
    }
    for(index = lowerIndex;index < boundCount + 2;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
  }
  ++this.m_proxyCount;
  for(i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return proxy
};
b2BroadPhase.prototype.DestroyProxy = function(proxy_) {
  var proxy = proxy_;
  var tBound1;
  var tBound2;
  var boundCount = 2 * this.m_proxyCount;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    tBound1 = bounds[lowerIndex];
    var lowerValue = tBound1.value;
    tBound2 = bounds[upperIndex];
    var upperValue = tBound2.value;
    bounds.splice(upperIndex, 1);
    bounds.splice(lowerIndex, 1);
    bounds.push(tBound1);
    bounds.push(tBound2);
    var tEnd = boundCount - 2;
    for(var index = lowerIndex;index < tEnd;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
    tEnd = upperIndex - 1;
    for(var index2 = lowerIndex;index2 < tEnd;++index2) {
      tBound1 = bounds[index2];
      tBound1.stabbingCount--
    }
    var ignore = new Array;
    this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis)
  }
  for(var i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  proxy.userData = null;
  proxy.overlapCount = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[1] = b2BroadPhase.b2_invalid;
  proxy.next = this.m_freeProxy;
  this.m_freeProxy = proxy;
  --this.m_proxyCount
};
b2BroadPhase.prototype.MoveProxy = function(proxy_, aabb, displacement) {
  var proxy = proxy_;
  var as3arr;
  var as3int = 0;
  var axis = 0;
  var index = 0;
  var bound;
  var prevBound;
  var nextBound;
  var nextProxyId = 0;
  var nextProxy;
  if(proxy == null) {
    return
  }
  if(aabb.IsValid() == false) {
    return
  }
  var boundCount = 2 * this.m_proxyCount;
  var newValues = new b2BoundValues;
  this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
  var oldValues = new b2BoundValues;
  for(axis = 0;axis < 2;++axis) {
    bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
    oldValues.lowerValues[axis] = bound.value;
    bound = this.m_bounds[axis][proxy.upperBounds[axis]];
    oldValues.upperValues[axis] = bound.value
  }
  for(axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    var lowerValue = newValues.lowerValues[axis];
    var upperValue = newValues.upperValues[axis];
    bound = bounds[lowerIndex];
    var deltaLower = lowerValue - bound.value;
    bound.value = lowerValue;
    bound = bounds[upperIndex];
    var deltaUpper = upperValue - bound.value;
    bound.value = upperValue;
    if(deltaLower < 0) {
      index = lowerIndex;
      while(index > 0 && lowerValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        var prevProxy = prevBound.proxy;
        prevBound.stabbingCount++;
        if(prevBound.IsUpper() == true) {
          if(this.TestOverlapBound(newValues, prevProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        --index
      }
    }
    if(deltaUpper > 0) {
      index = upperIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= upperValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount++;
        if(nextBound.IsLower() == true) {
          if(this.TestOverlapBound(newValues, nextProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaLower > 0) {
      index = lowerIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= lowerValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount--;
        if(nextBound.IsUpper()) {
          if(this.TestOverlapBound(oldValues, nextProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaUpper < 0) {
      index = upperIndex;
      while(index > 0 && upperValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        prevProxy = prevBound.proxy;
        prevBound.stabbingCount--;
        if(prevBound.IsLower() == true) {
          if(this.TestOverlapBound(oldValues, prevProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        index--
      }
    }
  }
};
b2BroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairManager.Commit(callback)
};
b2BroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var proxyA_ = proxyA;
  var proxyB_ = proxyB;
  if(proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]) {
    return false
  }
  if(proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]) {
    return false
  }
  if(proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]) {
    return false
  }
  if(proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]) {
    return false
  }
  return true
};
b2BroadPhase.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2BroadPhase.prototype.GetFatAABB = function(proxy_) {
  var aabb = new b2AABB;
  var proxy = proxy_;
  aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
  aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
  aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
  aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
  return aabb
};
b2BroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2BroadPhase.prototype.Query = function(callback, aabb) {
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  for(var i = 0;i < this.m_queryResultCount;++i) {
    var proxy = this.m_queryResults[i];
    if(!callback(proxy)) {
      break
    }
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp()
};
b2BroadPhase.prototype.Validate = function() {
  var pair;
  var proxy1;
  var proxy2;
  var overlap;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var boundCount = 2 * this.m_proxyCount;
    var stabbingCount = 0;
    for(var i = 0;i < boundCount;++i) {
      var bound = bounds[i];
      if(bound.IsLower() == true) {
        stabbingCount++
      }else {
        stabbingCount--
      }
    }
  }
};
b2BroadPhase.prototype.Rebalance = function(iterations) {
};
b2BroadPhase.prototype.RayCast = function(callback, input) {
  var subInput = new b2RayCastInput;
  subInput.p1.SetV(input.p1);
  subInput.p2.SetV(input.p2);
  subInput.maxFraction = input.maxFraction;
  var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
  var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
  var sx = dx < -Number.MIN_VALUE ? -1 : dx > Number.MIN_VALUE ? 1 : 0;
  var sy = dy < -Number.MIN_VALUE ? -1 : dy > Number.MIN_VALUE ? 1 : 0;
  var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
  var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
  var startValues = new Array;
  var startValues2 = new Array;
  startValues[0] = parseInt(p1x) & b2Settings.USHRT_MAX - 1;
  startValues[1] = parseInt(p1y) & b2Settings.USHRT_MAX - 1;
  startValues2[0] = startValues[0] + 1;
  startValues2[1] = startValues[1] + 1;
  var startIndices = new Array;
  var xIndex = 0;
  var yIndex = 0;
  var proxy;
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  if(sx >= 0) {
    xIndex = upperIndexOut[0] - 1
  }else {
    xIndex = lowerIndexOut[0]
  }
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  if(sy >= 0) {
    yIndex = upperIndexOut[0] - 1
  }else {
    yIndex = lowerIndexOut[0]
  }
  for(var i = 0;i < this.m_queryResultCount;i++) {
    subInput.maxFraction = callback(this.m_queryResults[i], subInput)
  }
  for(;;) {
    var xProgress = 0;
    var yProgress = 0;
    xIndex += sx >= 0 ? 1 : -1;
    if(xIndex < 0 || xIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sx != 0) {
      xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
    }
    yIndex += sy >= 0 ? 1 : -1;
    if(yIndex < 0 || yIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sy != 0) {
      yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
    }
    for(;;) {
      if(sy == 0 || sx != 0 && xProgress < yProgress) {
        if(xProgress > subInput.maxFraction) {
          break
        }
        if(sx > 0 ? this.m_bounds[0][xIndex].IsLower() : this.m_bounds[0][xIndex].IsUpper()) {
          proxy = this.m_bounds[0][xIndex].proxy;
          if(sy >= 0) {
            if(proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sx > 0) {
          xIndex++;
          if(xIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          xIndex--;
          if(xIndex < 0) {
            break
          }
        }
        xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
      }else {
        if(yProgress > subInput.maxFraction) {
          break
        }
        if(sy > 0 ? this.m_bounds[1][yIndex].IsLower() : this.m_bounds[1][yIndex].IsUpper()) {
          proxy = this.m_bounds[1][yIndex].proxy;
          if(sx >= 0) {
            if(proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sy > 0) {
          yIndex++;
          if(yIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          yIndex--;
          if(yIndex < 0) {
            break
          }
        }
        yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
      }
    }
    break
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return
};
b2BroadPhase.prototype.TestOverlapBound = function(b, p) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound = bounds[p.upperBounds[axis]];
    if(b.lowerValues[axis] > bound.value) {
      return false
    }
    bound = bounds[p.lowerBounds[axis]];
    if(b.upperValues[axis] < bound.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.m_pairManager = new b2PairManager;
b2BroadPhase.prototype.m_proxyPool = new Array;
b2BroadPhase.prototype.m_freeProxy = null;
b2BroadPhase.prototype.m_bounds = null;
b2BroadPhase.prototype.m_querySortKeys = new Array;
b2BroadPhase.prototype.m_queryResults = new Array;
b2BroadPhase.prototype.m_queryResultCount = 0;
b2BroadPhase.prototype.m_worldAABB = null;
b2BroadPhase.prototype.m_quantizationFactor = new b2Vec2;
b2BroadPhase.prototype.m_proxyCount = 0;
b2BroadPhase.prototype.m_timeStamp = 0;var b2Manifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Manifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2ManifoldPoint
  }
  this.m_localPlaneNormal = new b2Vec2;
  this.m_localPoint = new b2Vec2
};
b2Manifold.prototype.__varz = function() {
};
b2Manifold.e_circles = 1;
b2Manifold.e_faceA = 2;
b2Manifold.e_faceB = 4;
b2Manifold.prototype.Reset = function() {
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Reset()
  }
  this.m_localPlaneNormal.SetZero();
  this.m_localPoint.SetZero();
  this.m_type = 0;
  this.m_pointCount = 0
};
b2Manifold.prototype.Set = function(m) {
  this.m_pointCount = m.m_pointCount;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Set(m.m_points[i])
  }
  this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_type = m.m_type
};
b2Manifold.prototype.Copy = function() {
  var copy = new b2Manifold;
  copy.Set(this);
  return copy
};
b2Manifold.prototype.m_points = null;
b2Manifold.prototype.m_localPlaneNormal = null;
b2Manifold.prototype.m_localPoint = null;
b2Manifold.prototype.m_type = 0;
b2Manifold.prototype.m_pointCount = 0;var b2CircleShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleShape.prototype, b2Shape.prototype);
b2CircleShape.prototype._super = b2Shape.prototype;
b2CircleShape.prototype.__constructor = function(radius) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_circleShape;
  this.m_radius = radius
};
b2CircleShape.prototype.__varz = function() {
  this.m_p = new b2Vec2
};
b2CircleShape.prototype.Copy = function() {
  var s = new b2CircleShape;
  s.Set(this);
  return s
};
b2CircleShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2CircleShape)) {
    var other2 = other;
    this.m_p.SetV(other2.m_p)
  }
};
b2CircleShape.prototype.TestPoint = function(transform, p) {
  var tMat = transform.R;
  var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  dX = p.x - dX;
  dY = p.y - dY;
  return dX * dX + dY * dY <= this.m_radius * this.m_radius
};
b2CircleShape.prototype.RayCast = function(output, input, transform) {
  var tMat = transform.R;
  var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  var sX = input.p1.x - positionX;
  var sY = input.p1.y - positionY;
  var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  var c = sX * rX + sY * rY;
  var rr = rX * rX + rY * rY;
  var sigma = c * c - rr * b;
  if(sigma < 0 || rr < Number.MIN_VALUE) {
    return false
  }
  var a = -(c + Math.sqrt(sigma));
  if(0 <= a && a <= input.maxFraction * rr) {
    a /= rr;
    output.fraction = a;
    output.normal.x = sX + a * rX;
    output.normal.y = sY + a * rY;
    output.normal.Normalize();
    return true
  }
  return false
};
b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
  aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius)
};
b2CircleShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = density * b2Settings.b2_pi * this.m_radius * this.m_radius;
  massData.center.SetV(this.m_p);
  massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
};
b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var p = b2Math.MulX(xf, this.m_p);
  var l = -(b2Math.Dot(normal, p) - offset);
  if(l < -this.m_radius + Number.MIN_VALUE) {
    return 0
  }
  if(l > this.m_radius) {
    c.SetV(p);
    return Math.PI * this.m_radius * this.m_radius
  }
  var r2 = this.m_radius * this.m_radius;
  var l2 = l * l;
  var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
  var com = -2 / 3 * Math.pow(r2 - l2, 1.5) / area;
  c.x = p.x + normal.x * com;
  c.y = p.y + normal.y * com;
  return area
};
b2CircleShape.prototype.GetLocalPosition = function() {
  return this.m_p
};
b2CircleShape.prototype.SetLocalPosition = function(position) {
  this.m_p.SetV(position)
};
b2CircleShape.prototype.GetRadius = function() {
  return this.m_radius
};
b2CircleShape.prototype.SetRadius = function(radius) {
  this.m_radius = radius
};
b2CircleShape.prototype.m_p = new b2Vec2;var b2Joint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Joint.prototype.__constructor = function(def) {
  b2Settings.b2Assert(def.bodyA != def.bodyB);
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;
  this.m_collideConnected = def.collideConnected;
  this.m_islandFlag = false;
  this.m_userData = def.userData
};
b2Joint.prototype.__varz = function() {
  this.m_edgeA = new b2JointEdge;
  this.m_edgeB = new b2JointEdge;
  this.m_localCenterA = new b2Vec2;
  this.m_localCenterB = new b2Vec2
};
b2Joint.Create = function(def, allocator) {
  var joint = null;
  switch(def.type) {
    case b2Joint.e_distanceJoint:
      joint = new b2DistanceJoint(def);
      break;
    case b2Joint.e_mouseJoint:
      joint = new b2MouseJoint(def);
      break;
    case b2Joint.e_prismaticJoint:
      joint = new b2PrismaticJoint(def);
      break;
    case b2Joint.e_revoluteJoint:
      joint = new b2RevoluteJoint(def);
      break;
    case b2Joint.e_pulleyJoint:
      joint = new b2PulleyJoint(def);
      break;
    case b2Joint.e_gearJoint:
      joint = new b2GearJoint(def);
      break;
    case b2Joint.e_lineJoint:
      joint = new b2LineJoint(def);
      break;
    case b2Joint.e_weldJoint:
      joint = new b2WeldJoint(def);
      break;
    case b2Joint.e_frictionJoint:
      joint = new b2FrictionJoint(def);
      break;
    default:
      break
  }
  return joint
};
b2Joint.Destroy = function(joint, allocator) {
};
b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_lineJoint = 7;
b2Joint.e_weldJoint = 8;
b2Joint.e_frictionJoint = 9;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;
b2Joint.prototype.InitVelocityConstraints = function(step) {
};
b2Joint.prototype.SolveVelocityConstraints = function(step) {
};
b2Joint.prototype.FinalizeVelocityConstraints = function() {
};
b2Joint.prototype.SolvePositionConstraints = function(baumgarte) {
  return false
};
b2Joint.prototype.GetType = function() {
  return this.m_type
};
b2Joint.prototype.GetAnchorA = function() {
  return null
};
b2Joint.prototype.GetAnchorB = function() {
  return null
};
b2Joint.prototype.GetReactionForce = function(inv_dt) {
  return null
};
b2Joint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2Joint.prototype.GetBodyA = function() {
  return this.m_bodyA
};
b2Joint.prototype.GetBodyB = function() {
  return this.m_bodyB
};
b2Joint.prototype.GetNext = function() {
  return this.m_next
};
b2Joint.prototype.GetUserData = function() {
  return this.m_userData
};
b2Joint.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Joint.prototype.IsActive = function() {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
b2Joint.prototype.m_type = 0;
b2Joint.prototype.m_prev = null;
b2Joint.prototype.m_next = null;
b2Joint.prototype.m_edgeA = new b2JointEdge;
b2Joint.prototype.m_edgeB = new b2JointEdge;
b2Joint.prototype.m_bodyA = null;
b2Joint.prototype.m_bodyB = null;
b2Joint.prototype.m_islandFlag = null;
b2Joint.prototype.m_collideConnected = null;
b2Joint.prototype.m_userData = null;
b2Joint.prototype.m_localCenterA = new b2Vec2;
b2Joint.prototype.m_localCenterB = new b2Vec2;
b2Joint.prototype.m_invMassA = null;
b2Joint.prototype.m_invMassB = null;
b2Joint.prototype.m_invIA = null;
b2Joint.prototype.m_invIB = null;var b2LineJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJoint.prototype, b2Joint.prototype);
b2LineJoint.prototype._super = b2Joint.prototype;
b2LineJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2LineJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat22;
  this.m_impulse = new b2Vec2
};
b2LineJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.y = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.y = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.y = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2LineJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve(new b2Vec2, -Cdot1, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.y = b2Math.Max(this.m_impulse.y, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.y = b2Math.Min(this.m_impulse.y, 0)
      }
    }
    var b = -Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
    var f2r;
    if(this.m_K.col1.x != 0) {
      f2r = b / this.m_K.col1.x + f1.x
    }else {
      f2r = f1.x
    }
    this.m_impulse.x = f2r;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y * this.m_a1;
    L2 = df.x * this.m_s2 + df.y * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2;
    if(this.m_K.col1.x != 0) {
      df2 = -Cdot1 / this.m_K.col1.x
    }else {
      df2 = 0
    }
    this.m_impulse.x += df2;
    PX = df2 * this.m_perp.x;
    PY = df2 * this.m_perp.y;
    L1 = df2 * this.m_s1;
    L2 = df2 * this.m_s2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2LineJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec2;
  var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1));
  angularError = 0;
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve(impulse, -C1, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var impulse1;
    if(k11 != 0) {
      impulse1 = -C1 / k11
    }else {
      impulse1 = 0
    }
    impulse.x = impulse1;
    impulse.y = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2LineJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2LineJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2LineJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
b2LineJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2LineJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2LineJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2LineJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2LineJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2LineJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2LineJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2LineJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2LineJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2LineJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2LineJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2LineJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2LineJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2LineJoint.prototype.GetMaxMotorForce = function() {
  return this.m_maxMotorForce
};
b2LineJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2LineJoint.prototype.m_localAnchor1 = new b2Vec2;
b2LineJoint.prototype.m_localAnchor2 = new b2Vec2;
b2LineJoint.prototype.m_localXAxis1 = new b2Vec2;
b2LineJoint.prototype.m_localYAxis1 = new b2Vec2;
b2LineJoint.prototype.m_axis = new b2Vec2;
b2LineJoint.prototype.m_perp = new b2Vec2;
b2LineJoint.prototype.m_s1 = null;
b2LineJoint.prototype.m_s2 = null;
b2LineJoint.prototype.m_a1 = null;
b2LineJoint.prototype.m_a2 = null;
b2LineJoint.prototype.m_K = new b2Mat22;
b2LineJoint.prototype.m_impulse = new b2Vec2;
b2LineJoint.prototype.m_motorMass = null;
b2LineJoint.prototype.m_motorImpulse = null;
b2LineJoint.prototype.m_lowerTranslation = null;
b2LineJoint.prototype.m_upperTranslation = null;
b2LineJoint.prototype.m_maxMotorForce = null;
b2LineJoint.prototype.m_motorSpeed = null;
b2LineJoint.prototype.m_enableLimit = null;
b2LineJoint.prototype.m_enableMotor = null;
b2LineJoint.prototype.m_limitState = 0;var b2ContactSolver = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactSolver.prototype.__constructor = function() {
};
b2ContactSolver.prototype.__varz = function() {
  this.m_step = new b2TimeStep;
  this.m_constraints = new Array
};
b2ContactSolver.s_worldManifold = new b2WorldManifold;
b2ContactSolver.s_psm = new b2PositionSolverManifold;
b2ContactSolver.prototype.Initialize = function(step, contacts, contactCount, allocator) {
  var contact;
  this.m_step.Set(step);
  this.m_allocator = allocator;
  var i = 0;
  var tVec;
  var tMat;
  this.m_constraintCount = contactCount;
  while(this.m_constraints.length < this.m_constraintCount) {
    this.m_constraints[this.m_constraints.length] = new b2ContactConstraint
  }
  for(i = 0;i < contactCount;++i) {
    contact = contacts[i];
    var fixtureA = contact.m_fixtureA;
    var fixtureB = contact.m_fixtureB;
    var shapeA = fixtureA.m_shape;
    var shapeB = fixtureB.m_shape;
    var radiusA = shapeA.m_radius;
    var radiusB = shapeB.m_radius;
    var bodyA = fixtureA.m_body;
    var bodyB = fixtureB.m_body;
    var manifold = contact.GetManifold();
    var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
    var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
    var vAX = bodyA.m_linearVelocity.x;
    var vAY = bodyA.m_linearVelocity.y;
    var vBX = bodyB.m_linearVelocity.x;
    var vBY = bodyB.m_linearVelocity.y;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    b2Settings.b2Assert(manifold.m_pointCount > 0);
    b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
    var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
    var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
    var cc = this.m_constraints[i];
    cc.bodyA = bodyA;
    cc.bodyB = bodyB;
    cc.manifold = manifold;
    cc.normal.x = normalX;
    cc.normal.y = normalY;
    cc.pointCount = manifold.m_pointCount;
    cc.friction = friction;
    cc.restitution = restitution;
    cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
    cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
    cc.localPoint.x = manifold.m_localPoint.x;
    cc.localPoint.y = manifold.m_localPoint.y;
    cc.radius = radiusA + radiusB;
    cc.type = manifold.m_type;
    for(var k = 0;k < cc.pointCount;++k) {
      var cp = manifold.m_points[k];
      var ccp = cc.points[k];
      ccp.normalImpulse = cp.m_normalImpulse;
      ccp.tangentImpulse = cp.m_tangentImpulse;
      ccp.localPoint.SetV(cp.m_localPoint);
      var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
      var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
      var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
      var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
      var rnA = rAX * normalY - rAY * normalX;
      var rnB = rBX * normalY - rBY * normalX;
      rnA *= rnA;
      rnB *= rnB;
      var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
      ccp.normalMass = 1 / kNormal;
      var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
      kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
      ccp.equalizedMass = 1 / kEqualized;
      var tangentX = normalY;
      var tangentY = -normalX;
      var rtA = rAX * tangentY - rAY * tangentX;
      var rtB = rBX * tangentY - rBY * tangentX;
      rtA *= rtA;
      rtB *= rtB;
      var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
      ccp.tangentMass = 1 / kTangent;
      ccp.velocityBias = 0;
      var tX = vBX + -wB * rBY - vAX - -wA * rAY;
      var tY = vBY + wB * rBX - vAY - wA * rAX;
      var vRel = cc.normal.x * tX + cc.normal.y * tY;
      if(vRel < -b2Settings.b2_velocityThreshold) {
        ccp.velocityBias += -cc.restitution * vRel
      }
    }
    if(cc.pointCount == 2) {
      var ccp1 = cc.points[0];
      var ccp2 = cc.points[1];
      var invMassA = bodyA.m_invMass;
      var invIA = bodyA.m_invI;
      var invMassB = bodyB.m_invMass;
      var invIB = bodyB.m_invI;
      var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
      var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
      var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
      var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
      var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
      var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
      var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
      var k_maxConditionNumber = 100;
      if(k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
        cc.K.col1.Set(k11, k12);
        cc.K.col2.Set(k12, k22);
        cc.K.GetInverse(cc.normalMass)
      }else {
        cc.pointCount = 1
      }
    }
  }
};
b2ContactSolver.prototype.InitVelocityConstraints = function(step) {
  var tVec;
  var tVec2;
  var tMat;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var tX;
    var j = 0;
    var tCount = 0;
    if(step.warmStarting) {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp = c.points[j];
        ccp.normalImpulse *= step.dtRatio;
        ccp.tangentImpulse *= step.dtRatio;
        var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
        var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
        bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
        bodyA.m_linearVelocity.x -= invMassA * PX;
        bodyA.m_linearVelocity.y -= invMassA * PY;
        bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
        bodyB.m_linearVelocity.x += invMassB * PX;
        bodyB.m_linearVelocity.y += invMassB * PY
      }
    }else {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp2 = c.points[j];
        ccp2.normalImpulse = 0;
        ccp2.tangentImpulse = 0
      }
    }
  }
};
b2ContactSolver.prototype.SolveVelocityConstraints = function() {
  var j = 0;
  var ccp;
  var rAX;
  var rAY;
  var rBX;
  var rBY;
  var dvX;
  var dvY;
  var vn;
  var vt;
  var lambda;
  var maxFriction;
  var newImpulse;
  var PX;
  var PY;
  var dX;
  var dY;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var tMat;
  var tVec;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    var vA = bodyA.m_linearVelocity;
    var vB = bodyB.m_linearVelocity;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var friction = c.friction;
    var tX;
    for(j = 0;j < c.pointCount;j++) {
      ccp = c.points[j];
      dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vt = dvX * tangentX + dvY * tangentY;
      lambda = ccp.tangentMass * -vt;
      maxFriction = friction * ccp.normalImpulse;
      newImpulse = b2Math.Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
      lambda = newImpulse - ccp.tangentImpulse;
      PX = lambda * tangentX;
      PY = lambda * tangentY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.tangentImpulse = newImpulse
    }
    var tCount = c.pointCount;
    if(c.pointCount == 1) {
      ccp = c.points[0];
      dvX = vB.x + -wB * ccp.rB.y - vA.x - -wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vn = dvX * normalX + dvY * normalY;
      lambda = -ccp.normalMass * (vn - ccp.velocityBias);
      newImpulse = ccp.normalImpulse + lambda;
      newImpulse = newImpulse > 0 ? newImpulse : 0;
      lambda = newImpulse - ccp.normalImpulse;
      PX = lambda * normalX;
      PY = lambda * normalY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.normalImpulse = newImpulse
    }else {
      var cp1 = c.points[0];
      var cp2 = c.points[1];
      var aX = cp1.normalImpulse;
      var aY = cp2.normalImpulse;
      var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
      var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
      var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
      var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
      var vn1 = dv1X * normalX + dv1Y * normalY;
      var vn2 = dv2X * normalX + dv2Y * normalY;
      var bX = vn1 - cp1.velocityBias;
      var bY = vn2 - cp2.velocityBias;
      tMat = c.K;
      bX -= tMat.col1.x * aX + tMat.col2.x * aY;
      bY -= tMat.col1.y * aX + tMat.col2.y * aY;
      var k_errorTol = 0.0010;
      for(;;) {
        tMat = c.normalMass;
        var xX = -(tMat.col1.x * bX + tMat.col2.x * bY);
        var xY = -(tMat.col1.y * bX + tMat.col2.y * bY);
        if(xX >= 0 && xY >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = -cp1.normalMass * bX;
        xY = 0;
        vn1 = 0;
        vn2 = c.K.col1.y * xX + bY;
        if(xX >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = -cp2.normalMass * bY;
        vn1 = c.K.col2.x * xY + bX;
        vn2 = 0;
        if(xY >= 0 && vn1 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = 0;
        vn1 = bX;
        vn2 = bY;
        if(vn1 >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        break
      }
    }
    bodyA.m_angularVelocity = wA;
    bodyB.m_angularVelocity = wB
  }
};
b2ContactSolver.prototype.FinalizeVelocityConstraints = function() {
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var m = c.manifold;
    for(var j = 0;j < c.pointCount;++j) {
      var point1 = m.m_points[j];
      var point2 = c.points[j];
      point1.m_normalImpulse = point2.normalImpulse;
      point1.m_tangentImpulse = point2.tangentImpulse
    }
  }
};
b2ContactSolver.prototype.SolvePositionConstraints = function(baumgarte) {
  var minSeparation = 0;
  for(var i = 0;i < this.m_constraintCount;i++) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_mass * bodyA.m_invMass;
    var invIA = bodyA.m_mass * bodyA.m_invI;
    var invMassB = bodyB.m_mass * bodyB.m_invMass;
    var invIB = bodyB.m_mass * bodyB.m_invI;
    b2ContactSolver.s_psm.Initialize(c);
    var normal = b2ContactSolver.s_psm.m_normal;
    for(var j = 0;j < c.pointCount;j++) {
      var ccp = c.points[j];
      var point = b2ContactSolver.s_psm.m_points[j];
      var separation = b2ContactSolver.s_psm.m_separations[j];
      var rAX = point.x - bodyA.m_sweep.c.x;
      var rAY = point.y - bodyA.m_sweep.c.y;
      var rBX = point.x - bodyB.m_sweep.c.x;
      var rBY = point.y - bodyB.m_sweep.c.y;
      minSeparation = minSeparation < separation ? minSeparation : separation;
      var C = b2Math.Clamp(baumgarte * (separation + b2Settings.b2_linearSlop), -b2Settings.b2_maxLinearCorrection, 0);
      var impulse = -ccp.equalizedMass * C;
      var PX = impulse * normal.x;
      var PY = impulse * normal.y;
      bodyA.m_sweep.c.x -= invMassA * PX;
      bodyA.m_sweep.c.y -= invMassA * PY;
      bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
      bodyA.SynchronizeTransform();
      bodyB.m_sweep.c.x += invMassB * PX;
      bodyB.m_sweep.c.y += invMassB * PY;
      bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
      bodyB.SynchronizeTransform()
    }
  }
  return minSeparation > -1.5 * b2Settings.b2_linearSlop
};
b2ContactSolver.prototype.m_step = new b2TimeStep;
b2ContactSolver.prototype.m_allocator = null;
b2ContactSolver.prototype.m_constraints = new Array;
b2ContactSolver.prototype.m_constraintCount = 0;var b2Simplex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Simplex.prototype.__constructor = function() {
  this.m_vertices[0] = this.m_v1;
  this.m_vertices[1] = this.m_v2;
  this.m_vertices[2] = this.m_v3
};
b2Simplex.prototype.__varz = function() {
  this.m_v1 = new b2SimplexVertex;
  this.m_v2 = new b2SimplexVertex;
  this.m_v3 = new b2SimplexVertex;
  this.m_vertices = new Array(3)
};
b2Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
  b2Settings.b2Assert(0 <= cache.count && cache.count <= 3);
  var wALocal;
  var wBLocal;
  this.m_count = cache.count;
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    var v = vertices[i];
    v.indexA = cache.indexA[i];
    v.indexB = cache.indexB[i];
    wALocal = proxyA.GetVertex(v.indexA);
    wBLocal = proxyB.GetVertex(v.indexB);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    v.a = 0
  }
  if(this.m_count > 1) {
    var metric1 = cache.metric;
    var metric2 = this.GetMetric();
    if(metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
      this.m_count = 0
    }
  }
  if(this.m_count == 0) {
    v = vertices[0];
    v.indexA = 0;
    v.indexB = 0;
    wALocal = proxyA.GetVertex(0);
    wBLocal = proxyB.GetVertex(0);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    this.m_count = 1
  }
};
b2Simplex.prototype.WriteCache = function(cache) {
  cache.metric = this.GetMetric();
  cache.count = parseInt(this.m_count);
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    cache.indexA[i] = parseInt(vertices[i].indexA);
    cache.indexB[i] = parseInt(vertices[i].indexB)
  }
};
b2Simplex.prototype.GetSearchDirection = function() {
  switch(this.m_count) {
    case 1:
      return this.m_v1.w.GetNegative();
    case 2:
      var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
      var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
      if(sgn > 0) {
        return b2Math.CrossFV(1, e12)
      }else {
        return b2Math.CrossVF(e12, 1)
      }
    ;
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetClosestPoint = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return new b2Vec2;
    case 1:
      return this.m_v1.w;
    case 2:
      return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetWitnessPoints = function(pA, pB) {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      break;
    case 1:
      pA.SetV(this.m_v1.wA);
      pB.SetV(this.m_v1.wB);
      break;
    case 2:
      pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
      pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
      pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
      pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
      break;
    case 3:
      pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
      pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
      break;
    default:
      b2Settings.b2Assert(false);
      break
  }
};
b2Simplex.prototype.GetMetric = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return 0;
    case 1:
      return 0;
    case 2:
      return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
    case 3:
      return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2Simplex.prototype.Solve2 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var d12_2 = -(w1.x * e12.x + w1.y * e12.y);
  if(d12_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  var d12_1 = w2.x * e12.x + w2.y * e12.y;
  if(d12_1 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  var inv_d12 = 1 / (d12_1 + d12_2);
  this.m_v1.a = d12_1 * inv_d12;
  this.m_v2.a = d12_2 * inv_d12;
  this.m_count = 2
};
b2Simplex.prototype.Solve3 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var w3 = this.m_v3.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var w1e12 = b2Math.Dot(w1, e12);
  var w2e12 = b2Math.Dot(w2, e12);
  var d12_1 = w2e12;
  var d12_2 = -w1e12;
  var e13 = b2Math.SubtractVV(w3, w1);
  var w1e13 = b2Math.Dot(w1, e13);
  var w3e13 = b2Math.Dot(w3, e13);
  var d13_1 = w3e13;
  var d13_2 = -w1e13;
  var e23 = b2Math.SubtractVV(w3, w2);
  var w2e23 = b2Math.Dot(w2, e23);
  var w3e23 = b2Math.Dot(w3, e23);
  var d23_1 = w3e23;
  var d23_2 = -w2e23;
  var n123 = b2Math.CrossVV(e12, e13);
  var d123_1 = n123 * b2Math.CrossVV(w2, w3);
  var d123_2 = n123 * b2Math.CrossVV(w3, w1);
  var d123_3 = n123 * b2Math.CrossVV(w1, w2);
  if(d12_2 <= 0 && d13_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  if(d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
    return
  }
  if(d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
    var inv_d13 = 1 / (d13_1 + d13_2);
    this.m_v1.a = d13_1 * inv_d13;
    this.m_v3.a = d13_2 * inv_d13;
    this.m_count = 2;
    this.m_v2.Set(this.m_v3);
    return
  }
  if(d12_1 <= 0 && d23_2 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  if(d13_1 <= 0 && d23_1 <= 0) {
    this.m_v3.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v3);
    return
  }
  if(d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
    var inv_d23 = 1 / (d23_1 + d23_2);
    this.m_v2.a = d23_1 * inv_d23;
    this.m_v3.a = d23_2 * inv_d23;
    this.m_count = 2;
    this.m_v1.Set(this.m_v3);
    return
  }
  var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
  this.m_v1.a = d123_1 * inv_d123;
  this.m_v2.a = d123_2 * inv_d123;
  this.m_v3.a = d123_3 * inv_d123;
  this.m_count = 3
};
b2Simplex.prototype.m_v1 = new b2SimplexVertex;
b2Simplex.prototype.m_v2 = new b2SimplexVertex;
b2Simplex.prototype.m_v3 = new b2SimplexVertex;
b2Simplex.prototype.m_vertices = new Array(3);
b2Simplex.prototype.m_count = 0;var b2WeldJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJoint.prototype, b2Joint.prototype);
b2WeldJoint.prototype._super = b2Joint.prototype;
b2WeldJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_impulse.z *= step.dtRatio;
    bA.m_linearVelocity.x -= mA * this.m_impulse.x;
    bA.m_linearVelocity.y -= mA * this.m_impulse.y;
    bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
    bB.m_linearVelocity.x += mB * this.m_impulse.x;
    bB.m_linearVelocity.y += mB * this.m_impulse.y;
    bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero()
  }
};
b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
  var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
  var Cdot2 = wB - wA;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -Cdot1X, -Cdot1Y, -Cdot2);
  this.m_impulse.Add(impulse);
  vA.x -= mA * impulse.x;
  vA.y -= mA * impulse.y;
  wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  vB.x += mB * impulse.x;
  vB.y += mB * impulse.y;
  wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
  var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
  var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
  var angularError = b2Math.Abs(C2);
  if(positionError > k_allowedStretch) {
    iA *= 1;
    iB *= 1
  }
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -C1X, -C1Y, -C2);
  bA.m_sweep.c.x -= mA * impulse.x;
  bA.m_sweep.c.y -= mA * impulse.y;
  bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  bB.m_sweep.c.x += mB * impulse.x;
  bB.m_sweep.c.y += mB * impulse.y;
  bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2WeldJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2WeldJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2WeldJoint.prototype.m_localAnchorA = new b2Vec2;
b2WeldJoint.prototype.m_localAnchorB = new b2Vec2;
b2WeldJoint.prototype.m_referenceAngle = null;
b2WeldJoint.prototype.m_impulse = new b2Vec3;
b2WeldJoint.prototype.m_mass = new b2Mat33;var b2Math = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Math.prototype.__constructor = function() {
};
b2Math.prototype.__varz = function() {
};
b2Math.IsValid = function(x) {
  return isFinite(x)
};
b2Math.Dot = function(a, b) {
  return a.x * b.x + a.y * b.y
};
b2Math.CrossVV = function(a, b) {
  return a.x * b.y - a.y * b.x
};
b2Math.CrossVF = function(a, s) {
  var v = new b2Vec2(s * a.y, -s * a.x);
  return v
};
b2Math.CrossFV = function(s, a) {
  var v = new b2Vec2(-s * a.y, s * a.x);
  return v
};
b2Math.MulMV = function(A, v) {
  var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u
};
b2Math.MulTMV = function(A, v) {
  var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
  return u
};
b2Math.MulX = function(T, v) {
  var a = b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a
};
b2Math.MulXT = function(T, v) {
  var a = b2Math.SubtractVV(v, T.position);
  var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
  a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
  a.x = tX;
  return a
};
b2Math.AddVV = function(a, b) {
  var v = new b2Vec2(a.x + b.x, a.y + b.y);
  return v
};
b2Math.SubtractVV = function(a, b) {
  var v = new b2Vec2(a.x - b.x, a.y - b.y);
  return v
};
b2Math.Distance = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(cX * cX + cY * cY)
};
b2Math.DistanceSquared = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return cX * cX + cY * cY
};
b2Math.MulFV = function(s, a) {
  var v = new b2Vec2(s * a.x, s * a.y);
  return v
};
b2Math.AddMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
  return C
};
b2Math.MulMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
  return C
};
b2Math.MulTMM = function(A, B) {
  var c1 = new b2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
  var c2 = new b2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
  var C = b2Mat22.FromVV(c1, c2);
  return C
};
b2Math.Abs = function(a) {
  return a > 0 ? a : -a
};
b2Math.AbsV = function(a) {
  var b = new b2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
  return b
};
b2Math.AbsM = function(A) {
  var B = b2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
  return B
};
b2Math.Min = function(a, b) {
  return a < b ? a : b
};
b2Math.MinV = function(a, b) {
  var c = new b2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
  return c
};
b2Math.Max = function(a, b) {
  return a > b ? a : b
};
b2Math.MaxV = function(a, b) {
  var c = new b2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
  return c
};
b2Math.Clamp = function(a, low, high) {
  return a < low ? low : a > high ? high : a
};
b2Math.ClampV = function(a, low, high) {
  return b2Math.MaxV(low, b2Math.MinV(a, high))
};
b2Math.Swap = function(a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp
};
b2Math.Random = function() {
  return Math.random() * 2 - 1
};
b2Math.RandomRange = function(lo, hi) {
  var r = Math.random();
  r = (hi - lo) * r + lo;
  return r
};
b2Math.NextPowerOfTwo = function(x) {
  x |= x >> 1 & 2147483647;
  x |= x >> 2 & 1073741823;
  x |= x >> 4 & 268435455;
  x |= x >> 8 & 16777215;
  x |= x >> 16 & 65535;
  return x + 1
};
b2Math.IsPowerOfTwo = function(x) {
  var result = x > 0 && (x & x - 1) == 0;
  return result
};
b2Math.b2Vec2_zero = new b2Vec2(0, 0);
b2Math.b2Mat22_identity = b2Mat22.FromVV(new b2Vec2(1, 0), new b2Vec2(0, 1));
b2Math.b2Transform_identity = new b2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);var b2PulleyJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJoint.prototype, b2Joint.prototype);
b2PulleyJoint.prototype._super = b2Joint.prototype;
b2PulleyJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_ground = this.m_bodyA.m_world.m_groundBody;
  this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
  this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_ratio = def.ratio;
  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
  this.m_maxLength1 = b2Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
  this.m_maxLength2 = b2Math.Min(def.maxLengthB, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
  this.m_impulse = 0;
  this.m_limitImpulse1 = 0;
  this.m_limitImpulse2 = 0
};
b2PulleyJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u1 = new b2Vec2;
  this.m_u2 = new b2Vec2
};
b2PulleyJoint.b2_minPulleyLength = 2;
b2PulleyJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  this.m_u1.Set(p1X - s1X, p1Y - s1Y);
  this.m_u2.Set(p2X - s2X, p2Y - s2Y);
  var length1 = this.m_u1.Length();
  var length2 = this.m_u2.Length();
  if(length1 > b2Settings.b2_linearSlop) {
    this.m_u1.Multiply(1 / length1)
  }else {
    this.m_u1.SetZero()
  }
  if(length2 > b2Settings.b2_linearSlop) {
    this.m_u2.Multiply(1 / length2)
  }else {
    this.m_u2.SetZero()
  }
  var C = this.m_constant - length1 - this.m_ratio * length2;
  if(C > 0) {
    this.m_state = b2Joint.e_inactiveLimit;
    this.m_impulse = 0
  }else {
    this.m_state = b2Joint.e_atUpperLimit
  }
  if(length1 < this.m_maxLength1) {
    this.m_limitState1 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse1 = 0
  }else {
    this.m_limitState1 = b2Joint.e_atUpperLimit
  }
  if(length2 < this.m_maxLength2) {
    this.m_limitState2 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse2 = 0
  }else {
    this.m_limitState2 = b2Joint.e_atUpperLimit
  }
  var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
  var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
  this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
  this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
  this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
  this.m_limitMass1 = 1 / this.m_limitMass1;
  this.m_limitMass2 = 1 / this.m_limitMass2;
  this.m_pulleyMass = 1 / this.m_pulleyMass;
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    this.m_limitImpulse1 *= step.dtRatio;
    this.m_limitImpulse2 *= step.dtRatio;
    var P1X = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
    var P1Y = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
    var P2X = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
    var P2Y = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }else {
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0
  }
};
b2PulleyJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X;
  var v1Y;
  var v2X;
  var v2Y;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var Cdot;
  var impulse;
  var oldImpulse;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = this.m_pulleyMass * -Cdot;
    oldImpulse = this.m_impulse;
    this.m_impulse = b2Math.Max(0, this.m_impulse + impulse);
    impulse = this.m_impulse - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    P2X = -this.m_ratio * impulse * this.m_u2.x;
    P2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
    impulse = -this.m_limitMass1 * Cdot;
    oldImpulse = this.m_limitImpulse1;
    this.m_limitImpulse1 = b2Math.Max(0, this.m_limitImpulse1 + impulse);
    impulse = this.m_limitImpulse1 - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X)
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = -this.m_limitMass2 * Cdot;
    oldImpulse = this.m_limitImpulse2;
    this.m_limitImpulse2 = b2Math.Max(0, this.m_limitImpulse2 + impulse);
    impulse = this.m_limitImpulse2 - oldImpulse;
    P2X = -impulse * this.m_u2.x;
    P2Y = -impulse * this.m_u2.y;
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
};
b2PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var p1X;
  var p1Y;
  var p2X;
  var p2Y;
  var length1;
  var length2;
  var C;
  var impulse;
  var oldImpulse;
  var oldLimitPositionImpulse;
  var tX;
  var linearError = 0;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length1 = this.m_u1.Length();
    length2 = this.m_u2.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.Multiply(1 / length1)
    }else {
      this.m_u1.SetZero()
    }
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.Multiply(1 / length2)
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_constant - length1 - this.m_ratio * length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_pulleyMass * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    p2X = -this.m_ratio * impulse * this.m_u2.x;
    p2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    length1 = this.m_u1.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.x *= 1 / length1;
      this.m_u1.y *= 1 / length1
    }else {
      this.m_u1.SetZero()
    }
    C = this.m_maxLength1 - length1;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass1 * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bA.SynchronizeTransform()
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length2 = this.m_u2.Length();
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.x *= 1 / length2;
      this.m_u2.y *= 1 / length2
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_maxLength2 - length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass2 * C;
    p2X = -impulse * this.m_u2.x;
    p2Y = -impulse * this.m_u2.y;
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bB.SynchronizeTransform()
  }
  return linearError < b2Settings.b2_linearSlop
};
b2PulleyJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PulleyJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PulleyJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y)
};
b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2PulleyJoint.prototype.GetGroundAnchorA = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor1);
  return a
};
b2PulleyJoint.prototype.GetGroundAnchorB = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor2);
  return a
};
b2PulleyJoint.prototype.GetLength1 = function() {
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetLength2 = function() {
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2PulleyJoint.prototype.m_ground = null;
b2PulleyJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_u1 = new b2Vec2;
b2PulleyJoint.prototype.m_u2 = new b2Vec2;
b2PulleyJoint.prototype.m_constant = null;
b2PulleyJoint.prototype.m_ratio = null;
b2PulleyJoint.prototype.m_maxLength1 = null;
b2PulleyJoint.prototype.m_maxLength2 = null;
b2PulleyJoint.prototype.m_pulleyMass = null;
b2PulleyJoint.prototype.m_limitMass1 = null;
b2PulleyJoint.prototype.m_limitMass2 = null;
b2PulleyJoint.prototype.m_impulse = null;
b2PulleyJoint.prototype.m_limitImpulse1 = null;
b2PulleyJoint.prototype.m_limitImpulse2 = null;
b2PulleyJoint.prototype.m_state = 0;
b2PulleyJoint.prototype.m_limitState1 = 0;
b2PulleyJoint.prototype.m_limitState2 = 0;var b2PrismaticJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJoint.prototype, b2Joint.prototype);
b2PrismaticJoint.prototype._super = b2Joint.prototype;
b2PrismaticJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_refAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2PrismaticJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat33;
  this.m_impulse = new b2Vec3
};
b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  if(this.m_motorMass > Number.MIN_VALUE) {
    this.m_motorMass = 1 / this.m_motorMass
  }
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
  this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = i1 + i2;
  this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
  this.m_K.col3.x = this.m_K.col1.z;
  this.m_K.col3.y = this.m_K.col2.z;
  this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.z = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.z = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  var Cdot1Y = w2 - w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve33(new b2Vec3, -Cdot1X, -Cdot1Y, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.z = b2Math.Max(this.m_impulse.z, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.z = b2Math.Min(this.m_impulse.z, 0)
      }
    }
    var bX = -Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
    var bY = -Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
    var f2r = this.m_K.Solve22(new b2Vec2, bX, bY);
    f2r.x += f1.x;
    f2r.y += f1.y;
    this.m_impulse.x = f2r.x;
    this.m_impulse.y = f2r.y;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;
    PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2 = this.m_K.Solve22(new b2Vec2, -Cdot1X, -Cdot1Y);
    this.m_impulse.x += df2.x;
    this.m_impulse.y += df2.y;
    PX = df2.x * this.m_perp.x;
    PY = df2.x * this.m_perp.y;
    L1 = df2.x * this.m_s1 + df2.y;
    L2 = df2.x * this.m_s2 + df2.y;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec3;
  var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
  var C1Y = a2 - a1 - this.m_refAngle;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1X));
  angularError = b2Math.Abs(C1Y);
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve33(impulse, -C1X, -C1Y, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var k12 = i1 * this.m_s1 + i2 * this.m_s2;
    var k22 = i1 + i2;
    this.m_K.col1.Set(k11, k12, 0);
    this.m_K.col2.Set(k12, k22, 0);
    var impulse1 = this.m_K.Solve22(new b2Vec2, -C1X, -C1Y);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2PrismaticJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PrismaticJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2PrismaticJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2PrismaticJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2PrismaticJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2PrismaticJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2PrismaticJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2PrismaticJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2PrismaticJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2PrismaticJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2PrismaticJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2PrismaticJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2PrismaticJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PrismaticJoint.prototype.m_localXAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localYAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_refAngle = null;
b2PrismaticJoint.prototype.m_axis = new b2Vec2;
b2PrismaticJoint.prototype.m_perp = new b2Vec2;
b2PrismaticJoint.prototype.m_s1 = null;
b2PrismaticJoint.prototype.m_s2 = null;
b2PrismaticJoint.prototype.m_a1 = null;
b2PrismaticJoint.prototype.m_a2 = null;
b2PrismaticJoint.prototype.m_K = new b2Mat33;
b2PrismaticJoint.prototype.m_impulse = new b2Vec3;
b2PrismaticJoint.prototype.m_motorMass = null;
b2PrismaticJoint.prototype.m_motorImpulse = null;
b2PrismaticJoint.prototype.m_lowerTranslation = null;
b2PrismaticJoint.prototype.m_upperTranslation = null;
b2PrismaticJoint.prototype.m_maxMotorForce = null;
b2PrismaticJoint.prototype.m_motorSpeed = null;
b2PrismaticJoint.prototype.m_enableLimit = null;
b2PrismaticJoint.prototype.m_enableMotor = null;
b2PrismaticJoint.prototype.m_limitState = 0;var b2RevoluteJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJoint.prototype, b2Joint.prototype);
b2RevoluteJoint.prototype._super = b2Joint.prototype;
b2RevoluteJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorImpulse = 0;
  this.m_lowerAngle = def.lowerAngle;
  this.m_upperAngle = def.upperAngle;
  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit
};
b2RevoluteJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.K3 = new b2Mat22;
  this.impulse3 = new b2Vec3;
  this.impulse2 = new b2Vec2;
  this.reduced = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2RevoluteJoint.tImpulse = new b2Vec2;
b2RevoluteJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  if(this.m_enableMotor || this.m_enableLimit) {
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
  this.m_mass.col2.x = -r1Y * r1X * i1 - r2Y * r2X * i2;
  this.m_mass.col3.x = -r1Y * i1 - r2Y * i2;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
  this.m_mass.col3.y = r1X * i1 + r2X * i2;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = i1 + i2;
  this.m_motorMass = 1 / (i1 + i2);
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(this.m_enableLimit) {
    var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    if(b2Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointAngle <= this.m_lowerAngle) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_impulse.z = 0
        }
        this.m_limitState = b2Joint.e_atLowerLimit
      }else {
        if(jointAngle >= this.m_upperAngle) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_impulse.z = 0
          }
          this.m_limitState = b2Joint.e_atUpperLimit
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x;
    var PY = this.m_impulse.y;
    bA.m_linearVelocity.x -= m1 * PX;
    bA.m_linearVelocity.y -= m1 * PY;
    bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
    bB.m_linearVelocity.x += m2 * PX;
    bB.m_linearVelocity.y += m2 * PY;
    bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2RevoluteJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  var newImpulse;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = w2 - w1 - this.m_motorSpeed;
    var impulse = this.m_motorMass * -Cdot;
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    w1 -= i1 * impulse;
    w2 += i2 * impulse
  }
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var Cdot1X = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
    var Cdot2 = w2 - w1;
    this.m_mass.Solve33(this.impulse3, -Cdot1X, -Cdot1Y, -Cdot2);
    if(this.m_limitState == b2Joint.e_equalLimits) {
      this.m_impulse.Add(this.impulse3)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        newImpulse = this.m_impulse.z + this.impulse3.z;
        if(newImpulse < 0) {
          this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
          this.impulse3.x = this.reduced.x;
          this.impulse3.y = this.reduced.y;
          this.impulse3.z = -this.m_impulse.z;
          this.m_impulse.x += this.reduced.x;
          this.m_impulse.y += this.reduced.y;
          this.m_impulse.z = 0
        }
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          newImpulse = this.m_impulse.z + this.impulse3.z;
          if(newImpulse > 0) {
            this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
            this.impulse3.x = this.reduced.x;
            this.impulse3.y = this.reduced.y;
            this.impulse3.z = -this.m_impulse.z;
            this.m_impulse.x += this.reduced.x;
            this.m_impulse.y += this.reduced.y;
            this.m_impulse.z = 0
          }
        }
      }
    }
    v1.x -= m1 * this.impulse3.x;
    v1.y -= m1 * this.impulse3.y;
    w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
    v2.x += m2 * this.impulse3.x;
    v2.y += m2 * this.impulse3.y;
    w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z)
  }else {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CdotX = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
    this.m_mass.Solve22(this.impulse2, -CdotX, -CdotY);
    this.m_impulse.x += this.impulse2.x;
    this.m_impulse.y += this.impulse2.y;
    v1.x -= m1 * this.impulse2.x;
    v1.y -= m1 * this.impulse2.y;
    w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
    v2.x += m2 * this.impulse2.x;
    v2.y += m2 * this.impulse2.y;
    w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x)
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var oldLimitImpulse;
  var C;
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var angularError = 0;
  var positionError = 0;
  var tX;
  var impulseX;
  var impulseY;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var limitImpulse = 0;
    if(this.m_limitState == b2Joint.e_equalLimits) {
      C = b2Math.Clamp(angle - this.m_lowerAngle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
      limitImpulse = -this.m_motorMass * C;
      angularError = b2Math.Abs(C)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        C = angle - this.m_lowerAngle;
        angularError = -C;
        C = b2Math.Clamp(C + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
        limitImpulse = -this.m_motorMass * C
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          C = angle - this.m_upperAngle;
          angularError = C;
          C = b2Math.Clamp(C - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
          limitImpulse = -this.m_motorMass * C
        }
      }
    }
    bA.m_sweep.a -= bA.m_invI * limitImpulse;
    bB.m_sweep.a += bB.m_invI * limitImpulse;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var CLengthSquared = CX * CX + CY * CY;
  var CLength = Math.sqrt(CLengthSquared);
  positionError = CLength;
  var invMass1 = bA.m_invMass;
  var invMass2 = bB.m_invMass;
  var invI1 = bA.m_invI;
  var invI2 = bB.m_invI;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  if(CLengthSquared > k_allowedStretch * k_allowedStretch) {
    var uX = CX / CLength;
    var uY = CY / CLength;
    var k = invMass1 + invMass2;
    var m = 1 / k;
    impulseX = m * -CX;
    impulseY = m * -CY;
    var k_beta = 0.5;
    bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
    bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
    bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
    bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
    CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y
  }
  this.K1.col1.x = invMass1 + invMass2;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass1 + invMass2;
  this.K2.col1.x = invI1 * r1Y * r1Y;
  this.K2.col2.x = -invI1 * r1X * r1Y;
  this.K2.col1.y = -invI1 * r1X * r1Y;
  this.K2.col2.y = invI1 * r1X * r1X;
  this.K3.col1.x = invI2 * r2Y * r2Y;
  this.K3.col2.x = -invI2 * r2X * r2Y;
  this.K3.col1.y = -invI2 * r2X * r2Y;
  this.K3.col2.y = invI2 * r2X * r2X;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.AddM(this.K3);
  this.K.Solve(b2RevoluteJoint.tImpulse, -CX, -CY);
  impulseX = b2RevoluteJoint.tImpulse.x;
  impulseY = b2RevoluteJoint.tImpulse.y;
  bA.m_sweep.c.x -= bA.m_invMass * impulseX;
  bA.m_sweep.c.y -= bA.m_invMass * impulseY;
  bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
  bB.m_sweep.c.x += bB.m_invMass * impulseX;
  bB.m_sweep.c.y += bB.m_invMass * impulseY;
  bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2RevoluteJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2RevoluteJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2RevoluteJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2RevoluteJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2RevoluteJoint.prototype.GetJointAngle = function() {
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
b2RevoluteJoint.prototype.GetJointSpeed = function() {
  return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
b2RevoluteJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2RevoluteJoint.prototype.EnableLimit = function(flag) {
  this.m_enableLimit = flag
};
b2RevoluteJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerAngle
};
b2RevoluteJoint.prototype.GetUpperLimit = function() {
  return this.m_upperAngle
};
b2RevoluteJoint.prototype.SetLimits = function(lower, upper) {
  this.m_lowerAngle = lower;
  this.m_upperAngle = upper
};
b2RevoluteJoint.prototype.IsMotorEnabled = function() {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  return this.m_enableMotor
};
b2RevoluteJoint.prototype.EnableMotor = function(flag) {
  this.m_enableMotor = flag
};
b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2RevoluteJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2RevoluteJoint.prototype.SetMaxMotorTorque = function(torque) {
  this.m_maxMotorTorque = torque
};
b2RevoluteJoint.prototype.GetMotorTorque = function() {
  return this.m_maxMotorTorque
};
b2RevoluteJoint.prototype.K = new b2Mat22;
b2RevoluteJoint.prototype.K1 = new b2Mat22;
b2RevoluteJoint.prototype.K2 = new b2Mat22;
b2RevoluteJoint.prototype.K3 = new b2Mat22;
b2RevoluteJoint.prototype.impulse3 = new b2Vec3;
b2RevoluteJoint.prototype.impulse2 = new b2Vec2;
b2RevoluteJoint.prototype.reduced = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor1 = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor2 = new b2Vec2;
b2RevoluteJoint.prototype.m_impulse = new b2Vec3;
b2RevoluteJoint.prototype.m_motorImpulse = null;
b2RevoluteJoint.prototype.m_mass = new b2Mat33;
b2RevoluteJoint.prototype.m_motorMass = null;
b2RevoluteJoint.prototype.m_enableMotor = null;
b2RevoluteJoint.prototype.m_maxMotorTorque = null;
b2RevoluteJoint.prototype.m_motorSpeed = null;
b2RevoluteJoint.prototype.m_enableLimit = null;
b2RevoluteJoint.prototype.m_referenceAngle = null;
b2RevoluteJoint.prototype.m_lowerAngle = null;
b2RevoluteJoint.prototype.m_upperAngle = null;
b2RevoluteJoint.prototype.m_limitState = 0;var b2JointDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointDef.prototype.__constructor = function() {
  this.type = b2Joint.e_unknownJoint;
  this.userData = null;
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false
};
b2JointDef.prototype.__varz = function() {
};
b2JointDef.prototype.type = 0;
b2JointDef.prototype.userData = null;
b2JointDef.prototype.bodyA = null;
b2JointDef.prototype.bodyB = null;
b2JointDef.prototype.collideConnected = null;var b2LineJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJointDef.prototype, b2JointDef.prototype);
b2LineJointDef.prototype._super = b2JointDef.prototype;
b2LineJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_lineJoint;
  this.localAxisA.Set(1, 0);
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2LineJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis)
};
b2LineJointDef.prototype.localAnchorA = new b2Vec2;
b2LineJointDef.prototype.localAnchorB = new b2Vec2;
b2LineJointDef.prototype.localAxisA = new b2Vec2;
b2LineJointDef.prototype.enableLimit = null;
b2LineJointDef.prototype.lowerTranslation = null;
b2LineJointDef.prototype.upperTranslation = null;
b2LineJointDef.prototype.enableMotor = null;
b2LineJointDef.prototype.maxMotorForce = null;
b2LineJointDef.prototype.motorSpeed = null;var b2DistanceJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJoint.prototype, b2Joint.prototype);
b2DistanceJoint.prototype._super = b2Joint.prototype;
b2DistanceJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_length = def.length;
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_impulse = 0;
  this.m_gamma = 0;
  this.m_bias = 0
};
b2DistanceJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u = new b2Vec2
};
b2DistanceJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
  if(length > b2Settings.b2_linearSlop) {
    this.m_u.Multiply(1 / length)
  }else {
    this.m_u.SetZero()
  }
  var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
  var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
  var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
  this.m_mass = invMass != 0 ? 1 / invMass : 0;
  if(this.m_frequencyHz > 0) {
    var C = length - this.m_length;
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;
    var k = this.m_mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * step.dt * k * this.m_gamma;
    this.m_mass = invMass + this.m_gamma;
    this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0
  }
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    var PX = this.m_impulse * this.m_u.x;
    var PY = this.m_impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
  }else {
    this.m_impulse = 0
  }
};
b2DistanceJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
  var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
  var v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
  var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
  var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
  var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
  this.m_impulse += impulse;
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_linearVelocity.x -= bA.m_invMass * PX;
  bA.m_linearVelocity.y -= bA.m_invMass * PY;
  bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_linearVelocity.x += bB.m_invMass * PX;
  bB.m_linearVelocity.y += bB.m_invMass * PY;
  bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
};
b2DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  if(this.m_frequencyHz > 0) {
    return true
  }
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(dX * dX + dY * dY);
  dX /= length;
  dY /= length;
  var C = length - this.m_length;
  C = b2Math.Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
  var impulse = -this.m_mass * C;
  this.m_u.Set(dX, dY);
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_sweep.c.x -= bA.m_invMass * PX;
  bA.m_sweep.c.y -= bA.m_invMass * PY;
  bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_sweep.c.x += bB.m_invMass * PX;
  bB.m_sweep.c.y += bB.m_invMass * PY;
  bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return b2Math.Abs(C) < b2Settings.b2_linearSlop
};
b2DistanceJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2DistanceJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2DistanceJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y)
};
b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2DistanceJoint.prototype.GetLength = function() {
  return this.m_length
};
b2DistanceJoint.prototype.SetLength = function(length) {
  this.m_length = length
};
b2DistanceJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2DistanceJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2DistanceJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2DistanceJoint.prototype.m_localAnchor1 = new b2Vec2;
b2DistanceJoint.prototype.m_localAnchor2 = new b2Vec2;
b2DistanceJoint.prototype.m_u = new b2Vec2;
b2DistanceJoint.prototype.m_frequencyHz = null;
b2DistanceJoint.prototype.m_dampingRatio = null;
b2DistanceJoint.prototype.m_gamma = null;
b2DistanceJoint.prototype.m_bias = null;
b2DistanceJoint.prototype.m_impulse = null;
b2DistanceJoint.prototype.m_mass = null;
b2DistanceJoint.prototype.m_length = null;var b2PulleyJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
b2PulleyJointDef.prototype._super = b2JointDef.prototype;
b2PulleyJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_pulleyJoint;
  this.groundAnchorA.Set(-1, 1);
  this.groundAnchorB.Set(1, 1);
  this.localAnchorA.Set(-1, 0);
  this.localAnchorB.Set(1, 0);
  this.lengthA = 0;
  this.maxLengthA = 0;
  this.lengthB = 0;
  this.maxLengthB = 0;
  this.ratio = 1;
  this.collideConnected = true
};
b2PulleyJointDef.prototype.__varz = function() {
  this.groundAnchorA = new b2Vec2;
  this.groundAnchorB = new b2Vec2;
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.SetV(gaA);
  this.groundAnchorB.SetV(gaB);
  this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
  var d1X = anchorA.x - gaA.x;
  var d1Y = anchorA.y - gaA.y;
  this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
  var d2X = anchorB.x - gaB.x;
  var d2Y = anchorB.y - gaB.y;
  this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
  this.ratio = r;
  var C = this.lengthA + this.ratio * this.lengthB;
  this.maxLengthA = C - this.ratio * b2PulleyJoint.b2_minPulleyLength;
  this.maxLengthB = (C - b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
b2PulleyJointDef.prototype.groundAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.groundAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.lengthA = null;
b2PulleyJointDef.prototype.maxLengthA = null;
b2PulleyJointDef.prototype.lengthB = null;
b2PulleyJointDef.prototype.maxLengthB = null;
b2PulleyJointDef.prototype.ratio = null;var b2DistanceJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
b2DistanceJointDef.prototype._super = b2JointDef.prototype;
b2DistanceJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_distanceJoint;
  this.length = 1;
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
  var dX = anchorB.x - anchorA.x;
  var dY = anchorB.y - anchorA.y;
  this.length = Math.sqrt(dX * dX + dY * dY);
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.localAnchorA = new b2Vec2;
b2DistanceJointDef.prototype.localAnchorB = new b2Vec2;
b2DistanceJointDef.prototype.length = null;
b2DistanceJointDef.prototype.frequencyHz = null;
b2DistanceJointDef.prototype.dampingRatio = null;var b2FrictionJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJointDef.prototype, b2JointDef.prototype);
b2FrictionJointDef.prototype._super = b2JointDef.prototype;
b2FrictionJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_frictionJoint;
  this.maxForce = 0;
  this.maxTorque = 0
};
b2FrictionJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2FrictionJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor))
};
b2FrictionJointDef.prototype.localAnchorA = new b2Vec2;
b2FrictionJointDef.prototype.localAnchorB = new b2Vec2;
b2FrictionJointDef.prototype.maxForce = null;
b2FrictionJointDef.prototype.maxTorque = null;var b2WeldJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJointDef.prototype, b2JointDef.prototype);
b2WeldJointDef.prototype._super = b2JointDef.prototype;
b2WeldJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_weldJoint;
  this.referenceAngle = 0
};
b2WeldJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2WeldJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2WeldJointDef.prototype.localAnchorA = new b2Vec2;
b2WeldJointDef.prototype.localAnchorB = new b2Vec2;
b2WeldJointDef.prototype.referenceAngle = null;var b2GearJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJointDef.prototype, b2JointDef.prototype);
b2GearJointDef.prototype._super = b2JointDef.prototype;
b2GearJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_gearJoint;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 1
};
b2GearJointDef.prototype.__varz = function() {
};
b2GearJointDef.prototype.joint1 = null;
b2GearJointDef.prototype.joint2 = null;
b2GearJointDef.prototype.ratio = null;var b2Color = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Color.prototype.__constructor = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__varz = function() {
};
b2Color.prototype.Set = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__defineGetter__("r", function() {
  return this._r
});
b2Color.prototype.__defineSetter__("r", function(rr) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1))
});
b2Color.prototype.__defineGetter__("g", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("g", function(gg) {
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1))
});
b2Color.prototype.__defineGetter__("b", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("b", function(bb) {
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
});
b2Color.prototype.__defineGetter__("color", function() {
  return this._r << 16 | this._g << 8 | this._b
});
b2Color.prototype._r = 0;
b2Color.prototype._g = 0;
b2Color.prototype._b = 0;var b2FrictionJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJoint.prototype, b2Joint.prototype);
b2FrictionJoint.prototype._super = b2Joint.prototype;
b2FrictionJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_linearMass.SetZero();
  this.m_angularMass = 0;
  this.m_linearImpulse.SetZero();
  this.m_angularImpulse = 0;
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque
};
b2FrictionJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_linearImpulse = new b2Vec2;
  this.m_linearMass = new b2Mat22
};
b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var K = new b2Mat22;
  K.col1.x = mA + mB;
  K.col2.x = 0;
  K.col1.y = 0;
  K.col2.y = mA + mB;
  K.col1.x += iA * rAY * rAY;
  K.col2.x += -iA * rAX * rAY;
  K.col1.y += -iA * rAX * rAY;
  K.col2.y += iA * rAX * rAX;
  K.col1.x += iB * rBY * rBY;
  K.col2.x += -iB * rBX * rBY;
  K.col1.y += -iB * rBX * rBY;
  K.col2.y += iB * rBX * rBX;
  K.GetInverse(this.m_linearMass);
  this.m_angularMass = iA + iB;
  if(this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass
  }
  if(step.warmStarting) {
    this.m_linearImpulse.x *= step.dtRatio;
    this.m_linearImpulse.y *= step.dtRatio;
    this.m_angularImpulse *= step.dtRatio;
    var P = this.m_linearImpulse;
    bA.m_linearVelocity.x -= mA * P.x;
    bA.m_linearVelocity.y -= mA * P.y;
    bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
    bB.m_linearVelocity.x += mB * P.x;
    bB.m_linearVelocity.y += mB * P.y;
    bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse)
  }else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0
  }
};
b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var maxImpulse;
  var Cdot = wB - wA;
  var impulse = -this.m_angularMass * Cdot;
  var oldImpulse = this.m_angularImpulse;
  maxImpulse = step.dt * this.m_maxTorque;
  this.m_angularImpulse = b2Math.Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
  impulse = this.m_angularImpulse - oldImpulse;
  wA -= iA * impulse;
  wB += iB * impulse;
  var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
  var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
  var impulseV = b2Math.MulMV(this.m_linearMass, new b2Vec2(-CdotX, -CdotY));
  var oldImpulseV = this.m_linearImpulse.Copy();
  this.m_linearImpulse.Add(impulseV);
  maxImpulse = step.dt * this.m_maxForce;
  if(this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_linearImpulse.Normalize();
    this.m_linearImpulse.Multiply(maxImpulse)
  }
  impulseV = b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
  vA.x -= mA * impulseV.x;
  vA.y -= mA * impulseV.y;
  wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
  vB.x += mB * impulseV.x;
  vB.y += mB * impulseV.y;
  wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2FrictionJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2FrictionJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y)
};
b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_angularImpulse
};
b2FrictionJoint.prototype.SetMaxForce = function(force) {
  this.m_maxForce = force
};
b2FrictionJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
  this.m_maxTorque = torque
};
b2FrictionJoint.prototype.GetMaxTorque = function() {
  return this.m_maxTorque
};
b2FrictionJoint.prototype.m_localAnchorA = new b2Vec2;
b2FrictionJoint.prototype.m_localAnchorB = new b2Vec2;
b2FrictionJoint.prototype.m_linearImpulse = new b2Vec2;
b2FrictionJoint.prototype.m_angularImpulse = null;
b2FrictionJoint.prototype.m_maxForce = null;
b2FrictionJoint.prototype.m_maxTorque = null;
b2FrictionJoint.prototype.m_linearMass = new b2Mat22;
b2FrictionJoint.prototype.m_angularMass = null;var b2Distance = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Distance.prototype.__constructor = function() {
};
b2Distance.prototype.__varz = function() {
};
b2Distance.Distance = function(output, cache, input) {
  ++b2Distance.b2_gjkCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var transformA = input.transformA;
  var transformB = input.transformB;
  var simplex = b2Distance.s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
  var vertices = simplex.m_vertices;
  var k_maxIters = 20;
  var saveA = b2Distance.s_saveA;
  var saveB = b2Distance.s_saveB;
  var saveCount = 0;
  var closestPoint = simplex.GetClosestPoint();
  var distanceSqr1 = closestPoint.LengthSquared();
  var distanceSqr2 = distanceSqr1;
  var i = 0;
  var p;
  var iter = 0;
  while(iter < k_maxIters) {
    saveCount = simplex.m_count;
    for(i = 0;i < saveCount;i++) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB
    }
    switch(simplex.m_count) {
      case 1:
        break;
      case 2:
        simplex.Solve2();
        break;
      case 3:
        simplex.Solve3();
        break;
      default:
        b2Settings.b2Assert(false)
    }
    if(simplex.m_count == 3) {
      break
    }
    p = simplex.GetClosestPoint();
    distanceSqr2 = p.LengthSquared();
    if(distanceSqr2 > distanceSqr1) {
    }
    distanceSqr1 = distanceSqr2;
    var d = simplex.GetSearchDirection();
    if(d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) {
      break
    }
    var vertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Math.MulTMV(transformA.R, d.GetNegative()));
    vertex.wA = b2Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
    vertex.indexB = proxyB.GetSupport(b2Math.MulTMV(transformB.R, d));
    vertex.wB = b2Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
    vertex.w = b2Math.SubtractVV(vertex.wB, vertex.wA);
    ++iter;
    ++b2Distance.b2_gjkIters;
    var duplicate = false;
    for(i = 0;i < saveCount;i++) {
      if(vertex.indexA == saveA[i] && vertex.indexB == saveB[i]) {
        duplicate = true;
        break
      }
    }
    if(duplicate) {
      break
    }
    ++simplex.m_count
  }
  b2Distance.b2_gjkMaxIters = b2Math.Max(b2Distance.b2_gjkMaxIters, iter);
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Math.SubtractVV(output.pointA, output.pointB).Length();
  output.iterations = iter;
  simplex.WriteCache(cache);
  if(input.useRadii) {
    var rA = proxyA.m_radius;
    var rB = proxyB.m_radius;
    if(output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
      output.distance -= rA + rB;
      var normal = b2Math.SubtractVV(output.pointB, output.pointA);
      normal.Normalize();
      output.pointA.x += rA * normal.x;
      output.pointA.y += rA * normal.y;
      output.pointB.x -= rB * normal.x;
      output.pointB.y -= rB * normal.y
    }else {
      p = new b2Vec2;
      p.x = 0.5 * (output.pointA.x + output.pointB.x);
      p.y = 0.5 * (output.pointA.y + output.pointB.y);
      output.pointA.x = output.pointB.x = p.x;
      output.pointA.y = output.pointB.y = p.y;
      output.distance = 0
    }
  }
};
b2Distance.b2_gjkCalls = 0;
b2Distance.b2_gjkIters = 0;
b2Distance.b2_gjkMaxIters = 0;
b2Distance.s_simplex = new b2Simplex;
b2Distance.s_saveA = new Array(3);
b2Distance.s_saveB = new Array(3);var b2MouseJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJoint.prototype, b2Joint.prototype);
b2MouseJoint.prototype._super = b2Joint.prototype;
b2MouseJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_target.SetV(def.target);
  var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
  var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
  var tMat = this.m_bodyB.m_xf.R;
  this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
  this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_beta = 0;
  this.m_gamma = 0
};
b2MouseJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.m_localAnchor = new b2Vec2;
  this.m_target = new b2Vec2;
  this.m_impulse = new b2Vec2;
  this.m_mass = new b2Mat22;
  this.m_C = new b2Vec2
};
b2MouseJoint.prototype.InitVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var mass = b.GetMass();
  var omega = 2 * Math.PI * this.m_frequencyHz;
  var d = 2 * mass * this.m_dampingRatio * omega;
  var k = mass * omega * omega;
  this.m_gamma = step.dt * (d + step.dt * k);
  this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
  this.m_beta = step.dt * k * this.m_gamma;
  var tMat;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var invMass = b.m_invMass;
  var invI = b.m_invI;
  this.K1.col1.x = invMass;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass;
  this.K2.col1.x = invI * rY * rY;
  this.K2.col2.x = -invI * rX * rY;
  this.K2.col1.y = -invI * rX * rY;
  this.K2.col2.y = invI * rX * rX;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.col1.x += this.m_gamma;
  this.K.col2.y += this.m_gamma;
  this.K.GetInverse(this.m_mass);
  this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
  this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
  b.m_angularVelocity *= 0.98;
  this.m_impulse.x *= step.dtRatio;
  this.m_impulse.y *= step.dtRatio;
  b.m_linearVelocity.x += invMass * this.m_impulse.x;
  b.m_linearVelocity.y += invMass * this.m_impulse.y;
  b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x)
};
b2MouseJoint.prototype.SolveVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var tMat;
  var tX;
  var tY;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var CdotX = b.m_linearVelocity.x + -b.m_angularVelocity * rY;
  var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
  tMat = this.m_mass;
  tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
  tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
  var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
  var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);
  var oldImpulseX = this.m_impulse.x;
  var oldImpulseY = this.m_impulse.y;
  this.m_impulse.x += impulseX;
  this.m_impulse.y += impulseY;
  var maxImpulse = step.dt * this.m_maxForce;
  if(this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length())
  }
  impulseX = this.m_impulse.x - oldImpulseX;
  impulseY = this.m_impulse.y - oldImpulseY;
  b.m_linearVelocity.x += b.m_invMass * impulseX;
  b.m_linearVelocity.y += b.m_invMass * impulseY;
  b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX)
};
b2MouseJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2MouseJoint.prototype.GetAnchorA = function() {
  return this.m_target
};
b2MouseJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
b2MouseJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2MouseJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2MouseJoint.prototype.GetTarget = function() {
  return this.m_target
};
b2MouseJoint.prototype.SetTarget = function(target) {
  if(this.m_bodyB.IsAwake() == false) {
    this.m_bodyB.SetAwake(true)
  }
  this.m_target = target
};
b2MouseJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2MouseJoint.prototype.SetMaxForce = function(maxForce) {
  this.m_maxForce = maxForce
};
b2MouseJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2MouseJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2MouseJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2MouseJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2MouseJoint.prototype.K = new b2Mat22;
b2MouseJoint.prototype.K1 = new b2Mat22;
b2MouseJoint.prototype.K2 = new b2Mat22;
b2MouseJoint.prototype.m_localAnchor = new b2Vec2;
b2MouseJoint.prototype.m_target = new b2Vec2;
b2MouseJoint.prototype.m_impulse = new b2Vec2;
b2MouseJoint.prototype.m_mass = new b2Mat22;
b2MouseJoint.prototype.m_C = new b2Vec2;
b2MouseJoint.prototype.m_maxForce = null;
b2MouseJoint.prototype.m_frequencyHz = null;
b2MouseJoint.prototype.m_dampingRatio = null;
b2MouseJoint.prototype.m_beta = null;
b2MouseJoint.prototype.m_gamma = null;var b2PrismaticJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
b2PrismaticJointDef.prototype._super = b2JointDef.prototype;
b2PrismaticJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_prismaticJoint;
  this.localAxisA.Set(1, 0);
  this.referenceAngle = 0;
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2PrismaticJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2PrismaticJointDef.prototype.localAnchorA = new b2Vec2;
b2PrismaticJointDef.prototype.localAnchorB = new b2Vec2;
b2PrismaticJointDef.prototype.localAxisA = new b2Vec2;
b2PrismaticJointDef.prototype.referenceAngle = null;
b2PrismaticJointDef.prototype.enableLimit = null;
b2PrismaticJointDef.prototype.lowerTranslation = null;
b2PrismaticJointDef.prototype.upperTranslation = null;
b2PrismaticJointDef.prototype.enableMotor = null;
b2PrismaticJointDef.prototype.maxMotorForce = null;
b2PrismaticJointDef.prototype.motorSpeed = null;var b2TimeOfImpact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeOfImpact.prototype.__constructor = function() {
};
b2TimeOfImpact.prototype.__varz = function() {
};
b2TimeOfImpact.TimeOfImpact = function(input) {
  ++b2TimeOfImpact.b2_toiCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var sweepA = input.sweepA;
  var sweepB = input.sweepB;
  b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
  b2Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
  var radius = proxyA.m_radius + proxyB.m_radius;
  var tolerance = input.tolerance;
  var alpha = 0;
  var k_maxIterations = 1E3;
  var iter = 0;
  var target = 0;
  b2TimeOfImpact.s_cache.count = 0;
  b2TimeOfImpact.s_distanceInput.useRadii = false;
  for(;;) {
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, alpha);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, alpha);
    b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
    b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
    b2TimeOfImpact.s_distanceInput.transformA = b2TimeOfImpact.s_xfA;
    b2TimeOfImpact.s_distanceInput.transformB = b2TimeOfImpact.s_xfB;
    b2Distance.Distance(b2TimeOfImpact.s_distanceOutput, b2TimeOfImpact.s_cache, b2TimeOfImpact.s_distanceInput);
    if(b2TimeOfImpact.s_distanceOutput.distance <= 0) {
      alpha = 1;
      break
    }
    b2TimeOfImpact.s_fcn.Initialize(b2TimeOfImpact.s_cache, proxyA, b2TimeOfImpact.s_xfA, proxyB, b2TimeOfImpact.s_xfB);
    var separation = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(separation <= 0) {
      alpha = 1;
      break
    }
    if(iter == 0) {
      if(separation > radius) {
        target = b2Math.Max(radius - tolerance, 0.75 * radius)
      }else {
        target = b2Math.Max(separation - tolerance, 0.02 * radius)
      }
    }
    if(separation - target < 0.5 * tolerance) {
      if(iter == 0) {
        alpha = 1;
        break
      }
      break
    }
    var newAlpha = alpha;
    var x1 = alpha;
    var x2 = 1;
    var f1 = separation;
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, x2);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, x2);
    var f2 = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(f2 >= target) {
      alpha = 1;
      break
    }
    var rootIterCount = 0;
    for(;;) {
      var x;
      if(rootIterCount & 1) {
        x = x1 + (target - f1) * (x2 - x1) / (f2 - f1)
      }else {
        x = 0.5 * (x1 + x2)
      }
      sweepA.GetTransform(b2TimeOfImpact.s_xfA, x);
      sweepB.GetTransform(b2TimeOfImpact.s_xfB, x);
      var f = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
      if(b2Math.Abs(f - target) < 0.025 * tolerance) {
        newAlpha = x;
        break
      }
      if(f > target) {
        x1 = x;
        f1 = f
      }else {
        x2 = x;
        f2 = f
      }
      ++rootIterCount;
      ++b2TimeOfImpact.b2_toiRootIters;
      if(rootIterCount == 50) {
        break
      }
    }
    b2TimeOfImpact.b2_toiMaxRootIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
    if(newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha) {
      break
    }
    alpha = newAlpha;
    iter++;
    ++b2TimeOfImpact.b2_toiIters;
    if(iter == k_maxIterations) {
      break
    }
  }
  b2TimeOfImpact.b2_toiMaxIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxIters, iter);
  return alpha
};
b2TimeOfImpact.b2_toiCalls = 0;
b2TimeOfImpact.b2_toiIters = 0;
b2TimeOfImpact.b2_toiMaxIters = 0;
b2TimeOfImpact.b2_toiRootIters = 0;
b2TimeOfImpact.b2_toiMaxRootIters = 0;
b2TimeOfImpact.s_cache = new b2SimplexCache;
b2TimeOfImpact.s_distanceInput = new b2DistanceInput;
b2TimeOfImpact.s_xfA = new b2Transform;
b2TimeOfImpact.s_xfB = new b2Transform;
b2TimeOfImpact.s_fcn = new b2SeparationFunction;
b2TimeOfImpact.s_distanceOutput = new b2DistanceOutput;var b2GearJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJoint.prototype, b2Joint.prototype);
b2GearJoint.prototype._super = b2Joint.prototype;
b2GearJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var type1 = def.joint1.m_type;
  var type2 = def.joint2.m_type;
  this.m_revolute1 = null;
  this.m_prismatic1 = null;
  this.m_revolute2 = null;
  this.m_prismatic2 = null;
  var coordinate1;
  var coordinate2;
  this.m_ground1 = def.joint1.GetBodyA();
  this.m_bodyA = def.joint1.GetBodyB();
  if(type1 == b2Joint.e_revoluteJoint) {
    this.m_revolute1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    this.m_prismatic1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  this.m_ground2 = def.joint2.GetBodyA();
  this.m_bodyB = def.joint2.GetBodyB();
  if(type2 == b2Joint.e_revoluteJoint) {
    this.m_revolute2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    this.m_prismatic2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  this.m_ratio = def.ratio;
  this.m_constant = coordinate1 + this.m_ratio * coordinate2;
  this.m_impulse = 0
};
b2GearJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_J = new b2Jacobian
};
b2GearJoint.prototype.InitVelocityConstraints = function(step) {
  var g1 = this.m_ground1;
  var g2 = this.m_ground2;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var ugX;
  var ugY;
  var rX;
  var rY;
  var tMat;
  var tVec;
  var crug;
  var tX;
  var K = 0;
  this.m_J.SetZero();
  if(this.m_revolute1) {
    this.m_J.angularA = -1;
    K += bA.m_invI
  }else {
    tMat = g1.m_xf.R;
    tVec = this.m_prismatic1.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bA.m_xf.R;
    rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearA.Set(-ugX, -ugY);
    this.m_J.angularA = -crug;
    K += bA.m_invMass + bA.m_invI * crug * crug
  }
  if(this.m_revolute2) {
    this.m_J.angularB = -this.m_ratio;
    K += this.m_ratio * this.m_ratio * bB.m_invI
  }else {
    tMat = g2.m_xf.R;
    tVec = this.m_prismatic2.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bB.m_xf.R;
    rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearB.Set(-this.m_ratio * ugX, -this.m_ratio * ugY);
    this.m_J.angularB = -this.m_ratio * crug;
    K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug)
  }
  this.m_mass = K > 0 ? 1 / K : 0;
  if(step.warmStarting) {
    bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB
  }else {
    this.m_impulse = 0
  }
};
b2GearJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;
  bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB
};
b2GearJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var linearError = 0;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var coordinate1;
  var coordinate2;
  if(this.m_revolute1) {
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  if(this.m_revolute2) {
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
  var impulse = -this.m_mass * C;
  bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError < b2Settings.b2_linearSlop
};
b2GearJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2GearJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2GearJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y)
};
b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
  var tMat = this.m_bodyB.m_xf.R;
  var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
  var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var PX = this.m_impulse * this.m_J.linearB.x;
  var PY = this.m_impulse * this.m_J.linearB.y;
  return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX)
};
b2GearJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2GearJoint.prototype.SetRatio = function(ratio) {
  this.m_ratio = ratio
};
b2GearJoint.prototype.m_ground1 = null;
b2GearJoint.prototype.m_ground2 = null;
b2GearJoint.prototype.m_revolute1 = null;
b2GearJoint.prototype.m_prismatic1 = null;
b2GearJoint.prototype.m_revolute2 = null;
b2GearJoint.prototype.m_prismatic2 = null;
b2GearJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_J = new b2Jacobian;
b2GearJoint.prototype.m_constant = null;
b2GearJoint.prototype.m_ratio = null;
b2GearJoint.prototype.m_mass = null;
b2GearJoint.prototype.m_impulse = null;var b2TOIInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TOIInput.prototype.__constructor = function() {
};
b2TOIInput.prototype.__varz = function() {
  this.proxyA = new b2DistanceProxy;
  this.proxyB = new b2DistanceProxy;
  this.sweepA = new b2Sweep;
  this.sweepB = new b2Sweep
};
b2TOIInput.prototype.proxyA = new b2DistanceProxy;
b2TOIInput.prototype.proxyB = new b2DistanceProxy;
b2TOIInput.prototype.sweepA = new b2Sweep;
b2TOIInput.prototype.sweepB = new b2Sweep;
b2TOIInput.prototype.tolerance = null;var b2RevoluteJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
b2RevoluteJointDef.prototype._super = b2JointDef.prototype;
b2RevoluteJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_revoluteJoint;
  this.localAnchorA.Set(0, 0);
  this.localAnchorB.Set(0, 0);
  this.referenceAngle = 0;
  this.lowerAngle = 0;
  this.upperAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.enableLimit = false;
  this.enableMotor = false
};
b2RevoluteJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2RevoluteJointDef.prototype.localAnchorA = new b2Vec2;
b2RevoluteJointDef.prototype.localAnchorB = new b2Vec2;
b2RevoluteJointDef.prototype.referenceAngle = null;
b2RevoluteJointDef.prototype.enableLimit = null;
b2RevoluteJointDef.prototype.lowerAngle = null;
b2RevoluteJointDef.prototype.upperAngle = null;
b2RevoluteJointDef.prototype.enableMotor = null;
b2RevoluteJointDef.prototype.motorSpeed = null;
b2RevoluteJointDef.prototype.maxMotorTorque = null;var b2MouseJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJointDef.prototype, b2JointDef.prototype);
b2MouseJointDef.prototype._super = b2JointDef.prototype;
b2MouseJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_mouseJoint;
  this.maxForce = 0;
  this.frequencyHz = 5;
  this.dampingRatio = 0.7
};
b2MouseJointDef.prototype.__varz = function() {
  this.target = new b2Vec2
};
b2MouseJointDef.prototype.target = new b2Vec2;
b2MouseJointDef.prototype.maxForce = null;
b2MouseJointDef.prototype.frequencyHz = null;
b2MouseJointDef.prototype.dampingRatio = null;var b2Contact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Contact.prototype.__constructor = function() {
};
b2Contact.prototype.__varz = function() {
  this.m_nodeA = new b2ContactEdge;
  this.m_nodeB = new b2ContactEdge;
  this.m_manifold = new b2Manifold;
  this.m_oldManifold = new b2Manifold
};
b2Contact.s_input = new b2TOIInput;
b2Contact.e_sensorFlag = 1;
b2Contact.e_continuousFlag = 2;
b2Contact.e_islandFlag = 4;
b2Contact.e_toiFlag = 8;
b2Contact.e_touchingFlag = 16;
b2Contact.e_enabledFlag = 32;
b2Contact.e_filterFlag = 64;
b2Contact.prototype.Reset = function(fixtureA, fixtureB) {
  this.m_flags = b2Contact.e_enabledFlag;
  if(!fixtureA || !fixtureB) {
    this.m_fixtureA = null;
    this.m_fixtureB = null;
    return
  }
  if(fixtureA.IsSensor() || fixtureB.IsSensor()) {
    this.m_flags |= b2Contact.e_sensorFlag
  }
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
    this.m_flags |= b2Contact.e_continuousFlag
  }
  this.m_fixtureA = fixtureA;
  this.m_fixtureB = fixtureB;
  this.m_manifold.m_pointCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_nodeA.contact = null;
  this.m_nodeA.prev = null;
  this.m_nodeA.next = null;
  this.m_nodeA.other = null;
  this.m_nodeB.contact = null;
  this.m_nodeB.prev = null;
  this.m_nodeB.next = null;
  this.m_nodeB.other = null
};
b2Contact.prototype.Update = function(listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.m_flags |= b2Contact.e_enabledFlag;
  var touching = false;
  var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
  var bodyA = this.m_fixtureA.m_body;
  var bodyB = this.m_fixtureB.m_body;
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
  if(this.m_flags & b2Contact.e_sensorFlag) {
    if(aabbOverlap) {
      var shapeA = this.m_fixtureA.GetShape();
      var shapeB = this.m_fixtureB.GetShape();
      var xfA = bodyA.GetTransform();
      var xfB = bodyB.GetTransform();
      touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB)
    }
    this.m_manifold.m_pointCount = 0
  }else {
    if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
      this.m_flags |= b2Contact.e_continuousFlag
    }else {
      this.m_flags &= ~b2Contact.e_continuousFlag
    }
    if(aabbOverlap) {
      this.Evaluate();
      touching = this.m_manifold.m_pointCount > 0;
      for(var i = 0;i < this.m_manifold.m_pointCount;++i) {
        var mp2 = this.m_manifold.m_points[i];
        mp2.m_normalImpulse = 0;
        mp2.m_tangentImpulse = 0;
        var id2 = mp2.m_id;
        for(var j = 0;j < this.m_oldManifold.m_pointCount;++j) {
          var mp1 = this.m_oldManifold.m_points[j];
          if(mp1.m_id.key == id2.key) {
            mp2.m_normalImpulse = mp1.m_normalImpulse;
            mp2.m_tangentImpulse = mp1.m_tangentImpulse;
            break
          }
        }
      }
    }else {
      this.m_manifold.m_pointCount = 0
    }
    if(touching != wasTouching) {
      bodyA.SetAwake(true);
      bodyB.SetAwake(true)
    }
  }
  if(touching) {
    this.m_flags |= b2Contact.e_touchingFlag
  }else {
    this.m_flags &= ~b2Contact.e_touchingFlag
  }
  if(wasTouching == false && touching == true) {
    listener.BeginContact(this)
  }
  if(wasTouching == true && touching == false) {
    listener.EndContact(this)
  }
  if((this.m_flags & b2Contact.e_sensorFlag) == 0) {
    listener.PreSolve(this, this.m_oldManifold)
  }
};
b2Contact.prototype.Evaluate = function() {
};
b2Contact.prototype.ComputeTOI = function(sweepA, sweepB) {
  b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  b2Contact.s_input.sweepA = sweepA;
  b2Contact.s_input.sweepB = sweepB;
  b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
  return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input)
};
b2Contact.prototype.GetManifold = function() {
  return this.m_manifold
};
b2Contact.prototype.GetWorldManifold = function(worldManifold) {
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var shapeA = this.m_fixtureA.GetShape();
  var shapeB = this.m_fixtureB.GetShape();
  worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius)
};
b2Contact.prototype.IsTouching = function() {
  return(this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag
};
b2Contact.prototype.IsContinuous = function() {
  return(this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag
};
b2Contact.prototype.SetSensor = function(sensor) {
  if(sensor) {
    this.m_flags |= b2Contact.e_sensorFlag
  }else {
    this.m_flags &= ~b2Contact.e_sensorFlag
  }
};
b2Contact.prototype.IsSensor = function() {
  return(this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag
};
b2Contact.prototype.SetEnabled = function(flag) {
  if(flag) {
    this.m_flags |= b2Contact.e_enabledFlag
  }else {
    this.m_flags &= ~b2Contact.e_enabledFlag
  }
};
b2Contact.prototype.IsEnabled = function() {
  return(this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag
};
b2Contact.prototype.GetNext = function() {
  return this.m_next
};
b2Contact.prototype.GetFixtureA = function() {
  return this.m_fixtureA
};
b2Contact.prototype.GetFixtureB = function() {
  return this.m_fixtureB
};
b2Contact.prototype.FlagForFiltering = function() {
  this.m_flags |= b2Contact.e_filterFlag
};
b2Contact.prototype.m_flags = 0;
b2Contact.prototype.m_prev = null;
b2Contact.prototype.m_next = null;
b2Contact.prototype.m_nodeA = new b2ContactEdge;
b2Contact.prototype.m_nodeB = new b2ContactEdge;
b2Contact.prototype.m_fixtureA = null;
b2Contact.prototype.m_fixtureB = null;
b2Contact.prototype.m_manifold = new b2Manifold;
b2Contact.prototype.m_oldManifold = new b2Manifold;
b2Contact.prototype.m_toi = null;var b2ContactConstraint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraint.prototype.__constructor = function() {
  this.points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.points[i] = new b2ContactConstraintPoint
  }
};
b2ContactConstraint.prototype.__varz = function() {
  this.localPlaneNormal = new b2Vec2;
  this.localPoint = new b2Vec2;
  this.normal = new b2Vec2;
  this.normalMass = new b2Mat22;
  this.K = new b2Mat22
};
b2ContactConstraint.prototype.points = null;
b2ContactConstraint.prototype.localPlaneNormal = new b2Vec2;
b2ContactConstraint.prototype.localPoint = new b2Vec2;
b2ContactConstraint.prototype.normal = new b2Vec2;
b2ContactConstraint.prototype.normalMass = new b2Mat22;
b2ContactConstraint.prototype.K = new b2Mat22;
b2ContactConstraint.prototype.bodyA = null;
b2ContactConstraint.prototype.bodyB = null;
b2ContactConstraint.prototype.type = 0;
b2ContactConstraint.prototype.radius = null;
b2ContactConstraint.prototype.friction = null;
b2ContactConstraint.prototype.restitution = null;
b2ContactConstraint.prototype.pointCount = 0;
b2ContactConstraint.prototype.manifold = null;var b2ContactResult = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactResult.prototype.__constructor = function() {
};
b2ContactResult.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactResult.prototype.shape1 = null;
b2ContactResult.prototype.shape2 = null;
b2ContactResult.prototype.position = new b2Vec2;
b2ContactResult.prototype.normal = new b2Vec2;
b2ContactResult.prototype.normalImpulse = null;
b2ContactResult.prototype.tangentImpulse = null;
b2ContactResult.prototype.id = new b2ContactID;var b2PolygonContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonContact.prototype, b2Contact.prototype);
b2PolygonContact.prototype._super = b2Contact.prototype;
b2PolygonContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolygonContact.prototype.__varz = function() {
};
b2PolygonContact.Create = function(allocator) {
  return new b2PolygonContact
};
b2PolygonContact.Destroy = function(contact, allocator) {
};
b2PolygonContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolygonContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var ClipVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
ClipVertex.prototype.__constructor = function() {
};
ClipVertex.prototype.__varz = function() {
  this.v = new b2Vec2;
  this.id = new b2ContactID
};
ClipVertex.prototype.Set = function(other) {
  this.v.SetV(other.v);
  this.id.Set(other.id)
};
ClipVertex.prototype.v = new b2Vec2;
ClipVertex.prototype.id = new b2ContactID;var b2ContactFilter = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFilter.prototype.__constructor = function() {
};
b2ContactFilter.prototype.__varz = function() {
};
b2ContactFilter.b2_defaultFilter = new b2ContactFilter;
b2ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB) {
  var filter1 = fixtureA.GetFilterData();
  var filter2 = fixtureB.GetFilterData();
  if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
    return filter1.groupIndex > 0
  }
  var collide = (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
  return collide
};
b2ContactFilter.prototype.RayCollide = function(userData, fixture) {
  if(!userData) {
    return true
  }
  return this.ShouldCollide(userData, fixture)
};var b2NullContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2NullContact.prototype, b2Contact.prototype);
b2NullContact.prototype._super = b2Contact.prototype;
b2NullContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2NullContact.prototype.__varz = function() {
};
b2NullContact.prototype.Evaluate = function() {
};var b2ContactListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactListener.prototype.__constructor = function() {
};
b2ContactListener.prototype.__varz = function() {
};
b2ContactListener.b2_defaultListener = new b2ContactListener;
b2ContactListener.prototype.BeginContact = function(contact) {
};
b2ContactListener.prototype.EndContact = function(contact) {
};
b2ContactListener.prototype.PreSolve = function(contact, oldManifold) {
};
b2ContactListener.prototype.PostSolve = function(contact, impulse) {
};var b2Island = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Island.prototype.__constructor = function() {
  this.m_bodies = new Array;
  this.m_contacts = new Array;
  this.m_joints = new Array
};
b2Island.prototype.__varz = function() {
};
b2Island.s_impulse = new b2ContactImpulse;
b2Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
  var i = 0;
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_allocator = allocator;
  this.m_listener = listener;
  this.m_contactSolver = contactSolver;
  for(i = this.m_bodies.length;i < bodyCapacity;i++) {
    this.m_bodies[i] = null
  }
  for(i = this.m_contacts.length;i < contactCapacity;i++) {
    this.m_contacts[i] = null
  }
  for(i = this.m_joints.length;i < jointCapacity;i++) {
    this.m_joints[i] = null
  }
};
b2Island.prototype.Clear = function() {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0
};
b2Island.prototype.Solve = function(step, gravity, allowSleep) {
  var i = 0;
  var j = 0;
  var b;
  var joint;
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() != b2Body.b2_dynamicBody) {
      continue
    }
    b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
    b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
    b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
    b.m_linearVelocity.Multiply(b2Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
    b.m_angularVelocity *= b2Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1)
  }
  this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  contactSolver.InitVelocityConstraints(step);
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.InitVelocityConstraints(step)
  }
  for(i = 0;i < step.velocityIterations;++i) {
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      joint.SolveVelocityConstraints(step)
    }
    contactSolver.SolveVelocityConstraints()
  }
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.FinalizeVelocityConstraints()
  }
  contactSolver.FinalizeVelocityConstraints();
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = step.dt * b.m_linearVelocity.x;
    var translationY = step.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt
    }
    var rotation = step.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * step.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * step.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
    b.m_sweep.a += step.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  for(i = 0;i < step.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints);
  if(allowSleep) {
    var minSleepTime = Number.MAX_VALUE;
    var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
    var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
    for(i = 0;i < this.m_bodyCount;++i) {
      b = this.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }else {
        b.m_sleepTime += step.dt;
        minSleepTime = b2Math.Min(minSleepTime, b.m_sleepTime)
      }
    }
    if(minSleepTime >= b2Settings.b2_timeToSleep) {
      for(i = 0;i < this.m_bodyCount;++i) {
        b = this.m_bodies[i];
        b.SetAwake(false)
      }
    }
  }
};
b2Island.prototype.SolveTOI = function(subStep) {
  var i = 0;
  var j = 0;
  this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  for(i = 0;i < this.m_jointCount;++i) {
    this.m_joints[i].InitVelocityConstraints(subStep)
  }
  for(i = 0;i < subStep.velocityIterations;++i) {
    contactSolver.SolveVelocityConstraints();
    for(j = 0;j < this.m_jointCount;++j) {
      this.m_joints[j].SolveVelocityConstraints(subStep)
    }
  }
  for(i = 0;i < this.m_bodyCount;++i) {
    var b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = subStep.dt * b.m_linearVelocity.x;
    var translationY = subStep.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt
    }
    var rotation = subStep.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * subStep.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
    b.m_sweep.a += subStep.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  var k_toiBaumgarte = 0.75;
  for(i = 0;i < subStep.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints)
};
b2Island.prototype.Report = function(constraints) {
  if(this.m_listener == null) {
    return
  }
  for(var i = 0;i < this.m_contactCount;++i) {
    var c = this.m_contacts[i];
    var cc = constraints[i];
    for(var j = 0;j < cc.pointCount;++j) {
      b2Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
      b2Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse
    }
    this.m_listener.PostSolve(c, b2Island.s_impulse)
  }
};
b2Island.prototype.AddBody = function(body) {
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body
};
b2Island.prototype.AddContact = function(contact) {
  this.m_contacts[this.m_contactCount++] = contact
};
b2Island.prototype.AddJoint = function(joint) {
  this.m_joints[this.m_jointCount++] = joint
};
b2Island.prototype.m_allocator = null;
b2Island.prototype.m_listener = null;
b2Island.prototype.m_contactSolver = null;
b2Island.prototype.m_bodies = null;
b2Island.prototype.m_contacts = null;
b2Island.prototype.m_joints = null;
b2Island.prototype.m_bodyCount = 0;
b2Island.prototype.m_jointCount = 0;
b2Island.prototype.m_contactCount = 0;
b2Island.prototype.m_bodyCapacity = 0;
b2Island.prototype.m_contactCapacity = 0;
b2Island.prototype.m_jointCapacity = 0;var b2PolyAndEdgeContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndEdgeContact.prototype, b2Contact.prototype);
b2PolyAndEdgeContact.prototype._super = b2Contact.prototype;
b2PolyAndEdgeContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndEdgeContact.prototype.__varz = function() {
};
b2PolyAndEdgeContact.Create = function(allocator) {
  return new b2PolyAndEdgeContact
};
b2PolyAndEdgeContact.Destroy = function(contact, allocator) {
};
b2PolyAndEdgeContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function(manifold, polygon, xf1, edge, xf2) {
};
b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape)
};var b2Collision = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Collision.prototype.__constructor = function() {
};
b2Collision.prototype.__varz = function() {
};
b2Collision.MakeClipPointVector = function() {
  var r = new Array(2);
  r[0] = new ClipVertex;
  r[1] = new ClipVertex;
  return r
};
b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset) {
  var cv;
  var numOut = 0;
  cv = vIn[0];
  var vIn0 = cv.v;
  cv = vIn[1];
  var vIn1 = cv.v;
  var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
  var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
  if(distance0 <= 0) {
    vOut[numOut++].Set(vIn[0])
  }
  if(distance1 <= 0) {
    vOut[numOut++].Set(vIn[1])
  }
  if(distance0 * distance1 < 0) {
    var interp = distance0 / (distance0 - distance1);
    cv = vOut[numOut];
    var tVec = cv.v;
    tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
    tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
    cv = vOut[numOut];
    var cv2;
    if(distance0 > 0) {
      cv2 = vIn[0];
      cv.id = cv2.id
    }else {
      cv2 = vIn[1];
      cv.id = cv2.id
    }
    ++numOut
  }
  return numOut
};
b2Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
  var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = vertices2[i];
    var dot = tVec.x * normal1X + tVec.y * normal1Y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  tVec = vertices1[edge1];
  tMat = xf1.R;
  var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tVec = vertices2[index];
  tMat = xf2.R;
  var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  v2X -= v1X;
  v2Y -= v1Y;
  var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
  return separation
};
b2Collision.FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = poly2.m_centroid;
  var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf1.R;
  tVec = poly1.m_centroid;
  dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
  var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
  var edge = 0;
  var maxDot = -Number.MAX_VALUE;
  for(var i = 0;i < count1;++i) {
    tVec = normals1[i];
    var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;
    if(dot > maxDot) {
      maxDot = dot;
      edge = i
    }
  }
  var s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
  var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
  var sPrev = b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
  var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
  var sNext = b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
  var bestEdge = 0;
  var bestSeparation;
  var increment = 0;
  if(sPrev > s && sPrev > sNext) {
    increment = -1;
    bestEdge = prevEdge;
    bestSeparation = sPrev
  }else {
    if(sNext > s) {
      increment = 1;
      bestEdge = nextEdge;
      bestSeparation = sNext
    }else {
      edgeIndex[0] = edge;
      return s
    }
  }
  while(true) {
    if(increment == -1) {
      edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1
    }else {
      edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0
    }
    s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    if(s > bestSeparation) {
      bestEdge = edge;
      bestSeparation = s
    }else {
      break
    }
  }
  edgeIndex[0] = bestEdge;
  return bestSeparation
};
b2Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
  normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
  normal1X = tX;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = normals2[i];
    var dot = normal1X * tVec.x + normal1Y * tVec.y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  var tClip;
  var i1 = index;
  var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  tClip = c[0];
  tVec = vertices2[i1];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i1;
  tClip.id.features.incidentVertex = 0;
  tClip = c[1];
  tVec = vertices2[i2];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i2;
  tClip.id.features.incidentVertex = 1
};
b2Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
  var cv;
  manifold.m_pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;
  var edgeA = 0;
  b2Collision.s_edgeAO[0] = edgeA;
  var separationA = b2Collision.FindMaxSeparation(b2Collision.s_edgeAO, polyA, xfA, polyB, xfB);
  edgeA = b2Collision.s_edgeAO[0];
  if(separationA > totalRadius) {
    return
  }
  var edgeB = 0;
  b2Collision.s_edgeBO[0] = edgeB;
  var separationB = b2Collision.FindMaxSeparation(b2Collision.s_edgeBO, polyB, xfB, polyA, xfA);
  edgeB = b2Collision.s_edgeBO[0];
  if(separationB > totalRadius) {
    return
  }
  var poly1;
  var poly2;
  var xf1;
  var xf2;
  var edge1 = 0;
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.0010;
  var tMat;
  if(separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB;
    manifold.m_type = b2Manifold.e_faceB;
    flip = 1
  }else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA;
    manifold.m_type = b2Manifold.e_faceA;
    flip = 0
  }
  var incidentEdge = b2Collision.s_incidentEdge;
  b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var local_v11 = vertices1[edge1];
  var local_v12;
  if(edge1 + 1 < count1) {
    local_v12 = vertices1[parseInt(edge1 + 1)]
  }else {
    local_v12 = vertices1[0]
  }
  var localTangent = b2Collision.s_localTangent;
  localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
  localTangent.Normalize();
  var localNormal = b2Collision.s_localNormal;
  localNormal.x = localTangent.y;
  localNormal.y = -localTangent.x;
  var planePoint = b2Collision.s_planePoint;
  planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
  var tangent = b2Collision.s_tangent;
  tMat = xf1.R;
  tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
  tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
  var tangent2 = b2Collision.s_tangent2;
  tangent2.x = -tangent.x;
  tangent2.y = -tangent.y;
  var normal = b2Collision.s_normal;
  normal.x = tangent.y;
  normal.y = -tangent.x;
  var v11 = b2Collision.s_v11;
  var v12 = b2Collision.s_v12;
  v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
  v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
  v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
  v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
  var frontOffset = normal.x * v11.x + normal.y * v11.y;
  var sideOffset1 = -tangent.x * v11.x - tangent.y * v11.y + totalRadius;
  var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
  var clipPoints1 = b2Collision.s_clipPoints1;
  var clipPoints2 = b2Collision.s_clipPoints2;
  var np = 0;
  np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);
  if(np < 2) {
    return
  }
  np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);
  if(np < 2) {
    return
  }
  manifold.m_localPlaneNormal.SetV(localNormal);
  manifold.m_localPoint.SetV(planePoint);
  var pointCount = 0;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;++i) {
    cv = clipPoints2[i];
    var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;
    if(separation <= totalRadius) {
      var cp = manifold.m_points[pointCount];
      tMat = xf2.R;
      var tX = cv.v.x - xf2.position.x;
      var tY = cv.v.y - xf2.position.y;
      cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
      cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
      cp.m_id.Set(cv.id);
      cp.m_id.features.flip = flip;
      ++pointCount
    }
  }
  manifold.m_pointCount = pointCount
};
b2Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2) {
  manifold.m_pointCount = 0;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = circle1.m_p;
  var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf2.R;
  tVec = circle2.m_p;
  var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var distSqr = dX * dX + dY * dY;
  var radius = circle1.m_radius + circle2.m_radius;
  if(distSqr > radius * radius) {
    return
  }
  manifold.m_type = b2Manifold.e_circles;
  manifold.m_localPoint.SetV(circle1.m_p);
  manifold.m_localPlaneNormal.SetZero();
  manifold.m_pointCount = 1;
  manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
  manifold.m_points[0].m_id.key = 0
};
b2Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
  manifold.m_pointCount = 0;
  var tPoint;
  var dX;
  var dY;
  var positionX;
  var positionY;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = circle.m_p;
  var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  dX = cX - xf1.position.x;
  dY = cY - xf1.position.y;
  tMat = xf1.R;
  var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
  var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
  var dist;
  var normalIndex = 0;
  var separation = -Number.MAX_VALUE;
  var radius = polygon.m_radius + circle.m_radius;
  var vertexCount = polygon.m_vertexCount;
  var vertices = polygon.m_vertices;
  var normals = polygon.m_normals;
  for(var i = 0;i < vertexCount;++i) {
    tVec = vertices[i];
    dX = cLocalX - tVec.x;
    dY = cLocalY - tVec.y;
    tVec = normals[i];
    var s = tVec.x * dX + tVec.y * dY;
    if(s > radius) {
      return
    }
    if(s > separation) {
      separation = s;
      normalIndex = i
    }
  }
  var vertIndex1 = normalIndex;
  var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
  var v1 = vertices[vertIndex1];
  var v2 = vertices[vertIndex2];
  if(separation < Number.MIN_VALUE) {
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
    manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
    manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
    return
  }
  var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
  var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
  if(u1 <= 0) {
    if((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) {
      return
    }
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.x = cLocalX - v1.x;
    manifold.m_localPlaneNormal.y = cLocalY - v1.y;
    manifold.m_localPlaneNormal.Normalize();
    manifold.m_localPoint.SetV(v1);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0
  }else {
    if(u2 <= 0) {
      if((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = cLocalX - v2.x;
      manifold.m_localPlaneNormal.y = cLocalY - v2.y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.SetV(v2);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }else {
      var faceCenterX = 0.5 * (v1.x + v2.x);
      var faceCenterY = 0.5 * (v1.y + v2.y);
      separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
      if(separation > radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
      manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.Set(faceCenterX, faceCenterY);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }
  }
};
b2Collision.TestOverlap = function(a, b) {
  var t1 = b.lowerBound;
  var t2 = a.upperBound;
  var d1X = t1.x - t2.x;
  var d1Y = t1.y - t2.y;
  t1 = a.lowerBound;
  t2 = b.upperBound;
  var d2X = t1.x - t2.x;
  var d2Y = t1.y - t2.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2Collision.b2_nullFeature = 255;
b2Collision.s_incidentEdge = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints1 = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints2 = b2Collision.MakeClipPointVector();
b2Collision.s_edgeAO = new Array(1);
b2Collision.s_edgeBO = new Array(1);
b2Collision.s_localTangent = new b2Vec2;
b2Collision.s_localNormal = new b2Vec2;
b2Collision.s_planePoint = new b2Vec2;
b2Collision.s_normal = new b2Vec2;
b2Collision.s_tangent = new b2Vec2;
b2Collision.s_tangent2 = new b2Vec2;
b2Collision.s_v11 = new b2Vec2;
b2Collision.s_v12 = new b2Vec2;
b2Collision.b2CollidePolyTempVec = new b2Vec2;var b2PolyAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
b2PolyAndCircleContact.prototype._super = b2Contact.prototype;
b2PolyAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndCircleContact.prototype.__varz = function() {
};
b2PolyAndCircleContact.Create = function(allocator) {
  return new b2PolyAndCircleContact
};
b2PolyAndCircleContact.Destroy = function(contact, allocator) {
};
b2PolyAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.m_body;
  var bB = this.m_fixtureB.m_body;
  b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape)
};var b2ContactPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactPoint.prototype.__constructor = function() {
};
b2ContactPoint.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.velocity = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactPoint.prototype.shape1 = null;
b2ContactPoint.prototype.shape2 = null;
b2ContactPoint.prototype.position = new b2Vec2;
b2ContactPoint.prototype.velocity = new b2Vec2;
b2ContactPoint.prototype.normal = new b2Vec2;
b2ContactPoint.prototype.separation = null;
b2ContactPoint.prototype.friction = null;
b2ContactPoint.prototype.restitution = null;
b2ContactPoint.prototype.id = new b2ContactID;var b2CircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleContact.prototype, b2Contact.prototype);
b2CircleContact.prototype._super = b2Contact.prototype;
b2CircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2CircleContact.prototype.__varz = function() {
};
b2CircleContact.Create = function(allocator) {
  return new b2CircleContact
};
b2CircleContact.Destroy = function(contact, allocator) {
};
b2CircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2CircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2EdgeAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeAndCircleContact.prototype, b2Contact.prototype);
b2EdgeAndCircleContact.prototype._super = b2Contact.prototype;
b2EdgeAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2EdgeAndCircleContact.prototype.__varz = function() {
};
b2EdgeAndCircleContact.Create = function(allocator) {
  return new b2EdgeAndCircleContact
};
b2EdgeAndCircleContact.Destroy = function(contact, allocator) {
};
b2EdgeAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2) {
};
b2EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2ContactManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactManager.prototype.__constructor = function() {
  this.m_world = null;
  this.m_contactCount = 0;
  this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
  this.m_contactListener = b2ContactListener.b2_defaultListener;
  this.m_contactFactory = new b2ContactFactory(this.m_allocator);
  this.m_broadPhase = new b2DynamicTreeBroadPhase
};
b2ContactManager.prototype.__varz = function() {
};
b2ContactManager.s_evalCP = new b2ContactPoint;
b2ContactManager.prototype.AddPair = function(proxyUserDataA, proxyUserDataB) {
  var fixtureA = proxyUserDataA;
  var fixtureB = proxyUserDataB;
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA == bodyB) {
    return
  }
  var edge = bodyB.GetContactList();
  while(edge) {
    if(edge.other == bodyA) {
      var fA = edge.contact.GetFixtureA();
      var fB = edge.contact.GetFixtureB();
      if(fA == fixtureA && fB == fixtureB) {
        return
      }
      if(fA == fixtureB && fB == fixtureA) {
        return
      }
    }
    edge = edge.next
  }
  if(bodyB.ShouldCollide(bodyA) == false) {
    return
  }
  if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
    return
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
  fixtureA = c.GetFixtureA();
  fixtureB = c.GetFixtureB();
  bodyA = fixtureA.m_body;
  bodyB = fixtureB.m_body;
  c.m_prev = null;
  c.m_next = this.m_world.m_contactList;
  if(this.m_world.m_contactList != null) {
    this.m_world.m_contactList.m_prev = c
  }
  this.m_world.m_contactList = c;
  c.m_nodeA.contact = c;
  c.m_nodeA.other = bodyB;
  c.m_nodeA.prev = null;
  c.m_nodeA.next = bodyA.m_contactList;
  if(bodyA.m_contactList != null) {
    bodyA.m_contactList.prev = c.m_nodeA
  }
  bodyA.m_contactList = c.m_nodeA;
  c.m_nodeB.contact = c;
  c.m_nodeB.other = bodyA;
  c.m_nodeB.prev = null;
  c.m_nodeB.next = bodyB.m_contactList;
  if(bodyB.m_contactList != null) {
    bodyB.m_contactList.prev = c.m_nodeB
  }
  bodyB.m_contactList = c.m_nodeB;
  ++this.m_world.m_contactCount;
  return
};
b2ContactManager.prototype.FindNewContacts = function() {
  var that = this;
  this.m_broadPhase.UpdatePairs(function(a, b) {
    return that.AddPair(a, b)
  })
};
b2ContactManager.prototype.Destroy = function(c) {
  var fixtureA = c.GetFixtureA();
  var fixtureB = c.GetFixtureB();
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(c.IsTouching()) {
    this.m_contactListener.EndContact(c)
  }
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(c == this.m_world.m_contactList) {
    this.m_world.m_contactList = c.m_next
  }
  if(c.m_nodeA.prev) {
    c.m_nodeA.prev.next = c.m_nodeA.next
  }
  if(c.m_nodeA.next) {
    c.m_nodeA.next.prev = c.m_nodeA.prev
  }
  if(c.m_nodeA == bodyA.m_contactList) {
    bodyA.m_contactList = c.m_nodeA.next
  }
  if(c.m_nodeB.prev) {
    c.m_nodeB.prev.next = c.m_nodeB.next
  }
  if(c.m_nodeB.next) {
    c.m_nodeB.next.prev = c.m_nodeB.prev
  }
  if(c.m_nodeB == bodyB.m_contactList) {
    bodyB.m_contactList = c.m_nodeB.next
  }
  this.m_contactFactory.Destroy(c);
  --this.m_contactCount
};
b2ContactManager.prototype.Collide = function() {
  var c = this.m_world.m_contactList;
  while(c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if(bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
      c = c.GetNext();
      continue
    }
    if(c.m_flags & b2Contact.e_filterFlag) {
      if(bodyB.ShouldCollide(bodyA) == false) {
        var cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
        cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      c.m_flags &= ~b2Contact.e_filterFlag
    }
    var proxyA = fixtureA.m_proxy;
    var proxyB = fixtureB.m_proxy;
    var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
    if(overlap == false) {
      cNuke = c;
      c = cNuke.GetNext();
      this.Destroy(cNuke);
      continue
    }
    c.Update(this.m_contactListener);
    c = c.GetNext()
  }
};
b2ContactManager.prototype.m_world = null;
b2ContactManager.prototype.m_broadPhase = null;
b2ContactManager.prototype.m_contactList = null;
b2ContactManager.prototype.m_contactCount = 0;
b2ContactManager.prototype.m_contactFilter = null;
b2ContactManager.prototype.m_contactListener = null;
b2ContactManager.prototype.m_contactFactory = null;
b2ContactManager.prototype.m_allocator = null;var b2World = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2World.prototype.__constructor = function(gravity, doSleep) {
  this.m_destructionListener = null;
  this.m_debugDraw = null;
  this.m_bodyList = null;
  this.m_contactList = null;
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_controllerCount = 0;
  b2World.m_warmStarting = true;
  b2World.m_continuousPhysics = true;
  this.m_allowSleep = doSleep;
  this.m_gravity = gravity;
  this.m_inv_dt0 = 0;
  this.m_contactManager.m_world = this;
  var bd = new b2BodyDef;
  this.m_groundBody = this.CreateBody(bd)
};
b2World.prototype.__varz = function() {
  this.s_stack = new Array;
  this.m_contactManager = new b2ContactManager;
  this.m_contactSolver = new b2ContactSolver;
  this.m_island = new b2Island
};
b2World.s_timestep2 = new b2TimeStep;
b2World.s_backupA = new b2Sweep;
b2World.s_backupB = new b2Sweep;
b2World.s_timestep = new b2TimeStep;
b2World.s_queue = new Array;
b2World.e_newFixture = 1;
b2World.e_locked = 2;
b2World.s_xf = new b2Transform;
b2World.s_jointColor = new b2Color(0.5, 0.8, 0.8);
b2World.m_warmStarting = null;
b2World.m_continuousPhysics = null;
b2World.prototype.Solve = function(step) {
  var b;
  for(var controller = this.m_controllerList;controller;controller = controller.m_next) {
    controller.Step(step)
  }
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag
  }
  for(var c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~b2Contact.e_islandFlag
  }
  for(var j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  var stackSize = this.m_bodyCount;
  var stack = this.s_stack;
  for(var seed = this.m_bodyList;seed;seed = seed.m_next) {
    if(seed.m_flags & b2Body.e_islandFlag) {
      continue
    }
    if(seed.IsAwake() == false || seed.IsActive() == false) {
      continue
    }
    if(seed.GetType() == b2Body.b2_staticBody) {
      continue
    }
    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(stackCount > 0) {
      b = stack[--stackCount];
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      var other;
      for(var ce = b.m_contactList;ce;ce = ce.next) {
        if(ce.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(ce.contact);
        ce.contact.m_flags |= b2Contact.e_islandFlag;
        other = ce.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jn = b.m_jointList;jn;jn = jn.next) {
        if(jn.joint.m_islandFlag == true) {
          continue
        }
        other = jn.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    island.Solve(step, this.m_gravity, this.m_allowSleep);
    for(var i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        b.m_flags &= ~b2Body.e_islandFlag
      }
    }
  }
  for(i = 0;i < stack.length;++i) {
    if(!stack[i]) {
      break
    }
    stack[i] = null
  }
  for(b = this.m_bodyList;b;b = b.m_next) {
    if(b.IsAwake() == false || b.IsActive() == false) {
      continue
    }
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    b.SynchronizeFixtures()
  }
  this.m_contactManager.FindNewContacts()
};
b2World.prototype.SolveTOI = function(step) {
  var b;
  var fA;
  var fB;
  var bA;
  var bB;
  var cEdge;
  var j;
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  var queue = b2World.s_queue;
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
    b.m_sweep.t0 = 0
  }
  var c;
  for(c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
  }
  for(j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  for(;;) {
    var minContact = null;
    var minTOI = 1;
    for(c = this.m_contactList;c;c = c.m_next) {
      if(c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
        continue
      }
      var toi = 1;
      if(c.m_flags & b2Contact.e_toiFlag) {
        toi = c.m_toi
      }else {
        fA = c.m_fixtureA;
        fB = c.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;
        if((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
          continue
        }
        var t0 = bA.m_sweep.t0;
        if(bA.m_sweep.t0 < bB.m_sweep.t0) {
          t0 = bB.m_sweep.t0;
          bA.m_sweep.Advance(t0)
        }else {
          if(bB.m_sweep.t0 < bA.m_sweep.t0) {
            t0 = bA.m_sweep.t0;
            bB.m_sweep.Advance(t0)
          }
        }
        toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
        b2Settings.b2Assert(0 <= toi && toi <= 1);
        if(toi > 0 && toi < 1) {
          toi = (1 - toi) * t0 + toi;
          if(toi > 1) {
            toi = 1
          }
        }
        c.m_toi = toi;
        c.m_flags |= b2Contact.e_toiFlag
      }
      if(Number.MIN_VALUE < toi && toi < minTOI) {
        minContact = c;
        minTOI = toi
      }
    }
    if(minContact == null || 1 - 100 * Number.MIN_VALUE < minTOI) {
      break
    }
    fA = minContact.m_fixtureA;
    fB = minContact.m_fixtureB;
    bA = fA.m_body;
    bB = fB.m_body;
    b2World.s_backupA.Set(bA.m_sweep);
    b2World.s_backupB.Set(bB.m_sweep);
    bA.Advance(minTOI);
    bB.Advance(minTOI);
    minContact.Update(this.m_contactManager.m_contactListener);
    minContact.m_flags &= ~b2Contact.e_toiFlag;
    if(minContact.IsSensor() == true || minContact.IsEnabled() == false) {
      bA.m_sweep.Set(b2World.s_backupA);
      bB.m_sweep.Set(b2World.s_backupB);
      bA.SynchronizeTransform();
      bB.SynchronizeTransform();
      continue
    }
    if(minContact.IsTouching() == false) {
      continue
    }
    var seed = bA;
    if(seed.GetType() != b2Body.b2_dynamicBody) {
      seed = bB
    }
    island.Clear();
    var queueStart = 0;
    var queueSize = 0;
    queue[queueStart + queueSize++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(queueSize > 0) {
      b = queue[queueStart++];
      --queueSize;
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        if(island.m_contactCount == island.m_contactCapacity) {
          break
        }
        if(cEdge.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(cEdge.contact);
        cEdge.contact.m_flags |= b2Contact.e_islandFlag;
        var other = cEdge.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jEdge = b.m_jointList;jEdge;jEdge = jEdge.next) {
        if(island.m_jointCount == island.m_jointCapacity) {
          continue
        }
        if(jEdge.joint.m_islandFlag == true) {
          continue
        }
        other = jEdge.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jEdge.joint);
        jEdge.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    var subStep = b2World.s_timestep;
    subStep.warmStarting = false;
    subStep.dt = (1 - minTOI) * step.dt;
    subStep.inv_dt = 1 / subStep.dt;
    subStep.dtRatio = 0;
    subStep.velocityIterations = step.velocityIterations;
    subStep.positionIterations = step.positionIterations;
    island.SolveTOI(subStep);
    var i = 0;
    for(i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      b.m_flags &= ~b2Body.e_islandFlag;
      if(b.IsAwake() == false) {
        continue
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      b.SynchronizeFixtures();
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        cEdge.contact.m_flags &= ~b2Contact.e_toiFlag
      }
    }
    for(i = 0;i < island.m_contactCount;++i) {
      c = island.m_contacts[i];
      c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
    }
    for(i = 0;i < island.m_jointCount;++i) {
      j = island.m_joints[i];
      j.m_islandFlag = false
    }
    this.m_contactManager.FindNewContacts()
  }
};
b2World.prototype.DrawJoint = function(joint) {
  var b1 = joint.GetBodyA();
  var b2 = joint.GetBodyB();
  var xf1 = b1.m_xf;
  var xf2 = b2.m_xf;
  var x1 = xf1.position;
  var x2 = xf2.position;
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();
  var color = b2World.s_jointColor;
  switch(joint.m_type) {
    case b2Joint.e_distanceJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    case b2Joint.e_pulleyJoint:
      var pulley = joint;
      var s1 = pulley.GetGroundAnchorA();
      var s2 = pulley.GetGroundAnchorB();
      this.m_debugDraw.DrawSegment(s1, p1, color);
      this.m_debugDraw.DrawSegment(s2, p2, color);
      this.m_debugDraw.DrawSegment(s1, s2, color);
      break;
    case b2Joint.e_mouseJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    default:
      if(b1 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x1, p1, color)
      }
      this.m_debugDraw.DrawSegment(p1, p2, color);
      if(b2 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x2, p2, color)
      }
  }
};
b2World.prototype.DrawShape = function(shape, xf, color) {
  switch(shape.m_type) {
    case b2Shape.e_circleShape:
      var circle = shape;
      var center = b2Math.MulX(xf, circle.m_p);
      var radius = circle.m_radius;
      var axis = xf.R.col1;
      this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
      break;
    case b2Shape.e_polygonShape:
      var i = 0;
      var poly = shape;
      var vertexCount = poly.GetVertexCount();
      var localVertices = poly.GetVertices();
      var vertices = new Array(vertexCount);
      for(i = 0;i < vertexCount;++i) {
        vertices[i] = b2Math.MulX(xf, localVertices[i])
      }
      this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
      break;
    case b2Shape.e_edgeShape:
      var edge = shape;
      this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
      break
  }
};
b2World.prototype.SetDestructionListener = function(listener) {
  this.m_destructionListener = listener
};
b2World.prototype.SetContactFilter = function(filter) {
  this.m_contactManager.m_contactFilter = filter
};
b2World.prototype.SetContactListener = function(listener) {
  this.m_contactManager.m_contactListener = listener
};
b2World.prototype.SetDebugDraw = function(debugDraw) {
  this.m_debugDraw = debugDraw
};
b2World.prototype.SetBroadPhase = function(broadPhase) {
  var oldBroadPhase = this.m_contactManager.m_broadPhase;
  this.m_contactManager.m_broadPhase = broadPhase;
  for(var b = this.m_bodyList;b;b = b.m_next) {
    for(var f = b.m_fixtureList;f;f = f.m_next) {
      f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f)
    }
  }
};
b2World.prototype.Validate = function() {
  this.m_contactManager.m_broadPhase.Validate()
};
b2World.prototype.GetProxyCount = function() {
  return this.m_contactManager.m_broadPhase.GetProxyCount()
};
b2World.prototype.CreateBody = function(def) {
  if(this.IsLocked() == true) {
    return null
  }
  var b = new b2Body(def, this);
  b.m_prev = null;
  b.m_next = this.m_bodyList;
  if(this.m_bodyList) {
    this.m_bodyList.m_prev = b
  }
  this.m_bodyList = b;
  ++this.m_bodyCount;
  return b
};
b2World.prototype.DestroyBody = function(b) {
  if(this.IsLocked() == true) {
    return
  }
  var jn = b.m_jointList;
  while(jn) {
    var jn0 = jn;
    jn = jn.next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeJoint(jn0.joint)
    }
    this.DestroyJoint(jn0.joint)
  }
  var coe = b.m_controllerList;
  while(coe) {
    var coe0 = coe;
    coe = coe.nextController;
    coe0.controller.RemoveBody(b)
  }
  var ce = b.m_contactList;
  while(ce) {
    var ce0 = ce;
    ce = ce.next;
    this.m_contactManager.Destroy(ce0.contact)
  }
  b.m_contactList = null;
  var f = b.m_fixtureList;
  while(f) {
    var f0 = f;
    f = f.m_next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeFixture(f0)
    }
    f0.DestroyProxy(this.m_contactManager.m_broadPhase);
    f0.Destroy()
  }
  b.m_fixtureList = null;
  b.m_fixtureCount = 0;
  if(b.m_prev) {
    b.m_prev.m_next = b.m_next
  }
  if(b.m_next) {
    b.m_next.m_prev = b.m_prev
  }
  if(b == this.m_bodyList) {
    this.m_bodyList = b.m_next
  }
  --this.m_bodyCount
};
b2World.prototype.CreateJoint = function(def) {
  var j = b2Joint.Create(def, null);
  j.m_prev = null;
  j.m_next = this.m_jointList;
  if(this.m_jointList) {
    this.m_jointList.m_prev = j
  }
  this.m_jointList = j;
  ++this.m_jointCount;
  j.m_edgeA.joint = j;
  j.m_edgeA.other = j.m_bodyB;
  j.m_edgeA.prev = null;
  j.m_edgeA.next = j.m_bodyA.m_jointList;
  if(j.m_bodyA.m_jointList) {
    j.m_bodyA.m_jointList.prev = j.m_edgeA
  }
  j.m_bodyA.m_jointList = j.m_edgeA;
  j.m_edgeB.joint = j;
  j.m_edgeB.other = j.m_bodyA;
  j.m_edgeB.prev = null;
  j.m_edgeB.next = j.m_bodyB.m_jointList;
  if(j.m_bodyB.m_jointList) {
    j.m_bodyB.m_jointList.prev = j.m_edgeB
  }
  j.m_bodyB.m_jointList = j.m_edgeB;
  var bodyA = def.bodyA;
  var bodyB = def.bodyB;
  if(def.collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
  return j
};
b2World.prototype.DestroyJoint = function(j) {
  var collideConnected = j.m_collideConnected;
  if(j.m_prev) {
    j.m_prev.m_next = j.m_next
  }
  if(j.m_next) {
    j.m_next.m_prev = j.m_prev
  }
  if(j == this.m_jointList) {
    this.m_jointList = j.m_next
  }
  var bodyA = j.m_bodyA;
  var bodyB = j.m_bodyB;
  bodyA.SetAwake(true);
  bodyB.SetAwake(true);
  if(j.m_edgeA.prev) {
    j.m_edgeA.prev.next = j.m_edgeA.next
  }
  if(j.m_edgeA.next) {
    j.m_edgeA.next.prev = j.m_edgeA.prev
  }
  if(j.m_edgeA == bodyA.m_jointList) {
    bodyA.m_jointList = j.m_edgeA.next
  }
  j.m_edgeA.prev = null;
  j.m_edgeA.next = null;
  if(j.m_edgeB.prev) {
    j.m_edgeB.prev.next = j.m_edgeB.next
  }
  if(j.m_edgeB.next) {
    j.m_edgeB.next.prev = j.m_edgeB.prev
  }
  if(j.m_edgeB == bodyB.m_jointList) {
    bodyB.m_jointList = j.m_edgeB.next
  }
  j.m_edgeB.prev = null;
  j.m_edgeB.next = null;
  b2Joint.Destroy(j, null);
  --this.m_jointCount;
  if(collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
};
b2World.prototype.AddController = function(c) {
  c.m_next = this.m_controllerList;
  c.m_prev = null;
  this.m_controllerList = c;
  c.m_world = this;
  this.m_controllerCount++;
  return c
};
b2World.prototype.RemoveController = function(c) {
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(this.m_controllerList == c) {
    this.m_controllerList = c.m_next
  }
  this.m_controllerCount--
};
b2World.prototype.CreateController = function(controller) {
  if(controller.m_world != this) {
    throw new Error("Controller can only be a member of one world");
  }
  controller.m_next = this.m_controllerList;
  controller.m_prev = null;
  if(this.m_controllerList) {
    this.m_controllerList.m_prev = controller
  }
  this.m_controllerList = controller;
  ++this.m_controllerCount;
  controller.m_world = this;
  return controller
};
b2World.prototype.DestroyController = function(controller) {
  controller.Clear();
  if(controller.m_next) {
    controller.m_next.m_prev = controller.m_prev
  }
  if(controller.m_prev) {
    controller.m_prev.m_next = controller.m_next
  }
  if(controller == this.m_controllerList) {
    this.m_controllerList = controller.m_next
  }
  --this.m_controllerCount
};
b2World.prototype.SetWarmStarting = function(flag) {
  b2World.m_warmStarting = flag
};
b2World.prototype.SetContinuousPhysics = function(flag) {
  b2World.m_continuousPhysics = flag
};
b2World.prototype.GetBodyCount = function() {
  return this.m_bodyCount
};
b2World.prototype.GetJointCount = function() {
  return this.m_jointCount
};
b2World.prototype.GetContactCount = function() {
  return this.m_contactCount
};
b2World.prototype.SetGravity = function(gravity) {
  this.m_gravity = gravity
};
b2World.prototype.GetGravity = function() {
  return this.m_gravity
};
b2World.prototype.GetGroundBody = function() {
  return this.m_groundBody
};
b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
  if(this.m_flags & b2World.e_newFixture) {
    this.m_contactManager.FindNewContacts();
    this.m_flags &= ~b2World.e_newFixture
  }
  this.m_flags |= b2World.e_locked;
  var step = b2World.s_timestep2;
  step.dt = dt;
  step.velocityIterations = velocityIterations;
  step.positionIterations = positionIterations;
  if(dt > 0) {
    step.inv_dt = 1 / dt
  }else {
    step.inv_dt = 0
  }
  step.dtRatio = this.m_inv_dt0 * dt;
  step.warmStarting = b2World.m_warmStarting;
  this.m_contactManager.Collide();
  if(step.dt > 0) {
    this.Solve(step)
  }
  if(b2World.m_continuousPhysics && step.dt > 0) {
    this.SolveTOI(step)
  }
  if(step.dt > 0) {
    this.m_inv_dt0 = step.inv_dt
  }
  this.m_flags &= ~b2World.e_locked
};
b2World.prototype.ClearForces = function() {
  for(var body = this.m_bodyList;body;body = body.m_next) {
    body.m_force.SetZero();
    body.m_torque = 0
  }
};
b2World.prototype.DrawDebugData = function() {
  if(this.m_debugDraw == null) {
    return
  }
  this.m_debugDraw.Clear();
  var flags = this.m_debugDraw.GetFlags();
  var i = 0;
  var b;
  var f;
  var s;
  var j;
  var bp;
  var invQ = new b2Vec2;
  var x1 = new b2Vec2;
  var x2 = new b2Vec2;
  var xf;
  var b1 = new b2AABB;
  var b2 = new b2AABB;
  var vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
  var color = new b2Color(0, 0, 0);
  if(flags & b2DebugDraw.e_shapeBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b.m_xf;
      for(f = b.GetFixtureList();f;f = f.m_next) {
        s = f.GetShape();
        if(b.IsActive() == false) {
          color.Set(0.5, 0.5, 0.3);
          this.DrawShape(s, xf, color)
        }else {
          if(b.GetType() == b2Body.b2_staticBody) {
            color.Set(0.5, 0.9, 0.5);
            this.DrawShape(s, xf, color)
          }else {
            if(b.GetType() == b2Body.b2_kinematicBody) {
              color.Set(0.5, 0.5, 0.9);
              this.DrawShape(s, xf, color)
            }else {
              if(b.IsAwake() == false) {
                color.Set(0.6, 0.6, 0.6);
                this.DrawShape(s, xf, color)
              }else {
                color.Set(0.9, 0.7, 0.7);
                this.DrawShape(s, xf, color)
              }
            }
          }
        }
      }
    }
  }
  if(flags & b2DebugDraw.e_jointBit) {
    for(j = this.m_jointList;j;j = j.m_next) {
      this.DrawJoint(j)
    }
  }
  if(flags & b2DebugDraw.e_controllerBit) {
    for(var c = this.m_controllerList;c;c = c.m_next) {
      c.Draw(this.m_debugDraw)
    }
  }
  if(flags & b2DebugDraw.e_pairBit) {
    color.Set(0.3, 0.9, 0.9);
    for(var contact = this.m_contactManager.m_contactList;contact;contact = contact.GetNext()) {
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();
      var cA = fixtureA.GetAABB().GetCenter();
      var cB = fixtureB.GetAABB().GetCenter();
      this.m_debugDraw.DrawSegment(cA, cB, color)
    }
  }
  if(flags & b2DebugDraw.e_aabbBit) {
    bp = this.m_contactManager.m_broadPhase;
    vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
    for(b = this.m_bodyList;b;b = b.GetNext()) {
      if(b.IsActive() == false) {
        continue
      }
      for(f = b.GetFixtureList();f;f = f.GetNext()) {
        var aabb = bp.GetFatAABB(f.m_proxy);
        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
        this.m_debugDraw.DrawPolygon(vs, 4, color)
      }
    }
  }
  if(flags & b2DebugDraw.e_centerOfMassBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b2World.s_xf;
      xf.R = b.m_xf.R;
      xf.position = b.GetWorldCenter();
      this.m_debugDraw.DrawTransform(xf)
    }
  }
};
b2World.prototype.QueryAABB = function(callback, aabb) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    return callback(broadPhase.GetUserData(proxy))
  }
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryShape = function(callback, shape, transform) {
  if(transform == null) {
    transform = new b2Transform;
    transform.SetIdentity()
  }
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(b2Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  shape.ComputeAABB(aabb, transform);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryPoint = function(callback, p) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(fixture.TestPoint(p)) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  aabb.lowerBound.Set(p.x - b2Settings.b2_linearSlop, p.y - b2Settings.b2_linearSlop);
  aabb.upperBound.Set(p.x + b2Settings.b2_linearSlop, p.y + b2Settings.b2_linearSlop);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.RayCast = function(callback, point1, point2) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  var output = new b2RayCastOutput;
  function RayCastWrapper(input, proxy) {
    var userData = broadPhase.GetUserData(proxy);
    var fixture = userData;
    var hit = fixture.RayCast(output, input);
    if(hit) {
      var fraction = output.fraction;
      var point = new b2Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
      return callback(fixture, point, output.normal, fraction)
    }
    return input.maxFraction
  }
  var input = new b2RayCastInput(point1, point2);
  broadPhase.RayCast(RayCastWrapper, input)
};
b2World.prototype.RayCastOne = function(point1, point2) {
  var result;
  function RayCastOneWrapper(fixture, point, normal, fraction) {
    result = fixture;
    return fraction
  }
  this.RayCast(RayCastOneWrapper, point1, point2);
  return result
};
b2World.prototype.RayCastAll = function(point1, point2) {
  var result = new Array;
  function RayCastAllWrapper(fixture, point, normal, fraction) {
    result[result.length] = fixture;
    return 1
  }
  this.RayCast(RayCastAllWrapper, point1, point2);
  return result
};
b2World.prototype.GetBodyList = function() {
  return this.m_bodyList
};
b2World.prototype.GetJointList = function() {
  return this.m_jointList
};
b2World.prototype.GetContactList = function() {
  return this.m_contactList
};
b2World.prototype.IsLocked = function() {
  return(this.m_flags & b2World.e_locked) > 0
};
b2World.prototype.s_stack = new Array;
b2World.prototype.m_flags = 0;
b2World.prototype.m_contactManager = new b2ContactManager;
b2World.prototype.m_contactSolver = new b2ContactSolver;
b2World.prototype.m_island = new b2Island;
b2World.prototype.m_bodyList = null;
b2World.prototype.m_jointList = null;
b2World.prototype.m_contactList = null;
b2World.prototype.m_bodyCount = 0;
b2World.prototype.m_contactCount = 0;
b2World.prototype.m_jointCount = 0;
b2World.prototype.m_controllerList = null;
b2World.prototype.m_controllerCount = 0;
b2World.prototype.m_gravity = null;
b2World.prototype.m_allowSleep = null;
b2World.prototype.m_groundBody = null;
b2World.prototype.m_destructionListener = null;
b2World.prototype.m_debugDraw = null;
b2World.prototype.m_inv_dt0 = null;if(typeof exports !== "undefined") {
  exports.b2BoundValues = b2BoundValues;
  exports.b2Math = b2Math;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2Mat33 = b2Mat33;
  exports.b2ContactPoint = b2ContactPoint;
  exports.b2PairManager = b2PairManager;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2OBB = b2OBB;
  exports.b2CircleContact = b2CircleContact;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2Pair = b2Pair;
  exports.b2TimeStep = b2TimeStep;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2World = b2World;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2Controller = b2Controller;
  exports.b2ContactID = b2ContactID;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2JointDef = b2JointDef;
  exports.b2Transform = b2Transform;
  exports.b2GravityController = b2GravityController;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2BuoyancyController = b2BuoyancyController;
  exports.b2LineJointDef = b2LineJointDef;
  exports.b2Contact = b2Contact;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2Body = b2Body;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactConstraint = b2ContactConstraint;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2ContactResult = b2ContactResult;
  exports.b2EdgeChainDef = b2EdgeChainDef;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec3 = b2Vec3;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2TensorDampingController = b2TensorDampingController;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2ConstantAccelController = b2ConstantAccelController;
  exports.b2GearJointDef = b2GearJointDef;
  exports.ClipVertex = ClipVertex;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2Color = b2Color;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2DynamicTreePair = b2DynamicTreePair;
  exports.b2ContactConstraintPoint = b2ContactConstraintPoint;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ControllerEdge = b2ControllerEdge;
  exports.b2Distance = b2Distance;
  exports.b2Fixture = b2Fixture;
  exports.b2DynamicTreeNode = b2DynamicTreeNode;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2BodyDef = b2BodyDef;
  exports.b2DynamicTreeBroadPhase = b2DynamicTreeBroadPhase;
  exports.b2Settings = b2Settings;
  exports.b2Proxy = b2Proxy;
  exports.b2Point = b2Point;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2Manifold = b2Manifold;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2ConstantForceController = b2ConstantForceController;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2MassData = b2MassData;
  exports.b2Joint = b2Joint;
  exports.b2GearJoint = b2GearJoint;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LineJoint = b2LineJoint;
  exports.b2NullContact = b2NullContact;
  exports.b2ContactListener = b2ContactListener;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2TOIInput = b2TOIInput;
  exports.Features = Features;
  exports.b2FilterData = b2FilterData;
  exports.b2Island = b2Island;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2Simplex = b2Simplex;
  exports.b2AABB = b2AABB;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Bound = b2Bound;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2PolyAndEdgeContact = b2PolyAndEdgeContact;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2Collision = b2Collision;
  exports.b2Mat22 = b2Mat22;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2PolyAndCircleContact = b2PolyAndCircleContact;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2Shape = b2Shape;
  exports.b2Segment = b2Segment;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2DebugDraw = b2DebugDraw;
  exports.b2Sweep = b2Sweep
}
;

}};
__resources__["/__builtin__/libs/cocos2d/ActionManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

var ActionManager = BObject.extend(/** @lends cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    /**
     * <p>A singleton that manages all the actions. Normally you
     * won't need to use this singleton directly. 99% of the cases you will use the
     * cocos.nodes.Node interface, which uses this singleton. But there are some cases where
     * you might need to use this singleton. Examples:</p>
     *
     * <ul>
     * <li>When you want to run an action where the target is different from a cocos.nodes.Node</li>
     * <li>When you want to pause / resume the actions</li>
     * </ul>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        ActionManager.superclass.init.call(this);

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        this.targets = [];
    },

    /**
     * Adds an action with a target. If the target is already present, then the
     * action will be added to the existing target. If the target is not
     * present, a new instance of this target will be created either paused or
     * paused, and the action will be added to the newly created target. When
     * the target is paused, the queued actions won't be 'ticked'.
     *
     * @opt {cocos.nodes.Node} target Node to run the action on
     */
    addAction: function (opts) {

        var targetID = opts.target.get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts.target,
                actions: []
            };
        }

        element.actions.push(opts.action);

        opts.action.startWithTarget(opts.target);
    },

    /**
     * Remove an action
     *
     * @param {cocos.actions.Action} action Action to remove
     */
    removeAction: function (action) {
        var targetID = action.originalTarget.get('id'),
            element = this.targets[targetID];

        if (!element) {
            return;
        }

        var actionIndex = element.actions.indexOf(action);

        if (actionIndex == -1) {
            return;
        }

        if (this.currentTarget == element) {
            element.currentActionSalvaged = true;
        } 
        
        element.actions[actionIndex] = null;
        element.actions.splice(actionIndex, 1); // Delete array item

        if (element.actions.length === 0) {
            if (this.currentTarget == element) {
                this.set('currentTargetSalvaged', true);
            }
        }
            
    },

    /**
     * Remove all actions for a cocos.nodes.Node
     *
     * @param {cocos.nodes.Node} target Node to remove all actions for
     */
    removeAllActionsFromTarget: function (target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }

        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length - 1);
    },

    /**
     * @private
     */
    update: function (dt) {
        var self = this;
        util.each(this.targets, function (currentTarget, i) {

            if (!currentTarget) {
                return;
            }
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function (currentAction, j) {
                    if (!currentAction) {
                        return;
                    }

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length === 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });
    },

    pauseTarget: function (target) {
    },

	resumeTarget: function (target) {
		// TODO
	}
});

util.extend(ActionManager, /** @lends cocos.ActionManager */{
    /**
     * Singleton instance of cocos.ActionManager
     * @getter sharedManager
     * @type cocos.ActionManager
     */
    get_sharedManager: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.ActionManager = ActionManager;

}};
__resources__["/__builtin__/libs/cocos2d/actions/Action.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console;

/** 
 * @memberOf cocos.actions
 * @class Base class for Actions
 * @extends BObject
 * @constructor
 */
var Action = BObject.extend(/** @lends cocos.actions.Action# */{
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null;
    },

    /**
     * @getter isDone
     * @type {Boolean} 
     */
    get_isDone: function (key) {
        return true;
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
});

var RepeatForever = Action.extend(/** @lends cocos.actions.RepeatForever# */{
    other: null,

    /**
     * @memberOf cocos.actions
     * @class Repeats an action forever. To repeat the an action for a limited
     * number of times use the cocos.Repeat action.
     * @extends cocos.actions.Action
     * @param {cocos.actions.Action} action An action to repeat forever
     * @constructs
     */
    init: function (action) {
        RepeatForever.superclass.init(this, action);

        this.other = action;
    },

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target);

        this.other.startWithTarget(this.target);
    },

    step: function (dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    get_isDone: function () {
        return false;
    },

    reverse: function () {
        return RepeatForever.create(this.other.reverse());
    },

    copy: function () {
        return RepeatForever.create(this.other.copy());
    }
});

var FiniteTimeAction = Action.extend(/** @lends cocos.actions.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** 
     * Repeats an action a number of times. To repeat an action forever use the
     * cocos.RepeatForever action.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function () {
        FiniteTimeAction.superclass.init.call(this);
    },

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInstant.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInstant = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInstant */{
    /**
     * @memberOf cocos.actions
     * @class Base class for actions that triggers instantly. They have no duration.
     * @extends cocos.actions.FiniteTimeAction
     * @constructs
     */
    init: function (opts) {
        ActionInstant.superclass.init.call(this, opts);

        this.duration = 0;
    },
    get_isDone: function () {
        return true;
    },
    step: function (dt) {
        this.update(1);
    },
    update: function (t) {
        // ignore
    },
    reverse: function () {
        return this.copy();
    }
});

var FlipX = ActionInstant.extend(/** @lends cocos.actions.FlipX# */{
    flipX: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite horizontally
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipX Should the sprite be flipped
     */
    init: function (opts) {
        FlipX.superclass.init.call(this, opts);

        this.flipX = opts.flipX;
    },
    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target);

        target.set('flipX', this.flipX);
    },
    reverse: function () {
        return FlipX.create({flipX: !this.flipX});
    },
    copy: function () {
        return FlipX.create({flipX: this.flipX});
    }
});

var FlipY = ActionInstant.extend(/** @lends cocos.actions.FlipY# */{
    flipY: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite vertically
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipY Should the sprite be flipped
     */
    init: function (opts) {
        FlipY.superclass.init.call(this, opts);

        this.flipY = opts.flipY;
    },
    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target);

        target.set('flipY', this.flipY);
    },
    reverse: function () {
        return FlipY.create({flipY: !this.flipY});
    },
    copy: function () {
        return FlipY.create({flipY: this.flipY});
    }
});

exports.ActionInstant = ActionInstant;
exports.FlipX = FlipX;
exports.FlipY = FlipY;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInterval.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInterval = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInterval# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    /**
     * Base class actions that do have a finite time duration. 
     *
     * Possible actions:
     *
     * - An action with a duration of 0 seconds
     * - An action with a duration of 35.5 seconds Infinite time actions are valid
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     *
     * @opt {Float} duration Number of seconds to run action for
     */
    init: function (opts) {
        ActionInterval.superclass.init.call(this, opts);

        var dur = opts.duration || 0;
        if (dur === 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function () {
        return (this.elapsed >= this.duration);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed / this.duration));
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    reverse: function () {
        throw "Reverse Action not implemented";
    }
});

var ScaleTo = ActionInterval.extend(/** @lends cocos.actions.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node to
     * @opt {Float} [scaleX] Size to scale width of Node to
     * @opt {Float} [scaleY] Size to scale height of Node to
     */
    init: function (opts) {
        ScaleTo.superclass.init.call(this, opts);

        if (opts.scale !== undefined) {
            this.endScaleX = this.endScaleY = opts.scale;
        } else {
            this.endScaleX = opts.scaleX;
            this.endScaleY = opts.scaleY;
        }


    },

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function (t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

var ScaleBy = ScaleTo.extend(/** @lends cocos.actions.ScaleBy# */{
    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ScaleTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node by
     * @opt {Float} [scaleX] Size to scale width of Node by
     * @opt {Float} [scaleY] Size to scale height of Node by
     */
    init: function (opts) {
        ScaleBy.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function () {
        return ScaleBy.create({duration: this.duration, scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY});
    }
});


var RotateTo = ActionInterval.extend(/** @lends cocos.actions.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     * 
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate to
     */
    init: function (opts) {
        RotateTo.superclass.init.call(this, opts);

        this.dstAngle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

var RotateBy = RotateTo.extend(/** @lends cocos.actions.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.action
     * @constructs
     * @extends cocos.actions.RotateTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate by
     */
    init: function (opts) {
        RotateBy.superclass.init.call(this, opts);

        this.angle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target);

        this.startAngle = this.target.get('rotation');
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.angle * t);
    },

    reverse: function () {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    },

    copy: function () {
        return RotateBy.create({duration: this.duration, angle: this.angle});
    }
});



var Sequence = ActionInterval.extend(/** @lends cocos.actions.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    /**
     * Runs a number of actions sequentially, one after another
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.actions.Action[]} Array of actions to run in sequence
     */
    init: function (opts) {
        Sequence.superclass.init.call(this, opts);

        this.actions = util.copy(opts.actions);
        this.actionSequence = {};
        
        util.each(this.actions, util.callback(this, function (action) {
            this.duration += action.duration;
        }));
    },

    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target);

        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    stop: function () {
        util.each(this.actions, function (action) {
            action.stop();
        });

        Sequence.superclass.stop.call(this);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed / this.duration));
    },

    update: function (dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

var Animate = ActionInterval.extend(/** @lends cocos.actions.Animate# */{
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,


    /**
     * Animates a sprite given the name of an Animation 
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.Animation} animation Animation to run
     * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
     */
    init: function (opts) {
        this.animation = opts.animation;
        this.restoreOriginalFrame = opts.restoreOriginalFrame !== false;
        opts.duration = this.animation.frames.length * this.animation.delay;

        Animate.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        Animate.superclass.stop.call(this);
    },

    update: function (t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function () {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;

}};
__resources__["/__builtin__/libs/cocos2d/actions/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant'.w();

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {};

util.each(modules, function (mod, i) {
    util.extend(actions, require('./' + mod));
});

module.exports = actions;

}};
__resources__["/__builtin__/libs/cocos2d/Animation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Animation = BObject.extend(/** @lends cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    /** 
     * A cocos.Animation object is used to perform animations on the Sprite objects.
     * 
     * The Animation object contains cocos.SpriteFrame objects, and a possible delay between the frames.
     * You can animate a cocos.Animation object by using the cocos.actions.Animate action.
     * 
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.SpriteFrame[]} frames Frames to animate
     * @opt {Float} [delay=0.0] Delay between each frame
     * 
     * @example
     * var animation = cocos.Animation.create({frames: [f1, f2, f3], delay: 0.1});
     * sprite.runAction(cocos.actions.Animate.create({animation: animation}));
     */
    init: function (opts) {
        Animation.superclass.init.call(this, opts);

        this.frames = opts.frames || [];
        this.delay  = opts.delay  || 0.0;
    }
});

exports.Animation = Animation;

}};
__resources__["/__builtin__/libs/cocos2d/AnimationCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Plist = require('Plist').Plist;

var AnimationCache = BObject.extend(/** @lends cocos.AnimationCache# */{
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        AnimationCache.superclass.init.call(this);

        this.set('animations', {});
    },

    /**
     * Add an animation to the cache
     *
     * @opt {String} name Unique name of the animation
     * @opt {cocos.Animcation} animation Animation to cache
     */
    addAnimation: function (opts) {
        var name = opts.name,
            animation = opts.animation;

        this.get('animations')[name] = animation;
    },

    /**
     * Remove an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     */
    removeAnimation: function (opts) {
        var name = opts.name;

        delete this.get('animations')[name];
    },

    /**
     * Get an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     * @returns {cocos.Animation} Cached animation
     */
    getAnimation: function (opts) {
        var name = opts.name;

        return this.get('animations')[name];
    }
});

/**
 * Class methods
 */
util.extend(AnimationCache, /** @lends cocos.AnimationCache */{
    /**
     * @getter sharedAnimationCache
     * @type cocos.AnimationCache
     */
    get_sharedAnimationCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.AnimationCache = AnimationCache;

}};
__resources__["/__builtin__/libs/cocos2d/Director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Scheduler = require('./Scheduler').Scheduler,
    EventDispatcher = require('./EventDispatcher').EventDispatcher,
    Scene = require('./nodes/Scene').Scene;

var Director = BObject.extend(/** @lends cocos.Director# */{
    backgroundColor: 'rgb(0, 0, 0)',
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,
    maxFrameRate: 30,
    displayFPS: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene: null,

    /**
     * <p>Creates and handles the main view and manages how and when to execute the
     * Scenes.</p>
     *
     * <p>This class is a singleton so don't instantiate it yourself, instead use
     * cocos.Director.get('sharedDirector') to return the instance.</p>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        Director.superclass.init.call(this);

        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
    attachInView: function (view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = document.createElement('canvas');
        this.set('canvas', canvas);
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = canvas.getContext('2d');
        this.set('context', context);

        if (FLIP_Y_AXIS) {
            context.translate(0, view.clientHeight);
            context.scale(1, -1);
        }

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.get('sharedDispatcher');
        var self = this;
        function mouseDown(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            function mouseDragged(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                eventDispatcher.mouseDragged(evt);
            }
            function mouseUp(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                document.body.removeEventListener('mousemove', mouseDragged, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                eventDispatcher.mouseUp(evt);
            }

            document.body.addEventListener('mousemove', mouseDragged, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            eventDispatcher.mouseDown(evt);
        }
        function mouseMoved(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            eventDispatcher.mouseMoved(evt);
        }
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mousemove', mouseMoved, false);

        // Keyboard events
        function keyDown(evt) {
            this._keysDown = this._keysDown || {};
            eventDispatcher.keyDown(evt);
        }
        function keyUp(evt) {
            eventDispatcher.keyUp(evt);
        }
        /*
        function keyPress(evt) {
            eventDispatcher.keyPress(evt)
        }
        */
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        /*
        document.documentElement.addEventListener('keypress', keyPress, false);
        */
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function (scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        if (this._runningScene) {
            throw "You can't run an scene if another Scene is running. Use replaceScene or pushScene instead";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function (scene) {
        var index = this.sceneStack.length;

        this._sendCleanupToScene = true;
        this.sceneStack.pop();
        this.sceneStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function () {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function (scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function () {
        var animationInterval = 1.0 / this.get('maxFrameRate');
        this._animationTimer = setInterval(util.callback(this, 'drawScene'), animationInterval * 1000);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function () {
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function () {
        var now = (new Date()).getTime() / 1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    drawScene: function () {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = this.get('backgroundColor');
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);
        //this.canvas.width = this.canvas.width


        if (this._nextScene) {
            this.setNextScene();
        }

        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height);

        if (rect) {
            context.beginPath();
            context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            context.clip();
            context.closePath();
        }

        this._runningScene.visit(context, rect);

        if (SHOW_REDRAW_REGIONS) {
            if (rect) {
                context.beginPath();
                context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                context.fillStyle = "rgba(255, 0, 0, 0.5)";
                //context.fill();
                context.closePath();
            }
        }

        if (this.get('displayFPS')) {
            this.showFPS();
        }
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function () {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit();
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup();
            }
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    convertEventToCanvas: function (evt) {
        var x = this.canvas.offsetLeft - document.documentElement.scrollLeft,
            y = this.canvas.offsetTop - document.documentElement.scrollTop;

        var o = this.canvas;
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - o.scrollLeft;
            y += o.offsetTop - o.scrollTop;
        }

        var p = geo.ccpSub(evt.locationInWindow, ccp(x, y));
        if (FLIP_Y_AXIS) {
            p.y = this.canvas.height - p.y;
        }

        return p;
    },

    showFPS: function () {
        if (!this._fpsLabel) {
            var Label = require('./nodes/Label').Label;
            this._fpsLabel = Label.create({string: '', fontSize: 16});
            this._fpsLabel.set('anchorPoint', ccp(0, 1));
            this._frames = 0;
            this._accumDt = 0;
        }


        this._frames++;
        this._accumDt += this.get('dt');
        
        if (this._accumDt > 1.0 / 3.0)  {
            var frameRate = this._frames / this._accumDt;
            this._frames = 0;
            this._accumDt = 0;

            this._fpsLabel.set('string', 'FPS: ' + (Math.round(frameRate * 100) / 100).toString());
        }
		

        var s = this.get('winSize');
        this._fpsLabel.set('position', ccp(10, s.height - 10));

        this._fpsLabel.visit(this.get('context'));
    }

});

/**
 * Class methods
 */
util.extend(Director, /** @lends cocos.Director */{
    /**
     * A shared singleton instance of cocos.Director
     *
     * @getter sharedDirector
     * @type cocos.Director
     */
    get_sharedDirector: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Director = Director;

}};
__resources__["/__builtin__/libs/cocos2d/EventDispatcher.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry');

var EventDispatcher = BObject.extend(/** @lends cocos.EventDispatcher# */{
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    _keysDown: null,
    
    /**
     * This singleton is responsible for dispatching Mouse and Keyboard events.
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        EventDispatcher.superclass.init.call(this);

        this.keyboardDelegates = [];
        this.mouseDelegates = [];

        this._keysDown = {};
    },

    addDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority,
            flags    = opts.flags,
            list     = opts.list;

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function (opts) {
        var delegate = opts.delegate,
            list = opts.list;

        var idx = -1,
            i;
        for (i = 0; i < list.length; i++) {
            var l = list[i];
            if (l.delegate == delegate) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function (opts) {
        var list = opts.list;

        list.splice(0, list.length - 1);
    },

    addMouseDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.mouseDelegates});
    },

    removeMouseDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.mouseDelegates});
    },

    removeAllMouseDelegate: function () {
        this.removeAllDelegates({list: this.mouseDelegates});
    },

    addKeyboardDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.keyboardDelegates});
    },

    removeKeyboardDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.keyboardDelegates});
    },

    removeAllKeyboardDelegate: function () {
        this.removeAllDelegates({list: this.keyboardDelegates});
    },



    // Mouse Events

    mouseDown: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseMoved: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseMovePosition) {
            evt.deltaX = evt.clientX - this._previousMouseMovePosition.x;
            evt.deltaY = evt.clientY - this._previousMouseMovePosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseDragged: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseDragPosition) {
            evt.deltaX = evt.clientX - this._previousMouseDragPosition.x;
            evt.deltaY = evt.clientY - this._previousMouseDragPosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    // Keyboard events
    keyDown: function (evt) {
        var kc = evt.keyCode;
        if (!this.dispatchEvents || this._keysDown[kc]) {
            return;
        }

        this._keysDown[kc] = true;

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyDown) {
                var swallows = entry.delegate.keyDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    keyUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        var kc = evt.keyCode;
        if (this._keysDown[kc]) {
            delete this._keysDown[kc];
        }

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyUp) {
                var swallows = entry.delegate.keyUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
util.extend(EventDispatcher, /** @lends cocos.EventDispatcher */{
    /**
     * A shared singleton instance of cocos.EventDispatcher
     *
     * @getter sharedDispatcher
     * @type cocos.EventDispatcher
     */
    get_sharedDispatcher: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});
exports.EventDispatcher = EventDispatcher;

}};
__resources__["/__builtin__/libs/cocos2d/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.w();

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
};

util.each(modules, function (mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/BatchNode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
	Node = require('./Node').Node;

var BatchNode = Node.extend(/** @lends cocos.nodes.BatchNode# */{
    partialDraw: false,
    contentRect: null,
    renderTexture: null,
    dirty: true,

    /**
     * Region to redraw
     * @type geometry.Rect
     */
    dirtyRegion: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,


    /**
     * Draws all children to an in-memory canvas and only redraws when something changes
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {geometry.Size} size The size of the in-memory canvas used for drawing to
     * @opt {Boolean} [partialDraw=false] Draw only the area visible on screen. Small maps may be slower in some browsers if this is true.
     */
	init: function (opts) {
		BatchNode.superclass.init.call(this, opts);

        var size = opts.size || geo.sizeMake(1, 1);
        this.set('partialDraw', opts.partialDraw);

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));
        
		this._dirtyRects = [];
        this.set('contentRect', geo.rectMake(0, 0, size.width, size.height));
        this.renderTexture = RenderTexture.create(size);
        this.renderTexture.sprite.set('isRelativeAnchorPoint', false);
        this.addChild({child: this.renderTexture});
	},

    addChild: function (opts) {
        BatchNode.superclass.addChild.call(this, opts);

        var child = opts.child,
            z     = opts.z;

        if (child == this.renderTexture) {
            return;
        }

        // TODO handle texture resize

        // Watch for changes in child
        evt.addListener(child, 'istransformdirty_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));
        evt.addListener(child, 'visible_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));

        this.addDirtyRegion(child.get('boundingBox'));
    },

    removeChild: function (opts) {
        BatchNode.superclass.removeChild.call(this, opts);

        // TODO remove istransformdirty_changed and visible_changed listeners

        this.set('dirty', true);
    },

    addDirtyRegion: function (rect) {
        var region = this.get('dirtyRegion');
        if (!region) {
            region = util.copy(rect);
        } else {
            region = geo.rectUnion(region, rect);
        }

        this.set('dirtyRegion', region);
        this.set('dirty', true);
    },

    _resizeCanvas: function (oldSize) {
        var size = this.get('contentSize');

        if (geo.sizeEqualToSize(size, oldSize)) {
            return; // No change
        }


        this.renderTexture.set('contentSize', size);
        this.set('dirty', true);
    },

    update: function () {

    },

    visit: function (context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        var rect = this.get('dirtyRegion');
        // Only redraw if something changed
        if (this.dirty) {

            if (rect) {
                if (this.get('partialDraw')) {
                    // Clip region to visible area
                    var s = require('../Director').Director.get('sharedDirector').get('winSize'),
                        p = this.get('position');
                    var r = new geo.Rect(
                        0, 0,
                        s.width, s.height
                    );
                    r = geo.rectApplyAffineTransform(r, this.worldToNodeTransform());
                    rect = geo.rectIntersection(r, rect);
                }

                this.renderTexture.clear(rect);

                this.renderTexture.context.save();
                this.renderTexture.context.beginPath();
                this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                this.renderTexture.context.clip();
                this.renderTexture.context.closePath();
            } else {
                this.renderTexture.clear();
            }

            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i];
                if (c == this.renderTexture) {
                    continue;
                }

                // Draw children inside rect
                if (!rect || geo.rectOverlapsRect(c.get('boundingBox'), rect)) {
                    c.visit(this.renderTexture.context, rect);
                }
            }

            if (SHOW_REDRAW_REGIONS) {
                if (rect) {
                    this.renderTexture.context.beginPath();
                    this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                    this.renderTexture.context.fillStyle = "rgba(0, 0, 255, 0.5)";
                    this.renderTexture.context.fill();
                    this.renderTexture.context.closePath();
                }
            }

            if (rect) {
                this.renderTexture.context.restore();
            }

            this.set('dirty', false);
            this.set('dirtyRegion', null);
        }

        this.renderTexture.visit(context);

        context.restore();
	},

	draw: function (ctx) {
    },

    onEnter: function () {
        if (this.get('partialDraw')) {
            evt.addListener(this.get('parent'), 'istransformdirty_changed', util.callback(this, function () {
                var box = this.get('visibleRect');
                this.addDirtyRegion(box);
            }));
        }
    }
});

var SpriteBatchNode = BatchNode.extend(/** @lends cocos.nodes.SpriteBatchNode# */{
    textureAtlas: null,

    /**
     * @memberOf cocos.nodes
     * @class A BatchNode that accepts only Sprite using the same texture
     * @extends cocos.nodes.BatchNode
     * @constructs
     *
     * @opt {String} file (Optional) Path to image to use as sprite atlas
     * @opt {Texture2D} texture (Optional) Texture to use as sprite atlas
     * @opt {cocos.TextureAtlas} textureAtlas (Optional) TextureAtlas to use as sprite atlas
     */
    init: function (opts) {
        SpriteBatchNode.superclass.init.call(this, opts);

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture;

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        }

        this.set('textureAtlas', textureAtlas);
    },

    /**
     * @getter texture
     * @type cocos.Texture2D
     */
    get_texture: function () {
		return this.textureAtlas ? this.textureAtlas.texture : null;
	}

});

exports.BatchNode = BatchNode;
exports.SpriteBatchNode = SpriteBatchNode;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem'.w();

/** 
 * @memberOf cocos
 * @namespace All cocos2d nodes. i.e. anything that can be added to a Scene
 */
var nodes = {};

util.each(modules, function (mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Label.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Director = require('../Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

var Label = Node.extend(/** @lends cocos.nodes.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /**
     * Renders a simple text label
     *
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} [string=""] The text string to draw
     * @opt {Float} [fontSize=16] The size of the font
     * @opt {String} [fontName="Helvetica"] The name of the font to use
     * @opt {String} [fontColor="white"] The color of the text
     */
    init: function (opts) {
        Label.superclass.init.call(this, opts);

        util.each('fontSize fontName fontColor string'.w(), util.callback(this, function (name) {
            // Set property on init
            if (opts[name]) {
                this.set(name, opts[name]);
            }

            // Update content size
            this._updateLabelContentSize();
        }));
    },

    /** 
     * String of the font name and size to use in a format &lt;canvas&gt; understands
     *
     * @getter font
     * @type String
     */
    get_font: function (key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    },

    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save();

            // Flip Y axis
            context.scale(1, -1);
            context.translate(0, -this.get('fontSize'));
        }


        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }

        if (FLIP_Y_AXIS) {
            context.restore();
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function () {
        var ctx = Director.get('sharedDirector').get('context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);
    }
});

module.exports.Label = Label;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Layer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node,
    util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    ccp    = require('geometry').ccp,
    EventDispatcher = require('../EventDispatcher').EventDispatcher;

var Layer = Node.extend(/** @lends cocos.nodes.Layer# */{
    isMouseEnabled: false,
    isKeyboardEnabled: false,
    mouseDelegatePriority: 0,
    keyboardDelegatePriority: 0,

    /** 
     * A fullscreen Node. You need at least 1 layer in your app to add other nodes to.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Layer.superclass.init.call(this);

        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        evt.addListener(this, 'ismouseenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
                }
            }
        }));


        evt.addListener(this, 'iskeyboardenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
                }
            }
        }));
    },

    onEnter: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
        }

        Layer.superclass.onEnter.call(this);
    },

    onExit: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
        }

        Layer.superclass.onExit.call(this);
    }
});

module.exports.Layer = Layer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Menu.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('../Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

var Menu = Layer.extend(/** @lends cocos.nodes.Menu# */{
	mouseDelegatePriority: (-Number.MAX_VALUE + 1),
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

    /**
     * A fullscreen node used to render a selection of menu options
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Layer
     *
     * @opt {cocos.nodes.MenuItem[]} items An array of MenuItems to draw on the menu
     */
	init: function (opts) {
		Menu.superclass.init.call(this, opts);

		var items = opts.items;

		this.set('isMouseEnabled', true);
		
        var s = Director.get('sharedDirector').get('winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width / 2, s.height / 2));


		if (items) {
			var z = 0;
			util.each(items, util.callback(this, function (item) {
				this.addChild({child: item, z: z++});
			}));
		}

        
	},

	addChild: function (opts) {
		if (!opts.child instanceof MenuItem) {
			throw "Menu only supports MenuItem objects as children";
		}

        Menu.superclass.addChild.call(this, opts);
    },

    itemForMouseEvent: function (event) {
        var location = event.locationInCanvas;

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function (event) {
        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();

            return true;
        }

        if (this.state != kMenuStateWaiting) {
            this.set('state', kMenuStateWaiting);
        }

        return false;

    },
    mouseDown: function (event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.itemForMouseEvent(event);
        this.set('selectedItem', selectedItem);
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },

    mouseDragged: function (event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', false);
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', true);
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/MenuItem.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

var MenuItem = Node.extend(/** @lends cocos.nodes.MenuItem# */{
	isEnabled: true,
	isSelected: false,
	callback: null,

    /**
     * Base class for any buttons or options in a menu
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Function} callback Function to call when menu item is activated
     */
	init: function (opts) {
		MenuItem.superclass.init.call(this, opts);

		var callback = opts.callback;

		this.set('anchorPoint', ccp(0.5, 0.5));
		this.set('callback', callback);
	},

	activate: function () {
		if (this.isEnabled && this.callback) {
			this.callback(this);
		}
	},

    /**
     * @getter rect
     * @type geometry.Rect
     */
	get_rect: function () {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		);
	}
});

var MenuItemSprite = MenuItem.extend(/** @lends cocos.nodes.MenuItemSprite# */{
	normalImage: null,
	selectedImage: null,
	disabledImage: null,

    /**
     * A menu item that accepts any cocos.nodes.Node
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItem
     *
     * @opt {cocos.nodes.Node} normalImage Main Node to draw
     * @opt {cocos.nodes.Node} selectedImage Node to draw when menu item is selected
     * @opt {cocos.nodes.Node} disabledImage Node to draw when menu item is disabled
     */
	init: function (opts) {
		MenuItemSprite.superclass.init.call(this, opts);

		var normalImage   = opts.normalImage,
			selectedImage = opts.selectedImage,
			disabledImage = opts.disabledImage;

		this.set('normalImage', normalImage);
		this.set('selectedImage', selectedImage);
		this.set('disabledImage', disabledImage);

		this.set('contentSize', normalImage.get('contentSize'));
	},

	draw: function (ctx) {
		if (this.isEnabled) {
			if (this.isSelected) {
				this.selectedImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		} else {
			if (this.disabledImage) {
				this.disabledImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		}
	}
});

var MenuItemImage = MenuItemSprite.extend(/** @lends cocos.nodes.MenuItemImage# */{

    /**
     * MenuItem that accepts image files
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItemSprite
     *
     * @opt {String} normalImage Main image file to draw
     * @opt {String} selectedImage Image file to draw when menu item is selected
     * @opt {String} disabledImage Image file to draw when menu item is disabled
     */
	init: function (opts) {
		var normalI   = opts.normalImage,
			selectedI = opts.selectedImage,
			disabledI = opts.disabledImage,
			callback  = opts.callback;

		var normalImage = Sprite.create({file: normalI}),
			selectedImage = Sprite.create({file: selectedI}),
			disabledImage = null;

		if (disabledI) {
			disabledImage = Sprite.create({file: disabledI});
		}

		return MenuItemImage.superclass.init.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
    }
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Node.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Scheduler = require('../Scheduler').Scheduler,
    ActionManager = require('../ActionManager').ActionManager,
    geo = require('geometry'), ccp = geo.ccp;

var Node = BObject.extend(/** @lends cocos.nodes.Node# */{
    isCocosNode: true,

    /**
     * Is the node visible
     * @type boolean
     */
    visible: true,

    /**
     * Position relative to parent node
     * @type geometry.Point
     */
    position: null,

    /**
     * Parent node
     * @type cocos.nodes.Node
     */
    parent: null,

    /**
     * Unique tag to identify the node
     * @type *
     */
    tag: null,

    /**
     * Size of the node
     * @type geometry.Size
     */
    contentSize: null,

    /**
     * Nodes Z index. i.e. draw order
     * @type Integer
     */
    zOrder: 0,

    /**
     * Anchor point for scaling and rotation. 0x0 is top left and 1x1 is bottom right
     * @type geometry.Point
     */
    anchorPoint: null,

    /**
     * Anchor point for scaling and rotation in pixels from top left
     * @type geometry.Point
     */
    anchorPointInPixels: null,

    /**
     * Rotation angle in degrees
     * @type Float
     */
    rotation: 0,

    /**
     * X scale factor
     * @type Float
     */
    scaleX: 1,

    /**
     * Y scale factor
     * @type Float
     */
    scaleY: 1,
    isRunning: false,
    isRelativeAnchorPoint: true,

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @type cocos.nodes.Node[]
     */
    children: null,

    /**
     * @memberOf cocos.nodes
     * @class The base class all visual elements extend from
     * @extends BObject
     * @constructs
     */
    init: function () {
        Node.superclass.init.call(this);
        this.set('contentSize', {width: 0, height: 0});
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0, 0);
        this.children = [];

        util.each(['scaleX', 'scaleY', 'rotation', 'position', 'anchorPoint', 'contentSize', 'isRelativeAnchorPoint'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._dirtyTransform));
        }));
        evt.addListener(this, 'anchorpoint_changed', util.callback(this, this._updateAnchorPointInPixels));
        evt.addListener(this, 'contentsize_changed', util.callback(this, this._updateAnchorPointInPixels));
    },

    /**
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     * @private
     */
    _updateAnchorPointInPixels: function () {
        var ap = this.get('anchorPoint'),
            cs = this.get('contentSize');
        this.set('anchorPointInPixels', ccp(cs.width * ap.x, cs.height * ap.y));
    },

    /**
     * Add a child Node
     *
     * @opt {cocos.nodes.Node} child The child node to add
     * @opt {Integer} [z] Z Index for the child
     * @opt {Integer|String} [tag] A tag to reference the child with
     * @returns {cocos.nodes.Node} The node the child was added to. i.e. 'this'
     */
    addChild: function (opts) {
        if (opts.isCocosNode) {
            return this.addChild({child: opts});
        }

        var child = opts.child,
            z = opts.z,
            tag = opts.tag;

        if (z === undefined || z === null) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;

        
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function (opts) {
        var tag = opts.tag;

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        if (!child) {
            return;
        }

        var children = this.get('children'),
            idx = children.indexOf(child);

        if (idx > -1) {
            this.detatchChild({child: child, cleanup: cleanup});
        }
    },

    detatchChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        var children = this.get('children'),
            isRunning = this.get('isRunning'),
            idx = children.indexOf(child);

        if (isRunning) {
            child.onExit();
        }

        if (cleanup) {
            child.cleanup();
        }

        child.set('parent', null);
        children.splice(idx, 1);
    },

    reorderChild: function (opts) {
        var child = opts.child,
            z     = opts.z;

        var pos = this.children.indexOf(child);
        if (pos == -1) {
            throw "Node isn't a child of this node";
        }

        child.set('zOrder', z);

        // Remove child
        this.children.splice(pos, 1);

        // Add child back at correct location
        var added = false;
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }
    },

    /**
     * Draws the node. Override to do custom drawing. If it's less efficient to
     * draw only the area inside the rect then don't bother. The result will be
     * clipped to that area anyway.
     *
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} context Canvas rendering context
     * @param {geometry.Rect} rect Rectangular region that needs redrawing. Limit drawing to this area only if it's more efficient to do so.
     */
    draw: function (context, rect) {
        // All draw code goes here
    },

    /**
     * @getter scale
     * @type Float
     */
    get_scale: function () {
        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical";
        }

        return this.scaleX;
    },

    /**
     * @setter scale
     * @type Float
     */
    set_scale: function (val) {
        this.set('scaleX', val);
        this.set('scaleY', val);
    },

    scheduleUpdate: function (opts) {
        opts = opts || {};
        var priority = opts.priority || 0;

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: priority, paused: !this.get('isRunning')});
    },

    /**
     * Triggered when the node is added to a scene
     *
     * @event
     */
    onEnter: function () {
        util.each(this.children, function (child) {
            child.onEnter();
        });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },

    /**
     * Triggered when the node is removed from a scene
     *
     * @event
     */
    onExit: function () {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        util.each(this.children, function (child) {
            child.onExit();
        });
    },

    cleanup: function () {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        util.each(this.children, function (child) {
            child.cleanup();
        });
    },

    resumeSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleAllSelectors: function () {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function () {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
    },

    visit: function (context, rect) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Adjust redraw region by nodes position
        if (rect) {
            var pos = this.get('position');
            rect = new geo.Rect(rect.origin.x - pos.x, rect.origin.y - pos.y, rect.size.width, rect.size.height);
        }

        // Draw background nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder < 0) {
                child.visit(context, rect);
            }
        });

        this.draw(context, rect);

        // Draw foreground nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder >= 0) {
                child.visit(context, rect);
            }
        });

        context.restore();
    },
    transform: function (context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geo.degreesToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function (action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },

    nodeToParentTransform: function () {
        if (this.isTransformDirty) {
            this.transformMatrix = geo.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }
            
            if (!geo.pointEqualToPoint(this.position, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if (this.rotation !== 0) {
                this.transformMatrix = geo.affineTransformRotate(this.transformMatrix, -geo.degreesToRadians(this.rotation));
            }
            if (!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geo.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }
            
            if (!geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }
            
            this.set('isTransformDirty', false);
                
        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function () {
        // TODO
    },

    nodeToWorldTransform: function () {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geo.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function () {
        return geo.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function (worldPoint) {
        return geo.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    /**
     * @getter boundingBox
     * @type geometry.Rect
     */
    get_boundingBox: function () {
        var cs = this.get('contentSize');
        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToParentTransform());
        return rect;
    },

    /**
     * @getter worldBoundingBox
     * @type geometry.Rect
     */
    get_worldBoundingBox: function () {
        var cs = this.get('contentSize');

        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToWorldTransform());
        return rect;
    },

    /**
     * The area of the node currently visible on screen. Returns an rect even
     * if visible is false.
     *
     * @getter visibleRect
     * @type geometry.Rect
     */
    get_visibleRect: function () {
        var s = require('../Director').Director.get('sharedDirector').get('winSize');
        var rect = new geo.Rect(
            0, 0,
            s.width, s.height
        );

        return geo.rectApplyAffineTransform(rect, this.worldToNodeTransform());
    },

    /**
     * @private
     */
    _dirtyTransform: function () {
        this.set('isTransformDirty', true);
    }
});

module.exports.Node = Node;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/RenderTexture.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

var RenderTexture = Node.extend(/** @lends cocos.nodes.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    /** 
     * An in-memory canvas which can be drawn to in the background before drawing on screen
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Integer} width The width of the canvas
     * @opt {Integer} height The height of the canvas
     */
    init: function (opts) {
        RenderTexture.superclass.init.call(this, opts);

        var width = opts.width,
            height = opts.height;

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0, 0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));

    },

    /**
     * @private
     */
    _resizeCanvas: function () {
        var size = this.get('contentSize'),
            canvas = this.get('canvas');

        canvas.width  = size.width;
        canvas.height = size.height;
        if (FLIP_Y_AXIS) {
            this.context.scale(1, -1);
            this.context.translate(0, -canvas.height);
        }

        var s = this.get('sprite');
        if (s) {
            s.set('textureRect', {rect: geo.rectMake(0, 0, size.width, size.height)});
        }
    },

    /**
     * Clear the canvas
     */
    clear: function (rect) {
        if (rect) {
            this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        } else {
            this.canvas.width = this.canvas.width;
            if (FLIP_Y_AXIS) {
                this.context.scale(1, -1);
                this.context.translate(0, -this.canvas.height);
            }
        }
    }
});

module.exports.RenderTexture = RenderTexture;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Scene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node;

var Scene = Node.extend(/** @lends cocos.nodes.Scene */{
    /**
     * Everything in your view will be a child of this object. You need at least 1 scene per app.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Scene.superclass.init.call(this);
    }

});

module.exports.Scene = Scene;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Sprite.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    geo = require('geometry'),
    ccp = geo.ccp;

var Sprite = Node.extend(/** @lends cocos.nodes.Sprite# */{
    textureAtlas: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,
    flipX: false,
    flipY: false,
    offsetPosition: null,
    unflippedOffsetPositionFromCenter: null,
    untrimmedSize: null,

    /**
     * A small 2D graphics than can be animated
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file Path to image to use as sprite atlas
     * @opt {Rect} [rect] The rect in the sprite atlas image file to use as the sprite
     */
    init: function (opts) {
        Sprite.superclass.init.call(this, opts);

        opts = opts || {};

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture,
            frame        = opts.frame,
            spritesheet  = opts.spritesheet,
            rect         = opts.rect;

        this.set('offsetPosition', ccp(0, 0));
        this.set('unflippedOffsetPositionFromCenter', ccp(0, 0));


        if (frame) {
            texture = frame.get('texture');
            rect    = frame.get('rect');
        }

        util.each(['scale', 'scaleX', 'scaleY', 'rect', 'flipX', 'flipY'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._updateQuad));
        }));
        evt.addListener(this, 'textureatlas_changed', util.callback(this, this._updateTextureQuad));

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        } else if (spritesheet) {
            textureAtlas = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!textureAtlas) {
            //throw "Sprite has no texture";
        }

        if (!rect && textureAtlas) {
            rect = {origin: ccp(0, 0), size: {width: textureAtlas.texture.size.width, height: textureAtlas.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);

            this.quad = {
                drawRect: {origin: ccp(0, 0), size: rect.size},
                textureRect: rect
            };
        }

        this.set('textureAtlas', textureAtlas);

        if (frame) {
            this.set('displayFrame', frame);
        }
    },

    /**
     * @private
     */
    _updateTextureQuad: function (obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')});
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    },

    /**
     * @setter textureCoords
     * @type geometry.Rect
     */
    set_textureCoords: function (rect) {
        var quad = this.get('quad');
        if (!quad) {
            quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        quad.textureRect = util.copy(rect);

        this.set('quad', quad);
    },

    /**
     * @setter textureRect
     * @type geometry.Rect
     */
    set_textureRect: function (opts) {
        var rect = opts.rect,
            rotated = !!opts.rotated,
            untrimmedSize = opts.untrimmedSize || rect.size;

        this.set('contentSize', untrimmedSize);
        this.set('rect', util.copy(rect));
        this.set('textureCoords', rect);

        var quad = this.get('quad');

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x =  relativeOffset.x + (this.get('contentSize').width  - rect.size.width) / 2;
        offsetPosition.y = -relativeOffset.y + (this.get('contentSize').height - rect.size.height) / 2;

        quad.drawRect.origin = util.copy(offsetPosition);
        quad.drawRect.size = util.copy(rect.size);
        if (this.flipX) {
            quad.drawRect.size.width *= -1;
            quad.drawRect.origin.x = -rect.size.width;
        }
        if (this.flipY) {
            quad.drawRect.size.height *= -1;
            quad.drawRect.origin.y = -rect.size.height;
        }

        this.set('quad', quad);
    },

    /**
     * @private
     */
    _updateQuad: function () {
        if (!this.quad) {
            this.quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x = relativeOffset.x + (this.get('contentSize').width  - this.get('rect').size.width) / 2;
        offsetPosition.y = relativeOffset.y + (this.get('contentSize').height - this.get('rect').size.height) / 2;

        this.quad.textureRect = util.copy(this.rect);
        this.quad.drawRect.origin = util.copy(offsetPosition);
        this.quad.drawRect.size = util.copy(this.rect.size);

        if (this.flipX) {
            this.quad.drawRect.size.width *= -1;
            this.quad.drawRect.origin.x = -this.rect.size.width;
        }
        if (this.flipY) {
            this.quad.drawRect.size.height *= -1;
            this.quad.drawRect.origin.y = -this.rect.size.height;
        }
    },

    updateTransform: function (ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet";
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        };
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        };

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function (ctx) {
        if (!this.quad) {
            return;
        }
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    },

    isFrameDisplayed: function (frame) {
        if (!this.rect || !this.textureAtlas) {
            return false;
        }
        return (frame.texture === this.textureAtlas.texture && geo.rectEqualToRect(frame.rect, this.rect));
    },


    /**
     * @setter displayFrame
     * @type cocos.SpriteFrame
     */
    set_displayFrame: function (frame) {
        if (!frame) {
            delete this.quad;
            return;
        }
        this.set('unflippedOffsetPositionFromCenter', util.copy(frame.offset));


        // change texture
        if (!this.textureAtlas || frame.texture !== this.textureAtlas.texture) {
            this.set('textureAtlas', TextureAtlas.create({texture: frame.texture}));
        }

        this.set('textureRect', {rect: frame.rect, rotated: frame.rotated, untrimmedSize: frame.originalSize});
    }
});

module.exports.Sprite = Sprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXLayer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    Sprite = require('./Sprite').Sprite,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    geo    = require('geometry'),
    ccp    = geo.ccp,
    Node = require('./Node').Node;

var TMXLayer = SpriteBatchNode.extend(/** @lends cocos.nodes.TMXLayer# */{
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    /** 
     * A tile map layer loaded from a TMX file. This will probably automatically be made by cocos.TMXTiledMap
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.SpriteBatchNode
     *
     * @opt {cocos.TMXTilesetInfo} tilesetInfo
     * @opt {cocos.TMXLayerInfo} layerInfo
     * @opt {cocos.TMXMapInfo} mapInfo
     */
    init: function (opts) {
        var tilesetInfo = opts.tilesetInfo,
            layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo;

        var size = layerInfo.get('layerSize'),
            totalNumberOfTiles = size.width * size.height;

        var tex = null;
        if (tilesetInfo) {
            tex = tilesetInfo.sourceImage;
        }

        TMXLayer.superclass.init.call(this, {file: tex});

		this.set('anchorPoint', ccp(0, 0));

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = util.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', geo.sizeMake(this.layerSize.width * this.mapTileSize.width, (this.layerSize.height * (this.mapTileSize.height - 1)) + this.tileset.tileSize.height));
    },

    calculateLayerOffset: function (pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function () {
        this.tileset.bindTo('imageSize', this.get('texture'), 'contentSize');


        for (var y = 0; y < this.layerSize.height; y++) {
            for (var x = 0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid !== 0) {
                    this.appendTile({gid: gid, position: ccp(x, y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
    },
    appendTile: function (opts) {
        var gid = opts.gid,
            pos = opts.position;

        var z = pos.x + pos.y * this.layerSize.width;
            
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect, textureAtlas: this.textureAtlas});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));
        
        this.addChild({child: tile, z: 0, tag: z});
    },
    positionAt: function (pos) {
        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            return this.positionForOrthoAt(pos);
        case TMXOrientationIso:
            return this.positionForIsoAt(pos);
        /*
        case TMXOrientationHex:
            // TODO
        */
        default:
            return ccp(0, 0);
        }
    },
    positionForOrthoAt: function (pos) {
        var overlap = this.mapTileSize.height - this.tileset.tileSize.height;
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49);
        var y;
        if (FLIP_Y_AXIS) {
            y = Math.floor((this.get('layerSize').height - pos.y - 1) * this.mapTileSize.height + 0.49);
        } else {
            y = Math.floor(pos.y * this.mapTileSize.height + 0.49) + overlap;
        }
        return ccp(x, y);
    },

    positionForIsoAt: function (pos) {
        var mapTileSize = this.get('mapTileSize'),
            layerSize = this.get('layerSize');

        if (FLIP_Y_AXIS) {
            return ccp(
                mapTileSize.width  / 2 * (layerSize.width + pos.x - pos.y - 1),
                mapTileSize.height / 2 * ((layerSize.height * 2 - pos.x - pos.y) - 2)
            );
        } else {
            throw "Isometric tiles without FLIP_Y_AXIS is currently unsupported";
        }
    },


    tileGID: function (pos) {
        var tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);

        return this.tiles[tilePos];
    },
    removeTile: function (pos) {
        var gid = this.tileGID(pos);
        if (gid === 0) {
            // Tile is already blank
            return;
        }

        var tiles = this.get('tiles'),
            tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);


        tiles[tilePos] = 0;

        var sprite = this.getChild({tag: tilePos});
        if (sprite) {
            this.removeChild({child: sprite});
        }
    }
});

exports.TMXLayer = TMXLayer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXTiledMap.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('../TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend(/** @lends cocos.nodes.TMXTiledMap# */{
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * A TMX Map loaded from a .tmx file
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file The file path of the TMX map to load
     */
    init: function (opts) {
        TMXTiledMap.superclass.init.call(this, opts);

        this.set('anchorPoint', ccp(0, 0));

        var mapInfo = TMXMapInfo.create(opts.file);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        util.each(mapInfo.layers, util.callback(this, function (layerInfo) {
            if (layerInfo.get('visible')) {
                var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
                this.addChild({child: child, z: idx, tag: idx});

                var childSize   = child.get('contentSize');
                var currentSize = this.get('contentSize');
                currentSize.width  = Math.max(currentSize.width,  childSize.width);
                currentSize.height = Math.max(currentSize.height, childSize.height);
                this.set('contentSize', currentSize);

                idx++;
            }
        }));
    },
    
    parseLayer: function (opts) {
        var tileset = this.tilesetForLayer(opts);
        var layer = TMXLayer.create({tilesetInfo: tileset, layerInfo: opts.layerInfo, mapInfo: opts.mapInfo});

        layer.setupTiles();

        return layer;
    },

    tilesetForLayer: function (opts) {
        var layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo,
            size = layerInfo.get('layerSize');

        // Reverse loop
        var tileset;
        for (var i = mapInfo.tilesets.length - 1; i >= 0; i--) {
            tileset = mapInfo.tilesets[i];

            for (var y = 0; y < size.height; y++) {
                for (var x = 0; x < size.width; x++) {
                    var pos = x + size.width * y, 
                        gid = layerInfo.tiles[pos];

                    if (gid !== 0 && gid >= tileset.firstGID) {
                        return tileset;
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        //console.log("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name);
        return tileset;
    },
    
    /**
     * Return the ObjectGroup for the secific group
     *
     * @opt {String} name The object group name
     * @returns {cocos.TMXObjectGroup} The object group
     */
    objectGroupNamed: function(opts) {
        var objectGroupName = opts.name,
            objectGroup = null;

        this.objectGroups.forEach(function(item) {

            if(item.name == objectGroupName) {
                objectGroup = item;
            }
        });
        if(objectGroup != null) {
            return objectGroup;
        }
    }
});

exports.TMXTiledMap = TMXTiledMap;


}};
__resources__["/__builtin__/libs/cocos2d/Scheduler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

/** @ignore */
function HashUpdateEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

/** @ignore */
function HashMethodEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

var Timer = BObject.extend(/** @lends cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    /**
     * Runs a function repeatedly at a fixed interval
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {Function} callback The function to run at each interval
     * @opt {Float} interval Number of milliseconds to wait between each exectuion of callback
     */
    init: function (opts) {
        Timer.superclass.init(this, opts);

        this.set('callback', opts.callback);
        this.set('interval', opts.interval || 0);
        this.set('elapsed', -1);
    },

    /**
     * @private
     */
    update: function (dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


var Scheduler = BObject.extend(/** @lends cocos.Scheduler# */{
    updates0: null,
    updatesNeg: null,
    updatesPos: null,
    hashForUpdates: null,
    hashForMethods: null,
    timeScale: 1.0,

    /**
     * Runs the timers
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     * @private
     */
    init: function () {
        this.updates0 = [];
        this.updatesNeg = [];
        this.updatesPos = [];
        this.hashForUpdates = {};
        this.hashForMethods = {};
    },

    schedule: function (opts) {
        var target   = opts.target,
            method   = opts.method,
            interval = opts.interval,
            paused   = opts.paused || false;

        var element = this.hashForMethods[target.get('id')];

        if (!element) {
            element = new HashMethodEntry();
            this.hashForMethods[target.get('id')] = element;
            element.target = target;
            element.paused = paused;
        } else if (element.paused != paused) {
            throw "cocos.Scheduler. Trying to schedule a method with a pause value different than the target";
        }

        var timer = Timer.create({callback: util.callback(target, method), interval: interval});
        element.timers.push(timer);
    },

    scheduleUpdate: function (opts) {
        var target   = opts.target,
            priority = opts.priority,
            paused   = opts.paused;

        var i, len;
        var entry = {target: target, priority: priority, paused: paused};
        var added = false;

        if (priority === 0) {
            this.updates0.push(entry);
        } else if (priority < 0) {
            for (i = 0, len = this.updatesNeg.length; i < len; i++) {
                if (priority < this.updatesNeg[i].priority) {
                    this.updatesNeg.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesNeg.push(entry);
            }
        } else /* priority > 0 */{
            for (i = 0, len = this.updatesPos.length; i < len; i++) {
                if (priority < this.updatesPos[i].priority) {
                    this.updatesPos.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesPos.push(entry);
            }
        }

        this.hashForUpdates[target.get('id')] = entry;
    },

    tick: function (dt) {
        var i, len, x;
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        var entry;
        for (i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (x in this.hashForMethods) {
            if (this.hashForMethods.hasOwnProperty(x)) {
                entry = this.hashForMethods[x];
                for (i = 0, len = entry.timers.length; i < len; i++) {
                    var timer = entry.timers[i];
                    timer.update(dt);
                }
            }
        }

	},

    unscheduleAllSelectorsForTarget: function (target) {
    },

    pauseTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = true;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = true;
        }
    },

	resumeTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = false;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        //console.log('foo', target.get('id'), elementUpdate);
        if (elementUpdate) {
            elementUpdate.paused = false;
        }
	}
});

util.extend(Scheduler, /** @lends cocos.Scheduler */{
    /**
     * A shared singleton instance of cocos.Scheduler
     * @getter sharedScheduler 
     * @type cocos.Scheduler
     */
    get_sharedScheduler: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrame.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var SpriteFrame = BObject.extend(/** @lends cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    /**
     * Represents a single frame of animation for a cocos.Sprite
     *
     * <p>A SpriteFrame has:<br>
     * - texture: A Texture2D that will be used by the Sprite<br>
     * - rectangle: A rectangle of the texture</p>
     *
     * <p>You can modify the frame of a Sprite by doing:</p>
     * 
     * <code>var frame = SpriteFrame.create({texture: texture, rect: rect});
     * sprite.set('displayFrame', frame);</code>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.Texture2D} texture The texture to draw this frame using
     * @opt {geometry.Rect} rect The rectangle inside the texture to draw
     */
    init: function (opts) {
        SpriteFrame.superclass.init(this, opts);

        this.texture      = opts.texture;
        this.rect         = opts.rect;
        this.rotated      = !!opts.rotate;
        this.offset       = opts.offset || ccp(0, 0);
        this.originalSize = opts.originalSize || util.copy(this.rect.size);
    },

    /**
     * @ignore
     */
    toString: function () {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    /**
     * Make a copy of this frame
     *
     * @returns {cocos.SpriteFrame} Exact copy of this object
     */
    copy: function () {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrameCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    Plist = require('Plist').Plist,
    SpriteFrame = require('./SpriteFrame').SpriteFrame,
    Texture2D = require('./Texture2D').Texture2D;

var SpriteFrameCache = BObject.extend(/** @lends cocos.SpriteFrameCache# */{
    /**
     * List of sprite frames
     * @type Object
     */
    spriteFrames: null,

    /**
     * List of sprite frame aliases
     * @type Object
     */
    spriteFrameAliases: null,


    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     * @singleton
     */
    init: function () {
        SpriteFrameCache.superclass.init.call(this);

        this.set('spriteFrames', {});
        this.set('spriteFrameAliases', {});
    },

    /**
     * Add SpriteFrame(s) to the cache
     *
     * @param {String} opts.file The filename of a Zwoptex .plist containing the frame definiitons.
     */
    addSpriteFrames: function (opts) {
        var plistPath = opts.file,
            plist = Plist.create({file: plistPath}),
            plistData = plist.get('data');


        var metaDataDict = plistData.metadata,
            framesDict = plistData.frames;

        var format = 0,
            texturePath = null;

        if (metaDataDict) {
            format = metaDataDict.format;
            // Get texture path from meta data
            texturePath = metaDataDict.textureFileName;
        }

        if (!texturePath) {
            // No texture path so assuming it's the same name as the .plist but ending in .png
            texturePath = plistPath.replace(/\.plist$/i, '.png');
        }


        var texture = Texture2D.create({file: texturePath});

        // Add frames
        for (var frameDictKey in framesDict) {
            if (framesDict.hasOwnProperty(frameDictKey)) {
                var frameDict = framesDict[frameDictKey],
                    spriteFrame = null;

                switch (format) {
                case 0:
                    var x = frameDict.x,
                        y =  frameDict.y,
                        w =  frameDict.width,
                        h =  frameDict.height,
                        ox = frameDict.offsetX,
                        oy = frameDict.offsetY,
                        ow = frameDict.originalWidth,
                        oh = frameDict.originalHeight;

                    // check ow/oh
                    if (!ow || !oh) {
                        //console.log("cocos2d: WARNING: originalWidth/Height not found on the CCSpriteFrame. AnchorPoint won't work as expected. Regenerate the .plist");
                    }

                    if (FLIP_Y_AXIS) {
                        oy *= -1;
                    }

                    // abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);

                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(x, y, w, h),
                                                       rotate: false,
                                                       offset: geo.ccp(ox, oy),
                                                 originalSize: geo.sizeMake(ow, oh)});
                    break;

                case 1:
                case 2:
                    var frame      = geo.rectFromString(frameDict.frame),
                        rotated    = !!frameDict.rotated,
                        offset     = geo.pointFromString(frameDict.offset),
                        sourceSize = geo.sizeFromString(frameDict.sourceSize);

                    if (FLIP_Y_AXIS) {
                        offset.y *= -1;
                    }


                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: frame,
                                                       rotate: rotated,
                                                       offset: offset,
                                                 originalSize: sourceSize});
                    break;

                case 3:
                    var spriteSize       = geo.sizeFromString(frameDict.spriteSize),
                        spriteOffset     = geo.pointFromString(frameDict.spriteOffset),
                        spriteSourceSize = geo.sizeFromString(frameDict.spriteSourceSize),
                        textureRect      = geo.rectFromString(frameDict.textureRect),
                        textureRotated   = frameDict.textureRotated;
                    

                    if (FLIP_Y_AXIS) {
                        spriteOffset.y *= -1;
                    }

                    // get aliases
                    var aliases = frameDict.aliases;
                    for (var i = 0, len = aliases.length; i < len; i++) {
                        var alias = aliases[i];
                        this.get('spriteFrameAliases')[frameDictKey] = alias;
                    }
                    
                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                                                       rotate: textureRotated,
                                                       offset: spriteOffset,
                                                 originalSize: spriteSourceSize});
                    break;

                default:
                    throw "Unsupported Zwoptex format: " + format;
                }

                // Add sprite frame
                this.get('spriteFrames')[frameDictKey] = spriteFrame;
            }
        }
    },

    /**
     * Get a single SpriteFrame
     *
     * @param {String} opts.name The name of the sprite frame
     * @returns {cocos.SpriteFrame} The sprite frame
     */
    getSpriteFrame: function (opts) {
        var name = opts.name;

        var frame = this.get('spriteFrames')[name];

        if (!frame) {
            // No frame, look for an alias
            var key = this.get('spriteFrameAliases')[name];

            if (key) {
                frame = this.get('spriteFrames')[key];
            }

            if (!frame) {
                throw "Unable to find frame: " + name;
            }
        }

        return frame;
    }
});

/**
 * Class methods
 */
util.extend(SpriteFrameCache, /** @lends cocos.SpriteFrameCache */{
    /**
     * @field
     * @name cocos.SpriteFrameCache.sharedSpriteFrameCache
     * @type cocos.SpriteFrameCache
     */
    get_sharedSpriteFrameCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.SpriteFrameCache = SpriteFrameCache;

}};
__resources__["/__builtin__/libs/cocos2d/Texture2D.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Texture2D = BObject.extend(/** @lends cocos.Texture2D# */{
	imgElement: null,
	size: null,
    name: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} [file] The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture;

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.set('imgElement', data);
		this.set('size', {width: this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function (ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function (ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get_data: function () {
        return this.imgElement ? this.imgElement.src : null;
	},

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get_contentSize: function () {
		return this.size;
    }
});

exports.Texture2D = Texture2D;

}};
__resources__["/__builtin__/libs/cocos2d/TextureAtlas.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
	Texture2D = require('./Texture2D').Texture2D;


/* QUAD STRUCTURE
 quad = {
	 drawRect: <rect>, // Where the quad is drawn to
	 textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

var TextureAtlas = BObject.extend(/** @lends cocos.TextureAtlas# */{
	quads: null,
	imgElement: null,
	texture: null,

    /**
     * A single texture that can represent lots of smaller images
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} file The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     * @opt {CanvasElement} [canvas] A canvas to use as a texture
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture,
			canvas = opts.canvas;

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
            texture = Texture2D.create({texture: texture, file: file, data: data});
			this.set('texture', texture);
			this.imgElement = texture.get('imgElement');
        }

		this.quads = [];
	},

	insertQuad: function (opts) {
		var quad = opts.quad,
			index = opts.index || 0;

		this.quads.splice(index, 0, quad);
	},
	removeQuad: function (opts) {
		var index = opts.index;

		this.quads.splice(index, 1);
	},


	drawQuads: function (ctx) {
		util.each(this.quads, util.callback(this, function (quad) {
            if (!quad) {
                return;
            }

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function (ctx, quad) {
        var sx = quad.textureRect.origin.x,
            sy = quad.textureRect.origin.y,
            sw = quad.textureRect.size.width, 
            sh = quad.textureRect.size.height;

        var dx = quad.drawRect.origin.x,
            dy = quad.drawRect.origin.y,
            dw = quad.drawRect.size.width, 
            dh = quad.drawRect.size.height;


        var scaleX = 1;
        var scaleY = 1;

        if (FLIP_Y_AXIS) {
            dy -= dh;
            dh *= -1;
        }

            
        if (dw < 0) {
            dw *= -1;
            scaleX = -1;
        }
            
        if (dh < 0) {
            dh *= -1;
            scaleY = -1;
        }

        ctx.scale(scaleX, scaleY);

        var img = this.get('imgElement');
		ctx.drawImage(img, 
			sx, sy, // Draw slice from x,y
			sw, sh, // Draw slice size
			dx, dy, // Draw at 0, 0
			dw, dh  // Draw size
		);
        ctx.scale(1, 1);
	}
});

exports.TextureAtlas = TextureAtlas;

}};
__resources__["/__builtin__/libs/cocos2d/TMXOrientation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

/**
 * @memberOf cocos
 * @namespace
 */
var TMXOrientation = /** @lends cocos.TMXOrientation */{
    /**
     * Orthogonal orientation
     * @constant
     */
	TMXOrientationOrtho: 1,

    /**
     * Hexagonal orientation
     * @constant
     */
	TMXOrientationHex: 2,

    /**
     * Isometric orientation
     * @constant
     */
	TMXOrientationIso: 3
};

module.exports = TMXOrientation;

}};
__resources__["/__builtin__/libs/cocos2d/TMXXMLParser.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray DOMParser*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso;

var TMXTilesetInfo = BObject.extend(/** @lends cocos.TMXTilesetInfo# */{
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXTilesetInfo.superclass.init.call(this);
    },

    rectForGID: function (gid) {
        var rect = {size: {}, origin: ccp(0, 0)};
        rect.size = util.copy(this.tileSize);
        
        gid = gid - this.firstGID;

        var imgSize = this.get('imageSize');
        
        var maxX = Math.floor((imgSize.width - this.margin * 2 + this.spacing) / (this.tileSize.width + this.spacing));
        
        rect.origin.x = (gid % maxX) * (this.tileSize.width + this.spacing) + this.margin;
        rect.origin.y = Math.floor(gid / maxX) * (this.tileSize.height + this.spacing) + this.margin;
        
        return rect;
    }
});

var TMXLayerInfo = BObject.extend(/** @lends cocos.TMXLayerInfo# */{
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXLayerInfo.superclass.init.call(this);

        this.properties = {};
        this.offset = ccp(0, 0);
    }
});

var TMXObjectGroup = BObject.extend(/** @lends cocos.TMXObjectGroup# */{
    name: '',
    properties: null,
    offset: null,
    objects: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXObjectGroup.superclass.init.call(this);

        this.properties = {};
        this.objects = {};
        this.offset = ccp(0, 0);
    },

    /**
     * return the value for the specific property name
     *
     * @opt {String} name Property name
     * @returns {String} Property value
     */
    propertyNamed: function(opts) {
        var propertyName = opts.name
        return this.properties[propertyName];
    },

    /**
     * Return the object for the specific object name. It will return the 1st
     * object found on the array for the given name.
     *
     * @opt {String} name Object name
     * @returns {Object} Object
     */
    objectNamed: function(opts) {
        var objectName = opts.name;
        var object = null;
        
        this.objects.forEach(function(item) {
         
            if(item.name == objectName) {
                object = item;
            }
        });
        if(object != null) {
            return object;
        }
    }
});

var TMXMapInfo = BObject.extend(/** @lends cocos.TMXMapInfo# */{
    filename: '',
    orientation: 0,
    mapSize: null,
    tileSize: null,
    layer: null,
    tilesets: null,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @param {String} tmxFile The file path of the TMX file to load
     */
    init: function (tmxFile) {
        TMXMapInfo.superclass.init.call(this, tmxFile);

        this.tilesets = [];
        this.layers = [];
        this.objectGroups = [];
        this.properties = {};
        this.tileProperties = {};
        this.filename = tmxFile;

        this.parseXMLFile(tmxFile);
    },

    parseXMLFile: function (xmlFile) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(resource(xmlFile), 'text/xml');

        // PARSE <map>
        var map = doc.documentElement;

        // Set Orientation
        switch (map.getAttribute('orientation')) {
        case 'orthogonal':
            this.orientation = TMXOrientationOrtho;
            break;
        case 'isometric':
            this.orientation = TMXOrientationIso;
            break;
        case 'hexagonal':
            this.orientation = TMXOrientationHex;
            break;
        default:
            throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation');
        }
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)};
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)};


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset');
        var i, len, s;
        for (i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];

            var tileset = TMXTilesetInfo.create();
            tileset.set('name', t.getAttribute('name'));
            tileset.set('firstGID', parseInt(t.getAttribute('firstgid'), 10));
            if (t.getAttribute('spacing')) {
                tileset.set('spacing', parseInt(t.getAttribute('spacing'), 10));
            }
            if (t.getAttribute('margin')) {
                tileset.set('margin', parseInt(t.getAttribute('margin'), 10));
            }

            s = {};
            s.width = parseInt(t.getAttribute('tilewidth'), 10);
            s.height = parseInt(t.getAttribute('tileheight'), 10);
            tileset.set('tileSize', s);

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0];
            tileset.set('sourceImage', path.join(path.dirname(this.filename), image.getAttribute('source')));

            this.tilesets.push(tileset);
        }

        // PARSE <layers>
        var layers = map.getElementsByTagName('layer');
        for (i = 0, len = layers.length; i < len; i++) {
            var l = layers[i];
            var data = l.getElementsByTagName('data')[0];
            var layer = TMXLayerInfo.create();

            layer.set('name', l.getAttribute('name'));
            if (l.getAttribute('visible') !== false) {
                layer.set('visible', true);
            } else {
                layer.set('visible', !!parseInt(l.getAttribute('visible'), 10));
            }

            s = {};
            s.width = parseInt(l.getAttribute('width'), 10);
            s.height = parseInt(l.getAttribute('height'), 10);
            layer.set('layerSize', s);

            var opacity = l.getAttribute('opacity');
            if (opacity === undefined) {
                layer.set('opacity', 255);
            } else {
                layer.set('opacity', 255 * parseFloat(opacity));
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10);
            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }
            layer.set('offset', ccp(x, y));


            // Firefox has a 4KB limit on node values. It will split larger
            // nodes up into multiple nodes. So, we'll stitch them back
            // together.
            var nodeValue = '';
            for (var j = 0, jen = data.childNodes.length; j < jen; j++) {
                nodeValue += data.childNodes[j].nodeValue;
            }

            // Unpack the tilemap data
            var compression = data.getAttribute('compression');
            switch (compression) {
            case 'gzip':
                layer.set('tiles', gzip.unzipBase64AsArray(nodeValue, 4));
                break;
                
            // Uncompressed
            case null:
            case '': 
                layer.set('tiles', base64.decodeAsArray(nodeValue, 4));
                break;

            default: 
                throw "Unsupported TMX Tile Map compression: " + compression;
            }

            this.layers.push(layer);
        }

        // TODO PARSE <tile>

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        for (i = 0, len = objectgroups.length; i < len; i++) {
            var g = objectgroups[i],
                objectGroup = TMXObjectGroup.create();

            objectGroup.set('name', g.getAttribute('name'));
            
            var properties = g.querySelectorAll('objectgroup > properties property'),
                propertiesValue = {};
            
            for(j = 0; j < properties.length; j++) {
                var property = properties[j];
                if(property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value');
                }
            }
           
            objectGroup.set('properties', propertiesValue);

            var objectsArray = [],
                objects = g.querySelectorAll('object');

            for(j = 0; j < objects.length; j++) {
                var object = objects[j];
                var objectValue = {
                    x       : parseInt(object.getAttribute('x'), 10),
                    y       : parseInt(object.getAttribute('y'), 10),
                    width   : parseInt(object.getAttribute('width'), 10),
                    height  : parseInt(object.getAttribute('height'), 10)
                };
                if(object.getAttribute('name')) {
                    objectValue.name = object.getAttribute('name');
                }
                if(object.getAttribute('type')) {
                    objectValue.name = object.getAttribute('type');
                }
                properties = object.querySelectorAll('property');
                for(var k = 0; k < properties.length; k++) {
                    property = properties[k];
                    if(property.getAttribute('name')) {
                        objectValue[property.getAttribute('name')] = property.getAttribute('value');
                    }
                }
                objectsArray.push(objectValue);

            }
            objectGroup.set('objects', objectsArray);
            this.objectGroups.push(objectGroup);
        }
    }
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
exports.TMXTilesetInfo = TMXTilesetInfo;
exports.TMXObjectGroup = TMXObjectGroup;
}};
__resources__["/__builtin__/libs/geometry.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var RE_PAIR = /\{\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\}/,
    RE_DOUBLE_PAIR = /\{\s*(\{[\s\d,.\-]+\})\s*,\s*(\{[\s\d,.\-]+\})\s*\}/;

/** @namespace */
var geometry = {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function (x, y) {
        /**
         * X coordinate
         * @type Float
         */
        this.x = x;

        /**
         * Y coordinate
         * @type Float
         */
        this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function (w, h) {
        /**
         * Width
         * @type Float
         */
        this.width = w;

        /**
         * Height
         * @type Float
         */
        this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function (x, y, w, h) {
        /**
         * Coordinate in 2D space
         * @type {geometry.Point}
         */
        this.origin = new geometry.Point(x, y);

        /**
         * Size in 2D space
         * @type {geometry.Size}
         */
        this.size   = new geometry.Size(w, h);
    },

    /**
     * @class
     * Transform matrix
     *
     * @param {Float} a
     * @param {Float} b
     * @param {Float} c
     * @param {Float} d
     * @param {Float} tx
     * @param {Float} ty
     */
    TransformMatrix: function (a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function (x, y) {
        return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function (p1, p2) {
        return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function (p1, p2) {
        return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function (p1, p2) {
        return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function (p) {
        return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function (p) {
        return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function (p) {
        return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function (p) {
        return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function () {
        return geometry.ccp(0, 0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function (x, y, w, h) {
        return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function (str) {
        var matches = str.match(RE_DOUBLE_PAIR),
            p = geometry.pointFromString(matches[1]),
            s = geometry.sizeFromString(matches[2]);

        return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function (w, h) {
        return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function (str) {
        var matches = str.match(RE_PAIR),
            w = parseFloat(matches[1]),
            h = parseFloat(matches[2]);

        return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function (x, y) {
        return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function (str) {
        var matches = str.match(RE_PAIR),
            x = parseFloat(matches[1]),
            y = parseFloat(matches[2]);

        return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function (r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width) &&
                (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * Returns the smallest rectangle that contains the two source rectangles.
     *
     * @param {geometry.Rect} r1
     * @param {geometry.Rect} r2
     * @returns {geometry.Rect}
     */
    rectUnion: function (r1, r2) {
        var rect = new geometry.Rect(0, 0, 0, 0);

        rect.origin.x = Math.min(r1.origin.x, r2.origin.x);
        rect.origin.y = Math.min(r1.origin.y, r2.origin.y);
        rect.size.width = Math.max(r1.origin.x + r1.size.width, r2.origin.x + r2.size.width) - rect.origin.x;
        rect.size.height = Math.max(r1.origin.y + r1.size.height, r2.origin.y + r2.size.height) - rect.origin.y;

        return rect;
    },

    /**
     * @returns {Boolean}
     */
    rectOverlapsRect: function (r1, r2) {
        if (r1.origin.x + r1.size.width < r2.origin.x) {
            return false;
        }
        if (r2.origin.x + r2.size.width < r1.origin.x) {
            return false;
        }
        if (r1.origin.y + r1.size.height < r2.origin.y) {
            return false;
        }
        if (r2.origin.y + r2.size.height < r1.origin.y) {
            return false;
        }

        return true;
    },

    /**
     * Returns the overlapping portion of 2 rectangles
     *
     * @param {geometry.Rect} lhsRect First rectangle
     * @param {geometry.Rect} rhsRect Second rectangle
     * @returns {geometry.Rect} The overlapping portion of the 2 rectangles
     */
    rectIntersection: function (lhsRect, rhsRect) {

        var intersection = new geometry.Rect(
            Math.max(geometry.rectGetMinX(lhsRect), geometry.rectGetMinX(rhsRect)),
            Math.max(geometry.rectGetMinY(lhsRect), geometry.rectGetMinY(rhsRect)),
            0,
            0
        );

        intersection.size.width = Math.min(geometry.rectGetMaxX(lhsRect), geometry.rectGetMaxX(rhsRect)) - geometry.rectGetMinX(intersection);
        intersection.size.height = Math.min(geometry.rectGetMaxY(lhsRect), geometry.rectGetMaxY(rhsRect)) - geometry.rectGetMinY(intersection);

        return intersection;
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function (point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function (size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function (rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function (rect) {
        return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function (rect) {
        return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function (rect) {
        return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function (rect) {
        return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function (p1, p2, p3, p4) {
        var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
        var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
        var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

        return new geometry.Rect(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function (point, t) {

        /*
        aPoint.x * aTransform.a + aPoint.y * aTransform.c + aTransform.tx,
        aPoint.x * aTransform.b + aPoint.y * aTransform.d + aTransform.ty
        */

        return new geometry.Point(t.a * point.x + t.c * point.y + t.tx, t.b * point.x + t.d * point.y + t.ty);

    },

    /**
     * Apply a transform matrix to a rectangle
     *
     * @param {geometry.Rect} rect Rectangle to transform
     * @param {geometry.TransformMatrix} trans TransformMatrix to apply to rectangle
     * @returns {geometry.Rect} A new transformed rectangle
     */
    rectApplyAffineTransform: function (rect, trans) {

        var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
        var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
        var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
        var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

        p1 = geometry.pointApplyAffineTransform(p1, trans);
        p2 = geometry.pointApplyAffineTransform(p2, trans);
        p3 = geometry.pointApplyAffineTransform(p3, trans);
        p4 = geometry.pointApplyAffineTransform(p4, trans);

        return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * Inverts a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to invert
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformInvert: function (trans) {
        var determinant = 1 / (trans.a * trans.d - trans.b * trans.c);

        return new geometry.TransformMatrix(
            determinant * trans.d,
            -determinant * trans.b,
            -determinant * trans.c,
            determinant * trans.a,
            determinant * (trans.c * trans.ty - trans.d * trans.tx),
            determinant * (trans.b * trans.tx - trans.a * trans.ty)
        );
    },

    /**
     * Multiply 2 transform matrices together
     * @param {geometry.TransformMatrix} lhs Left matrix
     * @param {geometry.TransformMatrix} rhs Right matrix
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformConcat: function (lhs, rhs) {
        return new geometry.TransformMatrix(
            lhs.a * rhs.a + lhs.b * rhs.c,
            lhs.a * rhs.b + lhs.b * rhs.d,
            lhs.c * rhs.a + lhs.d * rhs.c,
            lhs.c * rhs.b + lhs.d * rhs.d,
            lhs.tx * rhs.a + lhs.ty * rhs.c + rhs.tx,
            lhs.tx * rhs.b + lhs.ty * rhs.d + rhs.ty
        );
    },

    /**
     * @returns {Float}
     */
    degreesToRadians: function (angle) {
        return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float}
     */
    radiansToDegrees: function (angle) {
        return angle * (180.0 / Math.PI);
    },

    /**
     * Translate (move) a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to translate
     * @param {Float} tx Amount to translate along X axis
     * @param {Float} ty Amount to translate along Y axis
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformTranslate: function (trans, tx, ty) {
        var newTrans = util.copy(trans);
        newTrans.tx = trans.tx + trans.a * tx + trans.c * ty;
        newTrans.ty = trans.ty + trans.b * tx + trans.d * ty;
        return newTrans;
    },

    /**
     * Rotate a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to rotate
     * @param {Float} angle Angle in radians
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformRotate: function (trans, angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle);

        return new geometry.TransformMatrix(
            trans.a * cos + trans.c * sin,
            trans.b * cos + trans.d * sin,
            trans.c * cos - trans.a * sin,
            trans.d * cos - trans.b * sin,
            trans.tx,
            trans.ty
        );
    },

    /**
     * Scale a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to scale
     * @param {Float} sx X scale factor
     * @param {Float} [sy=sx] Y scale factor
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformScale: function (trans, sx, sy) {
        if (sy === undefined) {
            sy = sx;
        }

        return new geometry.TransformMatrix(trans.a * sx, trans.b * sx, trans.c * sy, trans.d * sy, trans.tx, trans.ty);
    },

    /**
     * @returns {geometry.TransformMatrix} identity matrix
     */
    affineTransformIdentity: function () {
        return new geometry.TransformMatrix(1, 0, 0, 1, 0, 0);
    }
};

module.exports = geometry;

}};
__resources__["/__builtin__/libs/gzip.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * @fileoverview 
 */

/** @ignore */
var JXG = require('./JXGUtil');

/**
 * @namespace
 * Wrappers around JXG's GZip utils
 * @see JXG.Util
 */
var gzip = {
    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @returns {String} Unpacked byte string
     */
    unzip: function(input) {
        return (new JXG.Util.Unzip(input)).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @returns {String} Unpacked byte string
     */
    unzipBase64: function(input) {
        return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipBase64AsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzipBase64(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipAsArray: function (input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzip(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    }

};

module.exports = gzip;

}};
__resources__["/__builtin__/libs/JXGUtil.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Utilities for uncompressing and base64 decoding
 */

/** @namespace */
var JXG = {};

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */
JXG.Util = {};
                                 
/**
 * Unzip zip files
 */
JXG.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,
    
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,
    
    NAMEMAX = 256,
    
    nameBuf = [],
    
    fileout;
    
    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            //if (debug)
            //    document.write(bytepos+": "+bA[bytepos]+"<br>");
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };
    
    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;
    
        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };
        
    function flushBuffer(){
        //document.write('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        //CRC=updcrc(a,crc);
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        //output+=String.fromCharCode(a);
        if(bIdx==0x8000){
            //document.write('ADDBUFFER:'+buf32k);
            bIdx=0;
        }
    };
    
    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;
    
    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;
    
    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax)
                return -1;
            if (flens[fpos[len]] == len)
                return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if (debug)
    		document.write("<br>len:"+len+" treepos:"+treepos);
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;
    	
        tmp = IsPat();
        if (debug)
        	document.write("<br>IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
            if (debug)
            	document.write("<br>b0 "+curplace.b0);
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if (debug)
        	document.write("<br>b0 "+curplace.b0);
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //document.write("<br>createtree<br>");
        if (debug)
        	document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
        Places = currentTree;
        treepos=0;
        flens = lengths;
        fmax  = numval;
        for (i=0;i<17;i++)
            fpos[i] = 0;
        len = 0;
        if(Rec()) {
            //fprintf(stderr, "invalid huffman tree\n");
            if (debug)
            	alert("invalid huffman tree\n");
            return -1;
        }
        if (debug){
        	document.write('<br>Tree: '+Places.length);
        	for (var a=0;a<32;a++){
            	document.write("Places["+a+"].b0="+Places[a].b0+"<br>");
            	document.write("Places["+a+"].b1="+Places[a].b1+"<br>");
        	}
        }

        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if (debug)
            	document.write("b="+b);
            if(b) {
                if(!(X.b1 & 0x8000)){
                	if (debug)
                    	document.write("ret1");
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)){
                	if (debug)
                    	document.write("ret2");
                    return X.b0;    /* If leaf node, return data */
                }
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        if (debug)
        	document.write("ret3");
        return -1;
    };
    
    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        /*if((last = readBit())){
            fprintf(errfp, "Last Block: ");
        } else {
            fprintf(errfp, "Not Last Block: ");
        }*/
        last = readBit();
        type = readBits(2);
        switch(type) {
            case 0:
            	if (debug)
                	alert("Stored\n");
                break;
            case 1:
            	if (debug)
                	alert("Fixed Huffman codes\n");
                break;
            case 2:
            	if (debug)
                	alert("Dynamic Huffman codes\n");
                break;
            case 3:
            	if (debug)
                	alert("Reserved block type!!\n");
                break;
            default:
            	if (debug)
                	alert("Unexpected value %d!\n", type);
                break;
        }

        if(type==0) {
            var blockLen, cSum;

            // Stored 
            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                document.write("BlockLen checksum mismatch\n");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511
    
                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
                //document.write("out:"+String.fromCharCode(j));
                /*fprintf(errfp, "@%d %02x\n", SIZE, j);*/
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                /*fprintf(errfp, "@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack
    
            // Dynamic Huffman tables 
    
            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            //document.write("<br>param: "+literalCodes+" "+distCodes+" "+lenCodes+"<br>");
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }
    
            // Get the decode tree code lengths
    
            //document.write("<br>");
            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
                //document.write(ll[border[j]]+" ");
            }
            //fprintf(errfp, "\n");
            //document.write('<br>ll:'+ll);
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug){
            	document.write("<br>distanceTree");
            	for(var a=0;a<distanceTree.length;a++){
                	document.write("<br>"+distanceTree[a].b0+" "+distanceTree[a].b1+" "+distanceTree[a].jump+" "+distanceTree[a].jumppos);
                	/*if (distanceTree[a].jumppos!=-1)
                    	document.write(" "+distanceTree[a].jump.b0+" "+distanceTree[a].jump.b1);
                	*/
            	}
            }
            //document.write('<BR>tree created');
    
            //read in literal and distance code lengths
            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            if (debug)
            	document.write("<br>n="+n+" bits: "+bits+"<br>");
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if (debug)
                	document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+bits+"<br>");
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times 
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes 
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            /*for(j=0; j<literalCodes+distCodes; j++) {
                //fprintf(errfp, "%d ", ll[j]);
                if ((j&7)==7)
                    fprintf(errfp, "\n");
            }
            fprintf(errfp, "\n");*/
            // Can overwrite tree decode tree as it is not used anymore
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }    
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug)
           		document.write("<br>literalTree");
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        // EOF
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];
    
                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

JXG.Util.Unzip.prototype.unzipFile = function(name) {
    var i;
	this.unzip();
	//alert(unzipped[0][1]);
	for (i=0;i<unzipped.length;i++){
		if(unzipped[i][1]==name) {
			return unzipped[i][0];
		}
	}
	
  };
    
    
JXG.Util.Unzip.prototype.unzip = function() {
	//convertToByteArray(input);
	if (debug)
		alert(bA);
	/*for (i=0;i<bA.length*8;i++){
		document.write(readBit());
		if ((i+1)%8==0)
			document.write(" ");
	}*/
	/*for (i=0;i<bA.length;i++){
		document.write(readByte()+" ");
		if ((i+1)%8==0)
			document.write(" ");
	}
	for (i=0;i<bA.length;i++){
		document.write(bA[i]+" ");
		if ((i+1)%16==0)
			document.write("<br>");
	}	
	*/
	//alert(bA);
	nextFile();
	return unzipped;
  };
    
 function nextFile(){
 	if (debug)
 		alert("NEXTFILE");
 	outputArr = [];
 	var tmp = [];
 	modeZIP = false;
	tmp[0] = readByte();
	tmp[1] = readByte();
	if (debug)
		alert("type: "+tmp[0]+" "+tmp[1]);
	if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
		if (debug)
			alert("GEONExT-GZIP");
		DeflateLoop();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "geonext.gxt";
    	files++;
	}
	if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
		if (debug)
			alert("GZIP");
		//DeflateLoop();
		skipdir();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "file";
    	files++;
	}
	if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
		modeZIP = true;
		tmp[2] = readByte();
		tmp[3] = readByte();
		if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
			//MODE_ZIP
			tmp[0] = readByte();
			tmp[1] = readByte();
			if (debug)
				alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);
			
			gpflags = readByte();
			gpflags |= (readByte()<<8);
			if (debug)
				alert("gpflags: "+gpflags);
			
			var method = readByte();
			method |= (readByte()<<8);
			if (debug)
				alert("method: "+method);
			
			readByte();
			readByte();
			readByte();
			readByte();
			
			var crc = readByte();
			crc |= (readByte()<<8);
			crc |= (readByte()<<16);
			crc |= (readByte()<<24);
			
			var compSize = readByte();
			compSize |= (readByte()<<8);
			compSize |= (readByte()<<16);
			compSize |= (readByte()<<24);
			
			var size = readByte();
			size |= (readByte()<<8);
			size |= (readByte()<<16);
			size |= (readByte()<<24);
			
			if (debug)
				alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);
			
			var filelen = readByte();
			filelen |= (readByte()<<8);
			
			var extralen = readByte();
			extralen |= (readByte()<<8);
			
			if (debug)
				alert("filelen "+filelen);
			i = 0;
			nameBuf = [];
			while (filelen--){ 
				var c = readByte();
				if (c == "/" | c ==":"){
					i = 0;
				} else if (i < NAMEMAX-1)
					nameBuf[i++] = String.fromCharCode(c);
			}
			if (debug)
				alert("nameBuf: "+nameBuf);
			
			//nameBuf[i] = "\0";
			if (!fileout)
				fileout = nameBuf;
			
			var i = 0;
			while (i < extralen){
				c = readByte();
				i++;
			}
				
			CRC = 0xffffffff;
			SIZE = 0;
			
			if (size = 0 && fileOut.charAt(fileout.length-1)=="/"){
				//skipdir
				if (debug)
					alert("skipdir");
			}
			if (method == 8){
				DeflateLoop();
				if (debug)
					alert(outputArr.join(''));
				unzipped[files] = new Array(2);
				unzipped[files][0] = outputArr.join('');
    			unzipped[files][1] = nameBuf.join('');
    			files++;
				//return outputArr.join('');
			}
			skipdir();
		}
	}
 };
	
function skipdir(){
    var crc, 
        tmp = [],
        compSize, size, os, i, c;
    
	if ((gpflags & 8)) {
		tmp[0] = readByte();
		tmp[1] = readByte();
		tmp[2] = readByte();
		tmp[3] = readByte();
		
		if (tmp[0] == parseInt("50",16) && 
            tmp[1] == parseInt("4b",16) && 
            tmp[2] == parseInt("07",16) && 
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
		} else {
			crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
		}
		
		compSize = readByte();
		compSize |= (readByte()<<8);
		compSize |= (readByte()<<16);
		compSize |= (readByte()<<24);
		
		size = readByte();
		size |= (readByte()<<8);
		size |= (readByte()<<16);
		size |= (readByte()<<24);
		
		if (debug)
			alert("CRC:");
	}

	if (modeZIP)
		nextFile();
	
	tmp[0] = readByte();
	if (tmp[0] != 8) {
		if (debug)
			alert("Unknown compression method!");
        return 0;	
	}
	
	gpflags = readByte();
	if (debug){
		if ((gpflags & ~(parseInt("1f",16))))
			alert("Unknown flags set!");
	}
	
	readByte();
	readByte();
	readByte();
	readByte();
	
	readByte();
	os = readByte();
	
	if ((gpflags & 4)){
		tmp[0] = readByte();
		tmp[2] = readByte();
		len = tmp[0] + 256*tmp[1];
		if (debug)
			alert("Extra field size: "+len);
		for (i=0;i<len;i++)
			readByte();
	}
	
	if ((gpflags & 8)){
		i=0;
		nameBuf=[];
		while (c=readByte()){
			if(c == "7" || c == ":")
				i=0;
			if (i<NAMEMAX-1)
				nameBuf[i++] = c;
		}
		//nameBuf[i] = "\0";
		if (debug)
			alert("original file name: "+nameBuf);
	}
		
	if ((gpflags & 16)){
		while (c=readByte()){
			//FILE COMMENT
		}
	}
	
	if ((gpflags & 2)){
		readByte();
		readByte();
	}
	
	DeflateLoop();
	
	crc = readByte();
	crc |= (readByte()<<8);
	crc |= (readByte()<<16);
	crc |= (readByte()<<24);
	
	size = readByte();
	size |= (readByte()<<8);
	size |= (readByte()<<16);
	size |= (readByte()<<24);
	
	if (modeZIP)
		nextFile();
	
};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
JXG.Util.Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = [],
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        input = JXG.Util.Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.push([this._keyStr.charAt(enc1),
                         this._keyStr.charAt(enc2),
                         this._keyStr.charAt(enc3),
                         this._keyStr.charAt(enc4)].join(''));
        }

        return output.join('');
    },

    // public method for decoding
    decode : function (input, utf8) {
        var output = [],
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output.push(String.fromCharCode(chr1));

            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        
        output = output.join(''); 
        
        if (utf8) {
            output = JXG.Util.Base64._utf8_decode(output);
        }
        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = [],
            i = 0,
            c = 0, c2 = 0, c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string.push(String.fromCharCode(c));
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                i += 3;
            }
        }
        return string.join('');
    },
    
    _destrip: function (stripped, wrap){
        var lines = [], lineno, i,
            destripped = [];
        
        if (wrap==null) 
            wrap = 76;
            
        stripped.replace(/ /g, "");
        lineno = stripped.length / wrap;
        for (i = 0; i < lineno; i++)
            lines[i]=stripped.substr(i * wrap, wrap);
        if (lineno != stripped.length / wrap)
            lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));
            
        for (i = 0; i < lines.length; i++)
            destripped.push(lines[i]);
        return destripped.join('\n');
    },
    
    decodeAsArray: function (input){
        var dec = this.decode(input),
            ar = [], i;
        for (i=0;i<dec.length;i++){
            ar[i]=dec.charCodeAt(i);
        }
        return ar;
    },
    
    decodeGEONExT : function (input) {
        return decodeAsArray(destrip(input),false);
    }
};

/**
 * @private
 */
JXG.Util.asciiCharCodeAt = function(str,i){
	var c = str.charCodeAt(i);
	if (c>255){
    	switch (c) {
			case 8364: c=128;
	    	break;
	    	case 8218: c=130;
	    	break;
	    	case 402: c=131;
	    	break;
	    	case 8222: c=132;
	    	break;
	    	case 8230: c=133;
	    	break;
	    	case 8224: c=134;
	    	break;
	    	case 8225: c=135;
	    	break;
	    	case 710: c=136;
	    	break;
	    	case 8240: c=137;
	    	break;
	    	case 352: c=138;
	    	break;
	    	case 8249: c=139;
	    	break;
	    	case 338: c=140;
	    	break;
	    	case 381: c=142;
	    	break;
	    	case 8216: c=145;
	    	break;
	    	case 8217: c=146;
	    	break;
	    	case 8220: c=147;
	    	break;
	    	case 8221: c=148;
	    	break;
	    	case 8226: c=149;
	    	break;
	    	case 8211: c=150;
	    	break;
	    	case 8212: c=151;
	    	break;
	    	case 732: c=152;
	    	break;
	    	case 8482: c=153;
	    	break;
	    	case 353: c=154;
	    	break;
	    	case 8250: c=155;
	    	break;
	    	case 339: c=156;
	    	break;
	    	case 382: c=158;
	    	break;
	    	case 376: c=159;
	    	break;
	    	default:
	    	break;
	    }
	}
	return c;
};

/**
 * Decoding string into utf-8
 * @param {String} string to decode
 * @return {String} utf8 decoded string
 */
JXG.Util.utf8Decode = function(utftext) {
  var string = [];
  var i = 0;
  var c = 0, c1 = 0, c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    } else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  };
  return string.join('');
};

// Added to exports for Cocos2d
module.exports = JXG;

}};
__resources__["/__builtin__/libs/Plist.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * XML Node types
 */
var ELEMENT_NODE                = 1,
    ATTRIBUTE_NODE              = 2,
    TEXT_NODE                   = 3,
    CDATA_SECTION_NODE          = 4,
    ENTITY_REFERENCE_NODE       = 5,
    ENTITY_NODE                 = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE                = 8,
    DOCUMENT_NODE               = 9,
    DOCUMENT_TYPE_NODE          = 10,
    DOCUMENT_FRAGMENT_NODE      = 11,
    NOTATION_NODE               = 12;


var Plist = BObject.extend (/** @lends Plist# */{
    /**
     * The unserialized data inside the Plist file
     * @type Object
     */
    data: null,

    /**
     * An object representation of an XML Property List file
     *
     * @constructs
     * @extends BObject
     * @param {Options} opts Options
     * @config {String} [file] The path to a .plist file
     * @config {String} [data] The contents of a .plist file
     */
    init: function(opts) {
        var file = opts['file'],
            data = opts['data'];

        if (file && !data) {
            data = resource(file);
        }


        var parser = new DOMParser(),
            doc = parser.parseFromString(data, 'text/xml'),
            plist = doc.documentElement;

        if (plist.tagName != 'plist') {
            throw "Not a plist file";
        }


        // Get first real node
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == ELEMENT_NODE) {
                break;
            }
        }

        this.set('data', this.parseNode_(node));
    },


    /**
     * @private
     * Parses an XML node inside the Plist file
     * @returns {Object/Array/String/Integer/Float} A JS representation of the node value
     */
    parseNode_: function(node) {
        var data = null;
        switch(node.tagName) {
        case 'dict':
            data = this.parseDict_(node); 
            break;
        case 'array':
            data = this.parseArray_(node); 
            break;
        case 'string':
            // FIXME - This needs to handle Firefox's 4KB nodeValue limit
            data = node.firstChild.nodeValue;
            break
        case 'false':
            data = false;
            break
        case 'true':
            data = true;
            break
        case 'real':
            data = parseFloat(node.firstChild.nodeValue);
            break
        case 'integer':
            data = parseInt(node.firstChild.nodeValue, 10);
            break
        }

        return data;
    },

    /**
     * @private
     * Parses a <dict> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Object} A simple key/value JS Object representing the <dict>
     */
    parseDict_: function(node) {
        var data = {};

        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            // Grab the key, next noe should be the value
            if (child.tagName == 'key') {
                key = child.firstChild.nodeValue;
            } else {
                // Parse the value node
                data[key] = this.parseNode_(child);
            }
        }


        return data;
    },

    /**
     * @private
     * Parses an <array> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Array} A simple JS Array representing the <array>
     */
    parseArray_: function(node) {
        var data = [];

        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            data.push(this.parseNode_(child));
        }

        return data;
    }
});


exports.Plist = Plist;

}};
__resources__["/__builtin__/libs/qunit.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var defined = {
	setTimeout: typeof window.setTimeout !== "undefined",
	sessionStorage: (function() {
		try {
			return !!sessionStorage.getItem;
		} catch(e){
			return false;
		}
  })()
}

var testId = 0;

var Test = function(name, testName, expected, testEnvironmentArg, async, callback) {
	this.name = name;
	this.testName = testName;
	this.expected = expected;
	this.testEnvironmentArg = testEnvironmentArg;
	this.async = async;
	this.callback = callback;
	this.assertions = [];
};
Test.prototype = {
	init: function() {
		var tests = id("qunit-tests");
		if (tests) {
			var b = document.createElement("strong");
				b.innerHTML = "Running " + this.name;
			var li = document.createElement("li");
				li.appendChild( b );
				li.id = this.id = "test-output" + testId++;
			tests.appendChild( li );
		}
	},
	setup: function() {
		if (this.module != config.previousModule) {
			if ( config.previousModule ) {
				QUnit.moduleDone( {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module;
			config.moduleStats = { all: 0, bad: 0 };
			QUnit.moduleStart( {
				name: this.module
			} );
		}

		config.current = this;
		this.testEnvironment = extend({
			setup: function() {},
			teardown: function() {}
		}, this.moduleTestEnvironment);
		if (this.testEnvironmentArg) {
			extend(this.testEnvironment, this.testEnvironmentArg);
		}

		QUnit.testStart( {
			name: this.testName
		} );

		// allow utility functions to access the current test environment
		// TODO why??
		QUnit.current_testEnvironment = this.testEnvironment;
		
		try {
			if ( !config.pollution ) {
				saveGlobal();
			}

			this.testEnvironment.setup.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Setup failed on " + this.testName + ": " + e.message );
		}
	},
	run: function() {
		if ( this.async ) {
			QUnit.stop();
		}

		if ( config.notrycatch ) {
			this.callback.call(this.testEnvironment);
			return;
		}
		try {
			this.callback.call(this.testEnvironment);
		} catch(e) {
			fail("Test " + this.testName + " died, exception and test follows", e, this.callback);
			QUnit.ok( false, "Died on test #" + (this.assertions.length + 1) + ": " + e.message + " - " + QUnit.jsDump.parse(e) );
			// else next test will carry the responsibility
			saveGlobal();

			// Restart the tests if they're blocking
			if ( config.blocking ) {
				start();
			}
		}
	},
	teardown: function() {
		try {
			checkPollution();
			this.testEnvironment.teardown.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Teardown failed on " + this.testName + ": " + e.message );
		}
	},
	finish: function() {
		if ( this.expected && this.expected != this.assertions.length ) {
			QUnit.ok( false, "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run" );
		}
		
		var good = 0, bad = 0,
			tests = id("qunit-tests");

		config.stats.all += this.assertions.length;
		config.moduleStats.all += this.assertions.length;

		if ( tests ) {
			var ol  = document.createElement("ol");

			for ( var i = 0; i < this.assertions.length; i++ ) {
				var assertion = this.assertions[i];

				var li = document.createElement("li");
				li.className = assertion.result ? "pass" : "fail";
				li.innerHTML = assertion.message || (assertion.result ? "okay" : "failed");
				ol.appendChild( li );

				if ( assertion.result ) {
					good++;
				} else {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}

			// store result when possible
			defined.sessionStorage && sessionStorage.setItem("qunit-" + this.testName, bad);

			if (bad == 0) {
				ol.style.display = "none";
			}

			var b = document.createElement("strong");
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";
			
			addEvent(b, "click", function() {
				var next = b.nextSibling, display = next.style.display;
				next.style.display = display === "none" ? "block" : "none";
			});
			
			addEvent(b, "dblclick", function(e) {
				var target = e && e.target ? e.target : window.event.srcElement;
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode;
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location.search = "?" + encodeURIComponent(getText([target]).replace(/\(.+\)$/, "").replace(/(^\s*|\s*$)/g, ""));
				}
			});

			var li = id(this.id);
			li.className = bad ? "fail" : "pass";
			li.style.display = resultDisplayStyle(!bad);
			li.removeChild( li.firstChild );
			li.appendChild( b );
			li.appendChild( ol );

		} else {
			for ( var i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[i].result ) {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}
		}

		try {
			QUnit.reset();
		} catch(e) {
			fail("reset() failed, following Test " + this.testName + ", exception and reset fn follows", e, QUnit.reset);
		}

		QUnit.testDone( {
			name: this.testName,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );
	},
	
	queue: function() {
		var test = this;
		synchronize(function() {
			test.init();
		});
		function run() {
			// each of these can by async
			synchronize(function() {
				test.setup();
			});
			synchronize(function() {
				test.run();
			});
			synchronize(function() {
				test.teardown();
			});
			synchronize(function() {
				test.finish();
			});
		}
		// defer when previous test run passed, if storage is available
		var bad = defined.sessionStorage && +sessionStorage.getItem("qunit-" + this.testName);
		if (bad) {
			run();
		} else {
			synchronize(run);
		};
	}
	
}

var QUnit = {

	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;
		config.currentModuleTestEnviroment = testEnvironment;
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = '<span class="test-name">' + testName + '</span>', testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = '<span class="module-name">' + config.currentModule + "</span>: " + name;
		}

		if ( !validTest(config.currentModule + ": " + testName) ) {
			return;
		}
		
		var test = new Test(name, testName, expected, testEnvironmentArg, async, callback);
		test.module = config.currentModule;
		test.moduleTestEnvironment = config.currentModuleTestEnviroment;
		test.queue();
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.current.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		a = !!a;
		var details = {
			result: a,
			message: msg
		};
		msg = escapeHtml(msg);
		QUnit.log(details);
		config.current.assertions.push({
			result: a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		QUnit.push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		QUnit.push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		QUnit.push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		QUnit.push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		QUnit.push(expected !== actual, actual, expected, message);
	},

	raises: function(block, expected, message) {
		var actual, ok = false;
	
		if (typeof expected === 'string') {
			message = expected;
			expected = null;
		}
	
		try {
			block();
		} catch (e) {
			actual = e;
		}
	
		if (actual) {
			// we don't want to validate thrown error
			if (!expected) {
				ok = true;
			// expected is a regexp	
			} else if (QUnit.objectType(expected) === "regexp") {
				ok = expected.test(actual);
			// expected is a constructor	
			} else if (actual instanceof expected) {
				ok = true;
			// expected is a validation function which returns true is validation passed	
			} else if (expected.call({}, actual) === true) {
				ok = true;
			}
		}
			
		QUnit.ok(ok, message);
	},

	start: function() {
		config.semaphore--;
		if (config.semaphore > 0) {
			// don't start until equal number of stop-calls
			return;
		}
		if (config.semaphore < 0) {
			// ignore if start is called more often then stop
			config.semaphore = 0;
		}
		// A slight delay, to avoid any current callbacks
		if ( defined.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.semaphore++;
		config.blocking = true;

		if ( timeout && defined.setTimeout ) {
			clearTimeout(config.timeout);
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	}

};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i] === "notrycatch" ) {
			GETParams.splice( i, 1 );
			i--;
			config.notrycatch = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

// define these after exposing globals to keep them in these QUnit namespace only
extend(QUnit, {
	config: config,

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			filters: [],
			queue: [],
			semaphore: 0
		});

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 * 
	 * If jQuery is available, uses jQuery's html(), otherwise just innerHTML.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery( "#main, #qunit-fixture" ).html( config.fixture );
		} else {
			var main = id( 'main' ) || id( 'qunit-fixture' );
			if ( main ) {
				main.innerHTML = config.fixture;
			}
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return QUnit.objectType( obj ) == type;
	},
	
	objectType: function( obj ) {
		if (typeof obj === "undefined") {
				return "undefined";

		// consider: typeof null === object
		}
		if (obj === null) {
				return "null";
		}

		var type = Object.prototype.toString.call( obj )
			.match(/^\[object\s(.*)\]$/)[1] || '';

		switch (type) {
				case 'Number':
						if (isNaN(obj)) {
								return "nan";
						} else {
								return "number";
						}
				case 'String':
				case 'Boolean':
				case 'Array':
				case 'Date':
				case 'RegExp':
				case 'Function':
						return type.toLowerCase();
		}
		if (typeof obj === "object") {
				return "object";
		}
		return undefined;
	},
	
	push: function(result, actual, expected, message) {
		var details = {
			result: result,
			message: message,
			actual: actual,
			expected: expected
		};
		
		message = escapeHtml(message) || (result ? "okay" : "failed");
		message = '<span class="test-message">' + message + "</span>";
		expected = escapeHtml(QUnit.jsDump.parse(expected));
		actual = escapeHtml(QUnit.jsDump.parse(actual));
		var output = message + '<table><tr class="test-expected"><th>Expected: </th><td><pre>' + expected + '</pre></td></tr>';
		if (actual != expected) {
			output += '<tr class="test-actual"><th>Result: </th><td><pre>' + actual + '</pre></td></tr>';
			output += '<tr class="test-diff"><th>Diff: </th><td><pre>' + QUnit.diff(expected, actual) +'</pre></td></tr>';
		}
		if (!result) {
			var source = sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr>';
			}
		}
		output += "</table>";
		
		QUnit.log(details);
		
		config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	
	// Logging callbacks; all receive a single argument with the listed properties
	// run test/logs.html for any related changes
	begin: function() {},
	// done: { failed, passed, total, runtime }
	done: function() {},
	// log: { result, actual, expected, message }
	log: function() {},
	// testStart: { name }
	testStart: function() {},
	// testDone: { name, failed, passed, total }
	testDone: function() {},
	// moduleStart: { name }
	moduleStart: function() {},
	// moduleDone: { name, failed, passed, total }
	moduleDone: function() {}
});

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	QUnit.begin({});
	
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	var banner = id("qunit-header");
	if ( banner ) {
		var paramsIndex = location.href.lastIndexOf(location.search);
		if ( paramsIndex > -1 ) {
			var mainPageLocation = location.href.slice(0, paramsIndex);
			if ( mainPageLocation == location.href ) {
				banner.innerHTML = '<a href=""> ' + banner.innerHTML + '</a> ';
			} else {
				var testName = decodeURIComponent(location.search.slice(1));
				banner.innerHTML = '<a href="' + mainPageLocation + '">' + banner.innerHTML + '</a> &#8250; <a href="">' + testName + '</a>';
			}
		}
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
			if ( defined.sessionStorage ) {
				sessionStorage.setItem("qunit-filter-passed-tests", filter.checked ? "true" : "");
			}
		});
		if ( defined.sessionStorage && sessionStorage.getItem("qunit-filter-passed-tests") ) {
			filter.checked = true;
		}
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );
	}

	var main = id('main') || id('qunit-fixture');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( {
			name: config.currentModule,
			failed: config.moduleStats.bad,
			passed: config.moduleStats.all - config.moduleStats.bad,
			total: config.moduleStats.all
		} );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		runtime = +new Date - config.started,
		passed = config.stats.all - config.stats.bad,
		html = [
			'Tests completed in ',
			runtime,
			' milliseconds.<br/>',
			'<span class="passed">',
			passed,
			'</span> tests of <span class="total">',
			config.stats.all,
			'</span> passed, <span class="failed">',
			config.stats.bad,
			'</span> failed.'
		].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( {
		failed: config.stats.bad,
		passed: passed, 
		total: config.stats.all,
		runtime: runtime
	} );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

// so far supports only Firefox, Chrome and Opera (buggy)
// could be extended in the future to use something like https://github.com/csnover/TraceKit
function sourceFromStacktrace() {
	try {
		throw new Error();
	} catch ( e ) {
		if (e.stacktrace) {
			// Opera
			return e.stacktrace.split("\n")[6];
		} else if (e.stack) {
			// Firefox, Chrome
			return e.stack.split("\n")[4];
		}
	}
}

function resultDisplayStyle(passed) {
	return passed && id("qunit-filter-pass") && id("qunit-filter-pass").checked ? 'none' : '';
}

function escapeHtml(s) {
	if (!s) {
		return "";
	}
	s = s + "";
	return s.replace(/[\&"<>\\]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();
		} else {
			window.setTimeout( process, 13 );
			break;
		}
	}
  if (!config.blocking && !config.queue.length) {
    done();
  }
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.current.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.current.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined") {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, QUnit.jsDump.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, QUnit.jsDump.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				QUnit.jsDump.up();
				for ( var key in map )
					ret.push( QUnit.jsDump.parse(key,'key') + ': ' + QUnit.jsDump.parse(map[key]) );
				QUnit.jsDump.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = QUnit.jsDump.HTML ? '&lt;' : '<',
					close = QUnit.jsDump.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in QUnit.jsDump.DOMAttrs ) {
					var val = node[QUnit.jsDump.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + QUnit.jsDump.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'  ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

// from Sizzle.js
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
};

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 *  
 * Usage: QUnit.diff(expected, actual)
 * 
 * QUnit.diff("the quick brown fox jumped over", "the quick fox jumps over") == "the  quick <del>brown </del> fox <del>jumped </del><ins>jumps </ins> over"
 */
QUnit.diff = (function() {
	function diff(o, n){
		var ns = new Object();
		var os = new Object();
		
		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null) 
				ns[n[i]] = {
					rows: new Array(),
					o: null
				};
			ns[n[i]].rows.push(i);
		}
		
		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null) 
				os[o[i]] = {
					rows: new Array(),
					n: null
				};
			os[o[i]].rows.push(i);
		}
		
		for (var i in ns) {
			if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
				n[ns[i].rows[0]] = {
					text: n[ns[i].rows[0]],
					row: os[i].rows[0]
				};
				o[os[i].rows[0]] = {
					text: o[os[i].rows[0]],
					row: ns[i].rows[0]
				};
			}
		}
		
		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
			n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = {
					text: n[i + 1],
					row: n[i].row + 1
				};
				o[n[i].row + 1] = {
					text: o[n[i].row + 1],
					row: i + 1
				};
			}
		}
		
		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
			n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = {
					text: n[i - 1],
					row: n[i].row - 1
				};
				o[n[i].row - 1] = {
					text: o[n[i].row - 1],
					row: i - 1
				};
			}
		}
		
		return {
			o: o,
			n: n
		};
	}
	
	return function(o, n){
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');
		var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var str = "";
		
		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = [" "];
		}
		else {
			oSpace.push(" ");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = [" "];
		}
		else {
			nSpace.push(" ");
		}
		
		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del>' + out.o[i] + oSpace[i] + "</del>";
			}
		}
		else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del>' + out.o[n] + oSpace[n] + "</del>";
				}
			}
			
			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins>' + out.n[i] + nSpace[i] + "</ins>";
				}
				else {
					var pre = "";
					
					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del>' + out.o[n] + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}
		
		return str;
	};
})();

})(this);

}};
__resources__["/__builtin__/libs/util.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var path = require('path');

/**
 * @namespace
 * Useful utility functions
 */
var util = {
    /**
     * Merge two or more objects and return the result.
     *
     * @param {Object} firstObject First object to merge with
     * @param {Object} secondObject Second object to merge with
     * @param {Object} [...] More objects to merge
     * @returns {Object} A new object containing the properties of all the objects passed in
     */
    merge: function(firstObject, secondObject) {
        var result = {};

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];

            for (var x in obj) {
                if (!obj.hasOwnProperty(x)) {
                    continue;
                }

                result[x] = obj[x];
            }
        };

        return result;
    },

    /**
     * Creates a deep copy of an object
     *
     * @param {Object} obj The Object to copy
     * @returns {Object} A copy of the original Object
     */
    copy: function(obj) {
        if (obj === null) {
            return null;
        }

        var copy;

        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = arguments.callee(obj[i]);
            }
        } else if (typeof(obj) == 'object') {
            if (typeof(obj.copy) == 'function') {
                copy = obj.copy();
            } else {
                copy = {};

                var o, x;
                for (x in obj) {
                    copy[x] = arguments.callee(obj[x]);
                }
            }
        } else {
            // Primative type. Doesn't need copying
            copy = obj;
        }

        return copy;
    },

    /**
     * Iterates over an array and calls a function for each item.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The original array
     */
    each: function(arr, func) {
        var i = 0,
            len = arr.length;
        for (i = 0; i < len; i++) {
            func(arr[i], i);
        }

        return arr;
    },

    /**
     * Iterates over an array, calls a function for each item and returns the results.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The return values from each function call
     */
    map: function(arr, func) {
        var i = 0,
            len = arr.length,
            result = [];

        for (i = 0; i < len; i++) {
            result.push(func(arr[i], i));
        }

        return result;
    },

    extend: function(target, ext) {
        if (arguments.length < 2) {
            throw "You must provide at least a target and 1 object to extend from"
        }

        var i, j, obj, key, val;

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            for (key in obj) {
                // Don't copy built-ins
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                val = obj[key];
                // Don't copy undefineds or references to target (would cause infinite loop)
                if (val === undefined || val === target) {
                    continue;
                }

                // Replace existing function and store reference to it in .base
                if (val instanceof Function && target[key] && val !== target[key]) {
                    val.base = target[key];
                    val._isProperty = val.base._isProperty;
                }
                target[key] = val;

                if (val instanceof Function) {
                    // If this function observes make a reference to it so we can set
                    // them up when this get instantiated
                    if (val._observing) {
                        // Force a COPY of the array or we will probably end up with various
                        // classes sharing the same one.
                        if (!target._observingFunctions) {
                            target._observingFunctions = [];
                        } else {
                            target._observingFunctions = target._observingFunctions.slice(0);
                        }


                        for (j = 0; j<val._observing.length; j++) {
                            target._observingFunctions.push({property:val._observing[j], method: key});
                        }
                    } // if (val._observing)

                    // If this is a computer property then add it to the list so get/set know where to look
                    if (val._isProperty) {
                        if (!target._computedProperties) {
                            target._computedProperties = [];
                        } else {
                            target._computedProperties = target._computedProperties.slice(0);
                        }

                        target._computedProperties.push(key)
                    }
                }
        
            }
        }


        return target;
    },

    beget: function(o) {
        var F = function(){};
        F.prototype = o;
        var ret  = new F();
        F.prototype = null;
        return ret;
    },

    callback: function(target, method) {
        if (typeof(method) == 'string') {
            method = target[method];
        }

        return function() {
            method.apply(target, arguments);
        }
    },

    domReady: function() {
        if (this._isReady) {
            return;
        }

        if (!document.body) {
            setTimeout(function() { util.domReady(); }, 13);
        }

        window.__isReady = true;

        if (window.__readyList) {
            var fn, i = 0;
            while ( (fn = window.__readyList[ i++ ]) ) {
                fn.call(document);
            }

            window.__readyList = null;
            delete window.__readyList;
        }
    },


    /**
     * Adapted from jQuery
     * @ignore
     */
    bindReady: function() {

        if (window.__readyBound) {
            return;
        }

        window.__readyBound = true;

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            return util.domReady();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            
            // A fallback to window.onload, that will always work
            window.addEventListener( "load", util.domReady, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            //document.attachEvent("onreadystatechange", DOMContentLoaded);
            
            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", util.domReady );

            // If IE and not a frame
            /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
        }
    },



    ready: function(func) {
        if (window.__isReady) {
            func()
        } else {
            if (!window.__readyList) {
                window.__readyList = [];
            }
            window.__readyList.push(func);
        }

        util.bindReady();
    },


    /**
     * Tests if a given object is an Array
     *
     * @param {Array} ar The object to test
     *
     * @returns {Boolean} True if it is an Array, otherwise false
     */
    isArray: function(ar) {
      return ar instanceof Array
          || (ar && ar !== Object.prototype && util.isArray(ar.__proto__));
    },


    /**
     * Tests if a given object is a RegExp
     *
     * @param {RegExp} ar The object to test
     *
     * @returns {Boolean} True if it is an RegExp, otherwise false
     */
    isRegExp: function(re) {
      var s = ""+re;
      return re instanceof RegExp // easy case
          || typeof(re) === "function" // duck-type for context-switching evalcx case
          && re.constructor.name === "RegExp"
          && re.compile
          && re.test
          && re.exec
          && s.charAt(0) === "/"
          && s.substr(-1) === "/";
    },


    /**
     * Tests if a given object is a Date
     *
     * @param {Date} ar The object to test
     *
     * @returns {Boolean} True if it is an Date, otherwise false
     */
    isDate: function(d) {
        if (d instanceof Date) return true;
        if (typeof d !== "object") return false;
        var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
        var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
        return JSON.stringify(proto) === JSON.stringify(properties);
    },

    /**
     * Utility to populate a namespace's index with its modules
     *
     * @param {Object} parent The module the namespace lives in. parent.exports will be populated automatically
     * @param {String} modules A space separated string of all the module names
     *
     * @returns {Object} The index namespace
     */
    populateIndex: function(parent, modules) {
        var namespace = {};
        modules = modules.split(' ');

        util.each(modules, function(mod, i) {
            // Use the global 'require' which allows overriding the parent module
            util.extend(namespace, window.require('./' + mod, parent));
        });

        parent.exports = namespace;

        return namespace;
    }


}

util.extend(String.prototype, /** @scope String.prototype */ {
    /**
     * Create an array of words from a string
     *
     * @returns {String[]} Array of the words in the string
     */
    w: function() {
        return this.split(' ');
    }
});




module.exports = util;

}};
__resources__["/__builtin__/path.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
    /**
     * Returns full directory path for the filename given. The path must be formed using forward slashes '/'.
     *
     * @param {String} path Path to return the directory name of
     * @returns {String} Directory name
     */
    dirname: function(path) {
        var tokens = path.split('/');
        tokens.pop();
        return tokens.join('/');
    },

    /**
     * Returns just the filename portion of a path.
     *
     * @param {String} path Path to return the filename portion of
     * @returns {String} Filename
     */
    basename: function(path) {
        var tokens = path.split('/');
        return tokens[tokens.length-1];
    },

    /**
     * Joins multiple paths together to form a single path
     * @param {String} ... Any number of string arguments to join together
     * @returns {String} The joined path
     */
    join: function () {
        return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
    },

    /**
     * Tests if a path exists
     *
     * @param {String} path Path to test
     * @returns {Boolean} True if the path exists, false if not
     */
    exists: function(path) {
        return (__resources__[path] !== undefined);
    },

    /**
     * @private
     */
    normalizeArray: function (parts, keepBlanks) {
      var directories = [], prev;
      for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];

        // if it's blank, but it's not the first thing, and not the last thing, skip it.
        if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

        // if it's a dot, and there was some previous dir already, then skip it.
        if (directory === "." && prev !== undefined) continue;

        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === "" && (
            directory === "." || directory === "..")) continue;

        if (
          directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
        ) {
          directories.pop();
          prev = directories.slice(-1)[0]
        } else {
          if (prev === ".") directories.pop();
          directories.push(directory);
          prev = directory;
        }
      }
      return directories;
    },

    /**
     * Returns the real path by expanding any '.' and '..' portions
     *
     * @param {String} path Path to normalize
     * @param {Boolean} [keepBlanks=false] Whether to keep blanks. i.e. double slashes in a path
     * @returns {String} Normalized path
     */
    normalize: function (path, keepBlanks) {
      return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
    }
};

module.exports = path;

}};
__resources__["/__builtin__/system.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var system = {
    /** @namespace */
    stdio: {
        /**
         * Print text and objects to the debug console if the browser has one
         * 
         * @param {*} Any value to output
         */
        print: function() {
            if (console) {
                console.log.apply(console, arguments);
            } else {
                // TODO
            }
        }
    }
};

if (window.console) {
    system.console = window.console
} else {
    system.console = {
        log: function(){}
    }
}

}};
__resources__["/Background.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

var Background = cocos.nodes.Node.extend({
	displayName: null,
	sprites: null,
	init:function(){
		Background.superclass.init.call(this);
		var json = JSON.parse('{ "filename":"background.psd", "path":"~/Dropbox/Games/ALPACA/ALPACA_HTML5/src/resources/", "width":700, "height":450, "layers":{ "back":{ "stack":0, "position":[-348, -532], "layerwidth":1680, "layerheight":1050, "transformpoint":"center" }, "floor":{ "stack":1, "position":[0, 271], "layerwidth":824, "layerheight":246, "transformpoint":"center" }, "switch":{ "stack":2, "position":[207, 117], "layerwidth":30, "layerheight":59, "transformpoint":"center" }, "box":{ "stack":3, "position":[150, 304], "layerwidth":181, "layerheight":98, "transformpoint":"center" } } } ');
		var allSprites = Array();
		for (var i in json.layers){
			var thisLayer = json.layers[i];
			var spritefile = '/resources/' + i + '.png';
			var sprite = cocos.nodes.Sprite.create({
				file: spritefile
			});
			sprite.set('anchorPoint', new geom.Point(0,0));
			sprite.set('position', new geom.Point(thisLayer.position[0],thisLayer.position[1]));
			//console.log('Placing ' + i + ' at ' + thisLayer.position[0] + ', ' + thisLayer.position[1]);
			//this.addChild({child: sprite});
			if(i == 'back'){
				this.set('contentSize', sprite.get('contentSize'));
				sprite.set('position', new geom.Point(0,0));
			}
			sprite.set('displayName', i);
			sprite.set('zOrder', thisLayer.stack);
			allSprites.push(sprite);
		}
		this.set('displayName', 'background');
		
		this.set('sprites', allSprites);
	}
});
exports.Background = Background;
}};
__resources__["/Ball.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

var Ball = cocos.nodes.Node.extend({
	velocity: null,
	init: function(){
		Ball.superclass.init.call(this);
		var sprite = cocos.nodes.Sprite.create({
			file: '/resources/sprites.png',
			rect: new geom.Rect(64, 0, 16, 16)
		});
		sprite.set('anchorPoint', new geom.Point(0,0));
		this.addChild({child: sprite});
		this.set('contentSize', sprite.get('contentSize'));
		
		this.set('velocity', new geom.Point(60, 120));
		
		this.scheduleUpdate();
	},
	update:function(dt){
		var pos = util.copy(this.get('position')),
			vel = util.copy(this.get('velocity'));
		pos.x += dt * vel.x;
		pos.y += dt * vel.y;
		this.set('position', pos);
		this.testBatCollision();	
		this.testEdgeCollision();
	},
	testBatCollision:function(){
		var vel = util.copy(this.get('velocity')),
			ballBox = this.get('boundingBox'),
			// Get the bat from the parent layer
			batBox = this.get('parent').get('bat').get('boundingBox');
		// Check for collision if the ball is moving down
		if(vel.y > 0){
			if (geom.rectOverlapsRect(ballBox, batBox)){
				vel.y *= -1;
			}
		}
		this.set('velocity', vel);
	},
	testEdgeCollision:function(){
		var vel = util.copy(this.get('velocity')),
			ballBox = this.get('boundingBox'),
			// Get canvas size
			winSize = cocos.Director.get('sharedDirector').get('winSize');
			// Moving left and hit left edge
			if (vel.x < 0 && geom.rectGetMinX(ballBox) < 0) {
				// Flip X velocity
				vel.x *= -1;
			}
			 
			// Moving right and hit right edge
			if (vel.x > 0 && geom.rectGetMaxX(ballBox) > winSize.width) {
				// Flip X velocity
				vel.x *= -1;
			}
			 
			// Moving up and hit top edge
			if (vel.y < 0 && geom.rectGetMinY(ballBox) < 0) {
				// Flip Y velocity
				vel.y *= -1;
			}
			 
			this.set('velocity', vel);
	}
		
});
exports.Ball = Ball;
}};
__resources__["/Bat.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');

var Bat = cocos.nodes.Node.extend({
	init: function(){
		Bat.superclass.init.call(this);
		
		var sprite = cocos.nodes.Sprite.create({
			file: '/resources/sprites.png',
			rect: new geom.Rect(0,0,64,16)
		});

		sprite.set('anchorPoint', new geom.Point(0,0));
		
		this.addChild({child: sprite});
		this.set('contentSize', sprite.get('contentSize'));
		
		this.scheduleUpdate();
	},
	update:function(dt){
		
	}
});

exports.Bat = Bat;
}};
__resources__["/Item.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util      = require('util'),
    cocos     = require('cocos2d'),
    geom      = require('geometry');
    
var Item = cocos.nodes.Node.extend({
    sprite: null,
    displayName: null,
    depthSplit: null,
    obstacleNodes: null,
	hitArea: null,
    init:function(sprite){
        Item.superclass.init.call(this);
        
        /* Don't do this - the boundingBox won't correspond to the display location
        // Set the sprite to 0,0 and put the whole item in that location instead
        this.set('position', sprite.get('position'));
        sprite.set('position', new geom.Point(0,0));
        */
        // Same with z-Order
        this.set('zOrder', sprite.get('zOrder'));
        //sprite.set('zOrder', 0);
        
        
        this.set('sprite', sprite);
        this.set('displayName', sprite.get('displayName'));
        this.addChild({child: sprite, z: sprite.get('zOrder')});
        
        //Set depthSplit
        var pos = sprite.get('position');
        var box = sprite.get('boundingBox');
        var height = box.size.height;
        var depthSplit = pos.y + height;
        this.set('depthSplit', depthSplit);
        //console.log(this.get('displayName') + ' ' + depthSplit);
        //console.log(this.get('displayName') + ' is located at ' + pos.x + ', ' + pos.y);

		// Set hitArea
		this.set('hitArea', sprite.get('boundingBox'));
		//console.log(this.get('hitArea'));
    }
});
exports.Item = Item;
}};
__resources__["/main.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d'),
	geom = require('geometry'),
	util = require('util'),
	Player = require('Player').Player;
	Background = require('Background').Background;
	Item = require('Item').Item;

// Create a new layer
var ALPACAHTML5 = cocos.nodes.Layer.extend({
	player: null,
	background: null,
	items: null,
	obstacles: null,
    init: function() {
        // You must always call the super class version of init
        ALPACAHTML5.superclass.init.call(this);
		
		this.set('isMouseEnabled', true);
		
		// Get size of canvas
        var s = cocos.Director.get('sharedDirector').get('winSize');
		
		// Add background
		var background = Background.create();
		var bgSize = background.get('boundingBox').size;
		background.set('position', new geom.Point(bgSize.width/2, bgSize.height/2));
		this.addChild({child: background, z:0});
		this.set('background', background);
		
		// Add interactive items
		var itemSprites = background.get('sprites');
		var items = Array(),
			obstacles = Array();
		for (var i in itemSprites){
			var thisItem = Item.create(itemSprites[i]); 
			this.addChild({child: thisItem, z: thisItem.get('zOrder')});
			items.push(thisItem);
			if (thisItem.get('displayName') != 'back' && thisItem.get('displayName') != 'floor'){ // Get obstacle data from the json file instead
				obstacles.push(thisItem);
			}
		}
		this.set('items', items);
		this.set('obstacles', obstacles);
		//console.log(obstacles);
		// Add player
		var player = Player.create();
		player.set('position', new geom.Point(300, 300));
		this.addChild({child: player});
		this.set('player', player);
		
		this.setPlayerDepth();
		
		// Background music
		var bgmusic = new Audio('/resources/duckburg.mp3');
		bgmusic.play();
		//console.log(bgmusic);
		
    },
	mouseDown: function(evt) {
		var clickPos = evt.locationInCanvas;
		//console.log('User clicked at ' + clickPos.x + ', ' + clickPos.y);
		var clickTarget = this.getClickTarget(clickPos);
		if(clickTarget.get('displayName') == 'floor'){
			var player = this.get('player');
			player.walkTo(clickPos);
			this.scheduleUpdate();
		}
    },
	getClickTarget:function(clickPos){
		var highestNode;
		var highestZ = -1;
		var items = this.get('items');
		for (var i in items){
			var thisItem = items[i];
			if(geom.rectContainsPoint(thisItem.get('sprite').get('boundingBox'), clickPos)){
				var currentZ = thisItem.get('sprite').get('zOrder');
				//console.log('Child ' + thisChild.get('displayName') + ' has z of ' + currentZ);
				if(currentZ > highestZ){
					highestNode = thisItem;
					highestZ = currentZ;
				}
			}
		}
	    console.log("Click target: " + highestNode.get('displayName'));
		return highestNode;
	},
	setPlayerDepth:function(){
		var player = this.get('player'),
			items = this.get('items'),
			playerPos = player.get('position'),
			playerDepth = player.get('zOrder');
		//console.log(playerPos.y);
		for (var i in items){
			var thisItem = items[i];
			if (thisItem.get('displayName') != 'back' && thisItem.get('displayName') != 'floor'){
				var itemSplit = thisItem.get('depthSplit');
				var itemDepth = thisItem.get('zOrder');
				if (playerPos.y > itemSplit && playerDepth < itemDepth){
					console.log('Player should be in front of ' + thisItem.get('displayName'));
					this.reorderChild({child: player, z: itemDepth});
					this.reorderChild({child: thisItem, z: playerDepth});
				} else if (playerPos.y < itemSplit && playerDepth > itemDepth){
					console.log('Player should be behind ' + thisItem.get('displayName'));
					this.reorderChild({child: player, z: itemDepth});
					this.reorderChild({child: thisItem, z: playerDepth});
				}
			}
		}
	},
	checkForCollisions:function(){
		var player = this.get('player'),
			playerPos = util.copy(player.get('position')),
			playerHitArea = util.copy(player.get('hitArea')),
			obstacles = this.get('obstacles');
		// Correct sprite position for hitArea
		playerHitArea.origin.x += playerPos.x;
		playerHitArea.origin.y += playerPos.y;
		//console.log(playerPos);
		//console.log(playerHitArea.origin);
		for (var i in obstacles){
			var thisObstacle = obstacles[i];
			var obstacleHitArea = thisObstacle.get('hitArea');
			if(geom.rectOverlapsRect(playerHitArea, obstacleHitArea)){
				console.log('Player is colliding with ' + thisObstacle.get('displayName'));
			}
		}
	},
	update:function(dt){
		var player = this.get('player'),
			items = this.get('items');
		if(player.get('isWalking')){
			this.setPlayerDepth();
			this.checkForCollisions();
		} else{
			this.pauseSchedulerAndActions();
		}
	}
});

exports.main = function() {
    // Initialise application

    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('alpacahtml5_app'));

    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Add our layer to the scene
    scene.addChild({child: ALPACAHTML5.create()});

    // Run the scene
    director.runWithScene(scene);
};

}};
__resources__["/Player.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var util      = require('util'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    cocos     = require('cocos2d'),
    //events    = require('events'),
    nodes     = cocos.nodes,
    actions   = cocos.actions,
    geom      = require('geometry'),
    ccp       = geom.ccp;

var Player = cocos.nodes.Node.extend({
	displayName: null,
	destination: null,
	increments: null,
	walkRate: null,
	targetBuffer: null,
	sprite: null,
	frameCache: null,
	animChache: null,
	yOffset: null,
	isWalking: null,
	hitArea: null,
	init:function(){
		Player.superclass.init.call(this);
		
		var frameCache = cocos.SpriteFrameCache.get('sharedSpriteFrameCache'),
		            animCache = cocos.AnimationCache.get('sharedAnimationCache');

        frameCache.addSpriteFrames({file: module.dirname + '/resources/animations/al/al_basic.plist'});
		this.set('frameCache', frameCache);

        // create walking animation
        var walkFrames = [],
            frame,
            i,
			ii;
        for (i = 1; i < 14; i++) {
			ii = i + 1;
			var frameName = 'al_walk00' + (i >= 10 ? i : '0' + i) + '.png';
			//console.log(frameName);
            frame = frameCache.getSpriteFrame({name: frameName});
            walkFrames.push(frame);
        }

        var animation = cocos.Animation.create({frames: walkFrames, delay: 0.06});
		animCache.addAnimation({animation: animation, name: 'walk'});
		
		this.set('animCache', animCache);
		
		var sprite = nodes.Sprite.create({frame: frameCache.getSpriteFrame({name: 'al_stand.png'})});
		this.addChild({child: sprite});
		this.set('sprite', sprite);
		
		// Add shadow
		var shadow = nodes.Sprite.create({file: module.dirname + '/resources/animations/al/al_shadow.png'});
		this.addChild({child: shadow});
		shadow.set('position', new geom.Point(0, 0));
		this.set('hitArea', shadow.get('boundingBox'));
		//console.log(this.get('hitArea').origin);
		
		var box = sprite.get('boundingBox'),
			yOffset = -box.size.height/2.2;
		this.set('yOffset', yOffset);
		sprite.set('position', new geom.Point(0,yOffset));
		this.set('walkRate', 10);
		this.set('targetBuffer', 10);
		this.set('displayName', 'player');
		//this.set('zOrder', 2);
		
	},
	walkTo:function(clickPos){
		this.pauseSchedulerAndActions();
		this.set('destination', clickPos);
		//console.log('Player is walking to ' + clickPos.x + ', ' + clickPos.y);
		this.getIncrements(clickPos);
		this.scheduleUpdate();	
		this.animateWalking();
		this.set('isWalking', true);
	},
	getIncrements:function(targetPos){
		var pos = this.get('position');
		var xdiff = targetPos.x - pos.x;
		var ydiff = targetPos.y - pos.y;
		var diff = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
		var fraction = this.get('walkRate') / diff;
		var increments = new geom.Point(fraction*xdiff, fraction*ydiff);
		this.set('increments', increments);
		//console.log('Moving at a rate of ' + increments.x + ', ' + increments.y);
	},
	animateWalking:function(){
		var animCache = this.get('animCache'),
			animation = animCache.getAnimation({name: 'walk'});
			animate = actions.Animate.create({animation: animation, restoreOriginalFrame:false}),
			sprite = this.get('sprite');
		sprite.runAction(actions.RepeatForever.create(animate));
	},
	update:function(dt){
		var dest = this.get('destination'),
			pos = this.get('position'),
			incs = this.get('increments'),
			buffer = this.get('targetBuffer'),
			sprite = this.get('sprite'),
			yOffset = this.get('yOffset'),
			frameCache = this.get('frameCache');
		if (pos.x > (dest.x-buffer) && pos.x < (dest.x+buffer) && pos.y > (dest.y-buffer) && pos.y < (dest.y+buffer)){
			//console.log('Reached destination');
			this.pauseSchedulerAndActions();
			this.removeChild({child:sprite});
			sprite = nodes.Sprite.create({frame: frameCache.getSpriteFrame({name: 'al_stand.png'})});
			this.addChild({child: sprite});
			this.set('sprite', sprite);
			sprite.set('position', new geom.Point(0,yOffset));
			this.set('isWalking', false);
		} else{
		  	pos.x += incs.x;
			pos.y += incs.y;
			this.set('position', pos);
			// Make sure the player faces the direction of movement
		  	if (incs.x < 0 && this.scaleX > 0){
				this.scaleX *= -1;
			} else if (incs.x > 0 && this.scaleX < 0){
				this.scaleX *= -1;
			}
		}
	}
});
exports.Player = Player;
}};
__resources__["/resources/al.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/animations/al/al_basic.plist"] = {meta: {mimetype: "application/xml"}, data: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n\t<key>frames</key>\n\t<dict>\n\t\t\n\t\t<key>al_grab0001.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {102, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{445, 189}, {102, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0002.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {115, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{115, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{115, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{2, 566}, {115, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0003.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {131, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{131, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{131, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{304, 190}, {131, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0004.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {146, 186}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{146, 186}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{146, 186}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{156, 190}, {146, 186}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0005.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {163, 186}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{163, 186}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{163, 186}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{156, 2}, {163, 186}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0006.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {141, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{141, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{141, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{2, 193}, {141, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0007.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {120, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{120, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{120, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{127, 380}, {120, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_grab0008.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {102, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{432, 377}, {102, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_stand.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {102, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{102, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{445, 2}, {102, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0001.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {152, 189}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{152, 189}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{152, 189}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{2, 2}, {152, 189}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0002.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {123, 184}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{123, 184}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{123, 184}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{2, 380}, {123, 184}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0003.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {99, 180}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{99, 180}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{99, 180}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{536, 561}, {99, 180}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0004.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {91, 177}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{91, 177}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{91, 177}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{637, 561}, {91, 177}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0005.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {91, 179}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{91, 179}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{91, 179}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{344, 564}, {91, 179}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0006.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {104, 183}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{104, 183}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{104, 183}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{549, 2}, {104, 183}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0007.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {122, 186}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{122, 186}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{122, 186}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{321, 2}, {122, 186}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0008.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {106, 183}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{106, 183}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{106, 183}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{536, 376}, {106, 183}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0009.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {93, 179}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{93, 179}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{93, 179}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{249, 564}, {93, 179}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0010.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {91, 177}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{91, 177}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{91, 177}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{437, 564}, {91, 177}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0011.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {92, 178}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{92, 178}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{92, 178}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{119, 567}, {92, 178}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0012.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {104, 181}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{104, 181}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{104, 181}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{549, 187}, {104, 181}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t\t<key>al_walk0013.png</key>\n\t\t<dict>\n\t\t\t<key>aliases</key>\n\t\t\t<array/>\n\t\t\t<key>spriteColorRect</key>\n\t\t\t<string>{{0, 0}, {126, 185}}</string>\n\t\t\t<key>spriteOffset</key>\n\t\t\t<string>{0, -0}</string>\n\t\t\t<key>spriteSize</key>\n\t\t\t<string>{126, 185}</string>\n\t\t\t<key>spriteSourceSize</key>\n\t\t\t<string>{126, 185}</string>\n\t\t\t<key>spriteTrimmed</key>\n\t\t\t<true/>\n\t\t\t<key>textureRect</key>\n\t\t\t<string>{{304, 377}, {126, 185}}</string>\n\t\t\t<key>textureRotated</key>\n\t\t\t<false/>\n\t\t</dict>\n\t\t\n\t</dict>\n\t<key>metadata</key>\n\t<dict>\n\t\t<key>format</key>\n\t\t<integer>3</integer>\n\t\t<key>size</key>\n\t\t<string>{1024, 1024}</string>\n\t</dict>\n</dict>\n</plist>"};
__resources__["/resources/animations/al/al_basic.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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Hc1gwqbfD/H+PtIyUnN+fPxiGXepP+QbEwECBAgQIECAAAECBAgQOEVgtABAu7FxcZx/TO46Ul78ZprC1HkQoN2pdb+XMf8xLvLfb/LX8xfxOdNnefHZRIAAAQIECBAgQIAAAQIEjhKYTACg3er1BfAmGLB5bS/WxefbKOQx0kWkZaSsK99vJnffNxJeCRAgQIAAAQIECBAgQGC2ApMNAGwTjaBA/v2AvEDPKS/SN+8/ztjzzyLyriLlOu3pJu68/9ic6e57U8N7AgQIECBAgAABAgQIEKhBYFYBgHPB48I+f4OfQYBFpAwILCNdRADgy3g1ESBAgAABAgQIECBAgACBagVeVACg2lHUMQIECBAgQIAAAQIECBAgUBD4P4V82QQIECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKHxxU5gAABPtJREFUBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQEBABKQvIJECBAgAABAgQIECBAgEAFAgIAFQyiLhAgQIAAAQIECBAgQIAAgZKAAEBJSD4BAgQIECBAgAABAgQIEKhAQACggkHUBQIECBAgQIAAAQIECBAgUBIQACgJySdAgAABAgQIECBAgAABAhUICABUMIi6QIAAAQIECBAgQIAAAQIESgICACUh+QQIECBAgAABAgQIECBAoAIBAYAKBlEXCBAgQIAAAQIECBAgQIBASUAAoCQknwABAgQIECBAgAABAgQIVCAgAFDBIOoCAQIECBAgQIAAAQIECBAoCQgAlITkEyBAgAABAgQIECBAgACBCgQEACoYRF0gQIAAAQIECBAgQIAAAQIlAQGAkpB8AgQIECBAgAABAgQIECBQgYAAQAWDqAsECBAgQIAAAQIECBAgQKAkIABQEpJPgAABAgQIECBAgAABAgQqEBAAqGAQdYEAAQIECBAgQIAAAQIECJQE/j+MLqr7qsgWiwAAAABJRU5ErkJggg==")};
__resources__["/resources/animations/al/al_grab0001.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAC5CAYAAADat0qYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMTRCMDkyQUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0Mzg2QkE3NEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0002.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAC5CAYAAAAbMAA0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMTRCMDkyRUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMTRCMDkyREY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0003.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIMAAAC5CAYAAAALfIytAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMTRCMDkzMkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMTRCMDkzMUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0004.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAAC6CAYAAABFhBTVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMkE2MUI1REY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMkE2MUI1Q0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0005.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKMAAAC6CAYAAADCtf3TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMkE2MUI2MUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMkE2MUI2MEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0006.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAAC5CAYAAAAVtbweAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMkE2MUI2NUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMkE2MUI2NEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0007.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAC5CAYAAADj0PvDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNDA2NDc1OEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNDA2NDc1N0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_grab0008.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAC5CAYAAADat0qYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNDA2NDc1Q0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNDA2NDc1QkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+ktmWIQAAC+9JREFUeNrsXTt6YjsSlt0ddAY7gJtNBuFkcFeA047wrABmBfiGE8EO8M1uhp1NBr0C42wycNgROOsbMefHOrRQn4d00KPEUX1ffXbTGHT0q54qlW5Y+NRTeM8+4deQHuomoLG2Eu5y7vOfTc3P2Ca8TniV8GPC7xcA/y1EYBoJj/kEZtGD4oN1Er7j3D2brV6Pdbtd1mw2Tz/zaLVase12y9brNXt9PRMcgDRL+CkDpAYHMu+DV8Lfv4WwsvFAy4QPJbxLeJqxIvH3o4RfxPcnQBxGo9Hh5eXlcAntdrvDYrE4DAaDQ6PREMcy5wsBNOSvHRR5GAIwS40HkkGaiq9j4kyAUQTSdDo9tFotcSybCuM/KNo6bzSo+FAHGRBMmEuCFAkSVIXnlIGZmAAmBWc4HB42m41TgCaTSdUxL69NjZUy1BnUjivCYoBNixKjwJgo1wSJ1Rjj4OptTB7bcgKKCN+paHtaJify1jAwK3ZlhBjp6elJJXAlH8tYsTNQKz6pxGubh7DIhqZB6XQ6To1/Hi2XyzxwBqFogM21gZLSfD6Xx7gJSTUb8c4QU1AkBL/COCeh2c3KUoMUCdQGZRJc6WlIoLRCScVckmcTcmy9UICZ6gICteU6/WLCGQjNzmxE410ECtLvLgDBd2AiZTao0iZBqTH4/2AxtQ6wkP9yJSFlqRWMp2pWASqNu9A7vpcURlrGt6sLidTJx1WRIiEjTVpqJqLt8EmQgipOCMDUWVA2pObWJkLIM/mkx8fHcx3barFEIk6ceIAsUXPH10V6fn4+1geoEuoNxuMx4/UB9+QlxkeqXiR5T0XMt6VBIuwLbKAsNVVsDXd0NhGYEpInW4yRRGckyw5dqDoHpFUZxRR+Slz1sGSVs3a7bezzE2/zqEXZz4obel4ZViUliYGLXmC4DybGLTkCpMBpUHGX8zyuNLjMKF0ykjwVkpwv1GKbU7Gcz2Rk1XydicUkAD6lZGNOW8woTw2FYG/gJheV26rSw8ND+us9JakZUfDMVKN+rG5sgJmmS6XGer7Ml53Jik9ke4P3ONrt1KqisXkMA4bv6J8mD8/u7u68rBCoJqiV/X5//DdcY4wFrq0pN7ksK/D+/p6q999JqTOszLqSVHLbogDMmdsc2iaYyZ1OVqHM6ZNFYP6G5kjVGVSJL3Xmk758+XI8NMUPTGEuZnxu6DgB1y416YGorKBV4BGVRTOnktR0WGsWxHGNlpgJCKUKxlCF5imbIL1GhkbiIH1U7bso9shTYVJByo6aHVyazkdR9MCyqoIkwBbUgDlTadRqkk2CI+6cZqgxksWBPUa4YNwkYe8nAxTlnJnrHcxvYrECfPt+v3/086+NhFRMStjV/Df1cY9kr8VmMtF1yVSGnQmq8HzEDFZEUrAtGRWfGxZQwflpX4pltAWhUPGvY/cQwwCQHHtSeYPMdvelBvvZJUmu/huzgu5J2E2czWZHG+SakNdLv1v+fmwjgLEzC357OzsTu+e5MNgTUodl4RIPua9u5LhfWjzhQ2rgWWmmWlrUVNKUSd2SmIUDslBxrhOhWBRlR0lsJCYvUWVD7vo61TWJLj/uPqa7kKZUHVx2mTNUVe6fs4+eaq8+gelxHdomI7KJPQJAOtUtIgBlk4/FgM8ued+aL9J318/fEFP4rhhbs9D1JXscRhkeVtq4Lo2vsio2M9h5gV+HGTy7r2v8xY0oTJaCztc6rAR3FwsAn18URynuuyxdqTKoriem3xjUTHKt18stGsTrcF3TChiVNElaWF7WRzOPUFmjYHdmttMvmUGgS/ZdmJ7lpTHPbbJavkGhuh2t2GTuomN/RdnlR1/qizoJdcmFmpPPoVFgeq7jk5AIrjlsnwLdVVVpecA8xOkvJvngbYkjYASYASVp8ZHEVPXOcOJZ5a2sQsPsLGDGUR7U6P7+XtksXQoMOdvioiLfga3Rlppb6tJCGZjjhI3H1qRGzIUdqHEIVTQaebxeFYkhWYpv4jwkIamppJEW1KQllCJ0xcyz1uGlW0GNkZMY302CdKRa4+zPnQ4wJIOFUICxqc6mjKDhD+2gk8Y+UUtVYsgtTfQQo+4q25QasqqMaiqm0HgYtDMApkPxIUMEBk6ARv6sUwZMO/DVF+q4SxNt1m5JYhcU94VMijHNJjiJCb0fgOL420XeWQTGAmlsBxQ+6JKSGqNWFWM5sflSJDH9KC3evMouy6mkuQ1YDVyLd5aLYFRjfr2zKXmJubbuTIrPc0deYq6tO1NZ60eBG2QlxmTH8ADTSn2ywFyL0ZdzZ4OBUiFmNwJDU2poSgxWVQhFFxYdAJoSc829MmE35YuDsrSenDcDMCufA8fB02tVY5oLr01KYurQWbaKnfEuMRr75HVwm8+AWfsaMHRvSCVKl7jNiNN0HACvwNRBWjRUdlMGBmejtzF2oaXOUuPvHBhUk1xr7FIRGLyhIwPTj9JinxQOOfW9ussw+iHWjV1KCo7O2Cswiufk66jO2qk68wJMHa8rOc662rbGvTdgVJvy1FCVneyMF2CusQG2jn1VCTRTYPYsEiV11kuBcRr911WVaQDT9AIMmr9FYIrVmbfIP1IxeZGYSOrAfItTQRMY0FOcDprArOJ0RImJpAGMtw2zOpFiDLeWUzJRndGI4fYyMFGdWSbFPOE+SoxjNaZ47cmrDMx7lBp79PSkNLVb2fg7k5o6FWGcTexqdREw1iWmDkV+WWpMUWLWecC8sZg7M07obC7dJFsITN79MThJa61M8nA41A4YxXtnjm+FcORtLc9sDRDHLupGqApSBGXPNVbunr81dVY3+4K4BZedqjpu6S9l98cYpzoV+sHgo1RL0bYoe8Qo5zB+lt/HLbC+ejFrXnK30wHdaJNstPCIoOTyXJz4W1WdZ4LqUIGJJCXU9eur9iWyZ2nnT2U5G+42fzE18B8/fhz52rpgpEb+69ev7Pv371U+4h8J/0fnD6z0zESnJVz4GcJtF4ZvMS9irY6+DWbx2kXYHfHq3JAIC0vjsgWj15ikNGKO+pXhal3qXZgAiMlrhS8BBuT0ruVUkqi411BZFgHRusJEpg7z1MdMVHeubRIuxcYl2YZVlnYfZhIqjSk0zIbKgzTZUHsAw/VV9XxuT3SjCUyDxzak8ippEzrk4fAz/V1lQw5xB1xd/AQ/Pz97CX/4nL6XAYPuZ2m2ET+bGb9HMhQCsY++mK9l+bEXRvCSn0AYc7fUsClTltN3+XNGdrMdF3Flgpr/Q1D73YL0S6GEfJbUVwTFHMFeVD5FcZuXRIvkl24lIxTpckNuHBhsJ9/HuaUHDOhPdsFlzZHsm4MeI3avTCDsjCJAejGM+6wH+9iT3kUAcnnhU4c2eLwzYWqFGosaATMyOdGfKwRNz5zF6FbOoe15FPzGVaGPpOfWccAcXBzoax9nydVvLVRZVfJx+/kLs1S0SMErM2mbfGStGXN7M27P1IS5aiT3zrMKPvTwyuF39UMDBoQ096MHYFw6Ht0QgQH5qJF16Zk1QwSmw/zs97SjxNBRKb4oSImpZ7PlAIBpx+mmB0wjAkMTGB8nYrcRGIdGsQIwqxAXwzVLTErrCAwtSgF5jsDQInGSHkOTTlfArDxKjMvvb7OcWmSq5HqzLKuZgcsTcdOQAHI5MfOM7x94WByjEIChsGHloxQL39miDMzU4URQUKey9AwpgjJyPAnTDKmhULg4oQRKj/ktwmvx1Uql/mxOAZQWo1G9Sa2CdOnba4t1z8XlVV7AGcTJp1kkuIkTT8/mDOOEa/HAFTCLONmV0jjWk5ixe4Y+jcUUzm2cD1I04xkK7fMxOmn+fpxnLUBA2OnFuaLfbH2Rr+p+Ez3DfHiTv3hmnywB83fCf7GP7rP/JLxSt+zj+Pz/Ev7BbeNvfAX/l///SngvuG1hHF3+uU57cqXnNheM5uFaG3FEhycsl5x3UsQ/yXj9bLvixsMqxZffs59nNynQY8L/cvDcfS51f0qvtzmf/u+GwKT0BJBsgjXjD97kEyQf6MVrZO6cvmE0Sez11dQAC6vuLieOgi35I2NR/LJaIzD2qMPBSYHq838H87z/F2AAhLx0m2xyp8sAAAAASUVORK5CYII=")};
__resources__["/resources/animations/al/al_shadow.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/animations/al/al_stand.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAC5CAYAAADat0qYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNDA2NDc2MEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNDA2NDc1RkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0001.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAAC9CAYAAABPo7SkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNTdERUEwQkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNTdERUEwQUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0002.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAC4CAYAAADDu5NlAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNTdERUEwRkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNTdERUEwRUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0003.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAC0CAYAAACAAJICAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNjgxNjFBQUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNTdERUExMkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0004.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACxCAYAAACr6cF9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNjgxNjFBRUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNjgxNjFBREY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0005.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACzCAYAAADmIWB2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNjgxNjFCMkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNjgxNjFCMUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0006.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAAC3CAYAAAD+dBtbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCODEzRTg0NUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCODEzRTg0NEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0007.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHoAAAC6CAYAAABhsVlQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCODEzRTg0OUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCODEzRTg0OEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0008.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAAC3CAYAAAD6gctmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCODEzRTg0REY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCODEzRTg0Q0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0009.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAACzCAYAAADrPxAxAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCOUIyRkNEQ0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCOUIyRkNEQkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Yv7QUgAADB1JREFUeNrsXT16IjsWFe4XdIZ3AC97GeygCCfD4WSwA9wrwC98Ed4BdjgRdjYZdDgR9grAK8CdTUcMh6fyqMtSlaRS6d4q6n6fPrtp26U6devcX0kdwVe6pzE8jZH8ei2/L5L303g5jb38ujmNV0431gn0d5IcQP50/Ds3cvTV/xgMBuL6+loMh8PzV5NsNhux3+/F29ub+nEK/v1pvBl+dSWvq5M7+TeeuTy4xWkcCwZuaGz4/YH8Gwf1d04gHxeLxXG9Xh995HA4HFer1XE2mx273a46l/VpTJTr9+RnR4uxk/NlD7jpAWBsdUBXIXh44/FYnQce8tJj/gf5oEhk4DHhTwNaOJlMjtvt9hhDdrvdWftLzntBBfo8BOgYSZIcl8vlMabgIeO6nnNeU4G+CgV6Onq93pmHYwoedobzbSmyNnxuNfD6xxQYXdgThzlOqECfVAU6Brg3NvAw4pbzI/NgelWC7usqlhUL4A/ULuO2CsBh4CilwLtZUYM+Dw04jFos99FT4yfUoHezkWQTAM/R+IO8Z3JZhqKU2MbTRjJR7JJTNrCUts/n8yNnUdzJWe1BhxZx1G5d6kAGUKR5F1VmPlQSO/IMaFjXHEDfqoawyFDWDWxVlFzNmJpaPkBFHkPn44ITYyW0cB3kcExvWJkUAzwrJa9OJokudMdXRJQYCK8ZRZMfbxyMt8/ckIam9td/CY6ojZ1PXOBaNFGu463tvwVT+SQhNSxPT0+/8l63K25vb/9fJH15OQ+1dvrjxw/x7ds30e/3xc3NjdV18LMnbRePj499qe2PZJpOnS/JFiTgjqqlupTPYcizGl/ChVyT0gs16FnPSQ24VMOqcHIpWlQennOa90o0REAVqoxGo0/fg3Ly2jdcBHQkKfUhdj5morqFlJLV3qyBBMWAFrLuJN6QAMZ7GxP4HhfvpcgzgY+dSV590E2gTGTUPDt5tUcHeqyyIHx9xZ7MYnH6RnXL6iLg95MxPLuAZQQ2QnFNb6N7MKqbRph+LRyglJDZTR9tLyuDEEap6hQA5gb+rSqVDBc1dnVpx4HXAbzqr8NTAdAxkm3QdhG57W4Ryhuos2QCr2401xGaFjOzyK3CpIA+N4H1JVRAKP5eFND/+fOn+Pr16y8R4aUIPBksSpBJNawe+Uv3c52A10xS9xHuGFZDhAq5Ocr7+7t4eHg4u8m411Qyq0CmMbKQHysaYjeBxpI0YykYdfcmXCLUKsuBwm3VRhRZqC5bE42qLievJv4yn0UrVu+4ZB+rEiTQdN0PGdCjFjmSkJm8ugCveQjRi9ezSwA+ZxUHWVPS8hKAh8OQ0fKoRQ2dfForWof+RVst1zRXkQE+kT7qIS/jV2fPxtBJNo9eF5AXtV4SA63ntAjAFmxNcLQVBIu/EtVNFB5LGKm0HlSHlLDp+vh/AK1r3RCf9xmwkrK5FzzdO2HePcKpfHZ3dyem02n0nA3yJbhuVpBXybZ2pKkXmVeJvivGXARcb5TlewragUZblP1WZQ1lx1O7H2Tqsto64GBwburBwD4vVWh4OpCSVdKyeUV4aPhbTNDBX9iohiRni44qgI9cvQsFqeCmIw9cUJ2BVlJquRWRGkdnosIV0mqSLMZ1dJ6USmtKoZlsqfoy1s3Dk0j3ZHHcJMH6oaYdvLiWyXZk2ip0Y1slvSwlj0WjEHCrWqGBF4HP8BX/ti2dpXYg3ffLtYR4f39/7l/PEVwg+KZsE4pXnZMU0J1XFvFLgZfybwqDCY0s2+4Wstj8/Jzrjv+rkkJE7MFtBXWOtnuV40wNpHCJyFSNWyMqqv6mF0EEWkEddGcLXw+Dm+R0AIxDaPotVfCTSkFUSCK63IziwZSWHaWWC8btGwZuX5TV9B4ll/8Sa1v64zEFWdAQmp4FfcTlBjmu6kDiDXmZspIFvc/lBtX+QC4Cnz2H21vQqxJ16XvjQOcqiJTH43FQ0NnI9+/f2QJflmJaTfc0qCf3sQW9btquypHT4NwTo6wvcl7CyHoXDI4BkmpQ5S4YSJlMy4C+b4nDi2JuW9AjGlTFFia+oLfiGKEqPvu0EZrOmdM1FHNja1BZg16HrUxQz5VJsGth2dPJNstYJ4pRWjucQe+1oJc2qDfComaqgn7TwlcadCscVdCnLXxxvJgU9PTsz1bKa/uwiGKuWmoJ58XYUsxV67WEEeRisIjBhmJa0Ako5kryeZ/jTdQhIvXxYq44G9A6ba55Vu/hUG3RmDqDXqYc1VLMB8V0TaB/ohYk50OWowJ5BI3xYoyazgH0prqOAP1ax01KOaoVR9dRoeaRtaanazRDdDNdOK8DyMTkpxt/uTWo4SmmsFxnaA+OIlz7GR1B11JM4UIrqlXMosZ7O2YWHnedNB2CRaxUQvmmlQ2UTBRjBbpyvEx0QSNpzuq2ulDM0Bl0CG48xCqES9H2zOLjUSHoukQT/gjVzWO1Xd20XaPp3VxDmnckmu6sIHGha0uLJLOLRqJq+sblCVJpXB21PWNMh7n0kpdSpdyIvm7cnsGqr4L+CeGcrZTOQuXJQNuz547WVdO15Rl1o5sCIxFVKGOGsg5NIafngW57Sm1Vfnve3OoC+osrr+O1oUz71jFYyvrpIPC9i6ZDKIscj4+PtSta64KjJ50xzdN2gK70eUSXOhlUE+gbn9eY0qjV2KB+gP6s82KKtAleTNkl277y+vpauxYNnWg3vCw64dBi08jKBvcDrDRbUH2SnmsexubcH1HxVq01KmQYd7ZbC8/qjeZsiCiD8/kawvI0mKSMRlWxN27RiHHAa6BTv5amhNd3nfsIo2WTbIJvH7vQwdWYauKc3MCnJwz7MtpskICfianpNjaHyc52hb0sMxPN2BwYUnTItmjwhsiGkxytt/1e6W7Q9ph6w2kpF2FMNa6i9bH2XWE4s8j2ODSHw1Ib0xujMaDO+8EY9921AT7nML1Ggo77DXXKF7JaOxPHF73apnM7mwi6hlKdtTzr0WipBoAW3XTVwHMA3WDDShcduiLnQBIY2DzPBsA0FXQD4IuQfr/x6B1oM5pPTeA7HorNHnTcpwHwZehgKxEljkKrwoenOGwQD9rQzbysIsJNXEGBNqgG1+LgJrbBEVxCA9gwmpWdKZ2UCdkxaWh7qJ73WGkAKE1O3LEWFZ/wlQhGG2biAVYNdk7aeiEiHf7KCvSqjGgB2F4HkKTym2jlUzEew2JX66g9IKw0PZRxhLF3DOCSmJrOpmrgs9wyPYAQA90OOUcaVya+Z0wfOVECmp5sWrgDA9y5aNCJxBt03712NxcOeCkj2m5w7FkPpwCdi6bvL0nTX5gA/nBJms4B9CfCN47qDSM/zTHNeVCcnUq2DGVBCPhOmceS4PqCgl4EIZ+m1KL7nj2fh5A1MbUIAopZUmo6lbZD014zn90TvWXRZUJkxHQlsV6kax8oAR8T0UreTS/rQC3eST1CryWvRW3bVFdxQEQpNi1qVV9/HQpEF0PalUaEau8RGMsfOcrQyCh0RRwMdRnYmF5MTQeXUp6bMc3RckisPeCjYUBpOE0uIlWQto0F+lbw9FaoIuPKNx+eEwLu4hMfmL153tIjphWXDiquylArb+Uo3JaNxJzXtqlavnKcbyPy6dRHBHDftqiStfiUHotPJq9W5bor4mAjVI6+Vlsc6UCnPvLlVnoILq/wXtRcqCNQnzU8seOJnVSMYIESq/5zS62nnPM6BDusmIGe+sZFwB8EvZvrnWJeMwTdBvg5k3kufGhnxRT0oqCpx2ieuzzK+aL57L+n8U+mRv4P8XfH7H8MOfd/MJnntZxPX37/XlAPOMuEsbabaqU7xnO23t0oYczv8xopiasnxhb8Q4YzVzUBfeeYsj67Q9zAn0jN4Q506SCqJ92iAyOPpg5aHmzTnbGg6Q+v6wBTdDuBwO/KzOSNHP2KXbJ3Oaq+TgjZKwk5ZEPvOxVdqJsBfyhHPyDoI+kDb5iB/C599GfTD3QiTyh9I0by3305hsK9XQ/a83uI8lkg2Sigo/L1yP0VHBuqVWvFeM81xnsSOSg6SBs2Fg2SgQRXdU0HmkBoKQE4RDDkWzmnYEB3GD8AUNG9fFWfcx7SuzRQ14HoIf3+JY+Xmwq66xtyLwwnlxt490X+G7bhLeZk/yfAAAmRUJvA345lAAAAAElFTkSuQmCC")};
__resources__["/resources/animations/al/al_walk0010.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAACxCAYAAACr6cF9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCOUIyRkNFMEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCOUIyRkNERkY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0011.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAACyCAYAAADPoaiqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCOUIyRkNFNEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCOUIyRkNFM0Y2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0012.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAAC1CAYAAACzvLpQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCQjY1M0RDNUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCQjY1M0RDNEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/animations/al/al_walk0013.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAC5CAYAAADuzouEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMzgwMTE3NDA3MjA2ODExOEE2RDlFRjAyNjYyQTY0RCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCQjY1M0RDOUY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCQjY1M0RDOEY2REQxMUUwQTY2NThCM0JGQzg5RTMyOCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAzODAxMTc0MDcyMDY4MTE4QTZEOUVGMDI2NjJBNjREIi8+IDwvcmRmOkRlc2NyaXB0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")};
__resources__["/resources/bat.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/box.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/sprites.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/switch.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};/*globals module exports resource require window Module __main_module_name__ __resources__*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

function resource(path) {
    return __resources__[path].data;
}

(function () {
    var process = {};
    var modulePaths = ['/__builtin__', '/__builtin__/libs', '/libs', '/'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return modulePaths;
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id);

        // Relative path so searching inside parent's directory
        return [path.dirname(parent.filename)];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p + '.js')) {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        parent = parent || process.mainModule;

        var paths    = resolveModulePath(request, parent),
            filename = findModulePath(request, paths);

        if (filename === false) {
            throw "Unable to find module: " + request;
        }


        if (parent) {
            var cachedModule = parent.moduleCache[filename];
            if (cachedModule) {
                return cachedModule;
            }
        }

        //console.log('Loading module: ', filename);

        var module = new Module(filename, parent);

        // Assign main module to process
        if (request == __main_module_name__ && !process.mainModule) {
            process.mainModule = module;
        }

        // Run all the code in the module
        module._initialize(filename);

        return module;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }
        this.moduleCache[this.id] = this;

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function (filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module).exports;
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        __resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname]);

        return this;
    };

    // Manually load the path module because we need it to load other modules
    path = (new Module('path'))._initialize('/__builtin__/path.js').exports;

    var util = loadModule('util').exports;
    util.ready(function () {
        // Populate globals
        var globals = loadModule('global').exports;
        for (var x in globals) {
            if (globals.hasOwnProperty(x)) {
                window[x] = globals[x];
            }
        }

        process.mainModule = loadModule(__main_module_name__);
        if (process.mainModule.exports.main) {
            process.mainModule.exports.main();
        }

        // Add a global require. Useful in the debug console.
        window.require = function require(request, parent) {
            return loadModule(request, parent).exports;
        };
        window.require.main = process.mainModule;
        window.require.paths = modulePaths;

    });
})();

// vim:ft=javascript

})();