function initStorage() {
    var watcherSettings = {
            'isActive'          : false,
            'botToken'          : null,
            'tgUserId'          : null,
            'link'              : null
            'interval'          : 1,
            'messageTemplate'   : 'Post: {{URL}} Message: {{MESSAGE}}'
    };
    localStorage.watcherSettings = JSON.stringify(watcherSettings);
    localStorage.targets = '';
    localStorage.posts = '';
    localStorage.requestCounter = 0;
    chrome.storage.sync.set({
        'watcherSettings'   : localStorage.watcherSettings,
        'targets'               : localStorage.targets,
        'posts'                 : localStorage.posts
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
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?') !== -1) {
                site = 'facebook';
            }
            if (url.search('(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_]+)') !== -1) {
                site = 'instagram';
            }
            post = getPostFromStorage(url);
            if (!post) {
                post = {
                    id: 0,
                    url: url,
                    comments: null,
                    syncDate: null
                }
            }
            switch (site) {
                case 'facebook': FacebookParser(post); break;
                case 'instagram': InstagramParser(post); break;
                default: continue;
            }
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
    setCommentatorIcon();
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
        setCommentatorIcon();
        getUpdates();
    });
};

chrome.runtime.onInstalled.addListener(onInstalled);

//open options.html page on extension icon click
chrome.browserAction.onClicked.addListener(function(tab) {
    gotoPage('options.html');
});

onStartup();
