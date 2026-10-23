# Homepage

## Prerequisites

A working ruby version that's higher than ubuntu's default
- https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-with-rbenv-on-ubuntu-18-04

## Installation

The repo has a single `Gemfile.lock` covering both Linux and macOS
(arm64/x86_64). GitHub Pages builds with its own `github-pages` gem and
ignores the lockfile; it only pins local builds.

### Ubuntu

Setup jekyll on ubuntu following instructions
- https://jekyllrb.com/docs/installation/ubuntu/

```bash
    gem install bundler
    bundle config set --local path 'vendor/bundle'
    bundle install
```

### macOS

The default macOS comes with a ruby interpreter that's very old. Use homebrew to upgrade ruby.

```bash
    brew install ruby@3.4
    gem install bundler
    bundle config set --local path 'vendor/bundle'
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

To update dependencies

    bundle update

To add a new platform to the lockfile (e.g. a new CI runner)

    bundle lock --add-platform <platform>

To serve on localhost

    RUBYOPT='-EUTF-8' bundle exec jekyll serve
