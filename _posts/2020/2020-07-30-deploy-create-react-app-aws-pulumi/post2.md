---
layout: post
title:  "Deploying a Create React App to AWS with Pulumi (part II)"
date:   2020-08-30 00:00:00 +0100
categories: pulumi aws react
---

![Introduction](/docs/images/posts/2020-07-30-deploy-create-react-app-aws-pulumi/logos.svg)

# Introduction

Welcome back to part II in the series! If you remember, we're going to figure out how to deploy a small Create React App to AWS infrastructure.
How are we going to do that exactly? Using a neat tool called Pulumi. 
While using Create React App as an example, we'll cover reusable architectures for creating any web apps on AWS infrastructure. 

The series is mainly targeted at frontend developers who want to get their hands dirty with AWS infrastructure. 
The series can also be useful if you're looking for a gateway drug into the majestic world of Pulumi. 

By way of a re-cap, what did we do last time? 
- Outlined 3 possible architectures (easy, medium and hard),
- Transpiled a 'stock' Create React App and got a build,
- Setup boilerplate for managing stacks of infrastructure resources is Pulumi,
- Deployed the "easy" architecture (a single S3 bucket).

With all this out of the way, we have some new interesting waters to sail. 

## The plan

So what's new this time around? We'll be putting together the "medium architecture", it's time to make things interesting. 
What exactly are looking for? Well, instead of accessing the app via the S3 bucket URL, it'd be nice to park it behind a proper domain (www.your-create-react-app.com). 
AWS manages DNS records via a service called Route53, so we're going to use that. 

What domain do we want use? It doesn't really matter, maybe use some domain that you already bought? 
In this guide, I'll use a subdomain at `myapp.jandomanski.com`.

# Results

Before jumping in, and especially if you're returning to this series after a break, make sure that your Pulumi environment is configured correctly. 

Here is a handy checklist
- Did you login to the right Pulumi project with `pulumi login`?
- Did you configure `PULUMI_CONFIG_PASSPHRASE` as your environment variable?

If yes, you can check if it's all working with `pulumi stack` to display the resources in the stack. 

```shell
$ pulumi stack
Current stack is dev:
    Managed by jans-mbp.mynet
    Last updated: 2 weeks ago (2020-08-31 21:21:49.628757 +0100 BST)
    Pulumi version: v2.9.1
Current stack resources (4):
    TYPE                              NAME
    pulumi:pulumi:Stack               my-app-dev
    ├─ aws:s3/bucket:Bucket           my-app.jandomanski.com
    ├─ aws:route53/record:Record      targetDomain
    └─ pulumi:providers:aws           default_2_13_0

Current stack outputs (2):
    OUTPUT      VALUE
    bucketName  my-app.jandomanski.com
    recordName  my-app.jandomanski.com
```

## Updating the definition of an S3 bucket

At the end of the last article, we were left with the following Pulumi program. 
The program create an S3 bucket that we could access at a public URL `my-bucket-f01e841.s3-eu-west-1.amazonaws.com`. 

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

That's a good start but hardly adequate. 
How can we publish your app to `my-bucket-f01e841.s3-eu-west-1.amazonaws.com`? 
Clearly nobody will care, it looks weird. 
What's needed here is a nice domain such as `my-app.jandomanski.com`. 

To get there, we first need rewrite that program slightly: to serve contents as a website, the S3 service needs bucket names to contain the domain name.


```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-app.jandomanski.com", {
    bucket: "my-app.jandomanski.com",
    acl: "public-read",
    website: {
        indexDocument: "index.html",
    },
});

// Export the name of the bucket
export const bucketName = bucket.id;
```

Then we run the familiar `pulumi up` and here is a recording of how things should play out: `my-bucket` gets deleted and `my-app.jandomanski.com` gets created. 

