import Ember from 'ember';

export default Ember.Route.extend({
  model()
  {
    let result = {
      athleteUnitSheet: [],
      athleteSheet: [],
      exerciseSheet: [],
      workup: {
        athlete: null,
        workupDate: Date(),
        workupSetSheet: [],
      },
    };

    result.athleteUnitSheet.push({code: 'A1'});
    result.athleteUnitSheet.push({code: 'B2'});

    result.athleteSheet.push({
      lastName: 'Иванов',
      firstName: 'Иван',
      patronymic: 'Иванович',
      birthDate: new Date(2000, 0, 1),
      athleteUnit: result.athleteUnitSheet[0],
    });
    result.athleteSheet.push({
      lastName: 'Петров',
      firstName: 'Петр',
      patronymic: 'Петрович',
      birthDate: new Date(2001, 1, 2),
      athleteUnit: result.athleteUnitSheet[0],
    });
    result.athleteSheet.push({
      lastName: 'Фёдоров',
      firstName: 'Фёдор',
      patronymic: 'Фёдорович',
      birthDate: new Date(2002, 2, 3),
      athleteUnit: result.athleteUnitSheet[1],
    });

    result.exerciseSheet.push({name: 'Скручивание', scoreDencity: 50});
    result.exerciseSheet.push({name: 'Приседание', scoreDencity: 100});
    result.exerciseSheet.push({name: 'Подтягивание', scoreDencity: 70});
    result.exerciseSheet.push({name: 'Отжимание', scoreDencity: 80});

    result.workup.athlete = result.athleteSheet[0];

    return result;
  }
});
