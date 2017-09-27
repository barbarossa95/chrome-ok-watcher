// ok.js

function OkParser(post) {

    var url = post.url;

    getComments(post);

    function getComments(post) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = parseResponse;
        req.send();
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