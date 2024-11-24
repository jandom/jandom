---
layout: post
title: Python analysis of WIG
date: '2012-08-26T08:41:00.001-07:00'
author: jandom
tags: 
modified_time: '2012-08-26T14:11:52.581-07:00'
thumbnail: http://1.bp.blogspot.com/-jVS15whd11M/UDp4zDrL8CI/AAAAAAAAAOo/sgEli60hyBg/s72-c/plot_fundamentals.png
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-7308434833434003386
blogger_orig_url: https://jandomanski.blogspot.com/2012/08/two-friends-told-me-about-their-recent.html
---

Two friends told me about their recent stock-trading experience. Having traded myself in high-school, I've had some sentiment and decided to see if I could make more rational decision that (the poor ones, admittedly) I've made then.

(Technical diversion in gray)

The first problem is that you don't "own" the financial statements data: by own I don't mean some intellectual property right -- by own I mean having a file on my HDD with the data (be it a text file, db, hdf5, whatever) that one has the freedom to analyse. 

Scraping/HTML-parsing modules for Python came to help. Using mechanize, I was able to emulate a browser; BeautifulSoup was good for www.gpw.pl but failed for www.bankier.pl which then yielded to lxml.

A simple question would be: is WIG under- or overvalued? To answer, take the P/E and P/BV values for all 400+ companies, bin them and draw a histogram.

![Fundamentals Plot](http://1.bp.blogspot.com/-jVS15whd11M/UDp4zDrL8CI/AAAAAAAAAOo/sgEli60hyBg/s640/plot_fundamentals.png)

Fig 1. (A) Price-to-book value (per share) comparison, (B) Price-to-earnings (per share) comparison

Fig 1A. Shows that P/BV is less than 1 for most companies -- this means that if the company was sold (all its cash, machines, factories, intellectual property rights and whatnot) and all that money would be given to the shareholders, you would get more cash per share than the share sells for now. Fig 1B. shows a similar processing done for earnings-per share; note the high bar at 0.0 -- these are the companies generating losses.

[Benjamin Graham](http://en.wikipedia.org/wiki/Benjamin_Graham) would be happy to see these plots: WIG is undervalued. (I only wish I could dig-up the data from before the crisis!) Being undervalued does not mean it's a great idea to jump in -- not many Polish stock-listed companies have any competitive advantage over EU/US/AS(ian) companies other than understanding the local environment better, which is not something that will last.

References:
- data acquired from http://www.gpw.pl/wskazniki_spolek_en (24 August 2012)
- Python extensions used: pickle, numpy, matplotlib, lxml, BeautifulSoup, mechanize 

Plotting and analysis code is available at https://github.com/jandom/FinAnalysis