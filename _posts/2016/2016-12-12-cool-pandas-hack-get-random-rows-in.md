---
layout: post
title: "Cool pandas hack - get random rows in a multi-column dataframe"
date: '2016-12-12T06:14:00.003-08:00'
author: jandom
tags: []
modified_time: '2016-12-12T06:14:53.710-08:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-3983098302852031129
blogger_orig_url: https://jandomanski.blogspot.com/2016/12/cool-pandas-hack-get-random-rows-in.html
---

```python
# load inputs
actives = pd.read_pickle("actives_final.pkl")
decoys = pd.read_pickle("decoys_final.pkl")

# stack tables
df = pd.concat([actives, decoys])

# remove duplicate indices
df = df.reset_index()

# sort and group by category and molId, selecting the last entry
ordered = df.sort_values(by='tc') \
            .groupby(['category', 'molId']) \
            .last() \
            .reset_index()

# shuffle and group by category and molId, selecting the last entry
shuffled = df.sample(frac=1, random_state=123456) \
            .groupby(['category', 'molId']) \
            .last() \
            .reset_index()
