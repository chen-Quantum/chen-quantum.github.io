"""Chen Gadi — independent checks for the guided linear algebra activities.
Run: python3 verify_examples.py
Uses only the Python standard library. Read the statements and solve first.
Passing finite checks does not prove a general claim or grade a submission.
"""
from fractions import Fraction as F


def mm(A, B):
    return [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]


def mv(A, x):
    return [sum(a*b for a, b in zip(row, x)) for row in A]


def inner(x, y):
    """Course convention: linear in the FIRST argument."""
    return sum(a * complex(b).conjugate() for a, b in zip(x, y))


def checks():
    roots = [1+1j, -1+1j, -1-1j, 1-1j]
    assert len(set(roots)) == 4 and all(z**4 == -4 for z in roots)
    assert sum(roots) == 0
    A = [[1, 1], [1, -1]]
    solutions = [(x, y) for x in range(2) for y in range(2)
                 if all(z % 2 == 0 for z in mv(A, [x, y]))]
    assert solutions == [(0, 0), (1, 1)]
    for t in range(-3, 4):
        if t:
            x, y = F(3) + F(1, t), -F(1, t)
            assert x+y == 3 and 2*x+(2+t)*y == 5
    assert mv([[1, 2], [2, 4]], [1, 1]) == [3, 6]
    assert mv([[1, 2], [2, 4]], [3, 0]) == [3, 6]
    P, Pi = [[1, 0], [2, 1]], [[1, 0], [-2, 1]]
    assert mm(P, Pi) == [[1, 0], [0, 1]]
    A, P, Pi = [[2, 1], [0, 3]], [[1, 1], [0, 1]], [[1, -1], [0, 1]]
    assert mm(mm(Pi, A), P) == [[2, 0], [0, 3]]
    assert mm(mm(P, A), Pi) == [[2, 2], [0, 3]]
    assert mv(Pi, mv(A, mv(P, [1, 2]))) == [2, 6]
    J, power = [[2, 1], [0, 2]], [[1, 0], [0, 1]]
    for n in range(9):
        expected = [[2**n, 0 if n == 0 else n*2**(n-1)], [0, 2**n]]
        assert power == expected
        assert [F(x, 2**n) for x in mv(power, [0, 1])] == [F(n, 2), 1]
        power = mm(power, J)
    w, u, v = 3, [1, 1], [3, 1]
    c = F(w*v[0]*u[0] + v[1]*u[1], w*u[0]**2 + u[1]**2)
    p, r = [c, c], [v[0]-c, v[1]-c]
    assert p == [F(5, 2), F(5, 2)] and w*r[0]*u[0]+r[1]*u[1] == 0
    assert r[0]+r[1] == -1
    u, v = [1, 1j], [0, 2]
    c = inner(v, u)/inner(u, u)
    p = [c*x for x in u]
    r = [x-y for x, y in zip(v, p)]
    assert p == [-1j, 1] and r == [1j, 1] and inner(r, u) == 0
    assert inner(v, v) == inner(p, p) + inner(r, r) == 4
    wrong_c = inner(u, v)/inner(u, u)
    wrong_r = [x-wrong_c*y for x, y in zip(v, u)]
    assert inner(wrong_r, u) == -4j
    print('All eight reference examples passed. Explain WHY the checks work.')


if __name__ == '__main__':
    checks()
