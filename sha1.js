'use strict';

var sha1 = new function () {
    function convertArrayBufferToHexadecimalString(arrayBuffer) {
        var dataView = new DataView(arrayBuffer);
        var byteLength = dataView.byteLength;
        var result = '';
        var hexStr;
        var i;

        for (i = 0; i < byteLength; i++) {
            hexStr = dataView.getUint8(i).toString(16);

            if (hexStr.length < 2) {
                hexStr = '0' + hexStr;
            }

            result += hexStr;
        }

        return result.toUpperCase();
    }

    function onFulfilled(arrayBuffer) {
        var item = activeItem;

        item.endSha1(convertArrayBufferToHexadecimalString(arrayBuffer));
        tryNext();

        return item;
    }

    function onRejected(reason) {
        var item = activeItem;

        item.endSha1();
        item.error = reason;
        tryNext();

        throw item;
    }

    function getSha1HexadecimalString(arrayBuffer) {
        activeItem.startSha1();
        return (crypto.subtle || crypto.webkitSubtle).digest('SHA-1', arrayBuffer).then(onFulfilled, onRejected);
    }

    function Deferred() {
        var deferred = this;
        var promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });

        deferred.promise = promise;

        return deferred;
    }

    function Item(file) {
        this.file = file;
        this.error = null;
        this.deferred = new Deferred;
        this.readTime = NaN;
        this.sha1Time = NaN;
        this.sha1HexadecimalString = '';
    }

    Item.prototype = {
        constructor: Item,

        startReading: function() {
            this.readTime = performance.now();
        },

        endReading: function() {
            this.readTime = performance.now() - this.readTime;
        },

        startSha1: function () {
            this.sha1Time = performance.now();
        },

        endSha1: function (sha1HexadecimalString) {
            this.sha1Time = performance.now() - this.sha1Time;
            this.sha1HexadecimalString = sha1HexadecimalString;
        }
    };

    function onLoad(event) {
        activeItem.endReading();

        var arrayBuffer = event.target.result;
        var deferred = activeItem.deferred;

        getSha1HexadecimalString(arrayBuffer).then(deferred.resolve, deferred.reject);
    }

    function onError() {
        activeItem.endReading();
        activeItem.error = fileReader.error;
        activeItem.deferred.reject(activeItem);
        tryNext();
    }

    function enqueue(file) {
        var item = new Item(file);

        queue.push(item);
        dequeue();

        return item.deferred.promise;
    }

    function dequeue() {
        if (!active && queue.length) {
            active = true;
            activeItem = queue.shift();
            activeItem.startReading();
            fileReader.readAsArrayBuffer(activeItem.file);
        }
    }

    function tryNext() {
        active = false;
        activeItem = null;
        setTimeout(dequeue, 100);
    }

    var queue = [];
    var active = false;
    var activeItem;
    var fileReader = new FileReader;

    fileReader.addEventListener('load', onLoad);
    fileReader.addEventListener('error', onError);

    return enqueue;
};
