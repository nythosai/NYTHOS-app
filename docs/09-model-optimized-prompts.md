# NYTHOS Model Optimized Prompts

Updated: 2026-03-25

## Purpose

These prompts are tuned for specific image and video models so NYTHOS visuals stay consistent across tools.

## Universal Creative Direction

NYTHOS is a Base first onchain intelligence platform.
Visual tone should feel premium, sharp, credible, futuristic, and product led.
Use deep navy, black, silver, graphite, and Base blue.
Show clean interface design, operator dashboards, signal cards, launch radar, wallet tracking, and proof panels.
Avoid moon graphics, meme coin imagery, fake profit claims, sports cars, rockets, and casino vibes.
For image models, do not rely on readable slogans, UI labels, or logos inside the generation.
Leave clean negative space for copy overlays and add final typography manually after generation.
Prefer software terms like operator dashboard, signal panel, tracked wallet list, monitoring workspace, and proof module over ambiguous nouns that can turn into physical objects.

## Why Midjourney Keeps Missing The Mark

The bad outputs are not random.
They usually come from four recurring issues:

1. The prompt asks for software, but the model drifts into gadgets and accessories.
Words like watchlist, alert, card, mobile workflow, or profile can turn into wristwatches, payment cards, and generic consumer hardware.

2. The prompt is asking Midjourney to invent a believable product UI from scratch.
That usually produces fake interfaces, fake charts, and unreadable pseudo text.

3. The prompt is trying to do too many jobs at once.
Brand mood, typography, product UI, device rendering, and headline layout in one prompt usually leads to generic ad sludge.

4. The model is being trusted with final typography.
Even though Midjourney can generate some text, product ads still work better when the copy is added manually afterward.

## Better Workflow For Product Specific Ads

Use this workflow instead of raw text-only prompting:

1. Export one real NYTHOS screenshot from the product for the exact feature you want to promote.
2. Use that screenshot as the image prompt or reference image.
3. Use a separate style reference only for mood, lighting, and polish.
4. Ask the model for one clean composition with one device or one floating panel, not a pile of gadgets.
5. Leave negative space for the headline and add typography manually in Figma, Photoshop, Canva, or Ideogram Canvas.

If the asset must feel like a real NYTHOS ad, start from the product first and let the model enhance the scene around it.

## Midjourney Rules For NYTHOS

- Use one real product screenshot as an image prompt whenever possible.
- Use one style reference image for visual consistency across a campaign.
- Keep the text prompt literal and composition focused.
- Keep `--stylize` low to medium for product ads.
- Use one hero object only: one monitor, one laptop, one phone, or one floating UI panel.
- Never ask Midjourney to write full ad copy inside the image.
- If you need text inside the image, keep it to one very short phrase and still expect cleanup.
- Prefer `studio product advertisement`, `editorial product poster`, `clean SaaS campaign visual`, and `premium fintech product shot` over fantasy language.
- Explicitly ban watches, credit cards, wearables, keyboards, desks, extra monitors, and random accessories.

## Midjourney Prompt Structure

Use this shape:

`[real NYTHOS screenshot as image prompt]`
`NYTHOS [feature] campaign visual, one [device or floating UI panel], real dark SaaS interface, premium fintech product advertisement, deep navy graphite black palette, Base blue accents, restrained cinematic lighting, clean background, empty negative space for headline overlay, believable software, no fake lifestyle props --ar 4:5 --style raw --stylize 25 --v 7 --no smartwatch, wristwatch, watch face, credit card, payment card, desk clutter, keyboard, headphones, neon overload, gibberish text, fantasy HUD`

## Midjourney Prompts

These work best when paired with a real NYTHOS screenshot as an image prompt.

1. NYTHOS homepage campaign visual, one floating dashboard panel, real dark SaaS interface, signal cards and wallet tracking visible, premium fintech product advertisement, deep navy and graphite palette, Base blue accents, soft studio lighting, clean gradient background, strong negative space for headline overlay, believable software, minimal clutter --ar 4:5 --style raw --stylize 25 --v 7 --no smartwatch, wristwatch, watch face, credit card, desk, keyboard, mouse, phone accessories, gibberish text, cyberpunk clutter

