# Market Mechanics Studio

When the user requests a video, read README.md, studio/squeeze.json, and the revised example at studio/squeeze-cut.json. Treat the brief as a production request. Author the shots and storyboard, register the project with the CLI, and verify its saved timeline and tracks. Give the user the project ID and dashboard link. Render if requested. Use a unique project ID and stable shot and asset paths for each new cut so previous episodes remain playable.

## Story and visual direction

- The default is a full-screen animated film. Use the Paper Billions references for story staging, acted transactions, practical props, and changes in camera angle. Design original characters and sets.
- Open on a concrete consequence or surprising action. Give the viewer an action, reaction, or new piece of evidence in each beat. Stage key details in the world, such as the amount on a banknote or the bid on an exchange board. Keep headings in the studio timeline. A chart or document can appear briefly when the story needs it.
- Choreograph the action before writing the animation. Specify the location, the character's goal, contact with props, the pose or expression that changes, and the camera framing. Cut between wide shots and details. Reframe the action for both aspect ratios when requested.
- Plant the supporting foot during each step. Attach a moving prop to the grip only after the fingers make contact. Use changes in gaze and posture to show the character thinking, and leave enough time to read a key number before cutting away.
- Check the shoulder-to-elbow silhouette and wrist direction in both the resting pose and the motion. For an idle character, start with the arms hanging from the shoulders.
- Use `performer()` in `src/film/performer.mjs` as the default for newly animated human characters. Add character designs and shot poses on top of this shared rig so they inherit the current arm motion and facial landmarks.
- Verify market facts against primary sources and put source URLs in the storyboard. Mark invented values as illustrative. Preserve the wording and order of supplied narration, splitting it at natural speech boundaries.
- Set the requested aspect to 16:9 or 9:16. Set a requested runtime for a prompt or overview. For supplied scripts, omit duration and scene seconds unless timing is specified, so narration drives runtime.
- Use `kind: "film"` for custom shots. Register stable shot IDs in `src/film/index.mjs`. Use the supplied frame time as the animation clock, and use the drawing helpers and character rig when they fit. Check several frames within shots to verify the action and check a full exported cut before calling a film ready.
- Register with `./studio.sh create path/to/storyboard.json`. Use configured ElevenLabs credentials when available. Piper and eSpeak NG are local options.
