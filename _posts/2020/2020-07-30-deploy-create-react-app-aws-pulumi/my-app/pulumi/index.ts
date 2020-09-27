import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

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

async function main() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.Bucket("my-app.jandomanski.com", {
    bucket: "my-app.jandomanski.com",
    acl: "public-read",
    website: {
      indexDocument: "index.html",
    },
  });

  const tenMinutes = 60 * 10;

  // Per AWS, ACM certificate must be in the us-east-1 region.
  const eastRegion = new aws.Provider("east", {
    profile: aws.config.profile,
    region: "us-east-1",
  });

  const certificate = new aws.acm.Certificate(
    "certificate",
    {
      domainName: "my-app.jandomanski.com",
      validationMethod: "DNS",
    },
    { provider: eastRegion }
  );

  const domainParts = getDomainAndSubdomain("my-app.jandomanski.com");
  const hostedZoneId = aws.route53
    .getZone({ name: domainParts.parentDomain }, { async: true })
    .then((zone) => zone.zoneId);

  /**
   *  Create a DNS record to prove that we _own_ the domain we're requesting a certificate for.
   *  See https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html for more info.
   */
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

  /**
   * This is a _special_ resource that waits for ACM to complete validation via the DNS record
   * checking for a status of "ISSUED" on the certificate itself. No actual resources are
   * created (or updated or deleted).
   *
   * See https://www.terraform.io/docs/providers/aws/r/acm_certificate_validation.html for slightly more detail
   * and https://github.com/terraform-providers/terraform-provider-aws/blob/master/aws/resource_aws_acm_certificate_validation.go
   * for the actual implementation.
   */
  const certificateValidation = new aws.acm.CertificateValidation(
    "certificateValidation",
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: [certificateValidationDomain.fqdn],
    },
    { provider: eastRegion }
  );

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

  const cdn = new aws.cloudfront.Distribution("cdn", distributionArgs);

  // Get the hosted zone by domain name
  const hostedZone = await aws.route53.getZone({ name: "jandomanski.com" });

  // Create a Route53 A-record
  const record = new aws.route53.Record("targetDomain", {
    name: "my-app.jandomanski.com",
    zoneId: hostedZone.zoneId,
    type: "A",
    aliases: [
      {
        name: cdn.domainName,
        zoneId: cdn.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });

  return {
    // Export the name of the bucket
    bucketName: bucket.id,
    // Export the name of the record
    recordName: record.name,
  };
}

module.exports = main();
