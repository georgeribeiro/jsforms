(function($) {

  $(function() {
    
    module("jsforms");
    
    test("simple form", function() {
      var Form = JSForm({
	name: JSForm.TextField()
      });
      form = Form()
      ok(form.name, "LoginForm.name");
    });

    test("simple form with two fields", function() {
      expect(2);
      var LoginForm = JSForm({
	name: JSForm.TextField(),
	password: JSForm.PasswordField()
      });
      form = LoginForm();
      ok(form.name, "LoginForm.name");
      ok(form.password, "LoginForm.password");
    });
    
    test("field name html", function() {
      var Form = JSForm({
	name: JSForm.TextField()
      });
      form = Form();
      equal(form.name(),  "<input name=\"name\" type=\"text\"/>", "form.name toString");
    });

    test("field password html", function() {
      var Form = JSForm({
	name: JSForm.PasswordField()
      });
      form = Form();
      equal(form.name(),  "<input name=\"name\" type=\"password\"/>", "form.name toString");
    });

    test("field with classes css toString", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  cssclass: ["c1", "c2"]
	})
      });
      form = Form();
      equal(form.name(),  "<input name=\"name\" type=\"text\" class=\"c1 c2\"/>", "form.name with class toString");
    });

    test("field label", function() {
      var Form = JSForm({
	name: JSForm.TextField()
      });
      form = Form();
      equal(form.name.label(),  "<label for=\"name\">Name</label>");
    });

    test("field label different field name", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "First Name"
	})
      });
      form = Form();
      equal(form.name.label(),  "<label for=\"name\">First Name</label>");
    });

    test("validate form with data", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({name: "test"});
      ok(form.validate(), "form validate");
    });

    test("validate wrong form with data", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({});
      ok(!form.validate(), "form validate");
    });

    test("after validate get data", function() {
      expect(2);
      var Form = JSForm({
	name: JSForm.TextField({
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({"name": "test"});
      ok(form.validate(), "form validate");
      equal(form.name.data, "test", "form.name.data equal to \"test\"");
    });

    test("field integer", function() {
      expect(3);
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      form = Form({age: "20"});
      ok(form.validate(), "form validate");
      ok(!isNaN(form.age.data), "data is a number");
      equal(form.age.data, 20, "data equal to 20");
    });

    test("field integer invalid", function() {
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      form = Form({age: "a"});
      ok(!form.validate(), "form invalid");
    });

    test("field boolean", function() {
      var Form = JSForm({
	active: JSForm.BooleanField()
      });
      form = Form();
      equal(form.active(), "<input name=\"active\" type=\"checkbox\"/>", "field boolean toString()");
    });

    test("field boolean validate", function() {
      expect(2);
      var Form = JSForm({
	active: JSForm.BooleanField({
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({"active": "true"});
      ok(form.validate(), "valid form");
      equal(form.active.data, true, "active is true");
    });

    test("field integer valid and render again", function() {
      var Form = JSForm({
	age: JSForm.IntegerField()
      });
      form = Form({age: 1});
      equal(form.age(), "<input name=\"age\" type=\"text\" value=\"1\"/>");
    });

    test("field boolean valid and render", function() {
      var Form = JSForm({
	active: JSForm.IntegerField()
      });
      form = Form({active: true});
      equal(form.active(), "<input name=\"active\" type=\"text\" value=\"true\"/>");
    });

    test("field decimal", function() {
      var Form = JSForm({
	price: JSForm.DecimalField()
      });
      form = Form();
      equal(form.price(), "<input name=\"price\" type=\"text\"/>");
    });

    test("field decimal validate", function() {
      expect(2);
      var Form = JSForm({
	price: JSForm.DecimalField()
      });
      form = Form({price: "22.2"});
      ok(form.validate(), "form validate");
      equal(form.price.data, "22.20", "price equal to 22.20");
    });

    test("field date invalid", function() {
      expect(1);
      var Form = JSForm({
	date: JSForm.DateField({
	  format: "dd/MM/yyyy"
	})
      });
      form = Form({date: "10/13/2012"});
      ok(!form.validate(), "form with date invalid");
    });

  });

})(jQuery);