English translations of Chen Gadi's previous-years recitations 1 and 2.

Source: Tirgul1.tex and Tirgul2.tex in Linear_Algebra_Engineering_Overleaf.zip, corresponding to the handbook already published at public/materials/2026-2027/linear-algebra-engineering-notes.pdf.

All original exercises, solutions, examples and figures are retained. Two scope clarifications were made in Recitation 1: the regular-polygon description is restricted to n >= 3; the polar proof of rotation treats z = 0 separately.

Build each PDF twice with XeLaTeX from this directory, with shell escape disabled:
  xelatex -interaction=nonstopmode -halt-on-error -no-shell-escape recitation-01-en.tex
  xelatex -interaction=nonstopmode -halt-on-error -no-shell-escape recitation-02-en.tex

Publish the PDFs to public/materials/international-engineering/.

The lecture PDF is the existing 18-page English translation by Chen Gadi and ChatGPT of Yochai Maayan's student lecture notes; it was added without content changes.
