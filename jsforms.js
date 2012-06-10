var JSForm;

(function() {
  
  function isdef(obj) {
    return obj != undefined && obj != null;
  }

  function sf(s) {
    var args = Array.prototype.slice.call(arguments, 1);
    return s.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  }

  function sc(s) {
    var result = s.replace(/[A-Z]/g, function(x) { return " " + x });
    return result.charAt(0).toUpperCase() + result.substr(1);
  }
  
  function slp(val, size, ch) {
    var result = String(val);
    if(!isdef(ch)) {
      ch = " ";
    }
    while(result.length < size) {
      result = ch + result;
    }
    return result;
  }

  function formatToRegex(format) {
    var formats = {
      d: "(\\d{2})",
      M: "(\\d{2})",
      y: "(\\d{4})",
      h: "(\\d{2})",
      m: "(\\d{2})",
      s: "(\\d{2})"
    };
    var strregex = "";
    for(var i in format) {
      var c = format[i];
      if (typeof c == "string") {
        if (format[i] in formats)
          strregex += formats[c]
        else
          strregex += c;
      }
    }
    return new RegExp("^" + strregex + "$", "g");
  }

  Date.parseDate = function(strdate, format) {
    var 
    d = 1, 
    M = 1, 
    y = 1970, 
    h = 0, 
    m = 0, 
    s = 0;
    
    var re = formatToRegex(format);
    var results = re.exec(strdate);
    if (results == null) {
      return null;
    }
    var tokens = format.replace(/[^d|M|y|h|m|s]/g, "").split("");
    for(var i = 0; i < tokens.length; i++) {
      if(tokens[i] == "d")
	d = parseInt(results[i + 1], 10);
      else if (tokens[i] == "M") {
	M = parseInt(results[i + 1], 10);
	if (M > 12) {
	  return null;
	}
      }
      else if (tokens[i] == "y")
	y = parseInt(results[i + 1], 10);
      else if (tokens[i] == "h")
	h = parseInt(results[i + 1], 10);
      else if (tokens[i] == "m")
	m = parseInt(results[i + 1], 10);
      else if (tokens[i] == "s")
	s = parseInt(results[i + 1], 10);
    }
    var date = new Date(y, M - 1, d, h, m, s);
    if(date == "Invalid Date") {
      return null;
    }
    return date;
  };

  Date.prototype.formated = function(format) {
    var re = /[d|M|y|h|m|s]/g;
    var $this = this;
    var result = format.replace(re, function(match, number) {
      if (match == "d") {
	var r = $this.getDate();
	return slp(r, 2, "0");
      } else if (match == "M") {
	var r = $this.getMonth() + 1;
	return slp(r, 2, "0");
      } else if (match == "y") {
	var r = $this.getFullYear();
	return slp(r, 4, "0");
      } else if (match == "h") {
	var r = $this.getHours();
	return slp(r, 2, "0");
      } else if (match == "m") {
	var r = $this.getMinutes();
	return slp(r, 2, "0");
      } else if (match == "s") {
	var r = $this.getSeconds();
	return slp(r, 2, "0");
      }
    });
    return result;
  };
  
  function toHtml(options) {
    var properties = [];
    for(var i in options) {
      properties.push(sf("{0}=\"{1}\"", i, options[i]));
    }
    return properties.join(" ");
  }
  
  var Label = function(field, text) {
    if(!text) {
      text = sc(field._name);
    }
    var self = function() {
      return sf("<label for=\"{0}\">{1}</label>", field._name, text);
    };
    self.field = field;
    self.text = text;
    return self;
  }

  var Input = function() {
    var self = function(field) {
      var properties = {
	name: field._name,
	type: self.type
      };
      if(isdef(field.raw_data))
	properties.value = field.value();
      if (field.cssclass) {
	properties["class"] = field.cssclass.join(" ");
      }
      return self.render(properties);
    };
    self.type = null;
    self.render = function(properties) {
      return sf("<input {0}/>", toHtml(properties));
    };
    return self;
  };

  var TextInput = function() {
    var self = Input();
    self.type = "text";
    return self;
  };

  var PasswordInput = function(field) {
    var self = Input();
    self.type = "password";
    return self;
  };

  var CheckboxInput = function(field) {
    var self = Input();
    self.type = "checkbox";
    return self;
  };

  var Field = function(options) {
    
    var self = function() {
      return self.widget(self);
    };

    var value = function() {
      return self.raw_data;
    };

    var validate = function() {
      for(var i in self.validators) {
	self.validators[i](self);
      }
      return self.errors.length == 0;
    };
    
    var setName = function(name) {
      self._name = name;
      self.label = Label(self, self.options.label);
    };

    var processData = function(data) {
      self.data = data;
    };
    
    self.options = options || {};
    self.widget = null;
    if(self.options.widget)
      self.widget = self.options.widget;
    self.label = null;
    self.cssclass = self.options.cssclass;
    self.validators = self.options.validators; 
    self.errors = [];
    var df = self.options.defaults;
    self.data = df ? (typeof df == "function" ? df() : df) : null;
    self.raw_data = null;
    self.validate = validate;
    self.setName = setName;
    self.processData = processData;
    self.value = value;
    self._name = null;
    return self;
  };

  var StringField = function(options) {
    var self = Field(options);
    self.widget = TextInput();
    return self;
  };

  var PasswordField = function(options) {
    var self = Field(options);
    self.widget = PasswordInput();
    return self;
  };

  var IntegerField = function(options) {
    var self = Field(options);
    self.widget = TextInput();

    self.processData = function(data) {
      self.data = parseInt(data);
      if(isNaN(self.data))
	self.errors.push("Not is a valid integer");
    };
    
    return self;
  };

  var BooleanField = function(options) {
    var self = Field(options);
    self.widget = CheckboxInput();

    self.processData = function(data) {
      self.data = data == "true";
    };

    self.value = function() {
      if(self.data)
	return "true";
      else
	return "false";
    };
   
    return self;
  };

  var DecimalField = function(options) {
    var self = Field(options);
    var dp = self.options.decimalPlaces;
    self.decimalPlaces = dp ? dp : 2;
    self.widget = TextInput();

    self.processData = function(data) {
      self.data = parseFloat(data).toFixed(self.decimalPlaces);
      if(isNaN(self.data))
	self.errors.push("Not is a decimal valid");
    };
    
    return self;
  }

  var DateField = function(options) {
    var self = Field(options);
    self.format = self.options.format ? self.options.format : "y-M-d h:m:s";
    self.widget = TextInput();

    self.value = function() {
      var data = self.data;
      return data.formated(self.format);
    };

    self.processData = function(data) {
      self.data = Date.parseDate(data, self.format);
      if(!isdef(self.data))
	self.errors.push("Not is a date valid");
    }
    
    return self;
  }

  var Form = function(fields) {
    return function(data) {
      var data = data || {};
      var self = {
	_fields: {}
      };
      for(var i in fields) {
	var field = fields[i];
	field.setName(i);
	if(isdef(data) && isdef(data[i])) {
	  field.raw_data = data[i];
	  field.processData(data[i]);
	} else {
	  field.raw_data = field.data;
	}
	self[i] = field;
	self._fields[i] = field;
	self.errors = {};
      }
      self.validate = function() {
	var success = true;
	for(var i in self._fields) {
	  var field = self._fields[i];
	  if(!field.validate()) {
	    success = false;
	  }
	  self.errors[field._name] = field.errors;
	}
	return success;
      };
      return self;
    };
  };

  var Required = function() {
    return function(field) {
      if(!isdef(field.raw_data)) {
	field.errors.push(sf("Field {0} is required", field._name));
	return false;
      }
      return true;
    };
  };

  JSForm = Form;

  JSForm.StringField = StringField;
  JSForm.IntegerField = IntegerField;
  JSForm.PasswordField = PasswordField;
  JSForm.BooleanField = BooleanField;
  JSForm.DecimalField = DecimalField;
  JSForm.DateField = DateField;

  JSForm.widgets = {
    TextInput: TextInput,
    PasswordInput: PasswordInput,
    CheckboxInput: CheckboxInput
  };

  JSForm.validators = {
    Required: Required
  };

})();
  