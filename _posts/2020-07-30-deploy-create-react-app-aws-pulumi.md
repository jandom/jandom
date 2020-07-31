---
layout: post
title:  "Deploying a Create React App to AWS with pulumi"
date:   2020-07-30 00:00:00 +0100
categories: pulumi aws react
---

# Getting started with create react app

So you have just created your first app in create react app.

https://reactjs.org/docs/create-a-new-react-app.html

You built it, change some source files. It works! Well, it works on your machine. 
What's next? How do you actually get it out there, running? 
You can build it but you want to ship it

The aim of this guide is to provide a step-by-step, incremental improvement journey. 
What's the point in showing you how to build the castle, if it's not clear why one needs anything more than a shack?

This is not just a cookbook recipie that assumes things will work out. 
When possible, debuig and diagnostic commands are run to make sure things are in the state that they need to be. 

This will be a big journey but if we can break it up into smaller substeps. 
Iteratively, we'll go from a shack to a castle. 

# Starting with a 'stock' create react app

So what's the starting point of this journey? 
If you follow the create react app docs, you'll see something like tis 

```console
npx create-react-app my-app
cd my-app
npm build
```

This gives you a build/ directory – let's have a look inside

```console
$ ls build/
asset-manifest.json					logo512.png						service-worker.js
favicon.ico						manifest.json						static
index.html						precache-manifest.a6c522ff242ab9465073ffb9aae702c8.js
logo192.png						robots.txt
```

But what do we do with that? How do you get your precious creation into the cloud?
How to ensure that as you push updates to your app clients get the latest version?
There are some big questions there, in particular which *cache directives* to set for the files in build/. 
These settings will be super important for the browser. 
We'll cover all of that later once we have the nuts and bolts ready. 

Can these topics feel confusing and annoying? Hell yeah. 
Have you ever seen them covered coprehensively in create react app documentation? Hell no. 

## The plan

The first step is getting an AWS account. That's a little basic for this post and perhaps it's better to leave it for the reader to research. 

What will we need from AWS? It is going to be a million services or just a few? For now just two: the app will need a domain (Route 53) and we'll need a place to put the files into (for that pourpose an S3 bucket will do). 

There are further wrinkles. Which caching settings to use for the resources? How to scale the service in the future and how to monitor it? All these we'll be covered here – we'll be building up from the simplest shack to a more robust confgiruation. 

## To click or not to click?

What's the gateway drug of AWS? It's obviously the AWS console. 
Things are very easy to setup but once the complexity becomes larger, things get trickier. 
How trickier? Suppose you want to do a production environment, but then also a staging and a testing one. 
How would you apply a configuration change accross all 3 environemnts? Well, unfrontunately, it's point and click. We don't want to do that, we'll use something else

# Serving directly from S3 (easy)

## Getting started with Pulumi 

To avoid setting up resources in AWS console by hand, we'll use Pulumi to write little programs that setup resources on the AWS cloud. These programs are declarative and can be written in any language of your choice, Javascript/Python, so it's very easy to do. 

https://www.pulumi.com/docs/get-started/aws/begin/

What's the first decision we need to make? It's deciding where to put the pulumi code managing our infrastructur. 
Let's create a new directory 'pulumi', alongside the 'build' directory. 

```console
$ mkdir pulumi
$ ls
README.md	build		node_modules	package.json	public		pulumi		src		yarn.lock
$ cd pulumi
```

Then let's login into pulumi, here we'll use the --local flag to just use a file on the filesystem. 

```console
$ pulumi login --local
```


So why not get started and create a new pulumi project?

```console
$ pulumi new aws-typescript
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name: (pulum) my-app
project description: (A minimal AWS TypeScript Pulumi program) 
Created project 'my-app'

stack name: (dev) 
Enter your passphrase to protect config/secrets: 
Re-enter your passphrase to confirm: 
Created stack 'dev'

Enter your passphrase to unlock config/secrets
    (set PULUMI_CONFIG_PASSPHRASE to remember): 
aws:region: The AWS region to deploy into: (us-east-1) eu-west-1
Saved config

Installing dependencies...


> @pulumi/docker@2.2.3 install /Users/jandom/workspace/weekend-side-projects/from-shacks-to-castles-in-the-cloud/my-app/pulumi/node_modules/@pulumi/docker
> node scripts/install-pulumi-plugin.js resource docker v2.2.3

[resource plugin docker-2.2.3] installing
Downloading plugin: 16.77 MiB / 16.77 MiB [=========================] 100.00% 6s
Moving plugin... done.

> @pulumi/aws@2.13.0 install /Users/jandom/workspace/weekend-side-projects/from-shacks-to-castles-in-the-cloud/my-app/pulumi/node_modules/@pulumi/aws
> node scripts/install-pulumi-plugin.js resource aws v2.13.0

[resource plugin aws-2.13.0] installing
Downloading plugin: 66.67 MiB / 66.67 MiB [========================] 100.00% 30s
Moving plugin... done.

> protobufjs@6.10.1 postinstall /Users/jandom/workspace/weekend-side-projects/from-shacks-to-castles-in-the-cloud/my-app/pulumi/node_modules/protobufjs
> node scripts/postinstall

added 103 packages from 227 contributors and audited 103 packages in 52.356s

13 packages are looking for funding
run `npm fund` for details

found 0 vulnerabilities

Finished installing dependencies

Your new project is ready to go! ✨

To perform an initial deployment, run 'pulumi up'
```

