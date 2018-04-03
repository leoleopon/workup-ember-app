import DS from 'ember-data';
import attr from 'ember-data/attr';
//import 'athlete-unit';

const Athlete = DS.Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  patronymic: attr('string'),
  birthDate: attr('date'),
  athleteUnit: DS.belongsTo('AthleteUnit'),
});

export default Athlete;
