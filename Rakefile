require 'bundler'
Bundler::GemHelper.install_tasks

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.join(File.dirname(__FILE__), 'Gemfile')
require 'bundler/setup' 
require 'sprockets'

task :default => [:core] do
  
end

task :core do
  puts "Building zui53"
  env = Sprockets::Environment.new
  env.paths << "lib/assets/javascripts/zui53"
  env.paths << "vendor"
  open("build/zui53.js", "w").write( env["index"] )
end
