import { linearActivities, type Activity } from "./linearActivities";

type Translation = Omit<Partial<Activity>, "controls"> & {
  title: string;
  topic: string;
  intro: string;
  question: string;
  choices: string[];
  feedback: string;
  experiment: string;
  controls: string[];
  observations: string[];
  explanation: string;
  extension: string;
  extensionChoices: string[];
  extensionFeedback: string;
  reflection: string;
};
const translations: Record<string, Translation> = {
  complex: {
    "title": "Roots in the complex plane",
    "topic": "Complex numbers",
    "intro": "Relate the algebraic equation wⁿ = z to angles on the unit circle.",
    "question": "How many distinct complex solutions does w⁵ = z have when z is nonzero?",
    "choices": [
      "One",
      "Five",
      "It depends on the argument of z"
    ],
    "feedback": "Every nonzero complex number has exactly five distinct fifth roots. Consecutive roots have an angular separation of 72°.",
    "experiment": "Change the argument and the root order. The green point is z; the blue points are all the solutions of wⁿ = z.",
    "controls": [
      "Argument θ in degrees",
      "Root order n"
    ],
    "observations": [
      "Set n = 3 and check the angular separation of consecutive roots.",
      "Raise each root to the power n. Each result should be the same point z."
    ],
    "explanation": "If z = exp(iθ), its nth roots are wₖ = exp(i(θ + 2πk)/n), for k = 0,…,n−1. All lie on the unit circle, with angular separation 2π/n. Arguments are considered modulo 2π.",
    "extension": "What is the angular separation of consecutive sixth roots of a nonzero number?",
    "extensionChoices": [
      "30°",
      "60°",
      "120°"
    ],
    "extensionFeedback": "A full turn is divided into six equal parts: 360°/6 = 60°.",
    "reflection": "Write how to check that a plot includes every root."
  },
  field: {
    "title": "The same matrix over different fields",
    "topic": "Fields and assumptions",
    "intro": "The rank of a matrix depends on the field. Check how changing the field affects a matrix with integer entries.",
    "question": "Must a matrix with integer entries have the same rank over every field?",
    "choices": [
      "Yes, the field makes no difference",
      "No, the field must be specified",
      "Yes, if the matrix is square"
    ],
    "feedback": "Here the determinant is −16 over ℝ, but zero in F₂. Consequently, the rank changes.",
    "experiment": "Choose a field. Over a finite field the points represent discrete elements; lines in the real plane do not represent a continuum of solutions there.",
    "controls": [
      "Field"
    ],
    "observations": [
      "Compare the dimension of the solution space over ℝ and over F₂.",
      "Find all the solutions over F₂ yourself before checking the highlighted points."
    ],
    "explanation": "Over ℝ, det A = −16 is nonzero, so the kernel is {0}. Over F₂, 3 = 5 = 1: both rows are (1,1), the rank is 1, and the kernel is {(0,0),(1,1)}. The determinant is 2 over F₃ and 4 over F₅, so the rank is 2 over both fields. More generally, −16 vanishes in a field of prime characteristic exactly when that characteristic is 2.",
    "extension": "How many solutions does Ax = 0 have over F₂ in this example?",
    "extensionChoices": [
      "One",
      "Two",
      "Infinitely many"
    ],
    "extensionFeedback": "The solutions are exactly (0,0) and (1,1). A one-dimensional vector space over F₂ has two elements.",
    "reflection": "State an assumption that must appear in a question about rank or invertibility."
  },
  systems: {
    "title": "Linear systems with a parameter",
    "topic": "Row reduction and parameters",
    "intro": "Change a parameter and identify when two equations describe intersecting, coincident, or parallel lines.",
    "question": "How many solutions are there when t = 0 and b = 6?",
    "choices": [
      "Exactly one",
      "None",
      "Infinitely many"
    ],
    "feedback": "The second equation is three times the first, so there is one free variable.",
    "experiment": "Start with t = 0 and vary b. Then vary t. Compare the plot with the ranks of the coefficient and augmented matrices.",
    "controls": [
      "Parameter t",
      "Right-hand side b"
    ],
    "observations": [
      "Find an example of each of the three possible solution types.",
      "Perform R₂ ← R₂ − 3R₁ by hand. Why must t = 0 be checked before dividing by t?"
    ],
    "explanation": "Row reduction gives ty = b−6. If t ≠ 0, the unique solution is y = (b−6)/t and x = 2−2y = (2t−2b+12)/t. If t = 0 and b = 6, every point on x+2y=2 is a solution. If t = 0 and b ≠ 6, the equations are inconsistent.",
    "extension": "What happens when t = 0 and b = 7?",
    "extensionChoices": [
      "Exactly one solution",
      "No solutions",
      "Infinitely many solutions"
    ],
    "extensionFeedback": "The row operation gives 0 = 1, so the system is inconsistent.",
    "reflection": "Write how both the plot and row reduction identify the case with infinitely many solutions."
  },
  span: {
    "title": "A line or the whole plane?",
    "topic": "Span and linear dependence",
    "intro": "Determine when two vectors span a line and when they span the whole plane.",
    "question": "Must two distinct nonzero vectors be linearly independent?",
    "choices": [
      "Yes",
      "No",
      "Yes, if their lengths differ"
    ],
    "feedback": "No. For example, (2,1) and (6,3) are distinct and nonzero, but the second is three times the first.",
    "experiment": "Vary δ and the coefficients a,b. The plot shows a bounded range of combinations; the span allows all real coefficients.",
    "controls": [
      "Parameter δ",
      "Coefficient a",
      "Coefficient b"
    ],
    "observations": [
      "Check what happens to the rank as δ passes through zero.",
      "Is a point outside the displayed parallelogram necessarily outside the span?"
    ],
    "explanation": "The matrix with columns u,v has determinant 2δ. If δ ≠ 0, the columns form a basis of ℝ² and span the entire plane. If δ = 0, then v = 3u and the span is the line y=x/2. The selected combination is x=(2a+6b,a+(3+δ)b). A bounded plot of combinations does not bound the span.",
    "extension": "What is the dimension of the span when δ = 0?",
    "extensionChoices": [
      "0",
      "1",
      "2"
    ],
    "extensionFeedback": "The vector u is nonzero and v is its multiple, so the dimension is 1.",
    "reflection": "State an exact algebraic test for dependence rather than judging whether arrows look nearly collinear."
  },
  order: {
    "title": "Order of matrix multiplication",
    "topic": "Matrix multiplication",
    "intro": "Apply a shear and a stretch in both orders to the same vector, and relate the results to matrix products.",
    "question": "Must ABx = BAx hold for every pair of square matrices of the same size and every x?",
    "choices": [
      "Yes",
      "No",
      "Yes, if both matrices are invertible"
    ],
    "feedback": "Matrix multiplication need not commute, even for invertible matrices. In ABx, B acts first and A second.",
    "experiment": "Vary the shear s and the stretch r. The blue arrow is ABx and the orange arrow is BAx.",
    "controls": [
      "Shear parameter s",
      "Stretch factor r"
    ],
    "observations": [
      "Find parameters giving distinct arrows and parameters giving coincident arrows.",
      "Does det(AB) = det(BA) imply AB = BA?"
    ],
    "explanation": "Here ABx = (2r+2s,2) and BAx = (2r+2rs,2). Indeed, AB=[[r,s],[0,1]] whereas BA=[[r,rs],[0,1]], so the matrices in this family commute exactly when s(r−1)=0. Both products have determinant r for every parameter choice, but equal determinants do not imply equal matrices.",
    "extension": "Which choice guarantees AB = BA in this family?",
    "extensionChoices": [
      "s = 0",
      "Only r = 3",
      "Every nonzero s"
    ],
    "extensionFeedback": "When s = 0, A = I, and the identity commutes with every matrix.",
    "reflection": "State which matrix acts first in ABx and give a numerical example where order matters."
  },
  basis: {
    "title": "Vectors and their coordinates",
    "topic": "Bases and invertibility",
    "intro": "Distinguish a vector from its coordinate list in a chosen basis. The matrix P converts coordinates into the vector in standard coordinates.",
    "question": "What does x = P_B c mean when the columns of P_B are the vectors of the basis B?",
    "choices": [
      "c is the coordinate vector of x in B",
      "x and c must be the same list of numbers",
      "P_B always converts standard coordinates to B-coordinates"
    ],
    "feedback": "Multiplication by P_B forms the linear combination of the basis vectors with coefficients c. The inverse conversion uses P_B⁻¹.",
    "experiment": "Fix coordinates a,b and vary the basis through s. The green point is x; the dashed arrows give the two terms of the combination.",
    "controls": [
      "Basis parameter s",
      "Coordinate a",
      "Coordinate b"
    ],
    "observations": [
      "Set a = 2 and b = −1. What changes as s changes?",
      "Check that P_B⁻¹x always recovers (a,b)."
    ],
    "explanation": "Here P_B = [[1,s],[2,2s+1]], det P_B = 1, and P_B⁻¹ = [[2s+1,−s],[−2,1]]. If [x]_B = (a,b), then x = (a+sb,2a+(2s+1)b). Varying the basis while holding the coordinate list fixed generally changes the geometric vector. In the reverse direction, multiplication by P_B⁻¹ recovers both coefficients.",
    "extension": "If s = −1 and x = (3,5) in standard coordinates, what are its B-coordinates?",
    "extensionChoices": [
      "(3,5)",
      "(−2,1)",
      "(2,−1)"
    ],
    "extensionFeedback": "Compute P_B⁻¹x = (−3+5,−6+5) = (2,−1).",
    "reflection": "Write the difference between changing basis with the vector fixed and changing basis with its coordinate list fixed."
  },
  rank: {
    "title": "Image and kernel",
    "topic": "Rank and nullity",
    "intro": "A matrix with three columns and two rows maps ℝ³ to ℝ². Find the image and determine how many dimensions lie in the kernel.",
    "question": "Which equality holds for every value of t?",
    "choices": [
      "rank(A) + dim ker(A) = 2",
      "rank(A) + dim ker(A) = 3",
      "rank(A) = 3"
    ],
    "feedback": "Rank–nullity gives the dimension of the domain, which is 3. The number of rows is the dimension of the codomain.",
    "experiment": "Vary t. The arrows are the columns of A in the codomain; the purple point is b = (1,2). The kernel lies in ℝ³ and is not drawn here.",
    "controls": [
      "Parameter t"
    ],
    "observations": [
      "Determine when b belongs to the image.",
      "Find a basis of the kernel for t = 0 and for t = 2."
    ],
    "explanation": "If t ≠ 0, the second equation in Ax=0 gives y=−2z and the first gives x=4z. Thus the rank is 2 and the kernel is spanned by (4,−2,1). If t = 0, only x+3y+2z=0 remains: the rank is 1 and the kernel is spanned by (−3,1,0) and (−2,0,1). In both cases, rank plus nullity equals 3. At t=0 the image is the x-axis, so b=(1,2) is not in it; at t≠0 the image is ℝ².",
    "extension": "What is the nullity when t = 0?",
    "extensionChoices": [
      "0",
      "1",
      "2"
    ],
    "extensionFeedback": "The rank is 1, so the nullity is 3−1 = 2.",
    "reflection": "Write why the arrows in the plot are not kernel vectors, although they concern the same matrix."
  },
  map: {
    "title": "Linearity and translation",
    "topic": "Linear maps",
    "intro": "Use the definition of linearity to classify a family of maps.",
    "question": "If a map T satisfies T(0) = 0, must it be linear?",
    "choices": [
      "Yes",
      "No",
      "Yes, on every real vector space"
    ],
    "feedback": "This condition is necessary but not sufficient. For example, Q(x,y)=(x³,2y) maps zero to zero, but Q(2,0)=(8,0) differs from 2Q(1,0)=(2,0), so Q is not linear.",
    "experiment": "For T_c, compute the image of zero and compare T(u+v) with T(u)+T(v), where u = (1,1), v = (−1,2).",
    "controls": [
      "Translation parameter c"
    ],
    "observations": [
      "Find the value of c giving a linear map.",
      "Determine whether checking just two particular vectors proves linearity in general."
    ],
    "explanation": "If c ≠ 0, then T_c(0,0) = (0,2c) ≠ 0, so the map is not linear. If c = 0, then T_c(x,y) = [[2,−1],[0,3]](x,y), proving linearity for all vectors and scalars. In the example, T(u+v)=(−3,9+2c), whereas T(u)+T(v)=(−3,9+4c), with difference (0,−2c). The matrix representation proves the c=0 case; one numerical test alone would not.",
    "extension": "Is T₂ linear?",
    "extensionChoices": [
      "Yes, because the formula only uses addition",
      "No, because the image of zero is nonzero",
      "The formula does not determine this"
    ],
    "extensionFeedback": "T₂(0,0) = (0,4), violating a necessary condition for linearity.",
    "reflection": "State one claim disproved by a counterexample and one claim proved for all vectors."
  },
  similarity: {
    "title": "Representing a map in a different basis",
    "topic": "Representations and change of basis",
    "intro": "Follow a vector along two routes: apply the map in standard coordinates, or compute in the new basis and convert back.",
    "question": "If the columns of P are the new basis vectors, which formula gives the representation D in that basis?",
    "choices": [
      "D = PAP⁻¹",
      "D = P⁻¹AP",
      "D = PA"
    ],
    "feedback": "Start in the new coordinates, convert using P, apply A, and convert back using P⁻¹. Thus D = P⁻¹AP.",
    "experiment": "Vary s. The input vector is x = P(2,−1). Its image Ax also equals P D(2,−1).",
    "controls": [
      "Basis parameter s"
    ],
    "observations": [
      "Check that the two routes always agree.",
      "Identify quantities that remain fixed as the entries of A change."
    ],
    "explanation": "Here A = [[3,s],[0,4]]. The columns of P are eigenvectors of A with eigenvalues 3 and 4, so AP = PD. Multiplying on the left by P⁻¹ gives P⁻¹AP = D. For c=(2,−1), both routes give Ax=PDc=(6−4s,−4). The trace 7, determinant 12, and eigenvalues are invariant under similarity.",
    "extension": "Which quantity must be preserved when a matrix is replaced by a similar matrix?",
    "extensionChoices": [
      "Every matrix entry",
      "The determinant",
      "Every eigenvector as a list of standard coordinates"
    ],
    "extensionFeedback": "Similarity preserves the determinant. Matrix entries and coordinate lists can change.",
    "reflection": "Describe the three operations in P⁻¹AP in the order in which they act on a coordinate vector."
  },
  determinant: {
    "title": "Determinant and area",
    "topic": "Determinants",
    "intro": "Vary one column of a matrix and track the area and orientation of the resulting parallelogram.",
    "question": "If det(A) = −6, what is the area of the parallelogram generated by the columns of A?",
    "choices": [
      "−6",
      "6",
      "It cannot be determined"
    ],
    "feedback": "The geometric area is |det(A)| = 6. The sign records orientation; it does not mean negative area.",
    "experiment": "Use the controls to vary the components of v. Track both the sign and absolute value of the determinant.",
    "controls": [
      "First component of v",
      "Second component of v"
    ],
    "observations": [
      "Find a zero-area example with both vectors nonzero.",
      "Check how exchanging the two columns affects the determinant and area."
    ],
    "explanation": "The determinant is 4t−2s and the area is |4t−2s|. When s=2t, the columns are dependent and the parallelogram collapses to a line. For example, v=(3,0) gives determinant −6 and area 6. Exchanging the columns reverses the determinant's sign and leaves the area unchanged.",
    "extension": "What is the area when u = (4,2) and v = (−1,3)?",
    "extensionChoices": [
      "10",
      "14",
      "0"
    ],
    "extensionFeedback": "The determinant is 4·3−2·(−1) = 14, so the area is 14.",
    "reflection": "Write why a zero determinant is related to both linear dependence and noninvertibility."
  },
  eigen: {
    "title": "A repeated eigenvalue",
    "topic": "Diagonalization",
    "intro": "Keep the eigenvalues fixed and vary one matrix entry. Check the dimension of the eigenspace and whether diagonalization is possible.",
    "question": "Must a matrix be diagonalizable if its characteristic polynomial factors into linear factors?",
    "choices": [
      "Yes",
      "No",
      "Yes, if all its eigenvalues are real"
    ],
    "feedback": "No. A basis of eigenvectors is required. For s ≠ 0 in this family there is only one eigenvector direction.",
    "experiment": "Vary s and the argument of v. Compare the dashed unit circle with its image under A, and check whether v and Av are collinear.",
    "controls": [
      "Parameter s: the upper-right entry is 2s",
      "Angle of v in degrees"
    ],
    "observations": [
      "Compare s = 0 and s = 2. The characteristic polynomial stays the same.",
      "Find directions in which v and Av are collinear."
    ],
    "explanation": "The only eigenvalue is 3, with algebraic multiplicity 2. If s ≠ 0, solving (A−3I)v=0 forces 2sy=0 and thus y=0: the eigenspace has dimension 1 and A is not diagonalizable. If s=0, then A=3I and every basis is an eigenbasis. For v=(cosθ,sinθ), the determinant of v,Av is −2s sin²θ, so it vanishes exactly when the arrows are collinear.",
    "extension": "What is the dimension of the eigenspace for 3 when s = 2?",
    "extensionChoices": [
      "1",
      "2",
      "0"
    ],
    "extensionFeedback": "The equation is 4y=0, or y=0, so the eigenspace is span{(1,0)}.",
    "reflection": "What is missing from the argument ‘all the eigenvalues are known, so we may write A = PDP⁻¹’?"
  },
  projection: {
    "title": "Projection depends on the inner product",
    "topic": "Projection and orthogonality",
    "intro": "Keep the vector and line fixed while changing the inner product. Determine what orthogonality means for each choice.",
    "question": "Must the orthogonal projection of v onto W stay the same when the inner product changes?",
    "choices": [
      "Yes, because W is unchanged",
      "No",
      "Yes, for every real inner product"
    ],
    "feedback": "Projection depends on orthogonality, so the inner product is part of the data.",
    "experiment": "Vary the positive weight w. The green arrow is the projection; the orange segment is the residual v−p. The ellipse is the unit circle for the weighted inner product.",
    "controls": [
      "Positive weight w"
    ],
    "observations": [
      "Check that ⟨v−p,u⟩w = 0 for every choice.",
      "When w ≠ 1, must the residual look perpendicular to the line in Euclidean coordinates?"
    ],
    "explanation": "For u=(2,2), the projection coefficient is c=⟨v,u⟩w/⟨u,u⟩w=(8w+4)/(4w+4)=(2w+1)/(w+1), and p=c(2,2). The residual v−p=(4−2c,2−2c) satisfies ⟨v−p,u⟩w=0. Only w=1 gives the standard Euclidean inner product. The ordinary dot product of the residual with u is 4(1−w)/(w+1), so a right angle in an ordinary plot does not test orthogonality for another inner product.",
    "extension": "What is the projection when w = 2?",
    "extensionChoices": [
      "(3,3)",
      "(4,4)",
      "(10/3,10/3)"
    ],
    "extensionFeedback": "The coefficient is (2·2+1)/(2+1)=5/3. Multiplication by u=(2,2) gives p=(10/3,10/3).",
    "reflection": "Which two algebraic conditions verify that a vector is the required orthogonal projection?"
  },
  "gram-schmidt": {
    "title": "Gram–Schmidt and zero residuals",
    "topic": "Orthonormality",
    "intro": "Construct orthogonal directions from two input vectors and check when normalization is allowed.",
    "question": "What must be checked before setting e₂ = w₂/‖w₂‖ in Gram–Schmidt?",
    "choices": [
      "w₂ is nonzero",
      "Only that v₂ is nonzero",
      "Every component of w₂ is positive"
    ],
    "feedback": "Dependent inputs can give a zero residual. Division by its norm is then undefined.",
    "experiment": "Vary k and δ. The green arrow is the orthogonal residual w₂; the purple arrows are normalized vectors when defined.",
    "controls": [
      "Parameter k",
      "Parameter δ"
    ],
    "observations": [
      "Check why changing k does not change w₂.",
      "Pass through δ=0. What fails, and how do you proceed if you only need a basis of the input span?"
    ],
    "explanation": "The projection coefficient onto v₁ is (k+δ)/2, giving w₂ = (−δ,δ). If δ≠0, then e₁=(1,1)/√2 and e₂=sign(δ)(−1,1)/√2 form an orthonormal basis of ℝ². If δ=0, the span is a line and the zero residual is omitted. For S=[[4,2],[2,4]], these directions also happen to be eigenvector directions for 6 and 2, respectively, as direct multiplication verifies. Gram–Schmidt does not generally find eigenvectors.",
    "extension": "If δ = 0, how do you obtain an orthonormal basis of the span of the input vectors?",
    "extensionChoices": [
      "Divide by zero and continue",
      "Omit the zero residual and retain one normalized vector",
      "Declare the span to be {0}"
    ],
    "extensionFeedback": "The nonzero vector v₁ spans the same line as both inputs, so e₁ suffices.",
    "reflection": "Write why an orthonormal basis need not be an eigenbasis for a given matrix."
  },
};
export const linearActivitiesEn: Activity[] = linearActivities.map((a) => {
  const t = translations[a.id];
  if (!t || t.controls.length !== a.controls.length)
    throw new Error(`Missing translation: ${a.id}`);
  return {
    ...a,
    ...t,
    controls: a.controls.map((c, i) => ({
      ...c,
      label: t.controls[i],
      ...(c.options
        ? {
            options: c.options.map((o) => ({
              ...o,
              label:
                o.value === 0
                  ? "ℝ: real numbers"
                  : `F${o.value}: arithmetic modulo ${o.value}`,
            })),
          }
        : {}),
    })),
  };
});
