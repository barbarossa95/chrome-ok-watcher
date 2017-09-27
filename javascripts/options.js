function loadExtensionInfo() {
    $(document).ready(function() {
        var targets = localStorage.targets;
        $('#targets').val(targets || "");

        var watcherSettings = JSON.parse(localStorage.watcherSettings);
        $('#botToken').val(watcherSettings['botToken'] || "");
        $('#tgUserId').val(watcherSettings['tgUserId'] || "");
        $('#interval').val(watcherSettings['interval'] || "");
        $('#link').val(watcherSettings['link'] || "");
        $('#messageTemplate').val(watcherSettings['messageTemplate'] || "");
    });
}

function save() {
    localStorage.targets = $('#targets').val() || "";

    var watcherSettings = JSON.parse(localStorage.watcherSettings);
    watcherSettings['botToken'] = $('#botToken').val() || "";
    watcherSettings['tgUserId'] = $('#tgUserId').val() || "";
    watcherSettings['interval'] = $('#interval').val() || "";
    watcherSettings['link']     = $('#link').val() || "";
    watcherSettings['messageTemplate'] = $('#messageTemplate').val() || "";
    localStorage.watcherSettings = JSON.stringify(watcherSettings);
    // sync settings to google cloud
    chrome.storage.sync.set({
        'watcherSettings'       : localStorage.settings,
        'targets'               : localStorage.targets,
        'posts'                 : localStorage.posts
    }, function() {});
}


document.addEventListener('DOMContentLoaded', function () {
    var isActive = getExtensionSettings('isActive');

    $btnSwitch = $('#btn-switch');

    $btnSwitch.val(isActive ? "Stop" : "Start");

    $('#targets').bind('input propertychange', function() {
        var targets = $('#targets').val();
        targets = $('#targets').val() || "";
        localStorage.targets = targets;
        chrome.storage.sync.set({
            'targets'                 : localStorage.targets
    }, function() {});
    });

    $('#btn-save').click(function() {
        save();
        notify("Ok-watcher", "The configuration has been saved!");
    });

    $('#btn-switch').click(function() {
        var isActive = getExtensionSettings('isActive');
        editExtensionSettings('isActive', !isActive);
        setExtensionIcon();
        $btnSwitch.html(isActive ? "Start" : "Stop");
        if (isActive) {
            notify("Ok-watcher", "Ok-watcher stoped.");
            resetCounter();
        } else {
            notify("Ok-watcher", "Ok-watcher started.");
        }
    });
});

loadExtensionInfo();