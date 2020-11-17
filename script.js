function validateInput (text) {
    if(text === null || String(text).trim().length < 2){
        return true
    }
    return false
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

$(function() {

    const Contact = Backbone.Model.extend({
        idAttribute: '_id',

        state: {
            name: null,
            phone: null,
        },
        defaults: {
            userNameValue: 'Alex',
            userPhoneValue: '+(222) 222-2222',
            editStatus: false,
            avatarLink: null,
            isLoading: true
        }
    });

    const ContactItemView = Backbone.View.extend({
        tagName: 'li',

        template: _.template($('#contactItemTemplate').html()),

        events: {
            'click .edit': 'editContact',
            'click .save': 'saveContact',
            'click .delete': 'deleteContact',
            'change .userNameInput': 'handleOnNameChange',
            'change .userPhoneInput': 'handleOnPhoneChange'
        },
        handleOnNameChange: function () {
            this.model.state.name = this.$el[0].querySelector('.userNameInput').value
        },
        handleOnPhoneChange: function () {
            this.model.state.phone = this.$el[0].querySelector('.userPhoneInput').value
        },
        editContact: function () {
            this.model.set("editStatus", true)
            this.$el[0].querySelector('.userNameInput').readOnly = false
            this.$el[0].querySelector('.userPhoneInput').readOnly = false
            this.handleOnNameChange()
            this.handleOnPhoneChange()
            this.createPhoneMask();

        },
        saveContact: async function () {
            if(validateInput(this.model.state.name) || validateInput(this.model.state.phone)){
                return null
            }

            this.model.set("isLoading", false)
            // request to server
            await sleep(1000);
            // end request to server

            this.model.set('userNameValue', this.model.state.name)
            this.model.set('userPhoneValue', this.model.state.phone)

            this.model.state = {
                name: null,
                phone: null
            }
            this.model.set("editStatus", false)
            this.model.set("isLoading", true)
            this.$el[0].querySelector('.userPhoneInput').readOnly = true
            this.$el[0].querySelector('.userNameInput').readOnly = true
           
        },

        deleteContact: async function() {
            this.model.set("isLoading", false)
            // request to server
            await sleep(1000);
            // end request to server
            this.model.destroy();
            this.model.set("isLoading", true)
        },

        remove: function () {

            this.$el.remove();
        },

        initialize: function () {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
            this.render();
            this.createPhoneMask();
        },

        createPhoneMask: function () {
            for (const phoneInput of document.getElementsByClassName('userPhoneInput')) {
                phoneInput.addEventListener('input', function (e) {
                    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                    e.target.value = !x[2] ? x[1] : '+(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
                  });
            }
        },

        render: function () {
            this.$el.html(this.template(this.model.attributes));
        }
    });

    const contactCollection = Backbone.Collection.extend({
        model: Contact,
    });


    const NewContactView = Backbone.View.extend({
        el: '#createNewContact',
        events: {
            'submit': 'onCreateNewContact'
        },

        onCreateNewContact: function (event) {
            event.preventDefault();
            if(validateInput(this.$el.find('.name').val()) || validateInput(this.$el.find('.phone').val())){
                return null
            }
            const contact = new Contact({
                'userNameValue': this.$el.find('.name').val(),
                'userPhoneValue': this.$el.find('.phone').val()
            });
            this.collection.add(contact);
        }

    });

    const contactBoxView = Backbone.View.extend({
        tagName: 'ul',

        initialize: function () {
            this.collection.on('add', this.addOne, this);
        },

        addOne: function (contact) {
            const messageView = new ContactItemView({ model: contact });
            this.$el.append(messageView.el);
        },

        render: function () {
            this.collection.each(this.addOne, this);
            return this;
        }
    });

    const AppRouter = Backbone.Router.extend({
        routes: {
            '': 'index',
            '*default': 'index'
        },

        index: function () {
            const contacts = new contactCollection([
                { userNameValue: 'Alex', userPhoneValue: '+(222) 222-2222', avatarLink: "./assets/images/Bob.jpg"},
                { userNameValue: 'Margo', userPhoneValue: '+(333) 333-3333', avatarLink: "./assets/images/Alexa.jpg" },
                { userNameValue: 'Tiffany', userPhoneValue: '+(221) 333-3333', avatarLink: "./assets/images/Angela.jpg" },
                { userNameValue: 'Mateo', userPhoneValue: '+(111) 333-3333', avatarLink: "./assets/images/Amir.jpg" }
            ]);
            new NewContactView({ collection: contacts });
            const contactBox = new contactBoxView({ collection: contacts });

            $('#contactsList').html(contactBox.render().el);
        },
    });
    new AppRouter();
    Backbone.history.start();
});