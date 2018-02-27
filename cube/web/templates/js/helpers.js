// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hash = function() {
    var hash = 0;

    if (this.length > 0) {
        for (var i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
    }

    return hash.toString(16);
}

// https://stackoverflow.com/a/41769531/681182
$.fn.sort = function(sortingFunction) {
    return this.each(function () {
        const children = $(this).children().get();
        children.sort(sortingFunction);
        $(this).append(children);
    });
}
