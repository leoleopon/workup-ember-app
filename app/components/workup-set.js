import Ember from 'ember';
import {getEstimatedScore, getActualScore, formatDuration} from '../utils/workup-set-summary';

export default Ember.Component.extend({
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      let self = this;

      // dropdown() is not available via data-id search
      this.$('.ui.selection.dropdown').filter( this.$('[data-id="exercise"]') ).dropdown({
        onChange: function(value) {
          self.get('actions').exerciseSelected.call(self, value);
        },
      });

      let duration = this.$('div[data-id="duration"]').find('>:first-child');
      duration.mask("99:99:99");
      duration.on({
        change: function(e) {
          self.get('actions').durationChanged.call(self, e.target.value);
        },
      });

      this.$('div[data-id="averagePulse"]').find('>:first-child').on({
        input: function(e) {
          self.get('actions').averagePulseInput.call(self, e.target.value);
        },
      });
    });
  },

  model: null,

  isNotExerciseValid: false,
  isNotDurationValid: false,
  isNotAveragePulseValid: false,

  isNotValid: Ember.computed(
    'isNotExerciseValid',
    'isNotDurationValid',
    'isNotAveragePulseValid',
    function() {
      let result = true;

      if (this.isNotExerciseValid) {
        return result;
      }
      if (this.isNotDurationValid) {
        return result;
      }
      if (this.isNotAveragePulseValid) {
        return result;
      }

      return !result;
  }),

  //sequence: Ember.computed('model.index', function() {
  //  return this.model.index + 1;
  //}),
  sequence: null,

  duration: Ember.computed('model.duration', function() {
    return formatDuration(this.model.duration);
  }),

  averagePulse: Ember.computed.oneWay('model.averagePulse', function() {
    return this.model.averagePulse;
  }),

  isEditMode: Ember.computed('model.exerciseSheet', function() {
    return this.model.exerciseSheet !== undefined;
  }),

  isSelected: Ember.computed('selectedIndex', 'model.index', function() {
    // model reindexing in workup controller not triggering computing of sequence property
    // on 'model.index' change - so set it here
    this.set('sequence', this.model.index + 1);

    return this.selectedIndex === this.model.index;
  }),

  estimatedScore: Ember.computed('model.{exercise,duration}', function() {
    return this.intCheck(this.model.duration) && this.model.exercise ? getEstimatedScore(this.model.duration, this.model.exercise.scoreDencity).toFixed(3) : null;
  }),

  actualScore: Ember.computed('model.{duration,averagePulse}', function() {
    return this.intCheck(this.model.duration) && this.intCheck(this.model.averagePulse) ? getActualScore(this.model.duration, this.model.averagePulse).toFixed(3) : null;
  }),

  actions: {
    changeStatus: function() {
      this.$().dropdown('toggle');
    },

    ok: function() {
      //some simple validation check
      this.set('isNotExerciseValid', true);
      this.set('isNotDurationValid', true);
      this.set('isNotAveragePulseValid', true);

      if (this.model.exercise) {
        this.set('isNotExerciseValid', false);
      }
      if (this.model.duration !== null) {
        this.set('isNotDurationValid', false);
      }
      if (this.model.averagePulse !== null) {
        this.set('isNotAveragePulseValid', false);
      }

      if (this.get('isNotValid')) {
        return;
      }

      this.get('onComplete')();
      this.set('model.exerciseSheet', undefined);
    },

    cancel: function() {
      this.get('onCancel')();
    },

    exerciseSelected: function(value) {
      let exercise = this.model.exerciseSheet.findBy('name', value);
      this.set('model.exercise', exercise === undefined ? null : exercise);
    },

    durationChanged: function(value) {
      if (this.durationCheck(value)) {
        let duration = 60 * 60 * parseInt(value.substr(0, 2)) + 60 * parseInt(value.substr(3, 2)) + parseInt(value.substr(6, 2));
        this.set('model.duration', duration);
      } else {
        this.set('model.duration', null);
      }
    },

    averagePulseInput: function(value) {
      this.set('model.averagePulse', value ? value : null);
    },
  },

  intCheck(value) {
    return value && parseInt(value).toString() === value.toString();
  },

  durationCheck(value) {
    let result = value && true;

    if (result) {
      let part = value.substr(0, 2);
      result = part >= '00' && part < '24';
    }
    if (result) {
      let part = value.substr(3, 2);
      result = part >= '00' && part < '60';
    }
    if (result) {
      let part = value.substr(6, 2);
      result = part >= '00' && part < '60';
    }

    return result;
  },

  click() {
    if (this.get('isSelected')) {
      return;
    }

    this.get('onSelect')(this.model.index);
  },
});
