import * as pulumi from "@pulumi/pulumi";
import { MyApp } from "./src/my-app";
import { MyCertificate } from "./src/my-certificate";

function main() {
  const stackConfig = new pulumi.Config("my-app");
  const config = {
    // targetDomain is the domain/host to serve content at.
    targetDomain: stackConfig.require("targetDomain"),
  };

  const certificate = new MyCertificate('my-certificate', {
    targetDomain: config.targetDomain,
  });

  const myApp = new MyApp("my-app", {
    targetDomain: config.targetDomain,
    certificateValidation: certificate.certificateValidation,
  });

  const { cdn, bucket, record } = myApp;

  return {
    // Export the name of the bucket
    bucketName: bucket.id,
    // Export the name of the record
    recordName: record.name,
    // Export the CDN domain name 
    cdnURL: cdn.domainName,
  };
}

module.exports = main();