## Creating an AWS S3 bucket to hold the create react app

Before we jump in, let's have a look around what we got at this step. 
There should now be a first pulumi program in index.ts, let's have a look

## Configuring the bucket to serve the page directly

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
    acl: "public-read",
    website: {
        indexDocument: "index.html",
    },
});

// Export the name of the bucket
export const bucketName = bucket.id;
```

This is too simple for what we want to do but good enough for now. 

Let's get this miniature to work – if there are any problems in your pulumi config you'll catch them now. 
What's better than incremental progression, when you're breaking new ground and trying not to get lost?

To get pulumi to show you the available stacks (dev, production, testing), just run 

```console
$ pulumi stack ls
NAME  LAST UPDATE  RESOURCE COUNT
dev*  n/a          n/a
```

## Creating an S3 bucket to hold the assets

Now we should be ready to get our first piece of infrastructure setup in pulumi!

```console
$ pulumi up
Previewing update (dev):
     Type                 Name        Plan       
 +   pulumi:pulumi:Stack  my-app-dev  create     
 +   └─ aws:s3:Bucket     my-bucket   create     
 
Resources:
    + 2 to create

Do you want to perform this update? yes
Updating (dev):
     Type                 Name        Status      
 +   pulumi:pulumi:Stack  my-app-dev  created     
 +   └─ aws:s3:Bucket     my-bucket   created     
 
Outputs:
    bucketName: "my-bucket-6daefdf"

Resources:
    + 2 created

Duration: 11s

Permalink: file:///Users/jandom/.pulumi/stacks/dev.json
```

Heading over to AWS console, you should see the bucket created and view its contents

![Bucket Created](bucket-created.png)

## Publishing contents to the S3 bucket 

Quick checklist: we've got the build/ direcotry, we've got a bucket on S3. 

What's in the bucket? Well, shocking and not unexpecedtly, nothing. 

```console
$ aws s3 ls s3://my-bucket-f01e841
```

Yup, nada. So let's get some stuff in there! What could be easier?

```console
$ aws s3 cp build/ s3://my-bucket-f01e841 --recursive
upload: build/favicon.ico to s3://my-bucket-f01e841/favicon.ico
upload: build/static/css/main.5f361e03.chunk.css.map to s3://my-bucket-f01e841/static/css/main.5f361e03.chunk.css.map
upload: build/index.html to s3://my-bucket-f01e841/index.html  
upload: build/service-worker.js to s3://my-bucket-f01e841/service-worker.js
upload: build/robots.txt to s3://my-bucket-f01e841/robots.txt  
upload: build/manifest.json to s3://my-bucket-f01e841/manifest.json
upload: build/precache-manifest.a6c522ff242ab9465073ffb9aae702c8.js to s3://my-bucket-f01e841/precache-manifest.a6c522ff242ab9465073ffb9aae702c8.js
upload: build/asset-manifest.json to s3://my-bucket-f01e841/asset-manifest.json
upload: build/static/css/main.5f361e03.chunk.css to s3://my-bucket-f01e841/static/css/main.5f361e03.chunk.css
upload: build/logo192.png to s3://my-bucket-f01e841/logo192.png 
upload: build/logo512.png to s3://my-bucket-f01e841/logo512.png
upload: build/static/js/2.a430f49c.chunk.js.LICENSE.txt to s3://my-bucket-f01e841/static/js/2.a430f49c.chunk.js.LICENSE.txt
upload: build/static/js/main.4f4a69a4.chunk.js to s3://my-bucket-f01e841/static/js/main.4f4a69a4.chunk.js
upload: build/static/js/runtime-main.f8c5b4be.js to s3://my-bucket-f01e841/static/js/runtime-main.f8c5b4be.js
upload: build/static/media/logo.5d5d9eef.svg to s3://my-bucket-f01e841/static/media/logo.5d5d9eef.svg
upload: build/static/js/runtime-main.f8c5b4be.js.map to s3://my-bucket-f01e841/static/js/runtime-main.f8c5b4be.js.map
upload: build/static/js/main.4f4a69a4.chunk.js.map to s3://my-bucket-f01e841/static/js/main.4f4a69a4.chunk.js.map
upload: build/static/js/2.a430f49c.chunk.js to s3://my-bucket-f01e841/static/js/2.a430f49c.chunk.js
upload: build/static/js/2.a430f49c.chunk.js.map to s3://my-bucket-f01e841/static/js/2.a430f49c.chunk.js.map
```

Now hat was easy... but is that what we want? Well... Everything in build got published so that's good news. 
But we probably don't want map files published in production. 
Also what about the caching settings? Does this thing actually work? 
There is only one way to find out: with the swiss-army knife of all things web, cURL

```console
$ curl https://my-bucket-f01e841.s3-eu-west-1.amazonaws.com/index.html
<?xml version="1.0" encoding="UTF-8"?>
<Error><Code>AccessDenied</Code><Message>Access Denied</Message><RequestId>079C0D51FEE2F8E1</RequestId><HostId>FPIAUu0YGJ1XEyCTuJPdSWiAQGBLkC7ftzbraMq4FchBUo7kEv8MTjoemmXumaiyIffhTv/ikMk=</HostId></Error>
```

Now that's a funny thing: the S3 bucket contents are not available to us by default. They are private.
We can certainly change that!

```console
aws s3 rm s3://my-bucket-f01e841/ --recursive

