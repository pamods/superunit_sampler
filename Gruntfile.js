var spec = require('./lib/spec')
var Path = require('path')

var serverModPath = '../../server_mods/com.wondible.pa.superunit_sampler.server/'
var clientModPath = '../../mods/com.wondible.pa.superunit_sampler.client/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var units = [
  {
    name: 'orbital_battleship',
    unit: '/pa/units/orbital/orbital_battleship/orbital_battleship.json',
    server_mod_path: '../../server_mods/com.elodea.battleship.minimod/',
    unit_path: 'pa/units/orbital/orbital_battleship/*',
    build: ['orbital', 0],
    description: 'Experimental T3 orbital battleship which can shoot energy bombs at people using alt fire.  Built by orbital factory.',
  },
  {
    name: 'bot_bomb_adv',
    unit: '/pa/units/land/bot_bomb_adv/bot_bomb_adv.json',
    server_mod_path: 'template/bBoomBotWars/',
    unit_path: 'pa/units/land/bot_bomb_adv/*',
    build: ['ammo', 9],
    description: 'Giant Boom Bot that can build regular boom bots, and explodes like a nuke with an explicit attack command.  Built by the advanced vehicle factory.',
  },
  {
    name: 'tesla_dox',
    unit: '/pa/units/land/tesla_dox/tesla_dox.json',
    server_mod_path: '../../server_mods/com.pa.killerkiwijuice.doxlyf/',
    unit_path: 'pa/units/land/tesla_dox/*',
    client_mod_path: '../../mods/com.pa.doxlyf.ui/',
    build: ['ammo', 8],
    description: 'Flying bot that arcs electricty at enemies. Built by adv. combat fabber.',
  },
  {
    name: 'mb3',
    unit: '/pa/units/air/mb3/mb3.json',
    server_mod_path: '../../server_mods/com.stuart98.galacticannihilation/',
    unit_path: 'pa/units/air/mb3/*',
    si_name: 'uber',
    build: ['factory', 4],
    description: 'Type Uber Gunship. The Perdition has a heavy railgun battery along with four heavy cannons and four light RPG launchers, allowing it to devastate armies and individual targets alike. It has sub-par anti-air, however, and thus requires an escort to operate properly. Built by advanced fabricators.',
  },
  {
    name: 'Xmb1',
    unit: '/pa/units/land/Xmb1/Xmb1.json',
    server_mod_path: '../../server_mods/com.zx.pa.modxs/',
    unit_path: 'pa/units/land/Xmb1/*',
    client_mod_path: '../../mods/com.zx.pa.modxc/',
    build: ['ammo', 7],
    description: 'Quake tank has a high speed laser and area effect plasma cannon.  Built by any fabbricator.',
    copy: {
      modx_textures: {
        files: [{
          expand: true,
          src: [
            'pa/units/land/Xmb1/*',
          ],
          cwd: '../../mods/com.zx.pa.modxc.part2/',
          dest: './',
        }]
      },
    }
  },
]

var authorNames = function() {
  var names = ['wondible']
  units.forEach(function(unit) {
    var authors = unit.author.split(/, */)
    authors.forEach(function(name) {
      if (names.indexOf(name) == -1) {
        names.push(name)
      }
    })
  })
  return names
}

