---
layout: post
title:  "Escape from the Blogger Alcatraz"
date:   2019-08-25 00:00:00 +0100
categories: jekyll blogger migration
---

# Intro

What platform to use when blogging? And why?
What do to when your choice was a mistake and you have to migrate?
How to keep your data, the precious posts you wrote, and get the hell out to some greener pastures?
Finally, which pastures to choose and why?

# How did we get here?

It was mid 2012 and looking for a blogging platform I picked Blogger.
Seemed legit, backed by Google, it sounded like a reasonable guess.
Sure, some things were off – like including code samples, but hey, nothing I couldn't hack around.
As years rolled on, it became clear that this in not the sweetheart to the powers that be.
The blogger platform was abandoned, receiving few updates and falling further behind than competition.
I wanted out but I didn't know how.
Meanwhile, together with some friends at the Hack'n'Tell I saw Jekyll being used to manage a static website.
It did the job remarkably will and was super-simple.
Not caring about Ruby at all, I used it, had a productive time and wanted to pull my old Blogger posts into my new Jekyll landing page.

# Step 1: Exporting the data from Blogger

This will be a simple-enough: a 3-click operation. Start by heading for the settings

![Navigate to settings](/docs/images/posts/2019-12-27-escape-from-the-blogger-alcatraz/blogger-settings-basic.png)

Then click on 'Other'

![Navigate to 'other' settings](/docs/images/posts/2019-12-27-escape-from-the-blogger-alcatraz/blogger-settings-other.png)

Then click 'Back up Content'

![Click on the backup button, and confirm in the backup modal](/docs/images/posts/2019-12-27-escape-from-the-blogger-alcatraz/blogger-backup-modal.png)

And bam! Just like that a file called `blog-12-27-2019.xml` lands in our Downloads folder. Step 1 is done.

# Step 2: Convert the Blogger data into Jekyll posts

In the last step, we've ended with `blog-12-27-2019.xml` in our downloads. Let's have a quick look inside.

![Example contents of the backup file](/docs/images/posts/2019-12-27-escape-from-the-blogger-alcatraz/blogger-backup-xml.png)

Oh happy times, it's just a massive XML file.
That's all great but who's in a mood for writing a custom parser to deal with this?
You – maybe, me – absolutely not!

Luckily for us somebody wrote a plugin for that.
All that's required is some magical incantations of terminal commands.

Install the gem `jekyll-import` (this may required root permissions)

```
$ sudo gem install jekyll-import
Fetching: fastercsv-1.5.5.gem (100%)
Successfully installed fastercsv-1.5.5
Fetching: reverse_markdown-1.3.0.gem (100%)
Successfully installed reverse_markdown-1.3.0
Fetching: jekyll-import-0.19.1.gem (100%)
Successfully installed jekyll-import-0.19.1
Parsing documentation for fastercsv-1.5.5
Installing ri documentation for fastercsv-1.5.5
Parsing documentation for reverse_markdown-1.3.0
Installing ri documentation for reverse_markdown-1.3.0
Parsing documentation for jekyll-import-0.19.1
Installing ri documentation for jekyll-import-0.19.1
Done installing documentation for fastercsv, reverse_markdown, jekyll-import after 1 seconds
3 gems installed
```

Let's verify that it's installed correctly

```
$ ruby -r rubygems -e 'require "jekyll-import"; puts JekyllImport;'
JekyllImport
```

And then let's rumble, update the `source` and point it to the `blog.xml` file

```
$ ruby -r rubygems -e 'require "jekyll-import";
    JekyllImport::Importers::Blogger.run({
      "source"                => "/Users/jandom/Downloads/blog-12-25-2019.xml",
      "no-blogger-info"       => false, # not to leave blogger-URL info (id and old URL) in the front matter
      "replace-internal-link" => false, # replace internal links using the post_url liquid tag.
    })'
```

Further docs about this step can be found [here](https://import.jekyllrb.com/docs/blogger/)

Now all your posts should be happily converted into `_posts` and `_drafts` directories. Let's verify that:

```
$ ls -l _posts/2012*
-rw-r--r--  1 jandom  staff   2730 Dec 25 23:53 _posts/2012-08-25-electorostatics-artifacs-in-water.html
-rw-r--r--  1 jandom  staff   3697 Dec 25 23:53 _posts/2012-08-26-two-friends-told-me-about-their-recent.html
-rw-r--r--  1 jandom  staff   1292 Dec 25 23:53 _posts/2012-09-25-pushing-with-python-analysis-of-wig.html
-rw-r--r--  1 jandom  staff  13929 Dec 25 23:53 _posts/2012-09-30-how-close-are-quaterly-reported-results.html
-rw-r--r--  1 jandom  staff   1650 Dec 25 23:53 _posts/2012-10-02-do-quarterly-results-add-up-to-yearly.html
```

Great! All files are neatly there – we're done with Step 2!

# Step 3: Adding the posts as a collection in Jekyll

We finished Step 2 with the massive XML converted into individual posts and drafts, and verified that everything has been migrated.

What remains then? We're done right?

With the default Jekyll configuration, you're done: anything in the `_posts` directory is a 'collection' in Jekyll-speak.
If you want to put your blog posts elsewhere, you can by adding a [custom collection](https://jekyllrb.com/docs/collections/). 
