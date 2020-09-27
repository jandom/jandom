import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { getDomainAndSubdomain, createDistributionArgs } from "./utils";

export class MyApp extends pulumi.ComponentResource {
  bucket: aws.s3.Bucket;
  cdn: aws.cloudfront.Distribution;
  record: aws.route53.Record;

  constructor(
    name: string,
    args: {
      targetDomain: string;
    },
    opts: any = {}
  ) {
    super("pkg:index:MyApp", name, {}, opts);
    const { targetDomain } = args;
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

    const tenMinutes = 60 * 10;

    // Per AWS, ACM certificate must be in the us-east-1 region.
    const eastRegion = new aws.Provider(
      "east",
      {
        profile: aws.config.profile,
        region: "us-east-1",
      },
      { parent: this }
    );

    const certificate = new aws.acm.Certificate(
      "certificate",
      {
        domainName: targetDomain,
        validationMethod: "DNS",
      },
      { provider: eastRegion, parent: this }
    );
    
    const domainParts = getDomainAndSubdomain(targetDomain);
    const hostedZoneId = aws.route53
      .getZone({ name: domainParts.parentDomain }, { async: true })
      .then((zone) => zone.zoneId);

    /**
     *  Create a DNS record to prove that we _own_ the domain we're requesting a certificate for.
     *  See https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html for more info.
     */
    const certificateValidationDomain = new aws.route53.Record(
      `${targetDomain}-validation`,
      {
        name: certificate.domainValidationOptions[0].resourceRecordName,
        zoneId: hostedZoneId,
        type: certificate.domainValidationOptions[0].resourceRecordType,
        records: [certificate.domainValidationOptions[0].resourceRecordValue],
        ttl: tenMinutes,
      },
      {
        parent: this,
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
      { provider: eastRegion, parent: this }
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
