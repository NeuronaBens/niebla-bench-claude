# Festival de Cine Niebla: website for the 3rd edition

English translation for readers. The models received the Spanish original (`BRIEF.md`) exactly as written. It intentionally uses Chilean colloquialisms, which are glossed below where they matter.

## Who we are

We're a small film festival from Puerto Bruma, a port on the coast of Chile. Four of us organize it, with grant funding and a lot of help from volunteers. This is our third edition: **Thursday the 15th, Friday the 16th and Saturday the 17th of October 2026**, with 24 films across 4 venues.

Our audience is people from the port and the region. Most of them have jobs, so on Thursday and Friday they show up in a rush, straight after work (Chilean: "después de la pega"). Saturday is the big day. Almost everyone checks the program from their phone, often while walking from one venue to another.

Until now we had a PDF with the schedule and a site built from a template. We were told it looked like "an insurance company's website." We don't want that. We want the site to feel like the festival: full of personality, local, well made.

## What we need

A website with these parts:

1. **Homepage.** It has to introduce the festival: what it is, when it is, where it is, and what sections it has. Whoever lands on it should feel like going. This is where visitors get to the program from.
2. **Program.** All the screenings across the three days. It has to be filterable by day and by section. It has to look good and work well on a phone.
3. **Film page.** Shows the film's details and all of its screenings.
4. **My itinerary.** Each person builds their own route by marking the screenings they want to attend. The itinerary:
   - warns when two chosen screenings overlap (Chilean: "se topan"), and also when there **isn't enough time to walk** from one venue to another (the transfer times are in the data);
   - if a screening has a post-screening Q&A (Chilean: "conversatorio") after the film, it **warns if you'd miss it** by going to the next screening (the Q&A doesn't count as a conflict);
   - is saved in the browser, with no accounts or sign-up;
   - **can be shared with a link**: whoever opens the link sees that itinerary and can copy it to their own.

## Data

All the information is in `data/programa.json`: festival, venues, transfers, sections, films and screenings. **Use it as is and don't modify it.** Don't invent films, screenings, times or data that aren't there.

- Times are in Chile local time (`America/Santiago`).
- A screening ends at its start time plus the film's duration.
- Some screenings end after midnight.
- There are sold-out screenings and outdoor screenings.

## Restrictions

- **Next.js** (App Router) with **TypeScript**. `npm run build` has to pass with no errors.
- For styling you can use Tailwind CSS or CSS Modules. **Don't use component libraries** (shadcn/ui, MUI, Chakra, Mantine, DaisyUI or similar). You can use at most **one** animation library.
- **Don't use external images or photos.** We don't have posters for the films, so you have to solve each film's visual side with code (CSS, SVG, canvas, or whatever you come up with). You can use fonts via `next/font`.
- No backend, database, or external services. The site has to work entirely in the browser.
- All interface text must be in Spanish.
- **Don't use emojis** in the interface.
- **Don't show scores, stars, or rankings** for the films. The festival doesn't rate films.
- It has to respect `prefers-reduced-motion`.
- It has to work well from 360 px wide up to desktop screens.
- Work only inside this folder.

## Where you have freedom

The visual identity, the typography, the color, how each film is represented without posters, the animations, and how the program looks on a phone. We want the homepage to surprise us and for building the itinerary to feel good, not like filling out a form.
