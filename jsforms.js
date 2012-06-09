var JSForm;

(function($) {
  
  function isdef(obj) {
    return obj != undefined && obj != null;
  }

  function sf(s) {
    var args = Array.prototype.slice.call(arguments, 1);
    return s.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
	? args[number]
	: match;
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

  var TextWidget = function(field) {
    var properties = {
      name: field.name_, 
      type: "text"
    };
    if(isdef(field.data)) {
      properties.value = field.renderValue();
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return sf("<input {0}/>", toHtml(properties));
  };

  var PasswordWidget = function(field) {
    var properties = {
      name: field.name_, 
      type: "password"
    };
    if(isdef(field.data)) {
      properties.value = field.renderValue();
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return sf("<input {0}/>", toHtml(properties));
  };

  var CheckboxWidget = function(field) {
    var properties = {
      name: field.name_, 
      type: "checkbox"
    };
    if(isdef(field.data)) {
      properties.value = field.renderValue();
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return sf("<input {0}/>", toHtml(properties));
  };

  var Field = function(options) {
    
    var options = options || {};
    
    var call = function() {
      var widget = options.widget ? options.widget : f.widget;
      return widget(f);
    };

    var renderValue = function() {
      return f.data;
    }

    var validate = function(data) {
      var r = true;
      for(k in f.validators) {
	if(!f.validators[k](data))
	  r = false;
      }
      f.data = data;
      return r;
    }
    
    var setName = function(name) {
      f.name_ = name;
      f.label = Label(name, f.options.label ? f.options.label : sc(name));
    };

    var df = options.defaults;
    
    var f = call;
    f.options = options;
    f.widget = null;
    f.label = null;
    f.cssclass = options.cssclass;
    f.validators = options.validators; 
    f.data = df ? (typeof df == "function" ? df() : df) : null;
    f.validate = validate;
    f.setName = setName;
    f.renderValue = renderValue;
    return f;
  };

  var TextField = function(options) {
    var that = Field(options);
    that.widget = TextWidget;
    return that;
  };

  var PasswordField = function(options) {
    var that = Field(options);
    that.widget = PasswordWidget;
    return that;
  };

  var IntegerField = function(options) {
    var that = Field(options);
    that.widget = TextWidget;
    
    var thatvalidate = that.validate;
    that.validate = function(data) {
      if(isNaN(data))
	return false;
      var r = thatvalidate(data);
      if(r)
	that.data = parseInt(data);
      return r;
    };
    
    return that;
  };

  var BooleanField = function(options) {
    var that = Field(options);
    that.widget = CheckboxWidget;
    
    thatvalidate = that.validate;
    that.validate = function(data) {
      r = thatvalidate(data);
      if(r)
	that.data = data == "true";
      return r;
    };
   
    return that;
  };

  var DecimalField = function(options) {
    var that = Field(options);
    that.decimalPlaces = that.options.decimalPlaces ? that.options.decimalPlaces : 2;
    that.widget = TextWidget;
    
    thatvalidate = that.validate;
    that.validate = function(data) {
      var r = thatvalidate(data);
      if(isNaN(data))
	return false;
      that.data = parseFloat(data).toFixed(that.decimalPlaces);
      return r;
    };
    
    return that;
  }

  var DateField = function(options) {
    var that = Field(options);
    that.format = that.options.format ? that.options.format : "y-M-d h:m:s";
    that.widget = TextWidget;
    thatvalidate = that.validate;
    that.validate = function(data) {
      var r = thatvalidate(data);
      var d = Date.parseDate(data, that.format);
      if (d == null)
	return false;
      that.data = d;
      return r;
    };
    that.renderValue = function() {
      var data = that.data;
      return data.formated(that.format);
    };
    return that;
  }

  var Form = function(fields) {
    var fields = fields;
    var klass = function(data) {
      var data = data || {};
      var form = {};
      for(k in fields) {
	form[k] = fields[k];
	form[k].setName(k);
	if(isdef(data) && isdef(data[k])) {
	  form[k].data = data[k];
	}
      }
      form.validate = function() {
	var r = true;
	for(k in fields) {
	  if(!fields[k].validate(data[k] || fields[k].data)) {
	    r = false;
	  }
	}
	return r;
      };
      return form;
    };
    return klass;
  };

  JSForm = Form;

  JSForm.TextField = TextField;
  JSForm.IntegerField = IntegerField;
  JSForm.PasswordField = PasswordField;
  JSForm.BooleanField = BooleanField;
  JSForm.DecimalField = DecimalField;
  JSForm.DateField = DateField;

  JSForm.widgets = {
    TextWidget: TextWidget,
    PasswordWidget: PasswordWidget,
    CheckboxWidget: CheckboxWidget
  };

  JSForm.validators = {
    required: function(data) {
      if (data)
	return true;
      else
	return false;
    }
  };

})(jQuery);