2. NYTHOS launch radar ad, one large desktop monitor showing fresh pool monitoring and early wallet entry states, premium intelligence software aesthetic, dark refined backdrop, Base blue highlights, editorial product poster composition, clean empty space for copy, believable charts and panels --ar 4:5 --style raw --stylize 30 --v 7 --no smartwatch, card, extra devices, gamer room, fake trading floor, rockets, meme coin imagery, unreadable interface text

3. NYTHOS private alerts campaign visual, one realistic phone with a dark alert screen and one supporting floating UI card behind it, premium startup advertisement, low-key studio lighting, polished reflections, calm serious mood, product first composition, clean negative space for headline --ar 4:5 --style raw --stylize 20 --v 7 --no smartwatch, watch strap, tablet, wallet, payment card, desk clutter, extra gadgets, fake notification spam, fantasy HUD

4. NYTHOS smart wallet tracking poster, one laptop screen showing tracked wallet profiles, signal history, and proof modules, elegant dark interface, sophisticated market intelligence mood, centered composition, restrained glow, Base blue accents, realistic product marketing image, minimal environment --ar 4:5 --style raw --stylize 25 --v 7 --no smartwatch, credit card, code rain, cyberpunk city, excessive holograms, casino lighting, gibberish UI

5. NYTHOS proof and accuracy ad, one large floating proof timeline panel with confidence markers and follow-through states, premium software campaign visual, dark luxury background, clean data storytelling, precise and trustworthy, room for headline overlay, no extra props --ar 4:5 --style raw --stylize 25 --v 7 --no rocket, moon, fake profit explosion, sports car, smartwatch, credit card, random gadgets, unreadable wall of text

6. NYTHOS API product ad, one clean engineering dashboard with JSON payload panel, webhook delivery state, and signal summary cards, premium developer tooling aesthetic, dark polished workspace without physical desk props, Base ecosystem mood, crisp and serious --ar 16:9 --style raw --stylize 25 --v 7 --no keyboard, gaming setup, RGB lights, smartwatch, robot, fantasy hologram, gibberish code wall

## Midjourney Rescue Prompt For Bad Generations

Use this when Midjourney keeps drifting into random objects:

`NYTHOS product advertisement, software interface only, no accessories, no wearables, no payment cards, no extra consumer gadgets, one clean product screen, one clear composition, believable SaaS UI, dark premium fintech branding, Base blue accents, empty space for headline overlay --ar 4:5 --style raw --stylize 15 --v 7`

## Flux Prompts

1. Create a clean premium NYTHOS ad image for social media. Show a dark intelligence dashboard with signal panels, launch radar, and smart wallet tracking. Use deep navy, black, silver, and Base blue. Make it feel credible, expensive, and product focused. Leave clean negative space for the headline to be added later.

2. Create a polished product marketing image for NYTHOS Launch Radar. Show new Base pools, early smart wallet entries, and risk markers in a futuristic interface. The visual should feel sharp and trustworthy, not noisy or overdesigned.

3. Create a founder list poster for NYTHOS with a premium dark background, subtle chain data flows, and clean typography space. The tone should feel like a serious startup launch, not a token promo. Do not render the final text inside the image.

4. Create a watchlist feature promo for NYTHOS. Show a tracked wallet address list, a private alert panel, and a neat operator dashboard. Use calm motion lines and a sophisticated dark palette. Avoid watches, payment cards, and device accessories.

5. Create a smart wallet profile visual for NYTHOS. Show a reputation card with score, labels, recent signals, and proof history. Make it feel like elite market intelligence software.

6. Create an investor style product visual for NYTHOS with product screenshots, proof panels, API elements, roadmap markers, and Base branding. Keep it clean, modern, and serious.

## Runway Prompts

