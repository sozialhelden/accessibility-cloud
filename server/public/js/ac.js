$( document ).ready(function() {
    var el = $('#mapid');

	var map = L.map('mapid');
    map.fitBounds([
        [
            parseFloat(el.attr('lat_min')), 
            parseFloat(el.attr('long_min')),
        ],
        [
            parseFloat(el.attr('lat_max')), 
            parseFloat(el.attr('long_max')),
        ]
    ]);

	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGl4dHVyIiwiYSI6ImNpc2tuMWx1eDAwNHQzMnBremRzNjBqcXIifQ.3jo3ZXnwCVxTkKaw0RPlDg', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'accesssibility-cloud',
	    accessToken: 'your.mapbox.public.access.token'
	}).addTo(map); 


    var source_id = el.attr('source_id');

    if(source_id) 
    {
        var greenIcon = L.icon({
            iconUrl: '/images/icons/dot-green.png',
            iconSize:     [7, 7], 
            iconAnchor:   [3, 3], 
        });

        var redIcon = L.icon({
            iconUrl: '/images/icons/dot-red.png',
            iconSize:     [7, 7], 
            iconAnchor:   [3, 3], 
        });

        $.getJSON( "/sources/" + source_id + "/places", function( data ) 
        {
            var items = [];

            $.each( data, function( key, val ) {
                var lat = val[4];
                var long = val[3];
                var accessible = val[0];
                var name = val[1];

                if(isNaN(lat) || isNaN(long)) 
                    return;
                
                L.marker([lat, long], {
                    icon: accessible ? greenIcon : redIcon
                }).addTo(map).bindPopup(name);

            });
        });
    }
});


