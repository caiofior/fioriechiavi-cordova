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
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                var queryParams = getQueryParams(location.search);
                
                if (queryParams.upload_file) {
                    var config;
                    $.ajax({
                        url:'js/config.json',
                        async:false,
                        complete:function(xhr) {
                            config = JSON.parse(xhr.responseText);
                        }
                    });
                    
                    
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory+"profile.json", function(fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var profile = JSON.parse(this.result);
                                var ftob = new FileTransfer();
                                ftob.upload(cordova.file.dataDirectory+queryParams.upload_file, encodeURI(config.baseUrl+"xhr.php?task=observation&action=signal&token="+profile.token),function(obIns) {
                                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory+queryParams.upload_file, function(fileEntryObs) {
                                    fileEntryObs.file(function (fileObs) {
                                            var reader = new FileReader();
                                            reader.onloadend = function () {
                                                var observation = JSON.parse(this.result);
                                                var observationInsert = JSON.parse(obIns.response);
                                                console.log(observationInsert);
                                                var ftimg = new FileTransfer();
                                                ftimg.upload(cordova.file.dataDirectory+observation.image, encodeURI(config.baseUrl+"xhr.php?task=observation&action=appendimage&token="+profile.token+"&id="+observationInsert.id),
                                                function(e) {
                                                    fileEntryObs.remove();
                                                }, function(e) {
                                                    console.log(e);
                                                });
                                            };
                                            console.log(fileObs);
                                            reader.readAsText(fileObs);
                                        });
                                    });   
                                });
                            };
                            reader.readAsText(file);
                        });
                    });
                } else if (queryParams.delete_file) {
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory+queryParams.delete_file, function(fileEntry) {
                        fileEntry.remove();
                    });
                }
                dir.getFile("profile.json", {create:false}, function() {
                    
                            
                        
                        $("a.showNext").on("click",function(e){
                            console.log("HI");
                            $(this).next().show();
                            e.preventDefault();
                        });     

                    
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
                                            var line = "<div><span>"+observation.title+" "+observation.datetime+"</span>";
                                            line += "<a data-ajax='false' href='upload.html?upload_file="+fileEntry.name+"' ><img src='css/upload.png'></a>";
                                            line += "<a class='showNext' data-ajax='false' href='#' ><img src='css/delete.png'></a>";
                                            line += "<a style='display:none;' data-ajax='false' href='upload.html?delete_file="+fileEntry.name+"' ><img src='css/ok.png' title='conferma' alt='conferma'></a></div>";
                                            $("#mainContent").append(line).find("a.showNext").click(function(e){
                                                $(this).next().show();
                                                e.preventDefault();
                                            });
                                        };
                                        reader.readAsText(file);
                                    });
                                });
                            };
                        }

                    });
                });
            });
  
        });
    }
    ,false)}
};
app.initialize();