1. Create a 15 second vertical ad for NYTHOS using a real NYTHOS screenshot as the starting image. Open on a dark product close up, then add subtle interface motion across signals, launch radar, and private alerts. Keep the scene product led and cinematic. End on a clean brand frame. Add final text manually afterward.

2. Create a 20 second product teaser for NYTHOS showing a trader receiving a private alert, opening the dashboard, and reviewing a high confidence Base signal with proof. Dark premium palette, strong contrast, refined motion graphics.

3. Create a 20 second NYTHOS launch radar promo showing fresh Base pool creation, an early smart wallet entry, a risk flag, and a clean call to action. Make the motion smooth, cinematic, and credible.

4. Create a 15 second NYTHOS API promo showing signal payloads, webhook delivery, dashboard panels, and developer workflow scenes. The tone should feel technical, modern, and premium.

5. Create a 12 second NYTHOS brand film from one approved NYTHOS still image. Animate soft parallax motion, transaction routes collapsing into one signal panel, and a slow premium camera move. End on a dark brand frame. Add final headline manually afterward.

## Kling Prompts

1. A premium NYTHOS promo video, dark operator dashboard, signal cards glowing in Base blue, launch radar pulsing softly, smooth camera movement, cinematic but restrained, serious startup product energy, vertical format

2. NYTHOS trader workflow video, phone receives private alert, user opens desktop dashboard, sees smart wallet movement and proof panel, calm confident pacing, premium fintech motion design, vertical format

3. NYTHOS launch intelligence video, new Base pool appears, early wallet activity is highlighted, risk layer appears, clean motion graphics, dark luxury interface, product first tone

4. NYTHOS proof campaign video, one signal appears, then follow through data and verification panels animate in, trust and clarity are the focus, no hype effects

5. NYTHOS brand video, transaction traces moving through a dark city like intelligence grid, all converging into a central signal core, elegant camera movement, serious and futuristic

## Sora Prompts

1. Create a cinematic NYTHOS product video set inside a premium digital intelligence room. Floating dark interface panels show signal cards, launch radar, smart wallet profiles, and proof. The palette is deep navy, black, silver, and Base blue. The mood is precise, calm, and trustworthy.

2. Create a short product commercial for NYTHOS where noisy crypto feeds dissolve into a clean operator dashboard. Show alerts, launch radar, saved views, and proof panels. The pacing should feel premium and modern, like a high end fintech launch.

3. Create a NYTHOS community monitoring scene where a team reviews Base wallet activity and launch flow from a large dark dashboard. The product should feel like serious monitoring infrastructure rather than a trading toy.

4. Create a NYTHOS mobile to desktop workflow film. A private alert appears on a phone, then the same signal is reviewed on a larger dashboard with context, confidence, and proof. Smooth motion, premium lighting, polished product focus.

5. Create a NYTHOS brand film using the line "Read the chain better." Show transaction traces, wallet routes, and radar pulses resolving into one clean signal card. The ending should feel iconic and credible.

## Negative Prompt Guide For Image Models

Avoid:

- rockets
- moon imagery
- cartoon coins
- dollar rain
- casinos
- fake profit charts
- sports cars
- meme characters
- neon overload
- cheap cyberpunk clutter

## Editing Notes

- keep logos subtle unless you have a strong final mark
- show interfaces as believable software, not fantasy HUDs
- leave space for text overlays and add headlines manually after generation
- use product screens whenever possible
- prioritize clarity and trust over spectacle

## Recommended Platform Split

Use different tools for different jobs instead of forcing Midjourney to do everything:

1. Midjourney
Best for mood, atmosphere, and premium campaign stills around the product.
Not the best first choice for exact UI fidelity or long readable ad text.

2. Ideogram
Best for posters, social ads, and layouts that need cleaner typography or designed text treatment.
Use this for static ads where the headline is part of the image composition.

3. Krea
Best as a control layer when you want to compare models, use references, iterate quickly, or train a more consistent house style.

