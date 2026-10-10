import * as S from "../src/lib/serviceSchedule.js";
import { serviceSchedule } from "../src/data/sampleContent.js";
let fails = 0; const t = (name, ok, extra="") => { if(!ok) fails++; console.log((ok?"PASS ":"FAIL ")+name+(extra?"  "+extra:"")); };
const ww = serviceSchedule.find(e => e.name==="Worship Wednesday");
// 3rd Wednesdays 2026: Jan 21, Feb 18, Mar 18, Apr 15, May 20, Jun 17, Jul 15, Aug 19, Sep 16, Oct 21, Nov 18, Dec 16
const exp = [[2026,1,21],[2026,2,18],[2026,3,18],[2026,4,15],[2026,5,20],[2026,6,17],[2026,7,15],[2026,8,19],[2026,9,16],[2026,10,21],[2026,11,18],[2026,12,16]];
let bad = [];
for (let m=1;m<=12;m++){ const days=[]; for(let d=1;d<=31;d++){ if(new Date(Date.UTC(2026,m-1,d)).getUTCMonth()!==m-1) continue; if(S.matchesDate(ww,2026,m,d)) days.push(d);} if(days.length!==1||days[0]!==exp[m-1][2]) bad.push([m,days]); }
t("third Wednesday of every month in 2026", bad.length===0, JSON.stringify(bad));
t("last-weekday rule (last Wed Oct 2026 = 28)", S.matchesDate({day_of_week:3,recurrence:"monthly_nth",week_of_month:-1},2026,10,28) && !S.matchesDate({day_of_week:3,recurrence:"monthly_nth",week_of_month:-1},2026,10,21));
// timezone: 10:00 Nairobi = 07:00 UTC
const o = S.occurrencesOf(serviceSchedule.find(e=>e.name==="Main Service"), new Date("2026-10-08T12:00:00Z"));
t("Main Service 10:00 EAT = 07:00 UTC, next is Sun 11 Oct", o[0].start.toISOString()==="2026-10-11T07:00:00.000Z" && o[0].end.toISOString()==="2026-10-11T10:30:00.000Z", o[0].start.toISOString());
const settings = { next_mode:"auto", timezone:"Africa/Nairobi" };
let n = S.resolveNextService({settings, schedule: serviceSchedule, now:new Date("2026-10-09T10:00:00Z")}); // Fri 13:00 EAT
t("Fri 1pm -> next is Daily Prayers tonight 6pm", n.title==="Daily Prayers" && n.status==="upcoming" && n.start.toISOString()==="2026-10-09T15:00:00.000Z", n.title+" "+n.start.toISOString());
n = S.resolveNextService({settings, schedule: serviceSchedule, now:new Date("2026-10-09T16:00:00Z")}); // Fri 19:00 EAT => prayers over
t("Fri 7pm -> next is Youth Service Sunday 8am", n.title==="Youth Service" && n.start.toISOString()==="2026-10-11T05:00:00.000Z", n.title+" "+n.start.toISOString());
n = S.resolveNextService({settings, schedule: serviceSchedule, now:new Date("2026-10-11T08:00:00Z")}); // Sun 11:00 EAT
t("Sun 11am -> Main Service in session (not streamed => no live claim)", n.title==="Main Service" && n.status==="in_session", n.status);
const streamed = serviceSchedule.map(e=>e.name==="Main Service"?{...e,is_streamed:true}:e);
n = S.resolveNextService({settings, schedule: streamed, now:new Date("2026-10-11T08:00:00Z")});
t("Sun 11am with Main Service streamed -> live", n.status==="live");
n = S.resolveNextService({settings, schedule: serviceSchedule, now:new Date("2026-10-11T10:31:00Z")}); // after main ends 13:30 EAT
t("Sun 1:31pm -> next is Daily Prayers Monday 6pm", n.title==="Daily Prayers" && n.start.toISOString()==="2026-10-12T15:00:00.000Z", n.title+" "+n.start.toISOString());
// Wednesday 21 Oct 2026 is the third Wednesday: Worship Wednesday should exist; a normal Wed (14 Oct) should not
const wedThird = S.occurrencesOf(ww, new Date("2026-10-14T12:00:00Z"))[0];
t("Worship Wednesday next occurrence from 14 Oct is 21 Oct", wedThird.start.toISOString()==="2026-10-21T14:45:00.000Z", wedThird.start.toISOString());
// Manual next service (Thursday prayers one-off) does not touch the timetable
const before = JSON.stringify(serviceSchedule);
n = S.resolveNextService({settings:{next_mode:"manual", service_date:"2026-10-15", start_time:"18:00", end_time:"19:00", title:"Thursday Prayer Meeting", timezone:"Africa/Nairobi"}, schedule: serviceSchedule, now:new Date("2026-10-09T10:00:00Z")});
t("manual next service: Thursday Prayer Meeting 15 Oct 6pm", n.title==="Thursday Prayer Meeting" && n.source==="manual" && n.start.toISOString()==="2026-10-15T15:00:00.000Z");
t("timetable unchanged by manual next service", JSON.stringify(serviceSchedule)===before);
n = S.resolveNextService({settings:{next_mode:"manual", service_date:"2026-10-01", start_time:"18:00", end_time:"19:00", title:"Past", timezone:"Africa/Nairobi"}, schedule: serviceSchedule, now:new Date("2026-10-09T10:00:00Z")});
t("expired manual service falls back to the timetable", n.source==="schedule");
// grouping + conflicts
const g = S.groupSchedule(serviceSchedule);
t("Daily Prayers grouped Mon-Fri", S.describeDays(g.find(x=>x.name==="Daily Prayers"))==="Monday to Friday");
t("Worship Wednesday label", S.describeDays(g.find(x=>x.name==="Worship Wednesday"))==="Third Wednesday of the month");
t("5 distinct timetable entries preserved", g.length===5, String(g.length));
const c = S.findConflicts(serviceSchedule);
t("Wednesday overlaps reported, not resolved", c.length===3, c.map(x=>x.a.name+" / "+x.b.name+(x.sometimes?" (some weeks)":"")).join("; "));
t("format in Nairobi time", S.formatWhen(new Date("2026-10-15T15:00:00Z"), new Date("2026-10-15T16:00:00Z"))==="Thursday, 15 October 2026, 6:00 PM to 7:00 PM (EAT)", S.formatWhen(new Date("2026-10-15T15:00:00Z"), new Date("2026-10-15T16:00:00Z")));
console.log(fails? `\n${fails} FAILED`:"\nALL PASSED"); process.exit(fails?1:0);