[![asciicast](https://asciinema.org/a/fhdrDlVWeBM5AOUfQHUPmr8CB.svg)](https://asciinema.org/a/fhdrDlVWeBM5AOUfQHUPmr8CB)

## Refactoring to allow for async calls

Things are looking great – we're iteratively moving towards the designed solution. 
It's time for a little twist: a refactor to take advantage of the `async` functionality in Pulumi.
Why is that needed, why add all this complexity of promises? 
Pulumi relies heavily on promises and to use some of the needed functionality, things have to be wrapped in an `async` block. 
Can I please ask you to take this one on faith (for a moment) and believe that an explanation will be given later? 

Here is the program wrapped in an `async` function. 

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

async function main() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.Bucket("my-app.jandomanski.com", {
    bucket: "my-app.jandomanski.com",
    acl: "public-read",
    website: {
      indexDocument: "index.html",
    },
  });

  return {
    // Export the name of the bucket
    bucketName: bucket.id,
  };
}

module.exports = main();
```

We can now run `pulumi up` again but since no resources are changed, it doesn't really matter. 

## Adding a Route 53 A-record

So why did we add this silly `async` block and make all the people who hate promises stop reading?
What's our aim here? We need to put our S3 bucket behind a domain. 
To do that, we need to create a Route53 record in the DNS. 
How do we create Route53 record in the DNS? Well, we take an existing hosted zone (I'm assuming that you have that setup already) and use that to create the Record. 

Getting the hosted zone uses this magical invocation 
```typescipt
await aws.route53.getZone({ name: "jandomanski.com" })
```

Any `await` has to be wrapped in an `async` function. 
Here is the entire pulumi program. It retrieves the hosted zone information (via an `await` call) and creates a DNS record linking the domain to the S3 bucket. 

```typescript
async function main() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.Bucket("my-app.jandomanski.com", {
    bucket: "my-app.jandomanski.com",
    acl: "public-read",
    website: {
      indexDocument: "index.html",
    },
  });

  // Get an *existing* hosted zone by domain name
  const hostedZone = await aws.route53.getZone({ name: "jandomanski.com" });

  // Create a Route53 A-record
  const record = new aws.route53.Record("targetDomain", {
    name: "my-app.jandomanski.com",
    zoneId: hostedZone.zoneId,
    type: "A",
    aliases: [{
        zoneId: bucket.hostedZoneId,
        name: bucket.websiteDomain,
        evaluateTargetHealth: true,
    }],
  });

  return {
    // Export the name of the bucket
    bucketName: bucket.id,
    // Export the name of the record
    recordName: record.name,
  };
}
```

With our new program, we need to run `pulumi up` again to create new resources with our cloud provider. 
Here is a recording that shows more-or-less what should happen. 
[![asciicast](https://asciinema.org/a/j69yMkvwJfvqdJOjNjS3n5ZBR.svg)](https://asciinema.org/a/j69yMkvwJfvqdJOjNjS3n5ZBR?t=34)

## Using dig to confirm domain configuration change

Joy fills the air - you did it! Using a small Pulumi program, you ran to AWS and made it update the DNS for your website.
But you know what's the funny thing about DNS changes? Changes to the DNS can tak a while to propagate. 

Hang on... but what if something is not working? 
Let's say you go to `my-app.jandomanski.com` in your browser and the page doesn't open. What then?
How do you know if you still need for the DNS to propagate VS if there was a bug in your config that got propatade?
What tools are available to diagnose DNS issues? Well, look no further keen reader and open your mind to the power of `dig`.

> dig is the master tool that you need to know, just like cURL


```
$ dig my-app.jandomanski.com

; <<>> DiG 9.10.6 <<>> my-app.jandomanski.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 57372
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;my-app.jandomanski.com.                IN      A

;; ANSWER SECTION:
my-app.jandomanski.com. 5       IN      A       52.218.101.76

;; Query time: 13 msec
;; SERVER: 192.168.1.1#53(192.168.1.1)
;; WHEN: Mon Aug 31 21:22:57 BST 2020
;; MSG SIZE  rcvd: 67
```

After the change

```
$ dig my-app.jandomanski.com 

; <<>> DiG 9.10.6 <<>> my-app.jandomanski.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 19688
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;my-app.jandomanski.com.                IN      A

;; AUTHORITY SECTION:
jandomanski.com.        490     IN      SOA     ns-906.awsdns-49.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400

;; Query time: 667 msec
;; SERVER: 192.168.1.1#53(192.168.1.1)
;; WHEN: Mon Aug 31 21:23:06 BST 2020
;; MSG SIZE  rcvd: 132
```

## Using cURL to confirm page contents can be loaded

We're almost there! We've created a DNS record and confirmed that it has been propagated correctly using `dig`. 
What's left to do is to confirm that your app can still be accessed. 
Accessing it via the bucket URL should continue to work, let's test that quickly. 

```console 
$ curl http://my-app.jandomanski.com.s3-website-eu-west-1.amazonaws.com -I
HTTP/1.1 200 OK
x-amz-id-2: GmBsU0g/xUwEbglwJtNF9kccPdPooUengo+M4JJUF74sS9qVK81mByp7mAL4LMyTcq8vOBSEYWw=
x-amz-request-id: 54B4D8A94D9BF9F8
Date: Mon, 31 Aug 2020 20:17:44 GMT
Cache-Control: no-cache,no-store
Last-Modified: Mon, 31 Aug 2020 20:15:25 GMT
ETag: "67e4d5da5073a0ba60ce72a01c3feee4"
Content-Type: text/html
Content-Length: 2219
Server: AmazonS3
```

Okay, all good here. What about accessing it via the domain? Let's try a simple test via `curl` just like above. 

```console
$ curl http://my-app.jandomanski.com -I
HTTP/1.1 200 OK
x-amz-id-2: Gf/CYg8wVqE9DH1qj6/YCkCJU7NfgukwsENIEKGRuXRs0B33557+euz5mKtiTvskWSyYaHvwFrE=
x-amz-request-id: 4F134C079414F428
Date: Mon, 31 Aug 2020 20:25:52 GMT
Cache-Control: no-cache,no-store
Last-Modified: Mon, 31 Aug 2020 20:15:25 GMT
ETag: "67e4d5da5073a0ba60ce72a01c3feee4"
Content-Type: text/html
Content-Length: 2219
Server: AmazonS3
```

Whoa, that's really cool! It worked!

# Conclusions

Well done for bearing with this one. There was a lot of group covered in this episode
- New Pulumi concepts, managing DNS records via AWS Route53 service
- Using await/async calls in Pulumi programs to access certain functionality
- Diagnosing and debugging DNS setting using `dig`

This was much harder than the previous "easy" architecture, and a lot more complex!
Now you have a domain with an S3 bucket but is that all we need?
- What about access via HTTPS? 
- What happens if many people access the domain? 
  - How does AWS price access to S3 bucket contents? Can we cache them somehow?

All this and more in the 3rd and final episode. 

# Credits
