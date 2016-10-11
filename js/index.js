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
            
            
            var floweringNames={
                'Gennaio':1,
                'Febbraio':2,
                'Marzo':3,
                'Aprile':4,
                'Maggio':5,
                'Giugno':6,
                'Luglio':7,
                'Agosto':8,
                'Settembre':9,
                'Ottobre':10,
                'Novembre':11,
                'Dicembre':12
            }
            
            var taxaId = 1;
            var queryParams = getQueryParams(location.search);
            if (queryParams.signal) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                    var d = new Date();
                    dir.getFile("observation_"+String(d.getTime())+".json", {create:true}, function(file) {
                    file.createWriter(function(fileWriter) {
                      fileWriter.onwriteend = function() {
                        console.log('Write completed.');
                      };
                      var text = JSON.stringify(queryParams);  
                      var blob = new Blob([text], {type: 'text/plain'});
                      fileWriter.write(blob);
                      taxaId = queryParams.taxa_id;
                    });                    
                    });
                });
            } else if (queryParams.id) {
                taxaId = queryParams.id;    
            }
            if(
                    device.platform !== "browser" &&
                    navigator.connection !== Connection.NONE
                    ) {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                    dir.getFile("profile.json", {create:false}, function() {
                        var headString = "<p>";
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
                            var directoryReader = dirEntry.createReader();
                            directoryReader.readEntries(function (entries) {
                            var i;
                            var c = 0;
                            var e = /image$/;
                            for (i=0; i<entries.length; i++) {
                                if (
                                        entries[i].name !== 'profile.json' &&
                                        !e.test(entries[i].name)
                                        ) {
                                    c++;
                                }
                            }
                            if (c > 0) {
                                headString += "<a data-ajax='false' href='upload.html'>Upload</a> ";
                            }
                            headString += "<a class='showNext' href='#'>Logout</a><a style='display:none;' data-ajax='false' href='profile.html?logout=1'><img src='css/ok.png' title='Conferma' alt='conferma'></a></p>";
                            $("#mainContent").prepend(headString);
                            $("a.showNext").click(function(e){
                                $(this).next().show();
                                e.preventDefault();
                            });
                        },function (error){
                                console.log("Error "+error);
                            } );
                        });
                    }, function () {
                        $("#mainContent").prepend("<p><a data-ajax='false' href='profile.html'>Login</a></p>");
                    });
                });
            }
            var config;
            $.ajax({
                url:'js/config.json',
                async:false,
                complete:function(xhr) {
                    config = JSON.parse(xhr.responseText);
                }
            });
            if( device.platform === "browser") {   
                $("#mainContent").prepend("<p><a data-ajax='false' target='_blank' href='"+config.baseUrl+"index.php?id="+taxaId+"'>Aggiornamenti sul sito "+config.Sitename+"</a></p>");
            }
            thousand = parseInt(taxaId/1000);
            
                    
            try {
                $.ajax({
                    url:"db/taxa/"+thousand+"/"+taxaId+".json",
                    complete: function(xhr)
                    {
                        taxa = $.parseJSON(xhr.responseText);
                        if (taxa.parent_taxa_id != null) {
                        $("#mainContent").append("<p><a data-ajax='false' href='index.html?id="+taxa.parent_taxa_id+"'>"+taxa.parent_taxa_initials+" "+taxa.parent_taxa_name+"</h2></p>");    
                        $("#mainContent").append("<h2>"+taxa.taxa_kind_initials+" "+taxa.name+"</h2>");
                    }        
                    if (
                            taxa.taxa_kind_initials == "Sp." || 
                            taxa.taxa_kind_initials == "Gen."
                        ) {
                            $("#mainContent").append("<p><a data-ajax='false' href='signalObservation.html?id="+taxa.id+"'>Segnala osservazione</a></p>");
                    }

                    $("#mainContent").append("<p>"+taxa.description+"</p>");
                    $.each(taxa.image, function(id,image){
                        $("#mainContent").append("<img src='img/taxa"+image.filename+"'>");
                    });
                    altFrom = '';
                    altTo = '';
                    flowFrom = '';
                    flowTo = '';
                    $.each(taxa.attribute, function(id,attribute){
                        if (attribute.name == 'Limite altitudinale inferiore') {
                            altFrom = attribute.value;
                        }
                        if (attribute.name == 'Limite altitudinale superiore') {
                            altTo = attribute.value;
                        }
                        if (attribute.name == 'Inizio fioritura') {
                            flowFrom = floweringNames[attribute.value];
                        }
                        if (attribute.name == 'Fine fioritura') {
                            flowTo = floweringNames[attribute.value];
                        }
                        switch (attribute.name) {
                            case 'Diffusione' :
                                $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ● "+attribute.value+"</p>");
                                break;
                            case 'Ciclo riproduttivo' :
                            switch (attribute.value) {
                                case 'Annuale':
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ☉ "+attribute.value+"</p>");
                                    break;
                                case 'Biennale':
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ⚇ "+attribute.value+"</p>");
                                    break;
                                default:
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: "+attribute.value+"</p>");
                                    break;
                            }
                            case 'Portamento' :
                            switch (attribute.value) {
                                case 'Pianta perenne erbacea':
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ↓ "+attribute.value+"</p>");
                                    break;
                                case 'Cespuglio':
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ⏉ "+attribute.value+"</p>");
                                    break;
                                case 'Albero':
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: ☨ "+attribute.value+"</p>");
                                    break;
                                default:
                                    $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: "+attribute.value+"</p>");
                                    break;
                            }
                            default:
                                $("#mainContent").append("<p><strong>"+attribute.name+"</strong>: "+attribute.value+"</p>");
                                break;
                        }
                    });
                    regionSer = '';
                    $.each(taxa.region, function(id,region){
                        if (regionSer != '') {
                            regionSer += '-';
                        }
                        regionSer += region.id;
                    });
                    if (regionSer != '') {
                        $("#mainContent").append("<h3>Diffusione geografica</h3>");
                        hash = CryptoJS.MD5(regionSer).toString();
                        $("#mainContent").append("<img src='img/merged_map/"+hash.substr(0,1)+"/"+hash.substr(1,1)+"/"+hash+".png'>");
                    }
                    if (altFrom != '' && altTo != '' ) {
                        $("#mainContent").append("<h3>Limiti altitudinali</h3>");
                        hash = CryptoJS.MD5(altFrom+"-"+altTo).toString();
                        $("#mainContent").append("<img src='img/merged_altitude/"+hash.substr(0,1)+"/"+hash.substr(1,1)+"/"+hash+".png'>");
                    }
                    if (flowFrom != '' && flowTo != '' ) {
                        $("#mainContent").append("<h3>Fioritura</h3>");
                        hash = CryptoJS.MD5(flowFrom+"-"+flowTo).toString();
                        $("#mainContent").append("<img src='img/merged_flower/"+hash.substr(0,1)+"/"+hash.substr(1,1)+"/"+hash+".png'>");
                    }

                    $.each(taxa.dico, function(id,dico){
                        if (dico.taxa_id) {
                            if (dico.status == 1) {
                                $("#mainContent").append("<p><a data-ajax='false' href='index.html?id="+dico.taxa_id+"'>"+dico.text+"<br/>"+dico.taxa_kind_initials+" "+dico.name+"</a></p>");    
                            } else {
                                $("#mainContent").append("<p>"+dico.text+" "+dico.taxa_kind_initials+" "+dico.name+"</p>");    
                            }
                        } else {
                            $("#mainContent").append("<p>"+dico.text+"</p>");    
                        }
                        if (dico.photo_path) {
							$("#mainContent").append("<img src='img/dico/"+photo_path+"'>");
						}
                    });
                    }
                });
            } catch( e) {};
            
            
        });
    }
    ,false)}
};
app.initialize();
