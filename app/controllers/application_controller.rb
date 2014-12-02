class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  include ModesHelper
  #before_action :check_ip

  protected
    def check_ip
      if edit_mode?
        unless (controller_name == 'notes' && action_name == 'maintenance')
          redirect_to maintenance_url unless (request.ip == '202.216.100.21' || request.ip == '202.211.12.2' || request.ip == '127.0.0.1')
        end
      end
    end
end
