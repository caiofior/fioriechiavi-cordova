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