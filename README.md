# Homepage

## Prerequisites

A working ruby version that's higher than ubuntu's default
- https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-18-04

## Installation

### Ubuntu

Setup jekyll on ubuntu following instructions 
- https://jekyllrb.com/docs/installation/ubuntu/

### macOS

The default macOS comes with a ruby interpreter that's very old. Use homebrew to upgrade ruby. 

    brew install ruby@3.4
    gem install bundler
    bundle config set --local path 'vendor/bundle'
    bundle install 

## Getting started

To create a new project

    jekyll new homepage

To run a local webserver

    bundle exec jekyll serve

## Import posts from blogger.com

Install the appropriate module/gem

    gem install jekyll-import

Follow the instructions
- https://import.jekyllrb.com/docs/blogger/
- https://support.google.com/blogger/answer/97416

Run the magical import command

```
ruby -r rubygems -e 'require "jekyll-import";
  JekyllImport::Importers::Blogger.run({
    "source"                => "blogger/blog-08-25-2019.xml",
    "no-blogger-info"       => false, # not to leave blogger-URL info (id and old URL) in the front matter
    "replace-internal-link" => false, # replace internal links using the post_url liquid tag.
  })'
```

## Development 

To update dependencies

    bundle update

To install dependencies on a clean slate
    
    rm Gemfile.lock
    bundle install

To serve on localhost

    bundle exec jekyll serve
