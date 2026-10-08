/** Adds production guidance without rewriting or overruling the user's idea. */
export const productionBrief = (request: string, hasReferenceImages: boolean) => `
THE USER'S REQUEST (preserve its subject, facts, words, duration, format and CTA):
${request.trim()}

CREATIVE DIRECTOR'S EXECUTION NOTES:
- Treat the request as the source of truth. Infer a sensible audience and purpose only when omitted. If duration or aspect ratio is missing, choose 15 seconds and 9:16 for a social piece; otherwise honour the requested format exactly.
- Build a visual thesis from the subject itself. Translate abstract ideas into a specific recurring visual metaphor. Make the metaphor develop through the film rather than resetting to a new layout at every cut.
- Plan the whole arc before coding: a striking first frame, a change or tension, a meaningful reveal, and a final image or action. Give each beat a distinct composition and a reason to move the camera.
- Design in depth: foreground, subject and background; controlled scale changes; staggered entrances; clear focal point. Alternate dense and quiet moments so the film breathes. Use transitions that carry an element or motion into the next scene.
- Keep on-screen copy short and legible on a phone. Do not use a generic title card on every beat, default centered text, repeated card grids, or a slideshow of unrelated screens. Let shapes, diagrams, illustrated objects and typography tell the story together.
- Use the selected brand and direction as the design system. Avoid invented facts, measurements, testimonials, product features, websites and external assets. Preserve any provided exact words and URL.
- End with one clear action when the request has a promotional goal. Hold the final CTA long enough to read.
- Produce the complete playable Remotion composition. Use code-native artwork when a specific image is unavailable.${hasReferenceImages ? " Use supplied images where they genuinely support the story, with the exact listed filenames." : " No image assets are attached: create all visuals in code; do not render Img."}
`;
