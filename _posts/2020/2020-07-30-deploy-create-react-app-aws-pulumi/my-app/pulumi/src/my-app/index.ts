import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { tenMinutes, getDomainAndSubdomain } from "../utils";

function createDistributionArgs(
  targetDomain: string,
  bucket: aws.s3.Bucket,
  certificateValidation: aws.acm.CertificateValidation,
  tenMinutes: number
): aws.cloudfront.DistributionArgs {
  // distributionArgs configures the CloudFront distribution. Relevant documentation:
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html
  // https://www.terraform.io/docs/providers/aws/r/cloudfront_distribution.html
  return {
    enabled: true,
    // Alternate aliases the CloudFront distribution can be reached at, in addition to https://xxxx.cloudfront.net.
    // Required if you want to access the distribution via config.targetDomain as well.
    aliases: [targetDomain],

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
}

export class MyApp extends pulumi.ComponentResource {
  bucket: aws.s3.Bucket;
  cdn: aws.cloudfront.Distribution;
  record: aws.route53.Record;

  constructor(
    name: string,
    args: {
      targetDomain: string;
      certificateValidation: aws.acm.CertificateValidation;
    },
    opts: any = {}
  ) {
    super("pkg:index:MyApp", name, {}, opts);
    const { targetDomain, certificateValidation } = args;
    // Create an AWS resource (S3 Bucket)
    this.bucket = new aws.s3.Bucket(
      targetDomain,
      {
        bucket: targetDomain,
        acl: "public-read",
        website: {
          indexDocument: "index.html",
        },
      },
      { parent: this }
    );

    const distributionArgs = createDistributionArgs(
      targetDomain,
      this.bucket,
      certificateValidation,
      tenMinutes
    );

    this.cdn = new aws.cloudfront.Distribution("cdn", distributionArgs, {
      parent: this,
    });

    const domainParts = getDomainAndSubdomain(targetDomain);
    const hostedZoneId = aws.route53
      .getZone({ name: domainParts.parentDomain }, { async: true })
      .then((zone) => zone.zoneId);

    // Create a Route53 A-record
    this.record = new aws.route53.Record(
      "targetDomain",
      {
        name: targetDomain,
        zoneId: hostedZoneId,
        type: "A",
        aliases: [
          {
            name: this.cdn.domainName,
            zoneId: this.cdn.hostedZoneId,
            evaluateTargetHealth: true,
          },
        ],
      },
      { parent: this }
    );
  }
}
