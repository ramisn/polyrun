$('#fileUpload').bind('change', function() { 
  var fileName = $(this).val(), size = $(this).get(0).files.length; 
  if (size > 1) { $('#nameDisplay').html(size + " files selected."); }
  else { $('#nameDisplay').html(fileName.replace(/^.*\\/, "")); }
});