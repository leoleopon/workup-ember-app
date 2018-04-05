import Ember from 'ember';
import {getEstimatedScore, getActualScore} from '../utils/workup-set-summary';

export default Ember.Component.extend({
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

      if (this.isNotExerciseValid)
        return result;
      if (this.isNotDurationValid)
        return result;
      if (this.isNotAveragePulseValid)
        return result;

      return !result;
  }),

  //sequence: Ember.computed('model.index', function() {
  //  return this.model.index + 1;
  //}),
  sequence: null,

  duration: Ember.computed('model.duration', {
    get(key) {
      return this.model.duration;
    },

    set(key, value) {
      let duration = parseInt(value);

      this.set('model.duration', duration);

      return value;
    },
  }),

  isEditMode: Ember.computed('model.exerciseSheet', function() {
    return this.model.exerciseSheet !== undefined;
  }),

  isSelected: Ember.computed('selectedIndex', 'model.index', function() {
    // model reindexing in workup controller not triggering computing of sequence property
    // on 'model.index' change - so set it here
    this.set('sequence', this.model.index + 1);

    return this.selectedIndex == this.model.index;
  }),

  estimatedScore: Ember.computed('model.{exercise,duration}', function() {
    if (this.model.exercise === null || this.model.duration === null)
      return null;

    return getEstimatedScore(this.model.duration, this.model.exercise.scoreDencity);
  }),

  actualScore: Ember.computed('model.{duration,averagePulse}', function() {
    if (this.model.duration === null || this.model.averagePulse === null)
      return null;

    return getActualScore(this.model.duration, this.model.averagePulse);
  }),

  actions: {
    ok: function() {
      //some simple validation check
      this.set('isNotExerciseValid', true);
      this.set('isNotDurationValid', true);
      this.set('isNotAveragePulseValid', true);

      if (this.model.exercise)
        this.set('isNotExerciseValid', false);
      if (this.model.duration && parseInt(this.model.duration).toString() == this.model.duration)
        this.set('isNotDurationValid', false);
      if (this.model.averagePulse && parseInt(this.model.averagePulse).toString() == this.model.averagePulse)
        this.set('isNotAveragePulseValid', false);

      if (this.get('isNotValid'))
        return;

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
  },
  click() {
    if (this.get('isSelected'))
      return;

    this.get('onSelect')(this.model.index);
  },
});
