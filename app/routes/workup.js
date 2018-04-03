import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model)
  {
    let workupModel = {
      athleteUnitSheet: [],
      athleteSheet: [],
      exerciseSheet: [],
      workup: {
        athlete: null,
        workupDate: Date(),
        workupSetSheet: [],
      },
    };

    workupModel.athleteUnitSheet.push({code: 'A1'});
    workupModel.athleteUnitSheet.push({code: 'B2'});

    workupModel.athleteSheet.push({
      lastName: 'Иванов',
      firstName: 'Иван',
      patronymic: 'Иванович',
      birthDate: new Date(2000, 0, 1),
      athleteUnit: workupModel.athleteUnitSheet[0],
    });
    workupModel.athleteSheet.push({
      lastName: 'Петров',
      firstName: 'Петр',
      patronymic: 'Петрович',
      birthDate: new Date(2001, 1, 2),
      athleteUnit: workupModel.athleteUnitSheet[0],
    });
    workupModel.athleteSheet.push({
      lastName: 'Фёдоров',
      firstName: 'Фёдор',
      patronymic: 'Фёдорович',
      birthDate: new Date(2002, 2, 3),
      athleteUnit: workupModel.athleteUnitSheet[1],
    });

    workupModel.exerciseSheet.push({name: 'Скручивание', scoreDencity: 10});
    workupModel.exerciseSheet.push({name: 'Приседание', scoreDencity: 20});
    workupModel.exerciseSheet.push({name: 'Подтягивание', scoreDencity: 25});
    workupModel.exerciseSheet.push({name: 'Отжимание', scoreDencity: 15});

    workupModel.workup.athlete = workupModel.athleteSheet[0];

    controller.set('model', workupModel);
  }
});
