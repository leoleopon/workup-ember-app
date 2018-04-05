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

      if (this.isNotExerciseValid) return result;
      if (this.isNotDurationValid) return result;
      if (this.isNotAveragePulseValid) return result;

      return !result;
    }),

    //sequence: Ember.computed('model.index', function() {
    //  return this.model.index + 1;
    //}),
    sequence: null,

    duration: _ember['default'].computed('model.duration', {
      get: function get(key) {
        return this.model.duration;
      },

      set: function set(key, value) {
        var duration = parseInt(value);

        this.set('model.duration', duration);

        return value;
      }
    }),

    isEditMode: _ember['default'].computed('model.exerciseSheet', function () {
      return this.model.exerciseSheet !== undefined;
    }),

    isSelected: _ember['default'].computed('selectedIndex', 'model.index', function () {
      // model reindexing in workup controller not triggering computing of sequence property
      // on 'model.index' change - so set it here
      this.set('sequence', this.model.index + 1);

      return this.selectedIndex == this.model.index;
    }),

    estimatedScore: _ember['default'].computed('model.{exercise,duration}', function () {
      if (this.model.exercise === null || this.model.duration === null) return null;

      return (0, _workupEmberAppUtilsWorkupSetSummary.getEstimatedScore)(this.model.duration, this.model.exercise.scoreDencity);
    }),

    actualScore: _ember['default'].computed('model.{duration,averagePulse}', function () {
      if (this.model.duration === null || this.model.averagePulse === null) return null;

      return (0, _workupEmberAppUtilsWorkupSetSummary.getActualScore)(this.model.duration, this.model.averagePulse);
    }),

    actions: {
      ok: function ok() {
        //some simple validation check
        this.set('isNotExerciseValid', true);
        this.set('isNotDurationValid', true);
        this.set('isNotAveragePulseValid', true);

        if (this.model.exercise) this.set('isNotExerciseValid', false);
        if (this.model.duration && parseInt(this.model.duration).toString() == this.model.duration) this.set('isNotDurationValid', false);
        if (this.model.averagePulse && parseInt(this.model.averagePulse).toString() == this.model.averagePulse) this.set('isNotAveragePulseValid', false);

        if (this.get('isNotValid')) return;

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
      if (this.get('isSelected')) return;

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
      this.set('estimatedScore', summary.estimatedScore);
      this.set('actualScore', summary.actualScore);
    },

    actions: {
      add: function add() {
        var sheet = this.model.workup.workupSetSheet;
        this.set('isEditMode', true);
        this.set('selectedIndex', sheet.length);
        sheet.addObject({ exerciseSheet: this.model.exerciseSheet, index: this.selectedIndex, exercise: null, duration: null, averagePulse: null });
      },

      remove: function remove() {
        if (this.selectedIndex < 0) return;

        var sheet = this.model.workup.workupSetSheet;
        sheet.removeAt(this.selectedIndex);

        if (this.selectedIndex > sheet.length - 1) this.set('selectedIndex', this.selectedIndex - 1);else {
          // sheet.removeAt() not triggering computing of isDownProhibited
          // on 'model.workup.workupSetSheet' array change - so wank selectedIndex to trigger it
          this.set('selectedIndex', this.selectedIndex - 1);
          this.set('selectedIndex', this.selectedIndex + 1);
        }

        // reindex collection
        if (this.selectedIndex > -1) for (var i = this.selectedIndex; i < sheet.length; i++) {
          sheet.set(i + '.index', i);
        }this.getSummary();
      },

      up: function up() {
        if (this.selectedIndex < 1) return;

        var sheet = this.get('model').workup.workupSetSheet;
        var buf = sheet.objectAt(this.selectedIndex);

        sheet.replace(this.selectedIndex, 1, [sheet.objectAt(this.selectedIndex - 1)]);
        sheet.replace(this.selectedIndex - 1, 1, [buf]);

        for (var i = this.selectedIndex - 1; i < this.selectedIndex + 1; i++) {
          sheet.set(i + '.index', i);
        }this.set('selectedIndex', this.selectedIndex - 1);
      },

      down: function down() {
        var sheet = this.get('model').workup.workupSetSheet;
        if (this.selectedIndex < 0 || this.selectedIndex >= sheet.length) return;

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
        if (this.get('isEditMode')) return;

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
                "line": 7,
                "column": 8
              },
              "end": {
                "line": 9,
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
            var element3 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element3, 'value');
            morphs[1] = dom.createMorphAt(element3, 0, 0);
            return morphs;
          },
          statements: [["attribute", "value", ["get", "exercise.name", ["loc", [null, [8, 26], [8, 39]]]]], ["content", "exercise.name", ["loc", [null, [8, 42], [8, 59]]]]],
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
              "line": 3,
              "column": 2
            },
            "end": {
              "line": 12,
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
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(3);
          morphs[0] = dom.createAttrMorph(element4, 'class');
          morphs[1] = dom.createAttrMorph(element4, 'onchange');
          morphs[2] = dom.createMorphAt(element4, 3, 3);
          return morphs;
        },
        statements: [["attribute", "class", ["subexpr", "if", [["get", "isNotExerciseValid", ["loc", [null, [5, 25], [5, 43]]]], "error"], [], ["loc", [null, [5, 20], [5, 53]]]]], ["attribute", "onchange", ["subexpr", "action", ["exerciseSelected"], ["value", "target.value"], ["loc", [null, [5, 63], [5, 113]]]]], ["block", "each", [["get", "model.exerciseSheet", ["loc", [null, [7, 16], [7, 35]]]]], [], 0, null, ["loc", [null, [7, 8], [9, 17]]]]],
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
              "line": 12,
              "column": 2
            },
            "end": {
              "line": 14,
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
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["inline", "input", [], ["class", "readonly", "value", ["subexpr", "@mut", [["get", "model.exercise.name", ["loc", [null, [13, 59], [13, 78]]]]], [], []], "readonly", true], ["loc", [null, [13, 28], [13, 94]]]]],
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
              "line": 20,
              "column": 0
            },
            "end": {
              "line": 27,
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
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "row");
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          var el4 = dom.createTextNode("Ok");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          var el4 = dom.createTextNode("Cancel");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [3]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element1);
          morphs[1] = dom.createElementMorph(element2);
          return morphs;
        },
        statements: [["element", "action", ["ok"], [], ["loc", [null, [23, 14], [23, 29]]]], ["element", "action", ["cancel"], [], ["loc", [null, [24, 14], [24, 33]]]]],
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
            "line": 28,
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
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row column");
        var el3 = dom.createComment("");
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
        var element5 = dom.childAt(fragment, [0]);
        var morphs = new Array(8);
        morphs[0] = dom.createAttrMorph(element5, 'class');
        morphs[1] = dom.createMorphAt(dom.childAt(element5, [1]), 0, 0);
        morphs[2] = dom.createMorphAt(element5, 3, 3);
        morphs[3] = dom.createMorphAt(dom.childAt(element5, [5]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element5, [7]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element5, [9]), 0, 0);
        morphs[6] = dom.createMorphAt(dom.childAt(element5, [11]), 0, 0);
        morphs[7] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["attribute", "class", ["concat", [["subexpr", "if", [["get", "isSelected", ["loc", [null, [1, 17], [1, 27]]]], "selected"], [], ["loc", [null, [1, 12], [1, 40]]]], " ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [1, 46], [1, 56]]]], "editmode"], [], ["loc", [null, [1, 41], [1, 69]]]]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "sequence", ["loc", [null, [2, 67], [2, 75]]]]], [], []], "readonly", true], ["loc", [null, [2, 26], [2, 91]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [3, 8], [3, 18]]]]], [], 0, 1, ["loc", [null, [3, 2], [14, 9]]]], ["inline", "input", [], ["class", ["subexpr", "if", [["get", "isNotDurationValid", ["loc", [null, [15, 44], [15, 62]]]], "error", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [15, 75], [15, 85]]]], "", "readonly"], [], ["loc", [null, [15, 71], [15, 100]]]]], [], ["loc", [null, [15, 40], [15, 101]]]], "value", ["subexpr", "@mut", [["get", "duration", ["loc", [null, [15, 108], [15, 116]]]]], [], []], "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [15, 130], [15, 140]]]], ["get", "unefind", ["loc", [null, [15, 141], [15, 148]]]], true], [], ["loc", [null, [15, 126], [15, 154]]]]], ["loc", [null, [15, 26], [15, 156]]]], ["inline", "input", [], ["class", ["subexpr", "if", [["get", "isNotAveragePulseValid", ["loc", [null, [16, 44], [16, 66]]]], "error", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [16, 79], [16, 89]]]], "textright", "textright readonly"], [], ["loc", [null, [16, 75], [16, 123]]]]], [], ["loc", [null, [16, 40], [16, 124]]]], "value", ["subexpr", "@mut", [["get", "model.averagePulse", ["loc", [null, [16, 131], [16, 149]]]]], [], []], "readonly", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [16, 163], [16, 173]]]], ["get", "undefind", ["loc", [null, [16, 174], [16, 182]]]], true], [], ["loc", [null, [16, 159], [16, 188]]]]], ["loc", [null, [16, 26], [16, 190]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "estimatedScore", ["loc", [null, [17, 67], [17, 81]]]]], [], []], "readonly", true], ["loc", [null, [17, 26], [17, 97]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "actualScore", ["loc", [null, [18, 67], [18, 78]]]]], [], []], "readonly", true], ["loc", [null, [18, 26], [18, 94]]]], ["block", "if", [["get", "isEditMode", ["loc", [null, [20, 6], [20, 16]]]]], [], 2, null, ["loc", [null, [20, 0], [27, 7]]]]],
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
              "line": 62,
              "column": 2
            },
            "end": {
              "line": 69,
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
        statements: [["inline", "workup-set", [], ["selectedIndex", ["subexpr", "@mut", [["get", "selectedIndex", ["loc", [null, [64, 20], [64, 33]]]]], [], []], "model", ["subexpr", "@mut", [["get", "workupSet", ["loc", [null, [65, 12], [65, 21]]]]], [], []], "onComplete", ["subexpr", "action", ["completeEdit"], [], ["loc", [null, [66, 17], [66, 40]]]], "onCancel", ["subexpr", "action", ["cancelEdit"], [], ["loc", [null, [67, 15], [67, 36]]]], "onSelect", ["subexpr", "action", ["select"], [], ["loc", [null, [68, 15], [68, 32]]]]], ["loc", [null, [63, 4], [68, 34]]]]],
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
            "line": 100,
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
        var el2 = dom.createTextNode("\n  .nfoblock {\n    border: solid 1px #bfbfbf;\n  }\n  .row {\n    margin: 0 0 5px 5px;\n  }\n  .column {\n    display: inline-block;\n  }\n  .textright {\n    text-align: right;\n  }\n  .hidden {\n    display: none;\n  }\n  .selected {\n    background-color: #2a8fee;\n  }\n  .editmode input, .editmode select {\n    font-style: italic;\n  }\n  .readonly {\n    background-color: #efefef;\n  }\n  .error {\n    background-color: #ff8080;\n  }\n");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var el3 = dom.createComment("");
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
        var element1 = dom.childAt(fragment, [10]);
        var element2 = dom.childAt(element1, [15]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var element5 = dom.childAt(element2, [5]);
        var element6 = dom.childAt(element2, [7]);
        var element7 = dom.childAt(fragment, [14]);
        var morphs = new Array(16);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 3, 3);
        morphs[2] = dom.createMorphAt(element1, 13, 13);
        morphs[3] = dom.createAttrMorph(element2, 'class');
        morphs[4] = dom.createElementMorph(element3);
        morphs[5] = dom.createAttrMorph(element4, 'disabled');
        morphs[6] = dom.createElementMorph(element4);
        morphs[7] = dom.createAttrMorph(element5, 'disabled');
        morphs[8] = dom.createElementMorph(element5);
        morphs[9] = dom.createAttrMorph(element6, 'disabled');
        morphs[10] = dom.createElementMorph(element6);
        morphs[11] = dom.createMorphAt(dom.childAt(element7, [1]), 3, 3);
        morphs[12] = dom.createMorphAt(dom.childAt(element7, [3]), 3, 3);
        morphs[13] = dom.createMorphAt(dom.childAt(element7, [5]), 3, 3);
        morphs[14] = dom.createMorphAt(dom.childAt(element7, [7]), 3, 3);
        morphs[15] = dom.createMorphAt(dom.childAt(element7, [9]), 3, 3);
        return morphs;
      },
      statements: [["inline", "input", [], ["class", "readonly", "value", ["subexpr", "@mut", [["get", "athleteName", ["loc", [null, [35, 35], [35, 46]]]]], [], []], "readonly", true], ["loc", [null, [35, 4], [35, 62]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "athleteAge", ["loc", [null, [39, 45], [39, 55]]]]], [], []], "readonly", true], ["loc", [null, [39, 4], [39, 71]]]], ["block", "each", [["get", "model.workup.workupSetSheet", ["loc", [null, [62, 10], [62, 37]]]]], [], 0, null, ["loc", [null, [62, 2], [69, 11]]]], ["attribute", "class", ["concat", ["row ", ["subexpr", "if", [["get", "isEditMode", ["loc", [null, [70, 23], [70, 33]]]], "hidden"], [], ["loc", [null, [70, 18], [70, 44]]]]]]], ["element", "action", ["add"], [], ["loc", [null, [71, 12], [71, 28]]]], ["attribute", "disabled", ["get", "isRemoveProhibited", ["loc", [null, [72, 43], [72, 61]]]]], ["element", "action", ["remove"], [], ["loc", [null, [72, 12], [72, 31]]]], ["attribute", "disabled", ["get", "isUpProhibited", ["loc", [null, [73, 39], [73, 53]]]]], ["element", "action", ["up"], [], ["loc", [null, [73, 12], [73, 27]]]], ["attribute", "disabled", ["get", "isDownProhibited", ["loc", [null, [74, 41], [74, 57]]]]], ["element", "action", ["down"], [], ["loc", [null, [74, 12], [74, 29]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "count", ["loc", [null, [81, 45], [81, 50]]]]], [], []], "readonly", true], ["loc", [null, [81, 4], [81, 66]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "duration", ["loc", [null, [85, 45], [85, 53]]]]], [], []], "readonly", true], ["loc", [null, [85, 4], [85, 69]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "averagePulse", ["loc", [null, [89, 45], [89, 57]]]]], [], []], "readonly", true], ["loc", [null, [89, 4], [89, 73]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "estimatedScore", ["loc", [null, [93, 45], [93, 59]]]]], [], []], "readonly", true], ["loc", [null, [93, 4], [93, 75]]]], ["inline", "input", [], ["class", "textright readonly", "value", ["subexpr", "@mut", [["get", "actualScore", ["loc", [null, [97, 45], [97, 56]]]]], [], []], "readonly", true], ["loc", [null, [97, 4], [97, 72]]]]],
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

    if (dataArray.length == 0) return result;

    result.duration = 0;
    result.estimatedScore = 0;
    result.actualScore = 0;

    var weightedPulse = 0;

    dataArray.forEach(function (element) {
      if (element.duration) result.duration = result.duration + element.duration;

      if (element.duration && element.pulse) {
        weightedPulse = weightedPulse + (0, _workupEmberAppUtilsWorkupSetSummary.getWeightedPulse)((0, _workupEmberAppUtilsWorkupSetSummary.getHours)(element.duration), element.pulse);
        result.actualScore = result.actualScore + (0, _workupEmberAppUtilsWorkupSetSummary.getActualScore)(element.duration, element.pulse);
      }

      if (element.duration && element.scoreDencity) result.estimatedScore = result.estimatedScore + (0, _workupEmberAppUtilsWorkupSetSummary.getEstimatedScore)(element.duration, element.scoreDencity);
    }, this);

    result.count = dataArray.length;
    result.averagePulse = weightedPulse / (0, _workupEmberAppUtilsWorkupSetSummary.getHours)(result.duration);

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
  require("workup-ember-app/app")["default"].create({"name":"workup-ember-app","version":"0.0.0+1e22cd3e"});
}

/* jshint ignore:end */
//# sourceMappingURL=workup-ember-app.map
