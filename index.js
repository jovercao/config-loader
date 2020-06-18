const defaultsDeep = require('lodash.defaultsdeep');
const path = require('path');
const fs = require('fs');
const os = require('os');

function load(options = {}, defaultConfig) {
  const {
    variants = {},
    appfile = 'app.config',
    cwdfile = '',
    userfile = '',
    // 自动初始化appFile
    initAppfile = false
  } = options;
  if (!defaultConfig) {
    defaultConfig = options.default || {};
  }
  const isPkg = Reflect.has(process.versions, 'pkg');

  // pkg打包后取exe所在目录，否则取源码上两层(即项目主目录)
  let appRoot;
  if (isPkg) {
    appRoot = path.dirname(process.execPath);
  } else {
    // 如果当前模块在被依赖的路径下，则使用项目主目录
    if (path.basename(path.resolve(__dirname, '..')) === 'node_modules') {
      appRoot = path.resolve(__dirname, '../../');
    } else {
      appRoot = path.dirname(process.execPath);
    }
  }

  let config = defaultConfig;
  function loadConfig(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        const loadedConfig = JSON.parse(fs.readFileSync(filePath));
        config = defaultsDeep(loadedConfig, config);
      } catch (error) {
        const newError = new Error(`读取配置文件${filePath}失败！错误信息：${error.message}`);
        newError.innerError = error;
        throw newError;
      }
    }
  }

  const appConfigFile = path.resolve(appRoot, appfile);
  if (initAppfile && !fs.existsSync(appConfigFile)) {
    fs.writeFileSync(appConfigFile, JSON.stringify(defaultConfig, null, '  '));
  }
  loadConfig(appConfigFile);

  if (userfile) {
    const userConfigFile = path.resolve(os.homedir(), userfile);
    loadConfig(userConfigFile);
  }

  if (cwdfile) {
    const cwdConfgFile = path.resolve(process.cwd(), cwdfile);
    loadConfig(cwdConfgFile);
  }

  if (!config) {
    config = defaultConfig;
    if (process.env.NODE_ENV === 'production') {
      fs.writeFileSync(appConfigFile, JSON.stringify(config));
    }
  }

  Object.assign(variants, {
    appRoot
  });

  const variantHolders = Object.entries(variants).sort(([a], [b]) => b.length - a.length).map(([key, value]) => {
    return [
      new RegExp('\\$\\{' + key + '\\}', 'g'),
      value
    ];
  });

  // 替换配置变量
  function variantReplace(config) {
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'string') {
        for (const [regex, varValue] of variantHolders) {
          value = value.replace(regex, varValue);
        }
        config[key] = value;
      }
      if (typeof value === 'object') {
        variantReplace(value);
      }
    });
  }

  variantReplace(config);
  return config;
}

module.exports = load;

module.exports.default = load;

module.exports.load = load;
