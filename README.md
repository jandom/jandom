# Homepage

## Prerequisites

A working ruby version that's higher than ubuntu's default
- https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-18-04

## Installation

This repo keeps a single `Gemfile` plus one lockfile per platform
(`Gemfile-linux.lock`, `Gemfile-mac.lock`). After cloning, pick the right one
by writing it into the local bundler config — every subsequent
`bundle install` and `bundle exec` then picks it up automatically.

### Ubuntu

Setup jekyll on ubuntu following instructions
- https://jekyllrb.com/docs/installation/ubuntu/

```bash
    gem install bundler
    bundle config set --local path 'vendor/bundle'
    bundle config set --local lockfile Gemfile-linux.lock
    bundle install
```

### macOS

The default macOS comes with a ruby interpreter that's very old. Use homebrew to upgrade ruby.

```bash
    brew install ruby@3.4
    gem install bundler
    bundle config set --local path 'vendor/bundle'
    bundle config set --local lockfile Gemfile-mac.lock
    bundle install
```

## Getting started

To create a new project

    jekyll new homepage

To run a local webserver

    RUBYOPT='-EUTF-8' bundle exec jekyll serve

(`RUBYOPT='-EUTF-8'` works around an old `jekyll-sass-converter` that opens
SCSS files as US-ASCII under Ruby 3.x.)

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

To update dependencies for the currently-selected lockfile

    bundle update

To install dependencies on a clean slate, delete the platform lockfile
you're targeting and re-resolve, e.g. on macOS:

    rm Gemfile-mac.lock
    bundle install

To serve on localhost

    RUBYOPT='-EUTF-8' bundle exec jekyll serve
