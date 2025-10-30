---
layout: post
title:  "State of co-folding 2025"
date:   2025-10-30 00:00:00 +0100
categories: cofolding alphafold
---

Earlier this week, in the span of 48 hours, three new co-folding models emerged (Pearl, OpenFold3 preview, and BoltzGen). There is quite a few of these models out now, so this post will try to summarize who's-who in this space and the challenges facing these models in 2026 and beyond.

Overall, the field continues to commoditize. Multiple AF3 clones have emerged, with select few being able to match the performance of the OG. Multiple models (correctly) moved to including new capabilities (like affinity prediction) to go beyond what the original model offered.


### Comparisions are tricky

How to compare all these models, when the differences on the benchmarks are so small? This post really made me giggle. 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Alright who&#39;s gonna compare OF3 to boltz-2 and boltzgen?</p>&mdash; Kevin K. Yang 楊凱筌 (@KevinKaichuang) <a href="https://twitter.com/KevinKaichuang/status/1983611501153026143?ref_src=twsrc%5Etfw">October 29, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

The public structure prediction benchmarks often focus on aspects of the predicted pose. While that's relevant, structure prediction is a 2nd order thing to drug-discovery, where people really care about 1) finding new hits, and 2) optimizing existing hits. Structure prediction is a foundation, means to an end, not the goal itself. 

<!-- Public hit-finding benchmarks are often inferior to industry data, which is of much higher quality/consistency. Pubilc affinity benchmarks are in a much better state, courtesy of the free energy community.  -->

While countless SAAS products will allow you to run these models, almost none of them really allow you to benchmark. Simple inference is the level of "kicking the tires", barely above Hugging Face examples, and hard to imagine how that fits into a discovery workflow. 

## Who's who cofolding 2025

| Model | Parent company / org | Open source? | What’s special |
|---|---|---|---|
| **AlphaFold 3** | Google DeepMind & Isomorphic Labs | ❌ No (free server access for non-commercial use) | "The OG": universal co-folding, which predicts structures/interactions for proteins, DNA/RNA, small molecules, antibodies, and ions. |
| **RoseTTAFold All-Atom** | Baker Lab / RoseTTAFold team | ✅ Yes (open GitHub release) | Extends RoseTTAFold to full biomolecular assemblies — proteins plus DNA/RNA, ligands, metals, and covalent modifications |
| **Boltz-1** | Boltz (MIT Jameel Clinic collaborators) | ✅ Yes (MIT License; code & weights) | Open all-atom co-folding. |
| **Boltz-1x** | Boltz | ✅ Yes (MIT) | Boltz-1 variant. |
| **Boltz-2** | Boltz | ⏳ Weights-only (MIT) | Affinity prediction. |
| **BoltzGen** | Boltz / MIT & collaborators | ✅ Yes (MIT) | Generative peptide/protein model on top of Boltz-2. |
| **Chai-1** | Chai Discovery | ✅ Yes (Apache-2.0) | - |
| **Protenix (“Protein-X”)** | ByteDance | ✅ Yes (Apache-2.0) | - |
| **DragonFold** | CHARM Therapeutics | ❌ No (proprietary) | Matches AF3 on small-molecule prediction, used in discovery. |
| **Pearl** | Genesis Molecular AI | ❌ No (proprietary) | Exceeds AF3 on small-molecule prediction, used in discovery. |
| **OpenFold 3** | OpenFold Consortium | ✅ Yes (preview open-source release) | First open-source re-implementation to match AF3 performance across modalities (RNA, small molecule, biologics). |


## Favorites for 2026

###  Closed-source: Pearl 

