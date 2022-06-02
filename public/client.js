$(document).ready(function () {
  
  /*global io*/
  let socket = io();

  socket.on('user_count', function(data) {
    console.log(data);

    socket.emit("hello", data);
  });
  

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
