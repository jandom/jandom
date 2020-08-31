---
layout: post
title:  "Deploying a Create React App to AWS with Pulumi (part II)"
date:   2020-08-30 00:00:00 +0100
categories: pulumi aws react
---

![Introduction](/docs/images/posts/2020-07-30-deploy-create-react-app-aws-pulumi/logos.svg)

# Introduction

Welcome back to part II in the series on how to deploy Create React Apps to AWS infrastructure using Pulumi. 
This is a series of posts that covers simple architectures for creating web apps on AWS infrastructure. 

The series is mainly targeted at frontend developers who want to get their hands dirty with infrastructure, or somebody doing simple demos. 
The series can also be used for anybody as a gateway pill into the majestic world of Pulumi. 

By way of a re-cap, what did we do last time? 
- Outlined 3 possible architectures
- Transpiled a 'stock' Create React App
- Setup boilerplate for managing stack is pulumi

With all this out of the way, we have some new interesting waters to sail. 

## The plan

# Results

Before you jump in, and if you're returning to this series after a break, make sure that your environment is configured correctly. 

Here is a handy checklist
- Did you login to your pulumi project with `pulumi login`?
- Did you configure `PULUMI_CONFIG_PASSPHRASE` as your environment variable?

If yes, you can check if it's all working with `pulumi stack` to display the resources in the stack. 

## Updating the definition of an S3 bucket

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

Then we run the familiar `pulumi up` and here is a asciinema recording of how things sholud play out 

[![asciicast](https://asciinema.org/a/fhdrDlVWeBM5AOUfQHUPmr8CB.svg)](https://asciinema.org/a/fhdrDlVWeBM5AOUfQHUPmr8CB)

## Refactoring to allow for async calls

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

## Adding a Route 53 A-record

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

  // Get the hosted zone by domain name
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

[![asciicast](https://asciinema.org/a/j69yMkvwJfvqdJOjNjS3n5ZBR.svg)](https://asciinema.org/a/j69yMkvwJfvqdJOjNjS3n5ZBR)

## Using dig to confirm domain configuration change

> dig is the master tool that you need to know, just like cURL

Before the change

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


# Conclusions

# Credits
