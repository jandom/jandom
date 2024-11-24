---
layout: post
title: Pushing with python analysis of WIG
date: '2012-09-25T21:18:00.003-07:00'
author: jandom
tags: 
modified_time: '2012-09-25T21:19:10.972-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-6732899094710915644
blogger_orig_url: https://jandomanski.blogspot.com/2012/09/pushing-with-python-analysis-of-wig.html
---

There is a number of simple questions about the financial statements of the companies listed on the WIG that I'd like to understand. One of these questions is: do the quarterly results (for Q1-4 of a given year) add up to the yearly results (of that year)?

Getting the answer is difficult because 1. I don't own the data, 2. processing it is not super-straightforward. Today, I'm happy to report that hurdle 1. is down: scrapping Polish pages related to markets was made very simple by using a simple snippet

```python
import re
from mechanize import Browser
br = Browser()
...
html_doc = br.response().read()
html_doc = re.sub('content="text/html; charset=iso-8859-2"', "", html_doc)
soup = BeautifulSoup(html_doc)
```

Doing the simple 'sed'-like replacement solved all the issues BeautifulSoup had parsing the response I was getting from http://gielda.wp.pl