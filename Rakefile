puts 'Init Bundler ...'
require 'bundler'
Bundler::GemHelper.install_tasks

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.join(File.dirname(__FILE__), 'Gemfile')
require 'bundler/setup' 
require 'sprockets'
require 'fileutils'

task :default => [:core] do
  
end

task :core do
  puts "Building zui53"
  FileUtils.mkdir 'build' unless File.exist? 'build'
  assets = Sprockets::Environment.new() do |env|
    env.logger = Logger.new(STDOUT)
  end
  
  assets.append_path "lib/assets/javascripts/zui53"
  assets.append_path "vendor/assets/javascripts"
  
  open("build/zui53.js", "w").write( assets["index"] )
end
