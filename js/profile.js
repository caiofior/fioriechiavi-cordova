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
        console.log(JSON.stringify({
             "Sitename" : "Florae",
             "baseUrl" : "http://127.0.0.1/~caiofior/florae.it"
        }));
        var config;
        $.ajax({
            url:'js/config.json',
            type:'json',
            async:false,
            succes:function(data){
            config = data;
            },
            error:function(e) {
                config = JSON.parse(e.responseText);
            }
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                dir.getFile("profile.json", {create:false}, function() {
                    $("#mainContent").append("<p><a data-ajax='false' href='profile.html?logout=1'>Logout</a></p>");
                }, function() {
                    $("#profileForm").show();
                    $("#recoverForm").hide();
                    $("#formForm").hide();
                    $("#profileForm").unbind("submit");
                    $("#profileForm").submit(function (e) {
                        e.preventDefault();
                        if (
                                $("#username").val() == '' ||
                                $("#password").val() == ''
                        ) {
                            $(".error").text("Utente o password errate");
                            return;
                        }
                        $(".error").text("");
                        
                        $.support.cors = true;
                        $.ajaxSetup( {
                            xhr: function() {return new window.XMLHttpRequest({mozSystem: true});}
                        });
                        try{
                        $.ajax({
                            url : config.baseUrl+'xhr.php?task=user&action=login',
                            data : $("#profileForm").serializeArray(),
                            crossDomain: true,
                            dataType : "json",
                            type: "get",
                            success : function (data) {
                                if (data.valid === false) {
                                    $(".error").text("Utente o password errata");
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
                                                window.location="index.html";
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
                            }
                        }); } catch(e) {
                            $(".error").text("C'è stato un'errore, riprova tra qualche momento");
                        }
                    });
                    $("a.recover").click(function() {
                      $("#profileForm").hide();
                      $("#recoverForm").show();
                      $("#registerForm").hide();
                      $("#recoverForm").unbind("submit");
                      $("#recoverForm").submit(function (e) {
                            e.preventDefault();
                            if (
                                    $("#usernameRecover").val() == ''
                            ) {
                                $(".error").text("Email obbligatoria");
                                return;
                            }
                            $(".error").text("");
                            try{
                            $.ajax({
                                url : config.baseUrl+'xhr.php?task=user&action=recover',
                                data : $("#recoverForm").serializeArray(),
                                crossDomain: true,
                                dataType : "json",
                                type: "get",
                                success : function (data) {
                                    if (data.valid === false) {
                                        $(".error").text("Utente non tovato");
                                        return;
                                    } else {
                                        $(".error").text("Ti è stata inviata una mail con la nuova password");
                                    }
                                    
                                },
                                error : function (jqXHR , textStatus, errorThrown ) {
                                    console.log(jqXHR );
                                    console.log(textStatus+" "+errorThrown);    
                                }
                            }); } catch(e) {
                                $(".error").text("C'è stato un'errore, riprova tra qualche momento");
                            }
                      });
                    });
                    $("a.register").click(function() {
                      $("#profileForm").show();
                      $("#recoverForm").hide();
                      $("#registerForm").hide();
                    });
                });
            });
        });   
    }
    ,false)}
};
app.initialize();