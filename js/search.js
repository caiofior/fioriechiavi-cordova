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
        searchText = '';
        queryParams = getQueryParams(location.search);
        if (queryParams.search) {
            searchText = queryParams.search.toLowerCase().trim().split(' ')[0];    
        }
        
        try {
            $.ajax({
                url:"db/search/"+searchText.substr(0,1)+"/"+searchText.substr(1,1)+"/"+searchText+".json",
                type:'HEAD',
                error: function()
                {
                    $("#mainContent").append("<p>La ricerca non ha prodotto alcun risultato.</p>");
                },
                success: function(data,status,xhr)
                {
                    search = $.parseJSON(xhr.responseText);
                    $.each(search, function(id,taxa){
                        $("#mainContent").append("<p><a data-ajax='false' href='index.html?id="+taxa.id+"'>"+taxa.taxa_kind_initials+" "+taxa.name+"</a></p>");
                    });
                }
            });
        } catch( e) {}; 
    }
    ,false)}
};
app.initialize();