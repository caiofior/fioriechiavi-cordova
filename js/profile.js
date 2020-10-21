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
                        file.remove();
                    });
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
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,  function() {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                dir.getFile("profile.json", {create:false}, function() {
                    $("#mainContent").append("<p><a data-ajax='false' href='profile.html?logout=1'>Logout</a></p>");
                }, function() {
                    profileForm ();
                    $("a.profile").click(function() {
                      profileForm ();
                    });
                    
                    $("a.recover").click(function() {
                      recoverForm ();  
                    });
                    $("a.register").click(function() {
                      registerForm ();
                    });
                });
            });
        });
        function profileForm () {
            $("#profileForm").show();
            $("#recoverForm").hide();
            $("#registerForm").hide();
            $("#profileForm").unbind("submit");
            $("#profileForm").submit(function (e) {
                e.preventDefault();
                if (
                        $("#profileForm input[name=username]").val() == '' ||
                        $("#profileForm input[name=password]").val() == ''
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
                        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                            dir.getFile("profile.json", {create:true}, function(file) {
                            file.createWriter(function (fileWriter) {
                                fileWriter.onwriteend = function() {
                                    file.file(function (file) {
                                        var reader = new FileReader();
                                        reader.onloadend = function(evt) {
                                            window.location="index.html";
                                        };
                                        reader.readAsText(file);
                                    })

                                };
                                fileWriter.onerror = function (e) {
                                    console.log("Failed file read: " + e.toString());
                                };
                                fileWriter.write(JSON.stringify(data));
                                });
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
        }
        function recoverForm () {
            $("#profileForm").hide();
            $("#recoverForm").show();
            $("#registerForm").hide();
            $("#recoverForm").unbind("submit");
            $("#recoverForm").submit(function (e) {
                  e.preventDefault();
                  if (
                          $("#recoverForm input[name=usernameRecover]").val() == ''
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
        }
        function registerForm () {
            $("#profileForm").hide();
            $("#recoverForm").hide();
            $("#registerForm").show();
            $("#registerForm").unbind("submit");
            $("#registerForm").submit(function (e) {
                e.preventDefault();
                if (
                        $("#registerForm input[name=username]").val() == '' ||
                        $("#registerForm input[name=password]").val() == ''
                ) {
                    $(".error").text("Indicare utente e password");
                    return;
                }
                if (
                        $("#registerForm input[name=password]").lenght < 3
                ) {
                    $(".error").text("La password deve avere alemno tre caratteri");
                    return;
                }
                if (
                        $("#registerForm input[name=password]").val() != $("#registerForm input[name=passwordr]").val()
                ) {
                    $(".error").text("Le due password sono diverse");
                    return;
                }
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (
                       !re.test($("#registerForm input[name=username]").val())
                ) {
                    $(".error").text("L'utente deve essere una mail");
                    return;
                }
                
                
                $(".error").text("");

                $.support.cors = true;
                $.ajaxSetup( {
                    xhr: function() {return new window.XMLHttpRequest({mozSystem: true});}
                });
                try{
                $.ajax({
                    url : config.baseUrl+'xhr.php?task=user&action=register',
                    data : $("#registerForm").serializeArray(),
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
                                        window.location="index.html";
                                    };
                                    reader.readAsText(file);
                                })
                            };
                            fileWriter.onerror = function (e) {
                                console.log("Failed file read: " + e.toString());
                            };
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
        }
    }
    ,false)}
};
app.initialize();