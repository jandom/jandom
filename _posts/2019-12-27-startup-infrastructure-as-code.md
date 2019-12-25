---
layout: post
title:  "Infrastructure as code far a startup"
date:   2019-12-27 00:00:00 +0100
---

## Background

Looking at my company's infrastructure, I knew we were in trouble.
Everything was setup via the AWS web console, via click-ops.
This worked because we had nobody with the required experience, and we needed to ship our product.
We hired a consultant to setup the boilerplate and added resources as we went on.
All the resources were in a single VPC with a single pubic subnet.
The "EC2 classic" was here and it was here for good.
At least we were sane enough to separate into 'staging', 'production' and 'testing' resources.

## The first question

Does this tool even work? How can I check if it does?
Well, a minimal test would be jank over my personal page.

Why the personal page?
Because it's small enough to learn all the quirks of the tool, and I can screw up without consequences.
Additionally, it involves importing existing resources (created in AWS Web Console), which will happen A LOT when we move further down.

Why take it step by step? Why not just jump in?
"I pity the fool" – nothing beats incrementalism, if it's not greenfield. It's a new tool. You'll have to learn, your team will have to learn, and mistakes will be made.

## The journey taken

The purpose of this section is credibility: this is how we got to where we are.
Maybe we missed a few things but we're not bozos.
It's not our 1st attempt and we've given a lot of these tools a try.

### All aboard, the CloudFormation train

### How about a change at the Terraform junction

### Wandering in the dessert

The principal critique: markup language with evaluatinos, bleh


Notes
- mention huss and the link he provided
