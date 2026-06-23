---
layout: post
title:  "Two Billions Closer"
date:   2026-06-23 00:00:00 +0100
categories: cofolding alphafold openfold chai boltz latent
---


Few months back, Isomorphic confirmed their rumoured 2bln raise. What could this mean for the field and the broader industry is huge.

# The good

## Unstoppable?

The Iso team seems unstoppable at this point. 2bln is more than enough dry powder to get them to clinical trials (more on that later). Their benchmarks look amazing, they're way ahead of everyone, on both small molecules & biologics – never mind the gains in generalization. Everything looks dandy.

## World class discovery team

I really don't want to understate how well the odds are stacked in Iso's favor. Iso had a great team to start with, then they got some top-notch DeepMind people, and lastly they inherited some of the best people I've worked with (CharmTx crew love!).

If their models were severely lobotomized (which they are not), the science team alone would have just done the medchem and development around whatever the model outputs and put it into the clinic. They're experienced discovery and development people, they'd turn a rock into a golden nugget and into a trial.

The downside of this is that unless you're very careful and open it won't be possible to separate the impact of the tech from the impact of the people. At the end of the day, for the patients it doesn't matter (a drug is a drug), but if the core thesis is the tech, it'll be near impossible to separate how good the tech is from how well the people can work it. This comes part and parcel with a closed-source model.

## Dry powder

2 bln can get you into the clinic, not once, not twice... depending on the indication, you could get many shots on goal. It also has a hidden negotiation advantage: you don't have to take big pharma money. Most biotechs know they have to sell at some stage, and depending on market conditions, may not be happy with the buyers they find. If they don't get enough competitive tension, things can get dicey. Iso don't have to worry about that.

At some point Iso will partner, I don't expect Demis to want to take things all the way to market (and deal with packaging, leaflets, and actually "selling the pills"). But they can pick when, they control their destiny. 

## The tech is de-risked

Iso basically has a better/similar version of the tech that has been de-risked by other teams: both Iambic and CharmTx used their own proprietary co-folding models and nominated DCs that will enter the clinic (potentially before Iso).

# The bad

## Tech fit 

The AlphaFold, or Iso Drug Discovery Engine (as it's gotten new packaging), is mostly relevant to the discovery stage: finding new drug-like molecules and characterizing/improving them early on. It does not help with the development phase (the clinic). No virtual cell, virtual pig (with or without lipstick) or virtual mouse will be of much help there. Biology is really complicated.

## The turmoil

The CEO and CTO departures are probably not good signs. If they weren't a good fit, I guess now would be the time to switch people around. The key departure of John Jumper from DM can't be a good sign for AF3 development between DM and Iso. I guess that's what you get by axing a team to "make Gemini numbers go higher".

## Khm-khm on the clinic piece

The original announcement was that Iso would enter the clinic in late 2025, then that became mid-2026, now it's late 2026. Whenever that will arrive, it will be a first step to "curing all diseases", and a major point of evaluation for the company. Notably this is a tech-led play at this stage, no pharma company or biotech VC could put that much cash down. 

My sense is that **the question** is being asked more frequently; the question being "when are we going to see the clinical data". Tech VCs may have deep pockets and little idea about discovering drugs but eventually everyone wants to see a return.

# The wrap-up

## Closed vs open

Aside from benchmark numbers, which look stunning, we're learning less and less about these models. We don't know how the improvements were done: are they simply benchmark-maxxing, or do they actually translate to discovery and development progress? Are we getting into the clinic faster for harder drug targets?

Admittedly, Iso are not the only ones. The Boltz team produced a manifesto professing how open they intended to be. The reality didn't really match those glossy visions: VCs want to see a return, and the Boltz team is now more upfront about the role of open-source going forward. I guess, by definition, we're 1-1.5 years closer to seeing what they wanted to release.

> ⚠️ Coming soon: updated evaluation code for Boltz-2!

I certainly won't be holding my breath.

This is why projects like OpenFold are so important. The openness is not an aspiration but a foundation. Yeah, the codebase could be better, the docs could be better – and with the help of our amazing community we continue to improve things. But we won't do a bait and switch on you, we literally can't – it's in the name.

## A tide that lifts all boats, huh?

It's really curious to me what's going to happen to the existing competitors and semi-competitors in this space. 
There is no OpenAI vs Anthropic here. It's just OpenAI – and it's Iso – everyone else is much smaller. 

Therapeutics
- small molecule: Genesis Molecular AI, Iambic, etc (danger zone!)
- biologics: Chai, Xiara
- both: the spin-out from ByteDance (ProteniX team)

SAAS
- Latent Labs, Boltz, Apheris (the force is strong with this one, they don't care which model is the best!)

Foundational models: 
- OpenFold, RF3/4, ProteniX v2, ESMFold2 is a new strong player on the block.

## Cure all diseases

It's a genuinely honorable goal, it really is – in fact more pharmas should adopt bold statements like this. It's the tech bros that "solved" protein structure prediction, not any pharma company. 

However, the 1st step to curing all diseases is curing one. Just N=1, one market approval. So while I admire the goal, telling people that this will be reality in 10 years is a pipe dream (comfortably would bet all my net worth on this, 100x leverage), especially given that we're 5 years in already. 

There is also a steady interest from tech billionaires in funding bio – anywhere from scanning your body with a TV remote, to longevity something something. Those are all directionally fantastic; however, the science is often very bad. So bad. Like "datacenters in space" bad, don't think it'll end well. If only a virtual cell could tell us what happens next!