4. Runway
Best for animating approved still frames into short product promo videos.
Use image to video, not raw text to video, when the asset needs to stay close to the product.

## Best Practical Workflow For NYTHOS

1. Export a clean real screenshot from NYTHOS.
2. Build the still image in Midjourney or Ideogram using that screenshot as reference.
3. Add the real headline manually in Figma, Canva, or Ideogram Canvas.
4. If you need motion, animate the approved still in Runway.
5. Only use full text to image generation for abstract brand ads, not feature-specific product ads.

## Ready To Paste Campaign Prompt Pack

Use the prompts below as working production prompts.
For the best result, attach one real NYTHOS screenshot that matches the feature before running them.

### 1. Founder List Ad

Best tool:
Ideogram for the finished static ad.
Midjourney for the background mood if you want a more cinematic version.

Prompt:
Create a premium static ad for NYTHOS founder list access. Show one clean dark product screen with signals, smart wallet tracking, and launch radar visible. The visual should feel like a serious Base-native intelligence platform, not a token promo. Use deep navy, graphite, black, silver, and Base blue accents. Keep the composition clean and product led with strong negative space for a headline. Tone should feel exclusive, credible, and early. Avoid fake charts, extra gadgets, lifestyle props, meme coin imagery, rockets, and casino aesthetics.

Suggested headline overlay:
Founder List Access
Get in before the wider rollout

### 2. Launch Radar Ad

Best tool:
Midjourney with a real screenshot reference.

Prompt:
NYTHOS launch radar campaign visual, one large desktop monitor showing a real dark launch monitoring interface, fresh Base pools, early wallet entries, and clean risk markers, premium fintech product advertisement, editorial poster composition, deep navy and graphite palette, Base blue accents, believable software, refined studio lighting, sharp negative space for headline overlay, serious and trustworthy, minimal environment --ar 4:5 --style raw --stylize 25 --v 7 --no smartwatch, credit card, extra monitors, desk clutter, keyboard, gaming setup, unreadable interface text, rockets, neon overload, meme coin imagery

Suggested headline overlay:
See launches earlier

### 3. Smart Wallet Tracking Ad

Best tool:
Midjourney or Krea with a real screenshot reference.

Prompt:
NYTHOS smart wallet tracking poster, one laptop screen showing tracked wallet profiles, labels, recent signal history, and proof modules, premium market intelligence software aesthetic, dark elegant interface, restrained glow, Base blue accents, minimal composition, calm serious mood, believable SaaS product marketing image, clean negative space for headline overlay --ar 4:5 --style raw --stylize 25 --v 7 --no wristwatch, smartwatch, payment card, desk props, wall of gibberish code, fake trading room, cyberpunk city, casino lighting

Suggested headline overlay:
Track smart money with context

### 4. Private Alerts Ad

Best tool:
Midjourney for image generation, Runway if you want a short animated version.

Prompt:
NYTHOS private alerts campaign visual, one realistic phone showing a dark premium alert interface, one subtle supporting floating UI card in the background, polished product advertisement, Base blue highlights, low-key studio lighting, clean gradient backdrop, high trust fintech aesthetic, product first composition, empty space for headline overlay, believable software, minimal clutter --ar 4:5 --style raw --stylize 20 --v 7 --no smartwatch, watch strap, tablet, wallet, payment card, headphones, extra gadgets, notification spam, fantasy HUD, gibberish text

Suggested headline overlay:
Private alerts for the signals that matter

### 5. API Ad

Best tool:
Midjourney for mood stills, Ideogram if you want headline integrated into the ad.

Prompt:
NYTHOS API product advertisement, one clean engineering dashboard showing JSON payloads, webhook delivery states, signal summary cards, and a modern developer workflow interface, premium developer tooling aesthetic, dark polished workspace without physical desk props, deep navy and graphite palette, Base blue accents, crisp and serious, believable software, elegant composition, clean empty space for copy --ar 16:9 --style raw --stylize 25 --v 7 --no keyboard, RGB gamer setup, smartwatch, random hardware accessories, robot, hologram city, gibberish code wall

