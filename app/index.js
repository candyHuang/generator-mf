'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var yeoman = require('yeoman-generator');
var rimraf = require('rimraf');
var debug = require('debug');
var tmpPath = __dirname;
var proto;

module.exports = Generator;

function Generator(args, options, config) {
    yeoman.Base.apply(this, arguments);
    this.type = 'jsp';
    console.log(path.resolve(tmpPath, 'init'));
}

util.inherits(Generator, yeoman.Base);

proto = Generator.prototype;

// 获取模板
proto._getTemplate = function(callback) {
  var cacheTemplate = path.resolve(tmpPath, 'init'),
      archive = 'https://codeload.github.com/candyHuang/mf-template-' + this.type + '/tar.gz/master';

  callback = callback || function () {};

  if (this.options.clean) {
      debug('[getTemplate] clean cache template');
      rimraf.sync(cacheTemplate);
  }

  if (fs.existsSync(cacheTemplate)) {
      debug('[getTemplate] find cache template');
      return callback.call(this, null, cacheTemplate);
  }

  debug('[getTemplate] get template from %s', archive);
  this.extract(archive, cacheTemplate, function (err) {
      callback.call(this, err, cacheTemplate);
  });
}

// copy 同名文件夹
proto._copyDir = function(dir) {
  if (dir) {
    this.fs.copy(
      this.templatePath(dir),
      this.destinationPath(dir)
    )
  }
}

proto.askAuthor = function(){
    var done = this.async();
    var prompts = [
      {
        name: 'author',
        message: 'author of component:',
        default: 'defaultName'
      },{
        name: 'email',
        message: 'email of author:',
        default: 'kissy-team@gmail.com'
      }
    ];

    this.prompt(prompts, function (props) {
        this.author = props.author;
        this.email = props.email;

        debug('[prepare] project author: %s', this.author);

        // 下载模板
        this._getTemplate(function (err, template) {
            if (err) return done(err);
            // this.sourceRoot(template);
            this.sourceRoot(path.resolve(template, 'mf-template-'+this.type+'-master'))
            done();
        }.bind(this));
    }.bind(this));
}

proto.dotFiles = function () {
    debug('[dotFiles]');
    this.template('_gitignore', '.gitignore');
    this.template('_jshintrc', '.jshintrc');
};

proto.meta = function () {
    debug('[meta]');
    this.template('_package.json', 'package.json');
    this.fs.copy(
      this.templatePath('fis-conf.js'),
      this.destinationPath('fis-conf.js')
    );
};

proto.scaffold = function() {
  debug('[scaffold]');

  this._copyDir('page');
  this._copyDir('static');
  this._copyDir('test');
  this._copyDir('widget');
  this._copyDir('WEB-INF');
}

proto.install = function() {
  this.npmInstall();
}