Probably the best closed-source model for small molecules at the moment, released earlier this week. Another giggle: given the state of the biotech investment, everyone seems to be cuddling closer and closer to "AI", where money flows happily. 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Excited to share Pearl from Genesis Molecular AI (yes, we&#39;ve updated our name!): the first co-folding model to clearly surpass AlphaFold 3 on protein-ligand structure prediction.<br><br>Unlike LLMs that train on vast public data, drug discovery AI faces fundamental data scarcity. Our… <a href="https://t.co/Jmc2FQ65mA">pic.twitter.com/Jmc2FQ65mA</a></p>&mdash; Genesis Molecular AI (@genesistxai) <a href="https://twitter.com/genesistxai/status/1983275689643229286?ref_src=twsrc%5Etfw">October 28, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

As an ex-competitor of theirs, I certainly have an opinion here, since we were also focused on small molecules. We were [able to match AF3 but not meaningfully exceeded it](https://charmtx.com/dragon-a-top-performing-structure-prediction-model-for-small-molecule-discovery/). The Genesis crew significatly outperforms AF3 on small-molecule structure prediction. 

The code and model remains closed-source, even to academics/non-commercial users. The [technical report](https://genesis.ml/wp-content/uploads/2025/10/pearl_technical_report.pdf) which accompanied the release is sparse on the details but if you've worked in this field, the subtle nudges within are pretty clear.

The team is suitably cross discipline and appears well funded. Such teams will continue to outperform pure ML plays – in my view – because pure ML will often tap-out in the data curation angle, or success metric definition: the ability to curate data with help of crystallographers, affinity data with biology and chemistry teams, ability to generate synthetic data with computational chemists. "Make number go higher" only works if you have a clue how to define the number, and your science colleagues do. 

### Open-source: OF3

I personally share the enthusiasm of the post below :D 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🔥 It&#39;s here: OpenFold3 is now live.<br><br>THE open-source foundation model for predicting 3D structures of proteins, nucleic acids &amp; small molecules. This is where the future of drug discovery and biomolecular AI lives.<br><br>Built by <a href="https://twitter.com/open_fold?ref_src=twsrc%5Etfw">@open_fold</a>. Hosted on <a href="https://twitter.com/huggingface?ref_src=twsrc%5Etfw">@huggingface</a>.<br>👇 more <a href="https://t.co/IukdhBL8rD">pic.twitter.com/IukdhBL8rD</a></p>&mdash; Georgia Channing (@cgeorgiaw) <a href="https://twitter.com/cgeorgiaw/status/1983241877479379187?ref_src=twsrc%5Etfw">October 28, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

OF3 certainly looks to be more "open" than where the Boltz lineage is heading. While Boltzgen and Boltz-1 are fully open-source, Boltz-2 is given "as is" with no training data and code – both are "coming soon" for over a quarter now...

What's important for this model is to move beyond AF3 and into the future. Like the Genesis team, this crew has the benefit of multiple talents in the house (academia, industry) – brining those together will be the key to success. 


## Challenges and solutions

Many of these challenges are intertwined... it's hard to make a clear separation. 


### Generalization

Targets with no structural data remain out of reach of these models. Interpolation close to training data is decent but performance drops with distance from what the model has seen in training. Key benchmark here is Runs'N'Poses (RnP). 
Opportunities:
- better architectures – we've seen already how architecture changes can increase what the models can squeeze out of the same data.

### Validation

Many of these clones have not seen the "action" of a real discovery program. The public benchmarks are a "minimum bar" to pass. Back-testing on industry data (preferably not seen in training) is a much better idea. Better yet, blind prospective validation – but that takes time and money. 


### Data

In contrast to LLMs, these models are severely data-starved. Self-distillation (training on your own predictions) has been shown as a good strategy around that. The problem here is "exhaust gas recirculation", if your own predictions or calculations you're training on are crap, your output will be crap. Garbage-in, garbage-out.

Fine-tuning on proprietary data has been repeatedly shown to be a useful technique for these models (again marked contrast to LLMs, where RAG has won).

Opportunities:
- synthetic data, highlighted as important by the Genesis team, and used by the Boltz-2,
- careful data curation, incorporating experimental sources of error,
- "MOAR DATA" – OpenBind experimental data generation project.


### Scaling laws

Not really seen here yet, but the Genesis team has indicated that something might be going on there with extensive use of Synthetic data.

### Chemistry awareness

This point is often most challenging to tech teams, because it's hard to express/capture what it means. What does it mean if a ligand pose is non-physical to a medchemist/crystallographer? Is it subjective, or can we define metrics to capture it?

Opportunities
- make the model understand chemistry features (bond orders, protonation, chirality, ring puckering, non-physical intra-molecular contacts – I can just hear people running to ChatGPT to ask what these are),
- water co-folding, as many medical chemists will tell you, including this feature is a make or break of many small molecule discovery programs.


### Affinity prediction

My personal take is that the current affinity prediction models are just over-fitting on the training data. In some way that's good – it's not always possible to over-fit. For the rumblings in the community, it rarely translates to examples outside of the training data. 

Opportunity:
- split the problem into two: binder/non-binder separation (between different series), and accurate affinity prediction (within a series),
- synthetic data using affinity datasets, related to self-distillation.

### Training regime

These models are not huge, you can train one with just 64 A100s, but are getting complicated to train. Multi-stage training regimes are not uncommon but make any reproduction efforts more complicated and the whole ML experience "fiddly". 

### Model architecture

Hard to tell what will move the needle here. More diffusion and flow-matching? 

Opportunity
- all-atom representation, that's likely a pipedream because of memory requirements of the attention model. However, some increased-resolution "coarse-grained" representation for polymer tokens (2-3 tokens per residue) could be achievable 

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Why do inverse folding methods hate bulky aromatics so much? From the BoltzGen paper <a href="https://t.co/BhDcOHuk42">pic.twitter.com/BhDcOHuk42</a></p>&mdash; Diego del Alamo (@DdelAlamo) <a href="https://twitter.com/DdelAlamo/status/1982833984859164778?ref_src=twsrc%5Etfw">October 27, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>