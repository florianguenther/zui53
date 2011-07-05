require 'sinatra'
use Rack::Static, :urls => ["/dist"]

run Sinatra::Application
