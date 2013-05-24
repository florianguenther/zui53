# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)

Gem::Specification.new do |s|
  s.name        = "zui53"
  s.version     = "0.0.3"
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Florian Günther"]
  s.email       = ["mail@gee-f.de"]
  s.homepage    = ""
  s.summary     = %q{ZUI JavaScript Library}
  s.description = %q{ZUI53 is a JavaScript Library to create powerfull webbased Zoomable User Interfaces (ZUIs) with new technologies like HTML5 and CSS3.}

  # s.rubyforge_project = "zui53"

  s.files         = `git ls-files`.split("\n")
  # s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  # s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
