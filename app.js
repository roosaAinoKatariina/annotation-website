var APP_ROOT="http://epsilon-it.utu.fi/flask_shelve";
var collection="parsebank-register-annotation";
var doc_count=75

var choices = {
"Narrative":
	["News reports / News blogs",
	 "Sports reports",
	 "Personal blog",
	 "Historical article",
	 "Fiction",
	 "Travel blog",
 	 "Community blog"],
 "Informational Description (or Explanation)":
	["Description of a thing",
	 "Encyclopedia articles",
	 "Research articles",
	 "Description of a person",
	 "Information blogs",
	 "FAQs",
	 "Course materials"],
 "Opinion":
	["Reviews",
	 "Personal opinion blogs",
	 "Religious blogs/sermons",
	 "Advice"],
 "Interactive discussion":
	["Discussion forums",
	 "Question-Answer forums"],
 "How-To":
	["How-to/instructions",
	 "Recipes"],
 "Informational Persuasion":
	["Description with intent to sell",
	 "News+Opinion blogs / Editorials"],
 "Lyrical":
	["Songs",
	 "Poems"],
 "Spoken":
	["Interviews",
	 "Formal speeches",
	 "TV transcripts"],
 "Other":
      ["Machine-translated / generated texts"]
};

//custom dropdown component
Vue.component('dropdown', {
	template: "<select v-model='dropdown_value' v-on:change='selected'> \
		<option value=''>Clear</option> \
    <optgroup v-for='item, key in data' v-bind:label='key'> \
      <option v-for='option in item' v-bind:value='option'>{{option}}</option> \
    </optgroup> \
	</select>",
	
  props: ["data", "index", "category_index", "oldValue", "bodyurl", "textid", "docid"],
  data: function() {
    return {
			dropdown_value: "",
    }
  },
	created: function() {
		if (this.oldValue) {
			this.dropdown_value = this.oldValue["register-" + this.category_index];
		}
	},
  methods: {
		//prompts an update to flask_shelve every time an option is selected from the dropdown
    selected: function() {
  		console.log(this.dropdown_value);
      this.$emit("data", {
        key: "register-" + this.category_index,
				value: this.dropdown_value,
				header: this.index,
				bodyurl: this.bodyurl,
				docid: this.docid
      });
    }
  }
});

//checkboxes
Vue.component('unclear-checkbox', {
	template: "<input v-model='checked' v-on:change='selected' type='checkbox'> \
</input>",
	props: ["index", "oldValue"],
	data: function() {
		return {
			checked: false
		}
	},
	created: function() {
		if (this.oldValue) {
			this.checked = this.oldValue["unclear"];
		}
	},
	methods: {
		selected: function() {
			console.log(this.checked);
			this.$emit("data", {
        key: "unclear",
				value: this.checked,
				header: this.index,
				url: this.text_url
				
			});
		}
	}
});

Vue.component('comments-checkbox', {
	template: "<input v-model='checked' v-on:change='selected' type='checkbox'> \
</input>",
	props: ["index", "oldValue"],
	data: function() {
		return {
			checked: false
		}
	},
	created: function() {
		if (this.oldValue) {
			this.checked = this.oldValue["comments"];
		}
	},
	methods: {
		selected: function() {
			console.log(this.checked);
			this.$emit("data", {
        key: "comments",
				value: this.checked,
				header: this.index,
				url: this.text_url
				
			});
		}
	}
});



var app = new Vue({
  el: "#app",
  methods: {
		//HANDLEDATA
		//passes the data from dropdowns or checkboxes to the save function
  	handleData: function(data) {
      this.save(data.header, data.key, data.value, data.bodyurl, data.docid);
		},
		//check if the user types in a name
		checkUser: function() {
			if (!this.username) {
				return;
			}
			//if the user already exists, their previously saved annotations are fetched from the values list
			if (this.users[this.username]) {
				this.values = this.users[this.username];
				console.log(this.values);
			}
			this.active_page = 2;
		},
		//SAVE
		//creates a JS object for the annotation and keeps it in the user's list values
    save: function(id, key, value, bodyurl, docid) {
      if (!this.values[id]) {
				this.values[id] = {}
				this.values[id]['url'] = bodyurl
				this.values[id]['doc_id'] = docid
			}
			
			if (value === '' || value === false) {
				delete this.values[id][key];
			}
			else {
				this.values[id][key] = value
			}

			console.log(this.values[id][key]);
			
      this.saveToServer(id)
		},
		//SAVETOSERVER
		//send the JSON formatted data to the flask_shelve
    saveToServer: function(id) {
			
			var jsonobject = encodeURIComponent(JSON.stringify(this.values[id]));
     	this.$http.post(APP_ROOT + "/set/" + collection + "/" + this.username + "/" + id, {
				value: jsonobject
			}).then(function(data) {
				console.log('Returned:');
				console.log(data);
			});
			
    },
		fetchTexts: function() {
	    for (let i = 0; i < doc_count; i++) {
				//fetches the documents from server
				// Document names assumed to be comments_i, where i is between 0 and 100.
	      this.$http.get("documents/comments_" + i + ".json").then(response => {
	        if (response.body[0] && response.body[0].text) {
						//checks if the document is valid and adds it to the array
	          this.texts.push({
							index: i,
							body: response.body[0],
							text_id: response.body[0].id,
							doc_id: response.body[0].doc_id,
							text_url: response.body[0].url
						});
	        }
	      }, (err) => {
					console.log("Error with file comments_", i);
				});
	    }
		},
		finish: function() {
			this.active_page = 3;
		}
  },
  created: function() {
		this.fetchTexts();
    this.$http.get(APP_ROOT + '/list/' + collection).then(response => {
			 console.log('Response body:');
       console.log(response.body);
			this.users = response.body;
	  }, response => {
	    alert("Server error")
	  });
  },
  data: {
    choices: choices,
    texts: [],
    values: {},
    username: "",
		users: {},
		active_page: 1,
		unclear: false,
		comments: false,
		manycomments: ""
  },
	events: {

	}
});
