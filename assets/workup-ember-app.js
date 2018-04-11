"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('workup-ember-app/app', ['exports', 'ember', 'workup-ember-app/resolver', 'ember-load-initializers', 'workup-ember-app/config/environment'], function (exports, _ember, _workupEmberAppResolver, _emberLoadInitializers, _workupEmberAppConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _workupEmberAppConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _workupEmberAppConfigEnvironment['default'].podModulePrefix,
    Resolver: _workupEmberAppResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _workupEmberAppConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('workup-ember-app/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'workup-ember-app/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _workupEmberAppConfigEnvironment) {

  var name = _workupEmberAppConfigEnvironment['default'].APP.name;
  var version = _workupEmberAppConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('workup-ember-app/components/workup-set', ['exports', 'ember', 'workup-ember-app/utils/workup-set-summary'], function (exports, _ember, _workupEmberAppUtilsWorkupSetSummary) {
  exports['default'] = _ember['default'].Component.extend({
    didInsertElement: function didInsertElement() {
      _ember['default'].run.scheduleOnce('afterRender', this, function () {
        var self = this;

        // dropdown() is not available via data-id search
        this.$('.ui.selection.dropdown').filter(this.$('[data-id="exercise"]')).dropdown({
          onChange: function onChange(value) {
            self.get('actions').exerciseSelected.call(self, value);
          }
        });

        var duration = this.$('div[data-id="duration"]').find('>:first-child');
        duration.mask("99:99:99");
        duration.on({
          change: function change(e) {
            self.get('actions').durationChanged.call(self, e.target.value);
          }
        });

        this.$('div[data-id="averagePulse"]').find('>:first-child').on({
          input: function input(e) {
            self.get('actions').averagePulseInput.call(self, e.target.value);
          }
        });
      });
    },

    model: null,

    isNotExerciseValid: false,
    isNotDurationValid: false,
    isNotAveragePulseValid: false,

    isNotValid: _ember['default'].computed('isNotExerciseValid', 'isNotDurationValid', 'isNotAveragePulseValid', function () {
      var result = true;

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

    duration: _ember['default'].computed('model.duration', function () {
      return (0, _workupEmberAppUtilsWorkupSetSummary.formatDuration)(this.model.duration);
    }),

    averagePulse: _ember['default'].computed.oneWay('model.averagePulse', function () {
      return this.model.averagePulse;
    }),

    isEditMode: _ember['default'].computed('model.exerciseSheet', function () {
      return this.model.exerciseSheet !== undefined;
    }),

    isSelected: _ember['default'].computed('selectedIndex', 'model.index', function () {
      // model reindexing in workup controller not triggering computing of sequence property
      // on 'model.index' change - so set it here
      this.set('sequence', this.model.index + 1);

      return this.selectedIndex === this.model.index;
    }),

    estimatedScore: _ember['default'].computed('model.{exercise,duration}', function () {
      return this.intCheck(this.model.duration) && this.model.exercise ? (0, _workupEmberAppUtilsWorkupSetSummary.getEstimatedScore)(this.model.duration, this.model.exercise.scoreDencity).toFixed(3) : null;
    }),

    actualScore: _ember['default'].computed('model.{duration,averagePulse}', function () {
      return this.intCheck(this.model.duration) && this.intCheck(this.model.averagePulse) ? (0, _workupEmberAppUtilsWorkupSetSummary.getActualScore)(this.model.duration, this.model.averagePulse).toFixed(3) : null;
    }),

    actions: {
      changeStatus: function changeStatus() {
        this.$().dropdown('toggle');
      },

      ok: function ok() {
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

      cancel: function cancel() {
        this.get('onCancel')();
      },

      exerciseSelected: function exerciseSelected(value) {
        var exercise = this.model.exerciseSheet.findBy('name', value);
        this.set('model.exercise', exercise === undefined ? null : exercise);
      },

      durationChanged: function durationChanged(value) {
        if (this.durationCheck(value)) {
          var duration = 60 * 60 * parseInt(value.substr(0, 2)) + 60 * parseInt(value.substr(3, 2)) + parseInt(value.substr(6, 2));
          this.set('model.duration', duration);
        } else {
          this.set('model.duration', null);
        }
      },

      averagePulseInput: function averagePulseInput(value) {
        this.set('model.averagePulse', value ? value : null);
      }
    },

    intCheck: function intCheck(value) {
      return value && parseInt(value).toString() === value.toString();
    },

    durationCheck: function durationCheck(value) {
      var result = value && true;

      if (result) {
        var part = value.substr(0, 2);
        result = part >= '00' && part < '24';
      }
      if (result) {
        var part = value.substr(3, 2);
        result = part >= '00' && part < '60';
      }
      if (result) {
        var part = value.substr(6, 2);
        result = part >= '00' && part < '60';
      }

      return result;
    },

    click: function click() {
      if (this.get('isSelected')) {
        return;
      }

      this.get('onSelect')(this.model.index);
    }
  });
});
define('workup-ember-app/controllers/workup', ['exports', 'ember', 'workup-ember-app/utils/workup-summary', 'workup-ember-app/utils/workup-set-summary'], function (exports, _ember, _workupEmberAppUtilsWorkupSummary, _workupEmberAppUtilsWorkupSetSummary) {
  exports['default'] = _ember['default'].Controller.extend({
    isEditMode: false,

    selectedIndex: -1,

    isRemoveProhibited: _ember['default'].computed('isEditMode', 'selectedIndex', function () {
      return this.isEditMode ? true : this.selectedIndex < 0 ? true : false;
    }),

    isUpProhibited: _ember['default'].computed('isEditMode', 'selectedIndex', function () {
      return this.isEditMode ? true : this.selectedIndex < 1 ? true : false;
    }),

    isDownProhibited: _ember['default'].computed('isEditMode', 'selectedIndex', 'model.workup.workupSetSheet', function () {
      var sheet = this.model.workup.workupSetSheet;
      return this.isEditMode ? true : this.selectedIndex < sheet.length - 1 ? false : true;
    }),

    athleteName: _ember['default'].computed('model.workup.athlete.{lastName,firstName,patronymic}', function () {
      var athlete = this.model.workup.athlete;
      return (athlete.lastName + ' ' + athlete.firstName + ' ' + athlete.patronymic).trim();
    }),

    athleteAge: _ember['default'].computed('model.workup.athlete.birthDate', function () {
      var athlete = this.model.workup.athlete;
      return new Date().getFullYear() - athlete.birthDate.getFullYear();
    }),

    count: null,
    duration: null,
    averagePulse: null,
    estimatedScore: null,
    actualScore: null,

    getSummary: function getSummary() {
      var dataArray = [];
      this.model.workup.workupSetSheet.forEach(function (element) {
        dataArray.addObject({
          scoreDencity: element.exercise.scoreDencity,
          duration: element.duration,
          pulse: element.averagePulse
        });
      }, this);

      var summary = (0, _workupEmberAppUtilsWorkupSummary.getSummary)(dataArray);

      this.set('count', summary.count);
      this.set('duration', (0, _workupEmberAppUtilsWorkupSetSummary.formatDuration)(summary.duration));
      this.set('averagePulse', summary.averagePulse);
      this.set('estimatedScore', summary.estimatedScore === null ? null : summary.estimatedScore.toFixed(1));
      this.set('actualScore', summary.actualScore === null ? null : summary.actualScore.toFixed(1));
    },

    actions: {
      add: function add() {
        var sheet = this.model.workup.workupSetSheet;
        this.set('isEditMode', true);
        this.set('selectedIndex', sheet.length);
        sheet.addObject({ exerciseSheet: this.model.exerciseSheet, index: this.selectedIndex, exercise: null, duration: null, averagePulse: null });
      },

      remove: function remove() {
        if (this.selectedIndex < 0) {
          return;
        }

        var sheet = this.model.workup.workupSetSheet;
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
          for (var i = this.selectedIndex; i < sheet.length; i++) {
            sheet.set(i + '.index', i);
          }
        }

        this.getSummary();
      },

      up: function up() {
        if (this.selectedIndex < 1) {
          return;
        }

        var sheet = this.get('model').workup.workupSetSheet;
        var buf = sheet.objectAt(this.selectedIndex);

        sheet.replace(this.selectedIndex, 1, [sheet.objectAt(this.selectedIndex - 1)]);
        sheet.replace(this.selectedIndex - 1, 1, [buf]);

        for (var i = this.selectedIndex - 1; i < this.selectedIndex + 1; i++) {
          sheet.set(i + '.index', i);
        }

        this.set('selectedIndex', this.selectedIndex - 1);
      },

      down: function down() {
        var sheet = this.get('model').workup.workupSetSheet;
        if (this.selectedIndex < 0 || this.selectedIndex >= sheet.length) {
          return;
        }

        var buf = sheet.objectAt(this.selectedIndex);

        sheet.replace(this.selectedIndex, 1, [sheet.objectAt(this.selectedIndex + 1)]);
        sheet.replace(this.selectedIndex + 1, 1, [buf]);

        this.set('selectedIndex', this.selectedIndex + 1);

        for (var i = this.selectedIndex - 1; i < this.selectedIndex + 1; i++) {
          sheet.set(i + '.index', i);
        }
      },

      completeEdit: function completeEdit() {
        this.set('isEditMode', false);
        this.getSummary();
      },

      cancelEdit: function cancelEdit() {
        this.send('remove');
        this.set('isEditMode', false);
      },

      select: function select(index) {
        if (this.get('isEditMode')) {
          return;
        }

        this.set('selectedIndex', index);
      }
    }
  });
});
define('workup-ember-app/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('workup-ember-app/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('workup-ember-app/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'workup-ember-app/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _workupEmberAppConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_workupEmberAppConfigEnvironment['default'].APP.name, _workupEmberAppConfigEnvironment['default'].APP.version)
  };
});
define('workup-ember-app/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('workup-ember-app/initializers/data-adapter', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('workup-ember-app/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _emberDataSetupContainer, _emberData) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('workup-ember-app/initializers/export-application-global', ['exports', 'ember', 'workup-ember-app/config/environment'], function (exports, _ember, _workupEmberAppConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_workupEmberAppConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _workupEmberAppConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_workupEmberAppConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('workup-ember-app/initializers/injectStore', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('workup-ember-app/initializers/store', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('workup-ember-app/initializers/transforms', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("workup-ember-app/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _emberDataInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataInitializeStoreService["default"]
  };
});
define('workup-ember-app/models/athlete-unit', ['exports', 'ember-data', 'ember-data/attr'], function (exports, _emberData, _emberDataAttr) {

  var AthleteUnit = _emberData['default'].Model.extend({
    code: (0, _emberDataAttr['default'])('string')
  });

  exports['default'] = AthleteUnit;
});
define('workup-ember-app/models/athlete', ['exports', 'ember-data', 'ember-data/attr'], function (exports, _emberData, _emberDataAttr) {
  //import 'athlete-unit';

  var Athlete = _emberData['default'].Model.extend({
    lastName: (0, _emberDataAttr['default'])('string'),
    firstName: (0, _emberDataAttr['default'])('string'),
    patronymic: (0, _emberDataAttr['default'])('string'),
    birthDate: (0, _emberDataAttr['default'])('date'),
    athleteUnit: _emberData['default'].belongsTo('AthleteUnit')
  });

  exports['default'] = Athlete;
});
define('workup-ember-app/models/exercise', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({});
});
define('workup-ember-app/models/workout-set', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({});
});
define('workup-ember-app/models/workout', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({});
});
define('workup-ember-app/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('workup-ember-app/router', ['exports', 'ember', 'workup-ember-app/config/environment'], function (exports, _ember, _workupEmberAppConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _workupEmberAppConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('workup');
    this.route('component');
  });

  exports['default'] = Router;
});
define('workup-ember-app/routes/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('workup-ember-app/routes/workup', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      var result = {
        athleteUnitSheet: [],
        athleteSheet: [],
        exerciseSheet: [],
        workup: {
          athlete: null,
          workupDate: Date(),
          workupSetSheet: []
        }
      };

      result.athleteUnitSheet.push({ code: 'A1' });
      result.athleteUnitSheet.push({ code: 'B2' });

      result.athleteSheet.push({
        lastName: 'Иванов',
        firstName: 'Иван',
        patronymic: 'Иванович',
        birthDate: new Date(2000, 0, 1),
        athleteUnit: result.athleteUnitSheet[0]
      });
      result.athleteSheet.push({
        lastName: 'Петров',
        firstName: 'Петр',
        patronymic: 'Петрович',
        birthDate: new Date(2001, 1, 2),
        athleteUnit: result.athleteUnitSheet[0]
      });
      result.athleteSheet.push({
        lastName: 'Фёдоров',
        firstName: 'Фёдор',
        patronymic: 'Фёдорович',
        birthDate: new Date(2002, 2, 3),
        athleteUnit: result.athleteUnitSheet[1]
      });

      result.exerciseSheet.push({ name: 'Скручивание', scoreDencity: 50 });
      result.exerciseSheet.push({ name: 'Приседание', scoreDencity: 100 });
      result.exerciseSheet.push({ name: 'Подтягивание', scoreDencity: 70 });
      result.exerciseSheet.push({ name: 'Отжимание', scoreDencity: 80 });

      result.workup.athlete = result.athleteSheet[0];

      return result;
    }
  });
});
define('workup-ember-app/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define("workup-ember-app/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 0
          }
        },
        "moduleName": "workup-ember-app/templates/application.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        dom.setAttribute(el1, "id", "title");
        var el2 = dom.createTextNode("Welcome to Ember");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [3, 0], [3, 10]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("workup-ember-app/templates/component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "workup-ember-app/templates/component.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "outlet", ["loc", [null, [1, 0], [1, 10]]]]],
      locals: [],
      templates: []
    };
  })());
});
define("workup-ember-app/templates/components/workup-set", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "fragmentReason": false,
            "revision": "Ember@2.4.6",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 10
              },
              "end": {
                "line": 14,
                "column": 10
              }
            },
            "moduleName": "workup-ember-app/templates/components/workup-set.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1, "class", "item");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element4 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element4, 'data-value');
            morphs[1] = dom.createMorphAt(element4, 0, 0);
            return morphs;
          },
          statements: [["attribute", "data-value", ["get", "exercise.name", ["loc", [null, [13, 43], [13, 56]]]]], ["content", "exercise.name", ["loc", [null, [13, 59], [13, 76]]]]],
          locals: ["exercise"],
          templates: []
        };
      })();
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 2
            },
            "end": {
              "line": 18,
              "column": 2
            }
          },
          "moduleName": "workup-ember-app/templates/components/workup-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "column");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "data-id", "exercise");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("input");
          dom.setAttribute(el3, "type", "hidden");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "dropdown icon");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "default text");
          var el4 = dom.createTextNode("Выбор...");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3, "class", "menu");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element5 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element5, 'class');
          morphs[1] = dom.createMorphAt(dom.childAt(element5, [7]), 1, 1);
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["ui selection dropdown ", ["subexpr", "if", [["get", "isNotExerciseValid", ["loc", [null, [7, 45], [7, 63]]]], "error"], [], ["loc", [null, [7, 40], [7, 73]]]]]]], ["block", "each", [["get", "model.exerciseSheet", ["loc", [null, [12, 18], [12, 37]]]]], [], 0, null, ["loc", [null, [12, 10], [14, 19]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 2
            },
            "end": {
              "line": 22,
              "column": 2
            }
          },
          "moduleName": "workup-ember-app/templates/components/workup-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "ui input");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "text");
          dom.setAttribute(el2, "readonly", "true");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element3, 'class');
          morphs[1] = dom.createAttrMorph(element3, 'value');
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["column ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [20, 32], [20, 42]]]], "", "readonly"], [], ["loc", [null, [20, 27], [20, 58]]]]]]], ["attribute", "value", ["get", "model.exercise.name", ["loc", [null, [20, 80], [20, 99]]]]]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 0
            },
            "end": {
              "line": 42,
              "column": 0
            }
          },
          "moduleName": "workup-ember-app/templates/components/workup-set.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "column");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "class", "ui button");
          var el3 = dom.createTextNode("Ok");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          dom.setAttribute(el2, "class", "ui button");
          var el3 = dom.createTextNode("Cancel");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createElementMorph(element2);
          return morphs;
        },
        statements: [["element", "action", ["ok"], [], ["loc", [null, [38, 30], [38, 45]]]], ["element", "action", ["cancel"], [], ["loc", [null, [39, 30], [39, 49]]]]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes", "wrong-type"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 43,
            "column": 0
          }
        },
        "moduleName": "workup-ember-app/templates/components/workup-set.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "class", "column textright readonly");
        dom.setAttribute(el3, "type", "text");
        dom.setAttribute(el3, "readonly", "true");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "data-id", "duration");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "placeholder", "чч:мм:сс");
        dom.setAttribute(el3, "type", "text");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "data-id", "averagePulse");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "class", "column textright readonly");
        dom.setAttribute(el3, "type", "text");
        dom.setAttribute(el3, "readonly", "true");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "class", "column textright readonly");
        dom.setAttribute(el3, "type", "text");
        dom.setAttribute(el3, "readonly", "true");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element6 = dom.childAt(fragment, [0]);
        var element7 = dom.childAt(element6, [1, 1]);
        var element8 = dom.childAt(element6, [5]);
        var element9 = dom.childAt(element8, [1]);
        var element10 = dom.childAt(element6, [7]);
        var element11 = dom.childAt(element10, [1]);
        var element12 = dom.childAt(element6, [9, 1]);
        var element13 = dom.childAt(element6, [11, 1]);
        var morphs = new Array(15);
        morphs[0] = dom.createAttrMorph(element6, 'class');
        morphs[1] = dom.createAttrMorph(element7, 'value');
        morphs[2] = dom.createMorphAt(element6, 3, 3);
        morphs[3] = dom.createAttrMorph(element8, 'class');
        morphs[4] = dom.createAttrMorph(element9, 'class');
        morphs[5] = dom.createAttrMorph(element9, 'value');
        morphs[6] = dom.createAttrMorph(element9, 'readonly');
        morphs[7] = dom.createAttrMorph(element10, 'class');
        morphs[8] = dom.createAttrMorph(element11, 'class');
        morphs[9] = dom.createAttrMorph(element11, 'type');
        morphs[10] = dom.createAttrMorph(element11, 'value');
        morphs[11] = dom.createAttrMorph(element11, 'readonly');
        morphs[12] = dom.createAttrMorph(element12, 'value');
        morphs[13] = dom.createAttrMorph(element13, 'value');
        morphs[14] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["row ", ["subexpr", "if", [["get", "isSelected", ["loc", [null, [1, 21], [1, 31]]]], "selected"], [], ["loc", [null, [1, 16], [1, 44]]]], " ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [1, 50], [1, 60]]]], "editmode"], [], ["loc", [null, [1, 45], [1, 73]]]]]]], ["attribute", "value", ["get", "sequence", ["loc", [null, [3, 65], [3, 73]]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [5, 8], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 2], [22, 9]]]], ["attribute", "class", ["concat", ["ui input ", ["subexpr", "if", [["get", "isNotDurationValid", ["loc", [null, [23, 28], [23, 46]]]], "error"], [], ["loc", [null, [23, 23], [23, 56]]]]]]], ["attribute", "class", ["concat", ["column ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [24, 30], [24, 40]]]], "", "readonly"], [], ["loc", [null, [24, 25], [24, 56]]]]]]], ["attribute", "value", ["get", "duration", ["loc", [null, [24, 101], [24, 109]]]]], ["attribute", "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [24, 126], [24, 136]]]], ["get", "undefind", ["loc", [null, [24, 137], [24, 145]]]], true], [], ["loc", [null, [24, 121], [24, 152]]]]], ["attribute", "class", ["concat", ["ui input ", ["subexpr", "if", [["get", "isNotAveragePulseValid", ["loc", [null, [26, 28], [26, 50]]]], "error"], [], ["loc", [null, [26, 23], [26, 60]]]]]]], ["attribute", "class", ["concat", ["column textright ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [27, 40], [27, 50]]]], "", "readonly"], [], ["loc", [null, [27, 35], [27, 66]]]]]]], ["attribute", "type", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [27, 78], [27, 88]]]], "number", "text"], [], ["loc", [null, [27, 73], [27, 106]]]]], ["attribute", "value", ["get", "averagePulse", ["loc", [null, [27, 115], [27, 127]]]]], ["attribute", "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [27, 144], [27, 154]]]], ["get", "undefind", ["loc", [null, [27, 155], [27, 163]]]], true], [], ["loc", [null, [27, 139], [27, 170]]]]], ["attribute", "value", ["get", "estimatedScore", ["loc", [null, [30, 65], [30, 79]]]]], ["attribute", "value", ["get", "actualScore", ["loc", [null, [33, 65], [33, 76]]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [36, 6], [36, 16]]]]], [], 2, null, ["loc", [null, [36, 0], [42, 7]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("workup-ember-app/templates/workup", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "fragmentReason": false,
          "revision": "Ember@2.4.6",
          "loc": {
            "source": null,
            "start": {
              "line": 69,
              "column": 2
            },
            "end": {
              "line": 76,
              "column": 2
            }
          },
          "moduleName": "workup-ember-app/templates/workup.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "workup-set", [], ["selectedIndex", ["subexpr", "@mut", [["get", "selectedIndex", ["loc", [null, [71, 20], [71, 33]]]]], [], []], "model", ["subexpr", "@mut", [["get", "workupSet", ["loc", [null, [72, 12], [72, 21]]]]], [], []], "onComplete", ["subexpr", "action", ["completeEdit"], [], ["loc", [null, [73, 17], [73, 40]]]], "onCancel", ["subexpr", "action", ["cancelEdit"], [], ["loc", [null, [74, 15], [74, 36]]]], "onSelect", ["subexpr", "action", ["select"], [], ["loc", [null, [75, 15], [75, 32]]]]], ["loc", [null, [70, 4], [75, 34]]]]],
        locals: ["workupSet"],
        templates: []
      };
    })();
    return {
      meta: {
        "fragmentReason": {
          "name": "missing-wrapper",
          "problems": ["multiple-nodes"]
        },
        "revision": "Ember@2.4.6",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 120,
            "column": 0
          }
        },
        "moduleName": "workup-ember-app/templates/workup.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("style");
        dom.setAttribute(el1, "type", "text/css");
        var el2 = dom.createTextNode("\n  .nfoblock {\n    border: solid 1px #bfbfbf;\n  }\n  .row {\n    margin: 0 5px 0 5px;\n    padding: 0 3px 3px 0;\n  }\n  .column {\n    display: inline-block;\n    margin: 5px 0 0 5px !important;\n  }\n  .textright {\n    text-align: right !important;\n  }\n  .hidden {\n    display: none;\n  }\n  .selected {\n    background-color: #2a8fee;\n  }\n  .editmode input, .editmode select, .editmode div {\n    font-style: italic;\n  }\n  .readonly {\n    background-color: #efefef !important;\n  }\n  .error1 {\n    background-color: #ff8080;\n  }\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Тренировка");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode("Спортсмен");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "nfoblock");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("ФИО");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Возраст");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "textright readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode("Подходы");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "nfoblock");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("№");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Упражнение");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Продолжительность");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Средний пульс");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Плановая нагрузка");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Фактическая нагрузка");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "column");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "class", "ui button");
        var el5 = dom.createTextNode("Add");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "class", "ui button");
        var el5 = dom.createTextNode("Remove");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "class", "ui button");
        var el5 = dom.createTextNode("Up");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "class", "ui button");
        var el5 = dom.createTextNode("Down");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode("Суммарная информация");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "nfoblock");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("К-во подходов");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "textright readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Продолжительность");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Средний пульс");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "textright readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Плановая нагрузка");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "textright readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Фактическая нагрузка");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "ui input");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "textright readonly");
        dom.setAttribute(el4, "type", "text");
        dom.setAttribute(el4, "readonly", "true");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [6]);
        var element1 = dom.childAt(element0, [1, 3, 1]);
        var element2 = dom.childAt(element0, [3, 3, 1]);
        var element3 = dom.childAt(fragment, [10]);
        var element4 = dom.childAt(element3, [15]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element5, [3]);
        var element8 = dom.childAt(element5, [5]);
        var element9 = dom.childAt(element5, [7]);
        var element10 = dom.childAt(fragment, [14]);
        var element11 = dom.childAt(element10, [1, 3, 1]);
        var element12 = dom.childAt(element10, [3, 3, 1]);
        var element13 = dom.childAt(element10, [5, 3, 1]);
        var element14 = dom.childAt(element10, [7, 3, 1]);
        var element15 = dom.childAt(element10, [9, 3, 1]);
        var morphs = new Array(16);
        morphs[0] = dom.createAttrMorph(element1, 'value');
        morphs[1] = dom.createAttrMorph(element2, 'value');
        morphs[2] = dom.createMorphAt(element3, 13, 13);
        morphs[3] = dom.createAttrMorph(element4, 'class');
        morphs[4] = dom.createElementMorph(element6);
        morphs[5] = dom.createAttrMorph(element7, 'disabled');
        morphs[6] = dom.createElementMorph(element7);
        morphs[7] = dom.createAttrMorph(element8, 'disabled');
        morphs[8] = dom.createElementMorph(element8);
        morphs[9] = dom.createAttrMorph(element9, 'disabled');
        morphs[10] = dom.createElementMorph(element9);
        morphs[11] = dom.createAttrMorph(element11, 'value');
        morphs[12] = dom.createAttrMorph(element12, 'value');
        morphs[13] = dom.createAttrMorph(element13, 'value');
        morphs[14] = dom.createAttrMorph(element14, 'value');
        morphs[15] = dom.createAttrMorph(element15, 'value');
        return morphs;
      },
      statements: [["attribute", "value", ["get", "athleteName", ["loc", [null, [39, 50], [39, 61]]]]], ["attribute", "value", ["get", "athleteAge", ["loc", [null, [45, 60], [45, 70]]]]], ["block", "each", [["get", "model.workup.workupSetSheet", ["loc", [null, [69, 10], [69, 37]]]]], [], 0, null, ["loc", [null, [69, 2], [76, 11]]]], ["attribute", "class", ["concat", [["subexpr", "if", [["get", "isEditMode", ["loc", [null, [77, 19], [77, 29]]]], "hidden"], [], ["loc", [null, [77, 14], [77, 40]]]]]]], ["element", "action", ["add"], [], ["loc", [null, [79, 32], [79, 48]]]], ["attribute", "disabled", ["get", "isRemoveProhibited", ["loc", [null, [80, 63], [80, 81]]]]], ["element", "action", ["remove"], [], ["loc", [null, [80, 32], [80, 51]]]], ["attribute", "disabled", ["get", "isUpProhibited", ["loc", [null, [81, 59], [81, 73]]]]], ["element", "action", ["up"], [], ["loc", [null, [81, 32], [81, 47]]]], ["attribute", "disabled", ["get", "isDownProhibited", ["loc", [null, [82, 61], [82, 77]]]]], ["element", "action", ["down"], [], ["loc", [null, [82, 32], [82, 49]]]], ["attribute", "value", ["get", "count", ["loc", [null, [92, 60], [92, 65]]]]], ["attribute", "value", ["get", "duration", ["loc", [null, [98, 50], [98, 58]]]]], ["attribute", "value", ["get", "averagePulse", ["loc", [null, [104, 60], [104, 72]]]]], ["attribute", "value", ["get", "estimatedScore", ["loc", [null, [110, 60], [110, 74]]]]], ["attribute", "value", ["get", "actualScore", ["loc", [null, [116, 60], [116, 71]]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('workup-ember-app/utils/workup-set-summary', ['exports'], function (exports) {
  function getWeightedPulse(duration, pulse) {
    return duration * pulse;
  }

  function getHours(seconds) {
    return seconds / 3600;
  }

  function getEstimatedScore(duration, scoreDencity) {
    return getHours(duration) * scoreDencity;
  }

  function getActualScore(duration, pulse) {
    var zoneScore = [0, 20, 30, 40, 50, 60, 70, 80, 100, 120, 140];

    var p = pulse - 79;
    p = p > 0 ? p < 110 ? p : 110 : 0;

    var pulseZone = Math.trunc(p / 11);

    return getHours(duration) * zoneScore[pulseZone];
  }

  function formatDuration(value) {
    if (!value) {
      return null;
    }

    var h = Math.trunc(value / (60 * 60));
    var m = Math.trunc((value - 60 * 60 * h) / 60);
    var s = value - 60 * 60 * h - 60 * m;

    return (h < 99 ? ('0' + h).slice(-2) : h) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }

  exports.getWeightedPulse = getWeightedPulse;
  exports.getHours = getHours;
  exports.getEstimatedScore = getEstimatedScore;
  exports.getActualScore = getActualScore;
  exports.formatDuration = formatDuration;
});
define('workup-ember-app/utils/workup-summary', ['exports', 'workup-ember-app/utils/workup-set-summary'], function (exports, _workupEmberAppUtilsWorkupSetSummary) {

  function getSummary(dataArray) {
    var result = {
      count: null,
      duration: null,
      averagePulse: null,
      estimatedScore: null,
      actualScore: null
    };

    if (dataArray.length === 0) {
      return result;
    }

    result.duration = 0;
    result.estimatedScore = 0;
    result.actualScore = 0;

    var weightedPulse = 0;

    dataArray.forEach(function (element) {
      if (element.duration) {
        result.duration = result.duration + element.duration;
      }

      if (element.duration && element.pulse) {
        weightedPulse = weightedPulse + (0, _workupEmberAppUtilsWorkupSetSummary.getWeightedPulse)((0, _workupEmberAppUtilsWorkupSetSummary.getHours)(element.duration), element.pulse);
        result.actualScore = result.actualScore + (0, _workupEmberAppUtilsWorkupSetSummary.getActualScore)(element.duration, element.pulse);
      }

      if (element.duration && element.scoreDencity) {
        result.estimatedScore = result.estimatedScore + (0, _workupEmberAppUtilsWorkupSetSummary.getEstimatedScore)(element.duration, element.scoreDencity);
      }
    }, this);

    result.count = dataArray.length;
    result.averagePulse = Math.round(weightedPulse / (0, _workupEmberAppUtilsWorkupSetSummary.getHours)(result.duration));

    return result;
  }

  exports.getSummary = getSummary;
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('workup-ember-app/config/environment', ['ember'], function(Ember) {
  var prefix = 'workup-ember-app';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("workup-ember-app/app")["default"].create({"name":"workup-ember-app","version":"0.0.0+3bc53a53"});
}

/* jshint ignore:end */
//# sourceMappingURL=workup-ember-app.map
