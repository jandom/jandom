---
layout: post
title: React.js -- edit and delete comments in CommentBox
date: '2015-02-16T15:20:00.000-08:00'
author: jandom
tags: 
modified_time: '2015-02-20T07:45:27.476-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-130051517674389643
blogger_orig_url: https://jandomanski.blogspot.com/2015/02/reactjs-first-steps-extending-comment.html
---

It appears customary for high-intelligence, high-skills groups of engineers to "roll their own" whenever they have a chance to. Counter-intuitively to most managerial/MBA types out there, re-inventing the wheel can give you... a better wheel. Success is not guaranteed though -- but these people may leave sooner rather than later if you don't let them...

Having looked at number of JS frameworks (ember, backbone, angular) there was no clear winner. They were all a mess, at least to me. So I approached React.js with no hopes -- how much better could it possible be? It turns out, a lot!

This post will be an extension of the [official React.js tutorial](http://facebook.github.io/react/docs/tutorial.html). The tutorial stops at the stage where you can add comments to a dynamic lists, that will grow as you add comments. This falls short of the functionality displayed on facebook: once you add a comment you can edit or delete it, so that's what're going to do. Full disclosure, I only started using React this weekendo so my guide will inevitably be 'imperfect'.

Let's start by modifying the Comment render method, to show the form editing form:

So now our Comment is willing and ready to be edited. But the CommentList in not aware of it, the handleDelete and handleUpdate methods cannot be propagated anywhere. Let's modify the CommentList to make the propagation possible:

So CommentList has mystery props onCommentDelete and onCommentUpdate, let's not worry about them for now. What's important and is that we initialize the Comment component with two bindings onCommentDelete and onCommentUpdate. They link the Comment component back to the CommentList. Let's go back to the Comment and finish the work there.

So the Comment handleUpdate and handleDelete will simply look back to the props methods we've bound in the CommentList. To actually do anything, we have to make the CommentBox aware of what's going on.

And voila, hopefully it's a working. I'm not sure it's the right or the most efficient way of doing things but it covers things that I wish were included in the original tutorial.