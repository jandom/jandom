import * as pulumi from "@pulumi/pulumi";
import "mocha";
import * as assert from "assert";

pulumi.runtime.setMocks({
  newResource: function (
    type: string,
    name: string,
    inputs: any
  ): { id: string; state: any } {
    console.log("hello=", type, inputs);
    switch (type) {
      case "aws:acm/certificate:Certificate":
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
            arn: "arn:aws:some-cert-arn",
          },
        };
      case "aws:route53/record:Record":
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
          },
        };
      case "aws:acm/certificateValidation:CertificateValidation":
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
          },
        };
      // case "aws:ec2/securityGroup:SecurityGroup":
      //     return {
      //         id: "sg-12345678",
      //         state: {
      //             ...inputs,
      //             arn: "arn:aws:ec2:us-west-2:123456789012:security-group/sg-12345678",
      //             name: inputs.name || name + "-sg",
      //         },
      //     };
      // case "aws:ec2/instance:Instance":
      //     return {
      //         id: "i-1234567890abcdef0",
      //         state: {
      //             ...inputs,
      //             arn: "arn:aws:ec2:us-west-2:123456789012:instance/i-1234567890abcdef0",
      //             instanceState: "running",
      //             primaryNetworkInterfaceId: "eni-12345678",
      //             privateDns: "ip-10-0-1-17.ec2.internal",
      //             publicDns: "ec2-203-0-113-12.compute-1.amazonaws.com",
      //             publicIp: "203.0.113.12",
      //         },
      //     };
      default:
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
          },
        };
    }
  },
  call: function (token: string, args: any, provider?: string) {
    return args;
  },
});

// It's important to import the program _after_ the mocks are defined.
import * as infra from "./index";

describe("MyCertificate", function () {
  const targetDomain = "some.domain.com";
  const resource = new infra.MyCertificate("my-certificate", {
    targetDomain,
  });
  it("must have a targetDomain", function (done) {
    pulumi.all([resource.certificate.domainName]).apply(([domainName]) => {
      assert.equal(domainName, targetDomain);
      done();
    });
  });
  it("must have a certificateValidation", function (done) {
    pulumi
      .all([resource.certificateValidation.certificateArn])
      .apply(([certificateArn]) => {
        assert.equal(certificateArn, "arn:aws:some-cert-arn");
        done();
      });
  });
});
