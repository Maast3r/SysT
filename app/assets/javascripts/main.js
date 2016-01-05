$(document).ready(function(){
  var selectedSong;

  $("#allSelector").click(function(){
    changeColors("allBody", "allNav", "allInput", "allLabel", "allBar", "allLeft", "allScroll");
    swapResultsFrame("all");
  });

  $("#spotifySelector").click(function(){
    changeColors("spotifyBody", "spotifyNav", "spotifyInput", "spotifyLabel", "spotifyBar", "spotifyLeft", "spotifyScroll");
    swapResultsFrame("spotify");
    swapLeftFrame("spotify");
  });

  $("#soundcloudSelector").click(function(){
    changeColors("soundcloudBody", "soundcloudNav", "soundcloudInput", "soundcloudLabel", "soundcloudBar", "soundcloudLeft", "soundcloudScroll");
    swapResultsFrame("soundcloud");
    swapLeftFrame("soundcloud");
  });

  $("#youtubeSelector").click(function(){
    changeColors("youtubeBody", "youtubeNav", "youtubeInput", "youtubeLabel", "youtubeBar", "youtubeLeft", "youtubeScroll");
    swapResultsFrame("youtube");
    swapLeftFrame("youtube");
  });

  $("#githubSelector").click(function(){
    window.location.href = "https://www.github.com/Maast3r";
  });

  document.getElementById('query').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){ //enter key
      if(this.value != "" || this.value.length > 0){
        if(this.className == "allInput"){
          searchAll(this.value);
          swapResultsFrame("all");
        }  else if(this.className == "spotifyInput"){
          searchSpotify(this.value, false);
          swapResultsFrame("spotify");
        } else if(this.className == "soundcloudInput"){
          searchSoundcloud(this.value, false);
          swapResultsFrame("soundcloud");
        } else if(this.className == "youtubeInput"){
          searchYoutube(this.value, false);
          swapResultsFrame("youtube");
        }
      }
    }
  }

  function changeColors(bodyColor, navbarColor, inputColor, labelColor, barColor, leftColor, scrollColor){
    document.body.className = bodyColor;
    document.getElementById("navBar").className = navbarColor;
    document.getElementById("query").className = inputColor;
    document.getElementById("searchLabel").className = labelColor;
    document.getElementById("bar").className = barColor;
    document.getElementById("leftWrapper").className = leftColor;
    document.getElementById("results").className = scrollColor;
  }

  function swapResultsFrame(focus){
    var results = document.getElementById("results");
    var tables = results.getElementsByTagName("table");
    for(var i=0; i<tables.length; i++){
      if(tables[i].className == focus + "Table"){
        tables[i].style.display = "table";
      } else {
        tables[i].style.display = "none";
      }
    }
    if(focus == "twitch"){
      document.getElementById("twitchView").style.display = "block";
      document.getElementById("twitchResults").style.display = "block";
      document.getElementById("twitchChat").style.display = "none";
    } else {
      document.getElementById("twitchView").style.display = "none";
      document.getElementById("twitchResults").style.display = "none";
      document.getElementById("twitchChat").style.display = "none";
    }
  }

  function swapLeftFrame(focus){
    if(focus == "spotify"){
      var left = document.getElementById(focus + "Playlist");
      if(gon.spotifyPlaylists) {
        createPlaylistResults(left);
        createPlaylistHover();
      } else {
        left.innerHTML = "<h3>Not Logged in. <br /><a href='/auth/spotify'>Sign into Spotify</a></h3>";
        focusLeftFrame(focus);
      }
      left.style.display = "block";
    } else if(focus == "soundcloud"){
      focusLeftFrame(focus);
    } else if(focus == "youtube"){
      if(gon.youtubePlaylist){
        // display youtube playlist
      } else {
        left.innerHTML = "<h3>Not Logged in. <br /><a href='/auth/spotify'>Sign into Youtube</a></h3>";
        focusLeftFrame(focus);
      }
      left.style.display = "block";
    }
  }

  function focusLeftFrame(focus){
    var playlists = document.getElementsByClassName("playlist");
    for(var i=0; i<playlists.length; i++){
      if(playlists[i].id != focus + "Playlist"){
        playlists[i].style.display = "none";
      }
    }
  }

  function createPlaylistResults(left){
    left.innerHTML = "<h3>Playlists</h3>";
    var playlists = gon.spotifyPlaylists;
    var playlistUl = document.createElement("ul");

    for(var i=0; i<playlists.length; i++){
      var li = document.createElement("li");
      li.id = playlists[i].id;
      li.className = "clickablePlaylist";
      li.innerHTML = playlists[i].name;
      playlistUl.appendChild(li);
    }

    left.appendChild(playlistUl);
  }

  function createPlaylistHover(){
    $("<div id='contextMenu-playlists' class='custom-menu spotifyScroll'><ul id='rightClickPlaylists' class='context-menu-items'></ul></div>")
        .appendTo("body")
        .css({display: "none"});
    var playlists = gon.spotifyPlaylists;
    for(var i=0; i<playlists.length; i++){
      var li = document.createElement("li");
      li.id = playlists[i].id;
      li.className = "addSongToPlaylist hoverable";
      li.innerHTML = playlists[i].name;
      document.getElementById("rightClickPlaylists").appendChild(li);
    }
  }

  function resetPlaylistClick(playlist){
    var lis = playlist.getElementsByTagName("li");
    for(var i=0; i<lis.length; i++){
      if(lis[i].className.split(" ")[1] == "selectedSpotifyRow"){
        lis[i].className = lis[i].className.split(" ")[0];
      }
    }
  }

  var spotifyPlaylistSongs = [];

  function getPlaylistSongs(playlistID, offset){
    console.log(gon.auth);
    $.ajax({
  		url: 'https://api.spotify.com/v1/users/' + gon.spotifyUserID + '/playlists/' + playlistID + '/tracks?offset=' + offset,
  		type: 'GET',
  		dataType: 'json',
  		params:{
        offset: offset
  		},
      headers: {
          Authorization: "Bearer " + gon.auth.credentials.token
      },
  		success: function(resp){
        for(var i=0; i<resp.items.length; i++){
          spotifyPlaylistSongs.push(resp.items[i].track);
        }
        offset+=100;
        if(resp.next){
          getPlaylistSongs(playlistID, offset);
        } else {
          createResultsTable(spotifyPlaylistSongs, document.getElementById("results"), "spotify", false);
        }
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown){
  			alert("Could not get playlist. " + errorThrown);
  		}
  	});
  }

  function clearContextMenu(){
    if(document.getElementById("contextMenu")){
      var menu = document.getElementById("contextMenu");
      menu.parentNode.removeChild(menu);
      clearHoverPlaylist();
    }
  }

  function showHoverMenu(y, x, song){
    var hoverMenu = document.getElementById("contextMenu-playlists");
    hoverMenu.style.display = "block";
    hoverMenu.style.left = x + 155 + "px";
    hoverMenu.style.top = y + "px";
  }

  function clearHoverPlaylist(){
    var hoverMenu = document.getElementById("contextMenu-playlists");
    hoverMenu.style.display = "none";
  }

  function addToPlaylist(song, playlist){
    console.log(song);
    console.log(playlist);
    $.ajax({
  		url: 'https://api.spotify.com/v1/users/' + gon.spotifyUserID + '/playlists/' + playlist + '/tracks?uris=' + song,
  		type: 'POST',
  		dataType: 'json',
  		data:{
  		},
      headers: {
          Authorization: "Bearer " + gon.auth.credentials.token
      },
  		success: function(resp){
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown){
  			alert("Could add song to playlist. " + errorThrown);
  		}
  	});
  }

  $(document).on('click', ".clickablePlaylist", function(event){
    clearTable(document.getElementsByClassName("spotifyTable")[0]);
    spotifyPlaylistSongs = [];
    resetPlaylistClick(event.target.parentNode);
    event.target.className = event.target.className + " selectedSpotifyRow";
    getPlaylistSongs(event.target.id, 0);
  });

  document.addEventListener("click", function(e) {
    clearContextMenu();
  });

  //http://www.sitepoint.com/building-custom-right-click-context-menu-javascript/
  $(document).bind("contextmenu", function(event) {
    clearContextMenu();
    if(event.target.parentNode.className.split(" ")[3] == "spotify"){
      event.preventDefault();
      event.target.click();
      $("<div id='contextMenu' class='custom-menu'><ul class='context-menu-items'><li id='addTo' class='context-menu-item'><a href='#' class='context-menu-link'>Add Song to Playlist    <i class='fa fa-angle-right'></i></a></li></ul></div>")
          .appendTo("body")
          .css({top: event.pageY + "px", left: event.pageX + "px"});
      $("#addTo").hover(function(){
        showHoverMenu(event.pageY, event.pageX);
      });
    }
  });

  $(document).on('dblclick', ".clickableRow", function(event) {
    var source = event.target.parentNode.className.split(" ")[3];
    if(source == "spotify"){
      changeSpotifyFrame(event.target.className.split(" ")[0]);
    } else if(source == "soundcloud"){
      changeSoundcloudFrame(event.target.className.split(" ")[0]);
    } else if(source == "youtube"){
      changeYoutubeFrame(event.target.className.split(" ")[0]);
    }
  });

  $(document).on('click', ".clickableRow", function(event) {
    selectedSong = event.target.parentNode.className.split(" ")[1];
    if(event.target.tagName === "TD"){
      resetTable(event.target.parentNode.parentNode);
      var row = event.target.parentNode;
      if(row.parentNode.className == "allTable"){
        row.className = row.className + " selectedAllRow";
      } else if(row.parentNode.className == "spotifyTable"){
        row.className = row.className + " selectedSpotifyRow";
      } else if(row.parentNode.className == "soundcloudTable"){
        row.className = row.className + " selectedSoundcloudRow";
      } else if(row.parentNode.className == "youtubeTable"){
        row.className = row.className + " selectedYoutubeRow";
      }
    }
  });

  $(document).on('click', ".addSongToPlaylist", function(event) {
    addToPlaylist(selectedSong, event.target.id);
  });

  var spotifyResult, soundcloudResult, youtubeResult;

  function searchAll(query){
    searchSpotify(query, true, searchSoundcloud);
  }

  function allResults(spotify, soundcloud, youtube){
    createResultsTable(spotify, document.getElementById("results"), "spotify", true);
    createResultsTable(soundcloud, document.getElementById("results"), "soundcloud", true);
    createResultsTable(youtube, document.getElementById("results"), "youtube", true);
  }

  function searchSpotify(query, all, callback){
    query = query.replace(" ", "+");
    $.ajax({
  		url: 'https://api.spotify.com/v1/search?q=' + query + '&type=track&limit=25',
  		type: 'GET',
  		dataType: 'json',
  		data:{
  		},
  		success: function(resp){
        if(!all){
          var resultsTable = document.getElementsByClassName("spotifyTable")[0];
          clearTable(resultsTable);
          createResultsTable(resp.tracks.items, document.getElementById("results"), "spotify", false);
        } else {
          spotifyResult = resp.tracks.items;
          callback(query, all, searchYoutube);
        }
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown){
  			alert("Could not search Spotify. " + errorThrown);
  		}
  	});
  }

  SC.initialize({
    client_id: gon.sci
  });

  function searchSoundcloud(query, all, callback){
    SC.get('/tracks', {
      q: query
    }).then(function(tracks) {
      if(!all){
        var resultsTable = document.getElementsByClassName("soundcloudTable")[0];
        clearTable(resultsTable);
        createResultsTable(tracks, document.getElementById("results"), "soundcloud", false);
      } else {
        soundcloudResult = tracks;
        callback(query, all, allResults);
      }
    });
  }

  function searchYoutube(query, all, callback){
  	query = query.replace(" ", "+");
  	$.ajax({
  		url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + query + '&key=' + gon.y + '&maxResults=25&type=video',
  		type: 'GET',
  		dataType: 'json',
  		data:{
  		},
  		success: function(resp){
  			if(!all){
          var resultsTable = document.getElementsByClassName("youtubeTable")[0];
          clearTable(resultsTable);
          createResultsTable(resp.items, document.getElementById("results"), "youtube", false);
        } else {
          youtubeResult = resp.items;
          callback(spotifyResult, soundcloudResult, youtubeResult);
        }
  		},
  		error: function(XMLHttpRequest, textStatus, errorThrown){
  			alert("Could not search Youtube. " + errorThrown);
  		}
  	});
  }

  function changeSpotifyFrame(newURI){
    document.getElementById("spotifyFrameWrapper").innerHTML = "<iframe id='spotifyFrame' src=https://embed.spotify.com/?uri=" + newURI + " height='80' frameborder='0' allowtransparency='true'></iframe>";
  }

  function changeSoundcloudFrame(newURI){
    document.getElementById("soundcloudFrameWrapper").innerHTML = "<iframe id='soundcloudFrame' src='http://w.soundcloud.com/player/?url=" + newURI + "&auto_play=true' height='80' frameborder='0' allowtransparency='true'></iframe>";
  }

  function changeYoutubeFrame(newURI){
    document.getElementById("youtubeFrameWrapper").innerHTML = "<iframe id=\"youtubeFrame\" type=\"text/html\" src=\"http://www.youtube.com/embed/" + newURI + "?autoplay=1\" height=\"75\" frameborder=\"0\"></iframe>";
  }

  function resetTable(table){
    var resultsTable = table;
    for (var i = 1; i < resultsTable.rows.length; i++) {
       if(resultsTable.rows[i].className.split(" ").length == 5){
         resultsTable.rows[i].className = resultsTable.rows[i].className.split(" ")[0] + " " + resultsTable.rows[i].className.split(" ")[1] + " " + resultsTable.rows[i].className.split(" ")[2] + " " + resultsTable.rows[i].className.split(" ")[3];
       }
    }
  }

  function clearTable(table){
    for(var i=0; i< table.rows.length;){
      table.deleteRow(i);
    }
  }

  function createResultsTable(results, wrapper, source, all){
    var resultsTable;
    if(!all){
      resultsTable = document.getElementsByClassName(source+"Table")[0];
    } else{
      resultsTable = document.getElementsByClassName("allTable")[0];
    }
    var headerRow = document.createElement("tr");
    var nameHead = document.createElement("th");
    var artistHead = document.createElement("th");
    var durationHead = document.createElement("th");
    durationHead.className = "duration";

    if(!all){
      nameHead.innerHTML = "Track";
    } else {
      nameHead.innerHTML = "Track <i class='fa fa-" + source + "'></i>";
    }
    nameHead.className = "name";
    artistHead.innerHTML = "Artist";
    artistHead.className = "artist"
    durationHead.innerHTML = "Duration";
    durationHead.className = "duration";
    headerRow.appendChild(nameHead);
    headerRow.appendChild(artistHead);
    headerRow.appendChild(durationHead);
    resultsTable.appendChild(headerRow);

    for(var track in results){
      var tr = document.createElement("tr");
      var name = document.createElement("td");
      var artist = document.createElement("td");
      var duration = document.createElement("td");

      if(source == "youtube"){
        tr.className = "clickableRow " + results[track].id.videoId + " 1 " + source;
        name.className = results[track].id.videoId + " name";
        artist.className = results[track].id.videoId + " artist";
        duration.className = results[track].id.videoId + " duration";
      } else {
        tr.className = "clickableRow " + results[track].uri + " 1 " + source;
        name.className = results[track].uri + " name";
        artist.className = results[track].uri + " artist";
        duration.className = results[track].uri + " duration";
      }

      if(source == "spotify"){
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
      } else if(source == "soundcloud"){
        name.innerHTML = results[track].title;
        artist.innerHTML = results[track].user.username;
        var minutes = (results[track].duration/60000) << 0;
        var seconds = (results[track].duration/1000) % 60;
        if(seconds < 10){
          seconds = "0" + String(seconds).substring(0, 1);
        } else {
          seconds = String(seconds).substring(0, 2);
        }
        duration.innerHTML = minutes + ":" + seconds;
      } else if(source == "youtube"){
        name.innerHTML = results[track].snippet.title;
        artist.innerHTML = results[track].snippet.channelTitle;
        var minutes = (results[track].duration/60000) << 0;
        var seconds = (results[track].duration/1000) % 60;
        if(seconds < 10){
          seconds = "0" + String(seconds).substring(0, 1);
        } else {
          seconds = String(seconds).substring(0, 2);
        }
        duration.innerHTML = minutes + ":" + seconds;
      }

      tr.appendChild(name);
      tr.appendChild(artist);
      tr.appendChild(duration);
      resultsTable.appendChild(tr);
    }
    wrapper.appendChild(resultsTable);
  }

  function hideAllLeft(){
    var left = document.getElementById("resultsLeft");
    var divs = left.getElementsByTagName("div");
    for(var i=0; i<divs.length; i++){
      divs[i].style.display = "none";
    }
  }

  Twitch.init({clientId: gon.ti}, function(error, status){
    if (status.authenticated){
      $('#twitchSelector').click(function() {
        changeColors("twitchBody", "twitchNav", "twitchInput", "twitchLabel", "twitchBar", "twitchLeft", "twitchScroll");
        swapResultsFrame("twitch");
        hideAllLeft();
        document.getElementById("twitchResults").style.display = "block";
        Twitch.api({method: 'streams/followed'}, function(error, results) {
          if(results.streams.length == 0){
            createTwitchResults(false);
          } else {
            createTwitchResults(results.streams);
          }
        });
      });
    } else {
      $('#twitchSelector').click(function() {
        Twitch.login({
            scope: ['user_read', 'channel_read']
        });
        changeColors("twitchBody", "twitchNav", "twitchInput", "twitchLabel", "twitchBar", "twitchLeft", "twitchScroll");
        swapResultsFrame("twitch");
        hideAllLeft();
        document.getElementById("twitchResults").style.display = "block";
      });
    }
  });
  // $('#logout button').click(function() {
  //     Twitch.logout();
  // });

  function createTwitchResults(results){
    var leftWrapper = document.getElementById("twitchResults");
    leftWrapper.innerHTML =  "";

    if(results){
      var resultList = document.createElement("ul");
      resultList.id = "streamID";
      resultList.className = "streamList";

      for(var result in results){
        var li = document.createElement("li");
        li.className = results[result].channel.status;

        var liInner = document.createElement("div");
        liInner.className = "liInner " + results[result].channel.display_name;
        liInner.innerHTML = results[result].channel.display_name + " playing " + results[result].channel.game + "<br />" + results[result].channel.status;

        li.appendChild(liInner);
        resultList.appendChild(li);
      }

      var resultTitle = document.createElement("h3");
      resultTitle.innerHTML = "Current Live Streamers:";
      resultTitle.style.marginBottom = "30px";

      leftWrapper.appendChild(resultTitle);
      leftWrapper.appendChild(resultList);

      $(document).on('click', ".liInner", function(event) {
        changeStream(event.target.className.split(" ")[1]);
        changeStreamTitle(event.target.parentNode.className);
      });
    } else {
      var noResults = document.createElement("h3");
      noResults.innerHTML = "No following streamers currently live."
      leftWrapper.appendChild(noResults);
    }
  }

  function changeStream(name){
    document.getElementById("streamWrapper").innerHTML = "<object id=\"stream\" type=\"application/x-shockwave-flash\" height=\"100%\" width=\"100%\" data=\"http://www.twitch.tv/widgets/live_embed_player.swf?channel=" + name + "\" bgcolor=\"#000000\"><param name=\"allowFullScreen\" value=\"true\" /><param name=\"allowScriptAccess\" value=\"always\" /><param name=\"allowNetworking\" value=\"all\" /><param name=\"scale\" value=\"default\"><param name=\"movie\" value=\"http://www.twitch.tv/widgets/live_embed_player.swf\" /><param name=\"flashvars\" value=\"hostname=www.twitch.tv&channel=" + name + "&auto_play=true&start_volume=25\" /></object>";

    document.getElementById("twitchChat").innerHTML = "<iframe id=\"chat\" frameborder=\"0\" scrolling=\"no\" src=\"http://twitch.tv/" + name + "/chat?popout=\" height=\"100%\" width=\"100%\"></iframe>";
  }

  function changeStreamTitle(status){
    document.getElementById("streamTitle").innerHTML = status + "<div class='tooltip'>" + status + "</div>";
  }

  $("#liveStreamersButton").click(function(){
    document.getElementById("twitchChat").style.display = "none";
    document.getElementById("twitchResults").style.display = "block";
  });

  $("#chatButton").click(function(){
    document.getElementById("twitchResults").style.display = "none";
    document.getElementById("twitchChat").style.display = "block";
  });

});