module.exports = function(grunt) {
  // Project configuration.
  console.log(media)
  var config = {
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/**',
              'pa/**'],
            dest: serverModPath,
          },
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/main/atlas/**',
              'ui/mods/**'],
            dest: clientModPath,
          },
        ],
      }, 
      server_modinfo: {
        files: [
          {
            src: ['modinfo.json'],
            dest: serverModPath,
          },
        ],
        options: {
          process: function(content, srcpath) {
            var info = JSON.parse(content)
            delete info.scenes
            info.author = authorNames().join(', ')
            info.date = require('dateformat')(new Date(), 'yyyy/mm/dd')
            console.log(info.display_name, info.identifier, info.version, info.date)
            return JSON.stringify(info, null, 2)
          }
        }
      },
      client_modinfo: {
        files: [
          {
            src: ['modinfo.json'],
            dest: clientModPath,
          },
        ],
        options: {
          process: function(content, srcpath) {
            var info = JSON.parse(content)
            info.context = 'client'
            info.display_name = "Superunit Sampler Icons"
            info.author = authorNames().join(', ')
            info.date = require('dateformat')(new Date(), 'yyyy/mm/dd')
            info.identifier = info.identifier.replace('server', 'client')
            info.category = ['strategic-icons', 'client-side-complementary'],
            console.log(info.display_name, info.identifier, info.version, info.date)
            return JSON.stringify(info, null, 2)
          }
        }
      },
      images: {
        files: [],
      },
      build: {
        files: [
          {
            expand: true,
            src: 'ui/main/shared/js/build.js',
            cwd: media,
            dest: './',
          }
        ],
        options: {
          process: function(content, path) {
            content = content.replace(
              '"/pa/units/land/nuke_launcher/nuke_launcher_ammo.json": ["ammo", 14],\n',
              '"/pa/units/land/nuke_launcher/nuke_launcher_ammo.json": ["ammo", 14],\n' +
              units.map(function(unit) {
                return '            "' + unit.unit + '": ' + JSON.stringify(unit.build)
              }).join(',\n')) + '\n'
            return content
          },
        },
      },
      license: {
        files: [
          {
            src: 'template/LICENSE-Apache-2.0',
            dest: 'LICENSE.txt',
          }
        ],
        options: {
          process: function(content, path) {
            return units.map(function(unit) {
              return unit.name +
                ' from ' + unit.mod_name +
                ' by ' + unit.author +
                '\n' + unit.forum +
                '\nUsed with Permission'
            }).join('\n\n') +
              '\n\nPortions derivitive works of Planetary Annihilation by Uber Entertainment\n' + content
          },
        },
      },
    },
    clean: ['pa', 'ui', serverModPath, clientModPath],
    proc: {
      unit_list: {
        targets: [
          'pa/units/unit_list.json'
        ],
        process: function(spec) {
          units.forEach(function(unit) {
            spec.units.push(unit.unit)
          })
        }
      },
      bot_bomb: {
        targets: [
          'pa/units/land/bot_bomb/bot_bomb.json'
        ],
        process: function(spec) {
          spec.area_build_type = "Sphere"
          spec.unit_types.push("UNITTYPE_Custom1")
        }
      },
    }
  };


  units.forEach(function(unit) {
    if (!unit.si_name) {
      unit.si_name = unit.name
    }
    if (!unit.strategic_icon_path) {
      unit.strategic_icon_path = 'ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_' + unit.si_name + '.png'
    }
    if (!unit.build_icon_path) {
      unit.build_icon_path = 'ui/main/game/live_game/img/build_bar/units/' + unit.name + '.png'
    }

    var modinfo = grunt.file.readJSON(Path.join(unit.server_mod_path, 'modinfo.json'))
    if (!unit.author) unit.author = modinfo.author
    if (!unit.mod_name) unit.mod_name = modinfo.display_name
    if (!unit.forum) unit.forum = modinfo.forum

    config.copy.images.files.push({
      expand: true,
      src: [
        unit.build_icon_path,
      ],
      cwd: unit.server_mod_path,
      dest: './',
    })
    config.copy.images.files.push({
      expand: true,
      src: [
        unit.strategic_icon_path,
      ],
      cwd: unit.client_mod_path || unit.server_mod_path,
      dest: './',
    })

    if (unit.copy) {
      Object.keys(unit.copy).forEach(function(key) {
        config.copy[key] = unit.copy[key]
      })
    }
  })

  var rePath = /"\/(pa\/[^"]+)"/g
  var findPaths = function(content) {
    var match
    var results = []
    while (match = rePath.exec(content)) {
      results.push(match[1])
    }
    return results
  }

  var explodeUnitFiles = function(unit) {
    var todo = grunt.file.expand({cwd: unit.server_mod_path}, unit.unit_path)
    var done = []
    var path
    while (path = todo.shift()) {
      var src = Path.join(unit.server_mod_path, path)
      if (path.match('\.json')) {
        var content = grunt.file.read(src)
        grunt.file.write(path, content)

        var ref = findPaths(content)
        ref.forEach(function(p) {
          if (p != path
           && todo.indexOf(p) == -1
           && done.indexOf(p) == -1
           && grunt.file.exists(Path.join(unit.server_mod_path, p))) {
            todo.push(p)
          }
        })
      } else {
        grunt.file.copy(Path.join(unit.server_mod_path, path), path)
      }
      done.push(path)
    }
    var done = []
  }

  //console.log(JSON.stringify(config, null, 2))

  grunt.initConfig(config)

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  grunt.registerTask('copyunits', function() {
    units.forEach(explodeUnitFiles)
  })

  grunt.registerTask('atlas', function() {
    var ids = units.map(function(unit) {return unit.si_name})
    grunt.file.write('ui/mods/superunit_sampler/icon_atlas.js',
      'model.strategicIcons(model.strategicIcons().concat(' + JSON.stringify(ids) + '))'
    )
  })

  grunt.registerTask('readme', function() {
    var content = grunt.file.read('README.md')
    var desc = units.map(function(unit) {
      return unit.name +
        ' from [' + unit.mod_name + '](' + unit.forum + ')' +
        ' by ' + unit.author +
        '\n' + unit.description
    }).join('\n\n')
    content = content.replace(
      /## Units\n\n.*----/g,
      '## Units\n\n' + desc + '\n\n----')
    grunt.file.write('README.md', content)
  })

  grunt.registerTask('local', ['copyunits', 'copy:modx_textures', 'copy:images', 'copy:build', 'copy:license', 'atlas', 'proc'])
  grunt.registerTask('mod', ['copy:mod', 'copy:server_modinfo', 'copy:client_modinfo']);

  // Default task(s).
  grunt.registerTask('default', ['local', 'mod']);

};

