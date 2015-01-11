
var model = require('./model');

// 
// Extend the model class with methods for xhr
// 
// @param {Model} the model class
// @return void
// 
exports.extendModel = function(Model) {
	Object.keys(model.methods).forEach(function(key) {
		Model.prototype[key] = model.methods[key];
	});
	Object.keys(model.statics).forEach(function(key) {
		Model[key] = model.statics[key];
	});
};

