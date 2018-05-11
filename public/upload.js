$('#fileUpload').bind('change', function() { 
  var fileName = ''; 
  fileName = $(this).val(); 
  $('#nameDisplay').html(fileName.replace(/^.*\\/, "")); 
});