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

  String.prototype.capitalize = function() {
    var result = this.replace(/[A-Z]/g, function(x) { return " " + x });
    return result.charAt(0).toUpperCase() + result.substr(1);
  };
  
  var toHtml = function(options) {
    var properties = []
    for(key in options) {
      properties.push("{0}=\"{1}\"".format(key, options[key]));
    }
    return properties.join(" ");
  };

  var Label = function(field, text) {
    if(!text) {
      text = text.capitalize();
    }
    var f = function() {
      return "<label for=\"{0}\">{1}</label>".format(field, text);
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
    if(field.data) {
      properties.value = field.data;
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return "<input {0}/>".format(toHtml(properties));
  };

  var PasswordWidget = function(field) {
    var properties = {
      name: field.name_, 
      type: "password"
    };
    if(field.data) {
      properties.value = field.data;
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return "<input {0}/>".format(toHtml(properties));
  };

  var CheckboxWidget = function(field) {
    var properties = {
      name: field.name_, 
      type: "checkbox"
    };
    if(field.data == true) {
      properties.value = "true";
    }
    if (field.cssclass) {
      properties["class"] = field.cssclass.join(" ");
    }
    return "<input {0}/>".format(toHtml(properties));
  };

  var Field = function(options) {

    if(!options) {
      options = {};
    }
    
    var options = options;
    
    var call = function() {
      var widget = options.widget ? options.widget : f.widget;
      return widget(f);
    };

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
      f.label = Label(name, f.options.label ? f.options.label : name.capitalize());
    };
    
    f = call;
    f.options = options;
    f.widget = null;
    f.label = null;
    f.cssclass = options.cssclass;
    f.validators = options.validators;
    f.data = null;
    f.validate = validate;
    f.setName = setName;
    return f;

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
      if(isNaN(data))
	return false;
      var r = thatvalidate(data);
      that.data = parseFloat(data).toFixed(that.decimalPlaces);
      return r;
    };
    
    return that;
  }

  var DateField = function(options) {
    var that = Field(options);
    that.widget = TextWidget;
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