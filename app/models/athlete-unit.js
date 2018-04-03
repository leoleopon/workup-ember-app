import DS from 'ember-data';
import attr from 'ember-data/attr';

const AthleteUnit = DS.Model.extend({
  code: attr('string'),
});

export default AthleteUnit;
