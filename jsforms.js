var JSForm;

(function($) {
  
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
	? args[number]
	: match;
    });
  };
  
  var toHtml = function(options) {
    var properties = []
    for(key in options) {
      properties.push("{0}=\"{1}\"".format(key, options[key]));
    }
    return properties.join(" ");
  };

  var Field = function(options) {

    var _label = options.label;
    delete options.label;
    
    var cssclass = options.cssclass;
    delete options.cssclass;

    var validators = options.validators;
    delete options.validators;
    
    var options = options;
    
    var toString = function() {
      properties = {name: self.name, type: self.type}
      if(self.data) {
	properties.value = self.data;
      }
      for(k in options) {
	properties[k] = options[k];
      }
      var r = "<input {0}".format(toHtml(properties));
      if (cssclass) {
	r += " class=\"{0}\"".format(cssclass.join(" "));
      }
      return r + "/>";
    };

    var validate = function(data) {
      for(k in validators) {
	if(!validators[k](data))
	  return false;
      }
      self.data = data;
      return true;
    }

    var setName = function(name) {
      self.name = name;
    }

    var getLabel = function() {
      return "<label for=\"{0}\">{1}</label>".format(self.name, _label);
    };

    var self = {
      toString: toString,
      label: getLabel,
      validate: validate,
      setName: setName,
      options: options,
      type: "text"
    };
    
    return self;
  };

  var IntegerField = function(options) {
    var that = new Field(options);
    var thatvalidate = that.validate;
    var validate = function(data) {
      if(isNaN(data))
	return false;
      var r = thatvalidate(data);
      if(r)
	that.data = parseInt(data);
      return r;
    };
    that.validate = validate;
    return that;
  };

  var TextField = function(options) {
    var that = new Field(options);
    return that;
  };

  var PasswordField = function(options) {
    var that = new Field(options);
    that.type = "password";
    return that;
  };

  var BooleanField = function(options) {
    var that = new Field(options);
    that.type = "checkbox";
    that.options.value = "true";
    thatvalidate = that.validate;
    that.validate = function(data) {
      r = thatvalidate(data);
      if(r)
	that.data = data == "true";
      return r;
    }
    return that;
  };

  var DecimalField = function(options) {
    var decimalPlaces = options.decimalPlaces ? options.decimalPlaces : 2;
    delete options.decimalPlaces;
    var that = new Field(options);
    thatvalidate = that.validate;
    that.validate = function(data) {
      if(isNaN(data))
	return false;
      var r = thatvalidate(data);
      that.data = parseFloat(data).toFixed(decimalPlaces);
      return r;
    };
    return that;
  }

  var Form = function(fields) {
    var fields = fields;
    var klass = function(data) {
      var data = data;
      var result = {};
      result.validate = function() {
	var r = true;
	for(k in fields) {
	  if(!fields[k].validate(data[k])) {
	    r = false;
	  }
	}
	return r;
      };
      for(k in fields) {
	result[k] = fields[k];
	result[k].setName(k);
	if(data) {
	  result[k].data = data[k];
	}
      }
      return result;
    };
    return klass;
  };

  var validators = {
    required: function(data) {
      if (data)
	return true;
      else
	return false;
    }
  }

  JSForm = Form;

  JSForm.TextField = function(options) { return new TextField(options) };
  JSForm.IntegerField = function(options) { return new IntegerField(options) };
  JSForm.PasswordField = function(options) { return new PasswordField(options) };
  JSForm.BooleanField = function(options) { return new BooleanField(options) };
  JSForm.DecimalField = function(options) { return new DecimalField(options) };

  JSForm.validators = validators;

})(jQuery);