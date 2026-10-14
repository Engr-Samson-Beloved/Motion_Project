require("sucrase/register");
require.extensions[".css"] = () => {};
const assert = require("node:assert/strict");
const {parseMotionPlan, fitPlanToBeats, requestedBeats, sourceFromPlan} = require("../web/lib/plan.ts");
const {compileComposition} = require("../web/lib/compile.ts");
const {NEUTRAL} = require("../web/lib/brand.ts");
const {findDirection} = require("../web/lib/direction.ts");

const input = JSON.stringify({title:"Launch",thesis:"One signal becoming a network",format:"vertical",scenes:[
  {id:"hook",kind:"type",motion:"rise",beats:4,kicker:"Start",headline:"A better way",detail:"Find your people."},
  {id:"connect",kind:"signal",motion:"wipe",beats:6,kicker:"Connect",headline:"Move together",detail:"A clear next step."},
]});
const parsed = parseMotionPlan(input, []);
assert.equal(parsed.scenes.length, 2);
assert.equal(requestedBeats("a 10-second vertical reel", 120), 20);
const fitted = fitPlanToBeats(parsed, 20);
assert.equal(fitted.scenes.reduce((sum, scene) => sum + scene.beats, 0), 20);
assert.match(sourceFromPlan(fitted, 15), /durationInFrames:300/);
const compiled = compileComposition(sourceFromPlan(fitted, 15), NEUTRAL, findDirection("feed"));
assert.equal(compiled.ok, true, compiled.ok ? "" : compiled.message);
assert.throws(() => parseMotionPlan(input.replace('"kind":"signal"','"kind":"image"'), []), /attached asset/);
assert.throws(() => parseMotionPlan(input.replace('"id":"connect"','"id":"hook"'), []), /repeated/);
console.log("check-plan: validation, timing, and source generation passed.");
