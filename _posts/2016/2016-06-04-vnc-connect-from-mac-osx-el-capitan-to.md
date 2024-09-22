---
layout: post
title: "VNC Connect from Mac OSX El Capitan to Ubuntu Linux"
date: '2016-06-04T04:04:00.001-07:00'
author: jandom
tags: []
modified_time: '2016-11-05T02:30:06.423-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-2232480770710526575
blogger_orig_url: https://jandomanski.blogspot.com/2016/06/vnc-connect-from-mac-osx-el-capitan-to.html
---

**Edit 2016-11-05**

This is actually trivial; here are the steps:

1. On the remote Ubuntu "workstation", run:

```bash
$ vncserver
```

2. On the home Mac machine, run your favorite SSH tunnel:

```
$ ssh -t -L 5901:localhost:5901 workstation

```

3. Open up the VNC screen in a Mac window:

```bash
$ open vnc://localhost:5901
```
