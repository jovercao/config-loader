const os = require('os');
const assert  = require('assert');
const defaultsdeep = require('lodash.defaultsdeep');

os.homedir = () => __dirname;
process.cwd = () => __dirname;
process.execPath = __filename;

describe('测试', () => {
  it('load', () => {
    const appConfig = require('./app.config.json');
    const cwdConfig = require('./cwd.config.json');
    const userConfig = require('./user.config.json');

    const defaultConfig = {
      pathConfig: '变量替换配置：这是变量1: ${var1},这是变量2: ${var2}',
      settings1: '默认配置1',
      settings2: '默认配置2',
      settings3: '默认配置3',
      settings4: '默认配置4'
    };

    const variants = {
      var1: '变量1',
      var2: '变量2'
    };

    const config = require('../index').load({
      default: defaultConfig,
      variants,
      appfile: 'app.config.json',
      cwdfile: 'cwd.config.json',
      userfile: 'user.config.json'
    });

    const except = defaultsdeep(cwdConfig, userConfig, appConfig, defaultConfig);
    except.pathConfig = defaultConfig.pathConfig.replace('${var1}', variants.var1).replace('${var2}', variants.var2);
    assert.deepEqual(config, except);
  });
});
