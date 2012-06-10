var JSForm;

(function() {

  function sf(s) {
    var args = Array.prototype.slice.call(arguments, 1);
    return s.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  }

  function sc(s) {
    return s
      .replace(/[A-Z]/g, function(x) { return " " + x })
      .replace(/^\w/g, function(x) { return x.toUpperCase() });
  }
  
  function slp(val, size, ch) {
    var result = String(val);
    if(!ch) {
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
          strregex += formats[c];
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
    var $this = function() {
      return sf("<label for=\"{0}\">{1}</label>", $this.field._name, $this.text);
    };
    var toString = function() {
      return $this();
    };
    $this.field = field;
    $this.text = text || sc(field._name);
    $this.toString = toString;
    return $this;
  }

  var Input = function() {
    var $this = function(field) {
      var properties = {};
      properties["id"] = field.id;
      properties["name"] = field._name;
      if($this.type)
	properties["type"] = $this.type;
      if(field.raw_data)
	properties["value"] = field.value();
      if (field.cssclass)
	properties["class"] = field.cssclass.join(" ");
      if (!field.editable) {
	properties["readonly"] = "readonly";
      }
      $this.field = field;
      return $this.render(properties);
    };
    $this.type = null;
    $this.render = function(properties) {
      return sf("<input {0}/>", toHtml(properties));
    };
    return $this;
  };

  var TextInput = function() {
    var $this = Input();
    $this.type = "text";
    return $this;
  };

  var TextAreaInput = function() {
    var $this = Input();
    
    $this.render = function(properties) {
      var value = properties.value;
      delete properties.value;
      return sf("<textarea {0}>{1}</textarea>", toHtml(properties), value ? value : "");
    };
    
    return $this;
  }

  var PasswordInput = function() {
    var $this = Input();
    $this.type = "password";
    return $this;
  };

  var CheckboxInput = function() {
    var $this = Input();
    $this.type = "checkbox";
    return $this;
  };

  var SelectInput = function() {
    var $this = function(field) {
      var value = field.valueField;
      var display = field.displayField;
      var choices = field.choices;
      var html = [];
      html.push(sf("<select name=\"{0}\">", field._name));
      for(var i in choices) {
	var choice = choices[i];
	html.push(sf("  <option value=\"{0}\">{1}</option>", choice[value], choice[display]));
      };
      html.push("</select>");
      return html.join("\n");
    };
    
    return $this;
  }

  var Field = function(options) {
    
    var $this = function() {
      return $this.widget($this);
    };

    var toString = function() {
      return $this();
    };

    var value = function() {
      return $this.raw_data;
    };

    var validate = function() {
      for(var i in $this.validators) {
	$this.validators[i]($this);
      }
      return $this.errors.length == 0;
    };
    
    var setName = function(name) {
      $this._name = name;
      $this.id = $this.options.id || name;
      $this.label = Label($this, $this.options.label);
    };

    var processData = function(data) {
      $this.data = data;
    };
    
    $this.toString = toString;
    $this.options = options || {};
    $this.widget = null;
    if($this.options.widget)
      $this.widget = $this.options.widget;
    $this.label = null;
    $this.cssclass = $this.options.cssclass;
    var ed = $this.options.editable;
    $this.editable = ed != undefined && ed != null ? ed : true;
    $this.validators = $this.options.validators; 
    $this.errors = [];
    var df = $this.options.defaults;
    $this.data = df ? (typeof df == "function" ? df() : df) : null;
    $this.raw_data = null;
    $this.validate = validate;
    $this.setName = setName;
    $this.processData = processData;
    $this.value = value;
    $this._name = null;
    $this.id = null;
    return $this;
  };

  var StringField = function(options) {
    var $this = Field(options);
    $this.widget = TextInput();
    return $this;
  };

  var TextAreaField = function(options) {
    var $this = Field(options);
    $this.widget = TextAreaInput();
    return $this;
  };


  var PasswordField = function(options) {
    var $this = Field(options);
    $this.widget = PasswordInput();
    return $this;
  };

  var IntegerField = function(options) {
    var $this = Field(options);
    $this.widget = TextInput();

    $this.processData = function(data) {
      $this.data = parseInt(data);
      if(isNaN($this.data)) {
	$this.data = null;
	$this.errors.push("Not is a valid integer");
      }
    };
    
    return $this;
  };

  var BooleanField = function(options) {
    var $this = Field(options);
    $this.widget = CheckboxInput();

    $this.processData = function(data) {
      $this.data = data == "true";
    };

    $this.value = function() {
      if($this.data)
	return "true";
      else
	return "false";
    };
   
    return $this;
  };

  var DecimalField = function(options) {
    var $this = Field(options);
    var dp = $this.options.decimalPlaces;
    $this.decimalPlaces = dp ? dp : 2;
    $this.widget = TextInput();

    $this.processData = function(data) {
      $this.data = parseFloat(data).toFixed($this.decimalPlaces);
      if(isNaN($this.data)) {
	$this.data = null;
	$this.errors.push("Not is a decimal valid");
      }
    };
    
    return $this;
  }

  var DateField = function(options) {
    var $this = Field(options);
    $this.format = $this.options.format ? $this.options.format : "y-M-d h:m:s";
    $this.widget = TextInput();

    $this.value = function() {
      var data = $this.data;
      return data.formated($this.format);
    };

    $this.processData = function(data) {
      $this.data = Date.parseDate(data, $this.format);
      if(!$this.data)
	$this.errors.push("Not is a date valid");
    }
    
    return $this;
  }

  var SelectField = function(options) {
    var $this = Field(options);
    $this.valueField = options.valueField;
    $this.displayField = options.displayField;
    $this.choices = options.choices;
    $this.widget = SelectInput();
    return $this;
  };

  var Form = function(fields) {
    
    return function(data) {
      var data = data || {};
      var $this = {
	_fields: {}
      };
      
      for(var i in fields) {
	var field = fields[i];
	field.setName(i);
	if(data && data[i]) {
	  field.raw_data = data[i];
	  field.processData(data[i]);
	} else {
	  field.raw_data = field.data;
	}
	$this[i] = field;
	$this._fields[i] = field;
	$this.errors = {};
      };
      
      $this.validate = function() {
	var success = true;
	for(var i in $this._fields) {
	  var field = $this._fields[i];
	  if(!field.validate()) {
	    success = false;
	  }
	  $this.errors[field._name] = field.errors;
	}
	return success;
      };
      
      return $this;
    };
    
  };

  var Required = function() {
    return function(field) {
      if(!field.raw_data) {
	field.errors.push(sf("Field {0} is required", field._name));
	return false;
      }
      return true;
    };
  };

  JSForm = Form;

  JSForm.StringField = StringField;
  JSForm.TextAreaField = TextAreaField;
  JSForm.IntegerField = IntegerField;
  JSForm.PasswordField = PasswordField;
  JSForm.BooleanField = BooleanField;
  JSForm.DecimalField = DecimalField;
  JSForm.DateField = DateField;
  JSForm.SelectField = SelectField;

  JSForm.widgets = {
    TextInput: TextInput,
    TextAreaInput: TextAreaInput,
    PasswordInput: PasswordInput,
    CheckboxInput: CheckboxInput
  };

  JSForm.validators = {
    Required: Required
  };

})();
