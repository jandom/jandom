import * as pulumi from "@pulumi/pulumi";

pulumi.runtime.setMocks({
    newResource: function(type: string, name: string, inputs: any): {id: string, state: any} {
        return {
            id: inputs.name + "_id",
            state: inputs,
        };
    },
    call: function(token: string, args: any, provider?: string) {
        return args;
    },
});

describe("Infrastructure", function() {
    let infra: typeof import('../index');

    before(async function() {
        // It's important to import the program _after_ the mocks are defined.
        infra = await import('../index');
    })

    describe("#server", function() {
        const server = infra.server;
        // TODO(check 1): Instances have a Name tag.
        // TODO(check 2): Instances must not use an inline userData script.
    });

    describe("#group", function() {
        const group = infra.group;
        // TODO(check 3): Instances must not have SSH open to the Internet.
    });
});