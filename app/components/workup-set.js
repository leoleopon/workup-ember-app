import Ember from 'ember';

export default Ember.Component.extend({
  model: null,

  duration: Ember.computed('model.duration', {
    get(key) {
      return this.model.duration;
    },
    set(key, value) {
      this.set('model.duration', value);
      return value;
    },
  }),

  isEditMode: Ember.computed('model.exerciseSheet', function() {
    return this.model.exerciseSheet !== undefined;
  }),

  estimatedScore: Ember.computed('model.{exercise,duration}', function() {
    return this.model.exercise.scoreDencity * this.model.duration / 3600;
  }),

  actualScore: Ember.computed('model.{duration,averagePulse}', function() {
    return this.model.exercise.scoreDencity * this.model.duration / 3600;
  }),

  actions: {
    ok: function() {
      alert('workup-set: validate');

      this.get('onComplete')();
      this.set('model.exerciseSheet', undefined);
    },

    cancel: function() {
      this.get('onCancel')();
    },

    exerciseSelected: function(value) {
      //alert(value);
      //alert(value.name);
      //this.set('model.exercise', value);
    },
  },
  //focusIn() {
    //if (this.isSelected)
    //  return;


    //alert('werwer');
  //},
});
