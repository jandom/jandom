---
layout: post
title:  "Christmas Special"
date:   2022-12-26 00:00:00 +0100
categories: puzzles python
---

Among the various group chats, the family group chat on whatsapp is king. This Christmas, a little puzzle has surfaced on the chat, courtesy of Flavio. What this says about our family chats, is another matter..

{% include image.html url="/docs/images/posts/2022-12-26-christmas-special/post.jpeg" description="Here is the puzzle" %}

It's as simple linear set of equations, and you've just been nerd-sniped so good luck solving it! 

While simple, the problem inspired me to write a tiny Python solver – it's brute force and assumes each of the variables is an int bound between 0..10

```python
def solver():
    for c in range(11):
        for r in range(11):
            for t in range(11):
                for w in range(11):
                    check1 = c + r + t == 4*w
                    check2 = c + r == t
                    check3 = c + t == 8 + r
                    check4 = t == 3*r

                    if check1 and check2 and check3 and check4:
                        print(dict(c=c, r=r, t=t, w=w))
                        print(c + (r * t) - w)

if __name__ == "__main__":
    solver()
```