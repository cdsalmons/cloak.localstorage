
var Store = require('./storage');

var storage = new Store();
var methods = exports.methods = { };
var statics = exports.statics = { };

// --------------------------------------------------------

// 
// Load in model data from local storage
// 
// @return void
// 
methods.load = function() {
	var data = storage.read(this.modelName, this.id());
	if (data) {
		this.unserialize(data);
	}
};

// --------------------------------------------------------

// 
// Save the model data into local storage
// 
// @return void
// 
methods.save = function() {
	var data = this.serialize();

	// Model already exists, update the existing entry
	if (this.id()) {
		storage.update(this.modelName, this.id(), data);
	}

	// Model does not exist yet, create it
	else {
		var newId = storage.create(this.modelName, data);
		this.id(newId);
	}
};

// --------------------------------------------------------

// 
// Patch the existing model data in local storage
// 
// @param {keys} the keys to patch
// @return void
// 
methods.patch = function(keys) {
	var data = this.serialize({ attrs: keys });
	storage.update(this.modelName, this.id(), data);
};

// --------------------------------------------------------

// 
// Delete the model from local storage
// 
// @return void
// 
methods.delete = function() {
	storage.del(this.modelName, this.id());
	this.id(null);
};

// --------------------------------------------------------

// 
// Searches for matching models in local storage and returns a collection
// 
// @param {query} the search query
// @return Collection
// 
statics.find = function(query) {
	return new this.Collection(
		storage.readByQuery(this.prototype.modelName, query)
	);
};

// --------------------------------------------------------

// 
// Searches for a matching model in local storage and returns the first one found
// 
// @param {query} the search query
// @return Model
// 
statics.findOne = function(query) {
	var data = storage.readOneByQuery(this.prototype.modelName, query);
	if (data) {
		return this.create(data);
	}
	return null;
};
