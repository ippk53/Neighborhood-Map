
/*******MAP********/
var map;

function initMap() {
    //map style
    var styles = [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
            }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                    "saturation": -100
                },
                {
                    "lightness": 45
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                    "color": "#46bcec"
                },
                {
                    "visibility": "on"
                }
            ]
        }
    ];
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 27.9506,
            lng: -82.4572
        },
        zoom: 8,
        styles: styles, //add to style the map
        mapTypeControl: false
    });
    // Start the ViewModel
    ko.applyBindings(new ViewModel());
}
/******************Model initial array of locations***************/
var locations = [{
        name: "Clearwater Beach",
        lat: 27.9775,
        lng: -82.8271,
        id: "50835e33e4b0ad74a8c13977"
    },
    {
        name: "Curtis Hixon Waterfront Park",
        lat: 27.9489,
        lng: -82.4616,
        id: "4b5b0d53f964a520f5e028e3"
    },
    {
        name: "Kennedy Space Center",
        lat: 28.5729,
        lng: -80.6490,
        id: "4f2179a3e4b0b69d78926a81"
    },
    {
        name: "Magic Kingdom",
        lat: 28.4177,
        lng: -81.5812,
        id: "4b11d311f964a520758523e3"
    },
    {
        name: "St. Pete Beach",
        lat: 27.7009,
        lng: -82.7671,
        id: "4c97a10ef7cfa1cda91cd015"
    },
    {
        name: "Universal Studios Florida",
        lat: 28.4749,
        lng: -81.4663,
        id: "4ad62c90f964a5208c0521e3"
    },
    {
        name: "Weeki Wachee Springs",
        lat: 28.5175,
        lng: -82.5726,
        id: "4ae9a73ff964a5208ab521e3"
    },
    {
        name: "Wekiwa Springs State Park",
        lat: 28.7118,
        lng: -81.4628,
        id: "4b058692f964a520476622e3"
    }
];


/******************CONSTRUCTOR***************/
var Place = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.marker = ko.observable();
    this.photoPrefix = ko.observable('');
    this.photoSuffix = ko.observable('');
    this.description = ko.observable('');
    this.address = ko.observable('');
    this.phone = ko.observable('');
    this.canonicalUrl = ko.observable('');
    this.contentString = ko.observable('');
};

/******************View Model***************/
var ViewModel = function() {
    var self = this;

    // array for places
    this.locationList = ko.observableArray([]);
    // place objects for each item in locations
    locations.forEach(function(placeItem) {
        self.locationList.push(new Place(placeItem));
    });

    // Initialize the infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 180,
    });

    var marker;

    //  set markers, request Foursquare data, and set event listeners for the infowindow
    self.locationList().forEach(function(placeItem) {

        // Define markers
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        placeItem.marker = marker;

        // AJAX request to Foursquare
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
                '?client_id=H3R0RUAZAFME5W3MTD0VCNXWKGYW5TJC1R2EXQUZLCKXZB2T&client_secret=UHP5ATSXK1FKXBFCIWZ2GCQXB0PZXDT0MO1VX5AKSYJDHLCP&v=20161016',
            success: function(data) {
                var result = data.response.venue;

                var contact = result.hasOwnProperty('contact') ? result.contact : '';
                if (contact.hasOwnProperty('formattedPhone')) {
                    placeItem.phone(contact.formattedPhone || '');
                }

                var location = result.hasOwnProperty('location') ? result.location : '';
                if (location.hasOwnProperty('address')) {
                    placeItem.address(location.address || '');
                }

                var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                if (bestPhoto.hasOwnProperty('prefix')) {
                    placeItem.photoPrefix(bestPhoto.prefix || '');
                }

                if (bestPhoto.hasOwnProperty('suffix')) {
                    placeItem.photoSuffix(bestPhoto.suffix || '');
                }

                var description = result.hasOwnProperty('description') ? result.description : '';
                placeItem.description(description || '');

                var url = result.hasOwnProperty('url') ? result.canonicalUrl : '';
                placeItem.canonicalUrl(url || '');
                // information for infowindow from Foursquare
                var contentString = '<div id="iWindow"><h3>' + placeItem.name() + '</h3><div id="pic"><img src="' +
                    placeItem.photoPrefix() + '120x120' + placeItem.photoSuffix() +
                    '" alt="Image Location"></div><p>' +
                    placeItem.address() + '</p><p>' + placeItem.phone() + '</p><p>' +
                    placeItem.description() +
                    '</p><p><a href=' +
                    '</a></p><p><a target="_blank" href=' + placeItem.canonicalUrl() +
                    '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                    placeItem.lat() + ',' + placeItem.lng() + '>Directions</a></p></div>';

                // Event listener for infowindows
                google.maps.event.addListener(placeItem.marker, 'click', function() {
                    infowindow.open(map, this);
                    // Bounce animation for marker when clicked
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        placeItem.marker.setAnimation(null);
                    }, 700);
                    infowindow.setContent(contentString);
                    map.setCenter(placeItem.marker.getPosition());
                });
            },
            // Alert the user on error infowindow
            error: function(errortext) {
                infowindow.open(map, this);
                infowindow.setContent('<h4>Foursquare data is unavailable.</h4>');
            }
        });
    });
    // Filter markers per user input
    self.visible = ko.observableArray();
    self.locationList().forEach(function(place) {
        self.visible.push(place);
    });
    //open appropiate marker  when the user clicks an item on the  list
    self.showInfo = function(placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
    };

    // Track input
    self.userInput = ko.observable('');

    self.filterMarkers = function() {
        var searchInput = self.userInput().toLowerCase();
        self.visible.removeAll();
        self.locationList().forEach(function(place) {
            place.marker.setVisible(false);
            // Compare the name of each place to user input, set the place's marker as visible
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function(place) {
            place.marker.setVisible(true);
        });
    };
};
// side nav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}


//Alerts user of an error with google.
function googleError() {
    alert("Google Has Encountered An Error.  Please Try Again Later");
    console.log('error');
}
