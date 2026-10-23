import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const github = config.require("github");
const ips = config.requireObject<string[]>("ips")
const ipv6s = config.requireObject<string[]>("ipv6s")

const main = new aws.route53.Zone("main", {
    name: "jandomanski.com",
    comment: "Managed by Pulumi",
});

new aws.route53.Record("www", {
    zoneId: main.zoneId,
    name: "www.jandomanski.com",
    type: "CNAME",
    ttl: 300,
    records: [
        github,
    ]
});

new aws.route53.Record("arecord", {
    zoneId: main.zoneId,
    name: "jandomanski.com",
    type: "A",
    ttl: 300,
    records: ips,
});

new aws.route53.Record("aaaarecord", {
    zoneId: main.zoneId,
    name: "jandomanski.com",
    type: "AAAA",
    ttl: 300,
    records: ipv6s,
});

