define('workup-ember-app/tests/app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass jshint.');
  });
});
define('workup-ember-app/tests/components/workup-set.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - components/workup-set.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/workup-set.js should pass jshint.');
  });
});
define('workup-ember-app/tests/controllers/workup.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/workup.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/workup.js should pass jshint.');
  });
});
define('workup-ember-app/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('workup-ember-app/tests/helpers/destroy-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('workup-ember-app/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'workup-ember-app/tests/helpers/start-app', 'workup-ember-app/tests/helpers/destroy-app'], function (exports, _qunit, _workupEmberAppTestsHelpersStartApp, _workupEmberAppTestsHelpersDestroyApp) {
  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _workupEmberAppTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }

        (0, _workupEmberAppTestsHelpersDestroyApp['default'])(this.application);
      }
    });
  };
});
define('workup-ember-app/tests/helpers/module-for-acceptance.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('workup-ember-app/tests/helpers/resolver', ['exports', 'workup-ember-app/resolver', 'workup-ember-app/config/environment'], function (exports, _workupEmberAppResolver, _workupEmberAppConfigEnvironment) {

  var resolver = _workupEmberAppResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _workupEmberAppConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _workupEmberAppConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('workup-ember-app/tests/helpers/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('workup-ember-app/tests/helpers/start-app', ['exports', 'ember', 'workup-ember-app/app', 'workup-ember-app/config/environment'], function (exports, _ember, _workupEmberAppApp, _workupEmberAppConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _workupEmberAppConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _workupEmberAppApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('workup-ember-app/tests/helpers/start-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define('workup-ember-app/tests/integration/components/workup-set-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('workup-set', 'Integration | Component | workup set', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.4.6',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 14
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'workup-set', ['loc', [null, [1, 0], [1, 14]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'fragmentReason': false,
            'revision': 'Ember@2.4.6',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.4.6',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'workup-set', [], [], 0, null, ['loc', [null, [2, 4], [4, 19]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('workup-ember-app/tests/integration/components/workup-set-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - integration/components/workup-set-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/workup-set-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/models/athlete-unit.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/athlete-unit.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/athlete-unit.js should pass jshint.');
  });
});
define('workup-ember-app/tests/models/athlete.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/athlete.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/athlete.js should pass jshint.');
  });
});
define('workup-ember-app/tests/models/exercise.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/exercise.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/exercise.js should pass jshint.');
  });
});
define('workup-ember-app/tests/models/workout-set.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/workout-set.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/workout-set.js should pass jshint.');
  });
});
define('workup-ember-app/tests/models/workout.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - models/workout.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/workout.js should pass jshint.');
  });
});
define('workup-ember-app/tests/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass jshint.');
  });
});
define('workup-ember-app/tests/router.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass jshint.');
  });
});
define('workup-ember-app/tests/routes/component.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/component.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/component.js should pass jshint.');
  });
});
define('workup-ember-app/tests/routes/workup.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/workup.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/workup.js should pass jshint.');
  });
});
define('workup-ember-app/tests/test-helper', ['exports', 'workup-ember-app/tests/helpers/resolver', 'ember-qunit'], function (exports, _workupEmberAppTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_workupEmberAppTestsHelpersResolver['default']);
});
define('workup-ember-app/tests/test-helper.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/controllers/workup-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('controller:workup', 'Unit | Controller | workup', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
});
define('workup-ember-app/tests/unit/controllers/workup-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/controllers/workup-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/workup-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/models/athlete-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('athlete', 'Unit | Model | athlete', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('workup-ember-app/tests/unit/models/athlete-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/athlete-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/athlete-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/models/athlete-unit-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('athlete-unit', 'Unit | Model | athlete unit', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('workup-ember-app/tests/unit/models/athlete-unit-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/athlete-unit-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/athlete-unit-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/models/exercise-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('exercise', 'Unit | Model | exercise', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('workup-ember-app/tests/unit/models/exercise-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/exercise-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/exercise-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/models/workout-set-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('workout-set', 'Unit | Model | workout set', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('workup-ember-app/tests/unit/models/workout-set-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/workout-set-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/workout-set-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/models/workout-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForModel)('workout', 'Unit | Model | workout', {
    // Specify the other units that are required for this test.
    needs: []
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var model = this.subject();
    // let store = this.store();
    assert.ok(!!model);
  });
});
define('workup-ember-app/tests/unit/models/workout-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/models/workout-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/workout-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/routes/component-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:component', 'Unit | Route | component', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('workup-ember-app/tests/unit/routes/component-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/routes/component-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/component-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/routes/workup-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:workup', 'Unit | Route | workup', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('workup-ember-app/tests/unit/routes/workup-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/routes/workup-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/workup-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/utils/workup-set-summary-test', ['exports', 'workup-ember-app/utils/workup-set-summary', 'qunit'], function (exports, _workupEmberAppUtilsWorkupSetSummary, _qunit) {

  (0, _qunit.module)('Unit | Utility | workup set summary');

  // Replace this with your real tests.
  (0, _qunit.test)('it works', function (assert) {
    var result = (0, _workupEmberAppUtilsWorkupSetSummary['default'])();
    assert.ok(result);
  });
});
define('workup-ember-app/tests/unit/utils/workup-set-summary-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/utils/workup-set-summary-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/utils/workup-set-summary-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/unit/utils/workup-summary-test', ['exports', 'workup-ember-app/utils/workup-summary', 'qunit'], function (exports, _workupEmberAppUtilsWorkupSummary, _qunit) {

  (0, _qunit.module)('Unit | Utility | workup summary');

  // Replace this with your real tests.
  (0, _qunit.test)('it works', function (assert) {
    var result = (0, _workupEmberAppUtilsWorkupSummary['default'])();
    assert.ok(result);
  });
});
define('workup-ember-app/tests/unit/utils/workup-summary-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/utils/workup-summary-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/utils/workup-summary-test.js should pass jshint.');
  });
});
define('workup-ember-app/tests/utils/workup-set-summary.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - utils/workup-set-summary.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'utils/workup-set-summary.js should pass jshint.');
  });
});
define('workup-ember-app/tests/utils/workup-summary.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - utils/workup-summary.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'utils/workup-summary.js should pass jshint.');
  });
});
/* jshint ignore:start */

require('workup-ember-app/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map
