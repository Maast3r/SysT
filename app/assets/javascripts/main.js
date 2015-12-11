$(document).ready(function(){

  document.getElementById('query').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){ //enter key
      if(this.value != "" || this.value.length > 0){
        searchSpotify(this.value);
      }
    }
  }

  $(document).on('dblclick', ".clickableRow", function(event) {
    changeSpotifyFrame(event.target.className.split(" ")[0]);
  });

  $(document).on('click', ".clickableRow", function(event) {
    if(event.target.tagName === "TD"){
      resetTable();
      var row = event.target.parentNode;
      row.className = row.className + " selectedSpotifyRow";
    }
  });

  $("#spotifySearchButton").click(function(){
    searchSpotify();
  });

  function searchSpotify(query){
    var buildSearch = query.split(" ").join("+");
    $.ajax({
  		url: 'https://api.spotify.com/v1/search?q=' + buildSearch + '&type=track',
  		type: 'GET',
  		dataType: 'json',
  		data:{
  		},
  		success: function(resp){
        createResultsTable(resp.tracks.items, document.getElementById("spotifyResults"));
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown){
  			alert("Could not search Spotify. " + errorThrown);
  		}
  	});
  }

  function resetTable(){
    var resultsTable = document.getElementById("resultsTable");
    for (var i = 1; i < resultsTable.rows.length; i++) {
       if(resultsTable.rows[i].className.split(" ").length == 3){
         resultsTable.rows[i].className = resultsTable.rows[i].className.split(" ")[0] + " " + resultsTable.rows[i].className.split(" ")[1];
       }
    }
  }

  function changeSpotifyFrame(newURI){
    var resultsTable = document.getElementById("resultsTable");
    for (var i = 1; i < resultsTable.rows.length; i++) {
      var playIconClass = resultsTable.rows[i].cells[0].getElementsByClassName("fa")[0].className;
      if(playIconClass = "fa fa-volume-up"){
        playIconClass.className = "fa fa-play";
      }
    }
    document.getElementById("frameWrapper").innerHTML = "<iframe id='spotifyFrame' src=https://embed.spotify.com/?uri=" + newURI + " height='80' frameborder='0' allowtransparency='true'></iframe>";
  }

  function createResultsTable(results, wrapper){
    wrapper.innerHTML = "";
    var resultsTable = document.createElement("table");
    resultsTable.id = "resultsTable";
    var headerRow = document.createElement("tr");
    var nameHead = document.createElement("th");
    var artistHead = document.createElement("th");
    var durationHead = document.createElement("th");
    durationHead.className = "duration";

    nameHead.innerHTML = "Track";
    artistHead.innerHTML = "Artist";
    durationHead.innerHTML = "Duration";
    headerRow.appendChild(nameHead);
    headerRow.appendChild(artistHead);
    headerRow.appendChild(durationHead);
    resultsTable.appendChild(headerRow);

    for(var track in results){
      var tr = document.createElement("tr");
      var name = document.createElement("td");
      var artist = document.createElement("td");
      var duration = document.createElement("td");

      tr.className = "clickableRow " + results[track].uri;
      name.className = results[track].uri + " name";
      artist.className = results[track].uri + " artist";
      duration.className = results[track].uri + " duration";

      name.innerHTML = results[track].name;
      artist.innerHTML = results[track].artists[0].name;
      var minutes = (results[track].duration_ms/60000) << 0;
      var seconds = (results[track].duration_ms/1000) % 60;
      if(seconds < 10){
        seconds = "0" + String(seconds).substring(0, 1);
      } else {
        seconds = String(seconds).substring(0, 2);
      }
      duration.innerHTML = minutes + ":" + seconds;

      tr.appendChild(name);
      tr.appendChild(artist);
      tr.appendChild(duration);
      resultsTable.appendChild(tr);
    }
    wrapper.appendChild(resultsTable);
  }
});