Suggested headline overlay:
Build on signal, not noise

### 6. Proof And Accuracy Ad

Best tool:
Midjourney with screenshot reference, or Ideogram for a poster version.

Prompt:
NYTHOS proof and accuracy campaign visual, one large floating product panel showing follow-through states, confidence markers, signal outcome timeline, and a clean verification layout, premium software brand campaign, dark luxury background, precise and trustworthy tone, minimal composition, Base blue accents, believable interface design, room for headline overlay --ar 4:5 --style raw --stylize 25 --v 7 --no rocket, moon, fake profit explosion, sports car, smartwatch, credit card, gadget pile, unreadable wall of text, cheap cyberpunk clutter

Suggested headline overlay:
Proof over promises

### 7. Homepage Hero Ad

Best tool:
Midjourney or Krea with real homepage screenshot.

Prompt:
NYTHOS homepage hero campaign image, one floating dashboard panel with signals, launch radar, smart wallet tracking, alerts, and proof visible in a real dark SaaS interface, premium fintech product advertisement, deep navy black graphite palette, Base blue accents, clean gradient background, restrained cinematic lighting, believable software, strong negative space for headline, sharp and expensive, minimal clutter --ar 16:9 --style raw --stylize 25 --v 7 --no smartwatch, payment card, extra devices, desk clutter, fake trading floor, gibberish text, meme imagery, casino vibe

Suggested headline overlay:
Base intelligence, not noise

### 8. Mobile Alert Ad

Best tool:
Ideogram if the final asset needs clean text in the composition.
Midjourney if the copy will be added later.

Prompt:
Create a premium NYTHOS mobile ad with one phone showing a serious dark alert workflow for Base activity. The interface should feel like real product software, not a fantasy UI. Show subtle signal context and one follow-through panel. Use deep navy, black, graphite, silver, and Base blue. Keep the scene minimal, polished, and credible with clean negative space for a short headline. Avoid extra devices, watches, payment cards, bright neon, and clutter.

Suggested headline overlay:
Read the chain better

### 9. Teaser Video Key Frame

Best tool:
Midjourney or Krea for the still, then Runway for motion.

Prompt:
NYTHOS teaser campaign still, one dramatic close-up of a dark intelligence dashboard with signal cards, launch radar, and smart wallet movement, premium startup product film look, deep navy and graphite palette, Base blue accents, cinematic but restrained, believable interface, elegant shadows, clean framing, room for title overlay, serious and futuristic without looking fake --ar 9:16 --style raw --stylize 30 --v 7 --no accessories, watches, payment cards, robot imagery, fake crypto symbols, gibberish UI, casino effects

Suggested headline overlay:
The chain does not forget

### 10. Full 15 Second Video Prompt

Best tool:
Runway image to video, starting from an approved NYTHOS still or real screenshot comp.

Prompt:
Create a 15 second vertical promo video for NYTHOS from a real product still. Start with a dark close-up of the dashboard. Animate subtle motion across signal cards, launch radar, smart wallet tracking, and proof panels. Add calm premium camera movement, soft parallax depth, and refined interface glow in Base blue. Keep the tone serious, credible, and product led. Do not turn the scene into a sci-fi fantasy. End on a clean dark brand frame with space for a short headline to be added manually.

Suggested sequence:
0 to 4 seconds: product close-up
4 to 9 seconds: launch radar and wallet activity motion
9 to 12 seconds: proof panel and alert state
12 to 15 seconds: brand end frame

## Short Headline Bank For Final Overlays

- Base intelligence, not noise
- Proof over promises
- Track smart money on Base
- See launches earlier
- Private alerts for the signals that matter
- Read the chain better
- Built for Base
- Operator tools for onchain intelligence

## Practical Recommendation

If you want one simple stack for now, use this:

1. Midjourney for mood stills
2. Ideogram for final static ads with typography
3. Runway for short promo videos

That combo will usually give you better results than trying to make Midjourney do the whole job alone.
