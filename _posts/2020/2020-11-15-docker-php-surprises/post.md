---
layout: post
title:  "Surprises migrating a PHP application in Docker"
date:   2020-11-15 00:00:00 +0100
categories: docker php
---

# No good deed goes unpunished

Now, here is a familiar story. A new technology, slowly shifts from a shiny tool to a defacto standard. 
Sounds familiar, huh? Docker fit that category for us and we certainly resisted for as long as possible. 
Until one cold winter evening... an idea to migrate was born. 
In keeping with the times, I thought, why not try this Docker thing. 

To keep this post short and snappy, there will be no basics of Docker discussed. 
We're jumping straight in. 
The Dockerfile we used was nothing magical – there is plenty of advice available on this online anyway. 
With this simple Dockerfile we were able to expose our Symfony app on AWS ElasticBeanstalk. 
The migration took us from the PHP to the multi-container Docker flavor of AWS EB. 

```Dockerfile
FROM php:7.3-apache

RUN apt-get update

# MySQL
RUN docker-php-ext-install pdo_mysql
RUN docker-php-ext-install opcache

# Zip
RUN apt-get install -y libzip-dev unzip
RUN docker-php-ext-configure zip --with-libzip
RUN docker-php-ext-install zip

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Symfony
WORKDIR /var/www/symfony

# First copy over only composer files and install
# https://medium.com/@c.harrison/speedy-composer-installs-in-docker-builds-41eea6d0172b
COPY ./symfony/composer.* /var/www/symfony/
RUN composer install --prefer-dist --no-scripts --no-autoloader --no-dev

RUN chown -R www-data:www-data var/

# Apache
COPY ./apache2/000-default.conf      /etc/apache2/sites-available/

# Use the default production configuration
# https://hub.docker.com/_/php
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# PHP
RUN a2enmod rewrite
RUN a2enmod status
RUN a2enmod headers
RUN a2enconf file_upload
RUN a2enconf server_status

EXPOSE 80
```

# What's the problem

No we thought "this is simple enough" and pressed deploy. 
It took me a day or two to figure out all the details but soon enough the replacement Docker service was up and running. 
But something was off... The performance was 2x degraded relative to our production app. Not good. 
We started controlling for everything we could:
- allowed resources
- dependencies via `composer.lock`
- other details

None of this made any sense, or difference. 
A systematic 2x performance drop, across all endpoints, is fairly severe. 
This kind of discrepancy is more fitting with a major issue, like running in development mode of some sort, than smaller 10-20% performance boosts. 
So I took a step back – hang on, what's the setting that we're actually using with our ElasticBeanstalk? 
Took a quick dive into the EC2 nodes to see what we have enabled and started working through the output. 
Comparing the `php --info` from ElasticBeanstalk to the `php --info` from from Docker. 

It didn't take long to find that a fairly important extension was not enabled: Opcache. 
For those not familiar with the PHP ecosystem, here is a little introduction. 

>  OPcache improves PHP performance by storing precompiled script bytecode in shared memory, thereby removing the need for PHP to load and parse scripts on each request.

This was the moment the skies opened for me – it was a pretty likely lead. 

# How to fix the problem?

Turns out that the PHP reasonable defaults shipped with this Docker image were not super-reasonable in our hands.
I take full responsibility for being ignorant about the inner workings of PHP.
But come on, you can't ship an image without enough documentation to tell people about a super-essential step. 

To get performance to an acceptable level, we had to override some PHP defaults. 
How does one change settings in PHP? By providing overrides in `.ini` files. 
Two files are worth noting: `docker-php-ext-symfony.ini` and `docker-php-ext-opcache.ini`.  
You can see their contents below

```ini
# docker-php-ext-symfony.ini
[php]
memory_limit = 512M
upload_max_filesize = 100M
post_max_size = 100M
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT

# https://symfony.com/doc/current/performance.html
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
realpath_cache_size=4096K
realpath_cache_ttl=600
```

```ini
# docker-php-ext-opcache.ini
; Enable Zend OPcache extension module
zend_extension=opcache.so

; Determines if Zend OPCache is enabled
opcache.enable=1

; Determines if Zend OPCache is enabled for the CLI version of PHP
;opcache.enable_cli=0

; The OPcache shared memory storage size.
opcache.memory_consumption=128

; The amount of memory for interned strings in Mbytes.
opcache.interned_strings_buffer=8

; The maximum number of keys (scripts) in the OPcache hash table.
; Only numbers between 200 and 1000000 are allowed.
opcache.max_accelerated_files=4000

; Enables or disables copying of PHP code (text segment) into HUGE PAGES.
; This should improve performance, but requires appropriate OS configuration.
opcache.huge_code_pages=1
```

All that remained was updating the `Dockerfile` to copy these over during the build. 

```Dockerfile
# PHP
COPY ./docker-php-ext-opcache.ini /usr/local/etc/php/conf.d/
COPY ./docker-php-ext-labstep.ini /usr/local/etc/php/conf.d/
RUN a2enmod rewrite
RUN a2enmod status
RUN a2enmod headers
RUN a2enconf file_upload
RUN a2enconf server_status

EXPOSE 80
```

# Conclusions

Switching to Docker has been an awesome improvement for us. 
This is what the world is running on now and people seem to love it. 
But make no mistake: the default settings of a Docker image may surprise you. 
This is not a carefully curated configuration set used by Heroku or AWS ElasticBeanstalk. 
So deep-compare of the configs side-by-side may reveal crucial performance problems

