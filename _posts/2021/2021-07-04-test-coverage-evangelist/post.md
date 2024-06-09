---
layout: post
title:  "In Support of Tests Coverage"
date:   2021-07-04 00:00:00 +0100
categories: testing unit test coverage
---

**2024-06 update** 

Internet has this funny property of making your beliefs/opinions expressed at one time immortal and seem like held forever. And this rather short post continues to haunt me: two separate candidates have mentioned it (concerned). Presumably candidates think that I will put the gun to their head and ask for 100% test coverage. I won't, I promise... Not over coverage anyway... 

100% coverage was definitely the answer at one point in Labstep's history but the team that inspired that idea departed from it after I moved on. 100% coverage is definitely not appropriate for fast-exploration code-bases (ML Research, SAAS looking for product-market fit). However, I'd still argue that it's a good idea for any maturing code – I've seen to many code-bases become unmaintainable because of "pragmatic" decisions to maybe not test some code because it's "hard". What that general vibe is driven by is another question... 

More introspectively this post remains a clear example of confirmation bias: I held a belief that high test coverage is a good thing, and found some random interview that supported the notion.

**Original post** 

This weekend I stumbled upon a remarkable conversation: 

> Richard: [...] It’s pretty easy to get up to 90 or 95% test coverage. Getting that last 5% is really, really hard and it took about a year for me to get there, but once we got to that point, we stopped 
> getting bug reports from Android.
> Adam: Oh, wow.
> Richard: Yeah. IT just worked from there on out. It made a huge, huge difference. We just didn’t really have any bugs for the next eight or nine years.

This is from a [conversation with Richard Hipp](https://corecursive.com/066-sqlite-with-richard-hipp/) – the creator of SQLite. 

You know what else happened this week? An insane heat wave in the North East of the US (typically an area with "nice" weather). "Jan, you lunatic, what does testing have in common with climate change?". Bare with me!

| Cause      | Effect |
| ----------- | ----------- |
| Global warming      | Portland heat wave       |
| Insufficient testing   | Bugs never stop        |

Figuring out causality is hard. Really really hard. Even when we really know the mechanism, it's just baffling. What's the cause of this extreme heat wave? It's caused by global warming. What's the reason for endless bug reports on my project? It's insufficient testing. 

Once you see it, it won't stop amusing you. People claiming that anything below 100% test coverage is "practical", "good", "pragmatic". That unit testing to the extreme is dogmatic. Or just complete nonsense like [this](https://blog.bitgloss.ro/2020/10/stop-mocking-your-system/). Meanwhile the bug reports keep coming, and seemingly never stop. Why would that be? 

If you understand the link between climate change and extreme weather events, please consider extending your thinking to other parts of life. Bugs don't come from nowhere, tests prevent them from happening. 

