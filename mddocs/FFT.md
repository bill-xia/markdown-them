# FFT

FFT可以在$O(n\log n)$的时间内在多项式的点值表示法和系数表示法之间相互转换，从而可以加速多项式乘法。

<!-- more -->

## 原理

多项式可以用系数来表示，也可以用点值表示法表示。

> 一个$n$次多项式可以由其$n+1$个不同点处的值来确定。

证明：设这些点为$x_0,x_1,...,x_n$，对应地设多项式在这些点处的值为$y_0,y_1,...,y_n$。由这些已知条件，尝试解出多项式的$i$次项系数$a_i(i=0,1,...,n)$，即解方程

$$
\left(\begin{matrix}
1 & x_0 & x_0^2 & ... & x_0^n \\
1 & x_1 & x_1^2 & ... & x_1^n \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
1 & x_n & x_n^2 & ... & x_n^n\\
\end{matrix}\right)

\left(\begin{matrix}
a_0 \\
a_1 \\
\vdots \\
a \\
\end{matrix}\right)
=
\left(\begin{matrix}
y_0 \\
y_1 \\
\vdots \\
y_n \\
\end{matrix}\right)
$$

由于左侧的系数矩阵为范德蒙德矩阵，其行列式为$\prod_{i<j}(x_j-x_i)$，又由$x_i\neq x_j(i\neq j)$，其行列式不为0，从而方程有唯一解。

之所以要转换，是因为在点值表达式下有些东西更好算，如多项式乘积。暴力转换需要算出左边的矩阵，并进行$(n\times n)$矩阵与$(n\times 1)$矩阵的乘积，是$O(n^2)$的。

$\omega_n=e^{i\theta}=\cos{k\theta}+i\sin{k\theta},\theta=\dfrac{2\pi}{n}$

$\omega_n$的$0,1,...,(n-1)$次幂称为单位根，是方程$x^n=1$在复数域的全部解。它们将单位圆$n$等分，并且其中有一个点$(\omega_n^0)$是1。

由于$2^k$次单位根的性质较好，先将$n$补全为$2^{\lceil \log n\rceil}$，再用多项式在$n$次单位根（及其幂次）处的值来表示$(n-1)$次多项式，以求快速的转换。

现在要求
$$
\begin{align*}
y_0&=a_0\omega_n^{0\cdot0}+a_1\omega_n^{0\cdot1}+a_2\omega_n^{0\cdot2}+...+a_{n-1}\omega_n^{0\cdot(n-1)}\\
y_1&=a_0\omega_n^{1\cdot0}+a_1\omega_n^{1\cdot1}+a_2\omega_n^{1\cdot2}+...+a_{n-1}\omega_n^{1\cdot(n-1)}\\
y_2&=a_0\omega_n^{2\cdot0}+a_1\omega_n^{2\cdot1}+a_2\omega_n^{2\cdot2}+...+a_{n-1}\omega_n^{2\cdot(n-1)}\\
&...\\
y_{n-1}&=a_0\omega_n^{(n-1)\cdot0}+a_1\omega_n^{(n-1)\cdot1}+a_2\omega_n^{(n-1)\cdot2}+...+a_{n-1}\omega_n^{(n-1)\cdot(n-1)}\\
\end{align*}
$$
分离奇数项和偶数项，以$y_1$为例：
$$
\begin{align*}
y_1&=(a_0+a_2\omega_n^2+a_4\omega_n^4+...+a_{n-2}\omega_n^{n-2})+(a_1\omega_n^1+a_3\omega_n^3+...+a_{n-1}\omega_n^{n-1})\\
&=(a_0+a_2\omega_n^2+a_4\omega_n^4+...+a_{n-2}\omega_n^{n-2})+\omega_n^1(a_1\omega_n^0+a_3\omega_n^2+...+a_{n-1}\omega_n^{n-2})\\
\end{align*}
$$
问题变成递归的了：求$a_0,a_2,...,a_{n-2}/a_1,a_3,...,a_{n-1}$为系数的多项式，在$n/2$次单位根处的点值表示。

此外，还有：
$$
\begin{align*}
y_{n/2+1}&=(a_0\omega_n^{(n/2+1)\cdot 0}+a_2\omega_n^{(n/2+1)\cdot2}+...+a_{n-2}\omega_n^{(n/2+1)\cdot(n-2)})\\&+\omega_n^{n/2+1}(a_1\omega_n^{(n/2+1)\cdot 0}+a_3\omega_n^{(n/2+1)\cdot2}+...+a_{n-1}\omega_n^{(n/2+1)\cdot(n-2)})\\
&=(a_0+a_2\omega_n^2+a_4\omega_n^4+...+a_{n-2}\omega_n^{n-2})-\omega_n^1(a_1+a_3\omega_n^2+...+a_{n-1}\omega_n^{n-1})\\
&=\overline{y_1}
\end{align*}
$$
同理，$y_{n/2+k}=\overline{y_k}$。从而，为了计算$n-1$次多项式在$n$个点处的值$y_0,y_1,...,y_{n-1}$，只需要计算2个$n/2-1$次多项式在$n/2$个点处的值。也就是$T(n)=2T(n/2)+n,T(1)=1$，解得$T(n)=n(\log n+1)$。

$\sum_{i=0}^{n}a_ix^i\sum_{i=0}^{m}b_ix^i=\sum_{i=0}^{n+m}(\sum_{j=0}^ia_jb_{i-j})x^i$

