var spec = require('./lib/spec')
var Path = require('path')

var modPath = '../../server_mods/com.wondible.pa.superunit_sampler/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var units = [
  {
    name: 'orbital_battleship',
    unit: '/pa/units/orbital/orbital_battleship/orbital_battleship.json',
    server_mod_path: '../../server_mods/com.elodea.battleship.minimod/',
    unit_path: 'pa/units/orbital/orbital_battleship/*',
    build: ['orbital', 0],
  },
  /*{
    name: 'bot_bomb_adv',
    unit: '/pa/units/land/bot_bomb_adv/bot_bomb_adv.json',
    server_mod_path: '../../server_mods/com.pa.burntcustard.bBoomBotWars/',
    unit_path: 'pa/units/land/bot_bomb_adv/*',
    build: ['bot', 0],
  },*/
  {
    name: 'tesla_dox',
    unit: '/pa/units/land/tesla_dox/tesla_dox.json',
    server_mod_path: '../../server_mods/com.pa.killerkiwijuice.doxlyf/',
    unit_path: 'pa/units/land/tesla_dox/*',
    client_mod_path: '../../mods/com.pa.doxlyf.ui/',
    strategic_icon_path: 'ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_tesla_dox.png',
    build: ['ammo', 8],
  },
  {
    name: 'mb3',
    unit: '/pa/units/air/mb3/mb3.json',
    server_mod_path: '../../server_mods/com.stuart98.galacticannihilation/',
    unit_path: 'pa/units/air/mb3/*',
    strategic_icon_path: 'ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_uber.png',
    build: ['factory', 4],
  },
]

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
            dest: modPath,
          },
        ],
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
    clean: ['pa', modPath],
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
      }
    }
  };


  units.forEach(function(unit) {
    if (!unit.strategic_icon_path) {
      unit.strategic_icon_path = 'ui/main/atlas/icon_atlas/img/strategic_icons/icon_si_' + unit.name + '.png'
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

  // Default task(s).
  grunt.registerTask('default', ['copyunits', 'copy:images', 'copy:build', 'copy:license', 'proc', 'copy:mod']);

};

