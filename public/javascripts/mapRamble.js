/*global google, $, MAPRAMBLE */
/*jslint browser:true, devel:true */

var MAPRAMBLE = {};

// 使用する変数の準備
MAPRAMBLE.markers = [];
MAPRAMBLE.current_marker = null;

// デバッグ情報の表示
MAPRAMBLE.debug = false;
MAPRAMBLE.console = {};
MAPRAMBLE.console.log = function (message) {
    'use strict';
    if (MAPRAMBLE.debug === true) {
        console.log(message);
    }
};

// マップを生成
MAPRAMBLE.createMap = function (initial) {
    'use strict';
    var options;

    options = {
        zoom: initial.zoom,
        center: new google.maps.LatLng(initial.lat, initial.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.console.log(initial);
    this.console.log(options);

    // マップの生成
    return new google.maps.Map(document.getElementById("map"), options);
};

// マーカー群を追加
MAPRAMBLE.addPlaceMarkers = function () {
    'use strict';

    var that = this;

    that.notes.map(function (note) {
        that.addMarker(note);
    });
};

// 個々のマーカーを追加
MAPRAMBLE.addMarker = function (note) {
    'use strict';
    var marker, options;

    options = {
        position: new google.maps.LatLng(note.lat, note.lng),
        map: this.map,
        icon: "http://maps.google.com/mapfiles/marker.png"
    };

    marker = new google.maps.Marker(options);

    google.maps.event.addListener(marker, 'click', function () {
        return (function (id) {
            if (MAPRAMBLE.mode === 'edit') {
                var mess = '<a id="edit_note_anchor" data-remote="true" href="/notes/' + id + '/edit">edit</a>';
                // console.log(mess);
                $('body').append(mess);
                $("#edit_note_anchor").trigger('click').remove();
            } else {
                var mess = '<a id="show_note_anchor" data-remote="true" href="/notes/' + id + '">show</a>';
                // console.log(mess);
                $('body').append(mess);
                $("#show_note_anchor").trigger('click').remove();
            }
        }(note.id));
    });

    marker.note_id = note.id;
    // マーカーを配列に入れる
    this.markers.push(marker);
};

// マップの高さを画面サイズに合わせる
MAPRAMBLE.setHeight = function () {
    'use strict';
    var windowInnerHeight = $(window).innerHeight(),
        headerHeight = $("#header").height(),
        footerHeight = $("#thumb").height() + 60,
        windowInnerWidth = $(window).innerWidth(),
        infoWidth = $("#info").width();
    $("#main").css("height", windowInnerHeight - headerHeight - footerHeight);
    $("#map").css("height", windowInnerHeight - headerHeight - footerHeight);
    $("#info").css("height", windowInnerHeight - headerHeight - footerHeight - 10);
    $("#map").css("width", windowInnerWidth - infoWidth - 40);
    $(".thumb-wrapper").css("width", windowInnerWidth - 110);
    // console.log(footerHeight);
};

// イベントハンドラの設定
MAPRAMBLE.setEventHandler = function () {
    'use strict';

    $(window).on('resize', function () {
        MAPRAMBLE.setHeight();
    });

    if (this.mode === 'edit') {
        google.maps.event.addListener(this.map, 'rightclick', function (event) {
            console.log('rightclick');

            var options = {
                position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                map: MAPRAMBLE.map,
                icon: "http://maps.google.com/mapfiles/arrow.png",
                shadow: "http://maps.google.com/mapfiles/arrowshadow.png"
            };

            if (MAPRAMBLE.current_marker !== null) {
                MAPRAMBLE.current_marker.setMap(null);
            }

            MAPRAMBLE.current_marker = new google.maps.Marker(options);

            var mess = '<a id="new_note_anchor" data-remote="true" href="/notes/new?lat=' + event.latLng.lat() + '&lng=' + event.latLng.lng() + '">new</a>';
            // console.log(mess);
            $('body').append(mess);
            $("#new_note_anchor").trigger('click').remove();
            //$(mess).trigger('click');
        });
    }
};

// マップの表示範囲をマーカーに合わせる
MAPRAMBLE.fitBounds = function () {
    'use strict';
    this.map.fitBounds(this.bounds);
};

// メイン・プログラム
$(document).ready(function () {
    'use strict';
    var i;

    MAPRAMBLE.setHeight();
    MAPRAMBLE.map = MAPRAMBLE.createMap({zoom: 14, lat: 40.784056, lng: 140.781172});
    MAPRAMBLE.notes = null;
    $.getJSON("/notes.json", function (json) {
        MAPRAMBLE.notes = json;
        MAPRAMBLE.addPlaceMarkers();
        MAPRAMBLE.fitBounds();
        MAPRAMBLE.setEventHandler();
        MAPRAMBLE.markerCluster = new MarkerClusterer(MAPRAMBLE.map, MAPRAMBLE.markers, {gridSize: 50, maxZoom: 15, zoomOnClick: false});
        ClusterIcon.prototype.triggerClusterClick = function() {
            var markerClusterer = this.cluster_.getMarkerClusterer();

            // Trigger the clusterclick event.
            google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);

            var markers = this.cluster_.markers_;
            $("#thumb").empty();
            for (var i = 0; i < markers.length; i += 1) {
                for (var j = 0; j < MAPRAMBLE.notes.length; j += 1) {
                    if (MAPRAMBLE.notes[j].id === markers[i].note_id) {
                        var note = MAPRAMBLE.notes[j];
                        break;
                    }
                }
                if (note.image_file_name !== null) {
                    if (MAPRAMBLE.mode === 'edit') {
                        $("#thumb").append('<li><a data-remote="true" href="/notes/' + note.id + '/edit"><img src="/assets/' + note.image_file_name +'" alt="" height="125"></a></li>');
                    } else {
                        $("#thumb").append('<li><a data-remote="true" href="/notes/' + note.id + '"><img src="/assets/' + note.image_file_name +'" alt="" height="125"></a></li>');
                    }
                }
            }
            var carouObj = new Object();
            // carouObj.auto = false;
            // carouObj.circular = false;
            // carouObj.infinite = false;
            carouObj.prev = ".carouPrev";
            carouObj.next = ".carouNext";
            carouObj.scroll = {
                items: 1,
                duration: 500,                         
                pauseOnHover: true
            };
            $("#thumb").carouFredSel(carouObj);
        };
        for (i = 0; i < MAPRAMBLE.notes.length; i += 1) {
            if (MAPRAMBLE.notes[i].image_file_name !== null) {
                if (MAPRAMBLE.mode === 'edit') {
                   $("#thumb").append('<li><a data-remote="true" href="/notes/' + MAPRAMBLE.notes[i].id + '/edit"><img src="/assets/' + MAPRAMBLE.notes[i].image_file_name +'" alt="" height="125"></a></li>');            
                } else {
                   $("#thumb").append('<li><a data-remote="true" href="/notes/' + MAPRAMBLE.notes[i].id + '"><img src="/assets/' + MAPRAMBLE.notes[i].image_file_name +'" alt="" height="125"></a></li>');                        
                }            
            }
        }
        var carouObj = new Object();
        // carouObj.auto = false;
        // carouObj.circular = false;
        // carouObj.infinite = false;
        carouObj.prev = ".carouPrev";
        carouObj.next = ".carouNext";
        carouObj.scroll = {
            items: 1,
            duration: 500,                         
            pauseOnHover: true
        };
        $("#thumb").carouFredSel(carouObj);
        MAPRAMBLE.setHeight();
    });
});
