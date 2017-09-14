"use strict";

var packager = require('electron-packager');
var path = require('path');
var _platform = require('os').platform();

if (_platform === 'win32') {
    var winInstaller = require('electron-winstaller');
} else if (_platform === 'darwin') {
    var dmgInstaller = require('electron-installer-dmg');
} else if (_platform === 'linux') {
    var debInstaller = require('electron-installer-debian');
}

const pkg = require('./package.json');
const argv = require('minimist')(process.argv.slice(1));

const appName = argv.name || pkg.name;
const buildVersion = pkg.version || '1.0';
const shouldUseAsar = argv.asar || false;
const shouldBuildAll = argv.all || false;
const arch = argv.arch || 'all';
const platform = argv.platform || 'darwin';

const DEFAULT_OPTS = {
    dir: './dist',
    name: appName,
    asar: shouldUseAsar,
    buildVersion: buildVersion
};


pack(platform, arch, function done(err, appPath) {
    if (err) {
        console.log(err);
    } else {
        console.log('Application packaged successfuly!', appPath);
        if (platform === 'darwin') {
            var options = {
                appPath: appPath[0],
                name: DEFAULT_OPTS.name,
                icon: `${DEFAULT_OPTS.dir}/assets/icons/visit@256.png`
            }
            dmgInstaller(options, function done(err){ console.log(err) });
        } else if (platform === 'win32') {
            console.log(appPath)
            var resultPromise = winInstaller.createWindowsInstaller({
                appDirectory: appPath[0],
                outputDirectory: './app-builds/',
                authors: 'github.com/gemoroy',
                version: DEFAULT_OPTS.buildVersion,
                exe: `${DEFAULT_OPTS.name}.exe`,
                iconUrl: `file:///${DEFAULT_OPTS.dir}/favicon.ico`,
                setupIcon: path.join(DEFAULT_OPTS.dir, 'favicon.ico')
            });
            resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
        } else if (platform === 'linux') {
            var options = {
                src: appPath[0],
                dest: './app-builds/',
                arch: 'amd64',
                icon: `${DEFAULT_OPTS.dir}/assets/icons/visit@256.png`,
                "categories": [
                    "Utility"
                ]
            }
            debInstaller(options, function (err) {
                if (err) {
                    console.error(err, err.stack)
                    process.exit(1)
                }
                console.log('Successfully created package at ' + options.dest)
            })
        }
    }

});

function pack(plat, arch, cb) {
    // there is no darwin ia32 electron
    if (plat === 'darwin' && arch === 'ia32') return;

    let icon = 'src/favicon';

    if (icon) {
        DEFAULT_OPTS.icon = icon + (() => {
            let extension = '.png';
            if (plat === 'darwin') {
                extension = '.icns';
            } else if (plat === 'win32') {
                extension = '.ico';
            }
            return extension;
        })();
    }

    const opts = Object.assign({}, DEFAULT_OPTS, {
        platform: plat,
        arch,
        prune: true,
        overwrite: true,
        all: shouldBuildAll,
        out: `app-builds`
    });

    console.log(opts)
    packager(opts, cb);
}
