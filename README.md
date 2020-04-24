# 配置加载器

该工具用于自动加载不同级别的配置文件，并将其合并成运行所需的配置文件。

## 配置文件

配置文件均采用JSON的格式，配置共有以下四个：

- default，默认配置，通过对象传递
- appfile, 放在应用程序所在目录的配置文件，加载器会自动查找，存放在可执行文件目录（如果通过pkg打包），或者项目源码主目录
- userfile, 放在用户主目录的配置文件
- cwdfile, 放在工作目录配置文件
  
加载配置覆盖优先级： cwdfile > userfile > appfile

## 使用方式

**安装：**

```shell
npm install @jovercao/config-loader
```

**调用：**

```js
import load from '@jovercao/config-loader'

const defaultConfig = {
  settings1: '这是设置1',
  settings2: '这是设置2'
}

const variants = {
  var1: '这是变量1的值',
  var2: '这是变量2的值'
}

let config
if (process.env.NODE_ENV === 'developement') {
  config = load({
    default: defaultConfig,
    variants,
    appfile: 'app.config.dev.json',
    pwdfile: '.appname.config.dev.json',
    userfile: '.appname.config.dev.json'
  })
} else {
  config = load({
    default: defaultConfig,
    variants,
    appfile: 'app.config.json',
    pwdfile: '.appname.config.json',
    userfile: '.appname.config.json'
  })
}
```

查看范例

## api

### load(options)

加载配置文件中的配置

**options**

选项

**options.default**

默认配置，通过对象传递，而非路径

**options.variants**

object 类型，存放变量的对象，加载器将用该对象中的属性`varName`替换值为字符串的配置项中格式为`${varName}`的内容。

**options.appfile**

string 类型，指定应用程序配置文件的文件名，默认文件名为`app.config.json`

**options.userfile**

string 类型，指定用户配置文件的文件名，不指定时将不加载用户配置文件

**options.cwdfile**

string 类型，指定工作路径配置文件的文件名，不指定时将不加载，不指定时将不加载工作路径配置文件
