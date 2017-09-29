// ok.js

function OkParser(post) {

    getPage();

    function getPage() {
        var req = new XMLHttpRequest();
        req.open('GET', post.url, true);
        req.onreadystatechange = parsePage;
        req.send();
    }

    function parsePage(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var pageBody = req.responseText;

            if (!pageBody) {
                notify('Error', 'Error! Cant load page ' + req.responseURL);
                return;
            }
            try {
                // get data for comments request
                var data = {},
                    needleStart = 0,
                    needleEnd = 0;

                data['st.cmd'] = 'altGroupForum';
                data['cmd'] = 'MediaTopicLayerBody';
                data['st.mt.ot'] = 'GROUP_THEME';

                needleStart = pageBody.indexOf('st.groupId=') + 11;
                needleEnd = pageBody.indexOf('",',needleStart);
                data['st.groupId'] = pageBody.substring(needleStart, needleEnd);

                needleStart = pageBody.indexOf('gwtHash:"') + 9;
                needleEnd = pageBody.indexOf('",',needleStart);
                data['gwt.requested'] = pageBody.substring(needleStart, needleEnd);

                needleStart = pageBody.indexOf('/topic/') + 7;
                needleEnd = pageBody.indexOf('",',needleStart);
                data['st.mt.id'] = pageBody.substring(needleStart, needleEnd);

                getComments(data);
            } catch(e) {
                notify('Error', 'Error! Cant allocate post on page ' + e);
                return;
            }
        }
    }

    function getComments(data) {
        var req = new XMLHttpRequest();
        req.open('POST', post.url, true);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = parseComments;
        var params = serialize(data);
        req.send(params);
    }

    function parseComments(event) {
        req = event.target;
        if (req.readyState == 4 && req.status == 200) {
            var response = req.responseText;

            if (!response) {
                notify('Error', 'Error! Cant allocate comments on page ' + req.responseURL);
                return;
            }
            try {
                var xmlString = response,
                    parser = new DOMParser(),
                    doc = parser.parseFromString(xmlString, "text/html")
                    comments = doc.getElementsByClassName('comments_i');
            } catch(e) {
                notify('Error', 'Error! Cant allocate comments on page ' + e);
                return;
            }
            // get comments text
            comments = Array.from(comments);
            comments = comments.map(function(node) {
                var text = node.getElementsByClassName('comments_text')[0]
                    .getElementsByTagName('div')[0]
                    .textContent;
                var mediaBlock = node.getElementsByClassName('media-block media-link__v2')[0];
                if (mediaBlock) {
                    var link = mediaBlock
                        .getAttribute('data-l')
                        .split(',')[5];
                }
                return link
                    ? text + ' ' + link
                    : text;
            });

            var linkFinded = false;
            if (comments.length !== 0) {
                var link = getExtensionSettings('link')
                    pattern = link.replace(/\./g, '\\.');
                    pattern = pattern.replace(/\//g, '\/');
                pattern = pattern.replace(/\*/g, '.*');
                var regEx = new RegExp(pattern);

                comments.forEach(function (comment) {
                    if(comment.search(regEx) != -1) linkFinded = true;
                });
            }
            if(post.hasLink && !linkFinded) {
                post.hasLink = false;
                post.isNotified = false;
                savePostToStorage(post);
            } if (!post.hasLink && linkFinded) {
                post.hasLink = true;
                savePostToStorage(post);
            }
            // debug
            // notify('RESULT', 'linkFinded: '+ linkFinded);
        }
        if(req.status == 404) {
            notify('Error', 'Error! Post ' + req.responseURL + ' not found (404).');
        }
    }
}