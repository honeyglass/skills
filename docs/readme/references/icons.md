---
reference:
  reads-in: 2 Ask, 3 Brand
  before: the first file written into the brand folder
  return-to: the state that read it
---

# The icons and the header

Part of states 2 Ask and 3 Brand in `../SKILL.md`.

**Each icon is a Lucide drawing on a rounded tile, in a light and a dark version, in the colours of the project's accent.**

## The colours

The person names one accent, the colour of the project. The four colours of the icons come from it:

| Colour | Light version | Dark version |
| :--- | :--- | :--- |
| tile | a very light tint of the accent | a very dark shade of the accent |
| line | a darker shade of the accent, readable on the light tile | the accent itself |

An example, with the accent #5cc9a7: tile #e1f5ee and line #2a8f71 for the light version,
tile #173a31 and line #5cc9a7 for the dark one.
Propose the four values in 2 Ask and take the person's answer as it stands.

## An icon

Each icon is two files in the brand folder, `brand/icons/NAME.svg` and `brand/icons/NAME-dark.svg`.
Both hold this text, with the tile, the line and the drawing filled in:

```svg
<!-- Lucide icon "NAME" (lucide-static 1.69.0, ISC, see LICENSE) on a PROJECT tile -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="TILE"/><g transform="translate(4 4) scale(0.6667)" fill="none" stroke="LINE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">DRAWING</g></svg>
```

Write only the icons the README uses, and nothing else into `brand/icons/`.

## The drawings

The drawing of each icon, from lucide-static 1.69.0, as it goes in place of DRAWING:

| Icon | Drawing |
| :--- | :--- |
| book-open | `<path d="M12 5v16" /><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />` |
| file-text | `<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />` |
| folder-lock | `<rect width="8" height="5" x="14" y="17" rx="1" /><path d="M10 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5" /><path d="M20 17v-2a2 2 0 1 0-4 0v2" />` |
| map | `<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" />` |
| monitor | `<rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />` |
| plug | `<path d="M12 22v-5" /><path d="M15 8V2" /><path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" /><path d="M9 8V2" />` |
| puzzle | `<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />` |
| scale | `<path d="M12 3v18" /><path d="m19 8 3 8a5 5 0 0 1-6 0zV7" /><path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" /><path d="m5 8 3 8a5 5 0 0 1-6 0zV7" /><path d="M7 21h10" />` |
| star | `<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />` |
| terminal | `<path d="M12 19h8" /><path d="m4 17 6-6-6-6" />` |
| wrench | `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />` |

A section that needs an icon outside this list gets the closest one from the list.
A new drawing only comes from the person, with the Lucide name and version it comes from.

## The header

The header is two files, `brand/header.svg` and `brand/header-dark.svg`.

- With a logo from the person: the logo as they gave it, beside the name, in a light and a dark version.
- Without a logo: the name alone, in the line colour of each version:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="96" viewBox="0 0 520 96"><text x="260" y="64" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="56" font-weight="700" fill="LINE">NAME</text></svg>
```

## The license of the icons

The drawings come from Lucide under the ISC license; monitor and terminal come from Feather
through Lucide, under the MIT license. Write `brand/icons/LICENSE` with this text; its Feather list
names only the icons of the set above that come from Feather:

```text
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

monitor, terminal

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The tile and its colours belong to the project; the License section of the README says who holds
the rights to the brand folder.

Then return to the state that sent you here: 2 Ask or 3 Brand.
