# Know Yourself — Field Notes v2

Buildless, browser-local assessment hub. Static files live in `docs/` and are served by GitHub Pages (Settings → Pages → branch `main`, folder `/docs`). Anyone with the link can open the site; answers still never leave the visitor's device. No API key, database, paid service or build is required.

## Working questionnaires

| ID | Instrument | Items | Scoring |
| --- | --- | ---: | --- |
| enneagram | OEPS v1.0 | 36 | Four items/type; raw 4–20; all highest ties reported |
| adhd | ASRS v1.1 six-question screener | 6 | Original shaded-box rule; first three threshold Sometimes, last three Often; >=4 is positive screen |
| bigfive | IPIP 50-item Big-Five Factor Markers | 50 | Published sample order and reverse keys; five raw 10–50 scales |
| emotions | IPIP/Barchard Attending to Emotions + Negative Expressivity | 20 | Two complete interleaved 10-item scales; raw 10–50; no overall EQ |
| empathy | IPIP/Barchard Empathic Concern | 10 | Complete scale and original reverse keys; raw 10–50 |

The Rosenberg Self-Esteem Scale appears as an official external resource only. Its questionnaire is not reproduced or scored in this build.

## Sources and reuse

- Enneagram: https://openpsychometrics.org/tests/OEPS/development/ ; original v1 ODT included. Publisher lists OEPS under Creative Commons at https://openpsychometrics.org/development/ without specifying variant. Clarify commercial reuse before a public commercial launch. Developer acknowledges weak reliability/validity evidence. Original 36-item edition retained to avoid inconsistencies in the newer expansion.
- ASRS current permission: https://license.tov.med.nyu.edu/product/asrs6Qscreener . Free use including commercial with attribution; electronic versions allowed; no other modifications. Six original questions, response options, six-month timeframe and two-level patient-facing shading retained. Reference form linked (not hosted) from Sanford Health Plan, https://www.sanfordhealthplan.com/-/media/files/documents/providers/clinical-resources/cms-quality-adult_adhd_self_report_screener_new_2012.pdf ; six questions, shading and original threshold visually verified. No full 18Q or ASRS-5 license implied. Citation and NYU/Harvard copyright appear on questionnaire, results, downloadable report and card. Screening, not diagnosis.
- IPIP item and scoring sources: https://ipip.ori.org/new_ipip-50-item-scale.htm , https://ipip.ori.org/newBigFive5broadKey.htm , https://ipip.ori.org/newEmotionalIntelligenceKey.htm , https://ipip.ori.org/newScoringInstructions.htm . Public-domain reuse: https://ipip.ori.org/newPermission.htm . Questions extracted from publisher HTML; no truncation of component scales. The final Empathic Concern item remains reverse-keyed.
- Official external self-esteem resource: https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale . Not implemented as a questionnaire here.

Higher/lower prose in IPIP reports refers only to the mathematical midpoint of the possible scale range, explicitly not population norms or diagnostic cutoffs. Advice, jokes and caricatures are original editorial interpretation and do not add measured traits. Faith and appearance are not scored.

## Functionality

Search/filter test library; distinct original named caricatures; instrument introductions, sources and methods; independent progress per test; keyboard-accessible answer controls; answer review; raw-score and screening reports; local report dashboard; retakes archive prior results (maximum30); TXT reports, PNG result cards, native sharing where supported, print styling, static offline cache.

Data key: `know-yourself:hub:v2`. Legacy Enneagram answers from `know-yourself:oeps1:v1` are imported when valid and no hub record exists. No data is transmitted. Local storage can be unavailable or cleared; reports can be downloaded. Cache version must change after releases.

## Validation

Run `node check.cjs`, `node gut-check.cjs` and `node extras-check.cjs`. `check.cjs` verifies all nine Enneagram keys/ties, ADHD thresholds and the3/4 boundary, all IPIP forward/reverse keys, full scale lengths, invalid/incomplete rejection.
Browser QA: completed six-question ASRS with exactly4 shaded answers; expected positive-screen report; reloaded progress midway; downloaded full report. Completed all50 Big Five questions with fixed fixture; expected scores30/34/34/18/38. Legacy completed Enneagram imported and visible. Phone viewport375px: test search returns one ADHD card, no horizontal overflow; report and test controls inspected. Native iOS share/print and real-device offline reopening remain untested.

## v2.1: Enneagram wings and four-letter types

- OEPS v1 keeps the original 36 items and nine published scores. The UI now reports a **tentative** wing only when the top type is unique and one adjacent type out-scores the other. For Type 1, adjacent types are 9 and 2. Equal adjacent scores or tied leading types yield no wing. This calculation is ours and is not an OEPS validated output.
- OEJTS 1.2 adds its published 32 bipolar pairs and four equations. An axis above 24 selects E, N, T or P; otherwise I, S, F or J. Report all axis scores and flag those within two points of the dividing line. This is independent of the official MBTI® and its result can vary across settings and retakes.
- OEJTS questionnaire items are CC BY-NC-SA 4.0 by Eric Jorgenson (2015): https://openpsychometrics.org/tests/OJTS/development/OEJTS1.2.pdf . This owner-only noncommercial preview can use them with credit; commercial publication requires separate permission or a commercial-compatible instrument. Original questionnaire text is displayed unchanged, with extra scale controls and original editorial interpretation.
- Local saved results remain under the v2 storage key; existing completed assessments continue to load. Browser example reports are labeled as examples and do not save their sample answers.

