(function($) {

  function dateEqual(date, other) {
    return date != null && other != null
      && date.getDate() == other.getDate()
      && date.getMonth() == other.getMonth()
      && date.getFullYear() == other.getFullYear()
      && date.getHours() == other.getHours()
      && date.getMinutes() == other.getMinutes()
      && date.getSeconds() == other.getSeconds();
  };

  $(function() {
    
    module("jsforms");
    
    test("simple form", function() {
      var Form = JSForm({
	name: JSForm.StringField()
      });
      var form = Form()
      ok(form.name, "LoginForm.name");
    });

    test("simple form with two fields", function() {
      expect(2);
      var LoginForm = JSForm({
	name: JSForm.StringField(),
	password: JSForm.PasswordField()
      }); 
      var form = LoginForm();
      ok(form.name, "LoginForm.name");
      ok(form.password, "LoginForm.password");
    });
    
    test("field name html", function() {
      var Form = JSForm({
	name: JSForm.StringField()
      });
      var form = Form();
      equal(form.name(),  "<input id=\"name\" name=\"name\" type=\"text\"/>", "form.name toString");
    });

    test("field password html", function() {
      var Form = JSForm({
	name: JSForm.PasswordField()
      });
      var form = Form();
      equal(form.name(),  "<input id=\"name\" name=\"name\" type=\"password\"/>", "form.name toString");
    });

    test("field with classes css toString", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  cssclass: ["c1", "c2"]
	})
      });
      var form = Form();
      equal(form.name(),  "<input id=\"name\" name=\"name\" type=\"text\" class=\"c1 c2\"/>", "form.name with class toString");
    });

    test("field label", function() {
      var Form = JSForm({
	name: JSForm.StringField()
      });
      var form = Form();
      equal(form.name.label(),  "<label for=\"name\">Name</label>");
    });

    test("field label different field name", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  label: "First Name"
	})
      });
      var form = Form();
      equal(form.name.label(),  "<label for=\"name\">First Name</label>");
    });

    test("validate form with data", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form({name: "test"});
      ok(form.validate(), "form validate");
    });

    test("validate wrong form with data", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form();
      ok(!form.validate(), "form validate");
    });

    test("after validate get data", function() {
      expect(2);
      var Form = JSForm({
	name: JSForm.StringField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form({"name": "test"});
      ok(form.validate(), "form validate");
      equal(form.name.data, "test", "form.name.data equal to \"test\"");
    });

    test("field integer validate with data", function() {
      expect(3);
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      var form = Form({age: "20"});
      ok(form.validate(), "form validate");
      ok(!isNaN(form.age.data), "data is a number");
      equal(form.age.data, 20, "data equal to 20");
    });

    test("field integer invalid", function() {
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      var form = Form({age: "a"});
      ok(!form.validate(), "form invalid");
    });

    test("field boolean", function() {
      var Form = JSForm({
	active: JSForm.BooleanField()
      });
      var form = Form();
      equal(form.active(), "<input id=\"active\" name=\"active\" type=\"checkbox\"/>", "field boolean toString()");
    });

    test("field boolean validate", function() {
      expect(2);
      var Form = JSForm({
	active: JSForm.BooleanField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form({"active": "true"});
      ok(form.validate(), "valid form");
      equal(form.active.data, true, "active is true");
    });

    test("field integer valid and render again", function() {
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      var form = Form({age: 1});
      equal(form.age(), "<input id=\"age\" name=\"age\" type=\"text\" value=\"1\"/>");
    });

    test("field boolean valid and render", function() {
      var Form = JSForm({
	active: JSForm.IntegerField()
      });
      var form = Form({active: true});
      equal(form.active(), "<input id=\"active\" name=\"active\" type=\"text\" value=\"true\"/>");
    });

    test("field decimal", function() {
      var Form = JSForm({
	price: JSForm.DecimalField()
      });
      var form = Form();
      equal(form.price(), "<input id=\"price\" name=\"price\" type=\"text\"/>");
    });

    test("field decimal validate", function() {
      expect(2);
      var Form = JSForm({
	price: JSForm.DecimalField()
      });
      var form = Form({price: "22.2"});
      ok(form.validate(), "form validate");
      equal(form.price.data, "22.20", "price equal to 22.20");
    });

    test("parse date", function() {
      var date = Date.parseDate("2012-03-04", "y-M-d");
      var expected = new Date(2012, 2, 4);
      ok(dateEqual(date, expected), "date equal expected");
    });
    
    test("parse date and time", function() {
      var date = Date.parseDate("08/09/2013 04:06:05", "d/M/y h:m:s");
      var expected = new Date(2013, 8, 8, 4, 6, 5);
      ok(dateEqual(date, expected), "date equal expected");
    });

    test("parse date invalid", function() {
      var date = Date.parseDate("08/13/2013 04:06:05", "d/M/y h:m:s");
      equal(date, null, "date is null");
    });

    test("date to string format", function() {
      var date = Date.parseDate("08/11/2013 04:06:05", "d/M/y h:m:s");
      equal(date.formated("d/M/y h:m:s"), "08/11/2013 04:06:05", "date formated");
    });

    test("field date", function() {
      var Form = JSForm({
	date: JSForm.DateField()
      });
      var form = Form();
      equal(form.date(), "<input id=\"date\" name=\"date\" type=\"text\"/>", "field date equal");
    });
    
    test("field date valid", function() {
      var Form = JSForm({
	date: JSForm.DateField({
	  format: "d/M/y"
	})
      });
      var form = Form({date: "04/05/2012"});
      ok(form.validate(), "form is valid");
    });

    test("field date invalid", function() {
      var Form = JSForm({
	date: JSForm.DateField({
	  format: "d/M/y"
	})
      });
      var form = Form({date: "01-01-2012"});
      ok(!form.validate(), "form is invalid");
    });
    
    test("field date valid and render", function() {
      expect(2);
      var Form = JSForm({
	date: JSForm.DateField({
	  format: "d/M/y"
	})
      });
      var form = Form({date: "04/03/2012"});
      ok(form.validate(), "form is valid");
      equal(form.date(), "<input id=\"date\" name=\"date\" type=\"text\" value=\"04/03/2012\"/>", "render date");
    });

    test("field integer default", function() {
      expect(2);
      var Form = JSForm({
	value: JSForm.IntegerField({
	  defaults: 1
	})
      });
      var form = Form();
      ok(form.validate(), "form is valid");
      equal(form.value.data, 1, "value default equal 1");
    });

    test("field integer default render", function() {
      var Form = JSForm({
	value: JSForm.IntegerField({
	  defaults: 1
	})
      });
      var form = Form();
      equal(form.value(), "<input id=\"value\" name=\"value\" type=\"text\" value=\"1\"/>", "value render");
    });

    test("field date default render", function() {
      var Form = JSForm({
	date: JSForm.DateField({
	  format: "d/M/y",
	  defaults: function() { return new Date(2012, 3, 20); }
	})
      });
      var form = Form();
      equal(form.date(), "<input id=\"date\" name=\"date\" type=\"text\" value=\"20/04/2012\"/>", "date render");
    });
    
    test("validate text field with validator Required", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form({name: "name"});
      ok(form.validate(), "form is valid");
    });

    test("validate text field with validator Required and invalid", function() {
      expect(3);
      var Form = JSForm({
	name: JSForm.StringField({
	  validators: [JSForm.validators.Required()]
	})
      });
      var form = Form();
      ok(!form.validate(), "form is invalid");
      equal(form.errors.name, "Field name is required", "form errors");
      equal(form.name.errors, "Field name is required",  "form.name errors");
    });

    test("field to string", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  defaults: "---"
	})
      });
      var form = Form();
      equal(String(form.name), "<input id=\"name\" name=\"name\" type=\"text\" value=\"---\"/>", "form.name to string");
    });

    test("field label to string", function() {
      var Form = JSForm({
	name: JSForm.StringField({
	  label: "First Name"
	})
      });
      var form = Form();
      equal(String(form.name.label), "<label for=\"name\">First Name</label>", "form.name to string");
    });
    
  });

})(jQuery);