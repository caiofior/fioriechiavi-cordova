var app = {
    initialize: function() {
        document.addEventListener('deviceready', function() {
        $('.listening').hide();
        $('.received').show();
        
        function getQueryParams(qs) {
            var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])]
                = decodeURIComponent(tokens[2]);
            }

            return params;
        }
        
        taxaId = 1;
        queryParams = getQueryParams(location.search);
        if (queryParams.id) {
            taxaId = queryParams.id;    
        }

        $("#taxa_id").val(taxaId);
        $("#taxaReturn").attr("href","index.html?id="+taxaId);
        
        $("#addPhoto").click(function () {
        

        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                $("#latitude").val(position.coords.latitude);
                $("#longitude").val(position.coords.longitude);
                var d = new Date();
                $("#datetime").val(d.toISOString());
                navigator.camera.getPicture(
                    function (imageData) {
                        $("#preview").attr("src",imageData);
                        $("#image").val(imageData);
                    }, function (message) {
                        $("#errorImage").html(message);
                    },{destinationType: Camera.DestinationType.FILE_URI});
            }, function(error) {
                $("#errorPosition").html(error.code+" "+error.message);
            }
        );
        
        
        });
        }
        ,false)}
};
app.initialize();