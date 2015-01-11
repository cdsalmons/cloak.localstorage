
var store  = require('store');
var uuid   = require('uuid-v4');
var merge  = require('cloak.core/utils/merge');
var Class  = require('cloak.core/utils/class');
var conf   = require('cloak.core/config').module('model');

// 
// Local storage class
// 
var Store = module.exports = Class.extend({

	init: function() {
		// 
	},

	_modelStore: function(model) {
		return store.get(model) || { };
	},

	_withModelStore: function(model, func) {
		var modelStore = this._modelStore();
		store.set(model, func.call(this, modelStore) || modelStore);
	},

// -------------------------------------------------------------

	read: function(model, id) {
		return this._modelStore(model)[id];
	},

	readBulk: function(model, ids) {
		var storage = this._modelStore(model);
		
		return ids.map(function(id) {
			return storage[id];
		});
	},

	readByQuery: function(model, query) {
		var filter = filterByQuery(query);

		return objectValues(this._modelStore(model))
			.filter(function(obj) {
				return filter(obj);
			});
	},

	readOneByQuery: function(model, query) {
		var filter = filterByQuery(query);
		var objs = objectValues(this._modelStore(model));

		for (var i = 0; i < objs.length; i++) {
			if (filter(objs[i])) {
				return objs[i];
			}
		}

		return null;
	},

// -------------------------------------------------------------

	generateId: function() {
		return uuid().split('-').join('');
	},

	create: function(model, data) {
		var id = this.generateId();

		this._withModelStore(model, function(modelStore) {
			modelStore[id] = data;
		});

		return id;
	},

// -------------------------------------------------------------
	
	update: function(model, id, data) {
		this._withModelStore(model, function(modelStore) {
			merge(modelStore[id], data);
		});
	},

	updateBulk: function(model, objects) {
		this._withModelStore(model, function(modelStore) {
			objects.forEach(function(object) {
				merge(modelStore[object[conf.idKey]], object);
			});
		});
	},

// -------------------------------------------------------------

	del: function(model, id) {
		this._withModelStore(model, function(modelStore) {
			delete modelStore[id];
		});
	},

	delBulk: function(model, ids) {
		this._withModelStore(model, function(modelStore) {
			Object.keys(modelStore).forEach(function(key) {
				if (ids.indexOf(key) >= 0) {
					delete modelStore[key];
				}
			});
		});
	},

// -------------------------------------------------------------
	
	clear: function() {
		return store.clear();
	}

});

// --------------------------------------------------------

// 
// The compliment to Object.keys(), return all values in an object
// 
// @param {obj} the object to pull values from
// @return array
// 
function objectValues(obj) {
	return Object.keys(obj).map(function(key) {
		return obj[key];
	});
}

// 
// Returns a query filter function
// 
// @param {query} the query object/function
// @return function
// 
function filterByQuery(query) {
	// If the given criteria is a function, just use it directly as
	// the querying function
	if (typeof query === 'function') {
		return query;
	}

	// 
	// The query filtering function
	// 
	// @param {obj} the object to test
	// @return boolean
	// 
	return function(obj) {
		for (var key in query) {
			if (query.hasOwnProperty(key)) {
				var value = query[key];

				// Handle regexp queries
				if (value instanceof RegExp) {
					if (! value.test(obj[key])) {
						return false;
					}
				}

				// Handle function queries
				else if (typeof value === 'function') {
					if (! value(obj[key])) {
						return false;
					}
				}

				// Handle complex queries
				else if (typeof value === 'object' && value) {
					// 
					// TODO
					// 
				}

				// Handle primative comparisons
				else {
					return (value === obj[key]);
				}
			}
		}
	};
}
