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
        if (
            $("#title").val() == ''
        ) {
            $("#errorPosition").text("Titolo obbligatorio");
            return;
        }
        if (
            $("#description").val() == ''
        ) {
            $("#errorPosition").text("Descrizione obbligatoria");
            return;
        }
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                var imagesNames = [];
                var directoryReader = dir.createReader();
                directoryReader.readEntries(function (entries) {
                var i;
                var e = /image$/;
                for (i=0; i<entries.length; i++) {
                    if (
                            entries[i].name !== 'profile.json' &&
                            !e.test(entries[i].name)    
                        ) {
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory+entries[i].name, function(fileEntry) {
                            fileEntry.file(function (file) {
                                var reader = new FileReader();
                                reader.onloadend = function () {
                                    var observation = JSON.parse(this.result);
                                    imagesNames.push(observation.image);
                                    
                                };
                                reader.readAsText(file);
                            });
                        });
                    };
                }
                for (i=0; i<entries.length; i++) {
                    if (
                            entries[i].name !== 'profile.json' &&
                            e.test(entries[i].name)    
                        ) {
                        for (var c = 0; c < imagesNames.length; c++ ) {
                            if (imagesNames[c] === entries[i].name) {
                                window.resolveLocalFileSystemURL(cordova.file.dataDirectory+entries[i].name, function(fileEntry) {
                                    fileEntry.remove();
                                });    
                            }
                        }
                    };
                }
            });
        });
        var options =  {maximumAge:600000, timeout:5000, enableHighAccuracy: true}
        if (device.platform === "firefoxos") {
			options = {};
		}
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                $("#latitude").val(position.coords.latitude);
                $("#longitude").val(position.coords.longitude);
                navigator.globalization.dateToString(
                    new Date(),
                    function (date) {
                        $("#datetime").val(date.value);
                    },
                    function (e) {console.log(e);},
                    { formatLength: 'short', selector: 'date and time' }
                );
                navigator.camera.getPicture(
                    function (imageData) {
                        $("#preview").attr("src",imageData);
                        var d = new Date();
                        var fileName= "observation_"+String(d.getTime())+".image";
                        if (device.platform === "firefoxos") {
							var req = new XMLHttpRequest();
							req.onreadystatechange = function () {
								if (req.readyState === 4) {
									req.onreadystatechange = function () {};
									window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
										dir.getFile(fileName, {create:true}, function(file) {
											file.createWriter(function(fileWriter) {
											  fileWriter.onwriteend = function() {
												$("#image").val(fileName);
												$("#errorImage").html(fileName);
											  };
											  fileWriter.write(req.response);
											});                    
										});
									});
								}
							}
							req.open('GET', imageData, true);
							req.responseType = 'blob';
							req.send();
                        
						} else {
							var ftob = new FileTransfer();
							ftob.download(imageData, cordova.file.dataDirectory + fileName, 
								function(fileEntry)
								{
									$("#image").val(fileName);
								},
								function (error)
								{
									$("#errorImage").html("Errore nella copia dell'immagine "+error.code);
								}
							);
						}
                        
                    }, function (message) {
                        $("#errorImage").html("Errore nell'accesso all'immagine "+message);
                    },{destinationType: Camera.DestinationType.FILE_URI});
            }, function(error) {
                $("#errorPosition").html("Non riesco a determinare la posizione<br>"+error.code+" "+error.message);
            }, options
        );
        
        
        });
        }
        ,false)}
};
app.initialize();
