---
layout: post
title:  "Infrastructure as actual code for a startup"
date:   2019-12-27 00:00:00 +0100
---

## Background

What's the best way to setup infrastructure for a startup without a product-market fit?
Should you prototype rapidly using things like AWS Console, clicking and tweaking by hand, or should you take the disciplined choice and template everything?
Maybe ratchet up working prototypes and "up" them into templates?
Is there typically enough time and experience to template everything?
Or, conversely, will the click-ops swap you're creating today will slowly strangle you in the future?
If you've been there either as a team member or team leader, maybe grab some popcorn – because we're going for a ride....

## Intro

Looking at my company's infrastructure, I knew we were in trouble.
Everything was setup via the AWS web console, via click-ops.
This worked because we had nobody with the required experience, and we needed to ship our product.
We hired a consultant to setup the boilerplate and added resources as we went on.
And we've added more resources.
All the resources were in a single VPC with a single pubic subnet.
The "EC2 classic" was here and it was here for good.
At least we were sane enough to separate into 'staging', 'production' and 'testing' resources.

## The journey taken

Why should you trust some random guy's story?
Great question, I honestly don't have a an answer.
Now that the background is clear, what's next to describe?
What were the ways we went about solving the problem?
What did we try and why did we continue searching?
Probably we missed a few things but hopefully we're not (total) bozos.

### All aboard, the CloudFormation train

### How about a change at the Terraform junction

### Wandering in the dessert

The principal critique: markup language with evaluatinos, bleh


## Decision has been made, what next?

Does this tool even work? How can I check if it does?
Well, a minimal test would be jank over my personal page.

Why the personal page?
Because it's small enough to learn all the quirks of the tool, and I can screw up without consequences.
Additionally, it involves importing existing resources (created in AWS Web Console), which will happen A LOT when we move further down.

Why take it step by step? Why not just jump in?
"I pity the fool" – nothing beats incrementalism, if it's not greenfield. It's a new tool. You'll have to learn, your team will have to learn, and mistakes will be made.



Notes
- mention huss and the link he provided