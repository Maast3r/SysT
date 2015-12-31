class MainController < ApplicationController
  require 'rspotify'
  require 'omniauth-spotify'
  require 'rspotify/oauth'
  def index
    RSpotify.authenticate(ENV["SPOTIFY_CLIENT_KEY"], ENV["SPOTIFY_CLIENT_SECRET"])
    @spotify_client_key = ENV["SPOTIFY_CLIENT_KEY"]
    @spotify_client_secret = ENV["SPOTIFY_CLIENT_SECRET"]
    @soundcloud_id = ENV["SOUNDCLOUD_CLIENT_ID"]
    @youtube_key = ENV["YOUTUBE_KEY"]
    @twitch_id = ENV["TWITCH_CLIENT_ID"]

    if session[:spotifyUserID]
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
    session[:spotifyUserID] = spotify_user.id
    session[:spotifyHash] = auth_hash
  end

end
