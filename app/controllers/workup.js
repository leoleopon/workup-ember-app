import Ember from 'ember';

export default Ember.Controller.extend({
  isEditMode: false,

  selectedIndex: -1,

  isRemoveProhibited: Ember.computed('isEditMode', 'selectedIndex', function() {
    return this.isEditMode ? true : (this.selectedIndex < 0 ? true : false);
  }),

  isUpProhibited: Ember.computed('isEditMode', 'selectedIndex', function() {
    return this.isEditMode ? true : (this.selectedIndex < 1 ? true : false);
  }),

  isDownProhibited: Ember.computed('isEditMode', 'selectedIndex', function() {
    let sheet = this.model.workup.workupSetSheet;
    return this.isEditMode ? true : (this.selectedIndex < sheet.length - 1 ? false : true);
  }),

  athleteName: Ember.computed('model.workup.athlete.{lastName,firstName,patronymic}', function() {
      let athlete = this.model.workup.athlete;
      return `${athlete.lastName} ${athlete.firstName} ${athlete.patronymic}`.trim();
    }
  ),

  athleteAge: Ember.computed('model.workup.athlete.birthDate', function() {
    let athlete = this.model.workup.athlete;
    return new Date().getFullYear() - athlete.birthDate.getFullYear();
  }),

  summary: function() {
    let i = 0;
    this.model.workup.workupSetSheet.forEach(function(element) {
      i++;
    }, this);
    return i;
  }.property('model.workup.workupSetSheet.@each'),

  actions: {
    add: function() {
      let sheet = this.model.workup.workupSetSheet;
      this.set('isEditMode', true);
      this.set('selectedIndex', sheet.length);
      sheet.addObject({exerciseSheet: this.model.exerciseSheet, exercise: this.model.exerciseSheet[2], duration: 3500});
    },

    remove: function() {
      let sheet = this.get('model').workup.workupSetSheet;
      if (this.selectedIndex > -1) {
        sheet.removeAt(this.selectedIndex);
        this.set('selectedIndex', this.selectedIndex - 1);
      }
    },

    up: function() {
      alert('up');
    },

    down: function() {
      alert('down');
    },

    completeEdit: function() {
      this.set('isEditMode', false);
    },

    cancelEdit: function() {
      this.send('remove');
      this.set('isEditMode', false);
    },
  },
});
