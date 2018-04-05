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

    duration: _ember['default'].computed('model.duration', {
      /* jshint unused:vars */
      get: function get(key) {
        return this.model.duration;
      },

      set: function set(key, value) {
        var duration = parseInt(value);

        this.set('model.duration', duration);

        return value;
      }
    }),

    /* jshint unused:true */
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
      if (this.model.exercise === null || this.model.duration === null) {
        return null;
      }

      return Math.round((0, _workupEmberAppUtilsWorkupSetSummary.getEstimatedScore)(this.model.duration, this.model.exercise.scoreDencity) * 1000) / 1000;
    }),

    actualScore: _ember['default'].computed('model.{duration,averagePulse}', function () {
      if (this.model.duration === null || this.model.averagePulse === null) {
        return null;
      }

      return Math.round((0, _workupEmberAppUtilsWorkupSetSummary.getActualScore)(this.model.duration, this.model.averagePulse) * 1000) / 1000;
    }),

    actions: {
      ok: function ok() {
        //some simple validation check
        this.set('isNotExerciseValid', true);
        this.set('isNotDurationValid', true);
        this.set('isNotAveragePulseValid', true);

        if (this.model.exercise) {
          this.set('isNotExerciseValid', false);
        }
        if (this.model.duration && parseInt(this.model.duration).toString() === this.model.duration.toString()) {
          this.set('isNotDurationValid', false);
        }
        if (this.model.averagePulse && parseInt(this.model.averagePulse).toString() === this.model.averagePulse) {
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
      }
    },
    click: function click() {
      if (this.get('isSelected')) {
        return;
      }

      this.get('onSelect')(this.model.index);
    }
  });
});
define('workup-ember-app/controllers/workup', ['exports', 'ember', 'workup-ember-app/utils/workup-summary'], function (exports, _ember, _workupEmberAppUtilsWorkupSummary) {
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
      this.set('duration', summary.duration);
      this.set('averagePulse', summary.averagePulse);
      this.set('estimatedScore', Math.round(summary.estimatedScore * 10) / 10);
      this.set('actualScore', Math.round(summary.actualScore * 10) / 10);
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
                "line": 9,
                "column": 8
              },
              "end": {
                "line": 11,
                "column": 8
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
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("option");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element8 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element8, 'value');
            morphs[1] = dom.createMorphAt(element8, 0, 0);
            return morphs;
          },
          statements: [["attribute", "value", ["get", "exercise.name", ["loc", [null, [10, 26], [10, 39]]]]], ["content", "exercise.name", ["loc", [null, [10, 42], [10, 59]]]]],
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
              "line": 16,
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
          dom.setAttribute(el1, "class", "row column");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("select");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("option");
          dom.setAttribute(el3, "value", "");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row column");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row column");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element9 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(5);
          morphs[0] = dom.createAttrMorph(element9, 'class');
          morphs[1] = dom.createAttrMorph(element9, 'onchange');
          morphs[2] = dom.createMorphAt(element9, 3, 3);
          morphs[3] = dom.createMorphAt(dom.childAt(fragment, [3]), 0, 0);
          morphs[4] = dom.createMorphAt(dom.childAt(fragment, [5]), 0, 0);
          return morphs;
        },
        statements: [["attribute", "class", ["subexpr", "if", [["get", "isNotExerciseValid", ["loc", [null, [7, 25], [7, 43]]]], "error1"], [], ["loc", [null, [7, 20], [7, 54]]]]], ["attribute", "onchange", ["subexpr", "action", ["exerciseSelected"], ["value", "target.value"], ["loc", [null, [7, 64], [7, 114]]]]], ["block", "each", [["get", "model.exerciseSheet", ["loc", [null, [9, 16], [9, 35]]]]], [], 0, null, ["loc", [null, [9, 8], [11, 17]]]], ["inline", "input", [], ["class", ["subexpr", "if", [["get", "isNotDurationValid", ["loc", [null, [14, 46], [14, 64]]]], "error1"], [], ["loc", [null, [14, 42], [14, 74]]]], "value", ["subexpr", "@mut", [["get", "duration", ["loc", [null, [14, 81], [14, 89]]]]], [], []]], ["loc", [null, [14, 28], [14, 91]]]], ["inline", "input", [], ["class", ["subexpr", "if", [["get", "isNotAveragePulseValid", ["loc", [null, [15, 46], [15, 68]]]], "textright error1", "textright"], [], ["loc", [null, [15, 42], [15, 100]]]], "value", ["subexpr", "@mut", [["get", "model.averagePulse", ["loc", [null, [15, 107], [15, 125]]]]], [], []]], ["loc", [null, [15, 28], [15, 127]]]]],
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
              "line": 16,
              "column": 2
            },
            "end": {
              "line": 26,
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
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "number");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "number");
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
          var element4 = dom.childAt(fragment, [3]);
          var element5 = dom.childAt(element4, [1]);
          var element6 = dom.childAt(fragment, [5]);
          var element7 = dom.childAt(element6, [1]);
          var morphs = new Array(10);
          morphs[0] = dom.createAttrMorph(element3, 'class');
          morphs[1] = dom.createAttrMorph(element3, 'value');
          morphs[2] = dom.createAttrMorph(element4, 'class');
          morphs[3] = dom.createAttrMorph(element5, 'class');
          morphs[4] = dom.createAttrMorph(element5, 'value');
          morphs[5] = dom.createAttrMorph(element5, 'readonly');
          morphs[6] = dom.createAttrMorph(element6, 'class');
          morphs[7] = dom.createAttrMorph(element7, 'class');
          morphs[8] = dom.createAttrMorph(element7, 'value');
          morphs[9] = dom.createAttrMorph(element7, 'readonly');
          return morphs;
        },
        statements: [["attribute", "class", ["concat", ["column ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [18, 32], [18, 42]]]], "", "readonly"], [], ["loc", [null, [18, 27], [18, 58]]]]]]], ["attribute", "value", ["get", "model.exercise.name", ["loc", [null, [18, 80], [18, 99]]]]], ["attribute", "class", ["concat", ["ui input ", ["subexpr", "if", [["get", "isNotDurationValid", ["loc", [null, [20, 30], [20, 48]]]], "error"], [], ["loc", [null, [20, 25], [20, 58]]]]]]], ["attribute", "class", ["concat", ["column ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [21, 32], [21, 42]]]], "", "readonly"], [], ["loc", [null, [21, 27], [21, 58]]]]]]], ["attribute", "value", ["get", "duration", ["loc", [null, [21, 82], [21, 90]]]]], ["attribute", "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [21, 107], [21, 117]]]], ["get", "unefind", ["loc", [null, [21, 118], [21, 125]]]], true], [], ["loc", [null, [21, 102], [21, 132]]]]], ["attribute", "class", ["concat", ["ui input ", ["subexpr", "if", [["get", "isNotDurationValid", ["loc", [null, [23, 30], [23, 48]]]], "error"], [], ["loc", [null, [23, 25], [23, 58]]]]]]], ["attribute", "class", ["concat", ["column textright ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [24, 42], [24, 52]]]], "", "readonly"], [], ["loc", [null, [24, 37], [24, 68]]]]]]], ["attribute", "value", ["get", "model.averagePulse", ["loc", [null, [24, 92], [24, 110]]]]], ["attribute", "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [24, 127], [24, 137]]]], ["get", "unefind", ["loc", [null, [24, 138], [24, 145]]]], true], [], ["loc", [null, [24, 122], [24, 152]]]]]],
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
              "line": 34,
              "column": 0
            },
            "end": {
              "line": 41,
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
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
          var el3 = dom.createTextNode("Ok");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("button");
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
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
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
        statements: [["element", "action", ["ok"], [], ["loc", [null, [36, 14], [36, 29]]]], ["element", "action", ["cancel"], [], ["loc", [null, [37, 14], [37, 33]]]]],
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
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "class", "column textright readonly");
        dom.setAttribute(el3, "type", "number");
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
        dom.setAttribute(el2, "class", "ui input");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "class", "column textright readonly");
        dom.setAttribute(el3, "type", "number");
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
        dom.setAttribute(el3, "type", "number");
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
        var element10 = dom.childAt(fragment, [0]);
        var element11 = dom.childAt(element10, [1, 1]);
        var element12 = dom.childAt(element10, [5, 1]);
        var element13 = dom.childAt(element10, [7, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element10, 'class');
        morphs[1] = dom.createAttrMorph(element11, 'value');
        morphs[2] = dom.createMorphAt(element10, 3, 3);
        morphs[3] = dom.createAttrMorph(element12, 'value');
        morphs[4] = dom.createAttrMorph(element13, 'value');
        morphs[5] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["attribute", "class", ["concat", ["row ", ["subexpr", "if", [["get", "isSelected", ["loc", [null, [1, 21], [1, 31]]]], "selected"], [], ["loc", [null, [1, 16], [1, 44]]]], " ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [1, 50], [1, 60]]]], "editmode"], [], ["loc", [null, [1, 45], [1, 73]]]]]]], ["attribute", "value", ["get", "sequence", ["loc", [null, [3, 67], [3, 75]]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [5, 8], [5, 18]]]]], [], 0, 1, ["loc", [null, [5, 2], [26, 9]]]], ["attribute", "value", ["get", "estimatedScore", ["loc", [null, [28, 67], [28, 81]]]]], ["attribute", "value", ["get", "actualScore", ["loc", [null, [31, 67], [31, 78]]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [34, 6], [34, 16]]]]], [], 2, null, ["loc", [null, [34, 0], [41, 7]]]]],
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
            "line": 117,
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
        var el2 = dom.createTextNode("\n  .nfoblock {\n    border: solid 1px #bfbfbf;\n  }\n  .row {\n    margin: 0 5px 0 5px;\n    padding: 0 3px 3px 0;\n  }\n  .column {\n    display: inline-block;\n    margin: 5px 0 0 5px !important;\n  }\n  .textright {\n    text-align: right !important;\n  }\n  .hidden {\n    display: none;\n  }\n  .selected {\n    background-color: #2a8fee;\n  }\n  .editmode input, .editmode select {\n    font-style: italic;\n  }\n  .readonly {\n    background-color: #efefef !important;\n  }\n  .error1 {\n    background-color: #ff8080;\n  }\n\n");
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
        dom.setAttribute(el4, "type", "number");
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
        var el3 = dom.createElement("button");
        var el4 = dom.createTextNode("Add");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        var el4 = dom.createTextNode("Remove");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        var el4 = dom.createTextNode("Up");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        var el4 = dom.createTextNode("Down");
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
        dom.setAttribute(el4, "type", "number");
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
        dom.setAttribute(el4, "type", "number");
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
        dom.setAttribute(el4, "type", "number");
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
        dom.setAttribute(el4, "type", "number");
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
        dom.setAttribute(el4, "type", "number");
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
        var element6 = dom.childAt(element4, [3]);
        var element7 = dom.childAt(element4, [5]);
        var element8 = dom.childAt(element4, [7]);
        var element9 = dom.childAt(fragment, [14]);
        var element10 = dom.childAt(element9, [1, 3, 1]);
        var element11 = dom.childAt(element9, [3, 3, 1]);
        var element12 = dom.childAt(element9, [5, 3, 1]);
        var element13 = dom.childAt(element9, [7, 3, 1]);
        var element14 = dom.childAt(element9, [9, 3, 1]);
        var morphs = new Array(16);
        morphs[0] = dom.createAttrMorph(element1, 'value');
        morphs[1] = dom.createAttrMorph(element2, 'value');
        morphs[2] = dom.createMorphAt(element3, 13, 13);
        morphs[3] = dom.createAttrMorph(element4, 'class');
        morphs[4] = dom.createElementMorph(element5);
        morphs[5] = dom.createAttrMorph(element6, 'disabled');
        morphs[6] = dom.createElementMorph(element6);
        morphs[7] = dom.createAttrMorph(element7, 'disabled');
        morphs[8] = dom.createElementMorph(element7);
        morphs[9] = dom.createAttrMorph(element8, 'disabled');
        morphs[10] = dom.createElementMorph(element8);
        morphs[11] = dom.createAttrMorph(element10, 'value');
        morphs[12] = dom.createAttrMorph(element11, 'value');
        morphs[13] = dom.createAttrMorph(element12, 'value');
        morphs[14] = dom.createAttrMorph(element13, 'value');
        morphs[15] = dom.createAttrMorph(element14, 'value');
        return morphs;
      },
      statements: [["attribute", "value", ["get", "athleteName", ["loc", [null, [39, 50], [39, 61]]]]], ["attribute", "value", ["get", "athleteAge", ["loc", [null, [45, 62], [45, 72]]]]], ["block", "each", [["get", "model.workup.workupSetSheet", ["loc", [null, [69, 10], [69, 37]]]]], [], 0, null, ["loc", [null, [69, 2], [76, 11]]]], ["attribute", "class", ["concat", ["row ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [77, 23], [77, 33]]]], "hidden"], [], ["loc", [null, [77, 18], [77, 44]]]]]]], ["element", "action", ["add"], [], ["loc", [null, [78, 12], [78, 28]]]], ["attribute", "disabled", ["get", "isRemoveProhibited", ["loc", [null, [79, 43], [79, 61]]]]], ["element", "action", ["remove"], [], ["loc", [null, [79, 12], [79, 31]]]], ["attribute", "disabled", ["get", "isUpProhibited", ["loc", [null, [80, 39], [80, 53]]]]], ["element", "action", ["up"], [], ["loc", [null, [80, 12], [80, 27]]]], ["attribute", "disabled", ["get", "isDownProhibited", ["loc", [null, [81, 41], [81, 57]]]]], ["element", "action", ["down"], [], ["loc", [null, [81, 12], [81, 29]]]], ["attribute", "value", ["get", "count", ["loc", [null, [89, 62], [89, 67]]]]], ["attribute", "value", ["get", "duration", ["loc", [null, [95, 52], [95, 60]]]]], ["attribute", "value", ["get", "averagePulse", ["loc", [null, [101, 62], [101, 74]]]]], ["attribute", "value", ["get", "estimatedScore", ["loc", [null, [107, 62], [107, 76]]]]], ["attribute", "value", ["get", "actualScore", ["loc", [null, [113, 62], [113, 73]]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("workup-ember-app/utils/workup-set-summary", ["exports"], function (exports) {
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

  exports.getWeightedPulse = getWeightedPulse;
  exports.getHours = getHours;
  exports.getEstimatedScore = getEstimatedScore;
  exports.getActualScore = getActualScore;
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
  require("workup-ember-app/app")["default"].create({"name":"workup-ember-app","version":"0.0.0+b811015b"});
}

/* jshint ignore:end */
//# sourceMappingURL=workup-ember-app.map
