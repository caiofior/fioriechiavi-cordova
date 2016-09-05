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