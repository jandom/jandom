---
layout: post
title: "What was that password again?"
date: '2016-09-23T13:25:00.002-07:00'
author: jandom
tags: []
modified_time: '2016-09-23T13:25:55.283-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-6141891700512365036
blogger_orig_url: https://jandomanski.blogspot.com/2016/09/what-was-that-password-again.html
---

A few months ago I bought a new hard-drive. When you encrypt a drive, you need to set a password – but the trick here is to remember the password. Your hard-drive won't send you a "forgot password?" email. So you set that password, enter it, the drive mounts, and then you work away happily for weeks without rebooting your machine.

Then you reboot... and you need to re-enter that password.

You slowly realize that weeks ago, you set a new unique password for that hard-drive that you don't remember at all... What to do? Well, one: don't be a complete idiot like me – remember the password. But if you forget, here's what to do. *Spoiler alert*: I failed to recover the password, but it's a pretty interesting ride...

Ubuntu 16.04 comes with a handy tool called `bruteforce-luks`. Here are some scenarios (note: you have to use it as root):

**"I remember the start/end of the password, and I sort of know what's in the middle"**

Here’s what you can try, where `-b` and `-e` are the start and end of the password. `-t` is the number of CPU threads to use. `-l` and `-m` are the lower and maximum lengths of the password, and `-s` specifies the character set you want to use to crack the password:

```bash
sudo bruteforce-luks -b SomeStart -t 4 -l 9 -m 14 -s 0123456789 /dev/sdc1

sudo bruteforce-luks -e SomeEnd -t 4 -l 9 -m 14 -s 0123456789 /dev/sdc1
```

The device `/dev/sdc1` may be different in your case. To check the progress of the brute-force scan, use:

```bash
pkill -USR1 -f bruteforce-luks
```

**"I have no idea what the password is, but my passwords are usually made up of some tokens"**

Don't worry! That actually drastically reduces the search space and gives you a fair chance of success! Let's assume your tokens are: cats, dogs, elephants. We're going to generate a list of all permutations of those with a simple Python script:

```python
import itertools

tokens = ["cats", "dogs", "elephants"]

results = []

for L in range(0, 6):
    for subset in itertools.permutations(tokens, L):
        results.append(subset)

with open("bruteforce-luks.txt", "w") as f:
    lines = ["".join(r) for r in results][1:]
    f.write("\n".join(lines))
```

Here is how the file looks:

```bash
$ python bruteforce-luks.py
$ head bruteforce-luks.txt
cats
dogs
elephants
catsdogs
catselephants
dogscats
dogselephants
elephantscats
elephantsdogs
catsdogselephants
```

With that list of possible passwords, you can then run:

```bash
sudo bruteforce-luks -t 6 -f bruteforce-luks.txt /dev/sdc1
```

-f passes the file list, and -t specifies how many CPU threads to use. The device /dev/sdc1 may be different in your case. To check the progress of the brute-force scan, use:


```bash
pkill -USR1 -f bruteforce-luks
```

**Epilogue**

While I ultimately failed to recover the hard-drive, I hope this guide will help some people avoid a disaster like mine.

