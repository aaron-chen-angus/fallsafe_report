<div align="center">

# FallSafe+ Assessment Report Generator

**Scientific, Clinical and Technical Manual — v1.0 (October 2026)**

*Balance gap analysis · 4-week supplementary exercise prescription · multilingual PDF reporting (English · 中文 · Bahasa Melayu · தமிழ்)*

[Live FallSafe+ demonstration system ↗](https://fallsafe-plus.hpilab.net/)

</div>

---

## Contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Quick start and deployment](#2-quick-start-and-deployment)
3. [System architecture](#3-system-architecture)
4. [Conceptual model of balance used by FallSafe+](#4-conceptual-model-of-balance-used-by-fallsafe)
5. [The FallSafe+ station battery — scientific and clinical basis](#5-the-fallsafe-station-battery--scientific-and-clinical-basis)
6. [Scoring framework](#6-scoring-framework)
7. [Domain model: from stations to balance domains](#7-domain-model-from-stations-to-balance-domains)
8. [Findings engine and fall-risk screening tier](#8-findings-engine-and-fall-risk-screening-tier)
9. [Data-quality and integrity audit](#9-data-quality-and-integrity-audit)
10. [Exercise prescription engine](#10-exercise-prescription-engine)
11. [Exercise library](#11-exercise-library)
12. [Safety, supervision and contraindications](#12-safety-supervision-and-contraindications)
13. [Report content and visualisations](#13-report-content-and-visualisations)
14. [Multilingual reporting and PDF rendering](#14-multilingual-reporting-and-pdf-rendering)
15. [Input file specification and parser](#15-input-file-specification-and-parser)
16. [Privacy, security and governance](#16-privacy-security-and-governance)
17. [Validation status, limitations and roadmap](#17-validation-status-limitations-and-roadmap)
18. [Customisation guide](#18-customisation-guide)
19. [Glossary](#19-glossary)
20. [References](#20-references)

---

## 1. Purpose and scope

FallSafe+ is a multi-station, sensor-instrumented fall-risk assessment battery. Each station produces a PDF result sheet (computer-vision, surface-EMG, reaction-pod, dynamometry and cognitive-screen outputs). The **Assessment Report Generator** is a static web application that:

1. **Ingests** up to eight FallSafe+ station PDFs for one client session (missing files are tolerated and declared);
2. **Extracts** every reported metric client-side;
3. **Scores and maps** the station results onto four balance domains — **Static Balance (SB)**, **Dynamic Balance (DB)**, **Proprioception (PR)** and **Coordination (CO)** — with lower-limb strength and cognition reported as supporting factors;
4. **Identifies key gaps** in each domain, ranks them by clinical severity and states the evidence behind each finding;
5. **Audits data quality** (signal quality, implausible values, internal inconsistencies, labelling errors) and down-weights or excludes affected data;
6. **Prescribes a gap-weighted, periodised 4-week supplementary balance programme** drawn exclusively from the FallSafe+ Static and Dynamic Balance exercise libraries;
7. **Presents** the analysis on screen first, then **exports an A4 PDF** in English (default), Mandarin (Simplified Chinese), Bahasa Melayu or Tamil.

> **Intended use.** Screening support and exercise planning by qualified health, rehabilitation or exercise professionals. The output is **not a medical diagnosis** and does not replace clinical assessment. The prescribed programme *supplements* — it does not replace — the client's existing exercise programme.

---

## 2. Quick start and deployment

### 2.1 Use

1. Open the site (GitHub Pages URL or `index.html` served locally).
2. Drag the station PDFs for **one** client into the drop zone (or click to browse). Expected file names follow the pipeline convention:

   ```
   <NAME>_<ID>_<Sex>_<Age>_FSST.pdf
   <NAME>_<ID>_<Sex>_<Age>_EMG_DB.pdf
   <NAME>_<ID>_<Sex>_<Age>_EMG_TTT.pdf
   <NAME>_<ID>_<Sex>_<Age>_BLAZEPOD.pdf
   <NAME>_<ID>_<Sex>_<Age>_STS.pdf
   <NAME>_<ID>_<Sex>_<Age>_TUG.pdf
   <NAME>_<ID>_<Sex>_<Age>_MVC.pdf
   <NAME>_<ID>_<Sex>_<Age>_MMSE.pdf
   ```

   Files are also recognised from their page header if renamed.
3. The **Station Matrix** lights each loaded station; missing stations are flagged and the analysis proceeds with the data available.
4. Review the on-screen report (balance index, domain profile, gaps, station results, audit, programme).
5. Choose the report language (**English / 中文 / Bahasa Melayu / தமிழ்**) and click **Download PDF**. **Export JSON** saves the full analysis model for research archiving.

### 2.2 Deploy to GitHub Pages

```bash
git init fallsafe-report-generator && cd fallsafe-report-generator
# copy the repository contents here
git add . && git commit -m "FallSafe+ Assessment Report Generator v1.0"
git branch -M main
git remote add origin https://github.com/<org>/fallsafe-report-generator.git
git push -u origin main
```

Then **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / root**. The included `.nojekyll` file disables Jekyll processing. No build step, server or database is required.

### 2.3 Repository structure

```
fallsafe-report-generator/
├── index.html                 # Application shell (TRON interface)
├── .nojekyll
├── README.md                  # This manual
└── assets/
    ├── css/app.css            # Screen theme (dark TRON) + print theme (A4 PDF)
    └── js/
        ├── parser.js          # PDF text extraction and per-station metric parsing
        ├── analysis.js        # Station scoring, domain model, findings, data-quality audit
        ├── exercises.js       # FallSafe+ exercise library (4 languages, domain loadings)
        ├── programme.js       # Gap-weighted selection and 4-week periodisation
        ├── i18n.js            # Report language packs (en, zh, ms, ta)
        ├── charts.js          # Dependency-free canvas charts (radar, bars, bullets, symmetry, load, gauges)
        ├── report.js          # Report composer (block model shared by screen and PDF)
        ├── export.js          # A4 pagination, rasterisation and PDF assembly
        └── app.js             # UI controller
```

### 2.4 Third-party libraries (loaded from cdnjs)

| Library | Version | Role |
|---|---|---|
| pdf.js (Mozilla) | 3.11.174 | Reads station PDFs in the browser |
| html2canvas | 1.4.1 | Rasterises composed A4 pages (preserves complex-script shaping) |
| jsPDF | 2.5.1 | Assembles the downloadable PDF |
| Google Fonts | — | Orbitron (display), Inter (body), Noto Sans SC, Noto Sans Tamil |

All charts are drawn with native Canvas 2D; no charting library is required.

---

## 3. System architecture

```
 Station PDFs ──► parser.js ──► structured station JSON ──► analysis.js ─┬─► station indicator scores
   (8 max)        (pdf.js)       (+ client metadata)                     ├─► domain scores (SB, DB, PR, CO)
                                                                         ├─► findings + severity
                                                                         ├─► data-quality audit
                                                                         └─► supporting factors (strength, cognition)
                                                                                      │
                                                     programme.js ◄───────────────────┘
                                                     (gap-weighted 4-week plan)
                                                                                      │
                     report.js (language pack i18n.js) ──► ordered "blocks" (HTML + chart jobs)
                         │                                          │
             screen: continuous flow, dark TRON theme     PDF: export.js flows blocks onto 794×1123 px
                                                          A4 pages, keeps section heads with content,
                                                          rasterises at 2× and assembles with jsPDF
```

Design principles:

- **Client-side only.** No data leave the browser (Section 16).
- **Single source of truth.** Screen and PDF are rendered from the same block model, so what is reviewed on screen is what is exported.
- **Graceful degradation.** Every computation tolerates missing stations or missing fields; domain *coverage* and *confidence* quantify the consequence.
- **Traceability.** Every domain score lists its contributing stations, their indicator scores, weights and quality factors; every finding cites its reference threshold.

---

## 4. Conceptual model of balance used by FallSafe+

Postural control is the ability to control the body's position in space for the dual purposes of **stability** (keeping the centre of mass, COM, within the base of support, BOS) and **orientation** (maintaining an appropriate relationship between body segments and the environment). It is not a single ability but emerges from several interacting systems — biomechanical constraints, movement strategies, sensory strategies, orientation in space, control of dynamics and cognitive processing (Horak, 2006). Deficits in different systems produce different patterns of instability, which is why FallSafe+ reports a *profile* rather than a single score.

| Domain | Operational definition in FallSafe+ | Principal mechanisms |
|---|---|---|
| **Static Balance (SB)** | Holding the COM over a fixed BOS — quiet, narrow, tandem and single-leg stance, brief stabilisation phases | Ankle strategy (small COP corrections by triceps surae, tibialis anterior), hip strategy for larger or mediolateral perturbations (Winter, 1995); hip-abductor control of the pelvis in narrow stance |
| **Dynamic Balance (DB)** | Controlling the COM while the BOS moves — stepping, walking, turning, transfers, step-up/step-down | COM–BOS interaction during gait (Lugade et al., 2011); anticipatory and reactive stepping; eccentric control during deceleration |
| **Proprioception (PR)** | Sensing joint position, limb movement and foot placement, and adapting when vision or surface information is degraded | Somatosensory feedback (muscle spindles, joint and cutaneous receptors); **sensory reweighting** among visual, vestibular and somatosensory inputs (Peterka, 2002) |
| **Coordination (CO)** | Timing, sequencing and spatial accuracy of multi-segment movement, including fast visuomotor reactions | Motor sequencing, interlimb coordination, perception–action coupling, choice-reaction processing |

**Supporting factors.** Lower-limb strength (leg-press and calf-press MVC; 30-s sit-to-stand) and cognition (MMSE) are not balance domains but strongly condition balance capacity and training safety. Cognitive impairment is associated with gait disturbance and falls, especially under dual-task conditions (Montero-Odasso et al., 2012).

---

## 5. The FallSafe+ station battery — scientific and clinical basis

The following summarises the protocol, biomechanics, clinical evidence and the metrics consumed by the Report Generator for each station. Station protocols and scoring formulas follow the internal *FallSafe+ NeuroCore Scoring Norms & Theory v2.1* and the *FallSafe+ Assessment Exercise Science Documentation*.

### 5.1 Four Square Step Test (FSST) — computer vision

**Protocol.** The participant steps as fast as possible through a fixed 8-stage sequence around a 2 × 2 grid (1→2→3→4→1→4→3→2→1: forward, sideways, backward, sideways, then reversed) without touching the lines or hopping. Pose estimation tracks both feet against the grid frame-by-frame.

**Biomechanics.** Multiplanar task (sagittal forward/backward steps; frontal lateral steps; transverse direction changes) requiring continuous COM displacement over a changing BOS, rapid deceleration and re-acceleration, and repeated transitions from bilateral to unilateral stance. Key muscles: **gluteus medius** (frontal-plane pelvic control in single-limb stance), **quadriceps femoris** (weight acceptance), **gastrocnemius–soleus** (push-off and ankle control).

**Clinical evidence.** The FSST was introduced to identify older adults with multiple falls, with a cut-off of 15 s showing high sensitivity and specificity in the original cohort (Dite & Temple, 2002). A systematic review supports its reliability and validity across adult populations, with population-specific cut-offs (Moore & Barker, 2017).

**Metrics used.** Completion time; FallSafe+ Agility Score (0–100: time 40 pts, step-time CV 20 pts, directional symmetry 20 pts, phase-ratio deviation 10 pts, error penalty 10 pts); Stability Score (near-fall 30 pts, peak trunk angle 30 pts, mean trunk angular velocity 25 pts, double-support ratio 15 pts); step-time CV; line touches, sequence errors, hesitations; near-fall flag; peak trunk angle; double-support ratio; clockwise/anticlockwise phase ratio.

**Reference thresholds.** Risk tiers as implemented: < 10 s low, 10–15 s moderate, > 15 s high. Step-time variability > 20 % CV flagged as elevated risk (Hofheinz & Schusterschitz, 2010). Trunk-lean near-fall threshold 25° with an angular velocity criterion of 100°/s (FallSafe+ processor; derived from trip-recovery research, Pijnappels et al., 2005).

**Known limitations** (declared in the audit when relevant): step length/width from monocular pose estimation is unreliable for short lateral steps (use for relative comparison only; clinical norms 0.6–0.75 m, Hollman et al., 2011); step-time CV may be unavailable in fast tests; double-support detection can be conservative; camera tilt can mimic trunk lean; grid alignment affects sequence-error detection.

### 5.2 MVC Station — unilateral isometric leg press and calf press (HUR STE5540-Hi5)

**Protocol.** Seated, back supported, knee locked at 90°; two sub-maximal familiarisation pushes; three 5-s maximal isometric pushes per leg with 60-s rest and standardised verbal encouragement; the highest valid trial is retained. Leg press (both legs) precedes calf press (forefoot on plate, heel free, knee flexed) to minimise machine reconfiguration.

**Rationale.** Unilateral testing exposes asymmetry masked by bilateral testing and avoids the bilateral deficit (Jakobi & Cafarelli, 1998). The flexed-knee calf press shifts plantar-flexor demand toward soleus, which is not shortened by knee flexion. MVC values provide the reference for EMG amplitude normalisation (%MVC), which is required for valid between-subject amplitude comparison (Burden, 2010). Plantar-flexor and knee-extensor strength are both associated with balance and walking performance in older adults, and lower-limb weakness is an established fall-risk factor (Lord et al., 2003).

**Metrics used.** Left/right leg-press MVC (kg), left/right calf-press MVC, asymmetry (%), percentile against age/sex norms (FallSafe+ Norms §3.6). Asymmetry bands: < 15 % normal, 15–29 % mild, ≥ 30 % significant.

**Plausibility rule (Report Generator).** If both legs are below 25 % of the age/sex normative mean, absolute strength is treated as a probable calibration/protocol error, excluded from analysis, and asymmetry is reported as low confidence (Section 9).

### 5.3 Dynamic Balance Challenge (DB) — surface EMG

**Protocol.** Ascend three boxes of increasing height, stabilise on the highest box, descend via a lower box to the floor. Four-channel surface EMG (Biometrics DataLOG MWX8): CH0/CH1 left/right rectus femoris, CH2/CH3 left/right gastrocnemius.

**Biomechanics.** Predominantly sagittal-plane vertical COM displacement with frontal-plane pelvic control in single-limb support; concentric hip/knee extension on ascent and eccentric control on descent. Stair negotiation is a high-demand, hazardous task for older adults (Lee & Chou, 2007).

**EMG composite (0–100).** 25 % bilateral quadriceps symmetry, 15 % calf symmetry, 20 % quadriceps–calf activation ratio, 20 % activation fraction, 20 % co-activation index (inverted). Normal bands: symmetry ratio 0.75–1.33; quad–calf ratio ≥ 0.80; co-activation ≤ 0.45 (> 0.65 flagged); activation fraction 45–95 %. Elevated antagonist co-activation in older adults during stepping is associated with increased joint stiffness (Hortobágyi & DeVita, 2000). Channels with SNR < 10 dB are excluded from cross-channel features.

### 5.4 Terrain Trek Challenge (TTT) — surface EMG + mmWave heart rate

**Protocol.** Step down from a platform into a ball pit, walk through it, onto and off a soft pad, and step up onto and down from a stable platform.

**Biomechanics and neurophysiology.** Compliant, deformable surfaces reduce and destabilise ground-reaction forces and disrupt plantar and ankle somatosensory input; the CNS must **reweight** sensory information toward vestibular and visual cues (Peterka, 2002), and control shifts from an ankle- to a hip-dominant strategy with greater co-contraction. The station is therefore primarily a **proprioceptive** challenge.

**EMG composite (0–100).** 40 % terrain-adaptation CV (30 windows; age-stratified norms), 30 % quadriceps symmetry, 5 % calf symmetry, 25 % co-activation (inverted). Sub-metrics: terrain adaptability, step height (foot clearance), compensatory movements. Heart rate from a 60-GHz mmWave radar (DFRobot SEN0623 C1001) is captured as an exertion signal only and is not scored (not a certified medical device).

### 5.5 BlazePod Reaction — choice reach-and-touch

**Protocol.** Standing, the participant identifies and taps the odd-coloured pod among distractors; cues > 2.5 SD from the session mean are removed; the median reaction time (RT) is scored.

**Rationale.** A choice reach-and-touch task combines visual search (≈100–150 ms), decision (≈50–100 ms) and arm movement (≈200–400 ms); expected totals are 600–1300 ms versus 150–350 ms for simple RT. Slowed choice stepping and reaction are associated with falls, and step/reaction training reduces falls (Okubo et al., 2017). Age-related slowing of choice RT is well described (Der & Deary, 2006).

**Score.** 0.60 × RT score + 0.25 × accuracy + 0.15 × RT-CV score (peer-relative z framework). Risk bands: ≥ 65 low, 40–64 moderate, < 40 high.

### 5.6 30-Second Sit-to-Stand (STS) — computer vision

**Protocol.** Arms crossed, standard chair, maximal full stands in 30 s; pose estimation extracts repetitions, transition and standing times, hip and trunk angles.

**Evidence.** The 30-s chair stand is a reliable and valid measure of lower-body strength in community-dwelling older adults (Jones et al., 1999), with age- and sex-specific normative bands for ages 60–94 (Rikli & Jones, 1999). Sit-to-stand requires anterior COM transfer and a transition from external (seat) to internal (lower-limb) support (Schenkman et al., 1990). Greater forward trunk lean is a compensatory strategy for reduced leg strength.

**Report Generator scoring.** See Section 6.3. For clients < 60 years the 60–64 band is used and the extrapolation is declared.

### 5.7 Timed Up and Go (TUG) — computer vision

**Protocol.** Rise from a chair, walk 3 m, turn around a cone, return and sit; pose estimation provides total time, phase times, gait velocity, stride length/time per side.

**Evidence.** The TUG is a widely used test of basic functional mobility (Podsiadlo & Richardson, 1991). A cut-off of 13.5 s identified community-dwelling fallers with high sensitivity and specificity (Shumway-Cook et al., 2000); normative values by age decade were synthesised by Bohannon (2006). Gait speed is a robust predictor of adverse outcomes and survival in older adults (Studenski et al., 2011); speeds ≥ 1.0 m/s are typically consistent with community ambulation and < 0.8 m/s with markedly elevated risk (Fritz & Lusardi, 2009).

### 5.8 MMSE — cognitive screening

**Instrument.** Folstein Mini-Mental State Examination: Orientation (10), Registration (3), Attention & Calculation (5), Recall (3), Language & praxis (9) = 30 (Folstein et al., 1975). Interpretation used: ≥ 24 normal, 18–23 mild impairment, ≤ 17 severe impairment. Education-adjusted norms exist (Crum et al., 1993) but are not applied.

**Role in the report.** Context for safety planning and for **dual-task progression** in the programme. The MMSE is a screen, not a diagnostic test.

---

## 6. Scoring framework

### 6.1 Peer-relative z-score framework (FallSafe+)

All sensor-derived FallSafe+ scores follow:

```
z         = clamp( (norm_mean − observed) / norm_sd , −3, +3 )      (sign inverted where higher = better)
score     = (z + 3) / 6 × 100                                       → 0–100; 50 = age/sex cohort mean
composite = Σ(component_score × weight) / Σ weights
```

The Report Generator **uses the scores reported by the FallSafe+ pipeline unchanged** (FSST Agility/Stability, EMG composites and sub-metrics, BlazePod Reaction Score). It derives scores only where a station reports raw values.

### 6.2 Clinical anchor curves (stations without a pipeline score)

Piecewise-linear mappings anchored at published clinical thresholds (values between anchors are linearly interpolated):

| Measure | Anchors (value → score) | Clinical anchors used |
|---|---|---|
| FSST time (s) | 6→100, 8→90, **10→75**, 12→62, **15→45**, 20→25, 25→12, 30→0 | 10 s / 15 s tiers (Dite & Temple, 2002) |
| TUG time (s) | 5→100, 7→92, 8.5→85, **10→72**, 12→58, **13.5→45**, 20→22, 30→0 | < 10 s normal; 13.5 s faller cut-off (Shumway-Cook et al., 2000); ≥ 20–30 s dependence (Podsiadlo & Richardson, 1991) |
| Gait velocity (m/s) | 0.4→0, 0.6→12, **0.8→30**, **1.0→55**, 1.2→75, 1.4→90, 1.6→100 | 0.8 and 1.0 m/s thresholds (Fritz & Lusardi, 2009; Studenski et al., 2011) |

Design rule: the elevated-risk threshold of each test maps to ≈ 45 (just below the 50 "cohort-average" line), and the "normal" threshold to ≈ 72–75 (above the 65 "strength" line).

### 6.3 30-s Sit-to-Stand score

The Rikli and Jones (1999) normal band [lower, upper] for the client's age/sex is treated as the inter-quartile range of a normal distribution:

```
μ = (lower + upper) / 2,   σ = (upper − lower) / 1.349,   z = (reps − μ)/σ,   score = (clamp(z,−3,3)+3)/6 × 100
```

Example (male, 60–64 band 14–19): μ = 16.5, σ = 3.71; 23 reps → z = 1.75 → score 79.2.

### 6.4 Station indicator scores

Because a station contributes differently to each domain, the generator computes a **domain-specific indicator** per station:

| Station | SB indicator | DB indicator | PR indicator | CO indicator |
|---|---|---|---|---|
| FSST | Stability Score | mean(Agility, Stability, time score) | placement score = 100 − 15 × (line touches + sequence errors) | mean(error score, CV score, time score); error score = 100 − 12.5 × all errors; CV score = 100 × (1 − CV/40) |
| EMG DB | composite | composite | composite | composite |
| EMG TTT | composite | mean(composite, step height, compensatory) | mean(composite, terrain adaptability) | mean(composite, compensatory) |
| BlazePod | reaction score | reaction score | reaction score | reaction score |
| STS | mean(reps score, standing-trunk score) | reps score | reps score | mean(reps score, consistency score) |
| TUG | time score | 0.5 time + 0.3 velocity + 0.2 symmetry | mean(symmetry, velocity) | mean(time, symmetry) |

Where: standing-trunk score = 100 − 5 × max(0, trunk angle − 5°); consistency score = 100 − 75 × CV of transition time; TUG symmetry score = 100 − 3 × max(stride-length asymmetry %, stride-time asymmetry %). All indicator scores are clamped to 0–100. Station summary scores shown in the bar chart are: FSST mean(Agility, Stability); EMG composites; BlazePod reaction score; STS reps score; TUG DB indicator.

### 6.5 Bands

| Score | Band | Interpretation |
|---|---|---|
| ≥ 65 | **Strength** | At least ~0.9 SD better than cohort average or above the clinical normal threshold |
| 50–64.9 | **Monitor** | Around cohort average |
| 35–49.9 | **Moderate gap** | Below average; targeted training indicated |
| < 35 | **Priority gap** | Marked deficit; prioritise in programme |

---

## 7. Domain model: from stations to balance domains

### 7.1 Station-to-domain weightage

Weights are taken from the *FallSafe+ Assessment Exercise Science Documentation* (domain justification of each station):

| Station | Static Balance | Dynamic Balance | Proprioception | Coordination | Rationale (abridged) |
|---|---|---|---|---|---|
| FSST | 10 % | **45 %** | 15 % | 30 % | Multidirectional COM control; precise sequencing; foot-placement judgement |
| Dynamic Balance Challenge | 20 % | **45 %** | 30 % | 5 % | Vertical COM displacement over varying step heights; continuous sensory recalibration |
| BlazePod | 5 % | 15 % | 5 % | **65 %** | Visual detection, selection and rapid accurate reaching (+10 % dual-task, reported under cognition) |
| Terrain Trek | 10 % | 30 % | **50 %** | 10 % | Compliant surfaces disrupt somatosensation → sensory reweighting |
| 30-s STS | 20 % | **50 %** | 10 % | 20 % | Seated-to-standing COM transfer; phase sequencing |
| TUG | 10 % | **45 %** | 20 % | 25 % | Gait, turning, deceleration; multi-phase sequencing |

### 7.2 Aggregation

For domain *d*:

```
score_d     = Σ_s ( indicator_{s,d} × w_{s,d} × q_s ) / Σ_s ( w_{s,d} × q_s )
coverage_d  = Σ_{available s} w_{s,d} / Σ_{all s} w_{s,d}
confidence  = coverage_d × weighted-mean(q_s)   → High ≥ 0.75, Moderate ≥ 0.50, Low < 0.50
```

`q_s` is the station quality factor (Section 9): 1.0 by default; EMG stations 0.75 when one channel and 0.5 when two or more channels fall below the 10 dB SNR gate.

**Overall Balance Index** = mean of available domain scores. It summarises, but never replaces, the domain profile.

---

## 8. Findings engine and fall-risk screening tier

### 8.1 Findings

Each rule compares a metric with its reference threshold and emits a finding tagged with the domains it informs and a severity (*Priority*, *Moderate*, *Minor*, *Strength*). Selected rules:

| Finding | Domains | Priority | Moderate | Strength |
|---|---|---|---|---|
| FSST time | DB, CO | > 15 s | 10–15 s | < 10 s |
| FSST near-fall | SB, DB | detected | — | — |
| FSST step-time CV | CO | > 40 % | 20–40 % | ≤ 20 % |
| FSST errors (touches + sequence + hesitations) | PR, CO | ≥ 3 | 1–2 | 0 |
| EMG composite (DB, TTT) | DB, PR | < 35 | 35–49 | ≥ 65 |
| TTT terrain adaptability | PR | < 35 | 35–49 | ≥ 65 |
| Calf / quad symmetry ratio | PR, SB | — | < 0.65 or > 1.54 | 0.75–1.33 |
| Co-activation index | CO, SB | > 0.65 | 0.46–0.65 | ≤ 0.45 |
| BlazePod score | CO | < 40 | 40–64 | ≥ 65 |
| STS repetitions | DB, SB | < normal band | (within band: Minor) | > band |
| TUG time | DB | > 13.5 s | 10–13.5 s | < 10 s |
| Gait velocity | DB | < 0.8 m/s | 0.8–1.0 m/s | ≥ 1.0 m/s |
| Stride asymmetry | PR, CO | > 20 % | 10–20 % | ≤ 10 % |
| MVC asymmetry | Strength | ≥ 30 % (valid data) | 15–29 % | < 15 % |
| MMSE | Cognition | ≤ 17 | 18–23 | ≥ 24 |

The **Key Gaps by Domain** section lists up to four highest-severity gaps and two strengths per domain, followed by the station contributions to that domain.

### 8.2 Fall-risk screening tier

| Tier | Rule |
|---|---|
| **High** | Any clinical trigger — FSST > 15 s; near-fall event; TUG > 13.5 s; gait velocity < 0.8 m/s; Overall Balance Index < 35 — or ≥ 3 priority balance findings |
| **Moderate** | Index < 55, or ≥ 3 moderate findings, or ≥ 1 priority finding |
| **Low** | Otherwise |

The tier is a *screening* classification that determines supervision recommendations and programme starting levels; it is not a validated fall-probability estimate (Section 17).

### 8.3 Pattern insights

Rule-based interpretive statements are generated when evidence converges, e.g. *task-specific deficit* (TUG preserved but FSST > 15 s and Terrain Trek composite < 50 → deficits emerge with direction change and compliant surfaces), *strength-adequate vs strength-limited* gaps (STS relative to its normative band), and data-quality and missing-data caveats.

---

## 9. Data-quality and integrity audit

Sensor batteries generate artefacts; reporting them explicitly is a core safety feature. Each check is graded *Critical*, *Review*, *Caution* or *Note*.

| Check | Rule | Consequence |
|---|---|---|
| Missing stations | Any of the 8 files absent | Declared; domain coverage/confidence reduced |
| Mixed subjects / dates | > 1 subject ID or session date across files | Critical / Review warning |
| EMG SNR gate | Channel SNR < 10 dB | Features low confidence; station weight ×0.75 or ×0.5 |
| Implausible %MVC | Any channel > 150 % MVC | EMG–MVC normalisation declared invalid |
| MVC–EMG linkage | EMG states "MVC not collected" while an MVC file exists | Pipeline linkage warning |
| Quadriceps RMS disparity | L/R RMS ratio > 5 | Probable electrode/contact artefact |
| Domain label mismatch | e.g. TTT labelled "Static Balance" | Interpreted by station construct |
| FSST double support ≥ 95 % | Conservative step detection | Stability may be understated |
| FSST near-fall at < 30° with low angular velocity | Possible camera-tilt artefact | Verify camera levelness |
| FSST step length < 0.3 m | Pose-estimation artefact for lateral steps | Relative use only |
| Risk label inconsistency | FSST/TUG label contradicts documented time thresholds | Report uses time-based interpretation |
| MVC implausible | Both legs < 25 % of age/sex mean | Absolute strength excluded; asymmetry low confidence |
| MVC trials missing | Trial values absent | Best-of-three unverifiable |
| MMSE domain overflow | Domain score > domain maximum | Critical scoring error |
| MMSE scale | Total maximum ≠ 30 | Category not validated |
| BlazePod outliers | > 15 % of cues removed | Caution |
| BlazePod norm mismatch | Reported peer norm differs > 4 % from documented norm | Note for calibration review |
| STS age extrapolation | Age < 60 | Nearest (60–64) band used |

---

## 10. Exercise prescription engine

### 10.1 Principles

| Principle | Implementation |
|---|---|
| **Evidence base** | Exercise that challenges balance and functional capacity reduces the rate of falls by ≈ 24 % in community-dwelling older people (Sherrington et al., 2019); programmes providing a high balance challenge and > 3 h/week of exercise show the largest effects (Sherrington et al., 2017). Step training improves reaction time, gait and balance and reduces falls (Okubo et al., 2017). |
| **Specificity** | Exercises are chosen by their loading of the client's deficient domains (e.g., Square Stepping directly trains the multidirectional sequencing assessed by the FSST). |
| **Progressive overload** | Challenge increases by narrowing the BOS (wide → hip-width → instep → tandem → single-leg), removing vision (eyes closed), adding upper-limb or head perturbation, increasing step amplitude/height, and adding a concurrent cognitive task (Halvarsson et al., 2015). |
| **Periodisation** | 4-week block: Familiarisation → Accumulation (volume ↑) → Intensification (level ↑) → Consolidation & re-test (volume ↓ ≈ 30 %). |
| **Motor learning** | Blocked practice in Week 1 for skill acquisition; variable then random practice order in Weeks 2–4 to exploit contextual interference for retention and transfer (Shea & Morgan, 1979). |
| **Dose** | 3 non-consecutive sessions per week, 20–30 min, consistent with dose–response evidence for balance training in older adults (Lesinski et al., 2015). Designed as a *supplement* to existing training. |
| **Intensity** | Rating of perceived exertion on the Borg CR-10 scale (Borg, 1982): W1 3–4, W2 4–5, W3 5–6, W4 4–5. For balance tasks, "intensity" is primarily postural challenge, monitored with objective progression criteria. |
| **Dual-task** | From Week 3, simple cognitive tasks (serial subtraction, naming) are added to dynamic exercises once a level is stable, when cognitive screening is normal; dual-task training improves dual-task walking in older adults (Wollesen & Voelcker-Rehage, 2014). Withheld pending review if cognitive screening is abnormal. |

### 10.2 Selection algorithm

```
need_d     = clamp( (75 − score_d) / 75 , 0.05, 1 )          (unknown domain → 0.35)
priority_e = Σ_d need_d × loading_{e,d}
select     = top 3 static + top 3 dynamic exercises by priority
coverage   = every Moderate/Priority domain must be loaded (≥ 0.6) by ≥ 2 selected exercises
             (swap the lowest-priority same-type exercise if needed)
gating     = Carioca (advanced crossover) only if tier ≠ High and DB ≥ 50 and CO ≥ 50
```

### 10.3 Level and dose

- **Starting level:** Level 1 if the tier is High or the exercise's primary target domain scores < 50; otherwise Level 2. Level 3 is never a starting level.
- **Progression:** +1 level in Week 3 (maximum Level 3), **conditional** on meeting all progression criteria (Section 12).

| Unit | Week 1 | Week 2 | Week 3 | Week 4 |
|---|---|---|---|---|
| Hold (s per side) | 2 × 3 × hold | 3 × 3 × hold | 3 × 4 × hold | 2 × 4 × hold |
| Repetitions (per side/direction) | 2 × base | 3 × base | 3 × 1.25 base | 2 × 1.25 base |
| Passes (≈ 5 m) | 2 × base | 3 × base | 3 × 1.34 base | 2 × 1.34 base |
| Rest between sets | 60 s | 45–60 s | 45 s | 45–60 s |

Session structure: warm-up (5 min: marching on the spot, ankle circles, gentle trunk turns) → static block (postural set) → dynamic block → cool-down (3–5 min easy walking and calf/hip stretches).

---

## 11. Exercise library

From *Static Balance Exercises V1* and *Dynamic Balance Exercises V1*. Each exercise has three scripted levels; loadings (0–1) drive selection.

| ID | Exercise | SB | DB | PR | CO | Unit | Level progression (summary) | Key muscles |
|---|---|---|---|---|---|---|---|---|
| S1 | Hip Hinge Hold | .8 | .1 | .5 | .2 | 10-s hold | supported tandem → tandem → tandem + arm circles | Gluteus maximus, hamstrings, erector spinae |
| S2 | Lateral Hold with Arm Extension | .9 | .1 | .6 | .1 | 5-s hold | wide eyes open → hip-width with tilt → tandem eyes closed | Gluteus medius/minimus, quadratus lumborum, obliques |
| S3 | Slow Heel-Toe Rock with Directional Turns | .8 | .1 | .8 | .2 | 8 reps | hip-width → feet together → feet together + head turns | Triceps surae, tibialis anterior, foot intrinsics |
| S4 | Sumo Stance with Tai Chi Arm Movement | .7 | .1 | .3 | .5 | 8 reps | shoulder guidance → slow sweeps → eyes closed | Obliques, multifidus, gluteus medius |
| S5 | Iron Cross Hold | .8 | .1 | .3 | .2 | 15-s hold | hip-width → instep dual-load → tandem dual-load | Deltoids, rotator cuff, serratus anterior, core |
| S6 | Instep Stance with Torso Rotations | .7 | .1 | .4 | .5 | 6 reps | wide → feet together → instep | Obliques, multifidus, deep hip rotators |
| S7 | Overhead Arm Circles | .8 | .1 | .3 | .5 | 8 reps | neutral → instep → tandem | Deltoids, trapezius, core, gluteus medius |
| S8 | Single-Legged Hold | 1.0 | .4 | .7 | .2 | 10-s hold | instep → toe-touch → single-leg | Gluteus medius, quadriceps, triceps surae |
| D1 | Forward Tandem Walk | .4 | .8 | .7 | .4 | 3 passes | small gap → heel-to-toe → heel-to-toe eyes closed | Gluteus medius, quadriceps, triceps surae, tibialis anterior |
| D2 | Side-Stepping Walk | .3 | .9 | .3 | .3 | 3 passes | small → medium → wide side step | Hip abductors/adductors, fibularis |
| D3 | Diagonal Step | .3 | .8 | .4 | .5 | 6 reps | small → small + hold → wide + hold | Gluteals, adductors, quadriceps, obliques |
| D4 | Square Stepping Exercise | .2 | .8 | .5 | 1.0 | 4 reps | front + hold → front + side → full square circuit | Quadriceps, gluteals, triceps surae, core |
| D5 | Backward Walk | .3 | .7 | .9 | .4 | 3 passes | small gap → heel-to-toe → heel-to-toe + arm circles | Gluteus maximus, hamstrings, tibialis anterior |
| D6 | Imaginary Hurdle Step-Over Walk | .3 | .7 | .7 | .5 | 8 reps | foot level → mid-shin → knee level | Iliopsoas, rectus femoris, tibialis anterior |
| D7 | Zig-Zag Diagonal Walk | .2 | .8 | .4 | .8 | 3 passes | narrow → wider + hold → continuous wide | Hip abductors/adductors/rotators, obliques |
| D8 | Carioca Variations (advanced) | .1 | .7 | .4 | 1.0 | 2 passes | behind-cross → front-and-behind → continuous | Hip rotators, adductors/abductors, obliques |

Evidence highlights for the library: narrow-base and tandem gait stress mediolateral stability in older adults (Schrager et al., 2008); the need for initial support in tandem stance indicates reduced balance capacity (Hile et al., 2012); Tai Chi-style slow movement reduces falls (Huang et al., 2017); obstacle-crossing strategies differ between older adults at high and low fall risk (Pan et al., 2016); trunk muscle strength contributes to balance and functional performance (Granacher et al., 2013).

---

## 12. Safety, supervision and contraindications

- **Supervision.** Weeks 1–2 should be supervised by a trained instructor when the screening tier is High or a near-fall event was recorded; the report states the reason.
- **Environment.** Sturdy support within reach (counter, wall, chair), clear non-slip floor, supportive footwear.
- **Progression criteria (all required):** all sets completed at the current level without loss of balance or stepping out; no hand support; RPE ≤ 5/10; movement quality maintained (level pelvis, upright trunk, controlled landings).
- **Regression:** two or more losses of balance in a set → previous level.
- **Stop and refer:** pain, dizziness, chest discomfort, unusual breathlessness. Eyes-closed and narrow-stance variations only when steady with eyes open.
- **Pre-participation screening** according to current exercise-testing guidance should precede training for individuals with cardiovascular, metabolic or renal disease or relevant symptoms. Clients with recent fractures, acute vestibular disorders, uncontrolled hypertension or severe cognitive impairment require individual clinical clearance. Falls prevention should be embedded within a multifactorial assessment where indicated (Montero-Odasso et al., 2022).

---

## 13. Report content and visualisations

| Section | Content | Visual |
|---|---|---|
| Title | Client card (name, ID, age, sex, height, weight, BMI, session date/time, stations analysed), Overall Balance Index, screening tier | Index and tier badges |
| 01 Executive Summary | Session, index, tier and triggers, strongest/weakest domain, pattern insights, programme focus | Tier panel |
| 02 Balance Domain Profile | Domain scores, bands, confidence, coverage, definitions | **Radar** with peer-average (50) and target (65) rings; **gauge rings** |
| 03 Key Gaps by Domain | Up to 4 gaps + 2 strengths per domain; station contributions with weights and quality factors | Severity chips, band-coloured panels |
| 04 Station Results | Station scores; clinical reference positions; per-station metric tables (missing stations shown dimmed) | **Score bars**, **bullet charts** (FSST time, TUG time, median RT, STS reps, gait velocity, step-time CV) |
| 05 Limb Symmetry Profile | Stride length/time, leg-press MVC, FSST step length (low-confidence items marked *) | **Butterfly chart** with asymmetry % |
| 06 Supporting Factors | Strength (STS, MVC) and cognition (MMSE, dual-task decision) | — |
| 07 Detailed Findings | All findings sorted by severity with stations and domains | Table |
| 08 Data Quality Audit | All integrity checks with grade and consequence | Table |
| 09 Programme | Rationale, dose, session structure, supervision, dual-task, gating | Session tiles |
| — Periodisation | Weekly volume and level | **Load chart** (sets bars + mean level line), phase cards, **4-week calendar** |
| 10 Prescribed Exercises | Purpose, scripted level instructions for prescribed levels, ADL transfer, key muscles | Exercise cards |
| 11 Weekly Prescription | Sets × reps/holds/passes per week with level | Dose table |
| 12 Progression & Safety | Progression, regression and safety rules | Three panels |
| 13–14 Methodology & References | Scoring framework, weightage table, APA references, disclaimer | Table |

---

## 14. Multilingual reporting and PDF rendering

- **Languages.** English (default), Mandarin (Simplified Chinese), Bahasa Melayu and Tamil. All narrative text, findings, audit messages, labels, exercise names, purposes, level scripts and daily-life transfers are translated in `i18n.js` and `exercises.js`. Anatomical muscle names and reference citations remain in English/Latin nomenclature. Missing keys fall back to English. Translations should be reviewed by a bilingual clinician before clinical deployment.
- **Why rasterised pages.** Tamil is an abugida requiring complex glyph shaping (conjuncts and vowel signs); Chinese requires large CJK fonts. Native PDF text APIs in the browser do not shape these reliably. The generator therefore composes each A4 page in HTML (where the browser performs correct shaping with Noto Sans Tamil / Noto Sans SC), then rasterises it with html2canvas at 2× (≈ 190 dpi) and embeds it with jsPDF.
- **Pagination.** Blocks are appended to a 794 × 1123 px page body; a block that overflows moves to a new page, and section headings are carried with their first block (keep-with-next). Running header, page numbers and confidentiality footer are added to every page.
- **Fonts** are pre-loaded (`document.fonts.load`) for the selected language before rendering.

---

## 15. Input file specification and parser

- **Extraction.** pdf.js text items are grouped into visual lines by baseline (±3 px) and ordered left-to-right; cells separated by > 12 px gaps are joined with `|`. Letter-spaced section headers (e.g., `T R A N S I T I O N T I M E S`) are detected and used to disambiguate repeated labels (e.g., *Average* in transition vs standing times). Parsing stops at the reference-norms appendix so that threshold tables are never mistaken for results.
- **Station detection.** File-name suffix (`_FSST`, `_EMG_DB`, `_EMG_TTT`, `_BLAZEPOD`, `_STS`, `_TUG`, `_MVC`, `_MMSE`), otherwise page-header text.
- **Client metadata.** `Name: … | 50 yrs · Male · 173.0 cm · 77.1 kg` and the file-name pattern `NAME_ID_Sex_Age`; the most frequent value across files is used.
- **Robustness.** Unrecognised files are listed and skipped; a station uploaded twice keeps the latest file.
- **Extending.** Add a parser in `parser.js` (`P.<STATION> = g => ({...})`) using `g.n(label, section)` / `g.get(...)` / `g.after[label]`.

---

## 16. Privacy, security and governance

- All processing occurs **in the browser**; files are never uploaded. GitHub Pages serves only static assets.
- Third-party requests are limited to the CDN libraries and Google Fonts listed in Section 2.4 (no client data are sent). For air-gapped deployment, vendor these files locally and update the `<script>`/`<link>` URLs.
- Reports contain personal health information. Store, transmit and dispose of exported PDFs/JSON according to the applicable data-protection regime (e.g., Singapore PDPA) and institutional research-ethics approvals. **Do not commit client files to a public repository.**

---

## 17. Validation status, limitations and roadmap

| Area | Status | Limitation | Planned validation |
|---|---|---|---|
| Domain weights | Expert-assigned from biomechanical task analysis | Not fitted to outcome data | Logistic/ordinal regression against prospective falls (6- and 12-month) at n ≥ 100 |
| Anchor curves (FSST, TUG, gait speed) and STS IQR model | Derived from published cut-offs and norms | Interpolation between anchors is a modelling assumption | Calibrate against FallSafe+ cohort distributions (n ≥ 30 per age/sex cell) |
| Screening tier | Rule-based | Not a probability of falling | ROC analysis vs prospective falls |
| BlazePod norms | Adapted from reaching literature | Not protocol-specific | Cohort recalibration |
| EMG composites | Ratio/CV-based | %MVC only valid with verified MVC–EMG calibration | Within-dataset percentile and %MVC validation |
| Computer-vision metrics | Monocular pose estimation | Lateral step length, camera tilt and occlusion artefacts | Concurrent validity vs motion capture / instrumented walkway |
| MMSE | Raw totals | No education adjustment | Add education-adjusted cut-offs |
| Programme | Evidence-informed, rule-based | Response is individual; 4 weeks is short for structural adaptation | Pre–post FallSafe+ re-test at week 4; longer mesocycles |
| Translations | Machine-assisted expert drafting | Require clinical bilingual review | Forward–backward translation and cognitive debriefing |

The sample session supplied during development exposed several pipeline issues that the audit now reports automatically (EMG %MVC values > 100 %, "MVC not collected" despite an MVC file, MVC values < 10 % of norm, MMSE orientation 19/10 and a /26 total, TUG risk label inconsistent with its 12-s rule, TTT labelled "Static Balance"). These should be corrected at source in the pipeline.

---

## 18. Customisation guide

| To change | Edit |
|---|---|
| Station-to-domain weights | `FS.STATION_DOMAIN_WEIGHTS` in `analysis.js` |
| Clinical anchor curves | `FS.CURVES` in `analysis.js` |
| Band thresholds | `FS.band` in `analysis.js` (and `m3` text in `i18n.js`) |
| Finding thresholds / new findings | `FS.analyse` rules in `analysis.js` + template keys in `i18n.js` |
| Exercise loadings, units, scripts | `FS.EXERCISES` in `exercises.js` |
| Number of exercises, target score, dose | `N_STATIC`, `N_DYNAMIC`, `TARGET`, `DOSE`, `FS.WEEKS` in `programme.js` |
| Add a language | Add a pack to `FS.LANGS` in `i18n.js`, add `t.<lang>` blocks to each exercise, add a button in `index.html`, add font samples in `export.js` |
| Theme colours | CSS variables at the top of `app.css` and `THEMES` in `charts.js` |

---

## 19. Glossary

| Term | Meaning |
|---|---|
| COM | Centre of mass |
| BOS | Base of support |
| COP | Centre of pressure |
| APA | Anticipatory postural adjustment |
| CV | Coefficient of variation (SD/mean) |
| MVC | Maximum voluntary contraction |
| %MVC | EMG amplitude expressed relative to amplitude at MVC |
| RMS | Root mean square EMG amplitude |
| SNR | Signal-to-noise ratio |
| RPE | Rating of perceived exertion (Borg CR-10) |
| ADL | Activities of daily living |
| Sensory reweighting | Context-dependent change in reliance on visual, vestibular and somatosensory information |

---

## 20. References

### 20.1 Peer-reviewed journal articles (APA 7th edition)

Bohannon, R. W. (2006). Reference values for the Timed Up and Go test: A descriptive meta-analysis. *Journal of Geriatric Physical Therapy, 29*(2), 64–68.

Borg, G. A. (1982). Psychophysical bases of perceived exertion. *Medicine and Science in Sports and Exercise, 14*(5), 377–381.

Burden, A. (2010). How should we normalize electromyograms obtained from healthy participants? What we have learned from over 25 years of research. *Journal of Electromyography and Kinesiology, 20*(6), 1023–1035. https://doi.org/10.1016/j.jelekin.2010.07.004

Clemson, L., Fiatarone Singh, M. A., Bundy, A., Cumming, R. G., Manollaras, K., O'Loughlin, P., & Black, D. (2012). Integration of balance and strength training into daily life activity to reduce rate of falls in older people (the LiFE study): Randomised parallel trial. *BMJ, 345*, e4547. https://doi.org/10.1136/bmj.e4547

Crum, R. M., Anthony, J. C., Bassett, S. S., & Folstein, M. F. (1993). Population-based norms for the Mini-Mental State Examination by age and educational level. *JAMA, 269*(18), 2386–2391.

Der, G., & Deary, I. J. (2006). Age and sex differences in reaction time in adulthood: Results from the United Kingdom Health and Lifestyle Survey. *Psychology and Aging, 21*(1), 62–73. https://doi.org/10.1037/0882-7974.21.1.62

Dite, W., & Temple, V. A. (2002). A clinical test of stepping and change of direction to identify multiple falling older adults. *Archives of Physical Medicine and Rehabilitation, 83*(11), 1566–1571. https://doi.org/10.1053/apmr.2002.35469

Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975). "Mini-mental state": A practical method for grading the cognitive state of patients for the clinician. *Journal of Psychiatric Research, 12*(3), 189–198. https://doi.org/10.1016/0022-3956(75)90026-6

Fritz, S., & Lusardi, M. (2009). White paper: "Walking speed: The sixth vital sign." *Journal of Geriatric Physical Therapy, 32*(2), 2–5.

Granacher, U., Gollhofer, A., Hortobágyi, T., Kressig, R. W., & Muehlbauer, T. (2013). The importance of trunk muscle strength for balance, functional performance, and fall prevention in seniors: A systematic review. *Sports Medicine, 43*(7), 627–641. https://doi.org/10.1007/s40279-013-0041-1

Halvarsson, A., Dohrn, I.-M., & Ståhle, A. (2015). Taking balance training for older adults one step further: The rationale for and a description of a proven balance training programme. *Clinical Rehabilitation, 29*(5), 417–425. https://doi.org/10.1177/0269215514546770

Hile, E. S., Brach, J. S., Perera, S., Wert, D. M., VanSwearingen, J. M., & Studenski, S. A. (2012). Interpreting the need for initial support to perform tandem stance tests of balance. *Physical Therapy, 92*(10), 1316–1328. https://doi.org/10.2522/ptj.20110283

Hofheinz, M., & Schusterschitz, C. (2010). Dual task interference in estimating the risk of falls and measuring change: A comparative, psychometric study of four measurements. *Clinical Rehabilitation, 24*(9), 831–842. https://doi.org/10.1177/0269215510367993

Hollman, J. H., McDade, E. M., & Petersen, R. C. (2011). Normative spatiotemporal gait parameters in older adults. *Gait & Posture, 34*(1), 111–118. https://doi.org/10.1016/j.gaitpost.2011.03.024

Horak, F. B. (2006). Postural orientation and equilibrium: What do we need to know about neural control of balance to prevent falls? *Age and Ageing, 35*(Suppl. 2), ii7–ii11. https://doi.org/10.1093/ageing/afl077

Hortobágyi, T., & DeVita, P. (2000). Muscle pre- and coactivity during downward stepping are associated with leg stiffness in aging. *Journal of Electromyography and Kinesiology, 10*(2), 117–126. https://doi.org/10.1016/S1050-6411(99)00026-7

Huang, Z.-G., Feng, Y.-H., Li, Y.-H., & Lv, C.-S. (2017). Systematic review and meta-analysis: Tai Chi for preventing falls in older adults. *BMJ Open, 7*(2), e013661. https://doi.org/10.1136/bmjopen-2016-013661

Jakobi, J. M., & Cafarelli, E. (1998). Neuromuscular drive and force production are not altered during bilateral contractions. *Journal of Applied Physiology, 84*(1), 200–206. https://doi.org/10.1152/jappl.1998.84.1.200

Jones, C. J., Rikli, R. E., & Beam, W. C. (1999). A 30-s chair-stand test as a measure of lower body strength in community-residing older adults. *Research Quarterly for Exercise and Sport, 70*(2), 113–119. https://doi.org/10.1080/02701367.1999.10608028

Lee, H.-J., & Chou, L.-S. (2007). Balance control during stair negotiation in older adults. *Journal of Biomechanics, 40*(11), 2530–2536. https://doi.org/10.1016/j.jbiomech.2006.11.001

Lesinski, M., Hortobágyi, T., Muehlbauer, T., Gollhofer, A., & Granacher, U. (2015). Effects of balance training on balance performance in healthy older adults: A systematic review and meta-analysis. *Sports Medicine, 45*(12), 1721–1738. https://doi.org/10.1007/s40279-015-0375-y

Lord, S. R., Menz, H. B., & Tiedemann, A. (2003). A physiological profile approach to falls risk assessment and prevention. *Physical Therapy, 83*(3), 237–252. https://doi.org/10.1093/ptj/83.3.237

Lugade, V., Lin, V., & Chou, L.-S. (2011). Center of mass and base of support interaction during gait. *Gait & Posture, 33*(3), 406–411. https://doi.org/10.1016/j.gaitpost.2010.12.013

Montero-Odasso, M., Verghese, J., Beauchet, O., & Hausdorff, J. M. (2012). Gait and cognition: A complementary approach to understanding brain function and the risk of falling. *Journal of the American Geriatrics Society, 60*(11), 2127–2136. https://doi.org/10.1111/j.1532-5415.2012.04209.x

Montero-Odasso, M., van der Velde, N., Martin, F. C., Petrovic, M., Tan, M. P., Ryg, J., … the Task Force on Global Guidelines for Falls in Older Adults. (2022). World guidelines for falls prevention and management for older adults: A global initiative. *Age and Ageing, 51*(9), afac205. https://doi.org/10.1093/ageing/afac205

Moore, M., & Barker, K. (2017). The validity and reliability of the four square step test in different adult populations: A systematic review. *Systematic Reviews, 6*(1), 187. https://doi.org/10.1186/s13643-017-0577-5

Muir, S. W., Berg, K., Chesworth, B., Klar, N., & Speechley, M. (2010). Quantifying the magnitude of risk for balance impairment on falls in community-dwelling older adults: A systematic review and meta-analysis. *Journal of Clinical Epidemiology, 63*(4), 389–406. https://doi.org/10.1016/j.jclinepi.2009.06.010

Okubo, Y., Schoene, D., & Lord, S. R. (2017). Step training improves reaction time, gait and balance and reduces falls in older people: A systematic review and meta-analysis. *British Journal of Sports Medicine, 51*(7), 586–593. https://doi.org/10.1136/bjsports-2015-095452

Pan, H.-F., Hsu, H.-C., Chang, W.-N., Renn, J.-H., & Wu, H.-W. (2016). Strategies for obstacle crossing in older adults with high and low risk of falling. *Journal of Physical Therapy Science, 28*(5), 1614–1620. https://doi.org/10.1589/jpts.28.1614

Peterka, R. J. (2002). Sensorimotor integration in human postural control. *Journal of Neurophysiology, 88*(3), 1097–1118. https://doi.org/10.1152/jn.2002.88.3.1097

Pijnappels, M., Bobbert, M. F., & van Dieën, J. H. (2005). Control of support limb muscles in recovery after tripping in young and older subjects. *Experimental Brain Research, 160*(3), 326–333. https://doi.org/10.1007/s00221-004-2014-y

Podsiadlo, D., & Richardson, S. (1991). The timed "Up & Go": A test of basic functional mobility for frail elderly persons. *Journal of the American Geriatrics Society, 39*(2), 142–148. https://doi.org/10.1111/j.1532-5415.1991.tb01616.x

Rikli, R. E., & Jones, C. J. (1999). Functional fitness normative scores for community-residing older adults, ages 60–94. *Journal of Aging and Physical Activity, 7*(2), 162–181. https://doi.org/10.1123/japa.7.2.162

Schenkman, M., Berger, R. A., Riley, P. O., Mann, R. W., & Hodge, W. A. (1990). Whole-body movements during rising to standing from sitting. *Physical Therapy, 70*(10), 638–648. https://doi.org/10.1093/ptj/70.10.638

Schrager, M. A., Kelly, V. E., Price, R., Ferrucci, L., & Shumway-Cook, A. (2008). The effects of age on medio-lateral stability during normal and narrow base walking. *Gait & Posture, 28*(3), 466–471. https://doi.org/10.1016/j.gaitpost.2008.02.009

Shea, J. B., & Morgan, R. L. (1979). Contextual interference effects on the acquisition, retention, and transfer of a motor skill. *Journal of Experimental Psychology: Human Learning and Memory, 5*(2), 179–187. https://doi.org/10.1037/0278-7393.5.2.179

Sherrington, C., Fairhall, N. J., Wallbank, G. K., Tiedemann, A., Michaleff, Z. A., Howard, K., Clemson, L., Hopewell, S., & Lamb, S. E. (2019). Exercise for preventing falls in older people living in the community. *Cochrane Database of Systematic Reviews, 2019*(1), CD012424. https://doi.org/10.1002/14651858.CD012424.pub2

Sherrington, C., Michaleff, Z. A., Fairhall, N., Paul, S. S., Tiedemann, A., Whitney, J., Cumming, R. G., Herbert, R. D., Close, J. C. T., & Lord, S. R. (2017). Exercise to prevent falls in older adults: An updated systematic review and meta-analysis. *British Journal of Sports Medicine, 51*(24), 1750–1758. https://doi.org/10.1136/bjsports-2016-096547

Shumway-Cook, A., Brauer, S., & Woollacott, M. (2000). Predicting the probability for falls in community-dwelling older adults using the Timed Up & Go Test. *Physical Therapy, 80*(9), 896–903. https://doi.org/10.1093/ptj/80.9.896

Studenski, S., Perera, S., Patel, K., Rosano, C., Faulkner, K., Inzitari, M., Brach, J., Chandler, J., Cawthon, P., Connor, E. B., Nevitt, M., Visser, M., Kritchevsky, S., Badinelli, S., Harris, T., Newman, A. B., Cauley, J., Ferrucci, L., & Guralnik, J. (2011). Gait speed and survival in older adults. *JAMA, 305*(1), 50–58. https://doi.org/10.1001/jama.2010.1923

Winter, D. A. (1995). Human balance and posture control during standing and walking. *Gait & Posture, 3*(4), 193–214. https://doi.org/10.1016/0966-6362(96)82849-9

Wollesen, B., & Voelcker-Rehage, C. (2014). Training effects on motor–cognitive dual-task performance in older adults: A systematic review. *European Review of Aging and Physical Activity, 11*(1), 5–24. https://doi.org/10.1007/s11556-013-0122-z

### 20.2 Technical sources (non-journal)

Bazarevsky, V., Grishchenko, I., Raveendran, K., Zhu, T., Zhang, F., & Grundmann, M. (2020). *BlazePose: On-device real-time body pose tracking* [Preprint]. arXiv. https://arxiv.org/abs/2006.10204

DFRobot. (2025). *SEN0623 C1001 mmWave human detection sensor* [Product documentation]. https://www.dfrobot.com

HUR. (2026). *Leg Press STE5540-Hi5* [Product specification]. https://www.hurglobal.com

FallSafe+ Project. (2026). *FallSafe+ NeuroCore scoring norms & theory* (Version 2.1) [Internal research document].

FallSafe+ Project. (2026). *FallSafe+ assessment exercise science documentation; Static balance exercises V1; Dynamic balance exercises V1* [Internal documents].

### 20.3 Citation notes for maintainers

- The internal norms document cites Pijnappels et al. as 2010; the trip-recovery support-limb study is the 2005 *Experimental Brain Research* paper listed above.
- The internal document attributes Hortobágyi & DeVita (2000) to the *Journal of Biomechanics*; the co-activity during downward stepping study appeared in the *Journal of Electromyography and Kinesiology*.
- Normative leg-press values (Granacher et al., 2011; Hughes et al., 2001; Clement et al., 2023), BlazePod choice-RT norms (Hsieh et al., 2019; Ble et al., 2005), Heap-Eldridge et al. (2024) and Park & Bae (2024) are carried from the internal norms document; verify full bibliographic details against the source articles before publication.

---

<div align="center">

**FallSafe+ NeuroCore · Assessment Report Generator** — screening and exercise-planning support; not a medical device or diagnosis.
[fallsafe-plus.hpilab.net](https://fallsafe-plus.hpilab.net/)

</div>
