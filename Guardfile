# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'coffeescript', :input => 'src', :output => 'dist'
guard 'sass', :input => 'src', :output => 'dist'

guard 'livereload' do
  # watch(%r{app/.+\.(erb|haml)})
  # watch(%r{app/helpers/.+\.rb})
  watch(%r{(dist/|test/).+\.(css|js|html)})
  # watch(%r{(app/assets/.+\.css)\.scss}) { |m| m[1] }
  # watch(%r{(app/assets/.+\.js)\.coffee}) { |m| m[1] }
  # watch(%r{config/locales/.+\.yml})
end


