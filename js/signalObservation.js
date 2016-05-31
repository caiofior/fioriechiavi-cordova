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
                
                navigator.camera.getPicture(
                function (imageData) {
                        $("#imagePreview").attr("src","data:image/jpeg;base64," + imageData);
                        $("#image").val(imageData);
                    }, function (message) {
                        $("#errorImage").html(message);
                    }, { quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL
                });
                
            }, function(error) {
                $("#errorPosition").html(error.code+" "+error.message);
            }
        );
        
        
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