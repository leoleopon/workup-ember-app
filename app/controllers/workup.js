import Ember from 'ember';
import {getSummary} from '../utils/workup-summary';
import {formatDuration} from '../utils/workup-set-summary';

export default Ember.Controller.extend({
  isEditMode: false,

  selectedIndex: -1,

  isRemoveProhibited: Ember.computed('isEditMode', 'selectedIndex', function() {
    return this.isEditMode ? true : (this.selectedIndex < 0 ? true : false);
  }),

  isUpProhibited: Ember.computed('isEditMode', 'selectedIndex', function() {
    return this.isEditMode ? true : (this.selectedIndex < 1 ? true : false);
  }),

  isDownProhibited: Ember.computed('isEditMode', 'selectedIndex', 'model.workup.workupSetSheet', function() {
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

  count: null,
  duration: null,
  averagePulse: null,
  estimatedScore: null,
  actualScore: null,

  getSummary() {
    let dataArray = [];
    this.model.workup.workupSetSheet.forEach(function(element) {
      dataArray.addObject({
        scoreDencity: element.exercise.scoreDencity,
        duration: element.duration,
        pulse: element.averagePulse,
      });
    }, this);

    let summary = getSummary(dataArray);

    this.set('count', summary.count);
    this.set('duration', formatDuration(summary.duration));
    this.set('averagePulse', summary.averagePulse);
    this.set('estimatedScore', summary.estimatedScore === null ? null : summary.estimatedScore.toFixed(1));
    this.set('actualScore', summary.actualScore === null ? null : summary.actualScore.toFixed(1));
  },

  actions: {
    add: function() {
      let sheet = this.model.workup.workupSetSheet;
      this.set('isEditMode', true);
      this.set('selectedIndex', sheet.length);
      sheet.addObject({exerciseSheet: this.model.exerciseSheet, index: this.selectedIndex, exercise: null, duration: null, averagePulse: null});
    },

    remove: function() {
      if (this.selectedIndex < 0) {
        return;
      }

      let sheet = this.model.workup.workupSetSheet;
      sheet.removeAt(this.selectedIndex);

      if (this.selectedIndex > sheet.length - 1) {
        this.set('selectedIndex', this.selectedIndex - 1);
      } else {
        // sheet.removeAt() not triggering computing of isDownProhibited
        // on 'model.workup.workupSetSheet' array change - so wank selectedIndex to trigger it
        this.set('selectedIndex', this.selectedIndex - 1);
        this.set('selectedIndex', this.selectedIndex + 1);
      }

      // reindex collection
      if (this.selectedIndex > -1) {
        for (let i = this.selectedIndex; i < sheet.length; i++) {
          sheet.set(i + '.index', i);
        }
      }

      this.getSummary();
    },

    up: function() {
      if (this.selectedIndex < 1) {
        return;
      }

      let sheet = this.get('model').workup.workupSetSheet;
      let buf = sheet.objectAt(this.selectedIndex);

      sheet.replace(this.selectedIndex, 1, [sheet.objectAt(this.selectedIndex - 1)]);
      sheet.replace(this.selectedIndex - 1, 1, [buf]);

      for (let i = this.selectedIndex - 1; i < this.selectedIndex + 1; i++) {
        sheet.set(i + '.index', i);
      }

      this.set('selectedIndex', this.selectedIndex - 1);
    },

    down: function() {
      let sheet = this.get('model').workup.workupSetSheet;
      if (this.selectedIndex < 0 || this.selectedIndex >= sheet.length) {
        return;
      }

      let buf = sheet.objectAt(this.selectedIndex);

      sheet.replace(this.selectedIndex, 1, [sheet.objectAt(this.selectedIndex + 1)]);
      sheet.replace(this.selectedIndex + 1, 1, [buf]);

      this.set('selectedIndex', this.selectedIndex + 1);

      for (let i = this.selectedIndex - 1; i < this.selectedIndex + 1; i++) {
        sheet.set(i + '.index', i);
      }
    },

    completeEdit: function() {
      this.set('isEditMode', false);
      this.getSummary();
    },

    cancelEdit: function() {
      this.send('remove');
      this.set('isEditMode', false);
    },

    select: function(index) {
      if (this.get('isEditMode')) {
        return;
      }

      this.set('selectedIndex', index);
    },
  },
});
