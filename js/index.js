/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
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
        
        floweringNames={
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
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
            
            profilePath = cordova.file.dataDirectory + "/profile.json";
            
             $.ajax({
            url:profilePath,
            type:'HEAD',
            error: function()
            {
                $("#mainContent").append("<p><a data-ajax='false' href='profile.html'>Login</a></p>");
            },
            success: function()
            {

            }
            });
            
            taxaId = 1;
            queryParams = getQueryParams(location.search);
            if (queryParams.id) {
                taxaId = queryParams.id;    
            }
            thousand = parseInt(taxaId/1000);
            pathToFile = cordova.file.applicationDirectory + "/db/taxa/"+thousand+"/"+taxaId+".json";
            
            window.resolveLocalFileSystemURL(pathToFile, function(fileEntry) {
                fileEntry.file(function(file) {
                    reader = new FileReader();
                    reader.onloadend = function(e) {
                        taxa = $.parseJSON(this.result);
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
                        });
                        
                    }
                    reader.readAsText(file);
                });
            }, function(e){
                console.log("Error on file access");
                console.log(e);
            });    
            
            
        }, function(e){
            console.log("Error on file system");
            console.log(e);
        });
        
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
       
        
    }
};
app.initialize();