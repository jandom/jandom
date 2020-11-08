import * as pulumi from "@pulumi/pulumi";
import * as assert from "assert";
import "mocha";

pulumi.runtime.setMocks({
  newResource: function (
    type: string,
    name: string,
    inputs: any
  ): { id: string; state: any } {
    switch (type) {
      case "aws:acm/certificate:Certificate":
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
            arn: "arn:aws:some-cert-arn",
          },
        };
      case "aws:acm/certificateValidation:CertificateValidation":
        return {
          id: inputs.name + "_id",
          state: {
            ...inputs,
          },
        };
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
