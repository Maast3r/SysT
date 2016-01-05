class MainController < ApplicationController
  require 'rspotify'
  require 'omniauth-spotify'
  require 'rspotify/oauth'
  def index
    RSpotify.authenticate(ENV["SPOTIFY_CLIENT_KEY"], ENV["SPOTIFY_CLIENT_SECRET"])
    gon.sci = ENV["SOUNDCLOUD_CLIENT_ID"]
    gon.y = ENV["YOUTUBE_KEY"]
    gon.ti = ENV["TWITCH_CLIENT_ID"]

    if session[:spotifyHash]
      spotify_authentication(session[:spotifyHash])
    else
      auth_hash = request.env['omniauth.auth']
      if auth_hash != nil
        spotify_authentication(auth_hash)
      end
    end
  end

  def spotify_authentication(auth_hash)
    spotify_user = RSpotify::User.new(auth_hash)
    @spotify_playlists = spotify_user.playlists
    gon.spotifyPlaylists = @spotify_playlists
    gon.spotifyUserID = spotify_user.id
    gon.auth = auth_hash
    gon.u = spotify_user
    session[:spotifyHash] = auth_hash
  end
 
end
