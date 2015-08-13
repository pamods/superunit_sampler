var spec = require('./lib/spec')
var Path = require('path')

var modPath = '../../server_mods/com.wondible.pa.superunit_sampler/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var units = [
  {
    name: 'orbital_battleship',
    unit: '/pa/units/orbital/orbital_battleship/orbital_battleship.json',
    mod_path: '../../server_mods/com.elodea.battleship.minimod/',
    unit_path: 'pa/units/orbital/orbital_battleship/*',
    build: ['orbital', 0],
  },
  /*{
    name: 'bot_bomb_adv',
    unit: '/pa/units/land/bot_bomb_adv/bot_bomb_adv.json',
    mod_path: '../../server_mods/com.pa.burntcustard.bBoomBotWars/',
    unit_path: 'pa/units/land/bot_bomb_adv/*',
    build: ['bot', 0],
  },*/
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
      units: {
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

    var modinfo = grunt.file.readJSON(Path.join(unit.mod_path, 'modinfo.json'))
    if (!unit.author) unit.author = modinfo.author
    if (!unit.mod_name) unit.mod_name = modinfo.display_name
    if (!unit.forum) unit.forum = modinfo.forum

    config.copy.units.files.push({
      expand: true,
      src: [
        unit.unit_path,
        unit.strategic_icon_path,
        unit.build_icon_path,
      ],
      cwd: unit.mod_path,
      dest: './',
    })
  })

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

  // Default task(s).
  grunt.registerTask('default', ['copy:units', 'copy:build', 'copy:license', 'proc', 'copy:mod']);

};
