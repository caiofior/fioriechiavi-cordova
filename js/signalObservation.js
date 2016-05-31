navigator.geolocation.getCurrentPosition(
    function(position) {
        $("#latitude").val(position.coords.latitude);
        $("#longitude").val(position.coords.longitude);
    }, function(error) {
        $("#errorPosition").html(error.code+" "+error.message);
    }
);
navigator.camera.getPicture(
    function (imageData) {
        $("#imagePreview").attr("src","data:image/jpeg;base64," + imageData);
        $("#latitude").val(imageData);
    }, function (message) {
        $("#errorImage").html(message);
    }, { quality: 50,
    destinationType: Camera.DestinationType.DATA_URL
});
