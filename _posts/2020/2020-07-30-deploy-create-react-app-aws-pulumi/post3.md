---
layout: post
title:  "Deploying a Create React App to AWS with Pulumi (part III)"
date:   2020-10-30 00:00:00 +0100
categories: pulumi aws react
---

![Introduction](/docs/images/posts/2020-07-30-deploy-create-react-app-aws-pulumi/logos.svg)

# Introduction

Welcome back to the series! We're nearly done here with your SPA application happily sitting behind a domain an an S3 bucket. 
Why push forward, you might ask? After all things are looking pretty dandy. 
Well, it turns out that serving files from your S3 bucket may not be the ideal option. 
Depending on how often your website changes on S3, and its probably not that often, you're essentially serving the same files over and over again. 
Would that make for an excellent case for caching? It would. 

Putting a content distribution network in front of the S3 bucket would allow you to cache the responses to incoming requests. 
For example, once a CSS file is shipped once, the CDN will keep track of it. 

Well, this seems complicated, is it really worth it? 
This setup is as close to "industry best practice as it gets". 
As a matter of fact, I'll be ripping off from [Pulumi's own tutorial](https://www.pulumi.com/docs/tutorials/aws/aws-ts-static-website/) pretty heavily and shamelessly. 
But to be completely honest, for a small  page like it probably doesn't make sense. 
Using GitHub Pages would be just as suitable of an alternative. 

## The plan

This is it people – it's the 3rd part and so we're entering "level HARD". 
No more joking around – and if you completed parts I and II, you're practically a cloud engineer now ;-) 

The principal aim will be to create an AWS CloudFront resource and place it between the S3 bucket and the Route53 domain. 
Additionally, we will create a new bucket for storing AWS CloudFront logs – but that's just a nice to have. 

As we're about to jump in, the time is ripe for a friendly warning:

> In this post we'll be working with the AWS CloudFront service, which is notoriously slow to work with – in the sense of configuration changes taking 15-20 minutes to perform.

So don't get your coffee just yet – there will be plenty of opportunity to do that later. 

# Results

## Logging back into Pulumi

Before jumping in, and especially if you're returning to this series after a break, make sure that your Pulumi environment is configured correctly. 

Here is a handy checklist
- Did you login to the right Pulumi project with `pulumi login`?
- Did you configure `PULUMI_CONFIG_PASSPHRASE` as your environment variable?

If yes, you can check if it's all working with `pulumi stack` to display the resources in the stack. 

```shell
$ pulumi stack
Current stack is dev:
    Managed by jans-mbp.mynet
    Last updated: 1 minute ago (2020-10-31 07:10:29.907622 +0000 UTC)
    Pulumi version: v2.12.1
Current stack resources (4):
    TYPE                              NAME
    pulumi:pulumi:Stack               my-app-dev
    ├─ aws:s3/bucket:Bucket           my-app.jandomanski.com
    ├─ aws:route53/record:Record      targetDomain
    └─ pulumi:providers:aws           default_3_11_0

Current stack outputs (2):
    OUTPUT      VALUE
    bucketName  my-app.jandomanski.com
    recordName  my-app.jandomanski.com
```

## Defining a helper function

Let's kick off with a very simple helper function.
The helper function takes a domain ("www.example.com") and returns an object with 2 properties (subdomain and parentDomain).
What this is needed for will become apparent soon!

```typescript
// Split a domain name into its subdomain and parent domain names.
// e.g. "www.example.com" => "www", "example.com".
function getDomainAndSubdomain(
  domain: string
): { subdomain: string; parentDomain: string } {
  const parts = domain.split(".");
  if (parts.length < 2) {
    throw new Error(`No TLD found on ${domain}`);
  }
  // No subdomain, e.g. awesome-website.com.
  if (parts.length === 2) {
    return { subdomain: "", parentDomain: domain };
  }

  const subdomain = parts[0];
  parts.shift(); // Drop first element.
  return {
    subdomain,
    // Trailing "." to canonicalize domain.
    parentDomain: parts.join(".") + ".",
  };
}
```

## Building the foundations

What do we have now? We have an S3 bucket and a Route53 record. 
We agreed to slot in a CDN in between those two. 
How exactly do we do that? 

The CDN can serve responses via HTTPS so let's provide it with a SSL certificate, as a nice bonus quest. 
So let's start by setting this up: insert the following snippet after the bucket definition. 

```typescript
  const domainParts = getDomainAndSubdomain("my-app.jandomanski.com");
  const hostedZoneId = aws.route53
    .getZone({ name: domainParts.parentDomain }, { async: true })
    .then((zone) => zone.zoneId);

  const tenMinutes = 60 * 10;

  // Per AWS, ACM certificate must be in the us-east-1 region.
  const eastRegion = new aws.Provider("east", {
    profile: aws.config.profile,
    region: "us-east-1",
  });
```

- The `tenMinutes` is just a simple constant that we'll use later,
- The `eastRegion` is more interesting.

The `eastRegion` is just a resource, like everything else in Pulumi, but it's important for the SSL. 
The SSL certificates can only be created in the "us-east-1" region. 
My default region is "eu-west-1" and thus I need an additional provider to create other resources in that region. 
This may not be necessary for you if you're already using the "us-east-1" region. 

This looks like a simple enough change, so let's be "greedy" and get this update done. 
Quick win to start the post. Here is what you should seen when you run `pulumi up`.

```shell
$ pulumi up
Previewing update (dev):
     Type                     Name        Plan       
     pulumi:pulumi:Stack      my-app-dev             
 +   └─ pulumi:providers:aws  east        create     
 
Resources:
    + 1 to create
    3 unchanged

Do you want to perform this update? yes
Updating (dev):
     Type                     Name        Status      
     pulumi:pulumi:Stack      my-app-dev              
 +   └─ pulumi:providers:aws  east        created     
 
Outputs:
    bucketName: "my-app.jandomanski.com"
    recordName: "my-app.jandomanski.com"

Resources:
    + 1 created
    3 unchanged

Duration: 16s

```

## Creating and validating an SSL certificate

With the `eastProvider` we can now create an SSL certificate on AWS. 
If you've ever done it manually, this will be **pure magic**.
Using a special resource, you can **automatically* validate the SSL certificate.
No more email validation, or manual DNS validation!
In this case, a Route53 record is created automatically to validate the certificate. 

```typescript
  const certificate = new aws.acm.Certificate(
    "certificate",
    {
      domainName: "my-app.jandomanski.com",
      validationMethod: "DNS",
    },
    { provider: eastRegion }
  );

  const certificateValidationDomain = new aws.route53.Record(
    "my-app.jandomanski.com-validation",
    {
      name: certificate.domainValidationOptions[0].resourceRecordName,
      zoneId: hostedZoneId,
      type: certificate.domainValidationOptions[0].resourceRecordType,
      records: [certificate.domainValidationOptions[0].resourceRecordValue],
      ttl: tenMinutes,
    }
  );

  const certificateValidation = new aws.acm.CertificateValidation(
    "certificateValidation",
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: [certificateValidationDomain.fqdn],
    },
    { provider: eastRegion }
  );
```

Let's run the update and get our SSL certificate. Here is what the pulumi output should look like:

```shell
$ pulumi up 
Previewing update (dev):
     Type                              Name                               Plan       
     pulumi:pulumi:Stack               my-app-dev                                    
 +   ├─ aws:acm:Certificate            certificate                        create     
 +   ├─ aws:route53:Record             my-app.jandomanski.com-validation  create     
 +   └─ aws:acm:CertificateValidation  certificateValidation              create     
 
Resources:
    + 3 to create
    4 unchanged

Do you want to perform this update? yes
Updating (dev):
     Type                              Name                               Status      
     pulumi:pulumi:Stack               my-app-dev                                     
 +   ├─ aws:acm:Certificate            certificate                        created     
 +   ├─ aws:route53:Record             my-app.jandomanski.com-validation  created     
 +   └─ aws:acm:CertificateValidation  certificateValidation              created     
 
Outputs:
    bucketName: "my-app.jandomanski.com"
    recordName: "my-app.jandomanski.com"

Resources:
    + 3 created
    4 unchanged

Duration: 57s
```

## Configuring and creating the CDN

AWS CloudFront is a complicated service with a lot of belts and whistles. 
Examples include 
- HTTPS -> HTTPS redirects, 
- ability to use AWS Lambdas to process requests and responses,
- injecting custom headers. 

Many of these features can be defined by `DistributionArgs`. 
It's rather verbose and almost completely copy&pasted from the [Pulumi Tutorial](https://www.pulumi.com/docs/tutorials/aws/aws-ts-static-website/) .
If you want a better sense of what's available in CDN configuration, have a look below:

```typescript
  // distributionArgs configures the CloudFront distribution. Relevant documentation:
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html
  // https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
  const distributionArgs: aws.cloudfront.DistributionArgs = {
    enabled: true,
    // Alternate aliases the CloudFront distribution can be reached at, in addition to https://xxxx.cloudfront.net.
    // Required if you want to access the distribution via config.targetDomain as well.
    aliases: ["my-app.jandomanski.com"],

    // We only specify one origin for this distribution, the S3 content bucket.
    origins: [
      {
        originId: bucket.arn,
        domainName: bucket.websiteEndpoint,
        customOriginConfig: {
          // Amazon S3 doesn't support HTTPS connections when using an S3 bucket configured as a website endpoint.
          // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginProtocolPolicy
          originProtocolPolicy: "http-only",
          httpPort: 80,
          httpsPort: 443,
          originSslProtocols: ["TLSv1.2"],
        },
      },
    ],

    defaultRootObject: "index.html",

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
      targetOriginId: bucket.arn,

      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],

      forwardedValues: {
        cookies: { forward: "none" },
        queryString: false,
      },

      minTtl: 0,
      defaultTtl: tenMinutes,
      maxTtl: tenMinutes,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: "PriceClass_100",

    // You can customize error responses. When CloudFront receives an error from the origin (e.g. S3 or some other
    // web service) it can return a different error code, and return the response for a different resource.
    customErrorResponses: [
      { errorCode: 404, responseCode: 404, responsePagePath: "/404.html" },
    ],

    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },

    viewerCertificate: {
      acmCertificateArn: certificateValidation.certificateArn, // Per AWS, ACM certificate must be in the us-east-1 region.
      sslSupportMethod: "sni-only",
    },
  };
```


Finally, let's add a line to create the CDN and run `pulumi up`.

```typescript
  const cdn = new aws.cloudfront.Distribution("cdn", distributionArgs);
```

Before proceeding, you should know one thing.

> WARNING AWS CloudFormation is a very big service and it can take a WHILE (5-25 minutes) to create or update resources

Here is what your pulumi up should look like

```shell
$ pulumi up 
Previewing update (dev):
     Type                            Name        Plan       
     pulumi:pulumi:Stack             my-app-dev             
 +   └─ aws:cloudfront:Distribution  cdn         create     
 
Resources:
    + 1 to create
    7 unchanged

Do you want to perform this update? yes
Updating (dev):
     Type                            Name        Status      
     pulumi:pulumi:Stack             my-app-dev              
 +   └─ aws:cloudfront:Distribution  cdn         created     
 
Outputs:
    bucketName: "my-app.jandomanski.com"
    recordName: "my-app.jandomanski.com"

Resources:
    + 1 created
    7 unchanged

Duration: 2m53s
```

## Updating the Route53

This is the final step and should take no time at all!
At the moment, we have a Route53 record that points to the S3 bucket holding the React app. 
The Route53 record is defined like this:

```typescript
  // Create a Route53 A-record
  const record = new aws.route53.Record("targetDomain", {
    name: "my-app.jandomanski.com",
    zoneId: hostedZoneId,
    type: "A",
    aliases: [
      {
        zoneId: bucket.hostedZoneId,
        name: bucket.websiteDomain,
        evaluateTargetHealth: true,
      },
    ],
  });
```

Now that we have a CDN, we can update the Route53 record to point to a new endpoint. 
Same domain name, same zoneId, just pointing to the new CDN – which acts as a proxy for the S3 bucket. 

```typescript
  // Create a Route53 A-record
  const record = new aws.route53.Record("targetDomain", {
    name: "my-app.jandomanski.com",
    zoneId: hostedZoneId,
    type: "A",
    aliases: [
      {
        name: cdn.domainName,
        zoneId: cdn.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });
```

Here is how the pulumi log output looks like

```shell
$ pulumi up 
Previewing update (dev):
     Type                   Name          Plan       Info
     pulumi:pulumi:Stack    my-app-dev               
 ~   └─ aws:route53:Record  targetDomain  update     [diff: ~aliases]
 
Resources:
    ~ 1 to update
    7 unchanged

Do you want to perform this update? yes
Updating (dev):
     Type                   Name          Status      Info
     pulumi:pulumi:Stack    my-app-dev                
 ~   └─ aws:route53:Record  targetDomain  updated     [diff: ~aliases]
 
Outputs:
    bucketName: "my-app.jandomanski.com"
    recordName: "my-app.jandomanski.com"

Resources:
    ~ 1 updated
    7 unchanged

Duration: 51s
```

## Testing if it all works

There are some quick ways to diagnose if we got what we want the two simple tests should be 

- open http://my-app.jandomanski.com -> should redirect to https://
- open https://my-app.jandomanski.com -> should open index.html
- open https://my-app.jandomanski.com/index.html -> same as above

Beyond, there are some further advanced experiments we can do using curl. 

First of all, remember `index.html` and how we set the Cache-Control headers? 
Well, those are respected by the CDN. 
You can clearly see this by hitting the endpoint with cURL. 

```shell
$ curl https://my-app.jandomanski.com/index.html -I
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 2219
Connection: keep-alive
Date: Sun, 01 Nov 2020 19:20:52 GMT
Cache-Control: no-cache,no-store
Last-Modified: Sun, 01 Nov 2020 19:20:43 GMT
ETag: "67e4d5da5073a0ba60ce72a01c3feee4"
Server: AmazonS3
X-Cache: Miss from cloudfront
Via: 1.1 a5c420a169b19bd150b00f34513e997d.cloudfront.net (CloudFront)
X-Amz-Cf-Pop: LHR62-C3
X-Amz-Cf-Id: P3048HiqZZ66rJ2PujNg44G51v2wzkwumXp1aO2LOumDmbsT03nVFg==

```

You can hit this over and over again, in all cases you'll get `X-Cache: Miss from cloudfront` and `Cache-Control: no-cache,no-store`. 
Because of the Cache-Control header, the content is always served from S3 directly. 
What about other files? Does caching work for them as expected?

```shell
$ curl https://my-app.jandomanski.com/favicon.ico -I
HTTP/1.1 200 OK
Content-Type: image/x-icon
Content-Length: 3150
Connection: keep-alive
Date: Sun, 01 Nov 2020 19:24:45 GMT
Cache-Control: max-age=31536000
Last-Modified: Sat, 31 Oct 2020 08:31:51 GMT
ETag: "6e1267d9d946b0236cdf6ffd02890894"
Server: AmazonS3
X-Cache: Hit from cloudfront
Via: 1.1 6fc6ff9b881f0fff41ff95cfddcc92eb.cloudfront.net (CloudFront)
X-Amz-Cf-Pop: LHR52-C1
X-Amz-Cf-Id: 6MIpI2IkMlT1UiGnmP4hsO8qM_TIbxEG5ZbhRh3fhoGREYz_O08Snw==
Age: 3
```

Can you see the `Cache-Control` and `X-Cache` headers above? Both indicate a few things about the CDN:
- it respected the Cache-Control property we set on the S3 objects,
- it cached the appropriate files, and is serving them from cache – no trips to the S3 bucket are done. 


# Conclusions

So that's it, right? 
Over the course of the series, we travelled from a very simple S3 hosting of a simple site. 
Things were simple then but not very cost efficient. 
Then we added a Route53 domain for some nice access. 
Finally, we put a CDN in front of the S3 bucket as a caching layer. 

But did we sacrifice something? The initial `index.ts` seemed very simple but the one we have now is quite large. 
Is there a way to refactor? How to make this more modular?
What about testing? Is there an easy way to test this code, without creating the infrastructure?
Well, those are very wise questions indeed – and we'll answer them in the BONUS fourth part to this series. 
