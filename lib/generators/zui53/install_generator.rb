module Zui53
class InstallGenerator < Rails::Generators::Base
  desc "Copies zui53 assets"
  source_root File.expand_path('../../../../build', __FILE__)

  def copy_stylesheets_and_images
    copy_file "zui53.js", "app/assets/javascripts/zui53.js"
    
    # ["zui53.js.coffee"].each do |f|
    #   copy_file "javascripts/zui53/#{f}", "app/assets/javascripts/#{f}"
    # end
    # copy_file "images/css3buttons/css3-github-buttons-icons.png", 
    #           "public/images/css3buttons/css3-github-buttons-icons.png"
    # copy_file "stylesheets/css3buttons/css3-github-buttons.css", 
    #           "public/stylesheets/css3buttons/css3-github-buttons.css"
    # copy_file "stylesheets/css3buttons/reset.css", 
    #           "public/stylesheets/css3buttons/reset.css"
    # gsub_file "public/stylesheets/css3buttons/css3-github-buttons.css", /url\(css3buttons/, "url(/images/css3buttons"
  end
end
end