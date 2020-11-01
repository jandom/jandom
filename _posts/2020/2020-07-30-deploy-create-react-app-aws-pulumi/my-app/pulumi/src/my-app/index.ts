import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import {
  createDistributionArgs,
  tenMinutes,
  getDomainAndSubdomain,
} from "../utils";

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
