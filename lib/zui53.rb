module Zui53
  if ::Rails.version >= "3.1"
    class Engine < ::Rails::Engine
      def self.hallo
        puts "Hello World"
      end
    end
  end
end
