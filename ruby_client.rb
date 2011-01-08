require 'rubygems'
require 'yajl'
require 'yajl/http_stream'

require 'pp'

Yajl::HttpStream.get(URI.parse("http://localhost:3000/world")) do |frame|
  pp frame
end
