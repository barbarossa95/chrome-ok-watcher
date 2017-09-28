// ok.js

function OkParser(post) {

    var url = post.url;

    getPage(post);

    function getPage(post) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
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

                console.log(data);

                return;
            } catch(e) {
                notify('Error', 'Error! Cant allocate post on page ' + e);
                return;
            }
        }
    }

    function parseResponse(event) {
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
                    doc = parser.parseFromString(xmlString, "text/xmlString"); console.log(xmlString);
                console.log(doc);
                return;
            } catch(e) {
                notify('Error', 'Error! Cant allocate comments on page ' + e);
                return;
            }
            //todo get comments
            /*var comments = dom.findElementsBy();*/
            comments = comments.map(function (item) {
                return item.node;
            });
            if (comments.length !== 0) {
                var link = getExtensionSettings('link');

                comments.forEach(function (comment) {
                    post.hasLink = comment.indexOf(link) != -1;
                    if(post.hasLink) return;
                });
            }
            savePostToStorage(post);
        }
        if(req.status == 404) {
            notify('Error', 'Error! Post ' + req.responseURL + ' not found (404).');
        }
    }
}