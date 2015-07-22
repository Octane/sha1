'use strict';

new function () {
    function onSettled(item) {
        var file = item.file;

        results.insertAdjacentHTML('beforeend', [
            '<div class="file">',
                '<span class="file__name">',
                    file.name,
                '</span>',
                '<span class="file__error">',
                    item.error && item.error.message,
                '</span>',
                '<span class="file__sha1">',
                    item.sha1HexadecimalString,
                '</span>',
                '<span class="file__size">',
                    'size: ' + Math.round(file.size / 1024) + 'KB, ',
                '</span>',
                '<span class="file__read-time">',
                    'read time: ' + item.readTime.toFixed(2) + 'ms, ',
                '</span>',
                '<span class="file__sha1-time">',
                    'SHA-1 time: ' + item.sha1Time.toFixed(2) + 'ms, ',
                '</span>',
                '<span class="file__time">',
                    'time: ' + (item.readTime + (item.sha1Time || 0)).toFixed(2) + 'ms',
                '</span>',
            '</div>'
        ].join(''));
    }

    function preventDefault(event) {
        event.preventDefault();
    }

    function onDrop(event) {
        var files = event.dataTransfer.files;
        var fileCount = files.length;
        var i;

        event.preventDefault();

        for (i = 0; i < fileCount; i++) {
            sha1(files[i]).then(onSettled, onSettled);
        }
    }

    var dropZone = document.querySelector('.drop-zone');
    var results = document.querySelector('.results');

    dropZone.addEventListener('drop', onDrop);
    dropZone.addEventListener('dragend', preventDefault);
    dropZone.addEventListener('dragover', preventDefault);
};
