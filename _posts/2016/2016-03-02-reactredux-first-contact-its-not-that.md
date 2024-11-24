---
layout: post
title: React/Redux first contact - it's not that different at all, a pocket guide for ex-PHP dev
date: '2016-03-02T08:54:00.001-08:00'
author: jandom
tags: 
modified_time: '2016-03-02T08:54:20.919-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-5999552213137893644
blogger_orig_url: https://jandomanski.blogspot.com/2016/03/reactredux-first-contact-its-not-that.html
---

It's my first encounter with Redux (which is an implementation of Flux). Coming from a PHP/Symfony2 background, things appear pretty different at first. The core ideas of Redux are Actions, ActionCreator and the Store - all very different vocab from what the PHP-folks are used to.

However, things are not as different as they appear to be. Inspired by this [video](https://www.youtube.com/watch?v=gcnJcQ1vg_U) here is a pocket translator for what these things are in PHP-speak.

**Actions**  
The closest match are Requests, they carry an action type (equivalent of a URI) and possibly some payload (Request post/get params)

**ActionTypes**  
One-to-one match with 'Routes'

**Store**  
Only one per application, it's a bit like a Routing component that gets requests, and basing on their URI types, assigns which Controller to send it to. 

**Reducers**  
Sort of like controllers, they recieve Actions from the Store and perform the following function

> newState = reducer(oldState, action)

So it's all quite simple really!