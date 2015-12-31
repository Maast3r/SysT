require 'test_helper'

class UserControllerTest < ActionController::TestCase
  test "should get spotify" do
    get :spotify
    assert_response :success
  end

end
