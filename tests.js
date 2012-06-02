(function($) {

  $(function() {
    
    module("jsforms");
    
    test("simple form", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name"
	})
      });
      form = Form()
      ok(form.name, "LoginForm.name");
    });

    test("simple form with two fields", function() {
      expect(2);
      var LoginForm = JSForm({
	name: JSForm.TextField({
	  label: "Name"
	}),
	password: JSForm.PasswordField({
	  label: "Password"
	})
      });
      form = LoginForm();
      ok(form.name, "LoginForm.name");
      ok(form.password, "LoginForm.password");
    });

    test("field toString", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name"
	})
      });
      form = Form();
      equal(form.name.toString(),  "<input name=\"name\" type=\"text\"/>", "form.name toString");
    });

    test("field password toString", function() {
      var Form = JSForm({
	name: JSForm.PasswordField({
	  label: "Name"
	})
      });
      form = Form();
      equal(form.name.toString(),  "<input name=\"name\" type=\"password\"/>", "form.name toString");
    });

    test("field with classes css toString", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name",
	  cssclass: ["c1", "c2"]
	})
      });
      form = Form();
      equal(form.name.toString(),  "<input name=\"name\" type=\"text\" class=\"c1 c2\"/>", "form.name with class toString");
    });

    test("field label", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name"
	})
      });
      form = Form();
      equal(form.name.label(),  "<label for=\"name\">Name</label>");
    });

    test("validate form with data", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name",
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({name: "test"});
      ok(form.validate(), "form validate");
    });

    test("validate wrong form with data", function() {
      var Form = JSForm({
	name: JSForm.TextField({
	  label: "Name",
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
	  label: "Name",
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
	age: JSForm.IntegerField({
	  label: "Age"
	})
      });
      form = Form({age: "20"});
      ok(form.validate(), "form validate");
      ok(!isNaN(form.age.data), "data is a number");
      equal(form.age.data, 20, "data equal to 20");
    });

    test("field integer invalid", function() {
      var Form = JSForm({
	age: JSForm.IntegerField({
	  label: "Age"
	})
      });
      form = Form({age: "a"});
      ok(!form.validate(), "form invalid");
    });

    test("field boolean", function() {
      var Form = JSForm({
	active: JSForm.BooleanField({
	  label: "Active"
	})
      });
      form = Form();
      equal(form.active.toString(), "<input name=\"active\" type=\"checkbox\" value=\"true\"/>", "field boolean toString()");
    });

    test("field boolean validate", function() {
      expect(2);
      var Form = JSForm({
	active: JSForm.BooleanField({
	  label: "Active",
	  validators: [JSForm.validators.required]
	})
      });
      form = Form({"active": "true"});
      ok(form.validate(), "valid form");
      equal(form.active.data, true, "active is true");
    });

    test("field boolean", function() {
      var Form = JSForm({
	active: JSForm.BooleanField({
	  label: "Active"
	})
      });
      form = Form();
      equal(form.active.toString(), "<input name=\"active\" type=\"checkbox\" value=\"true\"/>", "field boolean toString()");
    });

    test("field integer valid and render toString again", function() {
      var Form = JSForm({
	age: JSForm.IntegerField({
	  label: "Age"
	})
      });
      form = Form({age: 1});
      equal(form.age.toString(), "<input name=\"age\" type=\"text\" value=\"1\"/>");
    });

    test("field boolean valid and render toString", function() {
      var Form = JSForm({
	active: JSForm.IntegerField({
	  label: "Age"
	})
      });
      form = Form({active: true});
      equal(form.active.toString(), "<input name=\"active\" type=\"text\" value=\"true\"/>");
    });

    test("field decimal", function() {
      var Form = JSForm({
	price: JSForm.DecimalField({
	  label: "Price"
	})
      });
      form = Form();
      equal(form.price.toString(), "<input name=\"price\" type=\"text\"/>");
    });

    test("field decimal validate", function() {
      var Form = JSForm({
	price: JSForm.DecimalField({
	  label: "Price"
	})
      });
      form = Form({price: "22.2"});
      ok(form.validate(), "form validate");
      equal(form.price.data, "22.20");
    });

  });

})(jQuery);