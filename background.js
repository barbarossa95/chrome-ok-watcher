function initStorage() {
    var watcherSettings = {
            'isActive'          : false,
            'botToken'          : null,
            'tgUserId'          : null,
            'link'              : 'http://*.ru',
            'interval'          : 0.1,
            'messageTemplate'   : 'Post: {{URL}} missed link: {{LINK}}'
    };
    localStorage.watcherSettings = JSON.stringify(watcherSettings);
    localStorage.targets = '';
    localStorage.posts = '';
    localStorage.requestCounter = 0;
    chrome.storage.sync.set({
        'watcherSettings'   : localStorage.watcherSettings,
        'targets'           : localStorage.targets,
        'posts'             : localStorage.posts
    }, function() {});
}

//get extension interval setting and run update callback on timeout
function getUpdates() {
    var isActive = getExtensionSettings('isActive');
    if (isActive) {
        increaseCounter();
        var targets = localStorage.targets.split('\n');
        for (var i = targets.length - 1; i >= 0; i--) {
            var url = targets[i];
            var site = '';

            if (url.search(/(?:(?:http|https):\/\/)?(?:www.)?ok.ru\/(group\/)?(?:[\w]*\/)topic(?:\/[\d]*)/g) == -1) {
                //skip target if not ok.ru site
                continue;
            }
            //get post from local storage or create new
            post = getPostFromStorageOrCreate(url);

            OkParser(post);
        }
        setTimeout(function() {
            notifyByTelegram(targets);
        }, 1000 * 60 * 0.1);
    }
    var interval = getExtensionSettings('interval');
    setTimeout(getUpdates, 1000 * 60 * interval);
}

function onInstalled() {
    initStorage();
    setExtensionIcon();
}

function onStartup() {
    // sync extension settings since google cloud
    chrome.storage.sync.get('watcherSettings', function(val) {
        if (typeof val.watcherSettings !== "undefined"
            && typeof val.targets !== "undefined") {
            localStorage.watcherSettings = val.watcherSettings;
            localStorage.targets = val.targets;
            localStorage.posts = val.posts || "";
        } else {
            initStorage();
        }
        setExtensionIcon();
        getUpdates();
    });
};

chrome.runtime.onInstalled.addListener(onInstalled);

//open options.html page on extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    gotoPage('options.html');
});

onStartup();