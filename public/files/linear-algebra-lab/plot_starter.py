"""Chen Gadi — starter plots, to inspect and modify with an LLM.
Install if necessary: python3 -m pip install matplotlib
Run: python3 plot_starter.py
Output: linear_algebra_plots.png in the current directory.
Axes have equal scale wherever geometry is being compared.
This is plotting code, not a proof of any general statement.
"""
import math
import matplotlib.pyplot as plt

fig, axs = plt.subplots(2, 2, figsize=(11, 10), layout='constrained')
ax = axs[0, 0]
zs = [1+1j, -1+1j, -1-1j, 1-1j]
ax.scatter([z.real for z in zs], [z.imag for z in zs], color='#1b6655')
for z in zs:
    ax.annotate(str(z), (z.real, z.imag), xytext=(6, 6), textcoords='offset points')
ax.set(title='All roots of w^4 = -4', xlabel='Re w', ylabel='Im w', xlim=(-2, 2), ylim=(-2, 2))
ax.set_aspect('equal', adjustable='box')
ax = axs[0, 1]
xs = [-1+i/40 for i in range(241)]
ax.plot(xs, [3-x for x in xs], label='x+y=3', linewidth=3, color='#1b6655')
for t in [-1, 0, 1]:
    ax.plot(xs, [(6-2*x)/(2+t) for x in xs], '--', label=f't={t}', alpha=.8)
ax.set(title='Parameter cases; t=0 coincides', xlabel='x', ylabel='y', xlim=(-1, 5), ylim=(-2, 5))
ax.set_aspect('equal', adjustable='box')
ax.legend()
ax = axs[1, 0]
ns = list(range(7))
ax.plot([n/2 for n in ns], [1]*7, 'o-', color='#3165a2')
for n in ns:
    ax.annotate(f'n={n}', (n/2, 1), xytext=(0, 8), textcoords='offset points')
ax.set(title='q_n = 2^(-n) J^n (0,1)', xlabel='first coordinate', ylabel='second coordinate', xlim=(-.4, 3.5), ylim=(0, 2.3))
ax.set_aspect('equal', adjustable='box')
ax = axs[1, 1]
theta = [i*2*math.pi/200 for i in range(201)]
ax.plot([math.cos(t)/math.sqrt(3) for t in theta], [math.sin(t) for t in theta], ':', label='3x²+y²=1', color='#839388')
ax.plot([-1, 4], [-1, 4], color='#3165a2', label='W=span{(1,1)}')
for (x, y), label, color in [((3, 1), 'v', '#7754a1'), ((2.5, 2.5), 'weighted p', '#1b6655'), ((2, 2), 'Euclidean p', '#b55c22')]:
    ax.scatter([x], [y], color=color)
    ax.annotate(label, (x, y), xytext=(6, 5), textcoords='offset points', color=color)
ax.plot([2.5, 3], [2.5, 1], '--', color='#1b6655', label='weighted residual')
ax.set(title='The inner product changes the projection', xlabel='x', ylabel='y', xlim=(-1, 4), ylim=(-1.5, 4))
ax.set_aspect('equal', adjustable='box')
ax.legend(fontsize=8)
for ax in axs.flat:
    ax.grid(alpha=.2)
    ax.axhline(0, color='#aab5a6', linewidth=.7)
    ax.axvline(0, color='#aab5a6', linewidth=.7)
fig.savefig('linear_algebra_plots.png', dpi=180)
print('Saved linear_algebra_plots.png. Inspect labels, limits, scale, and claims.')
