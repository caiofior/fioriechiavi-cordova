var app = {
    initialize: function () {
        document.addEventListener('deviceready', function () {
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
            $("#taxaReturn").attr("href", "index.html?id=" + taxaId);

            $("#addPhoto").click(function () {

                var signalObservation = new SignalObservation();
                signalObservation.cleanUp();                
                signalObservation.getPosition();
                signalObservation.getPicture();

            });
            $("#signal").click(function () {
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
                if (
                        $("#image").val() == ''
                        ) {
                    $("#errorPosition").text("Immagine obbligatoria");
                    return;
                }
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                    var d = new Date();
                    dir.getFile("observation_" + String(d.getTime()) + ".json", {create: true}, function (file) {
                        file.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function () {
                                console.log('Write completed.');
                                window.location="index.html";
                            };
                            fileWriter.onerror = function (e) {
                                    console.log("Failed file read: " + e.toString());
                            };
                            var result = {};
                            $.each($("#signalObservation").serializeArray(), function () {
                                result[this.name] = this.value;
                            });
                            fileWriter.write(JSON.stringify(result));
                        });
                    });
                });
            });
        }
        , false)
    }
};
app.initialize();

function SignalObservation() {
    this.cleanUp = function () {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
            var imagesNames = [];
            var directoryReader = dir.createReader();
            directoryReader.readEntries(function (entries) {
                var i;
                var e = /image$/;
                for (i = 0; i < entries.length; i++) {
                    if (
                            entries[i].name !== 'profile.json' &&
                            !e.test(entries[i].name)
                            ) {
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + entries[i].name, function (fileEntry) {
                            fileEntry.file(function (file) {
                                var reader = new FileReader();
                                reader.onloadend = function () {
                                    var observation = JSON.parse(this.result);
                                    imagesNames.push(observation.image);

                                };
                                reader.readAsText(file);
                            });
                        });
                    }
                    ;
                }
                for (i = 0; i < entries.length; i++) {
                    if (
                            entries[i].name !== 'profile.json' &&
                            e.test(entries[i].name)
                            ) {
                        for (var c = 0; c < imagesNames.length; c++) {
                            if (imagesNames[c] === entries[i].name) {
                                window.resolveLocalFileSystemURL(cordova.file.dataDirectory + entries[i].name, function (fileEntry) {
                                    fileEntry.remove();
                                });
                            }
                        }
                    }
                    ;
                }
            });
        });
    }
    this.getPicture = function () {
        if ($("#image").val() == "") {
            navigator.camera.getPicture(
                    function (imageData) {

                        var d = new Date();
                        var fileName = "observation_" + String(d.getTime()) + ".image";
                        if (device.platform === "firefoxos") {
                            var req = new XMLHttpRequest();
                            req.onreadystatechange = function () {
                                if (req.readyState === 4) {
                                    req.onreadystatechange = function () {};
                                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                                        dir.getFile(fileName, {create: true}, function (file) {
                                            file.createWriter(function (fileWriter) {
                                                fileWriter.onwriteend = function () {
                                                    $("#preview").attr("src", imageData);
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
                                    function () {
                                        $("#preview").attr("src", imageData);
                                        $("#image").val(fileName);
                                    },
                                    function (error) {
                                        $("#errorImage").html("Errore nella copia dell'immagine " + error.code);
                                    },
                                    true,
                                    {}
                            );
                        }
                    }, function (message) {
                $("#errorImage").html("Errore nell'accesso all'immagine " + message);
            }, {destinationType: Camera.DestinationType.FILE_URI});
        }
    }
    this.getPosition = function () {
        var options = {maximumAge: 600000, timeout: 5000, enableHighAccuracy: true};
        if (device.platform === "firefoxos") {
            options = {};
        }
        navigator.geolocation.getCurrentPosition(
                function (position) {
                    $("#latitude").val(position.coords.latitude);
                    $("#longitude").val(position.coords.longitude);
                    navigator.globalization.dateToString(
                            new Date(),
                            function (date) {
                                $("#datetime").val(date.value);
                            },
                            function (e) {
                                console.log(e);
                            },
                            {formatLength: 'short', selector: 'date and time'}
                    );
                }, function (error) {
            $("#errorPosition").html("Non riesco a determinare la posizione<br>" + error.code + " " + error.message);
        }, options
        );
    }
}