# Linear Algebra interactive activities

The 2026–2027 course page and the earlier Linear Algebra archive now link to
`/teaching/linear-algebra/lab` and `/teaching/linear-algebra/llm`. Site navigation
remains English. Hebrew teaching content is explicitly marked with `lang="he"`
and right-to-left direction. Existing recordings, notes, classroom workflows,
course policies, and deployment settings are preserved.

## Thirteen tutorial labs

Each lab has a prediction question, a deterministic SVG experiment, a mathematical
explanation, a check question, and a student reflection. SVG axes use equal
geometric scale. The finite-field activity explicitly distinguishes discrete
field elements from real geometry. The rank activity displays columns in the
codomain and describes the kernel separately in the domain. Weighted projection
does not mark Euclidean right angles. Gram–Schmidt handles a zero residual before
normalization. Inner products follow the course's convention: linear in the
first argument.

| Tutorial | Activity |
| --- | --- |
| 1 | All roots of a nonzero complex number on the unit circle |
| 2 | Rank and kernel over R, F2, F3, F5 |
| 3 | Consistent, inconsistent, and underdetermined parameter cases |
| 4 | Span, dependence, and the limits of a bounded plot |
| 5 | Order of matrix multiplication |
| 6 | Basis coordinates and the inverse conversion |
| 7 | Rank, image, and rank-nullity |
| 8 | Linear versus affine maps; necessary versus sufficient conditions |
| 9 | Similarity and a commuting coordinate diagram |
| 10 | Signed determinant and unsigned area |
| 11 | Repeated eigenvalues and failure of diagonalizability |
| 12 | Orthogonal projection with a weighted inner product |
| 13 | Gram–Schmidt with dependent input and a symmetric example |

No QR, least squares, best-approximation topic, or ring theory is introduced.

## Eight guided LLM tasks

The canonical web pack is `public/files/linear-algebra-lab/llm-activities.json`.
It includes original and improved prompts, an independent verification task,
deliverables, and reference solutions. Corresponding LaTeX activities are added
to homework 1, 2, 3, 6, 9, and 11 in the separately maintained course project.
No existing homework exercise was removed or replaced by this update.

The page does not call a model API or claim to be a live tutor. Students copy a
prompt into their chosen model and record the response. There is no guaranteed
model-failure claim, no fabricated model experiment, and no reward for merely
obtaining a wrong response. Authored incorrect answers are explicitly labelled
teaching examples and provide an alternative when a model is unavailable.

The journal records prediction, model/version, date, actual prompt, original
response, verification, revised prompt, and conclusion. An exact Python checker
uses the standard library; a separate plotting starter uses Matplotlib.

Research context is linked in the teacher notes to the primary papers
[GSM-Symbolic](https://arxiv.org/abs/2410.05229) and
[GSM-Plus](https://arxiv.org/abs/2402.19255). Their specific evaluations are not
presented as evidence that every current model fails these course questions.

## Local data and accessibility

- Progress and notes use two versioned localStorage keys. Storage failures do
  not prevent reading, exploring, or downloading work.
- No account, model API key, student ID, external data collection, or grading
  endpoint is added. A saved reflection is not an automatically checked proof or
  course submission.
- All controls have labels, radio questions use fieldsets, navigation exposes
  current state, feedback uses status regions, and SVGs have titles and text
  descriptions. Native controls support keyboard operation.
- Exported notebooks contain only browser-local work; SVG diagrams are
  downloadable. Dynamic student text is assigned through text/value properties,
  never interpreted as HTML.
- The responsive layout uses a native tutorial selector on small screens and a
  labelled sidebar on larger screens. Motion preferences are respected.

## Validation

```sh
npm run build
node --test scripts/tests/linear-lab-math.mjs
python3 public/files/linear-algebra-lab/verify_examples.py
PORTAL_QA_ROOT=/path/to/jsdom-qa node --test scripts/tests/linear-lab-dom.mjs
PORTAL_QA_ROOT=/path/to/jsdom-qa node scripts/tests/site-release.mjs
```

The 15 mathematical checks include every control endpoint combination, singular
cases, independent matrix products, field solutions, and weighted orthogonality.
The DOM checks exercise all 13 labs, completion, persistence, SVG/notebook export,
invalid saved data, the eight LLM activities, journal switching, copy, and print.
The site checks retain canonical URLs, existing content, and internal links.
Only explicitly marked Hebrew teaching regions on the two new course pages are
excluded from the general English-interface check.