## v2.2 gut-health discussion guide

An original 33-question adult educational intake with saved progress, safety flags, symptom pathways, a downloadable answer-by-answer discussion guide, and original editorial illustration. It uses a separate `know-yourself:gut:v1` browser-local key. It is not a validated diagnostic instrument and does not assign likelihoods. Results cite NIDDK, ACG, AGA, CDC, NCCIH and USPSTF primary sources. The rule set only selects avenues to discuss; urgent symptoms receive a prominent care instruction. Clinical content was reviewed against the sources linked in `dist/gut-data.js` on November 14, 2026.

Verification: `node gut-check.cjs`, `node check.cjs`, and browser completion of the prior 26-question edition with an H. pylori follow-up example and text report download. The example answers used in QA are local test data, not user answers. The interface is not a substitute for clinician review or clinical validation prior to broad public distribution.

## v2.3: food sitting, early fullness and maldigestion

Seven new questions distinguish early satiety, prolonged post-meal fullness, nausea, delayed vomiting, solid-versus-liquid tolerance, and visible food or greasy stool. The rule set now leads with possible delayed gastric emptying (requiring objective confirmation), separates functional dyspepsia and medication contributors, and raises pancreatic insufficiency only for greasy stool or relevant history. Occasional visible high-fiber vegetable matter is explained separately. Sources: NIDDK gastroparesis diagnosis/treatment, ACG gastroparesis guideline summary, NIDDK dyspepsia and EPI, and Mayo Clinic on visible food fragments. Existing local answers remain available, with new unanswered questions requested on continuation.

## v2.4: GitHub release fixes

- New app icon (PNG sizes for iPhone home screen, Android and browser tab).
- Backup / restore: Privacy & data → Download backup file saves all test answers, history and the gut questionnaire as one `.json` file; Restore loads it back. Protects against iPhone Safari clearing site data after about a week of no visits.
- Phone test screen: smaller header, guide card shown only on question 1, tapping an answer moves to the next question automatically (keyboard arrows do not auto-advance).
- Offline cache now checks the network first for pages, scripts and styles, so updates show up without waiting. Still bump `CACHE` in `docs/sw.js` when releasing.
- Images resized/compressed (about 1.4 MB → 0.56 MB). Removed unused `questions.js`, the old SVG icon, the hosted ASRS PDF (now an external link) and the ChatGPT hosting config.
- Licensing note: the OEJTS (16-type) items are CC BY-NC-SA — keep this site non-commercial unless that test is replaced.

## v3.0: deeper tests, comparisons, change over time

New questionnaires (scored in `docs/engine.js`, data in `docs/extras-data.js`, screens in `docs/extras.js`):

| ID | Instrument | Items | Scoring |
| --- | --- | ---: | --- |
| bigfive120 | IPIP-NEO-120 (Johnson, 2014) | 120 | 30 facets × 4 items (4–20); 5 traits = sum of 6 facets (24–120); 55 reverse-keyed |
| selfesteem | Rosenberg Self-Esteem Scale | 10 | SA=3…SD=0; items 2,5,6,8,9 reversed; total 0–30; no official cut-offs |
| interests | O*NET Interest Profiler Short Form | 60 | 0–4 per activity; 10 per RIASEC area (0–40); top three = interest code, ties flagged |

Sources and terms:
- IPIP-NEO-120: public-domain IPIP items. Item list/keys from the MIT-licensed `@alheimsins/b5-johnson-120-ipip-neo-pi-r` package (v6.0.13), checked against Johnson's 30-facet structure. Johnson, J. A. (2014), Journal of Research in Personality, 51, 78–89. The Liberalism facet contains two voting items; they are kept unchanged because altering items would break the published scale.
- Rosenberg SES: public domain per https://socy.umd.edu/about-us/rosenberg-self-esteem-scale . Standard 10-item order and 4-point scale.
- O*NET Interest Profiler Short Form: 60 items as listed in O*NET's Short Form Paper-and-Pencil report (Sept 2018, https://www.onetcenter.org/dl_files/IPSF_PP.pdf), five-point computerized scoring from the Short Form psychometric report. Used unchanged under the O*NET Career Exploration Tools license, Option 1 (CC BY-ND 4.0, https://www.onetcenter.org/license_tools.html). Required credit is shown on the test, results and reports. Instructions and career-area notes are original site text. Item text was transcribed from the PDF reports; spot-check against the official form if publishing widely.

Comparison numbers (`docs/norms.js`) are percentiles computed from Open-Source Psychometrics Project raw data (https://openpsychometrics.org/_rawdata/, via the GitHub mirror haghish/openpsychometrics): Big Five 50-item, 19,634 respondents aged 13–99 (2012); Rosenberg, 45,582 respondents. Split into all ages, under 30, 30–49 and 50+. Volunteer internet samples, not representative norms; the UI says so. No comparison data is used for the 120-item test or the interest test.

Other additions: then-vs-now panel on any result that has an earlier saved attempt (highlights moves of 10% of the range or more); "Everything at a glance" page (`#summary`) with one line and mini-bars per test, a personal notes box per test (saved locally and in backups) and a download-all-reports button; Career filter on the test bench; the external Rosenberg link card was replaced by the built-in test.
