import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { MyApp } from "./src/my-app";

function main() {
  const stackConfig = new pulumi.Config("my-app");
  const config = {
    // targetDomain is the domain/host to serve content at.
    targetDomain: stackConfig.require("targetDomain"),
  };

  const myApp = new MyApp("my-app", {
    targetDomain: config.targetDomain,
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
