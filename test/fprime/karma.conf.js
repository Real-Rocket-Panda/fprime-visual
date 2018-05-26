module.exports = function (config) {
  config.set({
    browsers: ['visibleElectron'],
    customLaunchers: {
      'visibleElectron': {
        base: 'Electron'
      }
    },
    frameworks: ['mocha', 'chai', 'karma-typescript'],
    files: [
      { pattern: '../../src/fprime/**/*.ts' },
      { pattern: './specs/**/*.spec.ts' }
    ],
    preprocessors: {
      '../../src/fprime/**/*.ts': 'karma-typescript',
      './specs/**/*.spec.ts': 'karma-typescript'
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        module: "commonjs"
      },
      tsconfig: '../../tsconfig.json',
      reports: {
        'text-summary': null,
        'html': {
          directory: './test/fprime/coverage'
        }
      }
    },
    reporters: ['progress', 'karma-typescript'],
    singleRun: true
  });
};
