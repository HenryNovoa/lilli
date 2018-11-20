"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = function Entity(query) {
    _classCallCheck(this, Entity);

    this.id = Date.now();
    for (var key in query) {
        this[key] = query[key];
    }
};

module.exports = Entity;