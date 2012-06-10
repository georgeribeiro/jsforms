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
    for(i in format) {
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
    for(key in options) {
      properties.push(sf("{0}=\"{1}\"", key, options[key]));
    }
    return properties.join(" ");
  }
  
  var Label = function(field, text) {
    if(!text) {
      text = text.capitalize();
    }
    var f = function() {
      return sf("<label for=\"{0}\">{1}</label>", field, text);
    };
    f.field = field;
    f.text = text;
    return f;
  }

  var Input = function() {
    var call = function(field) {
      properties = {
	name: field._name,
	type: f.type
      };
      if(isdef(field.raw_data))
	properties.value = field.value();
      if (field.cssclass) {
	properties["class"] = field.cssclass.join(" ");
      }
      return f.render(properties);
    };
    f = call;
    f.type = null;
    f.render = function(properties) {
      return sf("<input {0}/>", toHtml(properties));
    };
    return f;
  };

  var TextInput = function() {
    var that = Input();
    that.type = "text";
    return that;
  };

  var PasswordInput = function(field) {
    var that = Input();
    that.type = "password";
    return that;
  };

  var CheckboxInput = function(field) {
    var that = Input();
    that.type = "checkbox";
    return that;
  };

  var Field = function(options) {
    
    var options = options || {};
    
    var call = function() {
      var widget = options.widget ? options.widget : f.widget;
      return widget(f);
    };

    var value = function() {
      return f.raw_data;
    }

    var validate = function() {
      for(i in f.validators) {
	f.validators[i](f);
      }
      return f.errors.length == 0;
    }
    
    var setName = function(name) {
      f._name = name;
      f.label = Label(name, f.options.label ? f.options.label : sc(name));
    };

    var processData = function(data) {
      f.data = data;
    }

    var df = options.defaults;
    
    var f = call;
    f.options = options;
    f.widget = null;
    f.label = null;
    f.cssclass = options.cssclass;
    f.validators = options.validators; 
    f.errors = [];
    f.data = df ? (typeof df == "function" ? df() : df) : null;
    f.raw_data = null;
    f.validate = validate;
    f.setName = setName;
    f.processData = processData;
    f.value = value;
    return f;
  };

  var TextField = function(options) {
    var that = Field(options);
    that.widget = TextInput();
    return that;
  };

  var PasswordField = function(options) {
    var that = Field(options);
    that.widget = PasswordInput();
    return that;
  };

  var IntegerField = function(options) {
    var that = Field(options);
    that.widget = TextInput();

    that.processData = function(data) {
      that.data = parseInt(data);
      if(isNaN(that.data))
	that.errors.push("Not is a valid integer");
    };
    
    return that;
  };

  var BooleanField = function(options) {
    var that = Field(options);
    that.widget = CheckboxInput();

    that.processData = function(data) {
      that.data = data == "true";
    };

    that.value = function() {
      if(that.data)
	return "true";
      else
	return "false";
    };
   
    return that;
  };

  var DecimalField = function(options) {
    var that = Field(options);
    var dp = that.options.decimalPlaces;
    that.decimalPlaces = dp ? dp : 2;
    that.widget = TextInput();

    that.processData = function(data) {
      that.data = parseFloat(data).toFixed(that.decimalPlaces);
      if(isNaN(that.data))
	that.errors.push("Not is a decimal valid");
    };
    
    return that;
  }

  var DateField = function(options) {
    var that = Field(options);
    that.format = that.options.format ? that.options.format : "y-M-d h:m:s";
    that.widget = TextInput();

    that.value = function() {
      var data = that.data;
      return data.formated(that.format);
    };

    that.processData = function(data) {
      that.data = Date.parseDate(data, that.format);
      if(!isdef(that.data))
	that.errors.push("Not is a date valid");
    }
    
    return that;
  }

  var Form = function(fields) {
    var fields = fields;
    var klass = function(data) {
      var data = data || {};
      var form = {};
      for(k in fields) {
	var field = fields[k];
	field.setName(k);
	if(isdef(data) && isdef(data[k])) {
	  field.raw_data = data[k];
	  field.processData(data[k]);
	} else {
	  field.raw_data = field.data;
	}
	form[k] = field;
      }
      form.validate = function() {
	var success = true;
	for(i in fields) {
	  var field = fields[i];
	  
	  if(!field.validate(field)) {
	    success = false;
	  }
	}
	return success;
      };
      return form;
    };
    return klass;
  };

  var Required = function() {
    return function(field) {
      if(!isdef(field.raw_data)) {
	field.errors.push(sf("Field {0} is required", field._name));
	return false;
      }
    };
  };

  JSForm = Form;

  JSForm.TextField = TextField;
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