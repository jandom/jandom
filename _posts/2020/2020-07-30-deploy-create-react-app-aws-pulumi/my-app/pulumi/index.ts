import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

function main() {
  // Create an AWS resource (S3 Bucket)
  const bucket = new aws.s3.Bucket("my-app.jandomanski.com", {
    bucket: "my-app.jandomanski.com",
    acl: "public-read",
    website: {
      indexDocument: "index.html",
    },
  });

  // Get the hosted zone by domain name
  const hostedZoneId = aws.route53
    .getZone({ name: "jandomanski.com" }, { async: true })
    .then((zone) => zone.id);

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

  return {
    // Export the name of the bucket
    bucketName: bucket.id,
    // Export the name of the record
    recordName: record.name,
  };
}

module.exports = main();