aws s3 sync build s3://my-bucket-f01e841/ \
  --acl public-read \
  --cache-control max-age=31536000 \
  --exclude index.html

aws s3 cp build/index.html s3://my-bucket-f01e841/index.html \
  --metadata-directive REPLACE \
  --cache-control max-age=0,no-cache,no-store,must-revalidate \
  --content-type text/html \
  --acl public-read
```

And with any luck, all of these should upload. Let's test how things are working by requesting index.html 

```console
$ curl http://my-bucket-f01e841.s3-eu-west-1.amazonaws.com/index.html -v
...
< Cache-Control: max-age=0,no-cache,no-store,must-revalidate
...
<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/>...
```

Importantly we also need to change to 

```console
$ curl -v http://my-bucket-f01e841.s3-website-eu-west-1.amazonaws.com
* Rebuilt URL to: http://my-bucket-f01e841.s3-website-eu-west-1.amazonaws.com/
*   Trying 52.218.60.172...
* TCP_NODELAY set
* Connected to my-bucket-f01e841.s3-website-eu-west-1.amazonaws.com (52.218.60.172) port 80 (#0)
> GET / HTTP/1.1
> Host: my-bucket-f01e841.s3-website-eu-west-1.amazonaws.com
> User-Agent: curl/7.54.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< x-amz-id-2: VKg+mTQ8wGUge3GzLx9J1BN+cBUNmbQuixY95AZ4wgV4U7H9fKF3v8is1ms6tUTalGIEUMwEW+Y=
< x-amz-request-id: 1ZAT1PAWEP0MFXAR
< Date: Wed, 29 Jul 2020 19:11:31 GMT
< Cache-Control: max-age=0,no-cache,no-store,must-revalidate
< Last-Modified: Tue, 28 Jul 2020 19:57:17 GMT
< ETag: "67e4d5da5073a0ba60ce72a01c3feee4"
< Content-Type: text/html
< Content-Length: 2219
< Server: AmazonS3
< 
* Connection #0 to host my-bucket-f01e841.s3-website-eu-west-1.amazonaws.com left intact
<!doctype html><html lang="en"><head><meta charset="utf-8"/>
```

## Caching settings 

Following this StackOverflow thread, we'll follow similar defaults https://stackoverflow.com/questions/49604821/cache-busting-with-cra-react

> Using Cache-Control: max-age=31536000 for your build/static assets, and Cache-Control: no-cache for everything else is a safe and effective starting point that ensures your user's browser will always check for an updated index.html file, and will cache all of the build/static files for one year. Note that you can use the one year expiration on build/static safely because the file contents hash is embedded into the filename.

This is a much wider topic and we'll only stick to the simplest solution. 
Searching around for best pratctices might give you some ideas for what to do depending on your situation. 

# Serving directly from S3 with Route53 (medium)

IN PROGRESS

# Serving directly from S3 with Route53 and CDN (hard)

IN PROGRESS


TODO
- Adding a Route53 domain pointing to the bucket
- Bolting on a CDN to help with large loads
- Bucket for logging?
- Server-side rendering?
- Diagrams within a common frame of refrenec