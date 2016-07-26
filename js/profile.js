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
        queryParams = getQueryParams(location.search);
        if (queryParams.logout) {
             window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                    dir.getFile("profile.json", {create:false}, function(file) {
                        file.remove(function(){console.log("Profile removed")});
                    });
                });
            });
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                dir.getFile("profile.json", {create:false}, function() {
                    $("#mainContent").append("<p><a data-ajax='false' href='profile.html?logout=1'>Logout</a></p>");
                }, function() {
                    $("#profileForm").show();
                    $("#profileForm").submit(function (e) {
                        e.preventDefault();
                        if (
                                $("#username").val() == '' ||
                                $("#password").val() == ''
                        ) {
                            $("#error").text("Utente o password errate");
                            return;
                        }
                        $("#error").text("");
                        $.support.cors = true;
                        $.ajax({
                            url : 'http://127.0.0.1/~caiofior/fioriechiavi.it/xhr.php?task=user&action=login',
                            data : $("#profileForm").serializeArray(),
                            crossDomain: true,
                            dataType : "jsonp",
                            success : function (data) {
                                if (data.valid === false) {
                                    $("#error").text("Utente o password errata");
                                    return;
                                }
                                dir.getFile("profile.json", {create:true}, function(file) {
                                file.createWriter(function (fileWriter) {
                                    fileWriter.onwriteend = function() {
                                        file.file(function (file) {
                                            var reader = new FileReader();
                                            reader.onloadend = function(evt) {
                                                console.log("Read as data URL");
                                                console.log(evt.target.result);
                                            };
                                            console.log(file);
                                            reader.readAsText(file);
                                        })

                                    };
                                    fileWriter.onerror = function (e) {
                                        console.log("Failed file read: " + e.toString());
                                    };
                                    console.log(JSON.stringify(data));
                                    fileWriter.write(JSON.stringify(data));
                                    });
                                });
                            },
                            error : function (jqXHR , textStatus, errorThrown ) {
                                console.log(jqXHR );
                                console.log(textStatus+" "+errorThrown);
                                $("#error").text("C'è stato un'errore, riprova tra qualche momento");
                            }
                        });
                    });
                });
            });
        });   
    }
    ,false)}
};
app.initialize();