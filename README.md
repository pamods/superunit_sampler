# Superunit Sampler

Add a dash of bold flavor to your vanialla PA games.

Provides a selection of experimental/T3/super/mega/uber units in a format that can be added to an otherwise standard game.

## Development

The generated project includes a `package.json` that lists the dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt mod` will copy the mod files to `../../server_mods/identifier` and `../../mods/identifier`, you can change the `serverModPath` and `clientModPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

There are a large number of subtasks which I won't attempt to duplicate here. The major ones:

- clean - delete the local working directories (pa, ui), and with --force the output server and client mod directories.  (Without --force, grunt will not delete files outside the project directory.  This is a safety measure, so please make sure your target paths are correctly configured before running.)
- local - copy units and support files into working directories
- mod - copy the mod files into `server_mods` and `mods`
- default: local, mod
